import { useEffect } from "react"
import { ArrowRight, MapPin, Calendar, Trophy, ChevronRight, Shield, Video } from "lucide-react"
import { programData } from "@/lib/programData"
import { TOURNAMENT_DATA } from "@/lib/tournamentData"
import { SEO } from "@/components/shared/SEO"
import type { Gender } from "@/types"

export function TravelPage({ gender }: { gender: Gender }) {
  const data = programData[gender]
  const label = gender === "boys" ? "Boys" : "Girls"
  const anchorId = `apply-travel-${gender}`

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Travel Teams | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label} travel teams — competitive Long Island lacrosse with structured development, film study, and tournament play at every age group.`}
        path={`/${gender}/travel`}
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
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Travel Teams</div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            {label} Travel<br />Teams
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-10">
            BTB travel teams compete at the highest levels across Long Island and the Northeast. Every team carries a minimum 2-coach staff, runs the BTB curriculum, and requires weekly film study.
          </p>
          <a href={`#${anchorId}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200">
            Apply for Travel <ArrowRight size={13} />
          </a>
        </div>
      </section>

      {/* Team Cards */}
      <section className="py-24 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Teams</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            {data.teams.length} Teams.<br />Every Grad Year.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.teams.map((team) => {
              const tournaments = TOURNAMENT_DATA[team.teamName]
              return (
                <div key={team.teamName} className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 hover:border-white/[0.15] transition-all duration-300">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="font-display text-[1.8rem] uppercase tracking-wide text-white group-hover:text-[var(--btb-red)] transition-colors">{team.teamName}</div>
                      <div className="text-[0.68rem] font-bold uppercase tracking-[2px] text-white/25 mt-1">Class of {team.gradYear}</div>
                    </div>
                  </div>

                  {/* Tournament Schedule Display */}
                  {tournaments && (
                    <div className="space-y-6 mb-8">
                      {tournaments.summer && (
                        <div>
                          <div className="text-[0.6rem] font-black uppercase tracking-[2px] text-white/20 mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-[var(--btb-red)]" />
                            Summer_Circuit
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tournaments.summer.map((t, i) => (
                              <div key={i} className="bg-white/[0.03] border border-white/5 p-3 rounded-lg">
                                <div className="text-[0.7rem] font-bold text-white/70 uppercase leading-tight mb-1">{t.name}</div>
                                <div className="text-[0.6rem] font-mono text-[var(--btb-red)]">{t.date}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {tournaments.fall && (
                        <div>
                          <div className="text-[0.6rem] font-black uppercase tracking-[2px] text-white/20 mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                            Fall_Schedule
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tournaments.fall.map((t, i) => (
                              <div key={i} className="bg-white/[0.03] border border-white/5 p-3 rounded-lg">
                                <div className="text-[0.7rem] font-bold text-white/70 uppercase leading-tight mb-1">{t.name}</div>
                                <div className="text-[0.6rem] font-mono text-white/30">{t.date}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-8 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Shield size={12} className="text-[var(--btb-red)]" />
                      <span className="text-[0.7rem] font-bold uppercase tracking-[1px] text-white/40">{team.coachCount} Pro Coaches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video size={12} className="text-[var(--btb-red)]" />
                      <span className="text-[0.7rem] font-bold uppercase tracking-[1px] text-white/40">Film Study Hub</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Season Info */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Season Info</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            What to Expect<br />This Season
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/20 flex items-center justify-center mb-5">
                <Calendar size={18} className="text-[var(--btb-red)]" />
              </div>
              <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">Season Dates</h4>
              <p className="text-[0.8rem] text-white/30 leading-relaxed">Season dates and practice schedules will be posted once registration opens. Check back for updates.</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/20 flex items-center justify-center mb-5">
                <MapPin size={18} className="text-[var(--btb-red)]" />
              </div>
              <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">Locations</h4>
              <p className="text-[0.8rem] text-white/30 leading-relaxed">Training and home games held at Long Island facilities. Tournament locations vary by event and age group.</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.12] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/20 flex items-center justify-center mb-5">
                <Trophy size={18} className="text-[var(--btb-red)]" />
              </div>
              <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">Commitment</h4>
              <p className="text-[0.8rem] text-white/30 leading-relaxed">Travel teams require full-season commitment including practices, film sessions, and tournament weekends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Schedule */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Where We Compete</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            We Play The<br /><span className="text-[var(--btb-red)]">Best Tournaments</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="rounded-xl border border-[var(--btb-red)]/25 bg-[var(--btb-red)]/[0.04] p-7">
              <div className="text-[0.62rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)] mb-3">Elite Circuit</div>
              <h3 className="font-display text-[1.4rem] uppercase tracking-wide mb-3">Top National Tournaments</h3>
              <p className="text-[0.85rem] text-white/40 leading-[1.85]">
                BTB enters the elite tournaments where the top club programs in the country compete — the events that matter for college recruiting and high-level development.
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-7">
              <div className="text-[0.62rem] font-bold uppercase tracking-[2px] text-white/50 mb-3">Regional Play</div>
              <h3 className="font-display text-[1.4rem] uppercase tracking-wide mb-3">Long Island & Tri-State</h3>
              <p className="text-[0.85rem] text-white/40 leading-[1.85]">
                We also compete in top local tournaments across Long Island and the tri-state area — the games where BTB players get reps against the strongest regional competition.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="relative p-8 md:p-10">
              <p className="text-[0.88rem] text-white/45 leading-[1.85]">
                <span className="text-white font-semibold">Tournament schedules are shared with rostered families</span> — every BTB team's full schedule, travel info, and tournament details are distributed once the season is set. The lineup is built to maximize development, exposure, and competition for each age group.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-24 px-6" id={anchorId}>
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Travel Teams</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Compete With<br /><span className="text-[var(--btb-red)]">The Best</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                BTB travel teams are for committed athletes who want structured coaching, film study, and real competition at every level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200">
                  Apply for Travel <ArrowRight size={13} />
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
