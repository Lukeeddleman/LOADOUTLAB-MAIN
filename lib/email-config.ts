/**
 * Where transactional email comes from and goes to.
 *
 * Originally hardcoded to @kineticube.shop, which tied every order
 * notification to one domain staying healthy. The .shop registry then went
 * down twice in a day, and the GoDaddy mailboxes on that domain expired — so
 * the addresses moved to loadoutlab.com, and every one of them is overridable
 * from the Vercel dashboard without a code change.
 *
 * SUPPORT_EMAIL is the one that matters most: if it points somewhere Luke
 * isn't reading, sales happen silently. Set it to a mailbox that definitely
 * works, even a personal one, rather than a nice-looking address that doesn't
 * exist yet.
 */

/** The address customers are shown and can reply to. */
export function supportTo(): string {
  return process.env.SUPPORT_EMAIL || 'support@loadoutlab.com';
}

/** Sender for order notifications. Domain must be verified in Resend. */
export function ordersFrom(): string {
  return process.env.ORDERS_FROM_EMAIL || 'Loadout Lab Orders <noreply@loadoutlab.com>';
}

/** Sender for the back-in-stock announcement. */
export function restockFrom(): string {
  return process.env.RESTOCK_FROM_EMAIL || 'Kineticube <noreply@loadoutlab.com>';
}

/** Sender for contact-form relays. */
export function contactFrom(): string {
  return process.env.CONTACT_FROM_EMAIL || 'Loadout Lab Contact Form <noreply@loadoutlab.com>';
}

/**
 * Sender address on the shipping label.
 *
 * USPS refuses to issue a label when this is empty, and it is where undelivered
 * post comes back to — so it should stay a real, monitored mailbox.
 */
export function shipFromEmail(): string {
  return process.env.SHIP_FROM_EMAIL || supportTo();
}
