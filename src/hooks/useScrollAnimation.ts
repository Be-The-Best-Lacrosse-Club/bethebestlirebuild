import { useEffect, useRef, useCallback } from "react"

// ─── Easing ───────────────────────────────────────────────────────────────
export const ease = "cubic-bezier(0.16, 1, 0.3, 1)"

// ─── useWordSplit ─────────────────────────────────────────────────────────
// Wraps every word in the element with overflow:hidden + a sliding inner span.
// Triggers when the element enters the viewport.
//
// Walks only text nodes via TreeWalker — the previous implementation split
// the full innerHTML string at whitespace, which corrupted HTML attributes
// containing spaces (e.g. style="color: var(--btb-red);") and leaked the
// raw attribute text into the rendered page.
export function useWordSplit(staggerMs = 60) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Snapshot original markup so we can restore on cleanup
    const original = el.innerHTML

    // Collect text nodes first (don't mutate while walking)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    let node = walker.nextNode()
    while (node) {
      if (node.nodeValue && node.nodeValue.trim()) {
        textNodes.push(node as Text)
      }
      node = walker.nextNode()
    }

    // Replace each text node with wrapped word spans, preserving surrounding markup
    for (const tn of textNodes) {
      const parts = (tn.nodeValue || "").split(/(\s+)/)
      const frag = document.createDocumentFragment()
      for (const part of parts) {
        if (part === "") continue
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part))
          continue
        }
        const wrap = document.createElement("span")
        wrap.className = "word-wrap"
        wrap.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;"
        const inner = document.createElement("span")
        inner.className = "word-inner"
        inner.style.cssText = `display:inline-block;transform:translateY(110%);opacity:0;transition:transform 0.85s ${ease},opacity 0.5s ease;`
        inner.textContent = part
        wrap.appendChild(inner)
        frag.appendChild(wrap)
      }
      tn.parentNode?.replaceChild(frag, tn)
    }

    const inners = el.querySelectorAll<HTMLElement>(".word-inner")

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        inners.forEach((inner, i) => {
          inner.style.transitionDelay = `${i * staggerMs}ms`
          inner.style.transform = "translateY(0)"
          inner.style.opacity = "1"
        })
        obs.unobserve(el)
      },
      { threshold: 0.2 }
    )
    obs.observe(el)

    return () => {
      obs.disconnect()
      el.innerHTML = original
    }
  }, [staggerMs])

  return ref as React.RefObject<HTMLHeadingElement>
}

// ─── useLineReveal ────────────────────────────────────────────────────────
// Each child with class "line" slides up on scroll.
export function useLineReveal(staggerMs = 120) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const lines = Array.from(el.querySelectorAll<HTMLElement>(".line"))
    lines.forEach((line) => {
      line.style.overflow = "hidden"
      const inner = line.firstElementChild as HTMLElement | null
      if (inner) {
        inner.style.display = "block"
        inner.style.transform = "translateY(110%)"
        inner.style.transition = `transform 0.9s ${ease}`
      }
    })

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        lines.forEach((line, i) => {
          const inner = line.firstElementChild as HTMLElement | null
          if (inner) {
            inner.style.transitionDelay = `${i * staggerMs}ms`
            inner.style.transform = "translateY(0)"
          }
        })
        obs.unobserve(el)
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [staggerMs])

  return ref as React.RefObject<HTMLDivElement>
}

// ─── useCounter ───────────────────────────────────────────────────────────
// Counts from 0 to `target` when element enters viewport.
export function useCounter(target: number, durationMs = 1800) {
  const ref = useRef<HTMLElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true

        const start = performance.now()
        const run = (now: number) => {
          const pct = Math.min((now - start) / durationMs, 1)
          const easedPct = 1 - Math.pow(1 - pct, 3) // ease-out cubic
          el.textContent = Math.floor(easedPct * target).toLocaleString()
          if (pct < 1) requestAnimationFrame(run)
          else el.textContent = target.toLocaleString()
        }
        requestAnimationFrame(run)
        obs.unobserve(el)
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, durationMs])

  return ref as React.RefObject<HTMLSpanElement>
}

// ─── useParallax ──────────────────────────────────────────────────────────
// Returns a ref. The element translates Y by (scroll * speed) pixels.
// speed=0.3 means the element moves 30% as fast as scroll = parallax depth.
export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      el.style.transform = `translateY(${center * speed}px)`
    }

    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
  }, [speed])

  return ref as React.RefObject<HTMLDivElement>
}

// ─── useMagnetic ──────────────────────────────────────────────────────────
// Subtle magnetic pull toward cursor on hover.
export function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
      el.style.transition = "transform 0.1s ease"
    }

    const onLeave = () => {
      el.style.transform = ""
      el.style.transition = `transform 0.5s ${ease}`
    }

    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [strength])

  return ref as React.RefObject<HTMLButtonElement>
}

// ─── useFadeUp ────────────────────────────────────────────────────────────
// Simple fade + translate-up on scroll into view.
export function useFadeUp(delayMs = 0) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = "0"
    el.style.transform = "translateY(32px)"
    el.style.transition = `opacity 0.8s ease ${delayMs}ms, transform 0.8s ${ease} ${delayMs}ms`

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.opacity = "1"
        el.style.transform = "translateY(0)"
        obs.unobserve(el)
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delayMs])

  return ref as React.RefObject<HTMLDivElement>
}

// ─── useStaggerReveal ─────────────────────────────────────────────────────
// Children with class "stagger-child" appear one by one on scroll.
export function useStaggerReveal(staggerMs = 80) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = Array.from(el.querySelectorAll<HTMLElement>(".stagger-child"))
    children.forEach((child) => {
      child.style.opacity = "0"
      child.style.transform = "translateY(40px)"
      child.style.transition = `opacity 0.7s ease, transform 0.7s ${ease}`
    })

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * staggerMs}ms`
          child.style.opacity = "1"
          child.style.transform = "translateY(0)"
        })
        obs.unobserve(el)
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [staggerMs])

  return ref as React.RefObject<HTMLDivElement>
}

// ─── useScrollProgress ────────────────────────────────────────────────────
// Tracks 0–1 scroll progress of the page. Returns a ref to update imperatively.
export function useScrollProgress(
  onProgress: (pct: number) => void,
  deps: unknown[] = []
) {
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      onProgress(total > 0 ? window.scrollY / total : 0)
    }
    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => window.removeEventListener("scroll", update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// ─── useCursorParallax ────────────────────────────────────────────────────
// The element shifts slightly based on mouse position — gives a 3D depth feel.
export function useCursorParallax(depth = 15) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = ((e.clientX - cx) / cx) * depth
      const dy = ((e.clientY - cy) / cy) * depth
      el.style.transform = `translate(${dx}px, ${dy}px)`
      el.style.transition = "transform 0.15s ease"
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [depth])

  return ref as React.RefObject<HTMLDivElement>
}

// ─── useStickyReveal ─────────────────────────────────────────────────────
// Returns a callback ref + scroll handler.
// The element starts as translateY(80px) opacity-0 and reveals on first scroll.
export function useStickyReveal() {
  const ref = useRef<HTMLElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = "0"
    el.style.transform = "translateY(80px)"
    el.style.transition = `opacity 1s ease, transform 1s ${ease}`

    const trigger = () => {
      if (done.current) return
      done.current = true
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    }

    // Reveal after a tiny delay on mount (lets hero animate first)
    const t = setTimeout(trigger, 1200)
    return () => clearTimeout(t)
  }, [])

  return ref as React.RefObject<HTMLDivElement>
}
