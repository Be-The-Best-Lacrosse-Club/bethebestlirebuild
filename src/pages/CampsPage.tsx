import { useEffect, useState } from "react"
import { ArrowRight, Calendar, Clock, Target, Users, Trophy, MapPin } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

type Camp = {
  key: string
  name: string
  tagline: string
  dates: string
  tabDates: string
  range: string
  time: string
  location: string
  forWho: string
  description: string
  bullets: string[]
  icon: typeof Trophy
  registerUrl: string
  price: string
  flyerSrc: string
  flyerAlt: string
}

const CAMPS: Camp[] = [
  {
    key: "positional",
    name: "Positional Camp",
    tagline: "Master Your Spot.",
    dates: "July 28 – July 30",
    tabDates: "Jul 28-30",
    range: "3 Days · Any Consecutive",
    time: "9 – 11 AM Daily",
    location: "Plainedge Park",
    forWho: "Position-focused players ready to specialize",
    description:
      "Three days dedicated to your position. Attack, midfield, defense, goalies, boys FOGO, LSM, and girls draw control each get their own track with position-specialist coaches.",
    bullets: [
      "Position-specific masterclasses",
      "Goalie track with dedicated staff",
      "Boys face-off and girls draw control intensive",
      "Written evaluation from a pro coach",
    ],
    icon: Target,
    registerUrl: "/register-positional",
    price: "$125",
    flyerSrc: "/images/tryouts/BTB_Positional_Camp_2026.jpg",
    flyerAlt: "BTB Positional Camp 2026 flyer for July 28 through July 30 at Plainedge Park",
  },
  {
    key: "futures",
    name: "Futures Camp",
    tagline: "Build the Foundation.",
    dates: "August 18 – August 20",
    tabDates: "Aug 18-20",
    range: "3 Days · Any Consecutive",
    time: "9 – 11 AM Daily",
    location: "Plainedge Park",
    forWho: "Classes of 2034–2037",
    description:
      "Three days built for the next generation. High-energy, fundamentals-first coaching from the same pros who lead our travel teams. Fun, but serious.",
    bullets: [
      "Stick skills and footwork foundation",
      "6:1 player-to-coach ratio",
      "Small-sided games and competition",
      "Intro to the BTB Standard",
    ],
    icon: Users,
    registerUrl: "/register-futures",
    price: "$125",
    flyerSrc: "/images/tryouts/BTB_Futures_Camp_2026.jpg",
    flyerAlt: "BTB Futures Camp 2026 flyer for August 18 through August 20 at Plainedge Park",
  },
]

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
  const [activeCampKey, setActiveCampKey] = useState(CAMPS[0].key)
  const activeCamp = CAMPS.find((camp) => camp.key === activeCampKey) ?? CAMPS[0]
  const ActiveCampIcon = activeCamp.icon

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Summer Camps | BTB Lacrosse Club"
        description="BTB summer camps in 2026 — Positional Camp (July 28–30) and Futures Camp (August 18–20) at Plainedge Park. Pick any consecutive days."
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
            BTB Summer Camps · 2026
          </div>
          <h1 className="font-display text-[3.15rem] uppercase tracking-wide leading-[0.9] mb-5 md:text-[5.2rem]">
            Two Camps.<br />One Standard.
          </h1>
          <p className="text-[1.02rem] text-white/70 max-w-[620px] leading-[1.75] mb-8 md:text-[1.16rem]">
            Pick the camp that fits your athlete: Positional Camp for focused skill development or
            Futures Camp for the next generation.
          </p>

          <div className="max-w-[980px]" aria-label="BTB camp selector">
            <div className="mb-3 text-[0.72rem] font-black uppercase tracking-[2.4px] text-white/40">
              Choose Your Camp
            </div>
            <div role="tablist" aria-label="BTB summer camp options" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CAMPS.map((camp) => {
                const isActive = activeCamp.key === camp.key

                return (
                  <button
                    key={camp.key}
                    type="button"
                    role="tab"
                    id={`camp-tab-${camp.key}`}
                    aria-selected={isActive}
                    aria-controls={`camp-panel-${camp.key}`}
                    onClick={() => setActiveCampKey(camp.key)}
                    className={`min-h-[86px] border px-4 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? "border-[var(--btb-red)] bg-[var(--btb-red)] text-white shadow-[0_18px_42px_rgba(210,38,48,0.2)]"
                        : "border-white/10 bg-white/[0.035] text-white/80 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className="block font-display text-[1.2rem] uppercase tracking-wide leading-none">
                      {camp.name}
                    </span>
                    <span
                      className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] font-black uppercase tracking-[1.4px] ${
                        isActive ? "text-white" : "text-white/60"
                      }`}
                    >
                      <span>{camp.tabDates}</span>
                      <span>{camp.price}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div
              id={`camp-panel-${activeCamp.key}`}
              role="tabpanel"
              aria-labelledby={`camp-tab-${activeCamp.key}`}
              className="mt-3 border border-white/10 bg-neutral-950/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:p-6"
            >
              <div className="grid gap-5 md:grid-cols-[1fr_180px] md:items-start">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--btb-red)]/15 text-[var(--btb-red)]">
                      <ActiveCampIcon size={18} strokeWidth={1.7} />
                    </span>
                    <div>
                      <div className="font-display text-[1.35rem] uppercase tracking-wide leading-none text-white">
                        {activeCamp.name}
                      </div>
                      <div className="mt-1 text-[0.78rem] font-black uppercase tracking-[1.8px] text-[var(--btb-red)]">
                        {activeCamp.tagline}
                      </div>
                    </div>
                  </div>
                  <p className="max-w-[660px] text-[0.98rem] leading-relaxed text-white/62">
                    {activeCamp.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {[
                      { label: "Dates", value: activeCamp.dates, icon: Calendar },
                      { label: "Time", value: activeCamp.time, icon: Clock },
                      { label: "Price", value: activeCamp.price, icon: Trophy },
                      { label: "Best For", value: activeCamp.forWho, icon: Users },
                    ].map((item) => (
                      <div key={item.label} className="border border-white/10 bg-white/[0.03] p-3">
                        <div className="mb-2 flex items-center gap-2 text-[0.66rem] font-black uppercase tracking-[1.5px] text-white/35">
                          <item.icon size={12} className="text-[var(--btb-red)]" />
                          {item.label}
                        </div>
                        <div className="text-[0.82rem] font-bold leading-snug text-white/88">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={activeCamp.registerUrl}
                      className="inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-6 py-3 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white transition-all duration-200 hover:bg-[var(--btb-red-dark)]"
                    >
                      Register · {activeCamp.price} <ArrowRight size={13} />
                    </a>
                    <a
                      href="#camps"
                      className="inline-flex items-center justify-center border border-white/15 px-6 py-3 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white/75 transition-all duration-200 hover:border-white/35 hover:text-white"
                    >
                      Compare All Camps
                    </a>
                  </div>
                </div>

                <a
                  href={activeCamp.registerUrl}
                  className="hidden overflow-hidden border border-white/10 bg-black transition-all duration-200 hover:border-[var(--btb-red)]/60 md:block"
                  aria-label={`Register for ${activeCamp.name}`}
                >
                  <img
                    src={activeCamp.flyerSrc}
                    alt={activeCamp.flyerAlt}
                    width={798}
                    height={1200}
                    className="aspect-[3/4] w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "2", label: "Camps" },
              { num: "6", label: "Total Days" },
              { num: "Pro", label: "Staff" },
              { num: "All", label: "Skill Levels" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[1.1rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camps */}
      <section id="camps" className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            The Schedule
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Two Weeks.<br />Two Camps.
          </h2>
          <p className="text-[1.1rem] text-white/35 mb-14 max-w-[480px] leading-relaxed">
            Sign up for any consecutive days that fit your schedule.
          </p>

          <div className="space-y-4">
            {CAMPS.map((c, i) => (
              <div
                key={c.key}
                className={`group relative rounded-2xl border p-8 md:p-10 transition-all duration-300 ${
                  i === 0
                    ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15]"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-start">
                  <div className="flex md:flex-col gap-4 md:gap-3 items-start">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        i === 0 ? "bg-[var(--btb-red)]/20" : "bg-white/[0.05]"
                      }`}
                    >
                      <c.icon
                        size={20}
                        strokeWidth={1.5}
                        className={i === 0 ? "text-[var(--btb-red)]" : "text-white/70"}
                      />
                    </div>
                    <span
                      className={`md:hidden text-[1.08rem] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full self-center ${
                        i === 0
                          ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]"
                          : "bg-white/[0.05] text-white/25"
                      }`}
                    >
                      {c.tagline}
                    </span>
                  </div>

                  <div>
                    <div className="hidden md:flex items-center gap-3 mb-3">
                      <span
                        className={`text-[1.08rem] font-bold uppercase tracking-[2px] px-2.5 py-1 rounded-full ${
                          i === 0
                            ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]"
                            : "bg-white/[0.05] text-white/70"
                        }`}
                      >
                        {c.tagline}
                      </span>
                    </div>
                    <h3 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] uppercase tracking-wide text-white mb-2">
                      {c.name}
                    </h3>
                    <div className="text-[1.05rem] text-white/35 mb-5">{c.forWho}</div>
                    <p className="text-[1.12rem] text-white/45 leading-relaxed mb-6 max-w-[560px]">
                      {c.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {c.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-[1.05rem] text-white/45 leading-relaxed"
                        >
                          <div className="w-1 h-1 rounded-full bg-[var(--btb-red)] mt-1.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:text-right md:min-w-[200px]">
                    <div className="flex md:flex-col items-baseline md:items-end gap-2 md:gap-1">
                      <Calendar
                        size={14}
                        className={`md:hidden ${i === 0 ? "text-[var(--btb-red)]" : "text-white/70"}`}
                      />
                      <div className="font-display text-[1.1rem] uppercase tracking-wide text-white leading-tight">
                        {c.dates}
                      </div>
                    </div>
                    <div className="text-[1.15rem] font-bold uppercase tracking-[1.5px] text-white/85 mt-2">
                      {c.range}
                    </div>
                    <div className="flex md:justify-end items-center gap-1.5 mt-3 text-[1.05rem] text-white/55">
                      <Clock size={12} className={i === 0 ? "text-[var(--btb-red)]" : "text-white/70"} />
                      {c.time}
                    </div>
                    <div className="flex md:justify-end items-center gap-1.5 mt-1.5 text-[1.05rem] text-white/55">
                      <MapPin size={12} className={i === 0 ? "text-[var(--btb-red)]" : "text-white/70"} />
                      {c.location}
                    </div>
                    <a
                      href={c.registerUrl}
                      className={`mt-5 block text-center py-3 px-6 font-black text-[1.0rem] uppercase tracking-[2px] transition-all ${
                        i === 0
                          ? "bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red-dark)]"
                          : "border border-[var(--btb-red)] text-white hover:bg-[var(--btb-red)]"
                      }`}
                    >
                      Register · {c.price}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Save Your Spot
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Lock In Your Camp.<br />
                <span className="text-[var(--btb-red)]">Pick Your Days.</span>
              </h2>
              <p className="text-[1.15rem] text-white/35 max-w-[460px] mx-auto leading-relaxed mb-10">
                Camps fill up. Reach out to confirm pricing, location, and reserve your athlete's spot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/interest"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200"
                >
                  Reserve a Spot <ArrowRight size={13} />
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
