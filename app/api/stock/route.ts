import { NextResponse } from 'next/server';
import { getStock } from '@/lib/stock';

/** Public: lets the checkout page cap its quantity picker to what's actually available. */
export async function GET() {
  const forcedClosed = process.env.IN_STOCK === 'false';
  const stock = forcedClosed ? 0 : await getStock();
  return NextResponse.json({ stock });
}
