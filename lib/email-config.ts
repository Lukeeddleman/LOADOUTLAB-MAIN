/**
 * Where transactional email comes from and goes to.
 *
 * These were hardcoded to @kineticube.shop, which ties every order
 * notification to that one domain staying healthy. When the .shop registry went
 * down in September 2026 the shop was unreachable *and* order emails had
 * nowhere to land — a sale could have completed with no way to hear about it.
 *
 * Now they're environment variables, defaulting to the original addresses so
 * nothing changes until Luke sets them. That means a working inbox can be
 * swapped in from the Vercel dashboard in a minute, without a code change,
 * which is exactly what an outage leaves time for.
 */

/** Sender for order and restock email. Must be a domain verified in Resend. */
export function ordersFrom(): string {
  return process.env.ORDERS_FROM_EMAIL || 'Kineticube Orders <noreply@kineticube.shop>';
}

/** Sender for the restock announcement. */
export function restockFrom(): string {
  return process.env.RESTOCK_FROM_EMAIL || 'Kineticube <noreply@kineticube.shop>';
}

/** Sender for contact-form relays. */
export function contactFrom(): string {
  return process.env.CONTACT_FROM_EMAIL || 'Kineticube Contact Form <noreply@kineticube.shop>';
}

/**
 * Where Luke actually reads his mail.
 *
 * This is the important one: if it points at a domain that's down, he stops
 * hearing about paid orders. Set SUPPORT_EMAIL to any working address.
 */
export function supportTo(): string {
  return process.env.SUPPORT_EMAIL || 'support@kineticube.shop';
}
