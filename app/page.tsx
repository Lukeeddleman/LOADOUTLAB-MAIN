import Link from "next/link";
import Image from "next/image";

/**
 * Loadout Lab — the parent site.
 *
 * Built to the same rhythm as the Kineticube page: full-height hero, alternating
 * #0d0d0d / #111111 sections at py-32, hairline orange dividers, and a gradient
 * close. A shorter, lighter page under the same nav read as unfinished next to
 * the product page it links to.
 *
 * Leads with a single product rather than a catalog grid. With one product on
 * the shelf, a six-slot grid advertises the five that are missing. `products`
 * below is the seam — a second entry is where this becomes a grid.
 */

interface Product {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  image: string;
  price: string;
  unit: string;
  points: string[];
}

const products: Product[] = [
  {
    slug: "kineticube",
    name: "Kineticube",
    tagline: "Reactive Powder Targets",
    blurb:
      "One-inch targets that burst into colour on impact. Stick them to steel, paper, wood or cardboard and read every hit from the firing line — no walking downrange to check holes, no guessing which round went where.",
    image: "/product-hero.webp",
    price: "$12.99",
    unit: "6-pack",
    points: ["10 vivid colours", "Sticks to any clean surface", "Biodegradable PHA shell"],
  },
];

const featured = products[0];

