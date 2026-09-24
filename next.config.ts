import type { NextConfig } from "next";

/**
 * kineticube.shop is a QR code printed on physical packaging that is already
 * in customers' hands. Those codes can never be changed, so that domain has to
 * keep working — and keep landing people somewhere useful — indefinitely.
 *
 * Both domains point at this project, so traffic arriving on kineticube.shop
 * is forwarded to the matching page on loadoutlab.com. /api is deliberately
 * excluded: webhooks must never be redirected, because Stripe does not follow
 * redirects and would mark every delivery failed.
 */
const LEGACY_HOST = "(www\\.)?kineticube\\.shop";
const NEW_ORIGIN = "https://www.loadoutlab.com";

const fromLegacyHost = (source: string, destination: string) => ({
  source,
  has: [{ type: "host" as const, value: LEGACY_HOST }],
  destination: `${NEW_ORIGIN}${destination}`,
  permanent: true,
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ── kineticube.shop → loadoutlab.com ─────────────────────────────────
      // These MUST come first. Redirects are matched in order, so the generic
      // /shop rule below would otherwise catch old-domain traffic and send it
      // to kineticube.shop/kineticube/shop — still stranded on the domain we
      // are trying to move people off.
      fromLegacyHost("/", "/kineticube"),
      fromLegacyHost("/shop", "/kineticube/shop"),
      fromLegacyHost("/training", "/kineticube/training"),
      fromLegacyHost("/contact", "/contact"),

      // Anything else, except /api. The negative lookahead is what keeps the
      // Stripe webhook reachable on the old domain if it is ever pointed back.
      fromLegacyHost("/:path((?!api/).*)", "/kineticube"),

      // ── Old Kineticube paths on the new domain ───────────────────────────
      // The storefront used to sit at the root. Without these, every link
      // already shared or indexed becomes a 404.
      { source: "/shop", destination: "/kineticube/shop", permanent: true },
      { source: "/training", destination: "/kineticube/training", permanent: true },
    ];
  },
};

export default nextConfig;
