import type React from "react"
import { Video, BookOpen, Target, TrendingUp, Activity, ArrowRight } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"

const benefits = [
  {
    num: "01",
    icon: Video,
    title: "Weekly Film Study",
    what: "Your game. On film. Every week.",
    detail: "Watch your own footage with a coach who breaks down exactly what you did right, what you missed, and how to fix it. Film IQ is what separates good players from elite players.",
    tag: "MANDATORY",
    spec: "SYSTEM_ANALYSIS",
  },
  {
    num: "02",
    icon: Activity,
    title: "Member-Only Training",
    what: "Exclusive extra reps for rostered players.",
    detail: "BTB club members get exclusive access to extra positional clinics, speed & agility sessions, and academy-only labs that non-members never see.",
    tag: "CLUB_EXCL",
    spec: "MEMBER_BENEFIT",
  },
  {
    num: "03",
    icon: Target,
    title: "Position-Specific Coaching",
    what: "Attack. Midfield. Defense. Goalie. FOGO.",
    detail: "Your training is built for your position. Attackmen work feeding and shot selection. Defenders work approach and slide timing. No generic drills.",
    tag: "ELITE_SPEC",
    spec: "CORE_SKILL",
  },
  {
    num: "04",
    icon: TrendingUp,
    title: "Recruiting Preparation",
    what: "Flagship 2028s & 2030s focus.",
    detail: "Learn how to market yourself, which programs fit your profile, and what college coaches actually look for — so nothing catches you off guard on a campus visit.",
    tag: "COLLEGE_READY",
    spec: "CAREER_MAP",
  },
]

const stats = [
  { val: "450+", label: "Players Developed" },
  { val: "125hrs", label: "Film Library" },
  { val: "22", label: "Elite Teams" },
  { val: "2021", label: "Est. Long Island" },
]

export function WhatYouGet() {
  const listRef = useReveal({ className: "reveal-stagger" })
  const statRef = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)

  return (
    <section className="bg-black text-white relative overflow-hidden border-t border-white/5" id="whatyouget">

      {/* ── Header ── */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-20 md:pt-32 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-end">
          <div>
            <div className="text-[var(--btb-red)] font-mono text-[0.6rem] tracking-[5px] mb-6 flex items-center gap-3">
              <Activity size={11} className="animate-pulse" />
              ACADEMY_SYSTEM_SPECS
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2.8rem,9vw,6rem)] uppercase leading-[0.85] text-white"
            >
              The Academy{" "}
              <span className="text-[var(--btb-red)]">Advantage.</span>
            </h2>
          </div>
          <div className="md:pb-2">
            <p className="text-white/65 text-[1.05rem] leading-relaxed border-l-2 border-[var(--btb-red)] pl-6 mb-8">
              BTB is built as a development system. No guesswork. No generic drills.
              High-performance engineering for serious athletes.
            </p>
            <a
              href="/boys/players"
              className="inline-flex items-center gap-3 text-[0.82rem] font-bold uppercase tracking-[3px] text-white/65 hover:text-white transition-colors group"
            >
              Explore the Platform
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="border-y border-white/[0.06] bg-[#080808]">
        <div
          ref={statRef}
          className="reveal-stagger max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`reveal-child py-10 md:py-14 px-6 md:px-10 flex flex-col gap-1 ${i < stats.length - 1 ? "border-r border-white/[0.06]" : ""}`}
            >
              <span className="font-display text-[clamp(2.4rem,5vw,4rem)] text-[var(--btb-red)] leading-none">{s.val}</span>
              <span className="text-[0.75rem] font-bold uppercase tracking-[3px] text-white/60 mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Numbered List ── */}
      <div
        ref={listRef}
        className="reveal-stagger max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-28"
      >
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className={`reveal-child group grid grid-cols-1 md:grid-cols-[120px_1fr_1fr] gap-6 md:gap-16 items-start py-10 md:py-14 ${
              i < benefits.length - 1 ? "border-b border-white/[0.06]" : ""
            } hover:bg-white/[0.015] transition-colors duration-300 px-4 md:px-6 -mx-4 md:-mx-6`}
          >
            {/* Number + icon */}
            <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6 pt-1">
              <span className="font-display text-[3.5rem] md:text-[4rem] leading-none text-white/[0.06] group-hover:text-[var(--btb-red)] transition-colors duration-500 select-none">
                {b.num}
              </span>
              <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-[var(--btb-red)] group-hover:border-[var(--btb-red)] transition-all duration-300 flex-shrink-0">
                <b.icon size={16} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={2} />
              </div>
            </div>

            {/* Title block */}
            <div className="flex flex-col gap-3">
              <div className="text-[0.58rem] font-mono text-[var(--btb-red)] tracking-[4px]">{b.tag}</div>
              <h3 className="font-display text-[1.6rem] md:text-[2rem] uppercase leading-[1] text-white tracking-wide">
                {b.title}
              </h3>
              <p className="text-[0.92rem] font-bold uppercase tracking-wider text-white/65 leading-relaxed">
                {b.what}
              </p>
            </div>

            {/* Detail + spec */}
            <div className="flex flex-col gap-4 pt-1">
              <p className="text-[1rem] text-white/65 leading-[1.8] group-hover:text-white/80 transition-colors duration-300">
                {b.detail}
              </p>
              <div className="flex items-center gap-2 mt-auto pt-2">
                <div className="h-px flex-1 bg-white/[0.06] group-hover:bg-[var(--btb-red)]/30 transition-colors" />
                <span className="text-[0.7rem] font-mono text-white/50 tracking-[3px]">{b.spec}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Horizontal scrolling spec bar ── */}
      <div className="border-t border-white/[0.06] overflow-hidden py-5 bg-[#080808]">
        <div className="flex gap-0 whitespace-nowrap" style={{ animation: "marqueeSlide 18s linear infinite" }}>
          {["FILM_STUDY", "IQ_DEVELOPMENT", "POSITION_SCHOOL", "RECRUITING_PREP", "MEMBER_EXCLUSIVE", "FILM_STUDY", "IQ_DEVELOPMENT", "POSITION_SCHOOL", "RECRUITING_PREP", "MEMBER_EXCLUSIVE"].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-10 font-mono text-[0.74rem] tracking-[4px] text-white/55"
            >
              {item}
              <span className="w-1 h-1 rounded-full bg-[var(--btb-red)] flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeSlide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
