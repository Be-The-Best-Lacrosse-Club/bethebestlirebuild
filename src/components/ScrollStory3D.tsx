import { useEffect, useRef } from "react"
import { ArrowDownRight } from "lucide-react"

const CHAPTERS = [
  { number: "01", title: "Work", copy: "We put in the reps others skip." },
  { number: "02", title: "Accountability", copy: "We own our standard every day." },
  { number: "03", title: "Development", copy: "We get better so we can take over." },
]

export function ScrollStory3D() {
  const sectionRef = useRef<HTMLElement>(null)
  const helmetRef = useRef<HTMLImageElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const helmet = helmetRef.current
    const progress = progressRef.current
    if (!section || !helmet || !progress) return

    if (window.location.hash === "#scroll-story") {
      requestAnimationFrame(() => section.scrollIntoView({ block: "start" }))
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0

    const render = () => {
      frame = 0
      const bounds = section.getBoundingClientRect()
      const distance = Math.max(1, section.offsetHeight - window.innerHeight)
      const value = Math.min(1, Math.max(0, -bounds.top / distance))
      const active = Math.min(2, Math.floor(value * 3))

      progress.style.transform = `scaleY(${Math.max(0.02, value)})`

      chapterRefs.current.forEach((chapter, index) => {
        if (!chapter) return
        const delta = Math.abs(index - value * 2)
        chapter.style.opacity = `${Math.max(0.16, 1 - delta * 0.82)}`
        chapter.style.transform = `translate3d(0, ${Math.min(26, delta * 18)}px, 0)`
        chapter.dataset.active = index === active ? "true" : "false"
      })

      if (reduceMotion.matches) {
        helmet.style.transform = "translate3d(-50%, -50%, 0)"
        return
      }

      const rotationY = -7 + value * 14
      const rotationX = 3 - value * 6
      const rotationZ = -2 + Math.sin(value * Math.PI) * 4
      const lift = Math.sin(value * Math.PI) * -34
      const scale = 0.92 + Math.sin(value * Math.PI) * 0.12
      helmet.style.transform = `translate3d(-50%, calc(-50% + ${lift}px), 90px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`
    }

    const requestRender = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    render()
    window.addEventListener("scroll", requestRender, { passive: true })
    window.addEventListener("resize", requestRender)
    reduceMotion.addEventListener("change", requestRender)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", requestRender)
      window.removeEventListener("resize", requestRender)
      reduceMotion.removeEventListener("change", requestRender)
    }
  }, [])

  return (
    <section id="scroll-story" ref={sectionRef} className="relative h-[165vh] bg-black text-white" aria-label="The BTB Standard in motion">
      <div className="sticky top-0 h-screen min-h-[620px] overflow-hidden">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(210,38,48,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(210,38,48,.1)_1px,transparent_1px)] [background-size:clamp(70px,9vw,140px)_clamp(70px,9vw,140px)] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="absolute left-5 top-1/2 z-20 hidden h-[54vh] -translate-y-1/2 md:block lg:left-10">
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[0.68rem] font-black tracking-[2px] text-white/45">01</span>
          <div className="h-full w-px bg-white/18">
            <div ref={progressRef} className="h-full w-px origin-top bg-[var(--btb-red)] will-change-transform" />
          </div>
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[0.68rem] font-black tracking-[2px] text-white/45">03</span>
        </div>

        <div className="relative z-10 mx-auto h-full max-w-[1240px] px-5 md:px-12">
          <div className="absolute left-5 top-[15%] z-20 max-w-[500px] md:left-12 md:top-[14%]">
            <h2 className="font-display text-[clamp(3.7rem,8vw,7.5rem)] uppercase leading-[0.78] tracking-tight">
              Built<br /><span className="text-[var(--btb-red)]">Different.</span>
            </h2>
            <p className="mt-5 max-w-[380px] text-[0.96rem] font-semibold leading-relaxed text-white/65 md:text-[1.08rem]">
              Talent gets attention. Habits build players.
            </p>
          </div>

          <div className="absolute left-1/2 top-[52%] h-[44vh] w-[min(88vw,720px)] -translate-x-1/2 -translate-y-1/2 [perspective:1200px] md:top-1/2 md:h-[64vh]">
            <div className="absolute inset-x-[10%] bottom-[3%] h-[9%] rounded-[50%] bg-[var(--btb-red)]/20 blur-3xl" />
            <img
              ref={helmetRef}
              src="/images/scroll-story/btb-official-helmet-transparent.png"
              alt="Official black BTB lacrosse helmet with red cage and Be The Best side decal"
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              className="absolute left-1/2 top-1/2 z-10 h-auto w-full max-h-full object-contain drop-shadow-[0_28px_30px_rgba(210,38,48,0.18)] will-change-transform [transform-style:preserve-3d]"
            />
          </div>

          <div className="absolute bottom-[10%] right-5 z-20 w-[min(78vw,390px)] md:bottom-[14%] md:right-12">
            {CHAPTERS.map((chapter, index) => (
              <div
                key={chapter.number}
                ref={(node) => { chapterRefs.current[index] = node }}
                className="absolute bottom-0 right-0 w-full border-l border-white/15 pl-5 transition-colors duration-300 will-change-transform data-[active=true]:border-[var(--btb-red)]"
              >
                <span className="font-display text-2xl text-[var(--btb-red)]">{chapter.number}</span>
                <h3 className="mt-1 font-display text-[clamp(2rem,4vw,4rem)] uppercase leading-none tracking-wide">{chapter.title}</h3>
                <p className="mt-3 text-[0.9rem] font-medium text-white/58 md:text-[1rem]">{chapter.copy}</p>
              </div>
            ))}
          </div>

          <a
            href="#results"
            className="absolute bottom-6 left-5 z-30 inline-flex items-center gap-3 border-b border-[var(--btb-red)] pb-2 text-[0.72rem] font-black uppercase tracking-[2.4px] text-white transition-colors hover:text-[var(--btb-red)] md:bottom-10 md:left-12"
          >
            Explore the standard <ArrowDownRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
