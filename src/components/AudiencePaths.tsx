import type React from "react"
import { ArrowRight, Shield, Users, GraduationCap } from "lucide-react"
import { useWordSplit, useStaggerReveal } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"

const paths = [
  {
    audience: "Players",
    icon: Shield,
    eyebrow: "PATH_01 // FOR_ATHLETES",
    headline: "Train to Get Recruited.",
    description: "Film study. Position-specific coaching. 8:1 ratios. The BTB Academy gives you the tools college coaches are actually looking for.",
    links: [
      { label: "Boys Program →", href: "/boys" },
      { label: "Girls Program →", href: "/girls" },
    ],
    cta: { label: "See the Academy", href: "/academy-info" },
    bgHover: "hover:bg-[var(--btb-red)]",
  },
  {
    audience: "Parents",
    icon: Users,
    eyebrow: "PATH_02 // FOR_FAMILIES",
    headline: "The Right Club Makes the Difference.",
    description: "Written practice plans. Film accountability. Certified coaches. We don't just develop players — we give you full transparency into your athlete's progress.",
    links: [
      { label: "Tryouts 2026 →", href: "/tryouts" },
      { label: "Parent Portal →", href: "/parent-portal" },
    ],
    cta: { label: "Learn About BTB", href: "/interest" },
    bgHover: "hover:bg-neutral-900",
  },
  {
    audience: "Coaches",
    icon: GraduationCap,
    eyebrow: "PATH_03 // FOR_STAFF",
    headline: "Built for Coaches Who Lead.",
    description: "Practice plan tools, film analysis AI, shared drill library, and a curriculum built for real player development. Tools only BTB coaches have access to.",
    links: [
      { label: "Coach Tools Preview →", href: "/coach-tools" },
      { label: "Join Our Staff →", href: "/contact" },
    ],
    cta: { label: "See Coach Tools", href: "/coach-tools" },
    bgHover: "hover:bg-neutral-900",
  },
]

export function AudiencePaths() {
  const titleRef = useWordSplit(55)
  const cardsRef = useStaggerReveal(100)
  const navigate = useNavigate()

  return (
    <section className="bg-black text-white py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-white/5">
      {/* Ghost */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.025]">
        <span className="font-display text-[18vw] leading-none text-white select-none">YOUR_PATH</span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-10 md:mb-20 gap-6 md:gap-8 pb-8 md:pb-12 border-b border-white/10 text-center md:text-left">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              SELECT_YOUR_PATH // BTB_ECOSYSTEM
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2.2rem,8vw,5rem)] uppercase leading-[0.85] text-white"
            >
              Who Is BTB <br /><span className="text-[var(--btb-red)]">Built For?</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-white/10 pl-8">
            Whether you're a player chasing a college offer, a parent evaluating clubs, or a coach looking for better tools — BTB was built with you in mind.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10 border border-white/10"
        >
          {paths.map((p) => (
            <div
              key={p.audience}
              className={`stagger-child group relative p-10 bg-black ${p.bgHover} transition-all duration-500 flex flex-col min-h-[480px]`}
            >
              {/* Eyebrow */}
              <div className="text-[10px] font-mono text-white/20 group-hover:text-white/50 transition-colors mb-8">
                {p.eyebrow}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                <p.icon size={24} className="text-[var(--btb-red)]" strokeWidth={2} />
              </div>

              {/* Audience tag */}
              <div className="text-[0.6rem] font-black uppercase tracking-[4px] text-[var(--btb-red)] group-hover:text-white/60 transition-colors mb-3">
                For {p.audience}
              </div>

              {/* Headline */}
              <h3 className="font-display text-[1.6rem] uppercase tracking-wide text-white leading-tight mb-6 group-hover:translate-x-1 transition-transform">
                {p.headline}
              </h3>

              {/* Body */}
              <p className="text-[0.82rem] text-white/35 group-hover:text-white/70 leading-relaxed font-medium transition-colors flex-1 mb-8">
                {p.description}
              </p>

              {/* Sub links */}
              <div className="space-y-2 mb-8">
                {p.links.map((l) => (
                  <div key={l.label}>
                    <button
                      onClick={() => navigate(l.href)}
                      className="text-[0.68rem] font-black uppercase tracking-[2px] text-white/30 group-hover:text-white/70 hover:!text-white transition-colors block"
                    >
                      {l.label}
                    </button>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(p.cta.href)}
                className="flex items-center gap-3 text-[0.72rem] font-black uppercase tracking-[2px] text-white/40 group-hover:text-white transition-colors border-t border-white/10 pt-6"
              >
                {p.cta.label}
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
