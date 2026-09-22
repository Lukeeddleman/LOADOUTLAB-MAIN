import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="#f05a1a" strokeWidth="2"/>
        <circle cx="16" cy="16" r="8" stroke="#f05a1a" strokeWidth="2"/>
        <circle cx="16" cy="16" r="2" fill="#f05a1a"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="#f05a1a" strokeWidth="2"/>
        <line x1="16" y1="26" x2="16" y2="30" stroke="#f05a1a" strokeWidth="2"/>
        <line x1="2" y1="16" x2="6" y2="16" stroke="#f05a1a" strokeWidth="2"/>
        <line x1="26" y1="16" x2="30" y2="16" stroke="#f05a1a" strokeWidth="2"/>
      </svg>
    ),
    title: "Instant Visual Feedback",
    desc: "1-inch targets that show exactly where every round hits — no walking downrange to check holes.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18 10 L26 10 L20 15 L22 23 L16 18 L10 23 L12 15 L6 10 L14 10 Z" fill="#f05a1a"/>
      </svg>
    ),
    title: "Explosive Color",
    desc: "10 vivid powder colors burst on impact. You'll see it from any distance.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="12" width="24" height="14" rx="2" stroke="#f05a1a" strokeWidth="2"/>
        <path d="M10 12V8a6 6 0 0112 0v4" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Sticks to Any Surface",
    desc: "3M adhesive pad grips to steel, wood, paper, cardboard, concrete — and more.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
        <path d="M16 3 C16 3 6 8 6 18 C6 24 10.5 28 16 28 C21.5 28 26 24 26 18 C26 8 16 3 16 3Z" stroke="#f05a1a" strokeWidth="2" fill="none"/>
        <path d="M11 18 L15 22 L21 14" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Eco-Friendly PHA Shell",
    desc: "Biodegradable material. Perform at the range without leaving a mess behind.",
  },
];

