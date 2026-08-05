import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, GraduationCap, Shield, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import homeContent from "@/content/home.json"

const SITE_URL = "https://bethebestli.com"
const homeOgImage = homeContent.seoImage.startsWith("http")
  ? homeContent.seoImage
  : `${SITE_URL}${homeContent.seoImage}`

type ProgramLink = {
  label: string
  href: string
  Icon: LucideIcon
}

const programLinks: ProgramLink[] = [
  { label: "Boys Program", href: "/boys", Icon: Shield },
  { label: "Girls Program", href: "/girls", Icon: Users },
  { label: "Camps & Clinics", href: "/camps", Icon: CalendarDays },
]

const upcomingOpportunities = [
  {
    title: "Girls Mini Camp",
    audience: "Girls · Classes 2031–2036",
    date: "August 19–21 · Times by Grad Year",
    description:
      "Three nights of focused girls training with Coach Dan Achatz and Matt Mauro at Momentum Sports. Sessions are assigned by graduation year.",
    image: "/images/events/BTB_Girls_Mini_Camp_2026.jpg",
    alt: "BTB and Bearded Lax Girls Mini Camp flyer for August 19 through 21, 2026 at Momentum Sports",
    cta: "Register · $150",
    href: "/register-girls-mini-camp",
  },
  {
    title: "Full Circle Elite Training",
    audience: "Boys Elite Training",
    date: "August + September · Dates TBA",
    description:
      "Coach Dan Achatz and Adelphi attackman Braden Donnellan bring high-level skill development and position-specific training to Momentum Sports.",
    image: "/images/events/BTB_Full_Circle_Elite_Training_2026.jpg",
    alt: "Full Circle Elite Training flyer featuring Coach Dan Achatz and Braden Donnellan",
    cta: "Request Training Info",
    href: "/interest",
  },
  {
    title: "Free K–3 Clinic",
    audience: "K–3 Boys + Girls",
    date: "Saturday, August 15",
    description:
      "A free learn-to-play clinic at Momentum Sports in Deer Park. Girls train from 12–1 PM and boys train from 1–2 PM.",
    image: "/images/events/BTB_K3_Momentum_Clinic_2026.jpg",
    alt: "Free BTB K through 3 boys and girls clinic flyer for August 15 at Momentum Sports",
    cta: "Register Interest",
    href: "/interest",
  },
]

const miniCampGroups = [
  { label: "2036/2035 · 5–6 PM", lookupYear: "2036" },
  { label: "2034/2033 · 6–7 PM", lookupYear: "2034" },
  { label: "2032/2031 · 7–8 PM", lookupYear: "2032" },
]

const paths = [
  {
    label: "Boys",
    href: "/boys",
    image: "/images/dodging-action.JPG",
    imagePosition: "center",
    description: "Travel teams, training, film, and recruiting support for committed boys players.",
  },
  {
    label: "Girls",
    href: "/girls",
    image: "/images/demo/girls-action.jpg",
    imagePosition: "center",
    description: "Girls-specific coaching, player development, and team pathways by grad year.",
  },
  {
    label: "Futures",
    href: "/futures",
    image: "/images/huddle-young.JPG",
    imagePosition: "center",
    description: "A clear first step for young players learning the BTB standard early.",
  },
]

const stats = [
  { value: "450+", label: "Players" },
  { value: "22", label: "Teams" },
  { value: "45+", label: "Coaches" },
  { value: "Founded", label: "2021" },
]

const coaches = [
  { name: "Dan Achatz", role: "Founder / Girls Director" },
  { name: "Sean Reynolds", role: "Boys Director" },
  { name: "Mike Gurcio", role: "Futures Director" },
  { name: "Marisa DeAngelo", role: "Girls Futures Director" },
  { name: "Brad Mclam", role: "Development / Recruiting" },
]

