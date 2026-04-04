import { ArrowRight, ShieldCheck, BookOpen, Users, GraduationCap, Video, Star } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"

const cards = [
  { icon: Star, title: "Coaching Philosophy", text: "Our coaches teach through structure, repetition, and progression. Every correction comes with a coaching point and a path to improvement." },
  { icon: BookOpen, title: "Practice Planning", text: "Coaches submit written practice plans before every session. Each follows the seasonal curriculum with timed segments and targeted skill development." },
  { icon: Users, title: "Leadership & Accountability", text: "Coaches are evaluated on player development outcomes, not win-loss records. They lead by example and create environments where serious development happens." },
  { icon: GraduationCap, title: "Continuing Education", text: "All BTB coaches complete US Lacrosse certification, SafeSport training, and internal coaching development each season." },
  { icon: Video, title: "50+ Drill Playbook", text: "Coaches operate from a shared drillbook with 50+ documented drills across 8 categories — each with purpose, setup, execution steps, and video references." },
  { icon: ShieldCheck, title: "Background & Safety", text: "Every coach passes a background check and maintains current SafeSport certification. Player safety is non-negotiable." },
]

export function CoachesHub() {
  const ref = useReveal()

  return (
    <section className="bg-black text-white py-28 px-6" id="coaches">
      <div className="max-w-[1000px] mx-auto">

        {/* Header */}
        <div ref={ref} className="reveal-target flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 pb-10 border-b border-white/[0.08]">
          <div>
            <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Coaches Hub</div>
            <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] uppercase tracking-wide leading-[0.92]">
              Real Coaches.<br />Real Standards.
            </h2>
          </div>
          <p className="text-[0.88rem] text-white/35 max-w-[340px] leading-relaxed md:text-right">
            Every BTB coach is held to the same standard as every player. Preparation and accountability are not optional — for anyone.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className={`group p-7 rounded-2xl border transition-all duration-300 ${
                i === 0
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.05]"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${
                i === 0 ? "bg-[var(--btb-red)]/20" : "bg-white/[0.05] group-hover:bg-[var(--btb-red)]/10"
              } transition-colors`}>
                <c.icon
                  size={18}
                  strokeWidth={1.5}
                  className={i === 0 ? "text-[var(--btb-red)]" : "text-white/35 group-hover:text-[var(--btb-red)] transition-colors"}
                />
              </div>
              <h4 className="font-display text-[1rem] uppercase tracking-wide mb-2 text-white">{c.title}</h4>
              <p className={`text-[0.8rem] leading-relaxed transition-colors ${
                i === 0 ? "text-white/45" : "text-white/30 group-hover:text-white/50"
              }`}>{c.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3 border border-white/30 text-white text-[0.7rem] font-bold uppercase tracking-[2px] rounded hover:border-white hover:bg-white hover:text-black transition-all duration-200"
          >
            View Full Coaches Hub <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </section>
  )
}
