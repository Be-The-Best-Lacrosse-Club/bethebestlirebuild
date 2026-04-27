import type React from "react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"

interface SectionHeaderProps {
  number: string
  label: string
  title: string
  subtitle?: string
  light?: boolean
}

export function SectionHeader({ number, label, title, subtitle, light = false }: SectionHeaderProps) {
  const ref = useReveal()
  const titleRef = useWordSplit(55)

  return (
    <div ref={ref} className="mb-16 max-w-[680px]">
      <div className="flex items-center gap-3 mb-5">
        <span className={`text-[0.65rem] font-bold tracking-[3px] uppercase ${light ? "text-black/30" : "text-white/25"}`}>
          {number}
        </span>
        <div className={`h-px w-8 ${light ? "bg-black/15" : "bg-white/10"}`} />
        <span className={`text-[0.65rem] font-bold tracking-[3px] uppercase ${light ? "text-[var(--btb-red)]" : "text-[var(--btb-red)]"}`}>
          {label}
        </span>
      </div>
      <h2
        ref={titleRef as React.RefObject<HTMLHeadingElement>}
        className={`font-display uppercase leading-[0.95] tracking-wide ${light ? "text-black" : "text-white"}`}
        style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-[0.92rem] leading-[1.8] ${light ? "text-black/50" : "text-white/40"}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
