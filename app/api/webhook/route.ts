import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html';
import { ordersFrom, supportTo } from '@/lib/email-config';
import { normalizeQuantityFor, productOrDefault } from '@/lib/products';
import { fetchUspsRates, parseAddress } from '@/lib/shippo';
import { decrementStock, LOW_STOCK_THRESHOLD } from '@/lib/stock';

// Vercel enforces its own default timeout (10s Hobby / 15s Pro) unless we raise
// it here. That matters a lot: if this function is killed mid-flight, Stripe
// never receives our 200, retries the event, and we buy a SECOND label. The
// per-call timeouts below keep any one dependency from eating the budget.
//
// Route Handlers receive the raw request body by default — the Pages Router
// `bodyParser: false` config that used to live here was never honoured.
export const maxDuration = 60;

// Budget: a failed label purchase retries once with a fresh quote, so the worst
// case is label 15s + re-quote 10s + label 15s + PDF 8s + print 10s = 58s. That
// only happens when calls hang rather than fail; the realistic path is under
// 15s. The duplicate guard is claimed before any of this runs, so even blowing
// the budget can't double-buy a label.
/** How long a 'processing' claim blocks retries before we assume that run died. */
const STALE_CLAIM_MS = 10 * 60 * 1000;

const RATE_TIMEOUT_MS = 10_000;
const SHIPPO_TIMEOUT_MS = 15_000;
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
      const state = pi.metadata?.kc_fulfillment ?? '';
      const claimedAt = Number(pi.metadata?.kc_claimed_at ?? 0);
      const claimIsFresh = Number.isFinite(claimedAt) && Date.now() - claimedAt < STALE_CLAIM_MS;

      // Only an order we actually bought a label for is closed for good. An
      // attempt that failed, or one that died mid-flight, has to stay
      // retryable — otherwise one bad run strands a paid order with no label
      // and no way to ever try again.
      if (state === 'done' || (state === 'processing' && claimIsFresh)) {
        console.log(`[webhook] ${session.id} already handled (${state}) — skipping`);
        return NextResponse.json({ received: true, skipped: 'already_fulfilled', state });
      }
      // Claim BEFORE spending money, so a retry can never race us to Shippo.
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { kc_fulfillment: 'processing', kc_claimed_at: String(Date.now()) },
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
    ship_to_email,
    ship_to_street1,
    ship_to_street2,
    ship_to_city,
    ship_to_state,
    ship_to_zip,
    shippo_rate_id,
    ship_service_token,
    quantity,
  } = meta;

  // Orders placed before products had names carry no slug, and all of those
  // were Kineticube — so an unknown slug falls back rather than failing a
  // paid order we already have the money for.
  const product = productOrDefault(meta.product);

  let labelUrl: string | null = null;
  let trackingNumber: string | null = null;
  let trackingUrlProvider: string | null = null;
  let labelQueued = false;
  let rateId = shippo_rate_id || '';

  // ── Count the sale against stock ─────────────────────────────────────────
  // Runs before the label work so it happens even if Shippo or the printer
  // fails — the packs are sold either way. The duplicate guard above is what
  // keeps a redelivered event from decrementing twice.
  const soldQty = normalizeQuantityFor(product, quantity ?? 1) ?? 1;
  const remainingStock = await decrementStock(soldQty, product);

  /** Buy a label for `rate`. Returns true on success. */
  async function purchaseLabel(rate: string): Promise<boolean> {
    try {
      const labelRes = await fetch('https://api.goshippo.com/transactions/', {
        method: 'POST',
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate,
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
        return true;
      }
      errors.push(`Shippo: ${JSON.stringify(labelData.messages ?? labelData)}`);
    } catch (err) {
      errors.push(`Shippo fetch error: ${String(err)}`);
    }
    return false;
  }

  /** Quote this order fresh, e.g. because the stored rate is stale or invalid. */
  async function requote(): Promise<string> {
    const address = parseAddress({
      name: ship_to_name,
      // Fall back to the email Stripe collected, for orders placed before our
      // own form asked for one.
      email: ship_to_email || session.customer_details?.email || '',
      street1: ship_to_street1,
      street2: ship_to_street2,
      city: ship_to_city,
      state: ship_to_state,
      zip: ship_to_zip,
    });
    const qty = normalizeQuantityFor(product, quantity ?? 1);

    if (!address || qty === null) {
      errors.push('Cannot re-quote: the address stored on the order is unusable.');
      return '';
    }
    try {
      const rates = await fetchUspsRates(address, qty, product, RATE_TIMEOUT_MS);
      const recovered = rates.find(r => r.token === ship_service_token) ?? rates[0];
      if (!recovered) {
        errors.push('Re-quote returned no USPS rates — buy this label manually.');
        return '';
      }
      errors.push(
        `Re-quoted as ${recovered.service} at $${recovered.amount} — check this covers ` +
          `what the customer was charged.`,
      );
      return recovered.id;
    } catch (err) {
      errors.push(`Re-quote failed, buy this label manually: ${String(err)}`);
      return '';
    }
  }

  // ── 1. Get a label ───────────────────────────────────────────────────────
  // Checkout deliberately completes the sale even when Shippo is unreachable,
  // so there may be no rate here at all. And a rate stored at checkout can go
  // bad afterwards — it expires, or it belongs to a shipment USPS later
  // rejects. Either way the order is already paid for, so fall back to a fresh
  // quote rather than stranding it.
  if (rateId) {
    const bought = await purchaseLabel(rateId);
    if (!bought) {
      errors.push('Stored rate failed — retrying with a fresh quote.');
      rateId = '';
    }
  }

  if (!labelUrl) {
    rateId = await requote();
    if (rateId) await purchaseLabel(rateId);
  }

  // USPS accepts a rate request without sender contact details, then refuses to
  // issue the label for it. Name the missing setting rather than leaving USPS's
  // raw complaint as the only clue.
  if (!labelUrl && !process.env.SHIP_FROM_PHONE) {
    errors.push(
      'SHIP_FROM_PHONE is not set. USPS requires a sender phone number to issue a ' +
        'label — add it in Vercel → Settings → Environment Variables, then redeploy.',
    );
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
          title: `Kineticube — ${ship_to_name}`,
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
  let emailSent = false;
  try {
    const qty = Number(quantity ?? 1);
    const plural = qty > 1 ? 's' : '';
    const sendResult = await resend.emails.send({
      from: ordersFrom(),
      to: supportTo(),
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

          ${remainingStock !== null ? `
          <p style="${remainingStock === 0
            ? 'color:#cc0000;font-weight:bold;'
            : remainingStock <= LOW_STOCK_THRESHOLD
              ? 'color:#f05a1a;font-weight:bold;'
              : 'color:#444;'}">
            Stock remaining: ${remainingStock} pack${remainingStock === 1 ? '' : 's'}${
              remainingStock === 0
                ? ' — YOU ARE SOLD OUT. The shop is now showing a restock signup.'
                : remainingStock <= LOW_STOCK_THRESHOLD
                  ? ' — running low, time to print more.'
                  : ''
            }
          </p>` : ''}

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

    // Resend reports API failures (unverified domain, bad key, rejected
    // sender) in `error` rather than throwing, so a try/catch alone silently
    // swallows them and the email just never arrives.
    if (sendResult.error) {
      console.error('[webhook] Resend refused the email:', sendResult.error);
      errors.push(
        `Email not sent — Resend said: ${sendResult.error.message ?? JSON.stringify(sendResult.error)}`,
      );
    } else {
      emailSent = true;
    }
  } catch (err) {
    console.error('[webhook] Resend error:', err);
    errors.push(`Resend error: ${String(err)}`);
  }

  // ── 4. Record the outcome on the PaymentIntent ───────────────────────────
  if (claimed && paymentIntentId) {
    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          // Only a bought label closes the order permanently. Anything else
          // stays open so the event can be resent once the cause is fixed.
          kc_fulfillment: labelUrl ? 'done' : 'failed',
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

  // Always return 200 — failures are surfaced below and in the order email, and
  // a Stripe retry would re-run a pipeline that has already spent money.
  //
  // The diagnostics go in the response body deliberately: Stripe shows it on
  // the event in its dashboard, which is readable without a paid Vercel plan.
  return NextResponse.json({
    received: true,
    label: labelUrl ? 'bought' : 'FAILED',
    printer: labelQueued ? 'queued' : 'not queued',
    email: emailSent ? 'sent' : 'FAILED',
    tracking: trackingNumber,
    errors: errors.map(e => e.slice(0, 300)),
  });
}
