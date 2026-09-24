import type { Sale } from './sales';

/**
 * Inventory forecasting.
 *
 * The guiding rule here is: no false precision. This shop is young and its
 * volume is low, so one customer buying ten packs can double a weekly average.
 * Every projection therefore comes out as a pair — current pace and
 * trend-adjusted pace — alongside a confidence level that says out loud when
 * there isn't enough history to trust the numbers. A visible range that's
 * honest beats a single number that's confidently wrong.
 */

export const DEFAULT_TIME_ZONE = 'America/New_York';

/** Sales days behind the headline pace, once there's enough history. */
const HEADLINE_WINDOW = 30;

/** Growth is extrapolated, so it's capped: a good month is not a trajectory. */
const MAX_GROWTH_MULTIPLIER = 2.5;
const MIN_GROWTH_MULTIPLIER = 0.25;

export interface DailyPoint {
  day: string;
  packs: number;
  orders: number;
  revenueCents: number;
}

export interface WindowRate {
  /** Days actually averaged over — clamped to the history that exists. */
  days: number;
  packs: number;
  orders: number;
  perDay: number;
}

export interface Forecast {
  timeZone: string;
  generatedAt: string;
  totals: {
    packs: number;
    orders: number;
    revenueCents: number;
    firstSaleDay: string | null;
    historyDays: number;
    avgPacksPerOrder: number;
  };
  windows: { d7: WindowRate; d30: WindowRate; d90: WindowRate };
  trend: {
    windowDays: number;
    recentPerDay: number;
    priorPerDay: number;
    /** Fractional change, e.g. 0.25 for +25%. Null when history is too short. */
    changePct: number | null;
    direction: 'up' | 'down' | 'flat' | 'unknown';
  };
  stock: number | null;
  projection: {
    pacePerDay: number;
    growthPerDay: number;
    daysOfCoverPace: number | null;
    daysOfCoverGrowth: number | null;
    runOutPace: string | null;
    runOutGrowth: string | null;
  };
  plan: {
    leadTimeDays: number;
    safetyDays: number;
    reorderPoint: number;
    weeklyTarget: number;
    monthlyTarget: number;
    status: 'unknown' | 'ok' | 'order-soon' | 'order-now' | 'sold-out';
  };
  confidence: { level: 'low' | 'medium' | 'good'; reasons: string[] };
  daily: DailyPoint[];
}

/** A timezone we know Intl accepts, falling back rather than throwing. */
export function safeTimeZone(input: unknown): string {
  if (typeof input !== 'string' || !input) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: input });
    return input;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/**
 * YYYY-MM-DD for a moment, in the given timezone.
 *
 * Bucketing by UTC would push a 7pm order onto the next day, which quietly
 * shifts "today's sales" and every daily bar. en-CA formats as YYYY-MM-DD.
 */
export function dayKey(unixSeconds: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(unixSeconds * 1000));
}

/** Step a YYYY-MM-DD string by whole days, via UTC so DST can't shift it. */
function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const at = Date.UTC(y, m - 1, d) + delta * 86_400_000;
  return new Date(at).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

/**
 * A continuous run of days, zero-filled.
 *
 * Zero-filling is the whole point: averaging only over days that had an order
 * reports the pace of a *busy* day, not the pace of the business, and would
 * badly overstate how fast stock is moving.
 */
function buildDaily(sales: Sale[], timeZone: string, firstDay: string, today: string): DailyPoint[] {
  const byDay = new Map<string, DailyPoint>();
  for (const sale of sales) {
    const day = dayKey(sale.created, timeZone);
    const point = byDay.get(day) ?? { day, packs: 0, orders: 0, revenueCents: 0 };
    point.packs += sale.packs;
    point.orders += 1;
    point.revenueCents += sale.amountCents;
    byDay.set(day, point);
  }

  const out: DailyPoint[] = [];
  const span = daysBetween(firstDay, today);
  for (let i = 0; i <= span; i++) {
    const day = addDays(firstDay, i);
    out.push(byDay.get(day) ?? { day, packs: 0, orders: 0, revenueCents: 0 });
  }
  return out;
}

/** Average over the last `days` days, clamped to the history that exists. */
function windowRate(daily: DailyPoint[], days: number): WindowRate {
  const span = Math.min(days, daily.length);
  const slice = daily.slice(daily.length - span);
  const packs = slice.reduce((sum, p) => sum + p.packs, 0);
  const orders = slice.reduce((sum, p) => sum + p.orders, 0);
  return { days: span, packs, orders, perDay: span > 0 ? packs / span : 0 };
}

function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export interface ForecastInput {
  sales: Sale[];
  stock: number | null;
  leadTimeDays: number;
  safetyDays: number;
  timeZone: string;
  /** Overridable so tests don't depend on the clock. */
  now?: Date;
}

