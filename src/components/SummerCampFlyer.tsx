import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react"

const FLYER_SRC = "/images/tryouts/BTB_Summer_Camp_2026.jpg"
const REGISTER_HREF = "/register-camp"

type SummerCampFlyerProps = {
  compact?: boolean
}

export function SummerCampFlyer({ compact = false }: SummerCampFlyerProps) {
  return (
    <section
      id="summer-camp"
      className={`relative overflow-hidden bg-black px-4 text-white md:px-6 ${
        compact ? "py-16" : "py-20 md:py-24"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(210,38,48,0.2),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--btb-red)]/70 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-center">
        <a
          href={REGISTER_HREF}
          className="group block overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/60"
          aria-label="Register for BTB Lacrosse Summer Camp"
        >
          <img
            src={FLYER_SRC}
            alt="BTB Lacrosse Summer Camp flyer for June 30 through July 3 at Plainedge Park"
            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            width={798}
            height={1200}
            loading={compact ? "lazy" : "eager"}
            decoding="async"
          />
        </a>

        <div>
          <div className="mb-5 flex items-center gap-3 text-[1.0rem] font-black uppercase tracking-[4px] text-[var(--btb-red)]">
            <span className="h-px w-8 bg-[var(--btb-red)]" />
            200+ Campers · Don't Miss Out
          </div>

          <h2 className="font-display text-[clamp(2.8rem,8vw,6rem)] uppercase leading-[0.88] tracking-wide">
            BTB Summer<br />
            <span className="text-[var(--btb-red)]">Camp Is Live.</span>
          </h2>

          <p className="mt-6 max-w-[620px] text-[1.12rem] leading-relaxed text-white/70 md:text-[1.2rem]">
            Four days at Plainedge Park for boys and girls in K-8th grade. Skills, games, position work,
            competition, and summer fun with the BTB staff.
          </p>

          <div className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: CalendarDays, label: "June 30 - July 3" },
              { icon: Clock, label: "9 AM - 2 PM Daily" },
              { icon: MapPin, label: "Plainedge Park" },
              { icon: Users, label: "Boys & Girls K-8th" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--btb-red)]/15 text-[var(--btb-red)]">
                  <item.icon size={18} strokeWidth={1.7} />
                </span>
                <span className="text-[0.98rem] font-black uppercase tracking-[1.5px] text-white/85">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={REGISTER_HREF}
              className="inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-8 py-4 text-[1.0rem] font-black uppercase tracking-[2px] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--btb-red-dark)] hover:shadow-[0_14px_34px_rgba(210,38,48,0.34)]"
            >
              Register for Camp <ArrowRight size={14} />
            </a>
            <a
              href="/camps"
              className="inline-flex items-center justify-center border border-white/15 px-8 py-4 text-[1.0rem] font-black uppercase tracking-[2px] text-white/80 transition-all duration-200 hover:border-white/35 hover:text-white"
            >
              Camp Details
            </a>
          </div>

          <div className="mt-5 text-[0.92rem] font-bold uppercase tracking-[2px] text-white/35">
            Cost: $300 · Register at bethebestli.com
          </div>
        </div>
      </div>
    </section>
  )
}
