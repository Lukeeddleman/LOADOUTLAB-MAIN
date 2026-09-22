import { Redis } from '@upstash/redis';
import { connection } from 'next/server';

const STOCK_KEY = 'kineticube:stock';
const WAITLIST_KEY = 'kineticube:waitlist';

export { LOW_STOCK_THRESHOLD } from './stock-config';

/** Thrown when we can't reach the counter, with a reason worth showing a human. */
export class StockUnavailableError extends Error {}

/**
 * Vercel injects Upstash credentials under different names depending on how the
 * database was connected — the Upstash marketplace integration uses
 * UPSTASH_REDIS_REST_*, while databases created through Vercel's own KV UI use
 * KV_REST_API_*. Accept either so the setup that exists just works.
 */
function credentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

/** Which of the expected variables are actually present — for diagnostics. */
export function stockConfigReport(): string {
  const names = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
  ];
  const found = names.filter(n => Boolean(process.env[n]));
  return found.length ? `Found: ${found.join(', ')}.` : 'None of the expected variables are set.';
}

function getRedis(): Redis {
  const creds = credentials();
  if (!creds) {
    throw new StockUnavailableError(
      `Upstash isn't configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN ` +
        `(or KV_REST_API_URL and KV_REST_API_TOKEN) in Vercel, then redeploy — environment ` +
        `variables only take effect on a new deployment. ${stockConfigReport()}`,
    );
  }
  return new Redis(creds);
}

/**
 * Packs on hand, or null when we genuinely don't know — Upstash isn't
 * configured, is unreachable, or has never been given a number.
 *
 * Callers must treat null as "unknown", NOT as zero. Losing the connection to
 * a stock counter is not a reason to stop selling.
 */
export async function getStock(): Promise<number | null> {
  // Reading stock must never be baked into a prerender, or the shop page would
  // serve whatever the count happened to be at build time. See connection():
  // it excludes this and anything rendering it from prerendering.
  await connection();

  try {
    const redis = getRedis();
    const value = await redis.get<number>(STOCK_KEY);
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Math.max(0, Math.trunc(value));
  } catch (err) {
    console.error('[stock] read failed:', err);
    return null;
  }
}

/**
 * Set the absolute count.
 *
 * Unlike the read path, this throws StockUnavailableError with a usable reason:
 * a human is waiting on the answer and needs to know what to fix.
 */
export async function setStock(count: number): Promise<number> {
  const redis = getRedis();
  const safe = Math.max(0, Math.trunc(count));
  try {
    await redis.set(STOCK_KEY, safe);
    return safe;
  } catch (err) {
    console.error('[stock] write failed:', err);
    throw new StockUnavailableError(
      `Reached Upstash but the write failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Atomically reduce stock by `by` and return what's left.
 *
 * DECRBY is atomic, so two orders landing at once can't both read the same
 * starting number and oversell. Clamps at zero so a miscount can't go negative.
 */
export async function decrementStock(by: number): Promise<number | null> {
  if (by <= 0) return null;

  try {
    const redis = getRedis();
    const remaining = await redis.decrby(STOCK_KEY, Math.trunc(by));
    if (remaining < 0) {
      await redis.set(STOCK_KEY, 0);
      return 0;
    }
    return remaining;
  } catch (err) {
    console.error('[stock] decrement failed:', err);
    return null;
  }
}

/** Record an email to notify when stock returns. Returns false if it couldn't be saved. */
export async function addToWaitlist(email: string): Promise<boolean> {
  try {
    const redis = getRedis();
    // A set, so the same person signing up twice is a no-op.
    await redis.sadd(WAITLIST_KEY, email.toLowerCase());
    return true;
  } catch (err) {
    console.error('[stock] waitlist add failed:', err);
    return false;
  }
}

export async function getWaitlist(): Promise<string[]> {
  try {
    const redis = getRedis();
    return (await redis.smembers(WAITLIST_KEY)) ?? [];
  } catch (err) {
    console.error('[stock] waitlist read failed:', err);
    return [];
  }
}

export async function clearWaitlist(): Promise<boolean> {
  try {
    const redis = getRedis();
    await redis.del(WAITLIST_KEY);
    return true;
  } catch (err) {
    console.error('[stock] waitlist clear failed:', err);
    return false;
  }
}
