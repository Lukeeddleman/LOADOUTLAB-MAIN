import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { normalizeQuantity } from '@/lib/parcel';
import { getStock } from '@/lib/stock';
import {
  fallbackShippingCents,
  fetchUspsRates,
  FLAT_FALLBACK_TOKEN,
  parseAddress,
  ShippoError,
  type NormalizedRate,
} from '@/lib/shippo';

const PRODUCT_PRICE_CENTS = 1299; // $12.99

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (process.env.IN_STOCK === 'false') {
    return NextResponse.json({ error: 'Out of stock' }, { status: 409 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.json();

  const address = parseAddress(body.address ?? {});
  if (!address) {
    return NextResponse.json({ error: 'Missing or incomplete shipping address' }, { status: 400 });
  }

  const quantity = normalizeQuantity(body.quantity ?? 1);
  if (quantity === null) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
  }

  // A null count means we can't reach the counter — keep selling rather than
  // blocking checkout over it. A real number is enforced.
  const stock = await getStock();
  if (stock !== null && stock < quantity) {
    return NextResponse.json(
      {
        error:
          stock === 0
            ? 'Just sold out — nothing left in this batch.'
            : `Only ${stock} pack${stock === 1 ? '' : 's'} left. Please lower the quantity.`,
        available: stock,
      },
      { status: 409 },
    );
  }

  const serviceToken = typeof body.serviceToken === 'string' ? body.serviceToken : '';
  if (!serviceToken) {
    return NextResponse.json({ error: 'Missing shipping selection' }, { status: 400 });
  }

  // ── Re-price shipping server-side ────────────────────────────────────────
  // The browser only tells us WHICH service level it picked. We re-create the
  // shipment here from the address and the server-sized parcel, so neither the
  // shipping amount nor the box can be tampered with in the request body, and
  // the rate we hand the webhook is freshly minted (no expiry window).
  //
  // If Shippo is unreachable we do NOT block the sale: we charge a server-side
  // fallback price, flag the order, and let the webhook (or a human) sort the
  // label out afterwards.
  let rate: NormalizedRate | undefined;
  let shippoReachable = true;

  if (serviceToken === FLAT_FALLBACK_TOKEN) {
    // The customer was quoted the flat rate because Shippo was already down at
    // the quoting step. Honour that price rather than re-quoting behind their
    // back — the webhook buys the real label once Shippo is back.
    shippoReachable = false;
  } else {
    try {
      const rates = await fetchUspsRates(address, quantity);
      rate = rates.find(r => r.token === serviceToken);

      // Shippo answered but no longer offers the chosen service. Don't silently
      // downgrade someone who picked Express — let them re-pick, which works
      // immediately since Shippo is clearly up.
      if (!rate) {
        return NextResponse.json(
          { error: 'That shipping option is no longer available. Please re-select shipping.' },
          { status: 409 },
        );
      }
    } catch (err) {
      if (!(err instanceof ShippoError)) throw err;
      console.error('[create-checkout] Shippo unreachable, falling back to flat shipping:', err);
      shippoReachable = false;
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kineticube.shop';

  const shippingCents = rate
    ? Math.round(parseFloat(rate.amount) * 100)
    : fallbackShippingCents(body.quotedShippingCents);

  const shippingLabel = rate ? `USPS ${rate.service}` : 'USPS — calculated at fulfillment';

  // Create a customer with the pre-collected address so Stripe Tax
  // can calculate correctly without re-asking the customer.
  const customer = await stripe.customers.create({
    name: address.name,
    // Prefills Stripe's own email field, so the customer enters it once on our
    // form and both Stripe and Shippo end up with it.
    ...(address.email ? { email: address.email } : {}),
    shipping: {
      name: address.name,
      address: {
        line1: address.street1,
        line2: address.street2 || undefined,
        city: address.city,
        state: address.state,
        postal_code: address.zip,
        country: 'US',
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    automatic_tax: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          tax_behavior: 'exclusive',
          product_data: {
            name: 'KinetiCube™ — Reactive Powder Targets (6-Pack)',
            description: '6 cubes · 6 vivid colors · randomly assorted · Made in the USA',
            // JPEG rather than the source .webp: Stripe's checkout renders this
            // as a product thumbnail and webp isn't reliable there.
            images: [`${baseUrl}/product-red.jpg`],
            tax_code: 'txcd_99999999', // General tangible personal property
          },
          unit_amount: PRODUCT_PRICE_CENTS,
        },
        quantity,
      },
      {
        price_data: {
          currency: 'usd',
          tax_behavior: 'exclusive',
          product_data: {
            name: `Shipping — ${shippingLabel}`,
            tax_code: 'txcd_92010001', // Shipping & handling
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
    metadata: {
      ship_to_name: address.name,
      ship_to_email: address.email ?? '',
      ship_to_street1: address.street1,
      ship_to_street2: address.street2 || '',
      ship_to_city: address.city,
      ship_to_state: address.state,
      ship_to_zip: address.zip,
      shippo_rate_id: rate?.id ?? '',
      // Kept so the webhook can re-quote the same service level if the rate
      // above is missing because Shippo was down at checkout.
      ship_service_token: serviceToken,
      shippo_degraded: shippoReachable ? '' : 'true',
      quantity: String(quantity),
    },
  });

  return NextResponse.json({ url: session.url });
}
