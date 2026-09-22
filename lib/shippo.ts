import { getParcel } from './parcel';

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface NormalizedRate {
  id: string;
  provider: string;
  service: string;
  /** Stable servicelevel token (e.g. "usps_ground_advantage") — what the client sends back. */
  token: string;
  amount: string;
  currency: string;
  estimated_days: number | null;
}

export class ShippoError extends Error {}

// ── Degraded-mode shipping pricing ─────────────────────────────────────────
// If Shippo is unreachable we still take the order — a sale we can't auto-label
// is better than a lost sale, and the label can be bought by hand afterwards.
//
// A flat $7 regardless of quantity. Orders are overwhelmingly 1-2 packs, where
// $7 covers the real postage, and this only applies during a Shippo outage, so
// the occasional under-recovery on a large order is an accepted trade for not
// losing the sale.
const FLAT_FALLBACK_CENTS = 700;
/** Nothing we charge for shipping should ever exceed this. */
const SHIPPING_CEILING_CENTS = 5000;

/**
 * Shipping price to charge when we could not reach Shippo to get a real quote.
 *
 * `quotedCents` is what the browser says it displayed at the quoting step. We
 * never let it go BELOW our floor (so it can't be tampered downward), but we do
 * honour a higher honest quote so the customer isn't charged a different price
 * than the one they were shown a moment earlier.
 */
/**
 * Service token for the flat-rate option we offer when Shippo can't be reached
 * at quoting time. Selecting it tells the server "price this from the fallback
 * table" — which is never cheaper than the floor, so it isn't worth gaming.
 */
export const FLAT_FALLBACK_TOKEN = 'kc_flat_fallback';

/** The single shipping option shown to the customer when Shippo is unreachable. */
export function flatFallbackRate(): NormalizedRate {
  return {
    id: 'flat-fallback',
    provider: 'USPS',
    service: 'Standard Shipping',
    token: FLAT_FALLBACK_TOKEN,
    amount: (FLAT_FALLBACK_CENTS / 100).toFixed(2),
    currency: 'USD',
    estimated_days: null,
  };
}

export function fallbackShippingCents(quotedCents?: unknown): number {
  const quoted = typeof quotedCents === 'number' ? quotedCents : Number(quotedCents);
  if (!Number.isFinite(quoted) || !Number.isInteger(quoted) || quoted <= FLAT_FALLBACK_CENTS) {
    return FLAT_FALLBACK_CENTS;
  }
  return Math.min(quoted, SHIPPING_CEILING_CENTS);
}

/** Pull a shipping address out of an untrusted request body. Returns null if incomplete. */
export function parseAddress(body: Record<string, unknown>): ShippingAddress | null {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const address = {
    name: str(body.name),
    street1: str(body.street1),
    street2: str(body.street2),
    city: str(body.city),
    state: str(body.state),
    zip: str(body.zip),
  };
  if (!address.name || !address.street1 || !address.city || !address.state || !address.zip) {
    return null;
  }
  return address;
}

interface ShippoRate {
  object_id: string;
  provider: string;
  servicelevel?: { name?: string; token?: string };
  amount?: string;
  currency?: string;
  estimated_days?: number;
}

/**
 * Create a Shippo shipment for `address` at `quantity` and return the USPS
 * rates, cheapest first.
 *
 * Both the quoting endpoint and the checkout endpoint call this, so the rate
 * eventually used to buy the label is always derived from a parcel the server
 * sized itself — the browser never gets to state a price or a box.
 */
export async function fetchUspsRates(
  address: ShippingAddress,
  quantity: number,
  timeoutMs = 15000,
): Promise<NormalizedRate[]> {
  const payload = {
    address_from: {
      name: 'KinetiCube',
      street1: process.env.SHIP_FROM_STREET1,
      city: 'Kyle',
      state: 'TX',
      zip: process.env.SHIP_FROM_ZIP,
      country: 'US',
      // USPS returns rates happily without these, then refuses the actual
      // label purchase with "address_from.email must not be empty".
      email: process.env.SHIP_FROM_EMAIL || 'support@kineticube.shop',
      ...(process.env.SHIP_FROM_PHONE ? { phone: process.env.SHIP_FROM_PHONE } : {}),
    },
    address_to: {
      name: address.name,
      street1: address.street1,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: 'US',
    },
    parcels: [getParcel(quantity)],
    async: false,
  };

  let res: Response;
  try {
    res = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new ShippoError(`Shippo request failed: ${String(err)}`);
  }

  if (!res.ok) {
    throw new ShippoError(`Shippo returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  return ((data.rates ?? []) as ShippoRate[])
    .filter(r => r.provider === 'USPS' && r.servicelevel?.token && parseFloat(r.amount ?? '0') > 0)
    .sort((a, b) => parseFloat(a.amount ?? '0') - parseFloat(b.amount ?? '0'))
    .map(r => ({
      id: r.object_id,
      provider: r.provider,
      service: r.servicelevel?.name ?? 'USPS',
      token: r.servicelevel!.token!,
      amount: r.amount!,
      currency: r.currency ?? 'USD',
      estimated_days: r.estimated_days ?? null,
    }));
}
