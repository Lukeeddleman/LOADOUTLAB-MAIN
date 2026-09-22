import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { sendRestockEmails } from '@/lib/restock-email';
import {
  clearWaitlist,
  getStock,
  getWaitlist,
  setStock,
  stockConfigReport,
  StockUnavailableError,
} from '@/lib/stock';

// Emailing a large waitlist takes a moment; don't let the platform cut it off.
export const maxDuration = 60;

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
    // Read before writing: the restock email should only fire on a genuine
    // sold-out → back-in-stock transition, not every time the count is edited.
    const previous = await getStock();
    const saved = await setStock(count);

    const cameBackInStock = (previous === 0 || previous === null) && saved > 0;
    const wantsNotify = body.notify !== false;

    if (!cameBackInStock || !wantsNotify) {
      return NextResponse.json({ stock: saved });
    }

    const waiting = await getWaitlist();
    if (waiting.length === 0) {
      return NextResponse.json({ stock: saved });
    }

    const result = await sendRestockEmails(waiting);

    // Only drop the list once everyone actually got their email. Keeping it on
    // failure risks a duplicate if he retries, which beats losing the list.
    if (result.failed === 0) {
      await clearWaitlist();
    }

    return NextResponse.json({
      stock: saved,
      notified: result.sent,
      failed: result.failed,
      notifyError: result.error,
      waitlistCleared: result.failed === 0,
    });
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
