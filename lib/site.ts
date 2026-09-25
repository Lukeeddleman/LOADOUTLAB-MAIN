/**
 * The site's own origin, for links that have to work outside the browser —
 * inside an email, in Stripe's redirect back from checkout, in link previews.
 *
 * This exists because the fallback was previously written out at each call
 * site, and they drifted: two still pointed at kineticube.shop long after the
 * move, one at the apex, one at www. A waitlist email built from the stale one
 * would have sent customers to the old domain at the exact moment they were
 * ready to buy. One definition means that cannot happen twice.
 *
 * The fallback is `www`, not the apex: the apex 308-redirects to www, and
 * while a browser follows that, Stripe does not follow redirects at all.
 *
 * NEXT_PUBLIC_BASE_URL still overrides it, and should be set in Vercel — the
 * fallback is a safety net, not the configuration.
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://www.loadoutlab.com';
}
