export function ComingSoon() {
  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden bg-black"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url("/images/BTB_social_share_2026.png")' }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/60 to-black/95" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.04) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.04) 80px)`,
        }}
      />

      {/* Red glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[60%] z-[3]"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(210,38,48,0.45) 0%, transparent 65%)",
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D22630]/60 to-transparent z-[4]" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        {/* Logo */}
        <img
          src="/assets/THE NEW SHIELD.png"
          alt="BTB Lacrosse Club"
          className="w-32 sm:w-40 md:w-48 h-auto mb-8 drop-shadow-[0_0_30px_rgba(210,38,48,0.5)]"
        />

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-[#D22630]/50 bg-[#D22630]/10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D22630] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D22630]" />
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-white/90">
            Site Refresh In Progress
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tight mb-6"
          style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif", letterSpacing: "0.02em" }}
        >
          Something <span className="text-[#D22630]">Big</span>
          <br />
          Is Coming
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg md:text-2xl text-white/85 max-w-2xl mb-4 leading-relaxed">
          BTB is dropping a brand new website built to give our families
          <span className="text-white font-semibold"> more than just lacrosse.</span>
        </p>

        <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-xl mb-10">
          New tools. New resources. A whole new experience for the BTB community.
        </p>

        {/* Stay tuned banner */}
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D22630] via-white to-[#D22630] opacity-30 blur-lg" />
          <div
            className="relative px-8 sm:px-12 py-4 sm:py-5 bg-[#D22630] text-white border-2 border-white/20"
            style={{
              fontFamily: "'Bebas Neue', 'Montserrat', sans-serif",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              letterSpacing: "0.15em",
            }}
          >
            STAY TUNED!
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-xs sm:text-sm text-white/50 uppercase tracking-[0.2em]">
          Be The Best Lacrosse Club &middot; Long Island, NY
        </div>
      </div>
    </section>
  )
}
