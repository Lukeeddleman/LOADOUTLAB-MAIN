import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The Kineticube storefront used to sit at the root of its own domain. Moving
   * it under /kineticube would turn every link that already exists — anything
   * printed on packaging, shared in a forum post, bookmarked, or indexed by
   * Google — into a 404.
   *
   * These are permanent redirects, so search engines transfer the old pages'
   * ranking to the new addresses rather than treating them as new and starting
   * over. Keep them: there is no expiry date on a link someone else controls.
   */
  async redirects() {
    return [
      { source: "/shop", destination: "/kineticube/shop", permanent: true },
      { source: "/training", destination: "/kineticube/training", permanent: true },
    ];
  },
};

export default nextConfig;
