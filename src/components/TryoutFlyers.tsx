import { ArrowRight } from "lucide-react"

type TryoutFlyersProps = {
  eyebrow?: string
  ctaHref?: string
  ctaLabel?: string
  includeEast?: boolean
}

const flyers = [
  {
    title: "BTB East",
    label: "Boys East Tryouts",
    href: "/register-boys-east-tryouts",
    image: "/images/tryouts/BTB_East_Tryouts_2026.jpg",
    alt: "BTB East 2026 tryout flyer for July 13 and 16 at Seaford High School",
    width: 1024,
    height: 1536,
  },
  {
    title: "Boys",
    label: "Boys Tryouts",
    href: "/register-boys-tryouts",
    image: "/images/tryouts/BTB_Boys_Tryouts_2026.png",
    alt: "BTB boys 2026 tryout flyer — Seaford High School, Seaford NY",
    width: 720,
    height: 540,
  },
  {
    title: "Girls",
    label: "Girls Tryouts",
    href: "/register-girls-tryouts",
    image: "/images/tryouts/BTB_Girls_Tryouts_2026.png",
    alt: "BTB girls 2026 tryout flyer — Seaford High School",
    width: 820,
    height: 1464,
  },
]

export function TryoutFlyers({
  eyebrow = "2026 Tryouts",
  ctaHref = "/tryouts",
  ctaLabel = "Compare Tryout Options",
  includeEast = true,
}: TryoutFlyersProps) {
  const visibleFlyers = includeEast ? flyers : flyers.filter((flyer) => flyer.title !== "BTB East")

  return (
    <section className="relative overflow-hidden bg-black px-4 py-14 text-white md:px-6 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,38,48,0.18),transparent_42%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--btb-red)]/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1180px]">
        <div className="mb-9 flex flex-col gap-5 border-b border-white/10 pb-7 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)]">
              <div className="h-px w-8 bg-[var(--btb-red)]" />
              {eyebrow}
            </div>
            <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] uppercase leading-[0.88] tracking-wide">
              Earn Your <span className="text-[var(--btb-red)]">Spot.</span>
            </h2>
          </div>
          <a
            href={ctaHref}
            className="inline-flex w-fit items-center justify-center gap-2 bg-[var(--btb-red)] px-7 py-4 text-[1.0rem] font-black uppercase tracking-[2px] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--btb-red-dark)] hover:shadow-[0_14px_34px_rgba(210,38,48,0.34)]"
          >
            {ctaLabel} <ArrowRight size={14} />
          </a>
        </div>

        <div
          className={`grid grid-cols-1 items-start gap-3 md:auto-cols-auto md:grid-flow-row md:gap-5 lg:gap-5 ${
            visibleFlyers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
          aria-label="BTB 2026 tryout flyers"
        >
          {visibleFlyers.map((flyer) => (
            <a
              key={flyer.title}
              href={flyer.href}
              className="group flex min-h-[132px] overflow-hidden border border-white/10 bg-neutral-950 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)] md:block md:min-h-0"
            >
              <div className="relative w-[112px] shrink-0 bg-white md:w-full md:bg-black">
                <img
                  src={flyer.image}
                  alt={flyer.alt}
                  className="block h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] md:h-auto"
                  loading="lazy"
                  decoding="async"
                  width={flyer.width}
                  height={flyer.height}
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 border-l border-white/10 px-4 py-3 md:border-l-0 md:border-t sm:px-5 sm:py-4">
                <div>
                  <div className="font-display text-[1.65rem] uppercase leading-none tracking-wide text-white sm:text-2xl">{flyer.title}</div>
                  <div className="mt-1 text-[0.7rem] font-black uppercase leading-tight tracking-[2.2px] text-white/60">{flyer.label}</div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--btb-red)] text-white transition-transform duration-300 group-hover:translate-x-1 sm:h-10 sm:w-10">
                  <ArrowRight size={15} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
