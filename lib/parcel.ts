// Parcel sizing — single source of truth for both /api/shipping-rates and
// /api/create-checkout. Keeping this in one place is what lets the server
// re-price shipping independently of whatever the browser claims.

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;

export interface Parcel {
  length: string;
  width: string;
  height: string;
  weight: string;
  distance_unit: string;
  mass_unit: string;
}

/**
 * Coerce an untrusted quantity into a whole number within the allowed range.
 * Returns null if it isn't usable — callers should reject the request.
 */
export function normalizeQuantity(input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < MIN_QUANTITY || n > MAX_QUANTITY) return null;
  return n;
}

// ── Parcel dimensions by quantity ──────────────────────────────────────────
// 1 pack  → 6×9×1.5in bubble mailer
// 2 packs → 7.25×11×1.5in bubble mailer
// 3-10    → ⚠️  PLACEHOLDER — update when packaging is confirmed.
//           Under-declared weight gets billed back as a USPS postage
//           adjustment after the fact, so keep the estimate generous.
export function getParcel(quantity: number): Parcel {
  if (quantity === 1) {
    return { length: '9', width: '6', height: '1.5', weight: '6', distance_unit: 'in', mass_unit: 'oz' };
  }
  if (quantity === 2) {
    return { length: '11', width: '7.25', height: '1.5', weight: '11', distance_unit: 'in', mass_unit: 'oz' };
  }
  // TODO: finalize box dimensions for 3+ packs — these are rough estimates
  const weight = Math.ceil(quantity * 5.5 + 3); // ~5.5oz per pack + 3oz box
  return { length: '12', width: '10', height: '4', weight: String(weight), distance_unit: 'in', mass_unit: 'oz' };
}
