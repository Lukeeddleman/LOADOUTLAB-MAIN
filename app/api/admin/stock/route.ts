import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { clearWaitlist, getStock, getWaitlist, setStock } from '@/lib/stock';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [stock, waitlist] = await Promise.all([getStock(), getWaitlist()]);
  return NextResponse.json({ stock, waitlist });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const count = Number(body.stock);

  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
    return NextResponse.json({ error: 'Enter a whole number, 0 or higher.' }, { status: 400 });
  }

  const saved = await setStock(count);
  if (saved === null) {
    return NextResponse.json(
      { error: 'Could not save. Check that Upstash is connected in Vercel.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ stock: saved });
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cleared = await clearWaitlist();
  return NextResponse.json({ ok: cleared });
}
