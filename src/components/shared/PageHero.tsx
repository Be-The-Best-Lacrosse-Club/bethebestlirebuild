interface PageHeroProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

export function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <section className="relative pt-36 pb-20 bg-black text-white overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 z-[1]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`
      }} />
      {/* Bottom red glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)"
      }} />

      <div className="relative z-10 max-w-[920px] mx-auto px-6 text-center">
        {eyebrow && (
          <div className="animate-fade-up-delay-1 inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[var(--btb-red)]" />
            <span className="text-[0.6rem] font-bold uppercase tracking-[4px] text-white/35">{eyebrow}</span>
            <div className="h-px w-8 bg-[var(--btb-red)]" />
          </div>
        )}
        <h1
          className="animate-fade-up-delay-2 font-display uppercase leading-[0.92] tracking-wide"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5rem)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="animate-fade-up-delay-3 mt-5 text-[0.95rem] leading-[1.8] text-white/40 max-w-[520px] mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
