import { useEffect } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, Shield } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

export function AcademyGatePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="BTB Academy Member Access"
        description="Member access for the BTB Online Academy boys and girls player hubs."
        path="/academy-access"
      />

      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 60px,white 60px,white 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,white 60px,white 61px)"
        }} />

        <div className="relative z-10 w-full max-w-[900px] text-center">
          <div className="inline-flex items-center gap-2 text-[var(--btb-red)] font-mono text-[1.05rem] tracking-[3px] mb-6 uppercase">
            <Shield size={14} />
            BTB_MEMBER_ACADEMY
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] uppercase leading-none text-white mb-4">
            Choose Your <span className="text-[var(--btb-red)]">Member Hub.</span>
          </h1>

          <p className="text-white/70 text-sm mb-12 max-w-[520px] mx-auto">
            Rostered BTB players should enter the boys or girls player hub below. Non-club players can request public video learning access from the public Academy page.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-white/10 border border-white/10">
            {/* Boys */}
            <button
              onClick={() => navigate("/boys/players")}
              className="group p-12 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="text-[10px] font-mono text-white/45 group-hover:text-[var(--btb-red)] transition-colors mb-6 tracking-[3px]">PROGRAM // 001</div>
              <h2 className="font-display text-4xl text-white uppercase tracking-wider mb-3 group-hover:translate-x-1 transition-transform">Boys</h2>
              <p className="text-white/85 text-sm mb-8">Attack · Midfield · Defense · Goalie · FOGO</p>
              <div className="mt-auto flex items-center gap-2 text-[1.15rem] font-black tracking-[2px] uppercase text-[var(--btb-red)] opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Academy <ArrowRight size={12} />
              </div>
            </button>

            {/* Girls */}
            <button
              onClick={() => navigate("/girls/players")}
              className="group p-12 bg-black hover:bg-neutral-900 transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="text-[10px] font-mono text-white/45 group-hover:text-[var(--btb-red)] transition-colors mb-6 tracking-[3px]">PROGRAM // 002</div>
              <h2 className="font-display text-4xl text-white uppercase tracking-wider mb-3 group-hover:translate-x-1 transition-transform">Girls</h2>
              <p className="text-white/85 text-sm mb-8">Attack · Midfield · Defense · Goalie · Draw</p>
              <div className="mt-auto flex items-center gap-2 text-[1.15rem] font-black tracking-[2px] uppercase text-[var(--btb-red)] opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Academy <ArrowRight size={12} />
              </div>
            </button>
          </div>

          <p className="text-white/15 text-xs mt-8 font-mono">
            PLAYER HUB LOGIN REQUIRED
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/academy")}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 bg-white/[0.04] text-white text-[0.9rem] font-black uppercase rounded hover:border-white/35 transition-all"
            >
              Public Academy Page <ArrowRight size={12} />
            </button>
            <a
              href="/interest?category=Digital%20Academy&notes=Interested%20in%20Public%20Video%20Academy%20access"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.9rem] font-black uppercase rounded hover:bg-[var(--btb-red-dark)] transition-all"
            >
              Public Video Access <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
