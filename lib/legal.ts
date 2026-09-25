import { supportTo } from './email-config';

/**
 * The business facts the legal pages are built from.
 *
 * They live here rather than being typed into five pages, because the day one
 * of them changes — a new address, an LLC, a different returns window — five
 * pages disagreeing with each other is worse than none at all.
 *
 * Deliberately NOT environment variables. A legal page has to say the same
 * thing to every reader, and be reviewable in the diff; a value that only
 * exists in the Vercel dashboard is neither.
 */
export const BUSINESS = {
  /** Trading name, as customers know it. */
  name: 'Loadout Lab',

  /**
   * The entity that actually contracts with the customer. Update this if the
   * business is ever registered as an LLC — the terms are only enforceable by
   * whoever they name.
   */
  entity: 'Loadout Lab',

  city: 'Kyle',
  state: 'TX',
  country: 'USA',

  /**
   * Street and ZIP. Optional on purpose: leaving them blank renders the
   * city-level address, which is normal for a storefront, rather than
   * publishing a placeholder.
   *
   * Filling them in matters for one specific reason: CAN-SPAM requires a
   * valid physical POSTAL address in commercial email, and "Kyle, Texas" is
   * not one. A PO Box satisfies it.
   */
  street: '',
  zip: '',

  /** Shown on every policy so customers can see how current they are. */
  effectiveDate: 'September 24, 2026',

  /** Days after delivery a return can be started. */
  returnWindowDays: 30,

  /** Business days to get an order into USPS's hands. */
  processingDaysMin: 1,
  processingDaysMax: 2,

  /** Days to report a damaged or incorrect order. */
  damageReportDays: 14,
} as const;

/** The contact address on every policy — one setting, same as the rest of the site. */
export function legalEmail(): string {
  return supportTo();
}

/**
 * Full postal address when the street is known, city-level when it isn't.
 * Never returns a half-filled address with an empty line in it.
 */
export function postalAddress(): string {
  const { street, city, state, zip, country } = BUSINESS;
  const tail = [city, state].filter(Boolean).join(', ');
  if (street && zip) return `${street}, ${tail} ${zip}, ${country}`;
  return `${tail}, ${country}`;
}
