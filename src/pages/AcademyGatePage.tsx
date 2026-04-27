import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

export function AcademyGatePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const navigate = useNavigate()

  return (
    <>
      <SEO title="BTB Digital Academy" description="Access the BTB Lacrosse Digital Academy — position-specific lessons, film study, and skill tracks for boys and girls players." />

      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 60px,white 60px,white 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,white 60px,white 61px)"
        }} />

        <div className="relative z-10 w-full max-w-[900px] text-center">
          <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 uppercase">
            BTB_DIGITAL_ACADEMY
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] uppercase leading-none text-white mb-4">
            Choose Your <span className="text-[var(--btb-red)]">Program.</span>
          </h1>

          <p className="text-white/40 text-sm mb-16 max-w-[400px] mx-auto">
            90+ lessons, position-specific tracks, film study, and skill progressions — built for serious players.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-white/10 border border-white/10">
            {/* Boys */}
            <button
              onClick={() => navigate("/boys/players")}
              className="group p-12 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="text-[10px] font-mono text-white/20 group-hover:text-[var(--btb-red)] transition-colors mb-6 tracking-[3px]">PROGRAM // 001</div>
              <h2 className="font-display text-4xl text-white uppercase tracking-wider mb-3 group-hover:translate-x-1 transition-transform">Boys</h2>
              <p className="text-white/30 text-sm mb-8">Attack · Midfield · Defense · Goalie · FOGO</p>
              <div className="mt-auto flex items-center gap-2 text-[0.65rem] font-black tracking-[2px] uppercase text-[var(--btb-red)] opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Academy <ArrowRight size={12} />
              </div>
            </button>

            {/* Girls */}
            <button
              onClick={() => navigate("/girls/players")}
              className="group p-12 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="text-[10px] font-mono text-white/20 group-hover:text-[var(--btb-red)] transition-colors mb-6 tracking-[3px]">PROGRAM // 002</div>
              <h2 className="font-display text-4xl text-white uppercase tracking-wider mb-3 group-hover:translate-x-1 transition-transform">Girls</h2>
              <p className="text-white/30 text-sm mb-8">Attack · Midfield · Defense · Goalie · Draw</p>
              <div className="mt-auto flex items-center gap-2 text-[0.65rem] font-black tracking-[2px] uppercase text-[var(--btb-red)] opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Academy <ArrowRight size={12} />
              </div>
            </button>
          </div>

          <p className="text-white/15 text-xs mt-8 font-mono">
            LOGIN REQUIRED · BTB MEMBERS ONLY
          </p>
        </div>
      </div>
    </>
  )
}
