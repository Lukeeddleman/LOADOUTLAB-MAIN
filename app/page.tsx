import Link from "next/link";
import Image from "next/image";

/**
 * Loadout Lab — the parent site.
 *
 * Deliberately leads with a single product rather than a catalog grid. With one
 * product on the shelf, a grid built for six advertises the five that aren't
 * there; a hero says "this is the thing we make." Adding the second product
 * means adding an entry to `products` below and letting the layout switch to a
 * grid — the shape is here, it just isn't shown off prematurely.
 */

interface Product {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  image: string;
  price: string;
}

const products: Product[] = [
  {
    slug: "kineticube",
    name: "Kineticube",
    tagline: "Reactive Powder Targets",
    blurb:
      "One-inch targets that burst into colour on impact. Stick them to steel, paper, wood or cardboard and see every hit from the firing line — no walking downrange to check holes.",
    image: "/product-hero.webp",
    price: "$12.99",
  },
];

const featured = products[0];

export default function Home() {
  return (
    <div className="bg-[#0d0d0d]">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="border-b border-[#1a1a1a]">
        <div className="max-w-[1440px] mx-auto px-6 py-20 md:py-28">
          <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-[#f05a1a] mb-4">
            AUSTIN, TEXAS
          </p>
          {/* Benefit first, category second. The headline sells the reason to
              care; the line under it says plainly what we sell, so nobody has
              to guess — and so the words people actually search for are on the
              page. */}
          <h1 className="font-[family-name:var(--font-display)] font-black text-5xl md:text-7xl tracking-normal leading-[0.95] max-w-4xl">
            MAKE EVERY
            <br />
            ROUND COUNT
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
            Firearms training accessories for every level — whether it&apos;s your first box of
            ammo or your ten-thousandth.
          </p>
        </div>
      </section>

      {/* ── The product ───────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        <p className="text-xs font-[family-name:var(--font-display)] tracking-label text-gray-500 mb-8">
          WHAT WE MAKE
        </p>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Link href={`/${featured.slug}`} className="block group">
            <div className="relative aspect-square bg-[#111111] border border-[#1a1a1a] overflow-hidden">
              <Image
                src={featured.image}
                alt={`${featured.name} — ${featured.tagline}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </Link>

          <div>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl tracking-normal">
              {featured.name.toUpperCase()}
            </h2>
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-label text-sm mt-2">
              {featured.tagline.toUpperCase()}
            </p>
            <p className="text-gray-400 text-lg mt-6 leading-relaxed">{featured.blurb}</p>
            <p className="text-white text-2xl font-[family-name:var(--font-display)] font-bold mt-6">
              {featured.price}
              <span className="text-gray-500 text-base font-normal"> / 6-pack</span>
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/${featured.slug}`}
                className="bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-bold tracking-label px-8 py-3 transition-colors"
              >
                SEE THE DETAIL
              </Link>
              <Link
                href={`/${featured.slug}/shop`}
                className="border border-[#2a2a2a] hover:border-[#f05a1a] text-white font-[family-name:var(--font-display)] font-bold tracking-label px-8 py-3 transition-colors"
              >
                BUY NOW
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────────────────── */}
      <section className="border-t border-[#1a1a1a]">
        <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-20 grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-[family-name:var(--font-display)] font-bold tracking-label text-sm text-[#f05a1a]">
              MADE HERE
            </h3>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Produced in-house in Austin, not drop-shipped. If something is wrong with your order
              you are talking to the person who made it.
            </p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] font-bold tracking-label text-sm text-[#f05a1a]">
              USEFUL AT ANY LEVEL
            </h3>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Gear that earns its place in the bag whether you are learning the fundamentals or
              drilling something you have done ten thousand times.
            </p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-display)] font-bold tracking-label text-sm text-[#f05a1a]">
              SHIPS FAST
            </h3>
            <p className="text-gray-400 mt-3 leading-relaxed">
              Orders go out from stock we hold ourselves, with tracking on every parcel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
