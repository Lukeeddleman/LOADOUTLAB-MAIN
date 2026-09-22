import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html';
import { normalizeQuantity } from '@/lib/parcel';
import { fetchUspsRates, parseAddress } from '@/lib/shippo';

// Vercel enforces its own default timeout (10s Hobby / 15s Pro) unless we raise
// it here. That matters a lot: if this function is killed mid-flight, Stripe
// never receives our 200, retries the event, and we buy a SECOND label. The
// per-call timeouts below keep any one dependency from eating the budget.
//
// Route Handlers receive the raw request body by default — the Pages Router
// `bodyParser: false` config that used to live here was never honoured.
export const maxDuration = 60;

// Budget, worst case: re-quote 12s + label 18s + PDF 8s + print 10s = 48s,
// leaving headroom under maxDuration for the Stripe and Resend calls. The
// realistic path is well under 15s. Note that the duplicate guard is claimed
// before any of this runs, so even blowing the budget can't double-buy a label.
const RATE_TIMEOUT_MS = 12_000;
const SHIPPO_TIMEOUT_MS = 18_000;
const PDF_TIMEOUT_MS = 8_000;
const PRINTNODE_TIMEOUT_MS = 10_000;

export async function POST(req: NextRequest) {
  // Constructed per-request rather than at module scope: both SDKs throw on a
  // missing key, and at module scope that fails the Vercel build instead of the
  // request.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { timeout: 8_000 });
  const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Don't ship anything we haven't actually been paid for.
  if (session.payment_status !== 'paid') {
    console.warn(
      `[webhook] ${session.id} completed but payment_status=${session.payment_status} — skipping`,
    );
    return NextResponse.json({ received: true, skipped: 'unpaid' });
  }

  const errors: string[] = [];

  // ── 0. Duplicate-fulfillment guard ───────────────────────────────────────
  // Stripe delivers at least once and retries anything that doesn't return a
  // 2xx. Without this, a retry buys another label and prints another sheet.
  // The PaymentIntent is the store: one per order, updatable after the session
  // completes, and it needs no extra infrastructure.
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  let claimed = false;

  if (paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (pi.metadata?.kc_fulfillment) {
        console.log(
          `[webhook] ${session.id} already handled (kc_fulfillment=${pi.metadata.kc_fulfillment}) — skipping`,
        );
        return NextResponse.json({ received: true, skipped: 'already_fulfilled' });
      }
      // Claim BEFORE spending money, so a retry can never race us to Shippo.
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { kc_fulfillment: 'processing' },
      });
      claimed = true;
    } catch (err) {
      errors.push(`Duplicate-order guard unavailable (proceeding anyway): ${String(err)}`);
    }
  } else {
    errors.push('No payment_intent on session — duplicate-order guard unavailable.');
  }

  const meta = session.metadata ?? {};
  const {
    ship_to_name,
    ship_to_street1,
    ship_to_street2,
    ship_to_city,
    ship_to_state,
    ship_to_zip,
    shippo_rate_id,
    ship_service_token,
    shippo_degraded,
    quantity,
  } = meta;

  let labelUrl: string | null = null;
  let trackingNumber: string | null = null;
  let trackingUrlProvider: string | null = null;
  let labelQueued = false;
  let rateId = shippo_rate_id || '';

  // ── 1a. Recover a rate if checkout couldn't get one ──────────────────────
  // Checkout deliberately completes the sale even when Shippo is unreachable.
  // Shippo may well be back by now (the customer can sit on the Stripe page for
  // minutes), so try once more here before giving up and asking for a manual
  // label. The order is already paid for either way.
  if (!rateId) {
    const address = parseAddress({
      name: ship_to_name,
      street1: ship_to_street1,
      street2: ship_to_street2,
      city: ship_to_city,
      state: ship_to_state,
      zip: ship_to_zip,
    });
    const qty = normalizeQuantity(quantity ?? 1);

    if (!address || qty === null) {
      errors.push('No shipping rate on the order, and the address in metadata is unusable.');
    } else {
      try {
        const rates = await fetchUspsRates(address, qty, RATE_TIMEOUT_MS);
        const recovered = rates.find(r => r.token === ship_service_token) ?? rates[0];
        if (recovered) {
          rateId = recovered.id;
          errors.push(
            `Shipping was quoted at a flat rate because Shippo was down at checkout; ` +
              `re-quoted here as ${recovered.service} at $${recovered.amount} — verify this ` +
              `covers what the customer was charged.`,
          );
        } else {
          errors.push('Re-quote returned no USPS rates — buy this label manually.');
        }
      } catch (err) {
        errors.push(`Re-quote failed, buy this label manually: ${String(err)}`);
      }
    }
  }

  // ── 1b. Purchase Shippo label ────────────────────────────────────────────
  if (!rateId) {
    if (!shippo_degraded) {
      errors.push('Session metadata has no shippo_rate_id — no label could be purchased.');
    }
  } else {
    try {
      const labelRes = await fetch('https://api.goshippo.com/transactions/', {
        method: 'POST',
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: rateId,
          label_file_type: 'PDF_4x6',
          async: false,
        }),
        signal: AbortSignal.timeout(SHIPPO_TIMEOUT_MS),
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
  }

  // ── 2. Send label to PrintNode ───────────────────────────────────────────
  if (labelUrl) {
    try {
      const pdfRes = await fetch(labelUrl, { signal: AbortSignal.timeout(PDF_TIMEOUT_MS) });
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
        signal: AbortSignal.timeout(PRINTNODE_TIMEOUT_MS),
      });

      labelQueued = printRes.ok;
      if (!printRes.ok) {
        errors.push(`PrintNode: ${await printRes.text()}`);
      }
    } catch (err) {
      errors.push(`PrintNode fetch error: ${String(err)}`);
    }
  }

  // ── 3. Email order summary to support (always — backup + paper trail) ────
  try {
    const qty = Number(quantity ?? 1);
    const plural = qty > 1 ? 's' : '';
    await resend.emails.send({
      from: 'KinetiCube Orders <noreply@kineticube.shop>',
      to: 'support@kineticube.shop',
      subject: labelUrl
        ? `New Order — ${ship_to_name} · ${qty} 6-pack${plural}`
        : `⚠️ ACTION NEEDED — New Order (no label) — ${ship_to_name} · ${qty} 6-pack${plural}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;color:#222;">
          <h2 style="color:#f05a1a;margin-bottom:4px;">New Order 🎯</h2>
          <hr style="border-color:#eee;margin-bottom:16px;" />

          <p><strong>Customer:</strong> ${escapeHtml(ship_to_name)}</p>
          <p><strong>Ship to:</strong><br>
            ${escapeHtml(ship_to_street1)}${ship_to_street2 ? '<br>' + escapeHtml(ship_to_street2) : ''}<br>
            ${escapeHtml(ship_to_city)}, ${escapeHtml(ship_to_state)} ${escapeHtml(ship_to_zip)}
          </p>
          <p><strong>Quantity:</strong> ${qty} 6-pack${plural} (${qty * 6} cubes)</p>

          ${trackingNumber ? `
          <p><strong>Tracking:</strong>
            ${trackingUrlProvider
              ? `<a href="${escapeHtml(trackingUrlProvider)}">${escapeHtml(trackingNumber)}</a>`
              : escapeHtml(trackingNumber)}
          </p>` : ''}

          <hr style="border-color:#eee;margin:16px 0;" />

          ${labelUrl ? `
          <p>
            <a href="${escapeHtml(labelUrl)}"
               style="background:#f05a1a;color:white;padding:10px 20px;text-decoration:none;font-weight:bold;display:inline-block;">
              📦 Download Shipping Label
            </a>
          </p>
          <p style="color:#999;font-size:12px;">
            Label ${labelQueued
              ? 'was sent to the print queue ✅ — confirm the printer actually produced it.'
              : '⚠️ could not be sent to printer — print manually from the link above.'}
          </p>` : `
          <div style="border:2px solid #cc0000;background:#fff5f5;padding:14px;">
            <p style="color:#cc0000;margin:0 0 8px;"><strong>⚠️ THIS ORDER IS PAID BUT HAS NO LABEL.</strong></p>
            <p style="margin:0;color:#444;font-size:14px;">
              The customer has been charged and is expecting their order. Buy a label
              for the address above by hand, then mark it shipped.
            </p>
          </div>
          `}

          ${errors.length ? `
          <hr style="border-color:#eee;margin:16px 0;" />
          <p style="color:#cc0000;font-size:12px;"><strong>Errors:</strong><br>${errors.map(escapeHtml).join('<br>')}</p>
          ` : ''}
        </div>
      `,
    });
  } catch (err) {
    console.error('[webhook] Resend error:', err);
    errors.push(`Resend error: ${String(err)}`);
  }

  // ── 4. Record the outcome on the PaymentIntent ───────────────────────────
  if (claimed && paymentIntentId) {
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          kc_fulfillment: errors.length ? 'completed_with_errors' : 'done',
          kc_tracking: trackingNumber ?? '',
        },
      });
    } catch (err) {
      console.error('[webhook] could not record fulfillment outcome:', err);
    }
  }

  if (errors.length) {
    console.error(`[webhook] ${session.id} completed with errors:`, errors);
  }

  // Always return 200 — failures are surfaced in the order email above, and a
  // Stripe retry would re-run a pipeline that has already spent money.
  return NextResponse.json({ received: true });
}
