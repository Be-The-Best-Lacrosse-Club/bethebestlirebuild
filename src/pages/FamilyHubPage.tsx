import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Shield, Calendar, FileText, Award, ChevronRight, Layout, Clock, Loader2 } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

interface TSEvent {
  id: number
  name?: string
  startDate: string
  endDate?: string
  isGame?: boolean
  opponentName?: string
  isCanceled?: boolean
  locationId?: number
}

interface ScheduleResponse {
  team: { id: number; name: string } | null
  events: TSEvent[]
  teams?: { id: number; name: string }[]
  message?: string
  error?: string
}

function formatEventDate(iso: string): { day: string; date: string; time: string } {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { day: "", date: "", time: "" }
  const day = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return { day, date, time }
}

const familyLinks = [
  {
    title: "Schedules & Rosters",
    icon: Calendar,
    desc: "Practice times, game schedules, and team rosters on LeagueApps.",
    href: "https://bethebest.leagueapps.com/dashboard",
    external: true,
    tag: "LEAGUEAPPS"
  },
  {
    title: "The Academy",
    icon: GraduationCap,
    desc: "Access your player's film study sessions and training curriculum.",
    href: "/academy-hub", // Internal route for academy selection
    tag: "E-LEARNING"
  },
  {
    title: "Waivers & Forms",
    icon: FileText,
    desc: "BTB standard waiver, medical forms, and code of conduct.",
    href: "/waivers",
    tag: "ADMIN",
    comingSoon: true,
  },
  {
    title: "Payments",
    icon: FileText,
    desc: "Manage registrations and check payment status.",
    href: "https://bethebest.leagueapps.com/dashboard",
    external: true,
    tag: "LEAGUEAPPS"
  },
  {
    title: "Player Dashboard",
    icon: Layout,
    desc: "Track lesson progress, badges, and day streaks.",
    href: "/player-hub",
    tag: "STATS"
  }
]

function GraduationCap({ size, className }: { size?: number, className?: string }) {
  return <Award size={size} className={className} />
}

