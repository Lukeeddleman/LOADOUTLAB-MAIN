import { NextRequest, NextResponse } from 'next/server';
import { normalizeQuantityFor, productOrDefault } from '@/lib/products';
import { fetchUspsRates, flatFallbackRate, parseAddress, ShippoError } from '@/lib/shippo';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body = await req.json();

  const address = parseAddress(body);
  if (!address) {
    return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
  }

  // Which product is being quoted decides the box and the weight.
  const product = productOrDefault(body.product);
  const quantity = normalizeQuantityFor(product, body.quantity ?? 1);
  if (quantity === null) {
    return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
  }

  try {
    const rates = await fetchUspsRates(address, quantity, product);
    // Shippo answered but had nothing for this address — offer the flat rate
    // rather than dead-ending the customer.
    if (rates.length === 0) {
      return NextResponse.json({ rates: [flatFallbackRate()], degraded: true });
    }
    return NextResponse.json({ rates, degraded: false });
  } catch (err) {
    if (!(err instanceof ShippoError)) throw err;
    // Never block the sale on Shippo being reachable. Quote a flat rate; the
    // label gets bought later by the webhook's re-quote, or by hand.
    console.error('[shipping-rates] Shippo unreachable, offering flat rate:', err);
    return NextResponse.json({ rates: [flatFallbackRate()], degraded: true });
  }
}
