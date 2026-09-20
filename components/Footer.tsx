import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-12 2xl:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                <path d="M50 5 L62 38 L95 38 L70 58 L80 92 L50 72 L20 92 L30 58 L5 38 L38 38 Z" fill="#f05a1a" />
                <path d="M35 35 L65 65 M65 35 L35 65" stroke="#0d0d0d" strokeWidth="8" strokeLinecap="round"/>
              </svg>
              <span className="font-[family-name:var(--font-display)] font-black tracking-wider text-white">
                KINETICUBE™
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Reactive powder targets that give you instant visual feedback on every shot. Made in the USA.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-[family-name:var(--font-display)] font-700 tracking-widest text-[#f05a1a] mb-3 text-sm">
              LINKS
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Training", href: "/training" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-[family-name:var(--font-display)] font-700 tracking-widest text-[#f05a1a] mb-3 text-sm">
              FOLLOW US
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Instagram", href: "https://instagram.com/kineticubetargets" },
                { label: "TikTok", href: "https://tiktok.com/@kineticubetargets" },
                { label: "YouTube", href: "https://youtube.com/@kineticubetargets" },
                { label: "Facebook", href: "https://facebook.com/kineticubetargets" },
              ].map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Kineticube™. All rights reserved. Made in the USA 🇺🇸
          </p>
          <p className="text-gray-700 text-xs">
            Biodegradable PHA Shell · Safe &amp; Non-Explosive
          </p>
        </div>
      </div>
    </footer>
  );
}
