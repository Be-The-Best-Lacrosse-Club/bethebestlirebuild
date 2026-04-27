import type React from "react"
import { ArrowRight, Video, Target, Users, Zap, ShieldCheck, Search, Activity } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"

const cards = [
  { spec: "ANALYSIS // 01", title: "Game IQ Development", text: "Read defensive formations before they develop. Recognize slide packages. Make faster decisions. This is taught, not hoped for." },
  { spec: "ANALYSIS // 02", title: "Pressure Mastery", text: "Film slows the game down. Players see what happened, why it happened, and what the right decision was — before they face it live." },
  { spec: "ANALYSIS // 03", title: "Review Loop", text: "Every player sees their own performance. Missed assignments and poor positioning are identified on film — then corrected on the field." },
  { spec: "ANALYSIS // 04", title: "Position Tracks", text: "Attackmen study feeding angles. Middies study transitions. Defensemen study approach. Goalies study shot tendencies." },
  { spec: "ANALYSIS // 05", title: "Self-Scouting", text: "Players learn to identify their own tendencies, strengths, and weaknesses. The skill that separates college-ready athletes." },
  { spec: "ANALYSIS // 06", title: "Opponent Intel", text: "Before key matchups, teams review opponent film together. Players enter games with a plan — not just effort." },
]

export function FilmStudy() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)
  const navigate = useNavigate()

  return (
    <section className="bg-black text-white py-32 px-6 relative overflow-hidden border-t border-white/5" id="filmstudy">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-display text-[22vw] leading-none text-white select-none translate-x-12">
          VISUALS
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <Search size={12} className="animate-pulse" />
              COGNITIVE_DEVELOPMENT // FILM_STUDY
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2.8rem,8vw,5.5rem)] uppercase leading-[0.85] text-white">
              Win Before <br /> <span className="text-[var(--btb-red)]">The Whistle.</span>
            </h2>
          </div>
          <div className="text-white/30 text-[0.75rem] font-bold uppercase tracking-[2px] mb-4 border-l border-[var(--btb-red)] pl-6 max-w-[340px]">
            Film study is the most underused tool in youth sports. At BTB, it is a mandatory spec in our development blueprint.
          </div>
        </div>

        {/* Cinematic Highlight */}
        <div className="relative aspect-[21/9] overflow-hidden bg-neutral-900 border border-white/10 mb-0.5 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D22630]/40 via-black/60 to-black/90 z-10" />
          <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-1000">
             {/* Placeholder for Cinematic Film Background */}
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80')] bg-cover bg-center" />
          </div>
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:border-[var(--btb-red)] group-hover:scale-110 transition-all cursor-pointer">
              <Video className="text-white group-hover:text-[var(--btb-red)]" size={32} />
            </div>
            <h3 className="font-display text-4xl uppercase tracking-tight mb-4">THE_FILM_LAB</h3>
            <p className="text-white/60 text-[0.85rem] font-black uppercase tracking-[4px] max-w-[400px]">
              Every Player. Every Week. Every Rep.
            </p>
          </div>

          {/* Technical Specs */}
          <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-12 opacity-40">
            <div>
              <div className="text-white font-display text-2xl leading-none">WEEKLY</div>
              <div className="text-[8px] font-mono uppercase tracking-[2px] mt-1">frequency</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-white font-display text-2xl leading-none">HD_4K</div>
              <div className="text-[8px] font-mono uppercase tracking-[2px] mt-1">resolution</div>
            </div>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10 border-x border-b border-white/10">
          {cards.map((c, i) => (
            <div
              key={i}
              className="reveal-child group relative p-10 bg-black hover:bg-neutral-900 transition-all duration-300"
            >
              <div className="text-[10px] font-mono text-[var(--btb-red)] mb-8">{c.spec}</div>
              <h4 className="font-display text-xl uppercase tracking-wider text-white mb-4 group-hover:translate-x-1 transition-transform">{c.title}</h4>
              <p className="text-[0.82rem] text-white/30 group-hover:text-white/60 leading-relaxed transition-colors font-medium">
                {c.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-10">
          <a
            href="/film-breakdown.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--btb-red)] text-white text-[0.75rem] font-black uppercase tracking-[3px] rounded-sm overflow-hidden transition-all duration-300 hover:scale-[1.05] shadow-[0_15px_40px_rgba(210,38,48,0.3)]"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Activity size={16} className="relative animate-pulse" />
            <span className="relative">Launch_Digital_Film_Lab</span>
          </a>
          <button
            onClick={() => navigate("/academy")}
            className="group flex items-center gap-4 text-white/40 hover:text-white transition-all"
          >
            <span className="text-[0.65rem] font-black uppercase tracking-[4px]">Access E-Learning Portal</span>
            <div className="w-10 h-px bg-white/20 group-hover:w-20 group-hover:bg-[var(--btb-red)] transition-all" />
          </button>
        </div>
      </div>
    </section>
  )
}
