import { ArrowRight, Handshake, Target, Zap } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"

const sponsors = [
  {
    name: "SAB Training",
    category: "Skill Development",
    detail: "Position-specific stick skill, IQ, and player development led by Steve Bentz.",
    icon: Target,
  },
  {
    name: "Ghost Athletics",
    category: "Speed + Agility",
    detail: "Lacrosse-specific athletic training built around first step, change of direction, and conditioning.",
    icon: Zap,
  },
  {
    name: "Sponsor BTB",
    category: "Local Business Partners",
    detail: "Support Long Island lacrosse families, teams, clinics, events, and player development.",
    icon: Handshake,
    href: "mailto:info@bethebestli.com?subject=BTB%20Sponsorship%20Inquiry",
  },
]

export function SponsorsSection() {
  const gridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black px-4 py-14 text-white md:px-6 md:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)]">
              <div className="h-px w-8 bg-[var(--btb-red)]" />
              Sponsors + Partners
            </div>
            <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] uppercase leading-[0.88] tracking-wide">
              Backing The <span className="text-[var(--btb-red)]">Standard.</span>
            </h2>
          </div>
          <p className="max-w-[390px] text-[1.05rem] leading-relaxed text-white/65">
            The businesses and training partners helping BTB build better athletes and stronger lacrosse families on Long Island.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {sponsors.map((sponsor) => {
            const Icon = sponsor.icon
            const content = (
              <>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-[var(--btb-red)]/12 text-[var(--btb-red)]">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>
                  <div className="text-[0.72rem] font-black uppercase tracking-[2.5px] text-white/35">
                    {sponsor.category}
                  </div>
                </div>
                <div className="font-display text-[2.6rem] uppercase leading-[0.9] tracking-wide text-white">
                  {sponsor.name}
                </div>
                <p className="mt-5 min-h-[84px] text-[1.0rem] leading-relaxed text-white/65">{sponsor.detail}</p>
                {sponsor.href ? (
                  <div className="mt-8 inline-flex items-center gap-2 text-[0.84rem] font-black uppercase tracking-[2px] text-[var(--btb-red)]">
                    Start a Conversation <ArrowRight size={13} />
                  </div>
                ) : null}
              </>
            )

            if (sponsor.href) {
              return (
                <a
                  key={sponsor.name}
                  href={sponsor.href}
                  className="reveal-child group block rounded border border-[var(--btb-red)]/35 bg-[var(--btb-red)]/[0.06] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)] hover:bg-[var(--btb-red)]/[0.1]"
                >
                  {content}
                </a>
              )
            }

            return (
              <div
                key={sponsor.name}
                className="reveal-child rounded border border-white/[0.08] bg-white/[0.025] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
