import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Only care about successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const quantity = parseInt(session.metadata?.quantity ?? '1');

    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });

      const current = await redis.get<number>('kineticube:stock');
      if (current !== null) {
        const updated = Math.max(0, current - quantity);
        await redis.set('kineticube:stock', updated);
        console.log(`Order paid — stock: ${current} → ${updated} (qty: ${quantity})`);
      }
    } catch (err) {
      // Log but don't fail — Stripe will retry if we return non-2xx
      console.error('Failed to decrement stock:', err);
    }
  }

  return NextResponse.json({ received: true });
}
