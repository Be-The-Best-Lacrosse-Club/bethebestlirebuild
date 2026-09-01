import { useEffect } from "react"
import { ArrowRight, Calendar, Target, Users, Trophy, MapPin } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

const CORE_VALUES = [
  {
    value: "Sportsmanship",
    detail: "Showing courtesy and respect to opponents, coaches, and teammates.",
  },
  {
    value: "Teamwork",
    detail: "Learning to work with teammates, help teammates, and put the group first.",
  },
  {
    value: "Dedication",
    detail: "Demonstrating care for the team, the sport, and personal performance.",
  },
  {
    value: "Improvement",
    detail: "Working hard to develop skills, learn, and get better every day.",
  },
  {
    value: "Hustle",
    detail: "Giving your best effort all of the time.",
  },
  {
    value: "MVP",
    detail: "Never losing your cool and rising to the occasion under pressure.",
  },
]

const POSITION_TRACKS = [
  {
    position: "Defense",
    detail:
      "Stick skills (left/right), footwork, holds, crease play, team defense, take away checks, shooting, stick protection, and off-ball play.",
  },
  {
    position: "Midfield",
    detail:
      "Stick skills (left/right), shooting inside and outside, on-the-run shooting, split dodge, inside roll, question mark, COD, riding, stick protection, team offense, defensive play, intro to face-offs, passing, and off-ball play.",
  },
  {
    position: "Attack",
    detail:
      "Stick skills (left/right), shooting inside and outside, on-the-run shooting, split dodge, inside roll, question mark, COD, riding, stick protection, team offense, passing, and off-ball play.",
  },
  {
    position: "Goalie",
    detail:
      "Stance and position, grip on the stick, leadership, stick skills, communication, shot stopping, attitude, and proper warmup.",
  },
]

export function CampsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Camps & Clinics | BTB Lacrosse Club"
        description="BTB Lacrosse camps and clinics. More dates coming soon — check back for the next round."
        path="/camps"
      />

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-24 overflow-hidden md:px-6 md:pb-20">
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-[1040px] mx-auto pt-10 md:pt-14">
          <div className="text-[0.8rem] font-black uppercase tracking-[3px] text-[var(--btb-red)] mb-4 md:text-[1.0rem]">
            BTB Camps & Clinics · More Dates Coming Soon
          </div>
          <h1 className="font-display text-[3.15rem] uppercase tracking-wide leading-[0.9] mb-5 md:text-[5.2rem]">
            Train With<br />Purpose.
          </h1>
          <p className="text-[1.02rem] text-white/70 max-w-[620px] leading-[1.75] mb-8 md:text-[1.16rem]">
