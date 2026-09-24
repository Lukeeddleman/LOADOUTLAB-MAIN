import { NextRequest, NextResponse } from 'next/server';
import { productOrDefault } from '@/lib/products';
import { getStock } from '@/lib/stock';

/** Public: lets the checkout page cap its quantity picker to what's actually available. */
export async function GET(req: NextRequest) {
  const product = productOrDefault(req.nextUrl.searchParams.get('product'));
  const forcedClosed = process.env.IN_STOCK === 'false';
  const stock = forcedClosed ? 0 : await getStock(product);
  return NextResponse.json({ stock, product: product.slug });
}
