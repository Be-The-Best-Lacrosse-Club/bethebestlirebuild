import { useEffect } from "react"
import { ArrowRight, MapPin, Clock, Users, Mic, Calendar } from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import { TryoutFlyers } from "@/components/TryoutFlyers"

type FuturesEvent = {
  location: string
  venue: string
  address: string
  date: string
  time: string
}

type FuturesEventExtended = FuturesEvent & {
  status: "completed" | "coming_soon"
  badge?: string
}

const FUTURES_EVENTS: FuturesEventExtended[] = [
  {
    location: "Huntington",
    venue: "Stimson Middle School",
    address: "Huntington, NY",
    date: "June 18, 2026",
    time: "6:00 - 8:00 PM",
    status: "completed",
    badge: "Completed - Great Turnout",
  },
  {
    location: "Seaford",
    venue: "Seaford High School",
    address: "Seaford, NY",
    date: "June 28, 2026",
    time: "9:00 - 11:00 AM",
    status: "completed",
    badge: "Completed - Strong Turnout",
  },
  {
    location: "Point Lookout",
    venue: "TBA",
    address: "Point Lookout, NY",
    date: "Coming Soon",
    time: "Stay Tuned",
    status: "coming_soon",
    badge: "Next Date Coming Soon",
  },
]

const ITINERARY = [
  {
    block: "Hour 1",
    title: "On the Field — The Clinic",
    detail: "Kindergarten through second grade players work with the BTB Futures staff and players. Stick skills, footwork, small-sided games, and the BTB Standard in action.",
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
        title="BTB Futures | K-2 Lacrosse Development"
        description="BTB Futures introduces kindergarten through second grade boys and girls to the BTB lacrosse development path."
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
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">
            BTB Futures · K-2 Development Path
          </div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            The Future<br />Starts Here.
          </h1>
          <p className="text-[1.2rem] text-white/70 max-w-[560px] leading-[1.9] mb-10">
            Stimson and Seaford were both strong Futures events. The next clinic date will be announced soon.
            For now, families can review the tryout path, camps, and club updates.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/tryouts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200"
            >
              View Tryout Info <ArrowRight size={13} />
            </a>
            <a
              href="/camps"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 text-white/78 text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
            >
              Camps & Clinics <ArrowRight size={13} />
            </a>
            <a
              href="#itinerary"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 text-white/78 text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
            >
              What Happens
            </a>
          </div>
        </div>
      </section>

      <TryoutFlyers eyebrow="Futures + Tryouts" ctaHref="/tryouts" ctaLabel="View 2026 Tryouts" />

      {/* Stats strip */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "2", label: "Clinics Completed" },
              { num: "2 hrs", label: "Per Session" },
              { num: "K-2", label: "Grade Range" },
              { num: "Free", label: "To Attend" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[1.1rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">
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
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            Recent Clinics
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Futures Energy.<br />Same Standard.
          </h2>
          <p className="text-[1.1rem] text-white/35 mb-14 max-w-[480px] leading-relaxed">
            Stimson and Seaford are complete. The next Futures date will be announced through the BTB list and social channels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FUTURES_EVENTS.map((e) => (
              <div
                key={e.location}
                className={`group rounded-2xl border p-7 transition-all duration-300 ${
                  e.status === "completed"
                    ? "border-white/[0.05] bg-white/[0.01] opacity-60"
                    : "border-dashed border-white/[0.12] bg-white/[0.01]"
                }`}
              >
                {e.badge && (
                  <div className={`inline-block text-[0.72rem] font-bold uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-4 ${
                    e.status === "completed"
                      ? "bg-white/[0.08] text-white/40"
                      : "bg-white/[0.06] text-white/35"
                  }`}>
                    {e.badge}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[1.08rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)] mb-5">
                  <MapPin size={12} />
                  {e.location}
                </div>
                <div className="font-display text-[1.4rem] uppercase tracking-wide text-white leading-tight mb-2">
                  {e.venue}
                </div>
                <div className="text-[1.05rem] text-white/35 mb-6">{e.address}</div>
                <div className="space-y-2 pt-5 border-t border-white/[0.07]">
                  <div className="flex items-center gap-2 text-[1.05rem] text-white/55">
                    <Calendar size={12} className="text-[var(--btb-red)]" />
                    {e.date}
                  </div>
                  <div className="flex items-center gap-2 text-[1.05rem] text-white/55">
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
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
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
                  <p className="text-[1.1rem] text-white/70 leading-relaxed">{item.detail}</p>
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
              <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">
                Stay In The Loop
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Next Clinic Date.<br />
                <span className="text-[var(--btb-red)]">Sent First.</span>
              </h2>
              <p className="text-[1.15rem] text-white/35 max-w-[460px] mx-auto leading-relaxed mb-10">
                Join the BTB list for Futures clinic announcements, tryout updates, and the next chance to get your young player on the field.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/join"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200"
                >
                  Join The List <ArrowRight size={13} />
                </a>
                <a
                  href="/tryouts"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/78 text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200"
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
