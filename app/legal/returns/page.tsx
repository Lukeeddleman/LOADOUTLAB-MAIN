import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, legalEmail } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Loadout Lab's return and refund policy: 30 days on unopened product, free replacement for damaged or incorrect orders.",
};

export default function ReturnsPolicy() {
  return (
    <>
      <h1>Returns &amp; Refunds</h1>
      <p className="lede">
        If we got your order wrong or it turned up damaged, we fix it at our cost.
        If you simply changed your mind, you have {BUSINESS.returnWindowDays} days
        to send unopened product back.
      </p>

      <h2>If we got it wrong</h2>
      <p>
        Wrong item, missing item, or damage in transit: email{" "}
        <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> within{" "}
        <strong>{BUSINESS.damageReportDays} days</strong> of delivery with your order
        number and a photo. We will send a replacement or refund you in full,
        whichever you prefer. You will not pay return postage, and in most cases we
        will not ask for the original back.
      </p>

      <h2>If you changed your mind</h2>
      <p>
        You can return <strong>unopened, unused</strong> packs within{" "}
        <strong>{BUSINESS.returnWindowDays} days</strong> of delivery for a refund of
        the product price.
      </p>
      <ul>
        <li>The clamshell must be sealed and undamaged.</li>
        <li>Return postage is yours unless the return is our error.</li>
        <li>
          Original shipping is not refunded — USPS has already been paid for
          carrying it.
        </li>
      </ul>

      <h2>What we cannot take back</h2>
      <p>
        Kineticube targets are single-use by design: a cube is consumed the moment
        it is hit. Once a pack is opened we have no way to confirm what is left or
        to sell it on, so <strong>opened packs cannot be returned</strong> for a
        change of mind.
      </p>
      <p>
        This is not a get-out. If an opened pack was genuinely defective — the
        adhesive failed, a cube did not react, the contents were wrong — that is a
        fault, not a change of mind, and it is covered above. Tell us what happened.
      </p>

      <h2>Starting a return</h2>
      <p>
        Email <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a> with your order
        number and what you would like to happen. Please do not post anything back
        before contacting us — we will confirm the return address first, so your
        parcel does not arrive unannounced and untraceable.
      </p>

      <h2>Refund timing</h2>
      <p>
        Approved refunds go back to the original payment method. We issue them
        within <strong>2 business days</strong> of approving the return; your bank
        then typically takes <strong>5–10 business days</strong> to post it. That
        second half is outside our control and outside our view.
      </p>

      <h2>Cancelling an order</h2>
      <p>
        If your order has not shipped yet, we can usually cancel it outright — email
        us as soon as you can. Once a label has been printed the parcel is moving,
        and it becomes a return.
      </p>

      <h2>Problems with a delivery</h2>
      <p>
        Lost parcels, tracking that stalls, and deliveries marked complete that never
        arrived are covered in our <Link href="/legal/shipping">Shipping Policy</Link>.
      </p>

      <h2>Before you file a dispute</h2>
      <p>
        If something has gone wrong, please email us first. We are a small operation
        in {BUSINESS.city}, {BUSINESS.state} and we would genuinely rather make it
        right than have you fight your bank for a $13 pack of targets. We answer
        every message.
      </p>
    </>
  );
}
