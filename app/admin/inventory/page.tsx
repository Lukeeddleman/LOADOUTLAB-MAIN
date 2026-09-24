'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Forecast } from '@/lib/forecast';
import type { PlanningSettings } from '@/lib/planning';

/**
 * Inventory dashboard.
 *
 * Reads sales history from Stripe and turns it into the one decision Luke
 * actually makes: print more now, or not yet. Everything here is read-only —
 * nothing on this page can affect a live sale.
 */

// Validated against the #111111 card surface: the series hue passes every check
// in the palette validator, and each status step passes lightness, chroma and
// contrast. Status is never colour alone — every badge carries its own words.
const SERIES = '#f05a1a';
const STATUS: Record<Forecast['plan']['status'], { color: string; label: string; mark: string }> = {
  'sold-out': { color: '#f85149', label: 'SOLD OUT', mark: '■' },
  'order-now': { color: '#f85149', label: 'PRINT NOW', mark: '▲' },
  'order-soon': { color: '#bb8009', label: 'GETTING LOW', mark: '▲' },
  ok: { color: '#2ea043', label: 'HEALTHY', mark: '●' },
  unknown: { color: '#6b7280', label: 'STOCK UNKNOWN', mark: '?' },
};

const CHART_DAYS = 60;

const labelClass =
  'block text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-1';
const cardClass = 'bg-[#111111] border border-[#1a1a1a] p-5';
const inputClass =
  'w-full bg-[#0d0d0d] border border-[#2a2a2a] text-white px-3 py-2 text-sm focus:border-[#f05a1a] focus:outline-none transition-colors';

function money(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format a YYYY-MM-DD key without letting the local clock shift the date. */
function prettyDay(day: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  const [y, m, d] = day.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={cardClass}>
      <p className={labelClass}>{label}</p>
      <p className="font-[family-name:var(--font-display)] font-black text-4xl tracking-normal leading-none mt-1">
        {value}
      </p>
      {note && <p className="text-gray-600 text-xs mt-2 leading-snug">{note}</p>}
    </div>
  );
}

