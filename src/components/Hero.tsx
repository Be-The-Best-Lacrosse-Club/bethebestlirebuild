import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { useWordSplit, useMagnetic, useCursorParallax, ease } from "@/hooks/useScrollAnimation"

export function Hero() {
  const headlineRef = useWordSplit(65)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const hud1Ref = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLAnchorElement>(null)
  const videoWrapRef = useCursorParallax(10)
  const primaryBtnRef = useMagnetic(0.3)
  const secondaryBtnRef = useMagnetic(0.25)

  // Staggered entrance for sub-elements after page load
  useEffect(() => {
    const sequence: [React.RefObject<HTMLElement>, number][] = [
      [hud1Ref as React.RefObject<HTMLElement>, 200],
      [subRef as React.RefObject<HTMLElement>, 700],
      [ctaRef as React.RefObject<HTMLElement>, 900],
      [scrollHintRef as React.RefObject<HTMLElement>, 1100],
    ]
    sequence.forEach(([ref, delay]) => {
      const el = ref.current
      if (!el) return
      el.style.opacity = "0"
      el.style.transform = "translateY(20px)"
      el.style.transition = `opacity 0.8s ease ${delay}ms, transform 0.8s ${ease} ${delay}ms`
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
        }, delay)
      })
    })
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden bg-black"
      id="home"
    >
      {/* ─── Background video with cursor-parallax wrapper ─── */}
      <div
        ref={videoWrapRef}
        className="absolute inset-[-4%] z-0 will-change-transform"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-45"
        >
          <source src="/assets/hero/brody.mp4" type="video/mp4" />
          <source src="/assets/hero/33g_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ─── Cinematic overlays ─── */}
      {/* Vignette */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.025) 80px)`,
        }}
      />
      {/* Red glow bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] z-[3] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,38,48,0.28) 0%, transparent 65%)",
        }}
      />
      {/* Top edge line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--btb-red)]/50 to-transparent z-[4]" />

      {/* ─── Content ─── */}
      <div className="relative z-10 w-full max-w-[1000px] px-6 pt-28 pb-20 flex flex-col items-center text-center">

        {/* HUD Data strip */}
        <div
          ref={hud1Ref}
          className="flex flex-wrap justify-center gap-6 mb-10 font-mono text-[0.58rem] tracking-[2px] text-white/30 uppercase"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" />
            FLAGSHIP: BOYS_2028
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" style={{ animationDelay: "0.3s" }} />
            FLAGSHIP: GIRLS_2030
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
            RECRUITING_PHASE: ACTIVE
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            SEASON: 25–26
          </div>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-10">
          <div className="h-px w-10 bg-[var(--btb-red)]" />
          <span className="text-[0.62rem] font-bold uppercase tracking-[5px] text-white/40">
            Long Island · Est. 2021
          </span>
          <div className="h-px w-10 bg-[var(--btb-red)]" />
        </div>

        {/* Headline — word-split animated */}
        <h1
          ref={headlineRef as React.RefObject<HTMLHeadingElement>}
          className="font-display uppercase leading-[0.88] tracking-wide mb-8"
          style={{ fontSize: "clamp(3.8rem, 10vw, 8rem)" }}
        >
          Train Here.{" "}
          <br />
          Get{" "}
          <span style={{ color: "var(--btb-red)" }}>Recruited.</span>
        </h1>

        {/* Sub lines */}
        <p
          ref={subRef}
          className="text-[0.95rem] leading-[1.9] text-white/40 max-w-[460px] mx-auto mb-2"
        >
          BTB is where serious Long Island lacrosse players go to get serious
          about their game.
        </p>
        <p className="text-[0.88rem] text-white/55 font-semibold mb-12">
          Film study. Small-group training. Real coaching. Real results.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap">
          <a
            ref={primaryBtnRef as React.RefObject<HTMLButtonElement> & React.RefObject<HTMLAnchorElement>}
            href="https://bethebest.leagueapps.com/leagues"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] overflow-hidden group"
            style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
          >
            {/* Fill sweep on hover */}
            <span
              className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              style={{ transitionTimingFunction: ease }}
            />
            <span className="relative z-10 group-hover:text-black transition-colors duration-300 flex items-center gap-2">
              Register for 2026 <ArrowRight size={13} />
            </span>
          </a>

          <a
            ref={secondaryBtnRef as React.RefObject<HTMLButtonElement> & React.RefObject<HTMLAnchorElement>}
            href="/academy"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 bg-white/5 backdrop-blur-sm text-white text-[0.72rem] font-bold uppercase tracking-[2px] hover:border-white/35 hover:bg-white/10 transition-all duration-300"
          >
            Academy Access
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-10 border-t border-white/[0.06] w-full max-w-[700px]">
          {[
            { val: "488", label: "Players" },
            { val: "25", label: "Teams" },
            { val: "116", label: "Coaches" },
            { val: "12", label: "D1 Commits" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl text-[var(--btb-red)] leading-none">{val}</div>
              <div className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/30 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Scroll indicator ─── */}
      <a
        ref={scrollHintRef}
        href="#next"
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 group"
      >
        <span className="text-[0.55rem] font-bold uppercase tracking-[3px] text-white/20 group-hover:text-white/40 transition-colors">
          Scroll
        </span>
        {/* Animated line */}
        <div className="w-px h-10 overflow-hidden bg-white/10">
          <div
            className="w-full bg-[var(--btb-red)]"
            style={{
              height: "100%",
              animation: "scrollIndicator 2s ease infinite",
            }}
          />
        </div>
      </a>
    </section>
  )
}
