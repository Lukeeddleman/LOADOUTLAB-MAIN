import { Redis } from '@upstash/redis';
import { credentials } from './stock';

/**
 * The numbers that turn a sales rate into a print schedule.
 *
 * They live in Upstash rather than in code so Luke can tune them from /admin
 * without a redeploy. Once print jobs are tracked automatically, turnaround and
 * capacity can be measured from real print runs instead of estimated here.
 */

const PLANNING_KEY = 'kineticube:planning';

export interface PlanningSettings {
  /**
   * Turnaround: days from "I need more stock" to packs boxed and ready to
   * ship. This is the whole replenishment cycle, NOT the time to make one
   * 6-pack — several packs can come off the farm in a single day.
   */
  leadTimeDays: number;
  /** Extra days of cover held back as a cushion against a sales spike. */
  safetyDays: number;
  /**
   * Packs per day Luke can actually produce when printing. 0 means "not told
   * us", which suppresses the capacity read rather than guessing at it.
   *
   * This is the real ceiling on the business: a sales rate above it can't be
   * fixed by reordering earlier, only by printing faster.
   */
  dailyCapacityPacks: number;
}

/** Cautious placeholders until Luke sets his own. */
export const DEFAULT_PLANNING: PlanningSettings = {
  leadTimeDays: 7,
  safetyDays: 7,
  dailyCapacityPacks: 0,
};

const MAX_DAYS = 120;
const MAX_CAPACITY = 1000;

function clampDays(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_DAYS, Math.max(0, Math.round(n)));
}

function clampCapacity(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  // Half-pack precision, so "about two and a half a day" is expressible.
  return Math.min(MAX_CAPACITY, Math.max(0, Math.round(n * 2) / 2));
}

export function normalizePlanning(input: unknown): PlanningSettings {
  const raw = (input ?? {}) as Partial<Record<keyof PlanningSettings, unknown>>;
  return {
    leadTimeDays: clampDays(raw.leadTimeDays, DEFAULT_PLANNING.leadTimeDays),
    safetyDays: clampDays(raw.safetyDays, DEFAULT_PLANNING.safetyDays),
    dailyCapacityPacks: clampCapacity(
      raw.dailyCapacityPacks,
      DEFAULT_PLANNING.dailyCapacityPacks,
    ),
  };
}

function getRedis(): Redis | null {
  const creds = credentials();
  return creds ? new Redis(creds) : null;
}

/**
 * Never throws. These are planning preferences, not inventory — falling back to
 * the defaults gives a usable forecast, where an error would give none at all.
 */
export async function getPlanning(): Promise<PlanningSettings> {
  try {
    const redis = getRedis();
    if (!redis) return DEFAULT_PLANNING;
    const stored = await redis.get<PlanningSettings>(PLANNING_KEY);
    return normalizePlanning(stored);
  } catch (err) {
    console.error('[planning] read failed:', err);
    return DEFAULT_PLANNING;
  }
}

export async function setPlanning(input: unknown): Promise<PlanningSettings> {
  const settings = normalizePlanning(input);
  const redis = getRedis();
  if (!redis) {
    throw new Error(
      'Upstash is not configured, so planning settings cannot be saved. The forecast ' +
        'still works using the defaults.',
    );
  }
  await redis.set(PLANNING_KEY, settings);
  return settings;
}
