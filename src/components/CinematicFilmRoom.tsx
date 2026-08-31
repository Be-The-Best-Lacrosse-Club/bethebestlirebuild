import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Circle } from "lucide-react"

type BeatProps = {
  id: string
  side: "left" | "right"
  image: string
  imageAlt: string
  eyebrow: string
  title: string
  notes: string[]
  href: string
  cta: string
}

function FilmBeat({ id, side, image, imageAlt, eyebrow, title, notes, href, cta }: BeatProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reducedMotion.matches) {
      setProgress(0.62)
      return
    }

    let frame = 0
    let isVisible = false

    const render = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const range = Math.max(1, rect.height - window.innerHeight)
      setProgress(Math.max(0, Math.min(1, -rect.top / range)))
    }

    const requestRender = () => {
      if (isVisible && !frame) frame = requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) requestRender()
      },
      { rootMargin: "100% 0px" },
    )

    observer.observe(section)
    render()
    window.addEventListener("scroll", requestRender, { passive: true })
    window.addEventListener("resize", requestRender)

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", requestRender)
      window.removeEventListener("resize", requestRender)
    }
  }, [])

  const playerX = (progress - 0.5) * (side === "left" ? 22 : -22)
  const noteOpacity = Math.max(0, Math.min(1, (progress - 0.18) / 0.22))

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative h-[155vh] bg-[#080808] text-white"
      aria-label={`${eyebrow} film study`}
    >
      <div className="sticky top-0 h-screen min-h-[640px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(210,38,48,.16),transparent_38%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className={`absolute top-20 z-20 flex items-center gap-2 text-[.64rem] font-black uppercase tracking-[3px] text-white/45 ${side === "left" ? "left-5 md:left-10" : "right-5 md:right-10"}`}>
          <Circle size={8} aria-hidden="true" className="fill-[var(--btb-red)] text-[var(--btb-red)]" />
          Rec 00:{String(Math.round(progress * 12)).padStart(2, "0")}
        </div>

        {[0, 1, 2].map((ghost) => (
          <img
            key={ghost}
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={`absolute bottom-0 h-[66vh] w-[72vw] max-w-[760px] object-cover object-top opacity-[.06] grayscale md:h-[82vh] md:w-[52vw] ${side === "left" ? "left-[4%]" : "right-[4%]"}`}
            style={{
              transform: `translate3d(${playerX + (ghost - 1) * (side === "left" ? 18 : -18)}px, ${ghost * 8}px, 0) scale(${1 + ghost * 0.018})`,
            }}
          />
        ))}

        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          className={`absolute bottom-0 h-[67vh] w-[72vw] max-w-[760px] object-cover object-top [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)] md:h-[84vh] md:w-[52vw] ${side === "left" ? "left-[4%]" : "right-[4%]"}`}
          style={{
            transform: `translate3d(${playerX}px, 0, 0) scale(${1 + Math.sin(progress * Math.PI) * 0.035})`,
          }}
        />

        <div className={`absolute top-[18%] z-20 w-[min(78vw,490px)] ${side === "left" ? "right-5 text-right md:right-12" : "left-5 md:left-12"}`}>
          <p className="text-[.66rem] font-black uppercase tracking-[4px] text-[var(--btb-red)]">{eyebrow} · Filmroom with Coach Dan</p>
          <h2 className="mt-3 font-display text-[clamp(3.3rem,8vw,7rem)] uppercase leading-[.82]">{title}</h2>
          <div className={`mt-7 space-y-3 ${side === "left" ? "ml-auto" : "mr-auto"}`} style={{ opacity: noteOpacity }}>
            {notes.map((note, index) => (
              <div
                key={note}
                className={`flex items-center gap-3 text-[.72rem] font-black uppercase tracking-[2px] text-white/70 ${side === "left" ? "justify-end" : "justify-start"}`}
                style={{ transform: `translateY(${(1 - noteOpacity) * (12 + index * 5)}px)` }}
              >
                {side === "right" ? <span className="h-px w-9 bg-[var(--btb-red)]" /> : null}
                {note}
                {side === "left" ? <span className="h-px w-9 bg-[var(--btb-red)]" /> : null}
              </div>
            ))}
          </div>
        </div>

        <a
          href={href}
          className={`absolute bottom-8 z-30 inline-flex items-center gap-3 border-b border-[var(--btb-red)] pb-2 text-[.7rem] font-black uppercase tracking-[2.4px] hover:text-[var(--btb-red)] ${side === "left" ? "right-5 md:right-12" : "left-5 md:left-12"}`}
        >
          {cta} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

export function CinematicFilmRoom() {
  return (
    <div aria-label="Filmroom with Coach Dan development stories">
      <FilmBeat
        id="boys-film"
        side="left"
        image="/images/demo/boys-action.jpg"
        imageAlt="BTB boys lacrosse team gathered together on the field"
        eyebrow="Boys Development"
        title="See it. Fix it. Own it."
        notes={["Scan before the catch", "Win the next decision", "Repeat at game speed"]}
        href="/boys"
        cta="Explore boys development"
      />
      <FilmBeat
        id="girls-film"
        side="right"
        image="/images/demo/girls-action.jpg"
        imageAlt="BTB girls lacrosse team raising their sticks together"
        eyebrow="Girls Development"
        title="Same film. Same standard."
        notes={["Head up. Field first.", "Stick stays protected", "Low hips. Quiet hands."]}
        href="/girls"
        cta="Explore girls development"
      />
    </div>
  )
}
