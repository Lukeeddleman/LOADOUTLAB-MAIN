import { Redis } from '@upstash/redis';
import { connection } from 'next/server';

const STOCK_KEY = 'kineticube:stock';
const WAITLIST_KEY = 'kineticube:waitlist';

export { LOW_STOCK_THRESHOLD } from './stock-config';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
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

  const redis = getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get<number>(STOCK_KEY);
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Math.max(0, Math.trunc(value));
  } catch (err) {
    console.error('[stock] read failed:', err);
    return null;
  }
}

/** Set the absolute count. Returns the stored value, or null if it couldn't be saved. */
export async function setStock(count: number): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;

  const safe = Math.max(0, Math.trunc(count));
  try {
    await redis.set(STOCK_KEY, safe);
    return safe;
  } catch (err) {
    console.error('[stock] write failed:', err);
    return null;
  }
}

/**
 * Atomically reduce stock by `by` and return what's left.
 *
 * DECRBY is atomic, so two orders landing at once can't both read the same
 * starting number and oversell. Clamps at zero so a miscount can't go negative.
 */
export async function decrementStock(by: number): Promise<number | null> {
  const redis = getRedis();
  if (!redis || by <= 0) return null;

  try {
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
  const redis = getRedis();
  if (!redis) return false;

  try {
    // A set, so the same person signing up twice is a no-op.
    await redis.sadd(WAITLIST_KEY, email.toLowerCase());
    return true;
  } catch (err) {
    console.error('[stock] waitlist add failed:', err);
    return false;
  }
}

export async function getWaitlist(): Promise<string[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    return (await redis.smembers(WAITLIST_KEY)) ?? [];
  } catch (err) {
    console.error('[stock] waitlist read failed:', err);
    return [];
  }
}

export async function clearWaitlist(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    await redis.del(WAITLIST_KEY);
    return true;
  } catch (err) {
    console.error('[stock] waitlist clear failed:', err);
    return false;
  }
}
