import { useEffect, useRef } from "react"

type RevealClass = "reveal-target" | "reveal-left" | "reveal-right" | "reveal-scale" | "reveal-stagger"

interface UseRevealOptions {
  threshold?: number
  className?: RevealClass
}

export function useReveal({ threshold = 0.12, className = "reveal-target" }: UseRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!el.classList.contains(className)) {
      el.classList.add(className)
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed")
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold, className])

  return ref
}
