import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, legalEmail, postalAddress } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Loadout Lab collects, who it goes to, and how long we keep it. No analytics, no ad pixels, no tracking cookies.",
};

/**
 * Written from what the code actually does, not from a template. Every claim
 * below is checkable against this repo — the subprocessor list is the set of
 * services the order pipeline really calls, the "no tracking" claim is true
 * because there is no analytics or pixel anywhere in the app, and the waitlist
 * deletion claim matches clearWaitlist() being called after the restock send.
 *
 * If any of that changes, this page has to change in the same commit.
 */
export default function PrivacyPolicy() {
  return (
    <>
      <h1>Privacy</h1>
      <p className="lede">
        We collect what is needed to take your order and get it to your door, and
        nothing else. There is no analytics on this site, no advertising pixel, and
        no tracking cookie. We do not sell your data — to anyone, ever.
      </p>

      <h2>What we collect</h2>

      <h3>When you order</h3>
      <ul>
        <li>Your name and email address</li>
        <li>Your shipping address</li>
        <li>What you ordered, and how much you paid</li>
      </ul>
      <p>
        <strong>We never see your card number.</strong> Payment happens on
        Stripe&rsquo;s own checkout page. Your card details go directly to Stripe
        and are never transmitted through or stored on our systems.
      </p>

      <h3>When you join a restock list</h3>
      <p>
        Just your email address. It is stored on its own, with no name and no link
        to any order, for the single purpose of telling you when that product is
        back. <strong>We delete the list as soon as that email goes out</strong> —
        it is a one-time notice, not a mailing list, and you do not have to
        unsubscribe from anything.
      </p>

      <h3>When you use the contact form</h3>
      <p>
        Your name, email, subject and message are emailed straight to us. They are
        not saved to any database — they live in our inbox like any other email.
      </p>

      <h3>Automatically</h3>
      <p>
        Our host keeps standard server logs — IP address, browser type, which page
        was requested — for a short period, for security and diagnostics. We do not
        build profiles from them and we do not use them for advertising.
      </p>

      <h2>Cookies</h2>
      <p>
        This site sets <strong>no cookies for customers</strong>. There is a single
        session cookie used by the owner to log into the admin area, which you will
        never encounter.
      </p>
      <p>
        There is no Google Analytics, no Meta pixel, no advertising or
        cross-site tracking of any kind on this site.
      </p>

      <h2>Who else gets your information</h2>
      <p>
        Running a shop means a handful of specialist services touch parts of your
        order. Each gets only what it needs to do its job:
      </p>
      <ul>
        <li>
          <strong>Stripe</strong> — payment processing and sales tax. Receives your
          payment details, email and billing information.
        </li>
        <li>
          <strong>Shippo</strong> and <strong>USPS</strong> — shipping rates and the
          label itself. Receive your name, address and email for tracking updates.
        </li>
        <li>
          <strong>Resend</strong> — sends our emails. Receives your email address
          and the contents of the message.
        </li>
        <li>
          <strong>Upstash</strong> — stores stock counts and restock-list emails.
        </li>
        <li>
          <strong>PrintNode</strong> — sends the finished shipping label to our
          printer. Receives the label, which has your address on it.
        </li>
        <li>
          <strong>Vercel</strong> — hosts the site and serves these pages.
        </li>
      </ul>
      <p>
        We may also disclose information where the law requires it. That is the
        complete list — there is no advertising network, data broker, or
        &ldquo;marketing partner&rdquo; in it.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          <strong>Order records</strong> — kept as long as needed for tax, accounting
          and warranty purposes, which in the US generally means several years.
        </li>
        <li>
          <strong>Restock emails</strong> — deleted the moment the notification is
          sent.
        </li>
        <li>
          <strong>Contact messages</strong> — kept in our inbox while relevant.
        </li>
      </ul>

      <h2>Your choices</h2>
      <p>
        Email <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> and we will, at
        your request, tell you what we hold about you, correct it, or delete it. We
        will not charge you for it or make you jump through hoops.
      </p>
      <p>
        One limit worth being straight about: we cannot delete records we are
        legally required to keep, such as completed transactions needed for tax
        purposes.
      </p>
      <p>
        Depending on where you live you may have additional rights under laws such
        as the California Consumer Privacy Act. We extend the same access and
        deletion rights above to everyone regardless of state, which is simpler than
        checking.
      </p>

      <h2>Children</h2>
      <p>
        This site is not directed at children, and our products are sold to adults
        only. We do not knowingly collect information from anyone under 18. If you
        believe we have, contact us and we will delete it.
      </p>

      <h2>Security</h2>
      <p>
        The site runs over HTTPS, payment is handled entirely by Stripe, and access
        to order data is limited to the owner. No system is perfectly secure, but
        the most sensitive thing about your order — your card — is never in our
        hands to lose.
      </p>

      <h2>Changes</h2>
      <p>
        If we start collecting something new, or add a service that receives your
        data, this page changes at the same time. The effective date below shows
        when it last did.
      </p>

      <h2>Contact</h2>
      <p>
        {BUSINESS.entity}, {postalAddress()}
        <br />
        <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> or the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
    </>
  );
}
