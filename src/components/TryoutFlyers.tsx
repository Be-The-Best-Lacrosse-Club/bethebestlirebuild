import { ArrowRight } from "lucide-react"

type TryoutFlyersProps = {
  eyebrow?: string
  ctaHref?: string
  ctaLabel?: string
}

const flyers = [
  {
    title: "BTB East",
    label: "Boys East Tryouts",
    href: "/register-boys-east-tryouts",
    image: "/images/tryouts/BTB_East_Tryouts_2026.jpg",
    alt: "BTB East 2026 tryout flyer for July 13 and 16 at St. Joseph's University",
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
}: TryoutFlyersProps) {
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
          className="grid auto-cols-[82%] grid-flow-col gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible md:pb-0 lg:gap-5 [&::-webkit-scrollbar]:hidden"
          aria-label="BTB 2026 tryout flyers"
        >
          {flyers.map((flyer) => (
            <a
              key={flyer.title}
              href={flyer.href}
              className="group block snap-center overflow-hidden border border-white/10 bg-neutral-950 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
            >
              <div className="relative bg-black">
                <img
                  src={flyer.image}
                  alt={flyer.alt}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  width={flyer.width}
                  height={flyer.height}
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
                <div>
                  <div className="font-display text-2xl uppercase tracking-wide text-white">{flyer.title}</div>
                  <div className="text-[0.72rem] font-black uppercase tracking-[2.5px] text-white/55">{flyer.label}</div>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--btb-red)] text-white transition-transform duration-300 group-hover:translate-x-1">
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
