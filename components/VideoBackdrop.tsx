/**
 * The B-roll layer that sits behind the whole Kineticube page.
 *
 * It is `fixed`, not one video per section, so the content scrolls over a
 * single stationary layer. That is what makes it read as a backdrop rather
 * than a banner — and it means the browser decodes one video, not five.
 *
 * `-z-10` puts it behind every section while still painting above the body
 * background, so the sections above it control how much shows through: the
 * hero is transparent and lets it play at full strength, everything below
 * sits on a near-opaque panel and only lets a ghost of motion through.
 *
 * Every attribute on the <video> is load-bearing for autoplay. Browsers only
 * allow it when the video is BOTH muted and inline — drop `playsInline` and
 * iOS hijacks it into the fullscreen player instead of playing in place.
 * The file is encoded silent, but `muted` still has to be declared, because
 * the browser decides from the attribute, not the audio track.
 */
export default function VideoBackdrop() {
  return (
    <div
      className="fixed inset-0 -z-10 bg-[#0d0d0d] bg-cover bg-center"
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