export default function InventoryPage() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [planning, setPlanning] = useState<PlanningSettings | null>(null);
  const [meta, setMeta] = useState<{ assumed: number; truncated: boolean }>({
    assumed: 0,
    truncated: false,
  });
  const [loading, setLoading] = useState(true);
  const [unauthed, setUnauthed] = useState(false);
  const [error, setError] = useState('');
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [leadDraft, setLeadDraft] = useState('');
  const [safetyDraft, setSafetyDraft] = useState('');
  const [capacityDraft, setCapacityDraft] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // Failures are collected into `message` and applied in `finally` rather than
  // handled in a catch clause: this is the same try/finally shape the stock
  // admin page uses, and the one react-hooks/set-state-in-effect accepts for a
  // fetch-on-mount.
  const load = useCallback(async () => {
    // The browser's own timezone, so "today" means Luke's today without any
    // configuration to get wrong.
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/api/admin/sales?tz=${encodeURIComponent(tz)}`;
    let message = '';

    try {
      const res = await fetch(url).catch(() => null);
      if (!res) {
        message = 'Could not reach the server. Check your connection and try again.';
        return;
      }
      if (res.status === 401) {
        setUnauthed(true);
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        message = data?.error || 'Could not load the forecast.';
        return;
      }

      setForecast(data.forecast);
      setPlanning(data.planning);
      setLeadDraft(String(data.planning.leadTimeDays));
      setSafetyDraft(String(data.planning.safetyDays));
      setCapacityDraft(
        data.planning.dailyCapacityPacks ? String(data.planning.dailyCapacityPacks) : '',
      );
      setMeta({ assumed: data.assumedQuantityOrders ?? 0, truncated: Boolean(data.truncated) });
    } finally {
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function savePlanning(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlan(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadTimeDays: Number(leadDraft),
          safetyDays: Number(safetyDraft),
          // Blank means "not known", which the forecast treats as no ceiling
          // rather than a ceiling of zero.
          dailyCapacityPacks: capacityDraft.trim() === '' ? 0 : Number(capacityDraft),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSavingPlan(false);
    }
  }

  if (unauthed) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">You need to sign in first.</p>
          <Link href="/admin" className="text-[#f05a1a] hover:underline text-sm font-[family-name:var(--font-display)] tracking-label">
            GO TO ADMIN →
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !forecast) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <p className="text-gray-600 text-sm font-[family-name:var(--font-display)] tracking-label">
          READING SALES HISTORY…
        </p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-red-400 text-sm mb-4">{error || 'No forecast available.'}</p>
          <button
            onClick={() => {
              setError('');
              setLoading(true);
              load();
            }}
            className="text-[#f05a1a] hover:underline text-sm font-[family-name:var(--font-display)] tracking-label"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  const { totals, windows, trend, projection, plan, capacity, confidence, daily } = forecast;
  const status = STATUS[plan.status];
  const chart = daily.slice(-CHART_DAYS);
  const peak = Math.max(1, ...chart.map(d => d.packs));
  const hovered = hover === null ? null : chart[hover];
  const noSales = totals.orders === 0;

  // Cover is a range, not a number: current pace on one end, trend-adjusted on
  // the other. Showing one figure would imply precision the data can't support.
  const coverLow =
    projection.daysOfCoverGrowth === null
      ? projection.daysOfCoverPace
      : Math.min(projection.daysOfCoverGrowth, projection.daysOfCoverPace ?? Infinity);
  const coverHigh =
    projection.daysOfCoverPace === null
      ? projection.daysOfCoverGrowth
      : Math.max(projection.daysOfCoverPace, projection.daysOfCoverGrowth ?? 0);

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-16">
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-normal">
              INVENTORY
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {noSales
                ? 'No sales yet — the forecast starts once orders come in.'
                : `${totals.orders} orders · ${totals.packs} packs · ${money(totals.revenueCents)} since ${totals.firstSaleDay ? prettyDay(totals.firstSaleDay, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}`}
            </p>
          </div>
          <Link
            href="/admin"
            className="text-gray-600 hover:text-white text-xs font-[family-name:var(--font-display)] tracking-label whitespace-nowrap"
          >
            ← STOCK
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && <p className="text-red-400 text-xs mb-6">{error}</p>}

        {/* The headline verdict. Colour is backed by words, never on its own. */}
        <div className="border-l-4 p-5 mb-8 bg-[#111111]" style={{ borderColor: status.color }}>
          <p
            className="font-[family-name:var(--font-display)] font-bold tracking-label text-sm"
            style={{ color: status.color }}
          >
            {status.mark} {status.label}
          </p>
          <p className="text-white text-lg mt-2 leading-snug">
            {plan.status === 'unknown'
              ? 'Set a stock count in the admin page and this will tell you when to print.'
              : plan.status === 'sold-out'
                ? 'You are sold out. Every visitor is seeing the restock signup instead of a buy button.'
                : plan.status === 'order-now'
                  ? `Start a print run. At your current pace you'd drop below a safe cushion before replacements are ready to ship.`
                  : plan.status === 'order-soon'
                    ? `You're above the trigger, but not by much. Line up your next print run.`
                    : `Stock is comfortable. Next print run isn't urgent.`}
          </p>
          {plan.status !== 'unknown' && !noSales && (
            <p className="text-gray-500 text-sm mt-2">
              You have {forecast.stock} packs. The trigger is {plan.reorderPoint} — that&apos;s a{' '}
              {plan.leadTimeDays}-day turnaround plus {plan.safetyDays} days of cushion, at{' '}
              {Math.max(projection.pacePerDay, projection.growthPerDay)} packs a day.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatTile
            label="PACKS ON HAND"
            value={forecast.stock === null ? '—' : String(forecast.stock)}
            note={forecast.stock === null ? 'No count set.' : `${forecast.stock * 6} cubes`}
          />
          <StatTile
            label="SELLING"
            value={`${projection.pacePerDay}/day`}
            note={`${windows.d30.packs} packs in the last ${windows.d30.days} days`}
          />
          <StatTile
            label="DAYS OF COVER"
            value={
              coverHigh === null
                ? '∞'
                : coverLow === coverHigh
                  ? String(coverHigh)
                  : `${coverLow}–${coverHigh}`
            }
            note={
              coverHigh === null
                ? forecast.stock === null
                  ? 'Needs a stock count.'
                  : 'No recent sales to project from.'
                : `Runs out ${projection.runOutGrowth ? prettyDay(projection.runOutGrowth) : '—'} to ${projection.runOutPace ? prettyDay(projection.runOutPace) : '—'}`
            }
          />
          <StatTile
            label="PRINT PER WEEK"
            value={String(plan.weeklyTarget)}
            note={`${plan.weeklyTarget * 6} cubes a week to keep up with demand`}
          />
        </div>

        {/* Daily packs sold — one series, so the title names it and no legend
            is needed. Hover gives the exact figures. */}
        <div className={`${cardClass} mb-8`}>
          <div className="flex items-baseline justify-between mb-1 gap-4">
            <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500">
              PACKS SOLD PER DAY — LAST {chart.length} DAYS
            </p>
            <button
              onClick={() => setShowTable(v => !v)}
              className="text-gray-600 hover:text-[#f05a1a] text-xs font-[family-name:var(--font-display)] tracking-label"
            >
              {showTable ? 'HIDE TABLE' : 'VIEW AS TABLE'}
            </button>
          </div>

          <div className="h-6 mb-1">
            {hovered ? (
              <p className="text-sm text-white">
                <span className="font-[family-name:var(--font-display)] font-bold">
                  {prettyDay(hovered.day, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-gray-500">
                  {' '}
                  · {hovered.packs} pack{hovered.packs === 1 ? '' : 's'} · {hovered.orders} order
                  {hovered.orders === 1 ? '' : 's'}
                  {hovered.revenueCents > 0 ? ` · ${money(hovered.revenueCents)}` : ''}
                </span>
              </p>
            ) : (
              <p className="text-gray-700 text-xs">Peak day: {peak} packs. Hover a bar for detail.</p>
            )}
          </div>

          <div
            className="flex items-end gap-[2px] h-40 border-b border-[#1f1f1f]"
            onMouseLeave={() => setHover(null)}
          >
            {chart.map((point, i) => (
              <div
                key={point.day}
                onMouseEnter={() => setHover(i)}
                className="flex-1 h-full flex items-end cursor-default"
                title={`${point.day}: ${point.packs} packs`}
              >
                <div
                  className="w-full transition-opacity"
                  style={{
                    // Zero days keep a visible stub so the gap reads as a real
                    // quiet day rather than missing data.
                    height: point.packs === 0 ? '2px' : `${Math.max(4, (point.packs / peak) * 100)}%`,
                    background: point.packs === 0 ? '#262626' : SERIES,
                    borderRadius: point.packs === 0 ? 0 : '4px 4px 0 0',
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-700">
            <span>{chart.length ? prettyDay(chart[0].day) : ''}</span>
            <span>{chart.length ? prettyDay(chart[chart.length - 1].day) : ''}</span>
          </div>

          {showTable && (
            <div className="mt-4 max-h-64 overflow-y-auto border-t border-[#1a1a1a] pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-label">
                    <th className="text-left font-normal pb-2">DAY</th>
                    <th className="text-right font-normal pb-2">PACKS</th>
                    <th className="text-right font-normal pb-2">ORDERS</th>
                    <th className="text-right font-normal pb-2">REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chart].reverse().map(point => (
                    <tr key={point.day} className="border-t border-[#161616]">
                      <td className="py-1.5 text-gray-400">{prettyDay(point.day)}</td>
                      <td className="py-1.5 text-right text-white">{point.packs}</td>
                      <td className="py-1.5 text-right text-gray-400">{point.orders}</td>
                      <td className="py-1.5 text-right text-gray-400">
                        {point.revenueCents ? money(point.revenueCents) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-8">
          <div className={cardClass}>
            <p className={labelClass}>SALES RATE</p>
            <table className="w-full text-sm mt-2">
              <tbody>
                {([
                  ['Last 7 days', windows.d7],
                  ['Last 30 days', windows.d30],
                  ['Last 90 days', windows.d90],
                ] as const).map(([name, w]) => (
                  <tr key={name} className="border-t border-[#1a1a1a] first:border-0">
                    <td className="py-2 text-gray-400">{name}</td>
                    <td className="py-2 text-right text-white">{w.packs} packs</td>
                    <td className="py-2 text-right text-gray-500 w-24">{w.perDay}/day</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-gray-600 text-xs mt-3 leading-snug">
              Averaged across every day including the quiet ones, so this is the pace of the
              business — not the pace of a busy day.
            </p>
          </div>

          <div className={cardClass}>
            <p className={labelClass}>TREND</p>
            {trend.direction === 'unknown' ? (
              <p className="text-gray-400 text-sm mt-2">
                Not enough history yet to compare one period against another.
              </p>
            ) : (
              <>
                <p className="font-[family-name:var(--font-display)] font-black text-4xl tracking-normal leading-none mt-1">
                  {trend.changePct === null
                    ? 'NEW'
                    : `${trend.changePct > 0 ? '+' : ''}${Math.round(trend.changePct * 100)}%`}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Last {trend.windowDays} days averaged {trend.recentPerDay} packs a day, against{' '}
                  {trend.priorPerDay} in the {trend.windowDays} before.
                </p>
              </>
            )}
            <p className="text-gray-600 text-xs mt-3 leading-snug">
              Growth is capped when projecting forward — one strong month is not proof of a
              trajectory, and planning on it is how you end up with a garage full of stock.
            </p>
          </div>
        </div>

        {/* Throughput is the real ceiling on this business: a sales rate above
            what the farm can print cannot be fixed by reordering earlier. */}
        <div className={`${cardClass} mb-8`}>
          <p className={labelClass}>CAN YOU KEEP UP?</p>
          {capacity.perDay === 0 ? (
            <p className="text-gray-400 text-sm mt-2 leading-snug">
              Tell me how many packs a day you can make when you&apos;re printing — the field below
              — and this will tell you whether your sales pace is something you can actually supply.
              It&apos;s the difference between needing to print sooner and needing to print faster.
            </p>
          ) : (
            (() => {
              const util = capacity.utilization ?? 0;
              const tone =
                util > 1 ? STATUS['order-now'] : util >= 0.75 ? STATUS['order-soon'] : STATUS.ok;
              return (
                <>
                  <p className="text-white text-lg mt-2 leading-snug">
                    {capacity.keepingUp
                      ? `Yes. You can make ${capacity.perDay} packs a day and demand needs about ${Math.max(projection.pacePerDay, projection.growthPerDay)} — ${capacity.headroomPerDay} a day spare.`
                      : `No. Demand needs about ${Math.max(projection.pacePerDay, projection.growthPerDay)} packs a day and you can make ${capacity.perDay}. That's a production problem, not a stocking one — printing earlier won't close a gap this size.`}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span
                        className="font-[family-name:var(--font-display)] tracking-label"
                        style={{ color: tone.color }}
                      >
                        {tone.mark} {Math.round(util * 100)}% OF YOUR OUTPUT SPOKEN FOR
                      </span>
                      <span className="text-gray-600">{capacity.perDay}/day capacity</span>
                    </div>
                    <div className="h-2 bg-[#0d0d0d] border border-[#1f1f1f] overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, util * 100)}%`,
                          background: tone.color,
                          borderRadius: '0 2px 2px 0',
                        }}
                      />
                    </div>
                  </div>

                  {capacity.daysToRebuild !== null && (
                    <p className="text-gray-600 text-xs mt-3 leading-snug">
                      Printing flat out, rebuilding from the {plan.reorderPoint}-pack trigger back
                      to a full cushion is about {capacity.daysToRebuild} day
                      {capacity.daysToRebuild === 1 ? '' : 's'} at the bench.
                    </p>
                  )}
                </>
              );
            })()
          )}
        </div>

        <form onSubmit={savePlanning} className={`${cardClass} mb-8`}>
          <p className={labelClass}>PLANNING ASSUMPTIONS</p>
          <p className="text-gray-500 text-sm mb-4 mt-1">
            These decide when the alert above fires. Adjust them as you learn your real pace.
          </p>
          <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className={labelClass} htmlFor="lead">
                TURNAROUND — DAYS
              </label>
              <input
                id="lead"
                type="number"
                min={0}
                max={120}
                step={1}
                className={inputClass}
                value={leadDraft}
                onChange={e => setLeadDraft(e.target.value)}
              />
              <p className="text-gray-700 text-xs mt-1 leading-snug">
                From deciding you need more, to boxed and ready. Not the time to make one pack.
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="safety">
                CUSHION — DAYS
              </label>
              <input
                id="safety"
                type="number"
                min={0}
                max={120}
                step={1}
                className={inputClass}
                value={safetyDraft}
                onChange={e => setSafetyDraft(e.target.value)}
              />
              <p className="text-gray-700 text-xs mt-1 leading-snug">
                Spare days of stock held back against a sudden rush.
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="capacity">
                PACKS YOU CAN MAKE / DAY
              </label>
              <input
                id="capacity"
                type="number"
                min={0}
                max={1000}
                step={0.5}
                placeholder="not set"
                className={inputClass}
                value={capacityDraft}
                onChange={e => setCapacityDraft(e.target.value)}
              />
              <p className="text-gray-700 text-xs mt-1 leading-snug">
                Full packs a day when you&apos;re actively printing. Leave blank if unsure.
              </p>
            </div>
            <button
              type="submit"
              disabled={savingPlan}
              className="bg-[#f05a1a] hover:bg-[#c44a12] disabled:bg-[#2a2a2a] disabled:text-gray-600 text-white font-[family-name:var(--font-display)] font-bold tracking-label px-6 py-2 transition-colors"
            >
              {savingPlan ? 'SAVING…' : 'SAVE'}
            </button>
          </div>
          {planning && (
            <p className="text-gray-600 text-xs mt-3">
              At today&apos;s pace that puts your trigger at {plan.reorderPoint} packs, and a target
              of {plan.monthlyTarget} packs a month.
            </p>
          )}
        </form>

        {/* Said plainly rather than buried: these numbers have limits. */}
        <div className="border-t border-[#1a1a1a] pt-6">
          <p className={labelClass}>HOW MUCH TO TRUST THIS</p>
          <p className="text-gray-400 text-sm mt-2">
            {confidence.level === 'good'
              ? 'Good — there is enough history here for the averages to mean something.'
              : confidence.level === 'medium'
                ? 'Moderate — usable, but expect the numbers to move around as more orders land.'
                : 'Low — too little history so far. Treat these as a rough steer, not a plan.'}
          </p>
          {confidence.reasons.length > 0 && (
            <ul className="text-gray-600 text-xs mt-2 space-y-1">
              {confidence.reasons.map(reason => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
          )}
          {meta.assumed > 0 && (
            <p className="text-gray-600 text-xs mt-2">
              · {meta.assumed} older order{meta.assumed === 1 ? '' : 's'} predate quantity tracking
              and {meta.assumed === 1 ? 'was' : 'were'} counted as one pack each.
            </p>
          )}
          {meta.truncated && (
            <p className="text-gray-600 text-xs mt-2">
              · History was cut off at the page limit — the oldest orders in range are missing.
            </p>
          )}
          <p className="text-gray-700 text-xs mt-4">
            Sales read live from Stripe · times shown in {forecast.timeZone.replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    </div>
  );
}
