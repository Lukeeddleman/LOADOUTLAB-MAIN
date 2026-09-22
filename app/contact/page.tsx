import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Kineticube™',
  description: 'Get in touch with Kineticube. Order issues, bulk inquiries, wholesale, or general questions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-[family-name:var(--font-display)] font-black text-4xl tracking-wide">
            CONTACT
          </h1>
          <p className="text-gray-500 text-sm mt-1" style={{ lineHeight: '1.8' }}>We&apos;ll get back to you fast.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left — info */}
          <div>
            <h2 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-normal mb-4">
              GET IN TOUCH
            </h2>
            <p className="text-gray-400 text-sm mb-8" style={{ lineHeight: '1.85' }}>
              Order issues, bulk inquiries, wholesale, press — whatever it is, we want to hear it.
              Drop us a message and we&apos;ll get back to you within one business day.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-[#f05a1a] text-lg mt-0.5">✉</span>
                <div>
                  <p className="text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-label mb-1">EMAIL</p>
                  <a
                    href="mailto:support@kineticube.shop"
                    className="text-white text-sm hover:text-[#f05a1a] transition-colors"
                  >
                    support@kineticube.shop
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#f05a1a] text-lg mt-0.5">📍</span>
                <div>
                  <p className="text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-label mb-1">SHIPS FROM</p>
                  <p className="text-white text-sm">Austin, TX</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#f05a1a] text-lg mt-0.5">⏱</span>
                <div>
                  <p className="text-gray-500 text-xs font-[family-name:var(--font-display)] tracking-label mb-1">RESPONSE TIME</p>
                  <p className="text-white text-sm">Within 1 business day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
