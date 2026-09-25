import type { Metadata } from "next";
import Link from "next/link";
import { legalEmail } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Safety & Use",
  description:
    "How to use Kineticube targets safely: eye protection, safe distances, backer selection and range rules.",
};

/**
 * TWO THINGS ONLY LUKE CAN FILL IN — both deliberately left general rather
 * than guessed at, because a wrong number on a safety page is worse than no
 * number:
 *
 *  1. A MINIMUM SAFE DISTANCE, if the product has a tested one. The page
 *     currently defers to the backer's and ammunition's own minimums, which
 *     is true but weaker than a tested figure.
 *  2. WHAT THE POWDER IS. The site says non-toxic and biodegradable; if there
 *     is a datasheet, naming the material here is worth a lot to anyone
 *     worried about allergies or about shooting near a dog.
 *
 * Until those are known, nothing below asserts a fact that has not been
 * verified.
 */
export default function SafetyAndUse() {
  return (
    <>
      <h1>Safety &amp; Use</h1>
      <p className="lede">
        Kineticube targets are shot with live ammunition. Everything that makes
        shooting dangerous still applies when you are shooting at ours — read this
        before you use them.
      </p>

      <div className="callout">
        <p>
          <strong>
            Shooting is an inherently dangerous activity that can cause serious
            injury or death.
          </strong>{" "}
          Nothing on this page replaces formal firearms training, the rules of your
          range, or your own judgement. If you are new to shooting, get instruction
          from a qualified instructor first.
        </p>
      </div>

      <h2>The basics, every time</h2>
      <ul>
        <li>Treat every firearm as if it is loaded.</li>
        <li>Never point it at anything you are not willing to destroy.</li>
        <li>Keep your finger off the trigger until your sights are on target.</li>
        <li>Know your target and what is beyond it.</li>
      </ul>

      <h2>Eye protection is not optional</h2>
      <p>
        These targets are designed to burst on impact and throw coloured powder.
        <strong> Everyone on the firing line — shooters and spectators — must wear
        impact-rated eye protection</strong>, and hearing protection as normal.
      </p>
      <p>
        Powder can carry further than you expect, particularly in wind. If you wear
        contact lenses, be aware that fine powder and eyes are an unpleasant
        combination even behind glasses.
      </p>

      <h2>Distance and backers</h2>
      <p>
        Attach the target to a backer appropriate for what you are shooting, and
        observe the <strong>minimum safe distance for that backer and your
        ammunition</strong> — not for the target. A cube stuck to steel is a steel
        target, and all the usual rules about steel apply: minimum distances,
        angled plates in good condition, and no shooting at pitted or cratered
        faces.
      </p>
      <p>
        Hard backers at close range throw fragments and splash-back. If you are
        unsure of the safe distance for your setup, use a soft backer — cardboard
        or paper — or ask your range officer.
      </p>

      <h2>Check with your range first</h2>
      <p>
        Many indoor ranges allow paper targets only, and some outdoor ranges
        restrict anything that leaves residue. Ask before you bring these along.
        Turning up with something a range has not approved is a quick way to lose
        your welcome.
      </p>

      <h2>What these are not</h2>
      <ul>
        <li>
          <strong>Not a toy.</strong> Keep them away from children, and never use
          them with anything other than a firearm at a proper shooting location.
        </li>
        <li>
          <strong>Not explosive and not pyrotechnic.</strong> They contain no
          explosive or incendiary material — the burst is mechanical, caused by the
          impact itself. They are not a substitute for, and should not be treated
          like, any reactive product that does contain such materials.
        </li>
        <li>
          <strong>Not for indoor or recreational use away from a range.</strong>
        </li>
      </ul>

      <h2>Minors</h2>
      <p>
        Anyone under 18 using these must be directly supervised by a responsible
        adult, and must be wearing eye protection. Our products are sold to adults
        only — see our <Link href="/legal/terms">Terms of Sale</Link>.
      </p>

      <h2>Storage, cleanup and disposal</h2>
      <p>
        Store unopened packs somewhere cool and dry, out of reach of children. Avoid
        prolonged heat, which softens the adhesive.
      </p>
      <p>
        The shell is a biodegradable PHA material and the powder washes out with
        water, but please still pick up what you can and leave the range cleaner
        than you found it. &ldquo;It breaks down eventually&rdquo; is not a reason
        to leave a mess for the next shooter.
      </p>

      <h2>If something goes wrong</h2>
      <p>
        If a product behaves in a way you did not expect — the adhesive fails, a
        cube fragments oddly, anything at all — please stop using that pack and tell
        us at <a href={`mailto:${legalEmail()}`}>{legalEmail()}</a>. We would much
        rather hear about it than not.
      </p>

      <h2>Your responsibility</h2>
      <p>
        By using our products you accept the risks of shooting, and you are
        responsible for using them safely and lawfully — including obeying your
        range&rsquo;s rules and the laws where you are. Our{" "}
        <Link href="/legal/terms">Terms of Sale</Link> set out the limits of our
        liability.
      </p>
    </>
  );
}
