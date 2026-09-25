import Link from "next/link";
import { BUSINESS } from "@/lib/legal";

/**
 * Shared chrome for the policy pages: a narrow measure, the effective date,
 * and a link across to the sibling policies.
 *
 * The typographic styles live in globals.css under `.legal-prose`, so each
 * page below is plain semantic markup and the five stay visually identical
 * without anyone remembering to copy a class list.
 */

const policies = [
  { href: "/legal/shipping", label: "Shipping" },
  { href: "/legal/returns", label: "Returns & Refunds" },
  { href: "/legal/terms", label: "Terms of Sale" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/safety", label: "Safety & Use" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d0d]">
      <div className="max-w-3xl mx-auto px-6 py-16 2xl:py-24">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 pb-8 mb-10 border-b border-[#1f1f1f]">
          {policies.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="font-[family-name:var(--font-display)] font-semibold tracking-label text-xs text-gray-500 hover:text-[#f05a1a] transition-colors"
            >
              {p.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <article className="legal-prose">{children}</article>

        <p className="mt-14 pt-8 border-t border-[#1f1f1f] text-gray-600 text-sm">
          Effective {BUSINESS.effectiveDate}. We may update these terms; the date
          above always shows when this page last changed.
        </p>
      </div>
    </div>
  );
}
