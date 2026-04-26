/**
 * AcademyInfoPage — public-facing "About the Academy" page at /academy-info
 *
 * Explains what the BTB Online Academy is, who it's for, what's inside,
 * how it works, and how to get access. Visible to anyone — no login required.
 * Links to /login (which redirects to /boys/players or /girls/players post-auth).
 */

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SEO } from "@/components/shared/SEO"
import {
  ArrowRight,
  GraduationCap,
  Swords,
  Crown,
  Users,
  Trophy,
  BookOpen,
  Video,
  Target,
  Brain,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────

const stats = [
  { num: "90+",  label: "Academy Lessons" },
  { num: "6",    label: "Position Tracks" },
  { num: "3",    label: "Age Tiers" },
  { num: "4",    label: "Coach Modules" },
]

const pillars = [
  {
    icon: Swords,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "The Game",
    desc: "Fundamentals, positions, lacrosse IQ, offensive systems, defensive slides, film study, and college recruiting. The technical knowledge to compete at the next level.",
  },
  {
    icon: Crown,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Leadership",
    desc: "The habits, mindset, and character of leaders. The BTB Standard, mental game, captaincy, elite preparation, and how to compete when things get hard.",
  },
  {
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Team",
    desc: "What makes teams win. Trust, sacrifice, chemistry, accountability, and what it means to be part of something bigger than yourself.",
  },
]

const positions = [
  { icon: Target,    label: "Attack",   desc: "Dodging, feeding, playing X, finishing under pressure." },
  { icon: Zap,       label: "Midfield", desc: "Transition, rides and clears, off-ball defense, conditioning." },
  { icon: Shield,    label: "Defense",  desc: "On-ball technique, slides, communication, clearing." },
  { icon: Users,     label: "Goalie",   desc: "Arc positioning, mindset, communication, leading from the crease." },
  { icon: Brain,     label: "FOGO",     desc: "Clamp mechanics, counters, scouting, the mental game of faceoffs." },
  { icon: BookOpen,  label: "All",      desc: "Every lesson with no filter — the full curriculum in sequence." },
]

const tiers = [
  {
    label: "Youth",
    ages: "Ages 8–10",
    gradYears: "Grad Years 2034–2036",
    color: "from-emerald-500 to-emerald-700",
    points: [
      "Cradling, catching, and throwing — the actual mechanics",
      "Where to be on the field and why",
      "Being a great teammate and what the BTB Standard means",
      "Why teams win and how you fit into them",
    ],
  },
  {
    label: "Middle School",
    ages: "Ages 11–13",
    gradYears: "Grad Years 2031–2033",
    color: "from-blue-500 to-blue-700",
    points: [
      "Positions and their roles — where you fit on the field",
      "Dodging fundamentals and defensive footwork",
      "Reading the field and making smart decisions under pressure",
      "Mental toughness, leading your team, and owning your role",
    ],
  },
  {
    label: "High School",
    ages: "Ages 14–17",
    gradYears: "Grad Years 2027–2030",
    color: "from-[#D22630] to-[#8B0000]",
    points: [
      "Advanced offensive sets and team defense slide packages",
      "How to watch film like a coach and build real lacrosse IQ",
      "The college recruiting process — what actually moves the needle",
      "Elite mental game, captaincy, and the legacy you leave",
    ],
  },
]

const howItWorks = [
  {
    num: "01",
    title: "Request Access",
    desc: "BTB Academy is for rostered BTB players and coaches. Apply for your program, register, and you'll receive an invitation link from BTB.",
  },
  {
    num: "02",
    title: "Create Your Account",
    desc: "Click your invite link to set up a secure Netlify Identity account. Takes 60 seconds. Your progress is tied to your account — not your device.",
  },
  {
    num: "03",
    title: "Pick Your Track",
    desc: "Log in and land on your Academy hub. Select your age tier, choose your position track (Attack, Midfield, Defense, Goalie, or FOGO), and start your first lesson.",
  },
  {
    num: "04",
    title: "Learn, Watch, Prove It",
    desc: "Each lesson has a coaching video from elite sources, written content, and a quiz you must pass to advance. No skipping. No guessing and moving on.",
  },
  {
    num: "05",
    title: "Earn the Wall of Fame",
    desc: "Finish every lesson in your age tier and you earn a spot on the BTB Wall of Fame — visible to every player and coach in the program.",
  },
]

const coaches = [
  {
    num: "01",
    title: "BTB Coaching Philosophy",
    desc: "What BTB stands for, the standard, and how to build a culture that produces great players and great people.",
  },
  {
    num: "02",
    title: "Practice Planning and Design",
    desc: "The 16-week development cycle, how to write a BTB practice plan, and what separates intentional practice from wasted time.",
  },
  {
    num: "03",
    title: "Film Study for Coaches",
    desc: "How to run a film session, what to look for, how to give feedback that sticks, and how to build lacrosse IQ in your players.",
  },
  {
    num: "04",
    title: "Player Development and Communication",
    desc: "How to coach different personality types, build trust, give honest feedback, and develop leaders within your program.",
  },
]

const faqs = [
  {
    q: "Who has access to BTB Academy?",
    a: "BTB Academy is invite-only for rostered players and credentialed coaches. If you are currently registered with a BTB team, you are eligible. Contact info@bethebestli.com to request your invite link.",
  },
  {
    q: "Does my progress save across devices?",
    a: "Yes. Your progress is stored in Airtable and tied to your account — not your browser. Log in from your phone, tablet, or laptop and your progress is always current.",
  },
  {
    q: "Can I skip lessons or go out of order?",
    a: "Within each pillar, lessons unlock sequentially — you must pass the quiz to advance. This isn't arbitrary. It mirrors how we coach: fundamentals before systems, repetition before execution.",
  },
  {
    q: "What happens if I get a quiz question wrong?",
    a: "You try again. There's no penalty, no time limit, and no grade. The quiz exists to make sure you actually learned the content — not to trip you up.",
  },
  {
    q: "How long does each lesson take?",
    a: "Most lessons take 10–15 minutes: watch the video, read the coaching content, answer 2–3 questions. Some high school lessons with longer film breakdowns run 20 minutes.",
  },
  {
    q: "When will my own BTB film content be added?",
    a: "Dan Achatz and the BTB coaching staff are building original lesson content to be added throughout the 2026 season. All new content is added to your account automatically — no reinstalls or updates needed.",
  },
]

// ─── Component ────────────────────────────────────────────────────────

export function AcademyInfoPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="BTB Online Academy | Learn the Game. Develop the Player."
        description="BTB Academy is Long Island's only lacrosse program with a full online learning platform — 90+ lessons across 3 age tiers, 6 position tracks, and a dedicated coach education curriculum."
        path="/academy-info"
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6 border-b border-white/[0.07] relative overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
            style={{ background: "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,38,48,0.18) 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-[960px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#D22630]" />
            <span className="text-[0.62rem] font-bold uppercase tracking-[4px] text-white/30">
              BTB Online Academy · Long Island
            </span>
            <div className="h-px w-10 bg-[#D22630]" />
          </div>

          <h1
            className="font-display uppercase leading-[0.88] tracking-wide mb-8"
            style={{ fontSize: "clamp(3.2rem,8vw,6.5rem)" }}
          >
            Learn the Game.<br />
            <span className="text-[#D22630]">Develop the Player.</span>
          </h1>

          <p className="text-[0.92rem] text-white/40 max-w-[540px] leading-[1.9] mb-4">
            BTB Academy is the only online lacrosse learning platform built
            specifically for BTB players and coaches. Not generic drills.
            Not YouTube compilations. A structured curriculum — the same
            coaching philosophy we use on the field, now available on any device, any time.
          </p>
          <p className="text-[0.85rem] text-white/60 font-semibold mb-12">
            90+ lessons. 6 position tracks. 3 age tiers. Coach curriculum.
            Progress that follows you across every device.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[#B01F28] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.35)]"
            >
              Access Your Academy <ArrowRight size={13} />
            </button>
            <a
              href="mailto:info@bethebestli.com"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 bg-white/5 text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              Request Access
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 border border-white/[0.07] rounded-xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-10 text-center ${i < stats.length - 1 ? "border-r border-white/[0.07]" : ""}`}>
                <div className="font-display text-[2.5rem] text-[#D22630] leading-none">{s.num}</div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            The Curriculum
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Three Pillars.<br />Every Level.
          </h2>
          <p className="text-[0.84rem] text-white/35 max-w-[520px] leading-relaxed mb-14">
            Every lesson in BTB Academy lives inside one of three pillars.
            The pillars are designed to develop the whole player — not just
            the one holding the stick.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {pillars.map((p) => (
              <div key={p.label} className={`p-7 rounded-xl border ${p.bg} ${p.border}`}>
                <div className={`w-11 h-11 rounded-lg ${p.bg} border ${p.border} flex items-center justify-center mb-5`}>
                  <p.icon size={20} className={p.color} />
                </div>
                <h3 className="font-display text-[1.1rem] uppercase tracking-wide mb-3">{p.label}</h3>
                <p className="text-[0.8rem] text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[0.78rem] text-white/25 text-center">
            Leadership and Team lessons apply to every position at every age.
            The Game pillar adapts its content by tier and position track.
          </p>
        </div>
      </section>

      {/* ── POSITION TRACKS ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            Position Tracks
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Your Position.<br />Your Curriculum.
          </h2>
          <p className="text-[0.84rem] text-white/35 max-w-[500px] leading-relaxed mb-14">
            BTB Academy has a dedicated lesson track for every position.
            Filter to your role and get coaching that's actually relevant to how you play.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {positions.map((pos) => (
              <div
                key={pos.label}
                className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.05] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center mb-4 group-hover:bg-[#D22630]/20 transition-colors">
                  <pos.icon size={16} className="text-[#D22630]" />
                </div>
                <h4 className="font-display text-[0.95rem] uppercase tracking-wide mb-2">{pos.label}</h4>
                <p className="text-[0.75rem] text-white/35 leading-relaxed">{pos.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGE TIERS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            Age Tiers
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Right Content.<br />Right Age.
          </h2>
          <p className="text-[0.84rem] text-white/35 max-w-[500px] leading-relaxed mb-14">
            The curriculum is not the same for every player. Content is written
            specifically for each age group — language, complexity, and focus
            all match where a player actually is in their development.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <div key={tier.label} className="rounded-2xl border border-white/[0.07] overflow-hidden">
                {/* Header band */}
                <div className={`h-24 bg-gradient-to-br ${tier.color} p-5 flex items-end`}>
                  <div>
                    <p className="text-white/70 text-[0.65rem] font-bold uppercase tracking-wider mb-1">{tier.ages}</p>
                    <h3 className="font-display text-2xl uppercase tracking-wide text-white">{tier.label}</h3>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 bg-white/[0.02]">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[2px] text-white/25 mb-4">{tier.gradYears}</p>
                  <ul className="space-y-2.5">
                    {tier.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={13} className="text-[#D22630] shrink-0 mt-0.5" />
                        <span className="text-[0.78rem] text-white/45 leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            How It Works
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Start to Wall of Fame.<br />
            <span className="text-white/20">Five Steps.</span>
          </h2>

          <div className="space-y-0 border-t border-white/[0.07]">
            {howItWorks.map((step, i) => (
              <div key={step.num} className="flex items-start gap-8 py-8 border-b border-white/[0.07] group">
                <div className="font-display text-[0.7rem] text-white/15 group-hover:text-[#D22630] transition-colors shrink-0 pt-0.5 w-6">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white group-hover:text-[#D22630] transition-colors mb-2">
                    {step.title}
                  </h4>
                  <p className="text-[0.84rem] text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LESSON FORMAT ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
                Lesson Format
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Watch. Read.<br />Prove You Learned It.
              </h2>
              <p className="text-[0.84rem] text-white/35 leading-relaxed mb-8">
                Every lesson follows the same format. It's not random — it mirrors
                how elite coaches actually teach: watch first, context second,
                prove comprehension third. The quiz isn't optional and it isn't easy to fake.
                You must answer correctly to advance.
              </p>
              <p className="text-[0.78rem] text-white/25 leading-relaxed">
                Wrong answer? You get the explanation and try again.
                No penalties, no timers. Just mastery before progress.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Video,     step: "Step 1", title: "Video",   desc: "A curated clip from elite coaches, college programs, or pro film. Chosen specifically for the lesson topic." },
                { icon: BookOpen,  step: "Step 2", title: "Content", desc: "Written coaching breakdown — the concepts, the mechanics, the reasoning. Typically 300–600 words of real coaching substance." },
                { icon: Brain,     step: "Step 3", title: "Quiz",    desc: "2–3 questions on the material. You must answer correctly to mark the lesson complete and unlock the next." },
                { icon: Trophy,    step: "Finish", title: "Progress", desc: "Completion is tracked in real time. Finish your tier and earn a spot on the BTB Wall of Fame." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center shrink-0">
                    <item.icon size={15} className="text-[#D22630]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.58rem] font-bold uppercase tracking-[2px] text-[#D22630]">{item.step}</span>
                      <span className="font-display text-[0.9rem] uppercase tracking-wide">{item.title}</span>
                    </div>
                    <p className="text-[0.75rem] text-white/35 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COACH CURRICULUM ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            For Coaches
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Coach Learning<br />Built In.
          </h2>
          <p className="text-[0.84rem] text-white/35 max-w-[520px] leading-relaxed mb-14">
            BTB coaches have their own curriculum inside the Coaches Hub — four
            full modules covering philosophy, practice design, film study, and
            player development. It's not a certification checklist. It's actual education.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {coaches.map((c) => (
              <div key={c.num} className="flex items-start gap-6 p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] group hover:border-white/[0.14] transition-all">
                <div className="font-display text-[0.7rem] text-white/15 group-hover:text-[#D22630] transition-colors shrink-0 pt-0.5">
                  {c.num}
                </div>
                <div>
                  <h4 className="font-display text-[0.95rem] uppercase tracking-wide mb-2 group-hover:text-[#D22630] transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-[0.78rem] text-white/35 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-xl border border-[#D22630]/20 bg-[#D22630]/[0.04] flex items-start gap-4">
            <Lock size={16} className="text-[#D22630] shrink-0 mt-0.5" />
            <p className="text-[0.78rem] text-white/40 leading-relaxed">
              Coach curriculum is available exclusively to BTB-credentialed coaches.
              If you're on staff and need access, contact{" "}
              <a href="mailto:info@bethebestli.com" className="text-[#D22630] hover:underline">
                info@bethebestli.com
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">
            Questions
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Common Questions
          </h2>

          <div className="space-y-0 border-t border-white/[0.07]">
            {faqs.map((faq, i) => (
              <div key={i} className="py-8 border-b border-white/[0.07]">
                <h4 className="font-display text-[1rem] uppercase tracking-wide text-white mb-3">{faq.q}</h4>
                <p className="text-[0.84rem] text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="relative border border-[#D22630]/25 rounded-2xl px-10 py-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[#D22630]/[0.04]" />
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <span className="font-display text-[22vw] leading-none text-white select-none">
                BTB
              </span>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D22630]/10 border border-[#D22630]/25 mb-8">
                <GraduationCap size={28} className="text-[#D22630]" />
              </div>

              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-6">
                Invite Only
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                This Is for<br />BTB Players Only.
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[460px] mx-auto leading-relaxed mb-10">
                BTB Academy is not a public product. It's a tool we built for
                our players and coaches because we believe in-season education
                is just as important as in-season practice. If you're on a BTB
                team, your access is already waiting.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[#B01F28] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.35)]"
                >
                  Log In to Academy <ArrowRight size={13} />
                </button>
                <a
                  href="mailto:info@bethebestli.com"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Request Access
                </a>
              </div>

              <p className="text-[0.68rem] text-white/20 mt-8">
                Not a BTB player yet?{" "}
                <a href="/boys" className="text-[#D22630] hover:underline">View the Boys Program</a>
                {" · "}
                <a href="/girls" className="text-[#D22630] hover:underline">View the Girls Program</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
