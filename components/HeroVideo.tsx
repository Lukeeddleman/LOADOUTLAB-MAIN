/**
 * The B-roll that fills the Kineticube hero.
 *
 * It is `absolute` inside the hero section rather than `fixed` behind the
 * page, so it scrolls away with the hero instead of following the reader
 * down. Running it the full length of the page meant every section below had
 * to be dialled back to near-opaque to stay readable, which bought a ghost of
 * motion at the cost of the whole page's contrast. The footage earns its
 * keep on the landing screen and then gets out of the way.
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
  return (
    <div
      className="absolute inset-0 bg-[#0d0d0d] bg-cover bg-center"
      // Doubles as the reduced-motion fallback: the stylesheet hides the
      // video for anyone who asked for less movement, leaving this frame.
      style={{ backgroundImage: "url(/kineticube-broll-poster.jpg)" }}
      aria-hidden="true"
    >
      <video
        className="video-backdrop h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/kineticube-broll-poster.jpg"
      >
        <source src="/kineticube-broll.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
