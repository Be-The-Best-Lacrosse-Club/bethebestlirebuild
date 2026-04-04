import { useEffect, useState, useRef } from "react"
import { useReveal } from "@/hooks/useReveal"

interface Stat {
  value: number
  suffix?: string
  label: string
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const start = performance.now()
          function tick(now: number) {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          obs.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])

  return (
    <span ref={ref} className="font-display text-[clamp(2rem,4vw,3.2rem)] text-[var(--btb-red)]">
      {display}{suffix}
    </span>
  )
}

interface StatStripProps {
  stats: Stat[]
  light?: boolean
}

export function StatStrip({ stats, light = false }: StatStripProps) {
  const ref = useReveal()

  return (
    <div ref={ref} className={`py-14 ${light ? "bg-neutral-50 border-y border-neutral-200" : "bg-white/[0.02] border-y border-white/[0.06]"}`}>
      <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <AnimatedNumber value={s.value} suffix={s.suffix} />
            <p className={`mt-1 text-[0.7rem] font-semibold uppercase tracking-[2px] ${light ? "text-black/35" : "text-white/30"}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
