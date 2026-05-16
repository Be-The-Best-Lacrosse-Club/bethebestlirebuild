import { ArrowLeft, ArrowRight, Video, TrendingUp, Target, BookOpen } from "lucide-react"

const filmProcess = [
  { step: "01", title: "Your Game Gets Recorded", text: "Every BTB practice session is captured. Nothing is left to memory or self-assessment. The footage doesn't lie." },
  { step: "02", title: "Coach Reviews Your Footage", text: "Before your film session, your coach has already watched your clips and pulled the moments that matter most — good and bad." },
  { step: "03", title: "You Watch Together", text: "You and your coach sit down and go through your footage side by side. Not to review what happened — to understand why it happened." },
  { step: "04", title: "You Get a Specific Coaching Point", text: "Every clip ends with a takeaway. Not vague criticism — a specific, actionable correction with a drill to match it." },
  { step: "05", title: "You Fix It at Next Practice", text: "The following session is built around what film identified. The loop closes. The improvement sticks." },
]

const phases = [
  {
    num: "01", title: "Foundation", weeks: "Weeks 1–4",
    focus: "Fundamentals, mechanics, film introduction",
    detail: "You learn how BTB trains, what standard is expected, and how to self-assess through film."
  },
  {
    num: "02", title: "Connection", weeks: "Weeks 5–8",
    focus: "Applying skills in live read-and-react scenarios",
    detail: "Skills stop being isolated. You start using them in real game situations against real pressure."
  },
  {
    num: "03", title: "Expansion", weeks: "Weeks 9–12",
    focus: "Game-speed competition, opponent film breakdown",
    detail: "You compete under pressure and learn to self-scout using film the way college coaches do."
  },
  {
    num: "04", title: "Execution", weeks: "Weeks 13–16",
    focus: "Recruiting prep, standards test, next-phase goal setting",
    detail: "You prepare your highlight film, evaluate your profile, and set targets for the next cycle."
  },
]

const recruitingTools = [
  { icon: Video, title: "Highlight Film Package", text: "We help you build a 90-second highlight reel formatted for college coaches — shot selection, angle, and pacing matter." },
  { icon: Target, title: "School List Strategy", text: "Find programs that match your academics, athletic profile, and position needs — not just name recognition." },
  { icon: BookOpen, title: "Outreach Templates", text: "Learn exactly what to say when you contact college coaches, and what not to say. First impressions don't get second chances." },
  { icon: TrendingUp, title: "Honest Profile Evaluation", text: "An honest assessment of where you stand athletically and what level programs are realistic — and achievable with work." },
]

export function PlayersPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px]">
            <ArrowLeft size={15} /> Back
          </button>
          <span className="font-display text-lg uppercase tracking-wide">BTB <span className="text-[var(--btb-red)]">Players Hub</span></span>
          <a href="#" className="px-5 py-2 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)] transition-colors">
            Apply Now
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">Players Hub</div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase tracking-wide leading-[0.88] mb-8">
            Your Development.<br />Your Film.<br /><span className="text-[var(--btb-red)]">Your Future.</span>
          </h1>
          <p className="text-[1.05rem] text-white/85 max-w-[520px] leading-[1.9]">
            The BTB Players Hub is everything a serious athlete needs to understand their development — how film study works, what the 16-week cycle looks like, and how BTB prepares you for the next level.
          </p>
        </div>
      </section>

      {/* Film Study */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Film Study</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            How Film Study<br />Actually Works
          </h2>
          <p className="text-[1rem] text-white/85 mb-14 max-w-[420px] leading-relaxed">
            Not optional. Not occasional. This is where your lacrosse IQ actually gets built.
          </p>
          <div className="space-y-3">
            {filmProcess.map((f) => (
              <div key={f.step} className="flex gap-6 items-start p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-colors">
                <div className="font-display text-[var(--btb-red)] text-xl leading-none shrink-0 w-8">{f.step}</div>
                <div className="w-px self-stretch bg-white/[0.08]" />
                <div>
                  <div className="font-display text-[1.05rem] uppercase tracking-wide text-white mb-1">{f.title}</div>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Phases */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Development Cycle</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Your 16-Week<br />Development Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phases.map((p, i) => (
              <div key={p.num} className={`p-7 rounded-xl border transition-colors ${
                i === 1
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="text-[1.05rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">{p.weeks}</div>
                <div className="font-display text-xl uppercase tracking-wide text-white mb-4">{p.num} — {p.title}</div>
                <p className="text-[1.05rem] text-white/90 mb-3">
                  <span className="text-white/85 uppercase text-[1.05rem] tracking-[1px] mr-2">Focus</span>
                  {p.focus}
                </p>
                <p className="text-[1rem] text-white/85 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiting Toolkit */}
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">College Track</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Recruiting<br />Toolkit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {recruitingTools.map((t) => (
              <div key={t.title} className="p-7 rounded-xl border border-white/[0.07] bg-white/[0.02] flex gap-5 hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/10 flex items-center justify-center shrink-0">
                  <t.icon size={18} strokeWidth={1.5} className="text-[var(--btb-red)]" />
                </div>
                <div>
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white mb-2">{t.title}</h4>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{t.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <p className="font-display text-[clamp(1.5rem,3vw,2.2rem)] uppercase tracking-wide leading-[1.1] mb-8">
                Ready to take your game<br />to the <span className="text-[var(--btb-red)]">next level?</span>
              </p>
              <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all duration-200">
                Apply for 2026 <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
