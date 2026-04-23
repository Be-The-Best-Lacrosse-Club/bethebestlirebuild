import { ArrowRight, ChevronDown, Activity } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-black" id="home">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-50"
      >
        <source src="/assets/hero/brody.mp4" type="video/mp4" />
        <source src="/assets/hero/33g_1.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay for legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/40 to-black/85" />

      {/* Grid */}
      <div className="absolute inset-0 z-[2]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.03) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.03) 80px)`
      }} />
      {/* Red glow bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[50%] z-[3]" style={{
        background: "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,38,48,0.3) 0%, transparent 65%)"
      }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--btb-red)]/40 to-transparent z-[4]" />

      <div className="relative z-10 w-full max-w-[920px] px-6 pt-28 pb-16 text-center flex flex-col items-center">

        {/* HUD Data Markers */}
        <div className="animate-fade-up-delay-1 flex gap-8 mb-8 font-mono text-[0.6rem] tracking-[2px] text-white/30 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" />
            FLAGSHIP: BOYS_2028
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" />
            FLAGSHIP: GIRLS_2030
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Activity size={10} className="text-[var(--btb-red)]" />
            RECRUITING_PHASE: ACTIVE
          </div>
        </div>

        {/* Eyebrow */}
        <div className="animate-fade-up-delay-1 inline-flex items-center gap-3 mb-10">
          <div className="h-px w-10 bg-[var(--btb-red)]" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[4px] text-white/40">Long Island · Est. 2016</span>
          <div className="h-px w-10 bg-[var(--btb-red)]" />
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up-delay-2 font-display uppercase leading-[0.88] tracking-wide mb-7"
          style={{ fontSize: "clamp(3.8rem,9.5vw,7.5rem)" }}
        >
          Train Here.<br />
          Get <span className="text-[var(--btb-red)]">Recruited.</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-up-delay-3 text-[0.95rem] leading-[1.85] text-white/40 max-w-[460px] mx-auto mb-3">
          BTB is where serious Long Island lacrosse players go to get serious about their game.
        </p>
        <p className="animate-fade-up-delay-3 text-[0.88rem] text-white/60 font-semibold mb-10">
          Film study. Small-group training. Real coaching. Real results.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up-delay-4 flex gap-4 justify-center flex-wrap">
          <a href="https://bethebest.leagueapps.com/leagues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200">
            Register for 2026 <ArrowRight size={13} />
          </a>
          <a href="/academy" className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 bg-white/5 backdrop-blur-sm text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:bg-white/10 transition-all duration-200">
            Academy Access
          </a>
        </div>
      </div>

      <a href="#proof" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-25 hover:opacity-50 transition-opacity">
        <span className="text-[0.6rem] uppercase tracking-[2px] text-white">Scroll</span>
        <ChevronDown size={16} className="text-white animate-bounce" />
      </a>
    </section>
  )
}
