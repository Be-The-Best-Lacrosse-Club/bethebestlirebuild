import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { programData } from "@/lib/programData"
import { SEO } from "@/components/shared/SEO"
import type { Gender } from "@/types"

export function ProgramPage({ programKey }: { programKey: string }) {
  const data = programData[programKey]
  const isGirls = programKey === "girls"
  const anchorId = `apply-${programKey}`

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // For girls stats section: team pills from grad years
  const girlsTeamYears = isGirls
    ? data.teams.map((t) => t.gradYear)
    : []

  // Split hero tagline on newline
  const taglineParts = data.heroTagline.split("\n")
  // Split CTA headline on newline
  const ctaParts = data.ctaHeadline.split("\n")

  const label = programKey === "boys" ? "Boys" : programKey === "girls" ? "Girls" : data.navLabel

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Program | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label} Program — elite travel lacrosse development on Long Island with film study, position-specific coaching, and college recruiting preparation.`}
        path={`/${programKey}`}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-[1]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]" style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)"
        }} />
        <div className="relative z-10 max-w-[900px] mx-auto pt-16">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{data.label}</div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            {taglineParts.map((part, i) => (
              <span key={i}>
                {part}
                {i < taglineParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-10">
            {data.heroSubtitle}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href={`#${anchorId}`} className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200">
              Apply for 2026 <ArrowRight size={13} />
            </a>
            <a href="#age-groups" className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200">
              View Age Groups
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-14 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8${isGirls ? " mb-10" : ""}`}>
            {data.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Girls-specific: team pills and commits note */}
          {isGirls && (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {girlsTeamYears.map((yr) => (
                  <div key={yr} className="px-4 py-2 border border-white/[0.08] rounded-full text-[0.72rem] font-bold uppercase tracking-[1.5px] text-white/40">
                    Class of {yr}
                  </div>
                ))}
              </div>
              <p className="text-center text-[0.78rem] text-white/30 italic">
                College commits coming from future graduating classes — this program is just getting started.
              </p>
            </>
          )}
        </div>
      </section>

      {/* What You Get — Benefits grid */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">The Program</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            What Every BTB<br />Athlete Gets
          </h2>
          <p className="text-[0.84rem] text-white/35 mb-14 max-w-[420px] leading-relaxed">
            {isGirls
              ? "The same tools, the same coaching, the same accountability — built for the girls' game."
              : "No guesswork. No generic drills. This is what BTB athletes receive when they join."
            }
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.benefits.map((b, i) => {
              const highlighted = i === data.highlightBenefitIndex
              return (
                <div key={b.title} className={`group rounded-2xl border p-7 transition-all duration-300 ${
                  highlighted
                    ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                }`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      highlighted ? "bg-[var(--btb-red)]/20" : "bg-white/[0.05]"
                    }`}>
                      <b.icon size={18} strokeWidth={1.5} className={highlighted ? "text-[var(--btb-red)]" : "text-white/40"} />
                    </div>
                    <span className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full ${
                      highlighted ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]" : "bg-white/[0.05] text-white/25"
                    }`}>{b.stat}</span>
                  </div>
                  <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">{b.title}</h4>
                  <p className="text-[0.8rem] text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">{b.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Age Groups */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]" id="age-groups">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Age Groups</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Every Level.<br />One Standard.
          </h2>
          <div className="space-y-3">
            {data.ageGroups.map((g, i) => (
              <div key={g.grad} className={`flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-7 rounded-xl border transition-colors ${
                i === data.ageGroups.length - 1
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="shrink-0 md:w-40">
                  <div className="font-display text-[1.1rem] uppercase tracking-wide text-white">{g.grad}</div>
                  <div className={`text-[0.62rem] font-bold uppercase tracking-[1.5px] mt-1 ${
                    i === data.ageGroups.length - 1 ? "text-[var(--btb-red)]" : "text-white/25"
                  }`}>{g.level}</div>
                </div>
                <div className="hidden md:block w-px self-stretch bg-white/[0.08]" />
                <p className="text-[0.84rem] text-white/40 leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16-Week Development (Academy Spec) */}
      <section className="py-32 px-6 bg-black relative overflow-hidden border-b border-white/5" id="curriculum">
        {/* Ghost Typography */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
          <span className="font-display text-[25vw] leading-none text-white select-none">
            SPEC_LEVEL_01
          </span>
        </div>

        <div className="max-w-[1100px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between mb-24 gap-12">
            <div className="max-w-[600px]">
              <div className="inline-flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6">
                DEVELOPMENT_BLUEPRINT // 16_WEEK_SPEC
              </div>
              <h2 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85] text-white">
                Engineered <br /> <span className="text-[var(--btb-red)]">For Impact.</span>
              </h2>
            </div>
            <div className="pt-4 border-t border-[var(--btb-red)] max-w-[340px]">
              <p className="text-white/40 text-[0.88rem] leading-relaxed">
                {isGirls
                  ? "The same rigorous development cycle — adapted for the elite female athlete at every phase."
                  : "A repeatable engineering spec designed around measurable skill progression and high-IQ play."
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.phases.map((p, i) => (
              <div key={p.num} className="group relative">
                {/* Vertical Progress Line */}
                <div className="absolute top-0 left-0 w-px h-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[var(--btb-red)] w-full -translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                </div>
                
                <div className="pl-8 pt-4 pb-12">
                  <div className="font-mono text-[0.6rem] text-[var(--btb-red)] mb-2">PHASE_{p.num}</div>
                  <h3 className="font-display text-2xl text-white uppercase tracking-wider mb-2">{p.phase}</h3>
                  <div className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[2px] mb-6">{p.weeks}</div>
                  
                  <ul className="space-y-3">
                    {p.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[0.82rem] text-white/40 group-hover:text-white/70 transition-colors">
                        <div className="w-1 h-1 rounded-full bg-[var(--btb-red)] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Film Study */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="relative rounded-2xl border border-[var(--btb-red)]/20 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.03]" />
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="relative p-10 md:p-14">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-5">Film Study</div>
              <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Not Optional.<br />Not Occasional.
              </h2>
              <p className="text-[0.88rem] text-white/40 max-w-[520px] leading-[1.85] mb-8">
                {data.filmStudyDescription}
              </p>
              <div className="flex flex-wrap gap-6">
                {data.filmStudyPoints.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[1px] text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results / Testimonials */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Results</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Hear It From<br />{isGirls ? "BTB Athletes" : "The Players"}
          </h2>

          {/* Featured */}
          <div className="relative rounded-2xl bg-neutral-950 border border-white/[0.07] overflow-hidden mb-4 p-10">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="absolute top-4 right-6 font-display text-[6rem] text-white/[0.04] leading-none select-none">"</div>
            <div className="relative">
              <span className="text-[0.62rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-5 inline-block">Commit Story</span>
              <p className="font-display text-[clamp(1.1rem,2.5vw,1.5rem)] uppercase tracking-wide leading-[1.25] text-white mb-8 max-w-[600px]">
                "{data.testimonials[1].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--btb-red)] flex items-center justify-center font-bold text-sm">{data.testimonials[1].initials}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{data.testimonials[1].name}</div>
                  <div className="text-white/35 text-[0.72rem]">{data.testimonials[1].role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[data.testimonials[0], data.testimonials[2]].map((t) => (
              <div key={t.initials} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.12] transition-colors">
                <div className="font-display text-3xl text-white/[0.08] leading-none mb-3">"</div>
                <p className="text-[0.84rem] text-white/40 leading-[1.8] mb-6">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                  <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-[0.72rem] text-white shrink-0">{t.initials}</div>
                  <div>
                    <div className="font-semibold text-white text-[0.82rem]">{t.name}</div>
                    <div className="text-white/30 text-[0.7rem]">{t.role}</div>
                  </div>
                </div>
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
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{data.ctaSubheadline}</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                {ctaParts.map((part, i) => (
                  <span key={i}>
                    {i === ctaParts.length - 1 ? (
                      <>
                        {part.split(" ").slice(0, -2).join(" ")}{" "}
                        <span className="text-[var(--btb-red)]">{part.split(" ").slice(-2).join(" ")}</span>
                      </>
                    ) : (
                      part
                    )}
                    {i < ctaParts.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                {data.ctaText}
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