export function buildForecast({
  sales,
  stock,
  leadTimeDays,
  safetyDays,
  timeZone,
  now = new Date(),
}: ForecastInput): Forecast {
  const tz = safeTimeZone(timeZone);
  const today = dayKey(Math.floor(now.getTime() / 1000), tz);
  const firstSaleDay = sales.length ? dayKey(sales[0].created, tz) : null;

  // With no sales at all there is nothing to project from. Return a shaped
  // empty result rather than a pile of NaNs.
  const daily = firstSaleDay ? buildDaily(sales, tz, firstSaleDay, today) : [];
  const historyDays = daily.length;

  const totalPacks = sales.reduce((sum, s) => sum + s.packs, 0);
  const revenueCents = sales.reduce((sum, s) => sum + s.amountCents, 0);

  const windows = {
    d7: windowRate(daily, 7),
    d30: windowRate(daily, 30),
    d90: windowRate(daily, 90),
  };

  // Headline pace: 30 days once there's a month of history, otherwise whatever
  // exists. Short history is flagged in `confidence` rather than hidden.
  const pacePerDay =
    historyDays >= HEADLINE_WINDOW ? windows.d30.perDay : windowRate(daily, historyDays).perDay;

  // Trend compares two equal, adjacent windows. The window shrinks for a young
  // shop so a six-week-old store still gets a read, and is skipped under two
  // weeks, where it would be pure noise.
  const trendWindow = Math.min(30, Math.max(7, Math.floor(historyDays / 2)));
  let changePct: number | null = null;
  let recentPerDay = 0;
  let priorPerDay = 0;
  let direction: Forecast['trend']['direction'] = 'unknown';

  if (historyDays >= 14) {
    const recent = daily.slice(daily.length - trendWindow);
    const prior = daily.slice(
      Math.max(0, daily.length - trendWindow * 2),
      daily.length - trendWindow,
    );
    recentPerDay = recent.reduce((s, p) => s + p.packs, 0) / Math.max(1, recent.length);
    priorPerDay = prior.reduce((s, p) => s + p.packs, 0) / Math.max(1, prior.length);

    if (priorPerDay > 0) {
      changePct = (recentPerDay - priorPerDay) / priorPerDay;
      direction = Math.abs(changePct) < 0.1 ? 'flat' : changePct > 0 ? 'up' : 'down';
    } else if (recentPerDay > 0) {
      // Growth from nothing is real, but has no meaningful percentage.
      direction = 'up';
    }
  }

  // Trend-adjusted pace, deliberately capped. A doubling month is not licence
  // to project a doubling every month.
  const multiplier =
    changePct === null
      ? 1
      : Math.min(MAX_GROWTH_MULTIPLIER, Math.max(MIN_GROWTH_MULTIPLIER, 1 + changePct));
  const growthPerDay = pacePerDay * multiplier;

  const cover = (rate: number): number | null =>
    stock === null || rate <= 0 ? null : Math.floor(stock / rate);
  const runOut = (days: number | null): string | null => (days === null ? null : addDays(today, days));

  const daysOfCoverPace = cover(pacePerDay);
  const daysOfCoverGrowth = cover(growthPerDay);

  // Planning always uses the more cautious of the two rates. Being early with a
  // print run costs shelf space; being late costs sales.
  const planningRate = Math.max(pacePerDay, growthPerDay);
  const reorderPoint = Math.ceil(planningRate * (leadTimeDays + safetyDays));

  let status: Forecast['plan']['status'] = 'unknown';
  if (stock !== null) {
    if (stock === 0) status = 'sold-out';
    else if (planningRate <= 0) status = 'ok';
    else if (stock <= reorderPoint) status = 'order-now';
    else if (stock <= reorderPoint * 1.5) status = 'order-soon';
    else status = 'ok';
  }

  const reasons: string[] = [];
  if (historyDays < 14) {
    reasons.push(`Only ${historyDays} day${historyDays === 1 ? '' : 's'} of sales history.`);
  }
  if (sales.length < 10) {
    reasons.push(`Only ${sales.length} order${sales.length === 1 ? '' : 's'} to average.`);
  }
  if (historyDays >= 14 && historyDays < 45) {
    reasons.push('Under six weeks of history — treat the trend as early.');
  }
  if (windows.d7.orders === 0 && historyDays >= 7) {
    reasons.push('No orders in the last 7 days.');
  }

  const level: Forecast['confidence']['level'] =
    historyDays < 14 || sales.length < 10
      ? 'low'
      : historyDays < 45 || sales.length < 30
        ? 'medium'
        : 'good';

  return {
    timeZone: tz,
    generatedAt: now.toISOString(),
    totals: {
      packs: totalPacks,
      orders: sales.length,
      revenueCents,
      firstSaleDay,
      historyDays,
      avgPacksPerOrder: sales.length ? round(totalPacks / sales.length) : 0,
    },
    windows: {
      d7: { ...windows.d7, perDay: round(windows.d7.perDay) },
      d30: { ...windows.d30, perDay: round(windows.d30.perDay) },
      d90: { ...windows.d90, perDay: round(windows.d90.perDay) },
    },
    trend: {
      windowDays: trendWindow,
      recentPerDay: round(recentPerDay),
      priorPerDay: round(priorPerDay),
      changePct: changePct === null ? null : round(changePct, 3),
      direction,
    },
    stock,
    projection: {
      pacePerDay: round(pacePerDay),
      growthPerDay: round(growthPerDay),
      daysOfCoverPace,
      daysOfCoverGrowth,
      runOutPace: runOut(daysOfCoverPace),
      runOutGrowth: runOut(daysOfCoverGrowth),
    },
    plan: {
      leadTimeDays,
      safetyDays,
      reorderPoint,
      weeklyTarget: Math.ceil(planningRate * 7),
      monthlyTarget: Math.ceil(planningRate * 30),
      status,
    },
    confidence: { level, reasons },
    daily,
  };
}
