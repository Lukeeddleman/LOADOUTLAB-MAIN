import Stripe from 'stripe';

/** One paid order, reduced to the only things forecasting needs. */
export interface Sale {
  /** Unix seconds, straight from Stripe. */
  created: number;
  /** 6-packs on this order. */
  packs: number;
  /** Total the customer paid, including shipping, in cents. */
  amountCents: number;
  /** True when the order predates quantity metadata and we assumed 1 pack. */
  assumed: boolean;
}

export interface SalesHistory {
  sales: Sale[];
  /** Unix seconds of the oldest moment we asked Stripe about. */
  since: number;
  /** Orders we had to assume a quantity for. Surfaced so the UI can be honest. */
  assumedCount: number;
  /** True when we stopped paginating early — there may be older orders in range. */
  truncated: boolean;
}

/** Thrown when Stripe can't be reached or isn't configured. */
export class SalesUnavailableError extends Error {}

/**
 * 100 orders per page, so this is a 5,000-order ceiling. Far beyond current
 * volume, but it stops a runaway loop from burning the function's whole time
 * budget if a filter ever goes wrong.
 */
const PAGE_CAP = 50;
const PAGE_SIZE = 100;

/**
 * Every paid order in the last `days` days.
 *
 * Stripe is the source of truth deliberately: it already holds every sale since
 * day one, it keeps them indefinitely, and it can't drift out of sync with what
 * was actually charged. Nothing here writes, so this can never affect a sale.
 */
export async function fetchSales(days: number): Promise<SalesHistory> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new SalesUnavailableError(
      'STRIPE_SECRET_KEY is not set, so there is no sales history to read. Add it in ' +
        'Vercel → Settings → Environment Variables, then redeploy.',
    );
  }

  // Constructed here rather than at module scope: the SDK throws on a missing
  // key, which at module scope would fail the build instead of this request.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 15_000 });

  const since = Math.floor(Date.now() / 1000) - days * 86_400;
  const sales: Sale[] = [];
  let assumedCount = 0;
  let startingAfter: string | undefined;
  let truncated = false;

  try {
    for (let page = 0; page < PAGE_CAP; page++) {
      const batch = await stripe.checkout.sessions.list({
        created: { gte: since },
        limit: PAGE_SIZE,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const session of batch.data) {
        // Abandoned and expired checkouts are listed too. Only money that
        // actually arrived counts as a sale.
        if (session.payment_status !== 'paid') continue;

        const raw = session.metadata?.quantity;
        const parsed = Number(raw);
        const known = Number.isInteger(parsed) && parsed > 0;
        if (!known) assumedCount++;

        sales.push({
          created: session.created,
          packs: known ? parsed : 1,
          amountCents: session.amount_total ?? 0,
          assumed: !known,
        });
      }

      if (!batch.has_more) break;

      startingAfter = batch.data[batch.data.length - 1]?.id;
      if (!startingAfter) break;

      if (page === PAGE_CAP - 1) truncated = true;
    }
  } catch (err) {
    console.error('[sales] Stripe read failed:', err);
    throw new SalesUnavailableError(
      `Could not read sales history from Stripe: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Oldest first, so everything downstream can assume chronological order.
  sales.sort((a, b) => a.created - b.created);

  return { sales, since, assumedCount, truncated };
}