export function FamilyHubPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

  // Fetch the family's team schedule from the TeamSnap-backed Netlify function.
  // Quiet failure mode: if no team can be matched, we just hide the section.
  // When the family has multiple teams matching their gender+gradYear (e.g. 2036
  // boys → Dawgs and Fury), a picker appears and overrides the lookup via teamId.
  useEffect(() => {
    if (!user?.gender || !user?.gradYear) return
    let cancelled = false
    setScheduleLoading(true)
    setScheduleError(null)
    const params = selectedTeamId
      ? `teamId=${selectedTeamId}&limit=5`
      : `gender=${user.gender}&gradYear=${user.gradYear}&limit=5`
    fetch(`/.netlify/functions/teamsnap-schedule?${params}`)
      .then(async (r) => {
        const data = (await r.json()) as ScheduleResponse
        if (cancelled) return
        if (!r.ok) throw new Error(data.error || `Schedule fetch failed (${r.status})`)
        setSchedule(data)
      })
      .catch((e) => { if (!cancelled) setScheduleError(e.message) })
      .finally(() => { if (!cancelled) setScheduleLoading(false) })
    return () => { cancelled = true }
  }, [user?.gender, user?.gradYear, selectedTeamId])

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const label = user?.gender === "boys" ? "Boys" : "Girls"
  const hasSchedule = !!(schedule?.events?.length)

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 px-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Family Hub | BTB Lacrosse Club"
        description="The centralized command center for BTB families. Manage schedules, training, and development."
        path="/family-hub"
      />

      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="mb-12 border-b border-white/5 pb-12">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px]">
              <Shield size={14} />
              BTB_FAMILY_HUB // COMMAND_CENTER
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[0.6rem] font-black uppercase tracking-[1px] text-emerald-500/80">Systems_Online</span>
               </div>
               <button 
                onClick={handleLogout}
                className="text-[0.65rem] font-black uppercase tracking-[2px] text-white/30 hover:text-white transition-colors"
               >
                 Logout
               </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_auto] items-end gap-8">
            <div>
              <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85] text-white mb-6">
                Family <br /> <span className="text-[var(--btb-red)]">Command Center.</span>
              </h1>
              <p className="text-white/40 text-[1rem] leading-relaxed max-w-[540px]">
                Welcome back, <span className="text-white/80 font-bold">{user?.name}</span>. 
                Everything you need to manage the <span className="text-[var(--btb-red)] font-bold">{label} {user?.gradYear}</span> season is unified here.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center min-w-[140px]">
                 <div className="text-3xl font-display text-[var(--btb-red)] mb-1">14</div>
                 <div className="text-[0.6rem] font-black text-white/20 uppercase tracking-[1px]">Day Streak</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center min-w-[140px]">
                 <div className="text-3xl font-display text-white mb-1">68%</div>
                 <div className="text-[0.6rem] font-black text-white/20 uppercase tracking-[1px]">Completion</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule from TeamSnap */}
        {(scheduleLoading || hasSchedule || scheduleError) && (
          <section className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.6rem] tracking-[4px] mb-2">
                  <Calendar size={12} />
                  UPCOMING_SCHEDULE
                </div>
                {schedule?.teams && schedule.teams.length > 1 ? (
                  <select
                    value={schedule.team?.id ?? ""}
                    onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                    className="font-display text-3xl uppercase text-white tracking-wider bg-transparent border-0 border-b-2 border-[var(--btb-red)]/40 hover:border-[var(--btb-red)] focus:border-[var(--btb-red)] focus:outline-none cursor-pointer pb-1"
                  >
                    {schedule.teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <h2 className="font-display text-3xl uppercase text-white tracking-wider">
                    {schedule?.team?.name || "Team Schedule"}
                  </h2>
                )}
              </div>
              <a
                href="https://bethebest.leagueapps.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.62rem] font-black uppercase tracking-[2px] text-white/30 hover:text-white transition-colors"
              >
                Full Schedule →
              </a>
            </div>

            {scheduleLoading ? (
              <div className="flex items-center gap-3 text-white/40 text-[0.82rem] py-8">
                <Loader2 size={16} className="animate-spin" />
                Loading schedule…
              </div>
            ) : scheduleError ? (
              <div className="text-white/40 text-[0.82rem] py-8">
                Couldn't load schedule. <a href="https://bethebest.leagueapps.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[var(--btb-red)] hover:underline">Open LeagueApps</a> instead.
              </div>
            ) : hasSchedule ? (
              <div className="grid gap-2">
                {schedule!.events.map((evt) => {
                  const fmt = formatEventDate(evt.startDate)
                  const isGame = !!evt.isGame
                  return (
                    <div
                      key={evt.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        evt.isCanceled
                          ? "bg-neutral-950 border-white/5 opacity-50 line-through"
                          : isGame
                          ? "bg-[var(--btb-red)]/[0.04] border-[var(--btb-red)]/20 hover:border-[var(--btb-red)]/40"
                          : "bg-neutral-950 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {/* Date column */}
                      <div className="text-center min-w-[60px] shrink-0">
                        <div className="text-[0.6rem] font-black uppercase tracking-[1.5px] text-white/30">{fmt.day}</div>
                        <div className="font-display text-xl text-white leading-tight">{fmt.date}</div>
                      </div>
                      {/* Divider */}
                      <div className={`w-px h-10 ${isGame ? "bg-[var(--btb-red)]/30" : "bg-white/10"}`} />
                      {/* Event details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[0.55rem] font-black uppercase tracking-[2px] px-2 py-0.5 rounded ${
                            isGame ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]" : "bg-white/5 text-white/40"
                          }`}>
                            {isGame ? "GAME" : (evt.name || "").toLowerCase().includes("practice") ? "PRACTICE" : "EVENT"}
                          </span>
                          {evt.isCanceled && (
                            <span className="text-[0.55rem] font-black uppercase tracking-[2px] text-amber-500/80">CANCELLED</span>
                          )}
                        </div>
                        <div className="font-display text-lg text-white uppercase tracking-wide truncate">
                          {isGame && evt.opponentName
                            ? `vs ${evt.opponentName}`
                            : evt.name || (isGame ? "Game" : "Practice")}
                        </div>
                        <div className="flex items-center gap-4 text-[0.72rem] text-white/40 mt-1">
                          <span className="flex items-center gap-1.5">
                            <Clock size={11} /> {fmt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </section>
        )}

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyLinks.map((link, i) => {
            const isAcademy = link.tag === "E-LEARNING"
            const isComingSoon = link.comingSoon === true

            // Map generic routes to user-specific routes
            let finalHref = link.href
            if (link.href === "/academy-hub") finalHref = `/${user?.gender}/academy`
            if (link.href === "/player-hub") finalHref = `/${user?.gender}/players`

            const Content = (
              <div className={`group relative p-8 rounded-2xl border transition-all duration-300 h-full overflow-hidden ${
                isComingSoon ? "bg-neutral-950 border-white/5 opacity-60"
                : isAcademy ? "bg-[var(--btb-red)]/[0.03] border-[var(--btb-red)]/20 hover:border-[var(--btb-red)]/40"
                : "bg-neutral-950 border-white/5 hover:border-white/20"
              }`}>
                {isAcademy && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--btb-red)]/5 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                )}
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                    isAcademy ? "bg-[var(--btb-red)]/10 border-[var(--btb-red)]/20 group-hover:bg-[var(--btb-red)]" : "bg-white/5 border-white/10 group-hover:border-[var(--btb-red)]/50"
                  }`}>
                    <link.icon size={20} className={`${isAcademy ? "text-[var(--btb-red)] group-hover:text-white" : "text-white/30 group-hover:text-[var(--btb-red)]"} transition-colors`} />
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-[2px] px-2 py-0.5 rounded ${
                    isAcademy ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]" : "text-white/20 bg-white/5"
                  }`}>{link.tag}</div>
                </div>

                <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-3 relative z-10">{link.title}</h3>
                <p className="text-white/40 text-[0.82rem] leading-relaxed mb-8 group-hover:text-white/60 transition-colors relative z-10">
                  {link.desc}
                </p>

                <div className={`flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[2px] transition-all relative z-10 ${
                  isComingSoon ? "text-white/30"
                  : isAcademy ? "text-[var(--btb-red)] group-hover:text-white"
                  : "text-white/20 group-hover:text-[var(--btb-red)]"
                }`}>
                  {isComingSoon ? "Coming Soon" : <>Open Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
                </div>
              </div>
            )

            if (isComingSoon) {
              return (
                <div key={i} className="h-full cursor-not-allowed" aria-disabled="true">
                  {Content}
                </div>
              )
            }

            return link.external ? (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="h-full">
                {Content}
              </a>
            ) : (
              <button key={i} onClick={() => navigate(finalHref)} className="w-full text-left h-full">
                {Content}
              </button>
            )
          })}
        </div>

        {/* Support Section */}
        <div className="mt-16 p-10 rounded-2xl bg-neutral-900 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="font-display text-2xl text-white uppercase tracking-wider mb-2">Need Operations Support?</h4>
            <p className="text-white/30 text-[0.7rem] uppercase tracking-[2px] font-bold">Contact our administrative team for assistance.</p>
          </div>
          <button 
            onClick={() => navigate("/interest")}
            className="px-10 py-4 bg-white/5 border border-white/10 text-white text-[0.72rem] font-black uppercase tracking-[2px] rounded-xl hover:bg-white hover:text-black transition-all"
          >
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  )
}
