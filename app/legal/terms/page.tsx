import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, legalEmail, postalAddress } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you buy from Loadout Lab or use this site: ordering, pricing, payment, warranty, acceptable use and liability.",
};

export default function TermsOfService() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="lede">
        These terms apply when you buy from {BUSINESS.name} or use this site. They
        are written to be read, not to be skimmed past — if anything here is
        unclear, email us and we will explain it in plain words.
      </p>

      <h2>Who you are dealing with</h2>
      <p>
        {BUSINESS.entity}, {postalAddress()}. Contact:{" "}
        <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a>.
      </p>

      <h2>Who can buy</h2>
      <p>
        You must be <strong>18 or older</strong> to order, and able to enter a
        contract where you live. Our products are shooting accessories intended for
        use at a range or other lawful shooting location by adults.
      </p>

      <h2>Orders</h2>
      <p>
        Adding items to a cart is not a contract. Your order is an offer to buy,
        and it is accepted when we charge your card and send confirmation. Until
        then we may decline or cancel any order — for example if stock has run out
        between your order and our packing, if we cannot ship to your address, or if
        an order looks fraudulent. If we cancel, you are refunded in full.
      </p>
      <p>
        We make these in small batches and sell them as they are made. Stock shown
        on the site is live, but two people can still reach for the last pack at the
        same time. If that happens, you get your money back, not a backorder you did
        not ask for.
      </p>

      <h2>Prices and tax</h2>
      <p>
        Prices are in US dollars and exclude sales tax and shipping, both of which
        are calculated and shown at checkout before you pay.
      </p>
      <p>
        We try hard to keep prices accurate. If an obvious pricing error slips
        through — a decimal in the wrong place, say — we will contact you before
        charging anything, and you can confirm at the correct price or cancel.
      </p>

      <h2>Payment</h2>
      <p>
        Payments are processed by <strong>Stripe</strong>. Your card details are
        entered on Stripe&rsquo;s own checkout and go straight to them — they never
        pass through, and are never stored on, our systems. We see only the last
        four digits and the result.
      </p>

      <h2>Delivery, returns and refunds</h2>
      <p>
        Covered in full in our <Link href="/legal/shipping">Shipping Policy</Link>{" "}
        and <Link href="/legal/returns">Returns &amp; Refunds</Link>. Both form part
        of these terms.
      </p>

      <h2>Safe use</h2>
      <p>
        Our products are used in an inherently dangerous activity. Our{" "}
        <Link href="/legal/safety">Safety &amp; Use</Link> page forms part of these
        terms, and buying from us means you agree to follow it. If you are not
        willing to, please do not order.
      </p>

      <h2>What we promise about the product</h2>
      <p>
        We warrant that products arrive free from manufacturing defects and match
        their description. If one does not, tell us within{" "}
        {BUSINESS.damageReportDays} days and we will replace or refund it.
      </p>
      <p>
        Beyond that, products are supplied <strong>as is</strong>. We make no
        promise about accuracy gains, training outcomes, or results at any
        particular distance, surface or firearm. Reactive targets are a feedback
        tool, not a guarantee of anything.
      </p>

      <h2>Limits on our liability</h2>
      <p>
        To the fullest extent the law allows, our total liability arising from an
        order is limited to <strong>what you paid for that order</strong>. We are
        not liable for indirect or consequential losses — for example lost range
        time, travel costs, match fees, or damage to targets, backers or property
        that you shot at.
      </p>
      <p>
        Nothing here limits liability that cannot lawfully be limited, including for
        death or personal injury caused by our negligence, or for fraud. Some states
        do not allow certain exclusions, so parts of this section may not apply to
        you.
      </p>

      <h2>Your use of this site</h2>
      <p>
        You are welcome to browse, buy, share links, post photos of your own
        targets, and review us honestly — good or bad.
      </p>
      <p>What we ask you not to do:</p>
      <ul>
        <li>
          Interfere with the site — scraping it at volume, probing it for
          weaknesses, or trying to reach parts of it that are not public.
        </li>
        <li>
          Order under a false identity, with someone else&rsquo;s payment method,
          or for resale as your own product.
        </li>
        <li>
          Use the site for anything unlawful, or to arrange a purchase that would
          be unlawful where you are.
        </li>
      </ul>
      <p>
        If someone does any of that, we may refuse or cancel their orders and
        decline to serve them in future. We would rather never need this
        paragraph.
      </p>

      <h3>Our content</h3>
      <p>
        The text, photographs, video, logos, and the Kineticube and Loadout Lab
        names belong to us. Sharing and linking is fine; copying the site, passing
        our photography off as your own, or using our branding in a way that
        suggests we endorse you is not.
      </p>

      <h3>The site itself</h3>
      <p>
        We work to keep the site accurate and available, but we do not guarantee
        either. Stock counts, shipping estimates and prices can change, and
        occasionally something breaks. If an error on the site affects your order,
        tell us and we will put it right — that is a stronger promise than most
        uptime language, and an easier one to keep.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Texas, and the courts
        of Texas have jurisdiction over any dispute.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The version that applies to your order is the one
        published when you placed it. The effective date at the foot of this page
        shows when it last changed.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a>, or the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
    </>
  );
}
