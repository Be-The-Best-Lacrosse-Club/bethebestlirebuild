import { useEffect, useRef, useState } from "react"

function AnimatedNumber({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const steps = 60
          const inc = target / steps
          let step = 0
          const timer = setInterval(() => {
            step++
            setVal(step >= steps ? target : Math.round(inc * step))
            if (step >= steps) clearInterval(timer)
          }, 30)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return (
    <div ref={ref} className="font-display text-[clamp(2.8rem,5vw,4rem)] text-white leading-none">
      {val.toLocaleString()}<span className="text-[var(--btb-red)]">{suffix}</span>
    </div>
  )
}

export function StatsBar() {
  const stats = [
    { target: 480, label: "Elite Athletes", suffix: "+" },
    { target: 24, label: "Active Teams", suffix: "" },
    { target: 50, label: "Trained Coaches", suffix: "+" },
    { target: 10, label: "Years Running", suffix: "+" },
  ]

  return (
    <div className="bg-neutral-950 border-y border-white/[0.06]">
      <div className="max-w-[1000px] mx-auto grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`py-14 px-8 text-center relative ${i < stats.length - 1 ? "lg:border-r border-white/[0.06]" : ""} ${i % 2 === 0 && i !== stats.length - 2 ? "border-r border-white/[0.06] lg:border-r-0" : ""}`}
          >
            <AnimatedNumber target={s.target} suffix={s.suffix} />
            <div className="text-[0.65rem] font-bold uppercase tracking-[2.5px] text-white/25 mt-3">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
