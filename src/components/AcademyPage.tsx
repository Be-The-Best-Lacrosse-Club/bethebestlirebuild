import { useEffect } from "react"
import { ArrowRight, MapPin } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

const stats = [
  { num: "500+", label: "Players Developed" },
  { num: "85+", label: "College Commits" },
  { num: "2+", label: "Coaches Per Team" },
  { num: "2021", label: "Year Founded" },
]

const programs = [
  { label: "Boys Travel", tag: "Ages 12–18", text: "Competitive travel teams at multiple age groups. High-level competition with a development-first approach and position-specific coaching." },
  { label: "Girls Travel", tag: "Ages 12–18", text: "Full girls program with its own curriculum, dedicated coaching staff, and the same film study and development standards as the boys program." },
  { label: "Youth Development", tag: "Ages 8–12", text: "Foundation-level program for younger players. Focused on fundamentals, love of the game, and building proper mechanics before bad habits form." },
  { label: "Elite Training", tag: "High School", text: "Position-specific small-group sessions for serious high school players targeting varsity performance and college recruiting preparation." },
]

const differentiators = [
  { num: "01", title: "Film Study Is Standard", text: "Most clubs run drills and call it development. BTB players study film every single week — and they're coached on what they see. That is how lacrosse IQ is built, and it's the single biggest separator between BTB and every other program on Long Island." },
  { num: "02", title: "2+ Coaches Per Team", text: "Every team gets multiple coaches involved in development. Players get real reps, real corrections, and real coaching attention — not a number in a line drill." },
  { num: "03", title: "Guaranteed Individual and Team Progress", text: "Every BTB player and team is coached toward measurable improvement. We track development, set standards, and make sure progress is visible." },
  { num: "04", title: "Selective Enrollment", text: "We don't accept every player who applies. BTB is for athletes who are serious about development and families who support that commitment. The right environment only exists when the right players are in it." },
  { num: "05", title: "Recruiting Preparation Included", text: "College prep isn't a separate add-on program. It's built into the senior program — highlight film packages, outreach guidance, school list strategy, and honest profile evaluation." },
]

export function AcademyPage({ onBack }: { onBack?: () => void }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="BTB Academy | Character-Driven Lacrosse Development"
        description="BTB Academy is Long Island's premier lacrosse development program. 500+ players developed, 85+ college commits, 2+ coaches per team, and weekly film study."
        path="/academy"
      />

      {/* Hero */}
      <section className="pt-24 pb-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={12} className="text-[var(--btb-red)]" />
            <span className="text-[1.05rem] font-bold uppercase tracking-[4px] text-white/85">Long Island, New York · Est. 2016</span>
          </div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase tracking-wide leading-[0.88] mb-8">
            Long Island's<br />Premier Lacrosse<br /><span className="text-[var(--btb-red)]">Academy.</span>
          </h1>
          <p className="text-[1.05rem] text-white/85 max-w-[560px] leading-[1.9]">
            Be The Best (BTB) Lacrosse Club is not a lacrosse factory. We are a development program — built on film study, structured coaching, and a standard that holds coaches and athletes equally accountable. Founded on Long Island in 2016 and still here.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 border border-white/[0.07] rounded-xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-10 text-center ${i < stats.length - 1 ? "border-r border-white/[0.07]" : ""}`}>
                <div className="font-display text-[2.5rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[1.05rem] font-semibold uppercase tracking-[1.5px] text-white/85 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Programs</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Four Programs.<br />One Standard.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p, i) => (
              <div key={p.label} className={`p-7 rounded-xl border transition-colors ${
                i === 0
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white">{p.label}</h4>
                  <span className="text-[1.05rem] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/85">{p.tag}</span>
                </div>
                <p className="text-[1rem] text-white/85 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="/boys" className="inline-flex items-center gap-2 text-[1.05rem] font-bold uppercase tracking-[2px] text-white/85 hover:text-[var(--btb-red)] transition-colors">
              View Full Program Details <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* The BTB Difference */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">The BTB Difference</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Why BTB Is<br />Different
          </h2>
          <div className="space-y-0 border-t border-white/[0.07]">
            {differentiators.map((d) => (
              <div key={d.num} className="flex items-start gap-8 py-8 border-b border-white/[0.07] group">
                <div className="font-display text-[1.05rem] text-white/15 group-hover:text-[var(--btb-red)] transition-colors shrink-0 pt-0.5 w-6">{d.num}</div>
                <div>
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white group-hover:text-[var(--btb-red)] transition-colors mb-2">{d.title}</h4>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{d.text}</p>
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
              <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">Ready to Apply</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                This Program<br />Is Not For Everyone.
              </h2>
              <p className="text-[1rem] text-white/85 max-w-[440px] mx-auto leading-relaxed mb-10">
                It's for athletes who want to be the best version of themselves — and families who understand what that commitment actually requires.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200">
                  Apply for 2026 <ArrowRight size={13} />
                </a>
                <a href="mailto:info@bethebestli.com" className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/90 text-[1.05rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all duration-200">
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
