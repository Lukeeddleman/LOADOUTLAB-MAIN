import type { Parcel } from './parcel';

/**
 * The product catalogue — one entry per thing Loadout Lab sells.
 *
 * Everything that used to be hardcoded for a single product lives here: price,
 * how many go in a box, what the box is, how many someone may buy, and where
 * its stock count is kept. Adding a product should be an entry in this file
 * plus a page, not a hunt through a dozen files for the assumptions.
 *
 * ── On the storage keys ────────────────────────────────────────────────────
 * Kineticube's keys are deliberately the bare `kineticube:stock` and
 * `kineticube:waitlist` rather than the namespaced scheme below. Those keys
 * hold the LIVE stock count and the LIVE waitlist right now. Renaming them
 * would orphan both: the shop would read stock as unknown and every waiting
 * customer would silently vanish. New products use the namespaced form.
 */

export interface Product {
  /** URL segment and stable identity. Never change one after it ships. */
  slug: string;
  name: string;
  tagline: string;
  /** Price per unit, in cents. */
  priceCents: number;
  /** What one unit is called — "6-pack", "shirt". */
  unitLabel: string;
  /** How many physical items are in a unit, for "48 cubes" style copy. */
  itemsPerUnit: number;
  minQuantity: number;
  maxQuantity: number;
  /** Redis key holding the count on hand. */
  stockKey: string;
  /** Redis key holding the back-in-stock waitlist. */
  waitlistKey: string;
  /** Box and weight for a given number of units — drives the shipping quote. */
  parcelFor: (quantity: number) => Parcel;
  /** Hero image used on site. */
  image: string;
  /**
   * Image shown in Stripe's checkout. Must be a JPEG or PNG: WebP does not
   * render there, or in most email clients.
   */
  checkoutImage: string;
  blurb: string;
  points: string[];
}

const kineticube: Product = {
  slug: 'kineticube',
  name: 'Kineticube',
  tagline: 'Reactive Powder Targets',
  priceCents: 1299,
  unitLabel: '6-pack',
  itemsPerUnit: 6,
  minQuantity: 1,
  maxQuantity: 10,
  stockKey: 'kineticube:stock',
  waitlistKey: 'kineticube:waitlist',
  parcelFor(quantity: number): Parcel {
    // 1 pack  → 6×9×1.5in bubble mailer
    // 2 packs → 7.25×11×1.5in bubble mailer
    // 3-10    → PLACEHOLDER, still unconfirmed. Under-declared weight comes
    //           back as a USPS postage adjustment after the fact, so the
    //           estimate is deliberately generous.
    if (quantity === 1) {
      return { length: '9', width: '6', height: '1.5', weight: '6', distance_unit: 'in', mass_unit: 'oz' };
    }
    if (quantity === 2) {
      return { length: '11', width: '7.25', height: '1.5', weight: '11', distance_unit: 'in', mass_unit: 'oz' };
    }
    const weight = Math.ceil(quantity * 5.5 + 3); // ~5.5oz per pack + 3oz box
    return { length: '12', width: '10', height: '4', weight: String(weight), distance_unit: 'in', mass_unit: 'oz' };
  },
  image: '/product-hero.webp',
  checkoutImage: '/product-red.jpg',
  blurb:
    'One-inch targets that burst into colour on impact. Stick them to steel, paper, wood or cardboard and read every hit from the firing line — no walking downrange to check holes, no guessing which round went where.',
  points: ['10 vivid colours', 'Sticks to any clean surface', 'Biodegradable PHA shell'],
};

export const PRODUCTS: Product[] = [kineticube];

/**
 * The product used when a request doesn't name one.
 *
 * Every existing order, link and API call predates products having names, so
 * they all mean Kineticube. Keeping a default is what lets this ship without
 * breaking anything already in flight.
 */
export const DEFAULT_PRODUCT = kineticube;

/** Look a product up by slug. Returns null for anything unrecognised. */
export function getProduct(slug: unknown): Product | null {
  if (typeof slug !== 'string' || !slug) return null;
  return PRODUCTS.find(p => p.slug === slug) ?? null;
}

/**
 * The product a request is about, falling back to the default.
 *
 * Used on paths where an unknown slug should not fail the request — an older
 * client, or an order placed before this existed. Paths where guessing would
 * be wrong should call getProduct and reject null themselves.
 */
export function productOrDefault(slug: unknown): Product {
  return getProduct(slug) ?? DEFAULT_PRODUCT;
}

/** Coerce an untrusted quantity against this product's own limits. */
export function normalizeQuantityFor(product: Product, input: unknown): number | null {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < product.minQuantity || n > product.maxQuantity) return null;
  return n;
}
