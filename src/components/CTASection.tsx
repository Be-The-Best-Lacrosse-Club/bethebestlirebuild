import React from "react"
import { ArrowRight, Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit, useMagnetic, useFadeUp } from "@/hooks/useScrollAnimation"

export function CTASection() {
  const ref = useReveal({ className: "reveal-scale" })
  const navigate = useNavigate()
  const titleRef = useWordSplit(60)
  const cardRef = useFadeUp(0)
  const primaryRef = useMagnetic(0.3)
  const secondaryRef = useMagnetic(0.25)

  return (
    <section className="bg-white py-14 md:py-28 px-4 md:px-6 relative overflow-hidden" id="apply">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center gap-3 justify-center mb-8">
          <span className="text-[1.05rem] font-bold tracking-[3px] uppercase text-black/25">09</span>
          <div className="h-px w-8 bg-black/10" />
          <span className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)]">Ready to Apply</span>
        </div>

        <div ref={cardRef as React.RefObject<HTMLDivElement>} className="bg-black rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-[var(--btb-red)]" />

          <div className="px-6 md:px-10 lg:px-16 py-10 md:py-16 text-center">
            {/* Season urgency badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" />
              <span className="text-[1.05rem] font-black uppercase tracking-[3px] text-[var(--btb-red)]">
                2026 Season — Evaluations Now Open
              </span>
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2rem,6vw,5rem)] uppercase tracking-wide leading-[0.9] text-white mb-6">
              This Is Not a Tryout.<br />
              It's an <span className="text-[var(--btb-red)]">Application.</span>
            </h2>

            <p className="text-[1rem] text-white/90 max-w-[460px] mx-auto leading-[1.85] mb-10">
              BTB is selective because development requires commitment. We want players who are serious about lacrosse and families who are serious about investing in their athlete — the right way.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {["Serious about development", "Coachable & accountable", "Ready to study film", "Committed to the process"].map((item) => (
                <div key={item} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
                  <span className="text-[1rem] font-semibold uppercase tracking-[1px] text-white/90">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register-tryouts")}
                className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 btn-glow transition-all duration-200"
              >
                Request Evaluation <ArrowRight size={13} />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center justify-center gap-2.5 px-9 py-4 border border-white/15 text-white/90 text-[1.05rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
              >
                <Phone size={13} /> Contact Us
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[1.05rem] text-white/90 mt-8">
          Questions? <button onClick={() => navigate("/contact")} className="text-[var(--btb-red)] hover:underline">Contact us</button> or email <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] hover:underline">info@bethebestli.com</a>
        </p>
      </div>
    </section>
  )
}
