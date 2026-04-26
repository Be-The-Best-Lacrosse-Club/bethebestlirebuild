import { ArrowLeft, ArrowRight, Video, Users, BookOpen, Target, TrendingUp, Shield, Star } from "lucide-react"

const benefits = [
  { icon: Users, title: "Small-Group Training", stat: "8:1", text: "Max 8 players per coach. Real reps, real corrections, real coaching — not a number in a line drill." },
  { icon: Video, title: "Weekly Film Study", stat: "Required", text: "You'll watch your own footage with a coach who breaks down what you did right, what you missed, and how to fix it." },
  { icon: BookOpen, title: "Structured Curriculum", stat: "16 Weeks", text: "Every practice follows a written plan with timed segments and specific skill targets. Nothing is improvised." },
  { icon: Target, title: "Position-Specific Coaching", stat: "All Positions", text: "Attack, midfield, defense, goalie, FOGO. Your training is built for your position and what you actually need." },
  { icon: TrendingUp, title: "Recruiting Preparation", stat: "College Track", text: "Highlight film packages, outreach guidance, school list strategy, and honest profile evaluation." },
  { icon: Shield, title: "Certified Coaching Staff", stat: "Verified", text: "Every coach is background-checked, US Lacrosse certified, SafeSport trained, and submits practice plans before every session." },
]

const ageGroups = [
  { grad: "2034s–2033s", level: "Youth Development", description: "Foundation-level training focused on fundamentals, mechanics, and love of the game. Building habits before bad ones form." },
  { grad: "2032s–2031s", level: "Development", description: "Structured skill progression with introduction to film study. Players learn to self-assess and apply skills in live situations." },
  { grad: "2030s–2029s", level: "Competitive", description: "Game-speed training, positional reads, and transition play. Film study becomes a weekly requirement. Travel team competition." },
  { grad: "2028s–2027s", level: "Elite / Varsity Prep", description: "College-level preparation. Advanced film breakdown, recruiting toolkit, highlight film, and outreach coaching. The full BTB experience." },
]

const phases = [
  { num: "01", phase: "Foundation", weeks: "Weeks 1–4", items: ["Wall ball fundamentals", "Footwork & body mechanics", "Defensive concepts introduction", "Film study onboarding"] },
  { num: "02", phase: "Connection", weeks: "Weeks 5–8", items: ["2-man game reads", "Transition decision-making", "Position-specific film sessions", "Small-group competition"] },
  { num: "03", phase: "Expansion", weeks: "Weeks 9–12", items: ["Live game-speed scenarios", "Opponent film breakdown", "Self-scouting sessions", "Varsity-level positioning"] },
  { num: "04", phase: "Execution", weeks: "Weeks 13–16", items: ["Game evaluation & review", "Recruiting film preparation", "College-ready standards test", "Next-phase goal setting"] },
]

const testimonials = [
  { quote: "The film study changed my whole game. I started seeing defensive rotations before they happened. My high school coaches noticed within the first week of tryouts.", name: "Ethan K.", role: "Class of 2027 · Made Varsity as Freshman", initials: "EK" },
  { quote: "Watching film with Coach Dan flipped how I think about the game. I stopped reacting and started anticipating — reading slides, off-ball movement, where the ball is going next. It's a completely different sport when you actually see it.", name: "BTB Player", role: "2030 Rage · BTB Boys", initials: "BR" },
  { quote: "My son came in as a good athlete who happened to play lacrosse. After two years at BTB, he is a lacrosse player who happens to be a good athlete. The difference is coaching.", name: "Jennifer M.", role: "Parent · 2028 Travel Team", initials: "JM" },
]

const stats = [
  { num: "500+", label: "Players Trained" },
  { num: "85+", label: "College Commits" },
  { num: "8:1", label: "Player-Coach Ratio" },
  { num: "50+", label: "Documented Drills" },
]

