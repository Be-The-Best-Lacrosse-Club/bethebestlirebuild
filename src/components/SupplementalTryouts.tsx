import { ArrowRight, CalendarDays, Clock3, MapPin, Users } from "lucide-react"
import { SUPPLEMENTAL_TRYOUTS_REGISTRATION_URL } from "@/lib/registrationLinks"

type TryoutDay = {
  day: string
  date: string
  group: string
  full?: boolean
  slots: { time: string; years: string }[]
}

const tryoutDays: TryoutDay[] = [
  {
    day: "Tuesday",
    date: "July 28",
    group: "Girls",
    slots: [
      { time: "9–10 AM", years: "2037–2034" },
      { time: "10–11 AM", years: "2033–2031" },
    ],
  },
  {
    day: "Wednesday",
    date: "July 29",
    group: "Boys",
    slots: [
      { time: "9–10 AM", years: "2037–2034" },
      { time: "10–11 AM", years: "2033–2030" },
    ],
  },
  {
    day: "Thursday",
    date: "July 30",
    group: "Open",
    full: true,
    slots: [{ time: "9–11 AM · 20-min slots", years: "2037–2030" }],
  },
]

export function SupplementalTryouts() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-neutral-950 px-5 py-16 text-white sm:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(210,38,48,0.18),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 flex items-start gap-3 text-sm font-black uppercase tracking-[3px] text-[var(--btb-red)] sm:items-center">
            <span className="mt-2 h-px w-8 shrink-0 bg-[var(--btb-red)] sm:mt-0" />
            <span className="min-w-0">Tuesday · Wednesday · Thursday</span>
          </div>
          <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase leading-[0.86] tracking-wide">
            Supplemental
            <br />
            <span className="text-[var(--btb-red)]">Tryouts.</span>
          </h2>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-black uppercase tracking-[1.5px] text-white/70">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--btb-red)]" />
              Plainedge Park
            </span>
          </div>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tryoutDays.map((tryoutDay) => (
              <div
                key={tryoutDay.day}
                className={`border border-white/10 bg-black/35 p-6 ${
                  tryoutDay.full ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-5 border-b border-white/10 pb-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-[var(--btb-red)]">
                    <CalendarDays size={14} />
                    {tryoutDay.date}
                  </div>
                  <div className="font-display text-3xl uppercase tracking-wide text-white">
                    {tryoutDay.day} · {tryoutDay.group}
                  </div>
                </div>
                <div className="space-y-4">
                  {tryoutDay.slots.map((slot) => (
                    <div key={slot.time}>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-white/45">
                        <Clock3 size={14} className="text-[var(--btb-red)]" />
                        {slot.time}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-white">
                        <Users size={15} className="text-white/45" />
                        {slot.years}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={SUPPLEMENTAL_TRYOUTS_REGISTRATION_URL}
              className="inline-flex items-center justify-center gap-3 bg-[var(--btb-red)] px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:bg-[var(--btb-red-dark)]"
            >
              Register
              <ArrowRight size={14} />
            </a>
            <a
              href="/tryouts"
              className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:border-white/40 hover:bg-white/[0.06]"
            >
              View Full Schedule
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
