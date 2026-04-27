import { useReveal } from "@/hooks/useReveal"

const phases = [
  {
    num: "01", phase: "Foundation", weeks: "Weeks 1–4",
    title: "Build the base.",
    items: ["Wall ball fundamentals", "Footwork & body mechanics", "Understanding defensive concepts", "Film study introduction"],
  },
  {
    num: "02", phase: "Connection", weeks: "Weeks 5–8",
    title: "Apply skills in context.",
    items: ["2-man game reads", "Transition decision-making", "Position-specific film sessions", "Small-group competition"],
  },
  {
    num: "03", phase: "Expansion", weeks: "Weeks 9–12",
    title: "Compete under pressure.",
    items: ["Live game-speed scenarios", "Opponent film breakdown", "Self-scouting sessions", "Varsity-level positioning"],
  },
  {
    num: "04", phase: "Execution", weeks: "Weeks 13–16",
    title: "Perform when it counts.",
    items: ["Game evaluation & review", "Recruiting film preparation", "College-ready standards test", "Next-phase goal setting"],
  },
]

const pillars = [
  { stat: "8:1", label: "Max player-to-coach ratio" },
  { stat: "16", label: "Week development cycle" },
  { stat: "50+", label: "Documented drills" },
  { stat: "100%", label: "Written practice plans" },
]

export function DevelopmentModel() {
  const gridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black py-14 md:py-28 px-4 md:px-6 relative overflow-hidden border-t border-white/5" id="development">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <span className="font-display text-[22vw] leading-none text-white select-none">PROCESS</span>
      </div>

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              DEVELOPMENT_MODEL // 16-WEEK_CYCLE
            </div>
            <h2 className="font-display text-[clamp(2rem,8vw,5rem)] uppercase leading-[0.85] text-white">
              How We Actually<br /><span className="text-[var(--btb-red)]">Build Players.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.86rem] leading-relaxed max-w-[300px] border-l border-white/10 pl-6">
            A 16-week repeatable cycle designed around four phases of skill progression.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {phases.map((p, i) => (
            <div
              key={p.num}
              className={`reveal-child relative border p-7 overflow-hidden group transition-all duration-300 ${
                i === 1
                  ? "border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5 hover:border-[var(--btb-red)]/50"
                  : "border-white/10 bg-neutral-950 hover:border-white/20"
              }`}
            >
              <div className="absolute right-5 top-3 font-display text-[5rem] text-white/[0.04] leading-none select-none">{p.num}</div>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">{p.weeks}</div>
                  <div className="font-display text-xl uppercase tracking-wide text-white">{p.phase}</div>
                </div>
              </div>

              <p className="font-display text-[1.1rem] text-white/40 mb-5 uppercase tracking-wide">{p.title}</p>

              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.8rem] text-white/40">
                    <span className="w-1 h-1 rounded-full bg-[var(--btb-red)] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border border-white/10 overflow-hidden bg-neutral-950">
          {pillars.map((p, i) => (
            <div
              key={p.stat}
              className={`py-8 text-center ${i < pillars.length - 1 ? "border-r border-white/10" : ""}`}
            >
              <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{p.stat}</div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/30 mt-2">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
