import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Training — KinetiCube™ Reactive Powder Targets",
  description: "Drills, courses of fire, and range tips designed around KinetiCube reactive targets. One shot. Make it count.",
};

const courses = [
  {
    name: "The Standard Six",
    difficulty: "Beginner",
    difficultyColor: "text-green-400 border-green-400/40 bg-green-400/10",
    packs: 1,
    rounds: 6,
    setup: "Place all 6 cubes in a horizontal line at 7 yards, roughly 6 inches apart.",
    execution: [
      "Start from low ready or holster (your call).",
      "Engage left to right — one shot per cube.",
      "Goal: all 6 hits, smooth transitions, sub-10 seconds.",
    ],
    focus: "Target transitions · Trigger discipline · Consistency",
    tip: "Don't rush the first shot trying to make up time. A miss means you're done with that cube — and you know it.",
  },
  {
    name: "The Mozambique",
    difficulty: "Intermediate",
    difficultyColor: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
    packs: 1,
    rounds: 3,
    setup: "Place 2 cubes side by side at chest height, 1 cube centered above them at head height. 5–7 yards.",
    execution: [
      "From low ready or draw: two shots to the body cubes (one each).",
      "Assess, then one controlled shot to the head cube.",
      "All three cubes should detonate. Any miss is immediately obvious.",
    ],
    focus: "Failure drill · Shot placement · Controlled follow-up",
    tip: "The head cube will tell you everything about your trigger pull. Rushing it shows.",
  },
  {
    name: "The Gauntlet",
    difficulty: "Advanced",
    difficultyColor: "text-red-400 border-red-400/40 bg-red-400/10",
    packs: 1,
    rounds: 6,
    setup: "Place one cube each at 5, 7, 10, 15, 20, and 25 yards on the same line of fire.",
    execution: [
      "Engage from closest to farthest — one shot per cube.",
      "No do-overs. A miss at 25 yards stays a miss.",
      "Run it cold for an honest look at your actual skill level.",
    ],
    focus: "Marksmanship · Distance adaptability · Mental discipline",
    tip: "Most shooters are humbled at 20+ yards. That's the point. The 25-yard cube is your benchmark.",
  },
];

const drills = [
  {
    name: "Cold Shot",
    icon: "🎯",
    cubes: 1,
    description:
      "One cube. Any distance over 10 yards. No warm-up — just draw and send it. This is the purest read of where your skills actually are, not where they are after 50 rounds of warming up.",
    tip: "Run this first, every range session. You might not like what you find. That's the whole idea.",
  },
  {
    name: "The Box",
    icon: "⬜",
    cubes: 4,
    description:
      "Set 4 cubes in a box formation — roughly 18 inches apart on each side. Engage in a non-linear pattern: top-left → bottom-right → top-right → bottom-left. Adds complexity to target transitions by forcing diagonal movement.",
    tip: "Call your next target before your eyes leave the current one. Hesitation between cubes is where time disappears.",
  },
  {
    name: "Reload Under Pressure",
    icon: "🔄",
    cubes: 3,
    description:
      "Place 3 cubes at 7 yards. Shoot the first two, perform a tactical reload, then engage the third. The cube waiting on you is better pressure than a timer.",
    tip: "Keep your eyes on the remaining cube during the reload. Tunnel vision on the gun is a bad habit this drill exposes fast.",
  },
  {
    name: "Strong / Weak",
    icon: "💪",
    cubes: 6,
    description:
      "Place 6 cubes in a line. Shoot the first 3 dominant hand only, then transition to support hand only for the last 3. No cheating — full grip with one hand.",
    tip: "Most shooters have a much weaker support hand than they think. These cubes don't lie.",
  },
  {
    name: "The Walkback",
    icon: "↩️",
    cubes: 6,
    description:
      "Place one cube each at 5, 7, 10, 15, 20, and 25 yards. Unlike The Gauntlet, shoot farthest to closest — you're walking back into your comfort zone, not out of it. Builds confidence through earned marksmanship.",
    tip: "If you're missing the 25-yard cube consistently, your fundamentals are breaking down at distance. Slow down and find the trigger.",
  },
  {
    name: "The Draw",
    icon: "⚡",
    cubes: 1,
    description:
      "One cube at 5–7 yards. The entire drill is your draw stroke. Use a shot timer and obsess over your split between the start beep and the detonation. Clean draw, no muzzle wobble, acceptable sight picture — then press.",
    tip: "A fast miss is worthless. Measure your draw to a hit, not your draw to a shot.",
  },
];

