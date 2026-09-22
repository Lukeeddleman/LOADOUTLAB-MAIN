/**
 * Shared with client components, so this file must stay free of server-only
 * imports (no Redis client, no next/server).
 */

/** At or below this many packs on hand, the shop page starts pushing urgency. */
export const LOW_STOCK_THRESHOLD = 25;
