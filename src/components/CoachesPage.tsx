import { ArrowLeft, ArrowRight, GraduationCap, ShieldCheck, Users, Star, Video, BookOpen } from "lucide-react"

const principles = [
  { num: "01", title: "Teach, Don't Just Correct", text: "Every correction comes with a coaching point and a path forward. We don't yell from the sideline — we explain the why behind every adjustment." },
  { num: "02", title: "Prepare Before You Coach", text: "Practice plans are submitted before every session. No improvising. No winging it. Players can't be held accountable if coaches aren't." },
  { num: "03", title: "Film Is Not Optional", text: "Coaches review film alongside players. Not to critique — to teach. Film study is where the real coaching happens." },
  { num: "04", title: "Development Over Wins", text: "Coaches are evaluated on player development outcomes. A great practice is one where players leave better than when they arrived — not one where the team won." },
]

const sessionStructure = [
  { time: "0–10 min", segment: "Dynamic Warmup", detail: "Position-specific movement prep. Not just jogging — purposeful activation tied to the session focus." },
  { time: "10–30 min", segment: "Skill Block", detail: "Isolated skill development from the drillbook. Targeted reps with coaching points after every set." },
  { time: "30–50 min", segment: "Application", detail: "2-man games, small-sided scenarios, live reads. Skills used in real context against real pressure." },
  { time: "50–65 min", segment: "Team Concepts", detail: "Full-team coordination: rides, clears, settled offense, EMO/man-down, special situations." },
  { time: "65–75 min", segment: "Film & Review", detail: "Key clips reviewed. Corrections reinforced. Next session previewed. The loop closes." },
]

const drillCategories = [
  { category: "Wall Ball", count: 8, description: "Fundamentals, off-hand combinations, footwork timing" },
  { category: "Footwork & Mechanics", count: 7, description: "Body positioning, approach angles, plant-and-throw" },
  { category: "Attack", count: 9, description: "Dodge sequences, shot selection, feeding under pressure" },
  { category: "Defense", count: 8, description: "Slide timing, approach angles, recovery positioning" },
  { category: "Midfield", count: 6, description: "Transition reads, ground ball, 1v1 decisions" },
  { category: "FOGO", count: 4, description: "Draw techniques, quick release, ground ball reads" },
  { category: "Goalie", count: 5, description: "Arc positioning, reaction saves, outlet passing" },
  { category: "Team Concepts", count: 6, description: "Rides, clears, settled offense, EMO/man-down" },
]

const certifications = [
  { icon: GraduationCap, title: "US Lacrosse Certified", text: "All BTB coaches hold active US Lacrosse coaching certification before working with any player." },
  { icon: ShieldCheck, title: "SafeSport Trained", text: "Required annual SafeSport certification for every staff member, renewed each season." },
  { icon: Users, title: "Background Checked", text: "Every coach passes a full background check before joining the program. Non-negotiable." },
  { icon: Star, title: "Internal Development", text: "Coaches complete BTB internal development each season — not just external certifications." },
]

export function CoachesPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px]">
            <ArrowLeft size={15} /> Back
          </button>
          <span className="font-display text-lg uppercase tracking-wide">BTB <span className="text-[var(--btb-red)]">Coaches Hub</span></span>
          <a href="#" className="px-5 py-2 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)] transition-colors">
            Apply Now
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">Coaches Hub</div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase tracking-wide leading-[0.88] mb-8">
            Built to Coach.<br />Trained to Lead.
          </h1>
          <p className="text-[1.05rem] text-white/85 max-w-[560px] leading-[1.9]">
            The BTB Coaches Hub is the operational backbone of our program. Every standard, every drill, every practice plan — documented and enforced. This is how we build coaches who build players.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Coaching Philosophy</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Four Principles.<br />Non-Negotiable.
          </h2>
          <div className="space-y-0 border-t border-white/[0.07]">
            {principles.map((p) => (
              <div key={p.num} className="flex items-start gap-8 py-8 border-b border-white/[0.07] group">
                <div className="font-display text-[1.05rem] text-white/15 group-hover:text-[var(--btb-red)] transition-colors shrink-0 pt-0.5 w-6">{p.num}</div>
                <div>
                  <h4 className="font-display text-[1.1rem] uppercase tracking-wide text-white group-hover:text-[var(--btb-red)] transition-colors mb-2">{p.title}</h4>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Structure */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Practice Structure</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            How a BTB<br />Practice Runs
          </h2>
          <p className="text-[1rem] text-white/85 mb-14 max-w-[420px] leading-relaxed">
            Every session follows a submitted written plan. No improvising. No guessing.
          </p>
          <div className="space-y-3">
            {sessionStructure.map((s) => (
              <div key={s.segment} className="flex gap-6 items-start p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-colors">
                <div className="shrink-0 text-[1.05rem] font-bold text-[var(--btb-red)] uppercase tracking-[1px] w-20 pt-0.5">{s.time}</div>
                <div className="w-px self-stretch bg-white/[0.08]" />
                <div>
                  <div className="font-display text-[1.05rem] uppercase tracking-wide text-white mb-1">{s.segment}</div>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drill Library */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">50+ Drill Playbook</div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92]">
                Eight Categories.<br />One Shared Playbook.
              </h2>
            </div>
            <p className="text-[1rem] text-white/85 max-w-[280px] leading-relaxed md:text-right">
              Every drill has a purpose, setup, execution steps, and video reference. Consistent across all sessions and all coaches.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {drillCategories.map((d, i) => (
              <div key={d.category} className={`p-6 rounded-xl border transition-colors ${
                i === 0 ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-display text-[1rem] uppercase tracking-wide text-white">{d.category}</h4>
                  <span className="font-display text-[var(--btb-red)] text-2xl leading-none">{d.count}</span>
                </div>
                <p className="text-[1.05rem] text-white/85 leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 px-6 bg-neutral-950">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[1.05rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Requirements</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Every Coach.<br />Every Requirement.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((c) => (
              <div key={c.title} className="p-7 rounded-xl border border-white/[0.07] bg-white/[0.02] flex gap-5 hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/10 flex items-center justify-center shrink-0">
                  <c.icon size={18} strokeWidth={1.5} className="text-[var(--btb-red)]" />
                </div>
                <div>
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white mb-2">{c.title}</h4>
                  <p className="text-[1rem] text-white/85 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
