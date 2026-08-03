import { useEffect } from "react"
import { ArrowRight, Flame, Mail, Users } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

const openings = [
  {
    demand: "High demand",
    accent: "red",
    teams: [
      { year: "2037", program: "Boys", coach: "Coach Taylor" },
      { year: "2037", program: "Girls", coach: "Coach Dan" },
    ],
  },
  {
    demand: "Medium demand",
    accent: "white",
    teams: [
      { year: "2034", program: "Girls", coach: "Coach Dan" },
      { year: "2032", program: "Boys", coach: "Coach Taylor" },
    ],
  },
]

function contactHref(program: string, year: string, coach: string) {
  const recipient = program === "Boys" ? "coachtbtb@gmail.com" : "info@bethebestli.com"
  const subject = `Players Wanted — ${year} ${program} — ${coach}`
  const body = `Hi ${coach},\n\nI'm interested in learning more about an opening for the BTB ${year} ${program} team.\n\nPlayer name:\nCurrent team/experience:\nPrimary position:\nParent/guardian phone:\n\nThank you.`
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function PlayersWantedPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO
        title="Players Wanted | BTB Lacrosse"
        description="Current roster opportunities for BTB boys and girls lacrosse teams on Long Island."
        path="/players-wanted"
      />

      <main className="min-h-screen overflow-hidden bg-black pt-16 text-white">
        <section className="relative border-b border-white/10 px-5 py-20 md:px-8 md:py-28">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(210,38,48,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(210,38,48,.08)_1px,transparent_1px)] [background-size:90px_90px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--btb-red)]/20 blur-[120px]" />

          <div className="relative mx-auto max-w-[1120px]">
            <h1 className="max-w-[900px] font-display text-[clamp(4rem,11vw,9rem)] uppercase leading-[0.78] tracking-tight">
              Players<br /><span className="text-[var(--btb-red)]">Wanted.</span>
            </h1>
            <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-[650px] text-lg font-semibold leading-relaxed text-white/70 md:text-xl">
                A small number of roster opportunities are open for committed players ready to develop, compete, and meet the BTB standard.
              </p>
              <a href="#openings" className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[2.5px] text-white hover:text-[var(--btb-red)]">
                View openings <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <section id="openings" className="px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            {openings.map((group, groupIndex) => (
              <div key={group.demand} className={groupIndex ? "mt-16 md:mt-20" : ""}>
                <div className="mb-5 flex items-center gap-3">
                  {groupIndex === 0 ? <Flame size={20} className="text-[var(--btb-red)]" /> : <Users size={20} className="text-white/55" />}
                  <h2 className={`font-display text-2xl uppercase tracking-wider ${group.accent === "red" ? "text-[var(--btb-red)]" : "text-white"}`}>
                    {group.demand}
                  </h2>
                </div>

                <div className="divide-y divide-white/10 border-y border-white/10">
                  {group.teams.map((team) => (
                    <article key={`${team.year}-${team.program}`} className="group grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center md:py-10">
                      <div className="flex items-center gap-6 md:gap-10">
                        <span className="font-display text-[clamp(3.4rem,8vw,6rem)] leading-none text-white transition-colors group-hover:text-[var(--btb-red)]">
                          {team.year}
                        </span>
                        <div>
                          <h3 className="font-display text-2xl uppercase tracking-wider md:text-3xl">{team.program} Lacrosse</h3>
                          <p className="mt-2 text-sm font-bold uppercase tracking-[2px] text-white/50">Contact {team.coach}</p>
                        </div>
                      </div>
                      <a
                        href={contactHref(team.program, team.year, team.coach)}
                        className="inline-flex min-h-12 items-center justify-center gap-3 bg-[var(--btb-red)] px-6 text-sm font-black uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black"
                      >
                        <Mail size={16} /> Reach out <ArrowRight size={15} />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-16 border-l-2 border-[var(--btb-red)] bg-white/[0.035] p-6 md:mt-20 md:p-8">
              <p className="max-w-[760px] text-base font-semibold leading-relaxed text-white/65">
                Include the player’s name, graduation year, primary position, current experience, and a parent or guardian phone number. A coach will follow up about fit and next steps.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
