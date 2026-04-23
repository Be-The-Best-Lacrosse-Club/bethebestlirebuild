import { useEffect } from "react"
import { ArrowRight, Users } from "lucide-react"
import { programData } from "@/lib/programData"
import { SEO } from "@/components/shared/SEO"
import type { Gender } from "@/types"

export function TeamsPage({ gender }: { gender: Gender }) {
  const data = programData[gender]
  const label = gender === "boys" ? "Boys" : "Girls"
  const anchorId = `apply-teams-${gender}`

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Level badge color mapping
  const levelColor = (level: string) => {
    switch (level) {
      case "Elite": return "bg-[var(--btb-red)]/20 text-[var(--btb-red)] border-[var(--btb-red)]/30"
      case "Competitive": return "bg-amber-500/15 text-amber-400 border-amber-500/25"
      case "Development": return "bg-blue-500/15 text-blue-400 border-blue-500/25"
      case "Youth": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
      default: return "bg-white/[0.05] text-white/40 border-white/[0.1]"
    }
  }

  // Compute summary stats
  const totalTeams = data.teams.length
  const totalCoaches = data.teams.reduce((sum, t) => sum + t.coachCount, 0)

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Teams | BTB Lacrosse Club`}
        description={`Browse BTB Lacrosse ${label.toLowerCase()} teams — ${totalTeams} teams across multiple age groups with dedicated coaching staff on Long Island.`}
        path={`/${gender}/teams`}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-[1]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]" style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)"
        }} />
        <div className="relative z-10 max-w-[900px] mx-auto pt-16">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Teams</div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            {label}<br />Teams
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-10">
            {totalTeams} teams spanning every youth grad year. Every team runs the same curriculum, the same film study, the same standard.
          </p>
          <a href={`#${anchorId}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200">
            Apply Now <ArrowRight size={13} />
          </a>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{totalTeams}</div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">Total Teams</div>
            </div>
            <div>
              <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{totalCoaches}</div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">Total Coaches</div>
            </div>
            <div>
              <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">2</div>
              <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">Coaches Per Team</div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Team Grid */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">All Teams</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Full Team<br />Roster
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.teams.map((team) => (
              <div key={team.teamName} className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="font-display text-[2rem] text-white/[0.06] leading-none select-none">{team.gradYear}</div>
                </div>

                {/* Team name */}
                <div className="font-display text-[1.2rem] uppercase tracking-wide text-white mb-1 group-hover:text-[var(--btb-red)] transition-colors">{team.teamName}</div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mb-5">Class of {team.gradYear}</div>

                {/* Coach count */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                  <Users size={14} className="text-[var(--btb-red)]" />
                  <span className="text-[0.72rem] text-white/40">{team.coachCount} Coaches Assigned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Phases Breakdown */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Development</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            The BTB<br />Standard
          </h2>
          <div className="space-y-3">
            {data.ageGroups.map((group, i) => (
              <div key={group.grad} className={`flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-7 rounded-xl border transition-colors ${
                i === data.ageGroups.length - 1
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="shrink-0 md:w-40">
                  <div className="font-display text-[1.1rem] uppercase tracking-wide text-white">{group.grad}</div>
                </div>
                <div className="hidden md:block w-px self-stretch bg-white/[0.08]" />
                <p className="text-[0.84rem] text-white/40 leading-relaxed">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-24 px-6" id={anchorId}>
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Teams</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Find Your<br /><span className="text-[var(--btb-red)]">Team</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                {totalTeams} teams, one standard. Apply to join the {label.toLowerCase()} program and find the right team for your grad year.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200">
                  Apply for 2026 <ArrowRight size={13} />
                </a>
                <a href="mailto:info@bethebestli.com" className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200">
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
