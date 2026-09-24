import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed — Kineticube™',
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-normal mb-4">
          ORDER CONFIRMED
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          Your Kineticubes are on the way. Check your email for a receipt — we&apos;ll send tracking once your order ships.
        </p>
        <p className="text-gray-600 text-sm mb-10">
          Questions?{' '}
          <a
            href="mailto:support@kineticube.shop"
            className="text-[#f05a1a] hover:underline"
          >
            support@kineticube.shop
          </a>
        </p>
        <Link
          href="/kineticube/shop"
          className="inline-block bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-black tracking-widest px-10 py-4 transition-colors"
        >
          BACK TO SHOP
        </Link>
      </div>
    </div>
  );
}
