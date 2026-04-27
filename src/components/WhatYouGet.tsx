import type React from "react"
import { Video, Users, BookOpen, Target, TrendingUp, Shield, Activity } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"

const benefits = [
  {
    icon: Users,
    title: "Small-Group Training",
    what: "Max 8 players per coach.",
    detail: "You get real reps, real corrections, and real coaching — not a number in a line drill. Every session is intentional.",
    tag: "8:1_RATIO",
    spec: "UNIT_TRAINING // 01",
    className: "md:col-span-2 md:row-span-2"
  },
  {
    icon: Video,
    title: "Weekly Film Study",
    what: "Your game. On film. Every week.",
    detail: "You'll watch your own footage with a coach who breaks down exactly what you did right, what you missed, and how to fix it.",
    tag: "MANDATORY",
    spec: "SYSTEM_ANALYSIS // 02",
    className: "md:col-span-1 md:row-span-2"
  },
  {
    icon: Activity,
    title: "Member-Only Training",
    what: "Exclusive extra reps for rostered players.",
    detail: "Club members get exclusive access to extra positional clinics, speed & agility sessions, and academy-only labs.",
    tag: "CLUB_EXCL",
    spec: "MEMBER_BENEFIT // 07",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    icon: Target,
    title: "Position-Specific Coaching",
    what: "Attack. Midfield. Defense. Goalie. FOGO.",
    detail: "Your training is built for your position. Attackmen work on feeding and shot selection. Defenders work approach and slide timing.",
    tag: "ELITE_SPEC",
    spec: "CORE_SKILL // 04",
    className: "md:col-span-1 md:row-span-1"
  },
  {
    icon: TrendingUp,
    title: "Recruiting Preparation",
    what: "Flagship 2028s & 2030s focus.",
    detail: "Learn how to market yourself, which programs fit your profile, and what college coaches actually look for.",
    tag: "COLLEGE_READY",
    spec: "CAREER_MAP // 05",
    className: "md:col-span-2 md:row-span-1"
  },
]

export function WhatYouGet() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)

  return (
    <section className="bg-black text-white py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-white/5" id="whatyouget">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-display text-[22vw] leading-none text-white select-none">
          SYSTEM
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-10 md:mb-16 gap-6 md:gap-8 pb-8 md:pb-12 border-b border-white/10 text-center md:text-left">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <Activity size={12} className="animate-pulse" />
              ACADEMY_SYSTEM_SPECS
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2rem,8vw,5rem)] uppercase leading-[0.85] text-white">
              The Academy <br /> <span className="text-[var(--btb-red)]">Advantage.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-white/10 pl-8">
            BTB is built as a development system. No guesswork. No generic drills. Just high-performance engineering for our club members.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0.5 bg-white/10 border border-white/10">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`reveal-child group relative p-10 bg-black hover:bg-[var(--btb-red)] transition-all duration-300 cursor-default ${b.className}`}
            >
              {/* Corner Spec */}
              <div className="absolute top-6 right-6 text-[10px] font-mono text-white/20 group-hover:text-white/60 transition-colors">
                {b.spec}
              </div>

              <div className="mb-12">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:border-white transition-all">
                  <b.icon size={20} className="text-[var(--btb-red)]" strokeWidth={2.5} />
                </div>
                <div className="text-[0.6rem] font-mono text-[var(--btb-red)] mb-2 group-hover:text-white transition-colors">
                  {b.tag}
                </div>
                <h4 className="font-display text-2xl uppercase tracking-wider text-white mb-2">{b.title}</h4>
              </div>

              <div className="space-y-4">
                <p className="text-[0.85rem] font-bold text-white group-hover:text-white/90 transition-colors uppercase tracking-wide">
                  {b.what}
                </p>
                <p className="text-[0.8rem] text-white/30 leading-relaxed group-hover:text-white/70 transition-colors font-medium">
                  {b.detail}
                </p>
              </div>

              {/* Hover Indicator */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
