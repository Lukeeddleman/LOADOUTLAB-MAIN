import type { Metadata } from "next";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import RestockNotify from "@/components/RestockNotify";
import { getStock, LOW_STOCK_THRESHOLD } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Shop — Kineticube™ Reactive Powder Targets",
  description: "Get your Kineticube 6-Pack. Reactive powder targets with instant colorful visual feedback. Made in the USA.",
};

const PRICE = 12.99;

const perks = [
  "6 cubes per pack",
  "1 inch targets — built for precision",
  "6 vivid powder colors — randomly assorted",
  "Color-matched corners so you always know what's inside",
  "Instant visual feedback on every shot",
  "3M adhesive — sticks to any surface",
  "Safe & non-explosive",
  "Biodegradable PHA shell",
  "Made in the USA",
];

export default async function ShopPage() {
  // IN_STOCK is a manual override — a kill switch to close the shop regardless
  // of what the counter says. Otherwise the live count decides.
  const forcedClosed = process.env.IN_STOCK === 'false';
  const stock = forcedClosed ? 0 : await getStock();

  // A null count means we genuinely don't know (Upstash not configured or
  // unreachable). Keep selling — losing sight of the counter is not a reason to
  // shut the store.
  const soldOut = forcedClosed || stock === 0;
  const lowStock = stock !== null && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  const inStock = !soldOut;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Page header */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-tight">
            SHOP
          </h1>
          <p className="text-gray-500 text-sm mt-1">Reactive Powder Targets</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* PRODUCT CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Images */}
          <div>
            <ProductGallery />
          </div>

          {/* Product details */}
          <div className="lg:sticky lg:top-20">
            <div className="flex flex-wrap gap-2 mb-4">
              {soldOut ? (
                <span className="inline-block bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-[family-name:var(--font-display)] tracking-widest px-3 py-1">
                  SOLD OUT
                </span>
              ) : lowStock ? (
                /* Barlow Condensed at weight 900 is narrow enough that small
                   sizes run together. Bigger, one weight lighter, and much
                   wider tracking keeps the urgency while staying readable. */
                <span className="inline-flex items-center gap-2.5 bg-[#f05a1a] text-white text-sm font-[family-name:var(--font-display)] font-bold tracking-[0.2em] px-4 py-2 btn-orange">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  HURRY — ONLY {stock} LEFT
                </span>
              ) : (
                <span className="inline-block bg-[#f05a1a]/10 border border-[#f05a1a]/30 text-[#f05a1a] text-xs font-[family-name:var(--font-display)] tracking-widest px-3 py-1">
                  IN STOCK · MADE IN THE USA
                </span>
              )}
            </div>

            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl tracking-tight mb-2">
              KINETICUBE™
            </h2>
            <p className="text-gray-400 font-[family-name:var(--font-display)] tracking-widest text-sm mb-4">
              REACTIVE POWDER TARGETS — 6-PACK — <span className="text-yellow-400">1 INCH</span>
            </p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-[family-name:var(--font-display)] font-black text-5xl text-white">
                ${PRICE.toFixed(2)}
              </span>
              <span className="text-gray-500 text-sm">per 6-pack</span>
            </div>

            {/* Size callout */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 mb-6">
              <span className="text-lg">📐</span>
              <p className="text-gray-400 text-sm">
                Each cube is <strong className="text-white">1 inch (25mm)</strong> in size.
              </p>
            </div>

            {/* Perks list */}
            <ul className="space-y-2 mb-8">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="text-[#f05a1a] font-bold">✓</span>
                  {p}
                </li>
              ))}
            </ul>

            {/* Cartridge compatibility disclaimer */}
            <div className="bg-[#1a1200] border border-yellow-600/40 px-4 py-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-base mt-0.5">⚠️</span>
                <div>
                  <p className="text-yellow-400 font-[family-name:var(--font-display)] font-bold tracking-wider text-xs mb-1">
                    CARTRIDGE COMPATIBILITY
                  </p>
                  <p className="text-yellow-200/80 text-sm leading-relaxed">
                    Kineticubes perform best with slower or heavier projectiles. High-velocity cartridges such as 5.56 NATO may require more than one impact for full powder release.
                  </p>
                </div>
              </div>
            </div>

            {/* Buy button */}
            {inStock ? (
              <>
                <Link
                  href="/checkout"
                  className="block w-full bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-black tracking-widest text-xl text-center py-5 transition-colors mb-4"
                >
                  BUY NOW — ${PRICE.toFixed(2)}
                </Link>
                {lowStock && (
                  <p className="text-[#f05a1a] text-sm font-[family-name:var(--font-display)] font-semibold tracking-[0.18em] text-center mb-4">
                    {stock === 1
                      ? 'LAST ONE IN THIS BATCH'
                      : `LOW STOCK — ${stock} PACKS LEFT IN THIS BATCH`}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="block w-full bg-[#2a2a2a] text-gray-600 font-[family-name:var(--font-display)] font-black tracking-widest text-xl text-center py-5 mb-4 cursor-not-allowed">
                  SOLD OUT
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Every pack is made in small batches right here in Texas. The next
                  run is already on the printers.
                </p>
                <RestockNotify />
              </>
            )}

            <p className="text-gray-600 text-xs text-center mb-8">
              Secure checkout powered by Stripe. Ships USPS from Austin, TX.
            </p>

            {/* Color info */}
            <div className="border-t border-[#1a1a1a] pt-6">
              <h3 className="font-[family-name:var(--font-display)] font-bold tracking-widest text-sm text-gray-400 mb-3">
                6 COLORS — RANDOMLY ASSORTED
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every 6-pack contains a surprise mix of our 6 vivid powder colors.
                Each cube&apos;s corners are color-matched to the powder inside — so you always
                know what you&apos;re grabbing before you peel.
              </p>
            </div>
          </div>
        </div>

        {/* COMING SOON */}
        <div className="mt-20 border-t border-[#1a1a1a] pt-12">
          <div className="text-center mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-tight text-gray-600">
              MORE PRODUCTS <span className="text-[#f05a1a]/50">COMING SOON</span>
            </h3>
            <p className="text-gray-600 text-sm mt-2">We&apos;re just getting started.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#111111] border border-dashed border-[#2a2a2a] h-48 flex items-center justify-center"
              >
                <span className="text-gray-700 font-[family-name:var(--font-display)] tracking-widest text-sm">
                  COMING SOON
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
