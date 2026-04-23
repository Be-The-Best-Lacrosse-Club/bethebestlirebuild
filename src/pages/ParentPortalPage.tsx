import { useReveal } from "@/hooks/useReveal"
import { Calendar, FileText, CreditCard, Video, BookOpen, Activity, ArrowRight, Shield } from "lucide-react"
import { Link } from "react-router-dom"

const portalLinks = [
  {
    title: "Schedules & Rosters",
    icon: Calendar,
    desc: "View practice times, game schedules, and team rosters on LeagueApps.",
    href: "https://bethebest.leagueapps.com/dashboard",
    external: true,
    tag: "LEAGUEAPPS"
  },
  {
    title: "The Academy",
    icon: Video,
    desc: "Access your player's film study sessions and training curriculum.",
    href: "/academy",
    tag: "E-LEARNING"
  },
  {
    title: "Waivers & Payments",
    icon: FileText,
    desc: "Manage registrations, sign waivers, and check payment status.",
    href: "https://bethebest.leagueapps.com/dashboard",
    external: true,
    tag: "ADMIN"
  },
  {
    title: "Digital Drill Book",
    icon: BookOpen,
    desc: "Review the current training cycle's drills and homework.",
    href: "/boys/coaches-hub", // Temporarily pointing to coaches hub for drills
    tag: "TRAINING"
  }
]

export function ParentPortalPage() {
  const ref = useReveal({ className: "reveal-stagger" })

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6">
            <Shield size={14} />
            BTB_PARENT_PORTAL // SECURE_ACCESS
          </div>
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85] text-white mb-6">
            Command <br /> <span className="text-[var(--btb-red)]">Center.</span>
          </h1>
          <p className="text-white/40 text-[0.95rem] leading-relaxed max-w-[500px]">
            The centralized hub for everything BTB. Manage your athlete's development, schedule, and administrative tasks in one place.
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
                  <div className="text-[10px] font-mono text-white/20 uppercase tracking-[2px]">{link.tag}</div>
                </div>

                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-4">{link.title}</h3>
                <p className="text-white/40 text-[0.88rem] leading-relaxed mb-10 group-hover:text-white/60 transition-colors">
                  {link.desc}
                </p>

                <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:translate-x-1 transition-transform">
                  Access Portal <ArrowRight size={12} />
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

        {/* Support Section */}
        <div className="mt-24 p-12 bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="font-display text-2xl text-white uppercase tracking-wider mb-2">Need Assistance?</h4>
            <p className="text-white/30 text-[0.85rem] uppercase tracking-[1px] font-bold">Our operations team is standing by.</p>
          </div>
          <Link to="/contact" className="px-8 py-4 border border-white/10 text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-white hover:text-black transition-all">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
