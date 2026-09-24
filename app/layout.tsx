import type { Metadata } from "next";
import { Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "Kineticube™ — Reactive Powder Targets",
  description:
    "Stick it. Shoot it. See it. Kineticube reactive powder targets give you instant colorful visual feedback on every shot. Made in the USA.",
  keywords: ["reactive targets", "powder targets", "shooting targets", "range targets", "kineticube"],
  openGraph: {
    title: "Kineticube™ — Reactive Powder Targets",
    description: "Instant colorful visual feedback on every shot.",
    // Follows whatever domain the shop is actually served on, so moving it
    // doesn't leave link previews pointing at the old address.
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://kineticube.shop",
    siteName: "Kineticube",
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
      </body>
    </html>
  );
}
