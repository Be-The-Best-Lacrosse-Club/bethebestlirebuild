import { useReveal } from "@/hooks/useReveal"
import { Trophy } from "lucide-react"

const tournaments = [
  { name: "Naptown", location: "Annapolis, MD", level: "National" },
  { name: "The Gauntlet", location: "Long Island, NY", level: "National" },
  { name: "Lax By The Sea", location: "Long Branch, NJ", level: "Showcase" },
  { name: "Maryland Cup", location: "Maryland", level: "Elite" },
  { name: "Apex Events", location: "Pennsylvania", level: "National" },
  { name: "LI Summer Showdown", location: "Farmingdale, NY", level: "Showcase" },
  { name: "Adrenaline Events", location: "Multi-State", level: "National" },
  { name: "Live Love Lax", location: "Long Island, NY", level: "Showcase" },
  { name: "Excelsior Games", location: "New York", level: "National" },
  { name: "Crabfeast", location: "Maryland", level: "Elite" },
]

export function EliteCircuit() {
  const ref = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black py-24 px-6 relative overflow-hidden border-t border-white/5">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-4 flex items-center gap-3">
              <Trophy size={12} />
              THE_ELITE_CIRCUIT
            </div>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] uppercase leading-none text-white">
              Competing Against <br /> <span className="text-[var(--btb-red)]">The Best.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.8rem] uppercase tracking-[1px] font-bold max-w-[300px] border-l border-white/10 pl-6">
            We don't play for participation trophies. We enter the most competitive tournaments in the country to test our standard.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/10 border border-white/10">
          {tournaments.map((t, i) => (
            <div key={i} className="reveal-child group p-8 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="text-[10px] font-mono text-white/20 group-hover:text-[var(--btb-red)] transition-colors mb-4">EVENT // {String(i + 1).padStart(3, '0')}</div>
                <h3 className="font-display text-xl text-white uppercase tracking-wider group-hover:translate-x-1 transition-transform">{t.name}</h3>
                <div className="text-[0.65rem] font-bold text-white/40 mt-1 uppercase tracking-[1px]">{t.location}</div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="px-2 py-0.5 border border-white/10 text-[0.6rem] font-black text-white/30 uppercase tracking-[1px] group-hover:border-[var(--btb-red)] group-hover:text-[var(--btb-red)] transition-colors">
                  {t.level}
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
