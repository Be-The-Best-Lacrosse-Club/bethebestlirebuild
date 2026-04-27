import type React from "react"
import { ArrowRight, GraduationCap, Video, Target, Brain, Trophy, Swords } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"

const tracks = [
  { spec: "TRACK // 01", icon: Swords,        title: "Attack",    text: "Feeding angles, dodges, and finishing. Build the instincts that create goals." },
  { spec: "TRACK // 02", icon: Target,        title: "Midfield",  text: "Transition reads, ground balls, and two-way play. Be dangerous in every phase." },
  { spec: "TRACK // 03", icon: Brain,         title: "Defense",   text: "Slides, communication, and containment. Build a lock-down mentality." },
  { spec: "TRACK // 04", icon: Trophy,        title: "Goalie",    text: "Save mechanics, outlets, and leadership. Own the cage." },
  { spec: "TRACK // 05", icon: GraduationCap, title: "FOGO / Draw", text: "The most specialized position in the game. Dominated by the most prepared players." },
  { spec: "TRACK // 06", icon: Video,         title: "Film Study", text: "90+ lessons across 6 position tracks — watch, learn, test, repeat." },
]

export function DigitalAcademy() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)
  const navigate = useNavigate()

  return (
    <section className="bg-white text-black py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-black/5" id="digital-academy">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <span className="font-display text-[22vw] leading-none text-black select-none">
          ACADEMY
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-12 md:mb-24 gap-6 md:gap-8 pb-8 md:pb-12 border-b border-black/10 text-center md:text-left">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <GraduationCap size={12} />
              BTB_DIGITAL_ACADEMY // ONLINE_PLATFORM
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2rem,8vw,5rem)] uppercase leading-[0.85] text-black"
            >
              Train Smarter. <br /> <span className="text-[var(--btb-red)]">Compete Better.</span>
            </h2>
          </div>
          <p className="text-black/40 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-black/10 pl-8">
            90+ lessons. 6 position-specific tracks. Film study, skill progressions, and knowledge checks — available 24/7 to every BTB player and coach.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 bg-black/10 border border-black/10 mb-0.5">
          {[
            { num: "90+", label: "Lessons" },
            { num: "6",   label: "Position Tracks" },
            { num: "3",   label: "Age Tiers" },
            { num: "4",   label: "Pillars" },
          ].map(s => (
            <div key={s.label} className="bg-white px-8 py-8 text-center">
              <div className="font-display text-[3.5rem] leading-none text-[var(--btb-red)]">{s.num}</div>
              <div className="text-[0.6rem] font-black uppercase tracking-[3px] text-black/30 mt-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Track Cards */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-black/10 border border-black/10">
          {tracks.map((c) => (
            <div
              key={c.spec}
              className="reveal-child group relative p-10 bg-white hover:bg-black transition-all duration-300"
            >
              <div className="absolute top-6 right-6 text-[10px] font-mono text-black/20 group-hover:text-white/40 transition-colors">
                {c.spec}
              </div>
              <div className="mb-10">
                <div className="w-12 h-12 bg-black/5 border border-black/10 flex items-center justify-center mb-6 group-hover:bg-[var(--btb-red)] group-hover:border-[var(--btb-red)] transition-all">
                  <c.icon size={20} className="text-black group-hover:text-white transition-colors" strokeWidth={2.5} />
                </div>
                <h4 className="font-display text-2xl uppercase tracking-wider text-black group-hover:text-white mb-2 transition-colors">{c.title}</h4>
              </div>
              <p className="text-[0.85rem] text-black/40 group-hover:text-white/60 leading-relaxed transition-colors font-medium">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/boys/players")}
              className="flex items-center gap-3 px-8 py-4 bg-black text-white text-[0.72rem] font-black uppercase tracking-[2px] hover:bg-[var(--btb-red)] transition-all group"
            >
              Boys Academy <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/girls/players")}
              className="flex items-center gap-3 px-8 py-4 border-2 border-black text-black text-[0.72rem] font-black uppercase tracking-[2px] hover:bg-black hover:text-white transition-all group"
            >
              Girls Academy <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <button
            onClick={() => navigate("/academy-info")}
            className="group flex items-center gap-4 text-black/30 hover:text-black transition-all"
          >
            <span className="text-[0.65rem] font-black uppercase tracking-[4px]">Learn More About the Platform</span>
            <div className="w-10 h-px bg-black/20 group-hover:w-20 group-hover:bg-[var(--btb-red)] transition-all" />
          </button>
        </div>
      </div>
    </section>
  )
}
