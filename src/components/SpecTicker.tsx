interface SpecTickerProps {
  items?: string[]
}

export function SpecTicker({ items = [
  "BTB_ELITE_ACADEMY",
  "8:1_COACH_RATIO",
  "PRO_LEVEL_FILM",
  "16_WEEK_CURRICULUM",
  "LONG_ISLAND_NY",
  "30+_COACHES",
  "90+_LESSONS",
  "RECRUIT_READY",
] }: SpecTickerProps) {
  const doubled = [...items, ...items]

  return (
    <div className="bg-black border-y border-white/5 py-6 overflow-hidden whitespace-nowrap">
      <div className="flex gap-12 animate-scroll-fast">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            {doubled.map((item, j) => (
              <span
                key={j}
                className={`font-display text-2xl uppercase tracking-[8px] ${
                  j % 2 === 0 ? "text-white/10" : "text-[var(--btb-red)]"
                }`}
              >
                {j % 2 === 0 ? item : "//"}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
