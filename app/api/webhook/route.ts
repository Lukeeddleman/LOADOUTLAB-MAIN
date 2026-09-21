import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

// Required: don't let Next.js parse the body — Stripe needs the raw bytes to verify signature
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Only care about completed checkouts
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};

  const {
    ship_to_name,
    ship_to_street1,
    ship_to_street2,
    ship_to_city,
    ship_to_state,
    ship_to_zip,
    shippo_rate_id,
    quantity,
  } = meta;

  let labelUrl: string | null = null;
  let trackingNumber: string | null = null;
  let trackingUrlProvider: string | null = null;
  let labelPrinted = false;
  const errors: string[] = [];

  // ── 1. Purchase Shippo label ─────────────────────────────────────────────
  try {
    const labelRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: shippo_rate_id,
        label_file_type: 'PDF_4x6',
        async: false,
      }),
    });

    const labelData = await labelRes.json();

    if (labelData.status === 'SUCCESS' && labelData.label_url) {
      labelUrl = labelData.label_url;
      trackingNumber = labelData.tracking_number;
      trackingUrlProvider = labelData.tracking_url_provider;
    } else {
      errors.push(`Shippo: ${JSON.stringify(labelData.messages ?? labelData)}`);
    }
  } catch (err) {
    errors.push(`Shippo fetch error: ${String(err)}`);
  }

  // ── 2. Send label to PrintNode ───────────────────────────────────────────
  if (labelUrl) {
    try {
      const pdfRes = await fetch(labelUrl);
      const pdfBuffer = await pdfRes.arrayBuffer();
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      const printRes = await fetch('https://api.printnode.com/printjobs', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.PRINTNODE_API_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: Number(process.env.PRINTNODE_PRINTER_ID),
          title: `KinetiCube — ${ship_to_name}`,
          contentType: 'pdf_base64',
          content: pdfBase64,
          source: 'kineticube.shop',
        }),
      });

      labelPrinted = printRes.ok;
      if (!printRes.ok) {
        errors.push(`PrintNode: ${await printRes.text()}`);
      }
    } catch (err) {
      errors.push(`PrintNode fetch error: ${String(err)}`);
    }
  }

  // ── 3. Email order summary to support (always — acts as backup + paper trail) ──
  try {
    const qty = Number(quantity ?? 1);
    await resend.emails.send({
      from: 'KinetiCube Orders <noreply@kineticube.shop>',
      to: 'support@kineticube.shop',
      subject: `New Order — ${ship_to_name} · ${qty} 6-pack${qty > 1 ? 's' : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;color:#222;">
          <h2 style="color:#f05a1a;margin-bottom:4px;">New Order 🎯</h2>
          <hr style="border-color:#eee;margin-bottom:16px;" />

          <p><strong>Customer:</strong> ${ship_to_name}</p>
          <p><strong>Ship to:</strong><br>
            ${ship_to_street1}${ship_to_street2 ? '<br>' + ship_to_street2 : ''}<br>
            ${ship_to_city}, ${ship_to_state} ${ship_to_zip}
          </p>
          <p><strong>Quantity:</strong> ${qty} 6-pack${qty > 1 ? 's' : ''} (${qty * 6} cubes)</p>

          ${trackingNumber ? `
          <p><strong>Tracking:</strong>
            ${trackingUrlProvider
              ? `<a href="${trackingUrlProvider}">${trackingNumber}</a>`
              : trackingNumber}
          </p>` : ''}

          <hr style="border-color:#eee;margin:16px 0;" />

          ${labelUrl ? `
          <p>
            <a href="${labelUrl}"
               style="background:#f05a1a;color:white;padding:10px 20px;text-decoration:none;font-weight:bold;display:inline-block;">
              📦 Download Shipping Label
            </a>
          </p>
          <p style="color:#999;font-size:12px;">
            Label ${labelPrinted ? 'was sent to your printer automatically ✅' : '⚠️ could not be sent to printer — print manually from the link above.'}
          </p>` : `
          <p style="color:#cc0000;"><strong>⚠️ Label could not be created automatically.</strong></p>
          `}

          ${errors.length ? `
          <hr style="border-color:#eee;margin:16px 0;" />
          <p style="color:#cc0000;font-size:12px;"><strong>Errors:</strong><br>${errors.join('<br>')}</p>
          ` : ''}
        </div>
      `,
    });
  } catch (err) {
    console.error('[webhook] Resend error:', err);
  }

  if (errors.length) {
    console.error('[webhook] completed with errors:', errors);
  }

  // Always return 200 — errors are handled above, no need for Stripe to retry
  return NextResponse.json({ received: true });
}
