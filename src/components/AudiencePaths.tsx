import type React from "react"
import { ArrowRight, Shield, Users, GraduationCap } from "lucide-react"
import { useWordSplit, useStaggerReveal } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"

const paths = [
  {
    audience: "Boys",
    icon: Shield,
    eyebrow: "PATH_01 // BOYS_PROGRAM",
    headline: "Boys Travel + Development.",
    description: "Youth through varsity prep teams with film study, position-specific coaching, recruiting guidance, and a clear development path by grad year.",
    links: [
      { label: "Boys Overview →", href: "/boys" },
      { label: "Boys Teams →", href: "/boys/teams" },
    ],
    cta: { label: "Boys Tryouts", href: "/register-boys-tryouts" },
    bgHover: "hover:bg-[var(--btb-red)]",
  },
  {
    audience: "Girls",
    icon: Users,
    eyebrow: "PATH_02 // GIRLS_PROGRAM",
    headline: "Girls Program Built for Her Game.",
    description: "The same BTB standard with girls-specific curriculum, draw and free-position work, film accountability, and coaches who understand the women's game.",
    links: [
      { label: "Girls Overview →", href: "/girls" },
      { label: "Girls Teams →", href: "/girls/teams" },
    ],
    cta: { label: "Girls Tryouts", href: "/register-girls-tryouts" },
    bgHover: "hover:bg-neutral-900",
  },
  {
    audience: "Futures",
    icon: GraduationCap,
    eyebrow: "PATH_03 // YOUNG_PLAYERS",
    headline: "Start With the Right Foundation.",
    description: "K-2 and younger travel-path players get high-energy fundamentals, confidence, and the first habits that make the BTB standard easier to reach.",
    links: [
      { label: "Futures Program →", href: "/futures" },
      { label: "Camps & Clinics →", href: "/camps" },
    ],
    cta: { label: "Tryouts + Clinics", href: "/tryouts" },
    bgHover: "hover:bg-neutral-900",
  },
]

export function AudiencePaths() {
  const titleRef = useWordSplit(55)
  const cardsRef = useStaggerReveal(100)
  const navigate = useNavigate()

  return (
    <section id="program-paths" className="bg-black text-white py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-white/5">
      {/* Ghost */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.025]">
        <span className="font-display text-[18vw] leading-none text-white select-none">YOUR_PATH</span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-10 md:mb-20 gap-6 md:gap-8 pb-8 md:pb-12 border-b border-white/10 text-center md:text-left">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-lg tracking-[5px] mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              SELECT_YOUR_PATH // PARENT_START
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2.2rem,8vw,5rem)] uppercase leading-[0.85] text-white"
            >
              Choose Your <br /><span className="text-[var(--btb-red)]">Program.</span>
            </h2>
          </div>
          <p className="text-white/65 text-base leading-relaxed max-w-[380px] border-l border-white/10 pl-8">
            Start with the right side of the club. Boys and girls programs are separate, with different teams, coaches, and registration paths.
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
              <div className="text-base font-mono text-white/55 group-hover:text-white/75 transition-colors mb-8">
                {p.eyebrow}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                <p.icon size={24} className="text-[var(--btb-red)]" strokeWidth={2} />
              </div>

              {/* Audience tag */}
              <div className="text-base font-black uppercase tracking-[4px] text-[var(--btb-red)] group-hover:text-white/85 transition-colors mb-3">
                {p.audience === "Futures" ? "Futures + Clinics" : `${p.audience} Path`}
              </div>

              {/* Headline */}
              <h3 className="font-display text-[1.6rem] uppercase tracking-wide text-white leading-tight mb-6 group-hover:translate-x-1 transition-transform">
                {p.headline}
              </h3>

              {/* Body */}
              <p className="text-base text-white/65 group-hover:text-white/85 leading-relaxed font-medium transition-colors flex-1 mb-8">
                {p.description}
              </p>

              {/* Sub links */}
              <div className="space-y-2 mb-8">
                {p.links.map((l) => (
                  <div key={l.label}>
                    <button
                      onClick={() => navigate(l.href)}
                      className="text-base font-black uppercase tracking-[2px] text-white/85 group-hover:text-white/80 hover:!text-white transition-colors block"
                    >
                      {l.label}
                    </button>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(p.cta.href)}
                className="flex items-center gap-3 text-base font-black uppercase tracking-[2px] text-white/65 group-hover:text-white transition-colors border-t border-white/10 pt-6"
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
