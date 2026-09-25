import type { Metadata } from "next";
import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Site-wide defaults for the parent brand. Individual product pages override
// title and description with their own — /kineticube keeps selling Kineticube,
// this just stops every page claiming to be the product.
export const metadata: Metadata = {
  title: {
    default: "Loadout Lab — Firearms Training Accessories",
    template: "%s | Loadout Lab",
  },
  description:
    "Firearms training accessories built to get more out of every range trip. Reactive targets and training aids, made in Austin, Texas.",
  keywords: [
    "firearms training accessories",
    "training aids",
    "reactive targets",
    "shooting targets",
    "range gear",
    "loadout lab",
  ],
  openGraph: {
    title: "Loadout Lab — Firearms Training Accessories",
    description: "Make every round count. Training accessories for every level.",
    // Follows whatever domain the shop is actually served on, so moving it
    // doesn't leave link previews pointing at the old address.
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://loadoutlab.com",
    siteName: "Loadout Lab",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
