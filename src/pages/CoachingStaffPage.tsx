import { useEffect } from "react"
import { ArrowRight, ShieldCheck, FileText, Award } from "lucide-react"
import { programData } from "@/lib/programData"
import { SEO } from "@/components/shared/SEO"
import type { Gender } from "@/types"

const philosophy = [
  { title: "Every correction comes with a coaching point.", text: "We don't tell players what they did wrong — we teach them why it happened, what to do instead, and give them a drill to fix it." },
  { title: "Film study is non-negotiable.", text: "Coaches review film before every session and lead weekly film breakdowns with their players. If we're not watching film, we're not coaching." },
  { title: "Practice plans are submitted in advance.", text: "No coach runs a session without a written, timed plan. Every minute is accounted for and every drill has a purpose tied to the 16-week curriculum." },
  { title: "Development is measured, not assumed.", text: "Coaches track progression through skill benchmarks, film observations, and in-game evaluation. Players know exactly where they stand." },
]

const certRequirements = [
  "US Lacrosse Coaching Certification",
  "SafeSport Training (current)",
  "Background Check (verified annually)",
  "Written Practice Plan Submission",
  "Weekly Film Review Participation",
  "CPR / First Aid Certification",
]

export function CoachingStaffPage({ gender }: { gender: Gender }) {
  const data = programData[gender]
  const label = gender === "boys" ? "Boys" : "Girls"

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Coaching Staff | BTB Lacrosse Club`}
        description={`Meet BTB Lacrosse's ${label.toLowerCase()} coaching staff. Certified coaches with written practice plans, weekly film review, and a development-first coaching philosophy.`}
        path={`/${gender}/coaches`}
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
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Coaching Staff</div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            {label} Coaching<br />Staff
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-10">
            Every BTB coach is certified, background-checked, and held to the same standard we expect from our athletes. No exceptions.
          </p>
        </div>
      </section>

      {/* Coach Profile Cards */}
      <section className="py-24 px-6 bg-neutral-950 border-y border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Staff</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Meet the<br />Coaches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.coaches.map((coach) => (
              <div key={coach.name + coach.title} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 hover:border-white/[0.15] transition-all duration-300">
                {/* Initials avatar */}
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 rounded-full bg-[var(--btb-red)] flex items-center justify-center font-display text-lg uppercase tracking-wide text-white shrink-0">
                    {coach.initials}
                  </div>
                  <div>
                    <div className="font-display text-[1.2rem] uppercase tracking-wide text-white">{coach.name}</div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-[var(--btb-red)] mt-1">{coach.title}</div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {coach.credentials.map((cred) => (
                    <span key={cred} className="text-[0.58rem] font-bold uppercase tracking-[1px] px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35">
                      {cred}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-[0.84rem] text-white/35 leading-relaxed group-hover:text-white/45 transition-colors">{coach.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Philosophy — numbered list like OurStandard */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Philosophy</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-5">
            How Our<br />Coaches Operate
          </h2>
          <p className="text-[0.88rem] text-white/35 max-w-[460px] leading-relaxed mb-14">
            BTB coaching is structured, accountable, and development-first. Every coach follows the same system.
          </p>

          <div className="space-y-0 border-t border-white/[0.07]">
            {philosophy.map((item, i) => (
              <div key={i} className="flex items-start gap-8 py-8 border-b border-white/[0.07] group">
                <div className="font-display text-[0.7rem] text-white/15 group-hover:text-[var(--btb-red)] transition-colors shrink-0 pt-0.5 w-6">
                  0{i + 1}
                </div>
                <div>
                  <h4 className="font-display text-[1.15rem] uppercase tracking-wide text-white group-hover:text-[var(--btb-red)] transition-colors mb-2">{item.title}</h4>
                  <p className="text-[0.84rem] text-white/35 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Requirements */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Requirements</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Certification<br />Requirements
          </h2>

          <div className="relative rounded-2xl border border-[var(--btb-red)]/20 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.03]" />
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="relative p-10 md:p-14">
              <p className="text-[0.88rem] text-white/40 max-w-[520px] leading-[1.85] mb-8">
                Every BTB coach — head coach, assistant, or volunteer — must meet these requirements before stepping on the field.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certRequirements.map((req) => (
                  <div key={req} className="flex items-center gap-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <ShieldCheck size={16} className="text-[var(--btb-red)] shrink-0" />
                    <span className="text-[0.8rem] text-white/45">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">{label} Program</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Coached by<br /><span className="text-[var(--btb-red)]">The Best</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                Our coaching staff is what sets BTB apart. Certified, prepared, and accountable — every session, every player.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200">
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
