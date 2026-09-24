"use client";
import Link from "next/link";
import { useState } from "react";

/**
 * Site-wide navigation for Loadout Lab.
 *
 * Deliberately short. This is the parent brand's nav, so it carries the company
 * and its products — not one product's internal sections. Kineticube's own
 * links (how it works, the drills) live on the Kineticube pages, which keeps
 * this from growing a row per product as the shelf fills up.
 *
 * The wordmark is text rather than the logo image: the logo has the words built
 * into it at 3:2, so at navbar height they'd be too small to read.
 */

const links = [
  { href: "/kineticube", label: "KINETICUBE" },
  { href: "/contact", label: "CONTACT" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur border-b border-[#1a1a1a]">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-16 2xl:h-20">
        <Link href="/" className="flex items-center group">
          <span className="font-[family-name:var(--font-display)] font-black text-xl tracking-wider text-white group-hover:text-[#f05a1a] transition-colors">
            LOADOUT LAB
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/kineticube/shop"
            className="bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-bold tracking-label text-sm px-5 py-2 transition-colors"
          >
            SHOP
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 6h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 18h16" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-[#2a2a2a] px-4 py-4 flex flex-col gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/kineticube/shop"
            onClick={() => setOpen(false)}
            className="bg-[#f05a1a] text-white font-[family-name:var(--font-display)] font-bold tracking-widest text-center py-2"
          >
            SHOP
          </Link>
        </div>
      )}
    </nav>
  );
}