const tips = [
  {
    icon: "📍",
    title: "Placement Height",
    body: "For pistol drills, place cubes at chest/center-mass height (roughly 4–5 feet off the ground). For rifle, a little lower — center-mass on a standing silhouette. Head shots go higher, obviously.",
  },
  {
    icon: "📏",
    title: "Distance by Platform",
    body: "Pistol: 5–15 yards is the sweet spot. Rifle/carbine: 10–50 yards. The further you go, the more honest the target gets. Start closer than you think you need to.",
  },
  {
    icon: "⚠️",
    title: "High-Velocity Cartridges",
    body: "KinetiCubes perform best with slower or heavier projectiles. High-velocity rounds like 5.56 NATO may pass through before the cube can fully react — you might need a second hit. This is physics, not a defect.",
  },
  {
    icon: "📐",
    title: "Surface Tips",
    body: "The 3M adhesive sticks best to smooth, flat, dry surfaces — cardboard, painted wood, steel plates, range barrels. Rough or wet surfaces reduce hold. Press firmly for 30 seconds after placing.",
  },
  {
    icon: "🧠",
    title: "Train the Mindset",
    body: "The one-shot nature of KinetiCubes is a feature, not a limitation. Every missed cube is an immediate, unambiguous piece of feedback. Paper targets let you rationalize. These don't.",
  },
  {
    icon: "📸",
    title: "Track Your Progress",
    body: "Keep a range log. Date, distance, drill, hit rate. The cubes reset your feedback loop to zero every session — make sure you're capturing the data somewhere.",
  },
];

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">

      {/* Header */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] py-14">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[#f05a1a] font-[family-name:var(--font-display)] tracking-widest text-xs mb-4">
            RANGE GUIDE
          </p>
          <h1 className="font-[family-name:var(--font-display)] font-black text-5xl md:text-6xl tracking-wide mb-5">
            TRAINING
          </h1>
          <p className="text-gray-400 text-base max-w-2xl" style={{ lineHeight: "1.8" }}>
            Drills and courses of fire built around the way KinetiCubes work.
          </p>
        </div>
      </div>

      {/* Philosophy callout */}
      <div className="border-b border-[#1a1a1a] bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="border-l-4 border-[#f05a1a] pl-6">
            <p className="font-[family-name:var(--font-display)] font-black text-2xl md:text-3xl tracking-normal text-white mb-2">
              Every cube gets one shot.
            </p>
            <p className="font-[family-name:var(--font-display)] font-black text-2xl md:text-3xl tracking-normal text-[#f05a1a]">
              That&apos;s not a limitation — that&apos;s the point.
            </p>
            <p className="text-gray-500 text-sm mt-5 max-w-2xl" style={{ lineHeight: "1.9" }}>
              Paper targets let you be sloppy. A ragged hole tells you nothing about which shot was the miss.
              KinetiCubes give you instant, unambiguous feedback on every single round. Hit it and it&apos;s gone.
              Miss it and everyone on the line knows. That pressure is the training.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">

        {/* Courses of Fire */}
        <section>
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-wide mb-2">
              COURSES OF FIRE
            </h2>
            <p className="text-gray-500 text-sm" style={{ lineHeight: "1.8" }}>
              Full structured sessions. Run these start to finish.
            </p>
          </div>

          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.name} className="bg-[#111111] border border-[#1a1a1a] p-7 md:p-9">

                {/* Title row */}
                <div className="flex flex-wrap items-start gap-3 mb-6">
                  <h3 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-normal">
                    {course.name}
                  </h3>
                  <span className={`text-xs font-[family-name:var(--font-display)] tracking-widest border px-2 py-0.5 mt-1 ${course.difficultyColor}`}>
                    {course.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div>
                    <p className="text-gray-600 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">PACKS</p>
                    <p className="text-white font-bold text-lg">{course.packs}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">ROUNDS</p>
                    <p className="text-white font-bold text-lg">{course.rounds}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-[family-name:var(--font-display)] tracking-widest mb-1">FOCUS</p>
                    <p className="text-white font-bold text-sm" style={{ lineHeight: "1.6" }}>{course.focus}</p>
                  </div>
                </div>

                {/* Setup */}
                <div className="mb-5">
                  <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-2">SETUP</p>
                  <p className="text-gray-300 text-sm" style={{ lineHeight: "1.85" }}>{course.setup}</p>
                </div>

                {/* Execution */}
                <div className="mb-6">
                  <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-gray-500 mb-3">HOW TO RUN IT</p>
                  <ol className="space-y-2">
                    {course.execution.map((step, i) => (
                      <li key={i} className="flex gap-3 text-gray-300 text-sm" style={{ lineHeight: "1.85" }}>
                        <span className="text-[#f05a1a] font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tip */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-5 py-4">
                  <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-[#f05a1a] mb-2">PIP&apos;S TIP</p>
                  <p className="text-gray-400 text-sm" style={{ lineHeight: "1.85" }}>{course.tip}</p>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* Drills */}
        <section>
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-wide mb-2">
              DRILL LIBRARY
            </h2>
            <p className="text-gray-500 text-sm" style={{ lineHeight: "1.8" }}>
              Plug these into any range session. Mix and match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {drills.map((drill) => (
              <div key={drill.name} className="bg-[#111111] border border-[#1a1a1a] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{drill.icon}</span>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] font-black text-xl tracking-normal">
                      {drill.name}
                    </h3>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {drill.cubes} cube{drill.cubes !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-5" style={{ lineHeight: "1.85" }}>{drill.description}</p>
                <div className="border-t border-[#1a1a1a] pt-4">
                  <p className="text-xs font-[family-name:var(--font-display)] tracking-widest text-[#f05a1a] mb-2">TIP</p>
                  <p className="text-gray-500 text-xs" style={{ lineHeight: "1.85" }}>{drill.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section>
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-wide mb-2">
              SETUP & TIPS
            </h2>
            <p className="text-gray-500 text-sm" style={{ lineHeight: "1.8" }}>
              Get the most out of every pack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map((tip) => (
              <div key={tip.title} className="bg-[#111111] border border-[#1a1a1a] p-6">
                <div className="text-2xl mb-4">{tip.icon}</div>
                <h4 className="font-[family-name:var(--font-display)] font-bold tracking-widest text-sm text-white mb-3">
                  {tip.title.toUpperCase()}
                </h4>
                <p className="text-gray-500 text-sm" style={{ lineHeight: "1.85" }}>{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#1a1a1a] pt-14 text-center">
          <h3 className="font-[family-name:var(--font-display)] font-black text-3xl tracking-wide mb-4">
            READY TO RUN IT?
          </h3>
          <p className="text-gray-500 text-sm mb-10 max-w-md mx-auto" style={{ lineHeight: "1.8" }}>
            One pack. Six shots. Zero excuses.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#f05a1a] hover:bg-[#c44a12] text-white font-[family-name:var(--font-display)] font-black tracking-widest text-lg px-12 py-4 transition-colors"
          >
            GET YOUR KINETICUBES →
          </Link>
        </section>

      </div>
    </div>
  );
}
