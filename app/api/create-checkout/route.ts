import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PRODUCT_PRICE_CENTS = 1299; // $12.99

interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

interface Rate {
  id: string;
  service: string;
  amount: string;
}

export async function POST(req: NextRequest) {
  if (process.env.IN_STOCK === 'false') {
    return NextResponse.json({ error: 'Out of stock' }, { status: 409 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.json();
  const { address, rate, quantity = 1 }: { address: Address; rate: Rate; quantity: number } = body;

  if (!address || !rate) {
    return NextResponse.json({ error: 'Missing address or shipping rate' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kineticube.shop';
  const shippingCents = Math.round(parseFloat(rate.amount) * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'KinetiCube™ — Reactive Powder Targets (6-Pack)',
            description: '6 cubes · 10 vivid colors · randomly assorted · Made in the USA',
            images: [`${baseUrl}/product-front.png`],
          },
          unit_amount: PRODUCT_PRICE_CENTS,
        },
        quantity,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Shipping — USPS ${rate.service}`,
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
      ship_to_street1: address.street1,
      ship_to_street2: address.street2 || '',
      ship_to_city: address.city,
      ship_to_state: address.state,
      ship_to_zip: address.zip,
      shippo_rate_id: rate.id,
      quantity: String(quantity),
    },
  });

  return NextResponse.json({ url: session.url });
}