Our next round of camps and clinics is being finalized — stay tuned. Dates will post here and go out to families as soon as they are locked in.
          </p>

          <div className="max-w-[980px] border border-white/10 bg-neutral-950/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[660px]">
                <div className="mb-4 inline-flex items-center gap-2 border border-[var(--btb-red)]/45 bg-[var(--btb-red)]/10 px-3 py-2 text-[0.75rem] font-black uppercase tracking-[2px] text-white">
                  <span className="h-2 w-2 rounded-full bg-[var(--btb-red)]" />
                  Registration Status · No Open Camp Registration
                </div>
                <h2 className="font-display text-[2rem] uppercase leading-none tracking-wide text-white md:text-[2.7rem]">
                  Next Clinic Schedule<br /><span className="text-[var(--btb-red)]">In Progress.</span>
                </h2>
                <p className="mt-4 max-w-[620px] text-[1rem] leading-relaxed text-white/70">
                  We are finalizing the next dates, age groups, locations, and pricing. We will publish every detail before registration opens—no outdated checkout links and no guessing.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="/interest?category=Camp&notes=Please%20notify%20me%20when%20new%20camp%20or%20clinic%20dates%20are%20published."
                  className="inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-6 py-3 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white transition-all duration-200 hover:bg-[var(--btb-red-dark)]"
                >
                  Get Camp Updates <ArrowRight size={13} />
                </a>
                <a
                  href="mailto:info@bethebestli.com?subject=BTB%20Camp%20Question"
                  className="inline-flex items-center justify-center border border-white/20 px-6 py-3 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white transition-all duration-200 hover:border-white/45"
                >
                  Ask a Question
                </a>
              </div>
            </div>

            <div className="mt-7 grid gap-2 sm:grid-cols-3">
              {[
                { label: "Dates", value: "To Be Announced", icon: Calendar },
                { label: "Location", value: "Long Island", icon: MapPin },
                { label: "Enrollment", value: "Opens With Published Dates", icon: Users },
              ].map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-[1.5px] text-white/65">
                    <item.icon size={13} className="text-[var(--btb-red)]" />
                    {item.label}
                  </div>
                  <div className="text-[0.9rem] font-bold leading-snug text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "Next", label: "Schedule" },
              { num: "Small", label: "Groups" },
              { num: "Pro", label: "Staff" },
              { num: "All", label: "Skill Levels" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[1.1rem] font-semibold uppercase tracking-[1.5px] text-white/60 mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule process */}
      <section id="camps" className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            The Schedule
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
No Guesswork.<br />One Standard.
          </h2>
          <p className="text-[1.1rem] text-white/70 mb-14 max-w-[620px] leading-relaxed">
            There is no active camp registration today. The next schedule will appear here only after the dates, location, age groups, and price are confirmed.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Details Confirmed", text: "Dates, times, location, age groups, and price are locked before anything is promoted." },
              { step: "02", title: "Families Notified", text: "The new schedule is published here and shared with families who requested camp updates." },
              { step: "03", title: "Registration Opens", text: "A clear registration button appears only when the correct session is ready to accept players." },
            ].map((item) => (
              <div key={item.step} className="border border-white/10 bg-white/[0.025] p-7">
                <div className="text-[0.8rem] font-black uppercase tracking-[2px] text-[var(--btb-red)]">Step {item.step}</div>
                <h3 className="mt-5 font-display text-[1.55rem] uppercase tracking-wide text-white">{item.title}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>

          <a
            href="/interest?category=Camp&notes=Please%20notify%20me%20when%20new%20camp%20or%20clinic%20dates%20are%20published."
            className="mt-8 inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-7 py-4 text-[0.95rem] font-black uppercase tracking-[2px] text-white transition-colors hover:bg-[var(--btb-red-dark)]"
          >
            Notify Me About Camps <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* Athlete Core Values */}
      <section id="camp-values" className="py-24 px-6 bg-black border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            BTB Lacrosse Athlete Core Values
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-5">
            Values First.<br />Skills Every Day.
          </h2>
          <p className="text-[1.1rem] text-white/45 mb-14 max-w-[650px] leading-relaxed">
            Our lacrosse camps teach athletes values and lacrosse skills while building relationships and
            having fun. Each camper will be taught the standard we expect on and off the field.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
            {CORE_VALUES.map((item) => (
              <div
                key={item.value}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-[var(--btb-red)]/35 hover:bg-[var(--btb-red)]/5 transition-all duration-300"
              >
                <div className="font-display text-[1.35rem] uppercase tracking-wide text-white mb-3">
                  {item.value}
                </div>
                <p className="text-[1.05rem] text-white/50 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
            <div>
              <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
                Position Training
              </div>
              <h3 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-5">
                Every Spot<br />Gets Better.
              </h3>
              <p className="text-[1.1rem] text-white/40 leading-relaxed">
                Campers get position-specific work built around the demands of the game: stick skills,
                footwork, decision-making, team concepts, and competitive reps.
              </p>
            </div>

            <div className="space-y-3">
              {POSITION_TRACKS.map((track) => (
                <div
                  key={track.position}
                  className="rounded-xl border border-white/[0.07] bg-neutral-950 p-6 hover:border-white/[0.14] transition-colors"
                >
                  <div className="font-display text-[1.15rem] uppercase tracking-wide text-white mb-2">
                    {track.position}
                  </div>
                  <p className="text-[1.05rem] text-white/55 leading-relaxed">{track.detail}</p>
                </div>
              ))}
              <div className="rounded-xl border border-[var(--btb-red)]/35 bg-[var(--btb-red)]/5 p-6">
                <div className="font-display text-[1.15rem] uppercase tracking-wide text-white mb-2">
                  FOGO / Draw Training
                </div>
                <p className="text-[1.05rem] text-white/65 leading-relaxed">
                  Special guests will work specifically with players who take the faceoff or the draw.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="included" className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            Every Camp
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            What's Included.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Pro Staff",
                stat: "Every Day",
                text: "Coached by the same pros and college players that lead our travel teams. No filler staff.",
                icon: Users,
              },
              {
                title: "Small Groups",
                stat: "Tight Ratios",
                text: "Position-specific groupings. More reps, more corrections, more growth.",
                icon: Trophy,
              },
              {
                title: "Skill Eval",
                stat: "Written",
                text: "Each athlete leaves with a written evaluation identifying strengths and areas to work on.",
                icon: Calendar,
              },
              {
                title: "Game Play",
                stat: "Every Day",
                text: "Small-sided games, full-field scrimmages, and competition built into every session.",
                icon: Target,
              },
              {
                title: "BTB Standard",
                stat: "Always",
                text: "Same culture, same accountability, same intensity that defines every BTB program.",
                icon: Trophy,
              },
            ].map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <b.icon size={18} strokeWidth={1.5} className="text-white/70" />
                  </div>
                  <span className="text-[1.08rem] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full bg-white/[0.05] text-white/25">
                    {b.stat}
                  </span>
                </div>
                <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">{b.title}</h4>
                <p className="text-[1.05rem] text-white/85 leading-relaxed group-hover:text-white/45 transition-colors">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">
                Camp Updates
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Be First To Know.<br />
                <span className="text-[var(--btb-red)]">Then Pick Your Session.</span>
              </h2>
              <p className="text-[1.15rem] text-white/70 max-w-[520px] mx-auto leading-relaxed mb-10">
                Tell us you want camp updates. We will send the confirmed schedule and registration path when the next session is ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/interest?category=Camp&notes=Please%20notify%20me%20when%20new%20camp%20or%20clinic%20dates%20are%20published."
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200"
                >
                  Get Camp Updates <ArrowRight size={13} />
                </a>
                <a
                  href="mailto:info@bethebestli.com"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/78 text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
