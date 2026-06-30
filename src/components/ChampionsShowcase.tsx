import { Trophy } from "lucide-react"
import { championTeams } from "@/lib/championTeams"

export function ChampionsShowcase() {
  const featuredImage = championTeams[0]?.image

  return (
    <section
      className="relative isolate overflow-hidden bg-black px-4 pb-10 pt-24 text-white md:px-6 md:pb-14 md:pt-28"
      aria-labelledby="champions-wall-title"
    >
      <div className="absolute inset-0 -z-10">
        {featuredImage && (
          <img
            src={featuredImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.92)_62%,#000)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[var(--btb-red)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px]">
        <div className="mb-6 max-w-[920px] md:mb-7">
          <div className="mb-4 inline-flex items-center gap-3 text-[0.78rem] font-black uppercase tracking-[4px] text-[var(--btb-red)] md:text-[0.84rem]">
            <Trophy size={16} />
            Season Champions Wall
          </div>
          <h1
            id="champions-wall-title"
            className="font-display text-[clamp(3.2rem,8vw,6.8rem)] uppercase leading-[0.84] tracking-wide"
          >
            BTB Tournament <span className="text-[var(--btb-red)]">Champions</span>
          </h1>
        </div>

        <div className="grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible md:pb-0 lg:gap-5 [&::-webkit-scrollbar]:hidden">
          {championTeams.map((team, index) => (
            <article
              key={team.id}
              className="group snap-center overflow-hidden rounded-md border border-white/10 bg-neutral-950 shadow-[0_24px_80px_rgba(0,0,0,0.42)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/70"
            >
              <div className="aspect-[4/5] overflow-hidden bg-black">
                <img
                  src={team.image}
                  alt={team.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width={team.width}
                  height={team.height}
                />
              </div>
              <div className="border-t border-white/10 px-4 py-4 md:px-5 md:py-5">
                <div className="mb-3 inline-flex bg-[var(--btb-red)] px-3 py-1 text-[0.72rem] font-black uppercase tracking-[2px] text-white">
                  {team.result}
                </div>
                <h2 className="font-display text-3xl uppercase leading-none tracking-wide text-white md:text-4xl">
                  {team.team}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] font-black uppercase tracking-[2.2px] text-white/55">
                  <span>{team.tournament}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--btb-red)]" />
                  <span>{team.season}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[780px] text-[0.9rem] font-semibold leading-relaxed text-white/72 md:text-[1rem]">
            Congrats to the BTB teams already bringing home tournament titles. This wall stays up all season and grows every time another team wins.
          </p>
          <div className="text-[0.72rem] font-black uppercase tracking-[2.4px] text-white/55 md:text-right">
            {championTeams.length} championship teams posted
          </div>
        </div>
      </div>
    </section>
  )
}
