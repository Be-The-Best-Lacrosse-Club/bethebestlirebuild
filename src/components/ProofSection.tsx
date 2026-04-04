import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { StatStrip } from "@/components/shared/StatStrip"

const commits = [
  { name: "Jake M.", school: "Hofstra", year: "'25" },
  { name: "Tyler R.", school: "LIU", year: "'25" },
  { name: "Connor B.", school: "Stony Brook", year: "'26" },
  { name: "Matt D.", school: "NYIT", year: "'26" },
  { name: "Ryan S.", school: "Adelphi", year: "'26" },
  { name: "Alex P.", school: "C.W. Post", year: "'27" },
  { name: "Lucas T.", school: "Mercy", year: "'27" },
  { name: "Aidan W.", school: "St. Thomas Aquinas", year: "'27" },
]

const stats = [
  { value: 85, suffix: "+", label: "College Commits" },
  { value: 23, suffix: "", label: "Travel Teams" },
  { value: 92, suffix: "%", label: "Retention Rate" },
  { value: 3, suffix: ":1", label: "Varsity Ratio" },
]

export function ProofSection() {
  const gridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-white py-28 px-6" id="proof">
      <div className="max-w-[1000px] mx-auto">
        <SectionHeader
          number="01"
          label="Results"
          title={"85+ Athletes.\nCollege Programs.\nReal Offers."}
          subtitle="BTB athletes have earned offers at every level — Division I through Division III. Here's a sample of recent commits."
          light
        />

        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {commits.map((c) => (
            <div key={c.name} className="reveal-child card-hover border border-neutral-100 rounded-xl px-5 py-4 bg-neutral-50 hover:border-[var(--btb-red)] hover:bg-white transition-all group">
              <div className="font-display text-sm uppercase tracking-wide text-black group-hover:text-[var(--btb-red)] transition-colors">{c.name}</div>
              <div className="text-[0.72rem] text-neutral-500 mt-0.5">{c.school}</div>
              <div className="text-[0.65rem] font-bold text-[var(--btb-red)] mt-0.5">Class of {c.year}</div>
            </div>
          ))}
        </div>
      </div>

      <StatStrip stats={stats} light />
    </section>
  )
}
