import React from "react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit, useStaggerReveal, useCounter } from "@/hooks/useScrollAnimation"
import { SectionHeader } from "@/components/shared/SectionHeader"

const achievements = [
  { event: "NXT Summer Inv.", team: "2028 Black", result: "Champions", spec: "DATA_REC // 001" },
  { event: "Mid-Atlantic Show.", team: "2028 Black", result: "Final Four", spec: "DATA_REC // 002" },
  { event: "L.I. Lax Fest", team: "2029 Gold", result: "Finalists", spec: "DATA_REC // 003" },
  { event: "World Series Lax", team: "2030 Blue", result: "Top 8", spec: "DATA_REC // 004" },
  { event: "Best In Class", player: "3 Selected", result: "2028/29", spec: "DATA_REC // 005" },
  { event: "NXT All-Stars", player: "8 Selected", result: "2028 Black", spec: "DATA_REC // 006" },
  { event: "Main Stage", player: "5 Selected", result: "2028/29", spec: "DATA_REC // 007" },
  { event: "Apex Showcase", player: "4 All-Stars", result: "2028s", spec: "DATA_REC // 008" },
]

export function ProofSection() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const cardsRef = useStaggerReveal(60)
  const titleRef = useWordSplit(55)

  return (
    <section className="bg-black py-32 px-6 relative overflow-hidden" id="proof">
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{
        backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-display text-sm tracking-[5px] mb-4 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              ELITE PERFORMANCE DATA
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2.8rem,7vw,5.5rem)] uppercase leading-[0.9] text-white">
              Recruiting <br /> <span className="text-[var(--btb-red)]">Flagships.</span>
            </h2>
          </div>
          <div className="text-white/30 text-[0.75rem] font-bold uppercase tracking-[2px] mb-4 border-l border-[var(--btb-red)] pl-6 max-w-[300px]">
            BTB 2028 Black and Girls 2030 Tidal Wave are our current flagship recruiting units, competing at the highest national level.
          </div>
        </div>

        <div ref={cardsRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-4 gap-0.5 bg-white/10 border border-white/10">
          {achievements.map((a, i) => (
            <div key={i} className="stagger-child group relative p-8 bg-black hover:bg-[var(--btb-red)] transition-all duration-300">
              {/* Corner Spec */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-white/20 group-hover:text-white/60 transition-colors">
                {a.spec}
              </div>
              
              <div className="mb-12">
                <div className="font-display text-xl uppercase tracking-wider text-white mb-1">{a.event}</div>
                <div className="text-[0.65rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                  {a.team || a.player}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-display uppercase text-white group-hover:scale-110 origin-left transition-transform">
                  {a.result}
                </div>
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling "Academy Spec" Ticker */}
      <div className="mt-32 border-y border-white/5 py-8 bg-white/[0.02]">
        <div className="flex overflow-hidden whitespace-nowrap">
          <div className="flex gap-12 animate-scroll-fast">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                <span className="text-white/20 font-display text-4xl uppercase tracking-[10px]">BTB_ELITE_ACADEMY</span>
                <span className="text-[var(--btb-red)] font-display text-4xl uppercase tracking-[10px]">//</span>
                <span className="text-white/20 font-display text-4xl uppercase tracking-[10px]">8:1_COACH_RATIO</span>
                <span className="text-[var(--btb-red)] font-display text-4xl uppercase tracking-[10px]">//</span>
                <span className="text-white/20 font-display text-4xl uppercase tracking-[10px]">PRO_LEVEL_FILM</span>
                <span className="text-[var(--btb-red)] font-display text-4xl uppercase tracking-[10px]">//</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
