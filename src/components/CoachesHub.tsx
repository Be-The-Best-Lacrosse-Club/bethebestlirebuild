import { ArrowRight, ShieldCheck, BookOpen, Users, GraduationCap, Video, Star, Activity } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"

const cards = [
  { spec: "PHILOSOPHY // 01", icon: Star, title: "Coaching Philosophy", text: "Our coaches teach through structure, repetition, and progression. Every correction comes with a coaching point and a path to improvement." },
  { spec: "PLANNING // 02", icon: BookOpen, title: "Practice Planning", text: "Coaches submit written practice plans before every session. Each follows the seasonal curriculum with timed segments." },
  { spec: "LEADERSHIP // 03", icon: Users, title: "Accountability", text: "Coaches are evaluated on player development outcomes, not win-loss records. They lead by example and create environments for growth." },
  { spec: "EDUCATION // 04", icon: GraduationCap, title: "Continuing Ed", text: "All BTB coaches complete US Lacrosse certification, SafeSport training, and internal coaching development each season." },
  { spec: "SYSTEMS // 05", icon: Video, title: "50+ Drill Playbook", text: "Coaches operate from a shared drillbook with 50+ documented drills across 8 categories — each with video references." },
  { spec: "SECURITY // 06", icon: ShieldCheck, title: "Background & Safety", text: "Every coach passes a background check and maintains current SafeSport certification. Player safety is non-negotiable." },
]

export function CoachesHub() {
  const ref = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black text-white py-32 px-6 relative overflow-hidden border-t border-white/5" id="coaches">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <span className="font-display text-[25vw] leading-none text-white select-none">
          STAFF_LAB
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8 pb-12 border-b border-white/10">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <Activity size={12} className="animate-pulse" />
              COACHING_STANDARD // OPS_PROTOCOL
            </div>
            <h2 className="font-display text-[clamp(2.8rem,8vw,5rem)] uppercase leading-[0.85] text-white">
              Real Coaches. <br /> <span className="text-[var(--btb-red)]">Real Standards.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-white/10 pl-8">
            Every BTB coach is held to the same standard as every player. Preparation and accountability are not optional.
          </p>
        </div>

        {/* Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/10 border border-white/10">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="reveal-child group relative p-10 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <div className="absolute top-6 right-6 text-[10px] font-mono text-white/20 group-hover:text-white/60 transition-colors">
                {c.spec}
              </div>

              <div className="mb-12">
                <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white transition-all">
                  <c.icon size={20} className="text-[var(--btb-red)]" strokeWidth={2.5} />
                </div>
                <h4 className="font-display text-2xl uppercase tracking-wider text-white mb-2">{c.title}</h4>
              </div>

              <p className="text-[0.85rem] text-white/30 group-hover:text-white/70 leading-relaxed transition-colors font-medium">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="/coaches"
            className="group flex items-center justify-center gap-4 text-white/40 hover:text-white transition-all"
          >
            <span className="text-[0.65rem] font-black uppercase tracking-[4px]">Access Full Academy Directory</span>
            <div className="w-10 h-px bg-white/20 group-hover:w-20 group-hover:bg-[var(--btb-red)] transition-all" />
          </a>
        </div>
      </div>
    </section>
  )
}
