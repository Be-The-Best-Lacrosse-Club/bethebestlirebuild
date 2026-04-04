import { useEffect, useState } from "react"
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp, Play, FileText, Dumbbell } from "lucide-react"
import { wixClient } from "@/lib/wixClient"

interface Program {
  _id: string
  title: string
  description: string
  category: string
  position: string
  level: string
  totalSteps: number
  sortOrder: number
}

interface ProgramStep {
  _id: string
  title: string
  description: string
  programTitle: string
  stepNumber: number
  stepType: string
  duration: number
}

const stepTypeIcon = (type: string) => {
  if (type.toLowerCase().includes("drill")) return <Dumbbell size={14} />
  if (type.toLowerCase().includes("assignment") || type.toLowerCase().includes("worksheet") || type.toLowerCase().includes("template")) return <FileText size={14} />
  return <Play size={14} />
}

export function ProgramsPage({ onBack }: { onBack: () => void }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [steps, setSteps] = useState<ProgramStep[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("All")

  useEffect(() => {
    async function fetchData() {
      try {
        const [programsRes, stepsRes] = await Promise.all([
          wixClient.items.query("Programs").find(),
          wixClient.items.query("ProgramSteps").limit(100).find(),
        ])
        setPrograms(
          (programsRes.items.map((i: any) => i.data) as Program[])
            .sort((a, b) => a.sortOrder - b.sortOrder)
        )
        setSteps(stepsRes.items.map((i: any) => i.data) as ProgramStep[])
      } catch (err) {
        console.error("Failed to fetch programs:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categories = ["All", ...new Set(programs.map((p) => p.category))]
  const filtered = filter === "All" ? programs : programs.filter((p) => p.category === filter)

  const getSteps = (title: string) =>
    steps.filter((s) => s.programTitle === title).sort((a, b) => a.stepNumber - b.stepNumber)

  const levelColor = (level: string) => {
    if (level === "Foundation") return "bg-green-500/10 text-green-400 border-green-500/20"
    if (level === "Intermediate") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    if (level === "Advanced") return "bg-red-500/10 text-red-400 border-red-500/20"
    return "bg-white/10 text-white/60 border-white/20"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="font-display text-lg uppercase tracking-tight">
            BTB <span className="text-[var(--btb-red)]">Programs</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center pt-20 pb-12 px-6">
        <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-wide leading-none mb-4">
          Online <span className="text-[var(--btb-red)]">Programs</span>
        </h1>
        <p className="text-white/45 max-w-[520px] mx-auto text-[0.95rem] leading-relaxed">
          Film study modules, drill libraries, and recruiting prep — all built on the BTB development standard.
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-3 px-6 mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-[1.5px] rounded-full border transition-all ${
              filter === cat
                ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white"
                : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-white/30 text-sm">Loading programs...</div>
      )}

      {/* Programs Grid */}
      <div className="max-w-[1000px] mx-auto px-6 pb-24 space-y-4">
        {filtered.map((program) => {
          const programSteps = getSteps(program.title)
          const isExpanded = expanded === program._id
          const totalDuration = programSteps.reduce((sum, s) => sum + s.duration, 0)

          return (
            <div key={program._id} className="border border-white/[0.08] rounded-lg overflow-hidden bg-white/[0.02]">
              {/* Program Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : program._id)}
                className="w-full text-left px-6 py-5 flex items-start gap-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-1 self-stretch bg-[var(--btb-red)] rounded-full flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display text-xl uppercase tracking-wide">{program.title}</h3>
                    <span className={`text-[0.65rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border ${levelColor(program.level)}`}>
                      {program.level}
                    </span>
                  </div>
                  <div
                    className="text-[0.85rem] text-white/40 leading-relaxed line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: program.description }}
                  />
                  <div className="flex items-center gap-5 mt-3 text-[0.75rem] text-white/30">
                    <span className="flex items-center gap-1.5"><Users size={12} /> {program.position}</span>
                    <span className="flex items-center gap-1.5"><Play size={12} /> {program.totalSteps} steps</span>
                    {totalDuration > 0 && (
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {totalDuration} min</span>
                    )}
                  </div>
                </div>
                <div className="text-white/20 mt-2">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {/* Steps */}
              {isExpanded && programSteps.length > 0 && (
                <div className="border-t border-white/[0.06]">
                  {programSteps.map((step, i) => (
                    <div
                      key={step._id}
                      className={`flex items-start gap-4 px-6 py-4 ${
                        i < programSteps.length - 1 ? "border-b border-white/[0.04]" : ""
                      } hover:bg-white/[0.02] transition-colors`}
                    >
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[0.7rem] font-bold text-white/30 flex-shrink-0 mt-0.5">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[0.9rem] font-semibold text-white/80">{step.title}</h4>
                        </div>
                        <div
                          className="text-[0.8rem] text-white/35 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: step.description }}
                        />
                        <div className="flex items-center gap-4 mt-2 text-[0.7rem] text-white/25">
                          <span className="flex items-center gap-1">{stepTypeIcon(step.stepType)} {step.stepType}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {step.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && programSteps.length === 0 && (
                <div className="border-t border-white/[0.06] px-6 py-8 text-center text-white/20 text-sm">
                  Steps coming soon.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
