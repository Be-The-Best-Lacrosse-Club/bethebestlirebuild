import { ArrowRight, GraduationCap, Users, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"

const hubs = [
  {
    icon: GraduationCap,
    label: "Academy",
    headline: "What Is BTB Lacrosse?",
    text: "Our mission, all four programs, what makes BTB different, and the history behind the club.",
    href: "/academy",
    tag: "Est. 2021",
  },
  {
    icon: Users,
    label: "Boys Program",
    headline: "Train Like You Mean It.",
    text: "Film study, position-specific coaching, 16-week development cycle, recruiting prep — the full BTB experience for boys.",
    href: "/boys",
    tag: "Ages 8–18",
  },
  {
    icon: BookOpen,
    label: "Girls Program",
    headline: "Same Standard. Built for Her.",
    text: "Girls-specific curriculum with the same film study, coaching standards, and development structure.",
    href: "/girls",
    tag: "Ages 8–18",
  },
]

export function HubsSection() {
  const navigate = useNavigate()
  const gridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-white py-28 px-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <SectionHeader
            number="08"
            label="Explore"
            title={"Go Deeper Into\nThe Program"}
            light
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hubs.map((h, i) => (
            <button
              key={h.label}
              onClick={() => navigate(h.href)}
              className={`reveal-child group text-left p-8 rounded-2xl border transition-all duration-300 card-hover ${
                i === 1
                  ? "border-black bg-black text-white"
                  : "border-neutral-100 bg-neutral-50 hover:border-black hover:bg-black"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  i === 1 ? "bg-[var(--btb-red)]/20" : "bg-neutral-200 group-hover:bg-[var(--btb-red)]/20"
                }`}>
                  <h.icon size={18} strokeWidth={1.5} className={`transition-colors ${
                    i === 1 ? "text-[var(--btb-red)]" : "text-white/85 group-hover:text-[var(--btb-red)]"
                  }`} />
                </div>
                <span className={`text-[1.05rem] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full border transition-colors ${
                  i === 1
                    ? "bg-white/10 text-white/85 border-white/10"
                    : "bg-white text-white/85 border-neutral-200 group-hover:bg-white/10 group-hover:text-white/85 group-hover:border-white/10"
                }`}>{h.tag}</span>
              </div>
              <div className="text-[1.05rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-2">{h.label}</div>
              <h3 className={`font-display text-[1.1rem] uppercase tracking-wide mb-3 transition-colors ${
                i === 1 ? "text-white" : "text-black group-hover:text-white"
              }`}>{h.headline}</h3>
              <p className={`text-[1rem] leading-relaxed mb-6 transition-colors ${
                i === 1 ? "text-white/85" : "text-white/85 group-hover:text-white/85"
              }`}>{h.text}</p>
              <div className={`flex items-center gap-1.5 text-[1.05rem] font-bold uppercase tracking-[1.5px] transition-colors ${
                i === 1 ? "text-white/85" : "text-black/25 group-hover:text-white/85"
              }`}>
                Explore <ArrowRight size={11} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
