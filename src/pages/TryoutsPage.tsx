import { useEffect } from "react"
import { ArrowRight, CalendarDays, Clock3, Mail, MapPin, Users } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

const SCHEDULE = [
  {
    time: "9:00–10:00 AM",
    gradYears: "2037–2034",
  },
  {
    time: "10:00–11:00 AM",
    gradYears: "2033–2031",
  },
]

export function TryoutsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <SEO
        title="Supplemental Tryouts | BTB Lacrosse"
        description="BTB boys and girls supplemental tryouts on Tuesday, July 28, 2026 at Plainedge Park. Graduation years 2037 through 2031."
        path="/tryouts"
      />

      <section className="relative px-5 pb-24 pt-32 sm:px-6 sm:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(210,38,48,0.2),transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--btb-red)]/70 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1120px]">
          <div className="mb-12 max-w-[870px] sm:mb-16">
            <div className="mb-6 flex items-center gap-3 font-mono text-sm font-bold uppercase tracking-[3px] text-[var(--btb-red)] sm:text-base sm:tracking-[5px]">
              <span className="h-px w-8 bg-[var(--btb-red)]" />
              Boys &amp; Girls
            </div>
            <h1 className="font-display text-[clamp(3.6rem,10vw,7.5rem)] uppercase leading-[0.82] tracking-wide">
              Supplemental
              <br />
              <span className="text-[var(--btb-red)]">Tryouts.</span>
            </h1>
            <p className="mt-8 max-w-[680px] text-lg font-medium leading-relaxed text-white/70 sm:text-xl">
              One morning for BTB boys and girls graduation years 2037 through 2031.
              Find your graduation-year time below.
            </p>
          </div>

          <div className="grid overflow-hidden border border-white/10 bg-white/[0.025] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="mb-10 space-y-7">
                <div>
                  <div className="mb-3 flex items-center gap-3 text-sm font-black uppercase tracking-[2.5px] text-[var(--btb-red)]">
                    <CalendarDays size={17} />
                    Date
                  </div>
                  <div className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                    Tuesday
                  </div>
                  <div className="mt-1 text-base font-bold uppercase tracking-[1.5px] text-white/55">
                    July 28, 2026
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-3 text-sm font-black uppercase tracking-[2.5px] text-[var(--btb-red)]">
                    <MapPin size={17} />
                    Location
                  </div>
                  <div className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                    Plainedge Park
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-3 text-sm font-black uppercase tracking-[2.5px] text-[var(--btb-red)]">
                    <Clock3 size={17} />
                    Event Window
                  </div>
                  <div className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                    9:00–11:00 AM
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-7">
                <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[2px] text-white">
                  <Users size={16} className="text-[var(--btb-red)]" />
                  All Boys &amp; Girls
                </div>
                <p className="text-base leading-relaxed text-white/60">
                  Graduation years 2037 through 2031.
                </p>
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <div className="mb-7 text-sm font-black uppercase tracking-[3px] text-white/45">
                Graduation-Year Schedule
              </div>

              <div className="space-y-4">
                {SCHEDULE.map((slot, index) => (
                  <div
                    key={slot.time}
                    className="grid gap-5 border border-white/10 bg-black/40 p-6 sm:grid-cols-[88px_1fr] sm:items-center sm:p-7"
                  >
                    <div className="font-mono text-sm font-bold uppercase tracking-[2px] text-[var(--btb-red)]">
                      Slot {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <div className="font-display text-[2rem] uppercase leading-none tracking-wide text-white sm:text-[2.35rem]">
                          {slot.time}
                        </div>
                        <div className="mt-2 text-sm font-black uppercase tracking-[2px] text-white/45">
                          Boys &amp; Girls
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-xs font-black uppercase tracking-[2px] text-white/40">
                          Grad Years
                        </div>
                        <div className="mt-1 font-display text-3xl uppercase tracking-wide text-white">
                          {slot.gradYears}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-white/10 pt-7">
                <p className="mb-5 text-base leading-relaxed text-white/60">
                  Questions about the supplemental tryout schedule or graduation-year placement?
                </p>
                <a
                  href="mailto:info@bethebestli.com?subject=Supplemental%20Tryout%20Question"
                  className="inline-flex items-center gap-3 bg-[var(--btb-red)] px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--btb-red-dark)]"
                >
                  <Mail size={16} />
                  Email BTB
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
