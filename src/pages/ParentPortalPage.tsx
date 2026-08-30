import { useReveal } from "@/hooks/useReveal"
import { Calendar, FileText, CreditCard, Video, BookOpen, ArrowRight, Shield, Link as LinkIcon, Smartphone, MessageSquare } from "lucide-react"
import { Link } from "react-router"
import { academyPhaseMap, parentPortalModules } from "@/lib/academySystem"

const portalLinks = [
  {
    title: "Winter Training Registration",
    icon: CreditCard,
    desc: "The Lab, offensive training, face-off, goalie, defense, and draw. Browse every option and sign up. Password is in the newsletter.",
    href: "/parent-training",
    external: true,
    tag: "PARENTS",
  },
  {
    title: "Fall & Winter Newsletter",
    icon: BookOpen,
    desc: "Everything for the season: curriculum, film sessions, tournaments, winter training, equipment, and program standards.",
    href: "/fall-winter-newsletter",
    external: true,
    tag: "2026-27",
  },
  {
    title: "Schedules & Rosters",
    icon: Calendar,
    desc: "Open TeamSnap for your team schedule, roster, availability, alerts, and event updates.",
    href: "https://go.teamsnap.com",
    external: true,
    tag: "TEAMSNAP",
  },
  {
    title: "BTB Policy & Waiver",
    icon: FileText,
    desc: "Find club policies, required waivers, family expectations, and registration paperwork.",
    href: "https://go.teamsnap.com",
    external: true,
    tag: "WAIVERS",
  },
  {
    title: "Payments & Registration",
    icon: CreditCard,
    desc: "Manage registrations, payment plans, invoices, and account details.",
    href: "https://go.teamsnap.com",
    external: true,
    tag: "BILLING",
  },
  {
    title: "Important Links",
    icon: LinkIcon,
    desc: "Quick access to BTB links, forms, family resources, and club information.",
    href: "/btb-links.html",
    tag: "RESOURCES",
  },
  {
    title: "Apps to Download",
    icon: Smartphone,
    desc: "TeamSnap, communication apps, and the tools families need on their phones.",
    href: "/parent-portal",
    tag: "APPS",
  },
  {
    title: "Digital Academy",
    icon: Video,
    desc: "Access player film study, position tracks, skill progressions, and academy curriculum.",
    href: "/academy",
    tag: "ACADEMY",
  },
  {
    title: "My Team Schedule",
    icon: BookOpen,
    desc: "Login-only master schedule view filtered to your child's team information from TeamSnap.",
    href: "/family-hub",
    tag: "LOGIN ONLY",
  },
  {
    title: "Contact BTB",
    icon: MessageSquare,
    desc: "Questions about schedules, waivers, payments, or team logistics? Reach out here.",
    href: "/contact",
    tag: "SUPPORT",
  },
]

export function ParentPortalPage() {
  const ref = useReveal({ className: "reveal-stagger" })

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[1.15rem] tracking-[5px] mb-6">
            <Shield size={14} />
            BTB_PARENT_PORTAL // SECURE_ACCESS
          </div>
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85] text-white mb-6">
            Command <br /> <span className="text-[var(--btb-red)]">Center.</span>
          </h1>
          <p className="text-white/65 text-[1rem] leading-relaxed max-w-[560px]">
            The parent hub for TeamSnap schedules and rosters, BTB policy and waivers, important links, apps to download, payments, academy access, and family support.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-white/10 border border-white/10">
          {portalLinks.map((link, i) => {
            const Content = (
              <div className="reveal-child group relative p-10 bg-black hover:bg-neutral-900 transition-all duration-300 h-full">
                <div className="flex justify-between items-start mb-12">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--btb-red)] group-hover:border-[var(--btb-red)] transition-all">
                    <link.icon size={24} className="text-[var(--btb-red)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-[10px] font-mono text-white/45 uppercase tracking-[2px]">{link.tag}</div>
                </div>

                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-4">{link.title}</h3>
                <p className="text-white/65 text-[1.25rem] leading-relaxed mb-10 group-hover:text-white/80 transition-colors">
                  {link.desc}
                </p>

                <div className="flex items-center gap-2 text-[1.15rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:translate-x-1 transition-transform">
                  Open Resource <ArrowRight size={12} />
                </div>
              </div>
            )

            return link.external ? (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer">
                {Content}
              </a>
            ) : (
              <Link key={i} to={link.href}>
                {Content}
              </Link>
            )
          })}
        </div>

        <section className="mt-24 border border-white/10 bg-white/[0.02] p-8 md:p-10">
          <div className="mb-10 max-w-[650px]">
            <div className="mb-4 text-[1.05rem] font-black uppercase tracking-[4px] text-[var(--btb-red)]">
              BTB Way
            </div>
            <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-[0.9] text-white">
              Four phases.
              <br />
              One development path.
            </h2>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-white/60">
              The Academy gives families a clearer view of what players are learning and why the season builds in a specific order.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {academyPhaseMap.map((phase, index) => (
              <div key={phase.phase} className="bg-black p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display text-3xl text-[var(--btb-red)]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[1.0rem] font-black uppercase tracking-[1.5px] text-white/30">{phase.weeks}</span>
                </div>
                <h3 className="font-display text-2xl uppercase tracking-wide text-white">{phase.phase}</h3>
                <p className="mt-3 text-[1.0rem] leading-relaxed text-white/60">{phase.identity}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {parentPortalModules.map((module) => (
            <div key={module.title} className="border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-3 text-[1.0rem] font-black uppercase tracking-[3px] text-[var(--btb-red)]">{module.audience}</div>
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">{module.title}</h3>
              <p className="mt-3 text-[1.0rem] leading-relaxed text-white/60">{module.outcome}</p>
              <div className="mt-5 grid gap-2">
                {module.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[1.0rem] text-white/65">
                    <Shield size={12} className="shrink-0 text-[var(--btb-red)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Support Section */}
        <div className="mt-24 p-12 bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="font-display text-2xl text-white uppercase tracking-wider mb-2">Need Assistance?</h4>
            <p className="text-white/85 text-[1.1rem] uppercase tracking-[1px] font-bold">Our operations team is standing by.</p>
          </div>
          <Link to="/contact" className="px-8 py-4 border border-white/10 text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-white hover:text-black transition-all">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
