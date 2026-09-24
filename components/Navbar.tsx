"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur border-b border-[#1a1a1a]">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-16 2xl:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Kineticube logo" width={36} height={36} className="object-contain" />
          <span
            className="font-[family-name:var(--font-display)] font-black text-xl tracking-wider text-white group-hover:text-[#f05a1a] transition-colors"
          >
            KINETICUBE
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors">
            HOME
          </Link>
          <Link href="/kineticube/shop" className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors">
            SHOP
          </Link>
          <Link href="/kineticube#how-it-works" className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors">
            HOW IT WORKS
          </Link>
          <Link href="/kineticube/training" className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors">
            TRAINING
          </Link>
          <Link href="/contact" className="text-sm font-[family-name:var(--font-display)] font-semibold tracking-label text-gray-300 hover:text-white transition-colors">
            CONTACT
          </Link>
          <Link
            href="/kineticube/shop"
            className="bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-bold tracking-label text-sm px-5 py-2 transition-colors"
          >
            BUY NOW
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
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
          <Link href="/" onClick={() => setOpen(false)} className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white">HOME</Link>
          <Link href="/kineticube/shop" onClick={() => setOpen(false)} className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white">SHOP</Link>
          <Link href="/kineticube#how-it-works" onClick={() => setOpen(false)} className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white">HOW IT WORKS</Link>
          <Link href="/kineticube/training" onClick={() => setOpen(false)} className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white">TRAINING</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="font-[family-name:var(--font-display)] tracking-widest text-gray-300 hover:text-white">CONTACT</Link>
          <Link href="/kineticube/shop" onClick={() => setOpen(false)} className="bg-[#f05a1a] text-white font-[family-name:var(--font-display)] font-bold tracking-widest text-center py-2">BUY NOW</Link>
        </div>
      )}
    </nav>
  );
}
