/**
 * CoachWhiteboardPage — Interactive Coach's Whiteboard / Playbook Generator
 * at /coach-ed/whiteboard (coach-only, behind ProtectedRoute).
 *
 * Drop player tokens on a half field, draw routes and passes, then save plays
 * to the Supabase playbook (falls back to this device) or export them as PNGs.
 */

import { useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, PenTool } from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import { Whiteboard } from "@/components/whiteboard/Whiteboard"

const steps = [
  { step: "01", label: "Drop your players", desc: "Add attack, middies, defense, and a goalie — drag every token exactly where you want it." },
  { step: "02", label: "Draw the play", desc: "Solid arrows for player routes, dashed lines for passes. Wrong line? Erase it or hit Undo." },
  { step: "03", label: "Save and share", desc: "Save the play to your BTB playbook to load later, or export a PNG for the group chat and practice plan." },
]

export function CoachWhiteboardPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Coach's Whiteboard | BTB Playbook Generator"
        description="BTB's interactive coach whiteboard — drop players on a half field, draw routes and passes, save plays to your playbook, and export diagrams."
        path="/coach-ed/whiteboard"
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 border-b border-white/[0.07] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]"
            style={{ background: "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-[1100px] mx-auto relative z-10">
          <Link
            to="/coach-tools"
            className="inline-flex items-center gap-2 text-[0.95rem] font-bold uppercase tracking-[2px] text-white/45 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Coach Tools
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#D22630] flex items-center justify-center shrink-0">
              <PenTool size={20} className="text-white" />
            </div>
            <span className="text-[1.05rem] font-bold uppercase tracking-[4px] text-white/85">
              BTB Coach Suite · Playbook Generator
            </span>
          </div>

          <h1
            className="font-display uppercase leading-[0.88] tracking-wide mb-6"
            style={{ fontSize: "clamp(2.6rem,6vw,4.5rem)" }}
          >
            Coach's <span className="text-[#D22630]">Whiteboard.</span>
          </h1>

          <p className="text-[1.15rem] text-white/70 max-w-[560px] leading-[1.8]">
            The dry-erase board, upgraded. Build your sets on a half field, draw
            the routes and passes, then save every play to your playbook — ready
            to load at the next practice or export for the staff.
          </p>
        </div>
      </section>

      {/* ── WHITEBOARD ───────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-b border-white/[0.07] bg-neutral-950">
        <div className="max-w-[1100px] mx-auto">
          <Whiteboard />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[1.1rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">How Coaches Use It</div>
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] uppercase tracking-wide leading-[0.92] mb-10">
            Whiteboard to Playbook.<br />
            <span className="text-white/45">Three Steps.</span>
          </h2>

          <div className="space-y-0 border-t border-white/[0.07]">
            {steps.map((s) => (
              <div key={s.step} className="flex items-start gap-8 py-7 border-b border-white/[0.07] group">
                <div className="font-display text-[1.25rem] text-white/15 group-hover:text-[#D22630] transition-colors shrink-0 pt-0.5 w-6">{s.step}</div>
                <div>
                  <h4 className="font-display text-[1rem] uppercase tracking-wide text-white group-hover:text-[#D22630] transition-colors mb-1">{s.label}</h4>
                  <p className="text-[1.1rem] text-white/35 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
