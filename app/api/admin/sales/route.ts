import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { buildForecast, safeTimeZone } from '@/lib/forecast';
import { getPlanning, setPlanning } from '@/lib/planning';
import { fetchSales, SalesUnavailableError } from '@/lib/sales';
import { getStock } from '@/lib/stock';

// Paging through Stripe can take a few seconds on a long history; don't let the
// platform's default cut it off mid-read.
export const maxDuration = 60;

/**
 * How far back to read. 180 days covers the 90-day window plus the 90 before it
 * for comparison, and stays well inside one Stripe page for current volume.
 */
const DEFAULT_DAYS = 180;
const MAX_DAYS = 730;

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;

  // The browser tells us its timezone, so day boundaries match Luke's actual
  // days without anyone configuring anything.
  const timeZone = safeTimeZone(params.get('tz'));

  const requestedDays = Number(params.get('days'));
  const days =
    Number.isFinite(requestedDays) && requestedDays > 0
      ? Math.min(MAX_DAYS, Math.round(requestedDays))
      : DEFAULT_DAYS;

  try {
    // Stock and planning settings are cheap and independent of the Stripe read.
    const [history, stock, planning] = await Promise.all([
      fetchSales(days),
      getStock(),
      getPlanning(),
    ]);

    const forecast = buildForecast({
      sales: history.sales,
      stock,
      leadTimeDays: planning.leadTimeDays,
      safetyDays: planning.safetyDays,
      dailyCapacityPacks: planning.dailyCapacityPacks,
      timeZone,
    });

    return NextResponse.json({
      forecast,
      planning,
      lookbackDays: days,
      // Orders placed before checkout recorded a quantity were counted as one
      // pack. Reported rather than hidden, so a wrong total has an explanation.
      assumedQuantityOrders: history.assumedCount,
      truncated: history.truncated,
    });
  } catch (err) {
    const message =
      err instanceof SalesUnavailableError ? err.message : 'Could not build the sales forecast.';
    console.error('[admin/sales]', err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const planning = await setPlanning(body);
    return NextResponse.json({ planning });
  } catch (err) {
    console.error('[admin/sales] planning save failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not save planning settings.' },
      { status: 502 },
    );
  }
}