export function BoysPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[0.78rem] font-semibold uppercase tracking-[1.5px]">
            <ArrowLeft size={15} /> Back
          </button>
          <span className="font-display text-lg uppercase tracking-wide">BTB <span className="text-[var(--btb-red)]">Boys Lacrosse</span></span>
          <a href="#apply-boys" className="px-5 py-2 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)] transition-colors">
            Apply Now
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-[1]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)`
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]" style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 65%)"
        }} />
        <div className="relative z-10 max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">Boys Program</div>
          <h1 className="font-display text-[clamp(3.2rem,8vw,6rem)] uppercase tracking-wide leading-[0.88] mb-8">
            Train Like You<br />Mean It.
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-10">
            The BTB Boys Program is Long Island's most structured lacrosse development experience. Film study, position-specific coaching, a 16-week curriculum, and an 8:1 player-to-coach ratio — for every age group.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#apply-boys" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.4)] transition-all duration-200">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[2.2rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-white/25 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">The Program</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            What Every BTB<br />Athlete Gets
          </h2>
          <p className="text-[0.84rem] text-white/35 mb-14 max-w-[420px] leading-relaxed">
            No guesswork. No generic drills. This is what BTB athletes receive when they join.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <div key={b.title} className={`group rounded-2xl border p-7 transition-all duration-300 ${
                i === 1
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
              }`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    i === 1 ? "bg-[var(--btb-red)]/20" : "bg-white/[0.05]"
                  }`}>
                    <b.icon size={18} strokeWidth={1.5} className={i === 1 ? "text-[var(--btb-red)]" : "text-white/40"} />
                  </div>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full ${
                    i === 1 ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]" : "bg-white/[0.05] text-white/25"
                  }`}>{b.stat}</span>
                </div>
                <h4 className="font-display text-[1rem] uppercase tracking-wide mb-3">{b.title}</h4>
                <p className="text-[0.8rem] text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">{b.text}</p>
              </div>
            ))}
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
            {ageGroups.map((g, i) => (
              <div key={g.grad} className={`flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-7 rounded-xl border transition-colors ${
                i === 3 ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="shrink-0 md:w-40">
                  <div className="font-display text-[1.1rem] uppercase tracking-wide text-white">{g.grad}</div>
                  <div className={`text-[0.62rem] font-bold uppercase tracking-[1.5px] mt-1 ${
                    i === 3 ? "text-[var(--btb-red)]" : "text-white/25"
                  }`}>{g.level}</div>
                </div>
                <div className="hidden md:block w-px self-stretch bg-white/[0.08]" />
                <p className="text-[0.84rem] text-white/40 leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16-Week Development */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[900px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">Development Model</div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92]">
                16-Week Cycle.<br />Four Phases.
              </h2>
            </div>
            <p className="text-[0.84rem] text-white/35 max-w-[280px] leading-relaxed md:text-right">
              A repeatable development cycle designed around measurable skill progression.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phases.map((p, i) => (
              <div key={p.num} className={`relative rounded-xl border p-7 overflow-hidden group transition-all duration-300 ${
                i === 1 ? "border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
              }`}>
                <div className="absolute right-4 top-2 font-display text-[4.5rem] text-white/[0.03] leading-none select-none">{p.num}</div>
                <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">{p.weeks}</div>
                <div className="font-display text-xl uppercase tracking-wide mb-5">{p.phase}</div>
                <ul className="space-y-2">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.8rem] text-white/35">
                      <span className="w-1 h-1 rounded-full bg-[var(--btb-red)] mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
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
                Every BTB player studies film weekly with a coach. Your footage is captured, reviewed, and broken down into specific coaching points. Each clip ends with an actionable correction and a drill to match it. The next session targets what film identified.
              </p>
              <div className="flex flex-wrap gap-6">
                {["Your game on film", "Coach-led breakdown", "Specific corrections", "Drill-to-fix loop"].map((item) => (
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
            Hear It From<br />The Players
          </h2>

          {/* Featured */}
          <div className="relative rounded-2xl bg-neutral-950 border border-white/[0.07] overflow-hidden mb-4 p-10">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="absolute top-4 right-6 font-display text-[6rem] text-white/[0.04] leading-none select-none">"</div>
            <div className="relative">
              <span className="text-[0.62rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-5 inline-block">Commit Story</span>
              <p className="font-display text-[clamp(1.1rem,2.5vw,1.5rem)] uppercase tracking-wide leading-[1.25] text-white mb-8 max-w-[600px]">
                "{testimonials[1].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--btb-red)] flex items-center justify-center font-bold text-sm">{testimonials[1].initials}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{testimonials[1].name}</div>
                  <div className="text-white/35 text-[0.72rem]">{testimonials[1].role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[testimonials[0], testimonials[2]].map((t) => (
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
      <section className="py-24 px-6" id="apply-boys">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-14 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
            <div className="relative">
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-6">Boys Program</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Ready to Train<br />Like You <span className="text-[var(--btb-red)]">Mean It?</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                BTB is selective because development requires commitment. We want players who are serious about their game.
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
