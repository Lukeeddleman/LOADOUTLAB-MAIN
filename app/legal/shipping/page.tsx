import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, legalEmail } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "How Loadout Lab orders ship: USPS from Kyle, Texas, live-calculated rates, processing times and tracking.",
};

export default function ShippingPolicy() {
  return (
    <>
      <h1>Shipping</h1>
      <p className="lede">
        Everything ships USPS from {BUSINESS.city}, {BUSINESS.state}. Rates are
        calculated live at checkout from your actual address — no flat-rate
        padding, no handling fee.
      </p>

      <h2>Where we ship</h2>
      <p>
        We currently ship to addresses within the <strong>United States only</strong>,
        including PO Boxes. We are not set up for international orders yet.
      </p>

      <h2>Processing time</h2>
      <p>
        Orders are packed and handed to USPS within{" "}
        <strong>
          {BUSINESS.processingDaysMin}–{BUSINESS.processingDaysMax} business days
        </strong>{" "}
        of payment clearing. Orders placed on a weekend or a federal holiday start
        counting from the next business day.
      </p>
      <p>
        If something is going to take longer than that — a restock running behind,
        or a run of orders larger than usual — we will email you rather than let you
        wonder.
      </p>

      <h2>Shipping cost</h2>
      <p>
        Your shipping cost is quoted by USPS in real time, based on the weight and
        size of your specific order and where it is going. You see the exact figure
        before you pay. We do not add a handling charge on top.
      </p>

      <h2>Delivery estimates</h2>
      <p>
        Transit times are USPS estimates, not guarantees. Ground Advantage typically
        runs <strong>2–5 business days</strong> within the continental US, and longer
        to Alaska, Hawaii and US territories.
      </p>
      <p>
        Once a parcel is with USPS, its speed is in their hands. Weather, holidays
        and carrier backlogs all affect it, and none of them are visible to us
        beyond the same tracking page you have.
      </p>

      <h2>Tracking</h2>
      <p>
        You will get a confirmation email when you order, and USPS tracking as soon
        as the label is scanned. If tracking has not moved for several days, email
        us at <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> and we will chase
        it with you.
      </p>

      <h2>Address accuracy</h2>
      <p>
        We ship to the address entered at checkout, exactly as entered. Please check
        it before paying — particularly apartment and unit numbers, which are the
        single most common cause of a parcel going astray.
      </p>
      <p>
        If a parcel is returned to us as undeliverable because of an incorrect or
        incomplete address, we will happily resend it once you have confirmed the
        correct address, but the second postage is chargeable. If we got the address
        wrong, we cover it.
      </p>

      <h2>Lost, damaged or stolen</h2>
      <p>
        If your order arrives damaged, or tracking shows delivered and it is not
        there, contact us within <strong>{BUSINESS.damageReportDays} days</strong> of
        the delivery date. Photographs help enormously with damage claims. We will
        either replace the order or refund it — see{" "}
        <Link href="/legal/returns">Returns &amp; Refunds</Link>.
      </p>
      <p>
        We would rather sort it out than argue about whose fault the postal service
        is. Just tell us what happened.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> or use the{" "}
        <Link href="/contact">contact form</Link>. A real person reads both.
      </p>
    </>
  );
}
