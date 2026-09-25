/**
 * The B-roll that fills the Kineticube hero.
 *
 * It is `absolute` inside the hero section rather than `fixed` behind the
 * page, so it scrolls away with the hero instead of following the reader
 * down. Running it the full length of the page meant every section below had
 * to be dialled back to near-opaque to stay readable, which bought a ghost of
 * motion at the cost of the whole page's contrast.
 *
 * ── Why the video is not simply `h-full` on phones ──
 * The clip is 16:9 and `object-cover` crops whatever overflows the box. A
 * phone's hero box is narrow and very tall — and it grows taller still,
 * because the headline, paragraph, buttons and badges all stack — so cover
 * scales the clip to the box's HEIGHT and throws away most of its width.
 * At 390x900 only ~24% of the frame survives, and the cube itself spans
 * ~25%, so it gets clipped on both sides.
 *
 * Capping the video to a 2:3 box lets ~37.5% of the frame through. It stays
 * full-bleed horizontally, so it still reads as footage rather than a
 * letterboxed panel, and the black above and below is invisible against
 * black-background footage.
 *
 * 2:3 is close to the ceiling, not a taste call. Sampling the clip, the
 * widest a cube ever reaches is 36.5% of the frame width from centre — so
 * below about 601px of box height the cube starts getting clipped again,
 * which is the bug this was fixing in the first place. Anything taller than
 * 2:3 buys a bigger picture by re-breaking it. If this still reads small,
 * the fix is a tighter re-crop of the source, not a taller box.
 *
 * Desktop is unaffected: from `md` up the box is wide enough that cover
 * shows the whole frame anyway.
 *
 * Every attribute on the <video> is load-bearing for autoplay. Browsers only
 * allow it when the video is BOTH muted and inline — drop `playsInline` and
 * iOS hijacks it into the fullscreen player instead of playing in place.
 * The file is encoded silent, but `muted` still has to be declared, because
 * the browser decides from the attribute, not the audio track.
 *
 * Paints beneath its siblings by document order: the scrim and the hero copy
 * both come after it in the section, so neither needs a z-index.
 */
export default function HeroVideo() {
  // Shared so the still fallback crops identically to the video it replaces.
  const fit = "w-full object-cover aspect-[2/3] md:aspect-auto md:h-full";

  return (
    <div
      className="absolute inset-0 bg-black flex items-center justify-center"
      aria-hidden="true"
    >
      <video
        className={`video-backdrop ${fit}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/kineticube-broll-poster.jpg"
      >
        <source src="/kineticube-broll.mp4" type="video/mp4" />
      </video>

      {/* Reduced-motion fallback. The stylesheet swaps which of these two is
          displayed; a `poster` alone would not cover it, because a hidden
          video paints no poster. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/kineticube-broll-poster.jpg" alt="" className={`hero-still ${fit}`} />
    </div>
  );
}
