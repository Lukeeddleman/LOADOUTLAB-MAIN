import { NextRequest, NextResponse } from 'next/server';
import { productOrDefault } from '@/lib/products';
import { addToWaitlist } from '@/lib/stock';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const saved = await addToWaitlist(email, productOrDefault(body.product));
  if (!saved) {
    return NextResponse.json(
      { error: 'Could not save that right now. Please try again later.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
