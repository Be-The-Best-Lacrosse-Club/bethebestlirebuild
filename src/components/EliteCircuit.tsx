import type React from "react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"
import { Trophy } from "lucide-react"

// The 14 tournaments BTB actually competes at — verified by Dan 2026-04-27.
// No locations listed because we don't have verified locations for every event.
// No specific finishes/placements claimed anywhere on this page.
const tournaments = [
  // Team tournaments — whole teams compete
  { name: "Apex",                         type: "Team Tournament" },
  { name: "Adrenaline Black Card",        type: "Team Tournament" },
  { name: "Igloo Team Challenge",         type: "Team Tournament" },
  { name: "Autumn & Gold Team Showcase",  type: "Team Tournament" },
  { name: "Fall Classic",                 type: "Team Tournament" },
  { name: "LI Summer Showdown",           type: "Team Tournament" },
  { name: "IWLCA Champion Cup",           type: "Team Tournament" },
  { name: "Maverick Showtime",            type: "Team Tournament" },
  { name: "Trilogy Showcase",             type: "Team Tournament" },
  { name: "Capital Cup",                  type: "Team Tournament" },
  { name: "IMLCA",                         type: "Team Tournament" },
  { name: "Presidents Cup",               type: "Team Tournament" },
  // Individual recruiting showcases — players are seen by college coaches
  { name: "National Lacrosse Combine",    type: "Recruiting Showcase" },
  { name: "Top Threat Showcase",          type: "Recruiting Showcase" },
  { name: "Primetime Recruiting Showcase",type: "Recruiting Showcase" },
  { name: "Best in Class",                type: "Recruiting Showcase" },
]

export function EliteCircuit() {
  const ref = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(50)

  return (
    <section className="bg-black py-14 md:py-24 px-4 md:px-6 relative overflow-hidden border-t border-white/5">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-10 md:mb-16 gap-6 md:gap-8 text-center md:text-left">
          <div>
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-4 flex items-center gap-3">
              <Trophy size={12} />
              THE_ELITE_CIRCUIT
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(1.8rem,5vw,4rem)] uppercase leading-none text-white">
              Competing Against <br /> <span className="text-[var(--btb-red)]">The Best.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.8rem] uppercase tracking-[1px] font-bold max-w-[300px] border-l border-white/10 pl-6">
            We don't play for participation trophies. We enter the most competitive tournaments and recruiting showcases in the country to test our standard.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/10 border border-white/10">
          {tournaments.map((t, i) => (
            <div key={i} className="reveal-child group p-8 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="text-[10px] font-mono text-white/20 group-hover:text-[var(--btb-red)] transition-colors mb-4">EVENT // {String(i + 1).padStart(3, '0')}</div>
                <h3 className="font-display text-xl text-white uppercase tracking-wider group-hover:translate-x-1 transition-transform">{t.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="px-2 py-0.5 border border-white/10 text-[0.6rem] font-black text-white/30 uppercase tracking-[1px] group-hover:border-[var(--btb-red)] group-hover:text-[var(--btb-red)] transition-colors">
                  {t.type}
                </span>
                <Trophy size={14} className="text-white/5 group-hover:text-[var(--btb-red)] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