const steps = [
  {
    num: "1",
    label: "PEEL",
    desc: "Peel the target from its backing.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="14" width="26" height="22" rx="2" stroke="#f05a1a" strokeWidth="2"/>
        <path d="M32 14 L43 5 L43 25 Z" stroke="#f05a1a" strokeWidth="2" strokeLinejoin="round" fill="#f05a1a" fillOpacity="0.15"/>
        <line x1="32" y1="14" x2="43" y2="25" stroke="#f05a1a" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
        <path d="M38 8 Q44 6 43 5" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    num: "2",
    label: "STICK",
    desc: "Stick firmly to any clean, dry surface.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="38" width="40" height="4" rx="1" stroke="#f05a1a" strokeWidth="2"/>
        <rect x="16" y="8" width="16" height="16" rx="2" stroke="#f05a1a" strokeWidth="2"/>
        <line x1="24" y1="24" x2="24" y2="34" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 30 L24 36 L29 30" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6" y1="28" x2="13" y2="28" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="35" y1="28" x2="42" y2="28" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4" y1="32" x2="11" y2="32" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="37" y1="32" x2="44" y2="32" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: "3",
    label: "SHOOT",
    desc: "Aim for center for maximum reaction.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" stroke="#f05a1a" strokeWidth="2"/>
        <circle cx="24" cy="24" r="11" stroke="#f05a1a" strokeWidth="2"/>
        <circle cx="24" cy="24" r="4" fill="#f05a1a"/>
        <line x1="24" y1="2" x2="24" y2="10" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="24" y1="38" x2="24" y2="46" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="24" x2="10" y2="24" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="24" x2="46" y2="24" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const surfaces = [
  {
    name: "STEEL",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="10" width="32" height="20" rx="2" stroke="#f05a1a" strokeWidth="1.5"/>
        <line x1="4" y1="16" x2="36" y2="16" stroke="#f05a1a" strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="4" y1="20" x2="36" y2="20" stroke="#f05a1a" strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="4" y1="24" x2="36" y2="24" stroke="#f05a1a" strokeWidth="1" strokeDasharray="3 3"/>
      </svg>
    ),
  },
  {
    name: "PAPER",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M8 5 H26 L32 11 V35 H8 Z" stroke="#f05a1a" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M26 5 V11 H32" stroke="#f05a1a" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="13" y1="18" x2="27" y2="18" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="13" y1="23" x2="27" y2="23" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="13" y1="28" x2="21" y2="28" stroke="#f05a1a" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "CARDBOARD",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="2" stroke="#f05a1a" strokeWidth="1.5"/>
        <path d="M4 17 Q8 13 12 17 Q16 21 20 17 Q24 13 28 17 Q32 21 36 17" stroke="#f05a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M4 25 Q8 21 12 25 Q16 29 20 25 Q24 21 28 25 Q32 29 36 25" stroke="#f05a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "WOOD",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="2" stroke="#f05a1a" strokeWidth="1.5"/>
        <path d="M12 8 Q15 16 12 32" stroke="#f05a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M20 8 Q23 18 21 32" stroke="#f05a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M28 8 Q30 18 29 32" stroke="#f05a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "CONCRETE",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="3" y="7" width="15" height="9" rx="1" stroke="#f05a1a" strokeWidth="1.5"/>
        <rect x="22" y="7" width="15" height="9" rx="1" stroke="#f05a1a" strokeWidth="1.5"/>
        <rect x="3" y="20" width="15" height="9" rx="1" stroke="#f05a1a" strokeWidth="1.5"/>
        <rect x="22" y="20" width="15" height="9" rx="1" stroke="#f05a1a" strokeWidth="1.5"/>
        <rect x="12" y="33" width="16" height="3" rx="1" stroke="#f05a1a" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    name: "+ MORE",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="15" stroke="#f05a1a" strokeWidth="1.5"/>
        <line x1="20" y1="12" x2="20" y2="28" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="28" y2="20" stroke="#f05a1a" strokeWidth="2" strokeLinecap="round"/>
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
              REACTIVE POWDER TARGETS
            </div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-6xl md:text-7xl lg:text-8xl 2xl:text-9xl leading-none tracking-tight mb-6 2xl:mb-8">
              STICK IT.<br />
              SHOOT IT.<br />
              <span className="text-[#f05a1a]">SEE IT.</span>
            </h1>
            <p className="text-gray-400 text-lg 2xl:text-xl mb-8 max-w-md 2xl:max-w-xl leading-relaxed">
              Kineticube reactive powder targets explode in a burst of color on impact —
              giving you instant visual feedback on every single shot.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="btn-orange bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-extrabold tracking-widest text-lg px-8 py-4 transition-colors"
              >
                SHOP NOW — 6-PACK
              </Link>
              <Link
                href="/#how-it-works"
                className="border border-gray-600 hover:border-white text-gray-300 hover:text-white font-[family-name:var(--font-display)] font-bold tracking-widest text-lg px-8 py-4 transition-colors"
              >
                HOW IT WORKS
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Made in the USA
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Safe &amp; Non-Explosive
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-[#f05a1a]">✓</span> Eco-Friendly
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative float">
              <div className="absolute inset-0 bg-[#f05a1a] opacity-20 blur-3xl rounded-full scale-75" />
              <Image
                src="/product-hero.webp"
                alt="Kineticube reactive powder targets exploding with color"
                width={480}
                height={480}
                className="relative drop-shadow-2xl rounded-lg w-full max-w-[480px] 2xl:max-w-[640px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRAINING CALLOUT ─── */}
      <section className="bg-[#111111] border-y border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f05a1a] opacity-[0.03] blur-[80px] pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-6 py-20 2xl:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div>
              <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-xs mb-4">
                FREE RANGE GUIDE
              </p>
              <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-wide mb-5 leading-tight">
                DON&apos;T JUST SHOOT.<br />
                <span className="text-[#f05a1a]">TRAIN.</span>
              </h2>
              <p className="text-gray-400 text-base 2xl:text-lg mb-8 max-w-md" style={{ lineHeight: "1.85" }}>
                Every cube gets one shot — so make it count. We built a full library of drills,
                courses of fire, and range tips designed specifically around the way Kineticubes work.
              </p>
              <Link
                href="/training"
                className="inline-block border-2 border-[#f05a1a] hover:bg-[#f05a1a] text-[#f05a1a] hover:text-white font-[family-name:var(--font-display)] font-black tracking-widest text-base px-8 py-3.5 transition-colors"
              >
                VIEW DRILLS &amp; COURSES →
              </Link>
            </div>

            {/* Right: drill preview cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🎯", name: "Cold Shot", desc: "One cube. One shot. No warm-up." },
                { icon: "⬜", name: "The Box", desc: "4 cubes, non-linear transitions." },
                { icon: "💪", name: "Strong / Weak", desc: "Dominant and support hand drills." },
                { icon: "⚡", name: "The Draw", desc: "Obsess over your draw stroke." },
              ].map((drill) => (
                <Link
                  key={drill.name}
                  href="/training"
                  className="bg-[#0d0d0d] border border-[#2a2a2a] hover:border-[#f05a1a]/50 p-5 transition-colors group"
                >
                  <div className="text-2xl mb-2">{drill.icon}</div>
                  <p className="font-[family-name:var(--font-display)] font-bold tracking-label text-sm text-white group-hover:text-[#f05a1a] transition-colors mb-1">
                    {drill.name}
                  </p>
                  <p className="text-gray-600 text-xs" style={{ lineHeight: "1.6" }}>{drill.desc}</p>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-32 2xl:py-44 bg-[#0d0d0d] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f05a1a]/40 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-sm mb-4">THE DIFFERENCE</p>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-tight">
              WHY <span className="text-[#f05a1a]">KINETICUBE?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="relative bg-[#141414] border border-[#242424] hover:border-[#f05a1a]/40 p-10 2xl:p-12 transition-all group flex gap-8 items-start overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f05a1a]/20 group-hover:bg-[#f05a1a]/70 transition-colors duration-300" />
                <div className="shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-xl 2xl:text-2xl tracking-wide mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed 2xl:text-lg">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-32 2xl:py-44 bg-[#111111] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f05a1a]/40 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-sm mb-4">THREE STEPS</p>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-tight">
              HOW TO <span className="text-[#f05a1a]">USE</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 2xl:gap-20">
            {steps.map((s, i) => (
              <div key={s.label} className="text-center relative">
                {/* Ghost background number */}
                <div
                  className="absolute inset-x-0 top-0 flex justify-center pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <span className="font-[family-name:var(--font-display)] font-black text-[200px] 2xl:text-[260px] leading-none text-white opacity-[0.025]">
                    {s.num}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[104px] left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-[#f05a1a]/30" />
                )}
                <div className="relative flex justify-center mb-6">{s.icon}</div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f05a1a] font-[family-name:var(--font-display)] font-black text-3xl text-white mb-5">
                  {s.num}
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-extrabold text-2xl 2xl:text-3xl tracking-widest mb-3">
                  {s.label}
                </h3>
                <p className="text-gray-400 leading-relaxed 2xl:text-lg">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STICKS ANYWHERE ─── */}
      <section className="py-32 2xl:py-44 bg-[#0d0d0d] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f05a1a]/40 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-[0.3em] text-sm mb-4">3M ADHESIVE</p>
            <h2 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-5xl 2xl:text-6xl tracking-tight">
              STICKS TO <span className="text-[#f05a1a]">ANYTHING.</span>
            </h2>
            <p className="text-gray-500 mt-5 text-lg 2xl:text-xl max-w-xl mx-auto leading-relaxed">
              Industrial-grade 3M adhesive grips to virtually any surface at the range.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 2xl:gap-6">
            {surfaces.map((s) => (
              <div
                key={s.name}
                className="relative bg-[#141414] border border-[#242424] hover:border-[#f05a1a]/40 p-8 2xl:p-10 flex flex-col items-center gap-5 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f05a1a]/0 group-hover:bg-[#f05a1a]/60 transition-colors duration-300" />
                <div className="group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <span className="font-[family-name:var(--font-display)] tracking-label text-sm text-gray-500 group-hover:text-gray-200 transition-colors">
                  {s.name}
                </span>
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
          <h2 className="font-[family-name:var(--font-display)] font-black text-5xl md:text-6xl 2xl:text-7xl tracking-tight mb-6">
            READY TO <span className="text-[#f05a1a]">SHOOT?</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg 2xl:text-xl leading-relaxed">
            6-pack. 10 colors. 1 inch. Sticks anywhere. Explodes on impact.
          </p>
          <Link
            href="/shop"
            className="inline-block btn-orange bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-extrabold tracking-widest text-xl px-12 py-5 transition-colors"
          >
            GET YOUR 6-PACK
          </Link>
        </div>
      </section>
    </>
  );
}
