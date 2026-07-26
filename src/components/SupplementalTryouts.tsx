import { ArrowRight, CalendarDays, Clock3, MapPin, Users } from "lucide-react"

const slots = [
  { time: "9–10 AM", years: "2037–2034" },
  { time: "10–11 AM", years: "2033–2031" },
]

export function SupplementalTryouts() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-neutral-950 px-5 py-16 text-white sm:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(210,38,48,0.18),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[3px] text-[var(--btb-red)]">
            <span className="h-px w-8 bg-[var(--btb-red)]" />
            Boys &amp; Girls
          </div>
          <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase leading-[0.86] tracking-wide">
            Supplemental
            <br />
            <span className="text-[var(--btb-red)]">Tryouts.</span>
          </h2>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-black uppercase tracking-[1.5px] text-white/70">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} className="text-[var(--btb-red)]" />
              Tuesday, July 28
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--btb-red)]" />
              Plainedge Park
            </span>
          </div>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((slot) => (
              <div key={slot.time} className="border border-white/10 bg-black/35 p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[2px] text-white/45">
                  <Clock3 size={15} className="text-[var(--btb-red)]" />
                  {slot.time}
                </div>
                <div className="font-display text-3xl uppercase tracking-wide text-white">
                  {slot.years}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-[2px] text-white/45">
                  <Users size={14} />
                  Boys &amp; Girls
                </div>
              </div>
            ))}
          </div>
          <a
            href="/tryouts"
            className="mt-4 inline-flex w-full items-center justify-center gap-3 bg-[var(--btb-red)] px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:bg-[var(--btb-red-dark)] sm:w-auto"
          >
            View Full Schedule
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
