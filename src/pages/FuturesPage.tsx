import { useEffect } from "react"
import { ArrowRight, MapPin, Clock, Users, Mic, Calendar } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

type FuturesEvent = {
  location: string
  venue: string
  address: string
  date: string
  time: string
}

// TODO: Confirm exact dates and times for each location.
const FUTURES_EVENTS: FuturesEvent[] = [
  {
    location: "Stimson",
    venue: "Stimson",
    address: "Long Island, NY",
    date: "Mid-May 2026 — TBD",
    time: "Time TBD · 2 Hours",
  },
  {
    location: "Nickerson",
    venue: "Nickerson",
    address: "Long Island, NY",
    date: "Late May 2026 — TBD",
    time: "Time TBD · 2 Hours",
  },
  {
    location: "Seaford",
    venue: "Seaford High School",
    address: "Seaford, NY",
    date: "June 2026 — TBD",
    time: "Time TBD · 2 Hours",
  },
]

const ITINERARY = [
  {
    block: "Hour 1",
    title: "On the Field — The Clinic",
    detail: "Players (Classes of 2034–2037) work with the BTB pro coaching staff. Stick skills, footwork, small-sided games, and the BTB Standard in action.",
    icon: Users,
  },
  {
    block: "Hour 1 (Parallel)",
    title: "On the Sideline — Meet the Administrators",
    detail: "Parents meet the BTB directors and program admins. Get answers on rosters, schedules, travel, fees, and what your family signs up for.",
    icon: Mic,
  },
  {
    block: "Hour 2",
    title: "Presentation — Dan Achatz",
    detail: "Owner Dan Achatz on what BTB is, the culture that built us, and exactly what to expect at tryouts and through the 2026–27 season.",
    icon: Calendar,
  },
]

export function FuturesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Futures Meet-Up | BTB Lacrosse Club"
        description="Meet the BTB staff, work the BTB Standard, and hear from owner Dan Achatz. Three Long Island locations — Stimson, Nickerson, and Seaford — kicking off this May and June."
        path="/futures"
      />

      {/* Hero */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-[900px] mx-auto pt-16">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">
            BTB Futures · Meet-Up Tour
          </div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            The Future<br />Starts Here.
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[560px] leading-[1.9] mb-10">
            Three locations. Two hours. One standard. Bring your player out for a free clinic with the BTB pro
            staff while the parents meet the people running the program. Then hear directly from owner Dan Achatz
            on the BTB culture and the path to tryouts.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="#locations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200"
            >
              See Locations <ArrowRight size={13} />
            </a>
            <a
              href="#itinerary"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
            >
              What Happens
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "3", label: "Locations" },
              { num: "2 hrs", label: "Per Session" },
              { num: "2034–37", label: "Grad Years" },
              { num: "Free", label: "To Attend" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="locations" className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            Pick Your Spot
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Three Locations.<br />Same Standard.
          </h2>
          <p className="text-[0.84rem] text-white/35 mb-14 max-w-[480px] leading-relaxed">
            Show up to whichever location works for your family. Same staff, same content, same BTB.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FUTURES_EVENTS.map((e) => (
              <div
                key={e.location}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-[var(--btb-red)]/40 hover:bg-[var(--btb-red)]/5 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)] mb-5">
                  <MapPin size={12} />
                  {e.location}
                </div>
                <div className="font-display text-[1.4rem] uppercase tracking-wide text-white leading-tight mb-2">
                  {e.venue}
                </div>
                <div className="text-[0.78rem] text-white/35 mb-6">{e.address}</div>
                <div className="space-y-2 pt-5 border-t border-white/[0.07]">
                  <div className="flex items-center gap-2 text-[0.78rem] text-white/55">
                    <Calendar size={12} className="text-[var(--btb-red)]" />
                    {e.date}
                  </div>
                  <div className="flex items-center gap-2 text-[0.78rem] text-white/55">
                    <Clock size={12} className="text-[var(--btb-red)]" />
                    {e.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section id="itinerary" className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            What Happens In 2 Hours
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            One Session.<br />Three Things.
          </h2>

          <div className="space-y-3">
            {ITINERARY.map((item, i) => (
              <div
                key={item.title}
                className={`flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-7 rounded-xl border transition-colors ${
                  i === ITINERARY.length - 1
                    ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                }`}
              >
                <div className="shrink-0 md:w-44">
                  <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center mb-3">
                    <item.icon size={18} strokeWidth={1.5} className="text-[var(--btb-red)]" />
                  </div>
                  <div className="font-display text-[1rem] uppercase tracking-wide text-white">{item.block}</div>
                </div>
                <div className="hidden md:block w-px self-stretch bg-white/[0.08]" />
                <div className="flex-1">
                  <div className="font-display text-[1.1rem] uppercase tracking-wide text-white mb-2">
                    {item.title}
                  </div>
                  <p className="text-[0.84rem] text-white/40 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">
                Save Your Spot
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Bring Your Player.<br />
                <span className="text-[var(--btb-red)]">See What BTB Is.</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[460px] mx-auto leading-relaxed mb-10">
                Free to attend. Limited spots per location. Confirm your spot and we'll send the field address
                and gear list a few days out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/interest"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200"
                >
                  RSVP for a Meet-Up <ArrowRight size={13} />
                </a>
                <a
                  href="/tryouts"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Tryout Info
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