const values = [
  {
    title: "Useful At Any Level",
    desc: "Gear that earns its place in the bag whether you're learning the fundamentals or drilling something you've done ten thousand times.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="20" width="6" height="9" stroke="#f05a1a" strokeWidth="2" />
        <rect x="13" y="13" width="6" height="16" stroke="#f05a1a" strokeWidth="2" />
        <rect x="23" y="5" width="6" height="24" stroke="#f05a1a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Made Here, By Us",
    desc: "Produced in-house in Austin, not drop-shipped from a catalogue. If something's wrong with your order, you're talking to the person who made it.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 29s10-8.5 10-16A10 10 0 0 0 6 13c0 7.5 10 16 10 16Z"
          stroke="#f05a1a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="13" r="3.5" stroke="#f05a1a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Built Around Drills",
    desc: "Every product starts as something we wanted for our own practice and couldn't buy — then gets tested on the range before it gets sold.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#f05a1a" strokeWidth="2" />
        <circle cx="16" cy="16" r="6" stroke="#f05a1a" strokeWidth="2" />
        <circle cx="16" cy="16" r="1.5" fill="#f05a1a" />
        <line x1="16" y1="1" x2="16" y2="5" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="27" x2="16" y2="31" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="1" y1="16" x2="5" y2="16" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" />
        <line x1="27" y1="16" x2="31" y2="16" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Ships From Our Shelf",
    desc: "Orders go out from stock we hold ourselves, with tracking on every parcel — not ordered in once you've paid.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <path d="M4 10l12-5 12 5v12l-12 5-12-5V10Z" stroke="#f05a1a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 10l12 5 12-5M16 15v12" stroke="#f05a1a" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0d0d0d] to-[#1a0a00]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#f05a1a] opacity-10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#f05a1a] opacity-5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 2xl:gap-20 items-center py-20 2xl:py-32">
          <div>
            <div className="inline-block bg-[#f05a1a]/10 border border-[#f05a1a]/30 text-[#f05a1a] text-xs font-[family-name:var(--font-display)] tracking-label px-3 py-1 mb-6">
              AUSTIN, TEXAS
            </div>
            {/* Benefit first, category second: the headline sells the reason to
                care, the line under it says plainly what we sell. */}
            <h1 className="font-[family-name:var(--font-display)] font-black text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl leading-none tracking-normal mb-6 2xl:mb-8">
              MAKE EVERY<br />
              ROUND <span className="text-[#f05a1a]">COUNT.</span>
            </h1>
            <p className="text-gray-400 text-lg 2xl:text-xl mb-8 max-w-md 2xl:max-w-xl leading-relaxed">
              Firearms training accessories for every level — whether it&apos;s your first box of
              ammo or your ten-thousandth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/kineticube/shop"
                className="btn-orange bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-extrabold tracking-widest text-lg px-8 py-4 transition-colors"
              >
                SHOP NOW
              </Link>
              <Link
                href="/kineticube"
                className="border border-gray-600 hover:border-white text-gray-300 hover:text-white font-[family-name:var(--font-display)] font-bold tracking-widest text-lg px-8 py-4 transition-colors"
              >
                WHAT WE MAKE
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Made in the USA
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Ships from stock
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Tracked delivery
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative float">
              <div className="absolute inset-0 bg-[#f05a1a] opacity-20 blur-3xl rounded-full scale-75" />
              <Image
                src={featured.image}
                alt={`${featured.name} — ${featured.tagline}`}
                width={480}
                height={480}
                className="relative drop-shadow-2xl rounded-lg w-full max-w-[480px] 2xl:max-w-[640px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PRODUCT ─── */}
      <section className="bg-[#111111] border-y border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f05a1a] opacity-[0.03] blur-[80px] pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-6 py-24 2xl:py-32">
          <div className="text-center mb-16">
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-sm mb-4">
              WHAT WE MAKE
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-normal">
              THE <span className="text-[#f05a1a]">LINEUP</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 2xl:gap-20 items-center">
            <Link href={`/${featured.slug}`} className="block group order-2 lg:order-1">
              <div className="relative aspect-square bg-[#0d0d0d] border border-[#242424] group-hover:border-[#f05a1a]/40 overflow-hidden transition-colors">
                <Image
                  src={featured.image}
                  alt={`${featured.name} — ${featured.tagline}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>

            <div className="order-1 lg:order-2">
              <h3 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-normal">
                {featured.name.toUpperCase()}
              </h3>
              <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-label text-sm mt-3">
                {featured.tagline.toUpperCase()}
              </p>
              <p className="text-gray-400 text-lg 2xl:text-xl mt-6 leading-relaxed">{featured.blurb}</p>

              <ul className="mt-8 space-y-3">
                {featured.points.map(point => (
                  <li key={point} className="flex items-center gap-3 text-gray-300">
                    <span className="text-[#f05a1a]">✓</span> {point}
                  </li>
                ))}
              </ul>

              <p className="text-white text-3xl 2xl:text-4xl font-[family-name:var(--font-display)] font-black mt-8">
                {featured.price}
                <span className="text-gray-500 text-lg font-normal"> / {featured.unit}</span>
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href={`/${featured.slug}/shop`}
                  className="btn-orange bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-extrabold tracking-widest text-lg px-8 py-4 transition-colors"
                >
                  BUY NOW
                </Link>
                <Link
                  href={`/${featured.slug}`}
                  className="border border-gray-600 hover:border-white text-gray-300 hover:text-white font-[family-name:var(--font-display)] font-bold tracking-widest text-lg px-8 py-4 transition-colors"
                >
                  SEE THE DETAIL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY LOADOUT LAB ─── */}
      <section className="py-32 2xl:py-44 bg-[#0d0d0d] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f05a1a]/40 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-sm mb-4">
              THE DIFFERENCE
            </p>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-normal">
              WHY <span className="text-[#f05a1a]">LOADOUT LAB?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
            {values.map(v => (
              <div
                key={v.title}
                className="relative bg-[#141414] border border-[#242424] hover:border-[#f05a1a]/40 p-10 2xl:p-12 transition-all group flex gap-8 items-start overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f05a1a]/20 group-hover:bg-[#f05a1a]/70 transition-colors duration-300" />
                <div className="shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-xl 2xl:text-2xl tracking-wide mb-3">
                    {v.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed 2xl:text-lg">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-40 2xl:py-56 bg-gradient-to-b from-[#1a0a00] to-[#0d0d0d] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f05a1a]/40 to-transparent" />
        <div className="absolute inset-0 bg-[#f05a1a] opacity-5 blur-[80px]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] font-black text-5xl md:text-6xl 2xl:text-7xl tracking-normal mb-6">
            GET MORE FROM <span className="text-[#f05a1a]">RANGE DAY.</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg 2xl:text-xl leading-relaxed">
            Start with the targets that show you every hit from the firing line.
          </p>
          <Link
            href="/kineticube/shop"
            className="inline-block btn-orange bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-extrabold tracking-widest text-xl px-12 py-5 transition-colors"
          >
            SHOP KINETICUBE
          </Link>
        </div>
      </section>
    </>
  );
}