export function HomePage() {
  const [soldOutMiniCampGroups, setSoldOutMiniCampGroups] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()

    void Promise.all(
      miniCampGroups.map(async (group) => {
        try {
          const response = await fetch(`/api/girls-mini-camp-register?grad_year=${group.lookupYear}`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          })
          if (!response.ok) return null
          const result = await response.json() as { available?: boolean }
          return result.available === false ? group.label : null
        } catch {
          return null
        }
      }),
    ).then((groups) => {
      if (!controller.signal.aborted) setSoldOutMiniCampGroups(groups.filter((group): group is string => Boolean(group)))
    })

    return () => controller.abort()
  }, [])

  const allMiniCampGroupsSoldOut = soldOutMiniCampGroups.length === miniCampGroups.length

  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Be The Best"
        description="Be The Best Lacrosse Club - Long Island's premier youth lacrosse development program for boys and girls."
        path="/"
        ogImage={homeOgImage}
      />

      <main className="bg-black text-white">
        <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-black pt-24">
          <img
            src="/images/events/BTB_Helmet_Hero_2026.jpg"
            alt="Be The Best Lacrosse Club helmet and facemask under stadium lights"
            className="absolute inset-0 h-full w-full object-contain object-top md:object-cover md:object-center"
            width={1280}
            height={853}
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.94)_86%,#000_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.42)_42%,rgba(0,0,0,0.05)_70%),linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.9)_100%)]" />

          <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-12 pt-16 md:px-8 md:pb-20 lg:pb-24">
            <div className="max-w-[700px]">
              <p className="mb-4 text-xs font-black uppercase tracking-[3px] text-[var(--btb-red)] md:text-sm">
                Long Island · Est. 2021
              </p>
              <h1 className="font-display text-[clamp(3.2rem,7vw,6.9rem)] uppercase leading-[0.88] tracking-wide text-white">
                Built For The Modern Player
              </h1>
              <p className="mt-5 max-w-[600px] text-sm font-semibold leading-7 text-white/80 md:text-lg md:leading-8">
                Boys and girls player development built on culture, elite coaching, and hard work.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/tryouts"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition hover:bg-[var(--btb-red-dark)]"
                >
                  View Tryouts <ArrowRight size={15} />
                </a>
                <a
                  href="#program-paths"
                  className="inline-flex items-center justify-center gap-2 border border-white/60 bg-black/20 px-7 py-4 text-sm font-black uppercase tracking-[2px] text-white transition hover:border-white hover:bg-white hover:text-black"
                >
                  Choose Program
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-9 text-black md:px-8 md:py-12">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="text-center font-display text-[clamp(2.6rem,5vw,4.5rem)] uppercase leading-none tracking-wide text-[var(--btb-red)]">
              2026 Programs
            </h2>
            <div className="mt-8 grid divide-y divide-black/[0.15] border-y border-black/[0.15] md:grid-cols-3 md:divide-x md:divide-y-0">
              {programLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="group flex items-center justify-between gap-5 px-2 py-6 transition hover:bg-black hover:px-5 hover:text-white md:px-8"
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-9 w-9 text-[var(--btb-red)] transition group-hover:text-white" strokeWidth={1.7} />
                    <span className="text-sm font-black uppercase tracking-[1.5px]">{label}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-[var(--btb-red)] transition group-hover:translate-x-1 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="upcoming-opportunities" className="border-y border-white/[0.1] bg-neutral-950 px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[3px] text-[var(--btb-red)]">
                  August + September 2026
                </p>
                <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase leading-none tracking-wide">
                  Upcoming Opportunities
                </h2>
              </div>
              <p className="max-w-[450px] text-sm font-semibold leading-7 text-white/[0.62] md:text-base">
                Upcoming boys and girls training at Momentum Sports, including a free K–3 clinic for new and developing players.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {upcomingOpportunities.map((opportunity) => (
                <article
                  key={opportunity.title}
                  className="flex flex-col overflow-hidden border border-white/[0.12] bg-black"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-black p-2">
                    <img
                      src={opportunity.image}
                      alt={opportunity.alt}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex flex-1 flex-col border-t border-white/[0.1] p-6">
                    <div className="text-[0.7rem] font-black uppercase tracking-[2.2px] text-[var(--btb-red)]">
                      {opportunity.audience}
                    </div>
                    <h3 className="mt-3 font-display text-3xl uppercase leading-none tracking-wide text-white">
                      {opportunity.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-[1.5px] text-white/85">
                      <CalendarDays size={14} className="text-[var(--btb-red)]" />
                      {opportunity.date}
                    </div>
                    {opportunity.href === "/register-girls-mini-camp" && soldOutMiniCampGroups.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2" role="status" aria-label="Girls Mini Camp sold-out sessions">
                        {soldOutMiniCampGroups.map((group) => (
                          <span key={group} className="bg-[var(--btb-red)] px-3 py-2 text-[0.65rem] font-black uppercase tracking-[1.5px] text-white">
                            {group} · Sold Out
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-4 text-sm font-semibold leading-7 text-white/[0.62]">
                      {opportunity.description}
                    </p>
                    <a
                      href={opportunity.href}
                      className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[2px] text-white transition hover:text-[var(--btb-red)]"
                    >
                      {opportunity.href === "/register-girls-mini-camp" && allMiniCampGroupsSoldOut
                        ? "All Sessions Sold Out"
                        : opportunity.cta} <ArrowRight size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="program-paths" className="px-5 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1320px]">
            <div className="mb-9 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase leading-none tracking-wide">
                Choose Your Path
              </h2>
              <p className="max-w-[430px] text-sm font-semibold leading-7 text-white/[0.62] md:text-base">
                Boys, girls, and Futures stay easy to find, with a direct route into the right side of the club.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {paths.map((path) => (
                <a
                  key={path.label}
                  href={path.href}
                  className="group relative min-h-[360px] overflow-hidden border border-white/[0.12] bg-neutral-950"
                >
                  <img
                    src={path.image}
                    alt={`${path.label} lacrosse program`}
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.62] grayscale transition duration-500 group-hover:scale-[1.03] group-hover:opacity-80 group-hover:grayscale-0"
                    style={{ objectPosition: path.imagePosition }}
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/48 to-black/10" />
                  <div className="absolute inset-x-6 bottom-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-display text-[clamp(4rem,8vw,6.6rem)] uppercase leading-none tracking-wide">
                          {path.label}
                        </h3>
                        <div className="mt-2 h-1.5 w-24 bg-[var(--btb-red)] transition group-hover:w-32" />
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.35] text-white transition group-hover:border-[var(--btb-red)] group-hover:bg-[var(--btb-red)]">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                    <p className="mt-5 max-w-[330px] text-sm font-semibold leading-6 text-white/[0.74]">
                      {path.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--btb-red)] px-5 py-10 md:px-8 md:py-14">
          <div className="mx-auto grid max-w-[1180px] gap-8 divide-y divide-white/[0.28] text-center md:grid-cols-4 md:divide-x md:divide-y-0">
            {stats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`} className="pt-8 first:pt-0 md:pt-0">
                <div className="font-display text-[clamp(3.4rem,7vw,5rem)] uppercase leading-none text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-black uppercase tracking-[2px] text-white">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-5 py-16 text-black md:px-8 md:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(3rem,7vw,5rem)] uppercase leading-none tracking-wide">
                Meet Our Coaches
              </h2>
              <a
                href="/boys/coaches"
                className="inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-[2px] text-[var(--btb-red)] transition hover:text-black"
              >
                Staff Directory <ArrowRight size={15} />
              </a>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_1.4fr]">
              <div className="flex min-h-[360px] flex-col justify-between border border-black bg-black p-7 text-white md:p-8">
                <div>
                  <div className="mb-5 h-1.5 w-20 bg-[var(--btb-red)]" />
                  <h3 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] uppercase leading-none tracking-wide">
                    Founder Led.
                    <br />
                    Coach Built.
                  </h3>
                  <p className="mt-5 max-w-[430px] text-sm font-semibold leading-7 text-white/[0.72] md:text-base">
                    BTB is run by coaches who are on the field with the players. The standard is simple: develop the athlete, support the family, and make the work matter.
                  </p>
                </div>
                <a
                  href="/boys/coaches"
                  className="mt-10 inline-flex w-fit items-center gap-2 border border-white/[0.28] px-5 py-3 text-xs font-black uppercase tracking-[2px] text-white transition hover:bg-white hover:text-black"
                >
                  See Staff <ArrowRight size={14} />
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {coaches.map((coach) => (
                  <article key={coach.name} className="border border-black/[0.12] bg-white p-6">
                    <div className="mb-8 flex h-12 w-12 items-center justify-center bg-black font-display text-2xl uppercase leading-none text-white">
                      {coach.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <h3 className="font-display text-3xl uppercase leading-none tracking-wide text-black">
                      {coach.name}
                    </h3>
                    <p className="mt-2 text-xs font-black uppercase tracking-[2px] text-[var(--btb-red)]">
                      {coach.role}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-16 text-center md:px-8 md:py-24">
          <img
            src="/images/team-huddle.JPG"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.22] grayscale"
            loading="eager"
            decoding="async"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/[0.82]" />
          <div className="relative mx-auto max-w-[760px]">
            <GraduationCap className="mx-auto mb-6 h-10 w-10 text-[var(--btb-red)]" strokeWidth={1.7} />
            <h2 className="font-display text-[clamp(3.1rem,8vw,5.8rem)] uppercase leading-none tracking-wide">
              Ready To Join BTB?
            </h2>
            <p className="mx-auto mt-5 max-w-[540px] text-base font-medium leading-8 text-white/[0.72]">
              Start with tryout information, ask a question, or choose the program that fits your player.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/tryouts"
                className="inline-flex items-center justify-center gap-2 bg-[var(--btb-red)] px-8 py-4 text-sm font-black uppercase tracking-[2px] text-white transition hover:bg-[var(--btb-red-dark)]"
              >
                Tryout Info <ArrowRight size={15} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.45] px-8 py-4 text-sm font-black uppercase tracking-[2px] text-white transition hover:bg-white hover:text-black"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
