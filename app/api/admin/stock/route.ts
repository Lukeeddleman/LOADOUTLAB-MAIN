import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import {
  clearWaitlist,
  getStock,
  getWaitlist,
  setStock,
  stockConfigReport,
  StockUnavailableError,
} from '@/lib/stock';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [stock, waitlist] = await Promise.all([getStock(), getWaitlist()]);
  return NextResponse.json({ stock, waitlist, config: stockConfigReport() });
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

  try {
    const saved = await setStock(count);
    return NextResponse.json({ stock: saved });
  } catch (err) {
    // Say what actually went wrong — "not connected" was ambiguous between
    // missing variables and a failed call.
    const message =
      err instanceof StockUnavailableError ? err.message : 'Could not save the stock count.';
    console.error('[admin/stock]', err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cleared = await clearWaitlist();
  return NextResponse.json({ ok: cleared });
}
