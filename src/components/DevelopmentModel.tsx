import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"

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
    <section className="bg-neutral-50 py-28 px-6" id="development">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <SectionHeader
            number="03"
            label="Development"
            title={"How We Actually\nBuild Players"}
            light
          />
          <p className="text-[0.86rem] text-neutral-400 max-w-[300px] leading-relaxed md:text-right md:pb-2">
            A 16-week repeatable cycle designed around four phases of skill progression.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {phases.map((p, i) => (
            <div
              key={p.num}
              className={`reveal-child relative rounded-2xl border p-7 overflow-hidden group transition-all duration-300 card-hover ${
                i === 1
                  ? "border-[var(--btb-red)]/20 bg-white hover:border-[var(--btb-red)]/40"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="absolute right-5 top-3 font-display text-[5rem] text-black/[0.04] leading-none select-none">{p.num}</div>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">{p.weeks}</div>
                  <div className="font-display text-xl uppercase tracking-wide text-black">{p.phase}</div>
                </div>
              </div>

              <p className="font-display text-[1.1rem] text-neutral-400 mb-5 uppercase tracking-wide">{p.title}</p>

              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.8rem] text-neutral-500">
                    <span className="w-1 h-1 rounded-full bg-[var(--btb-red)] mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border border-neutral-200 rounded-xl overflow-hidden bg-white">
          {pillars.map((p, i) => (
            <div
              key={p.stat}
              className={`py-8 text-center ${i < pillars.length - 1 ? "border-r border-neutral-200" : ""}`}
            >
              <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{p.stat}</div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-neutral-400 mt-2">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
