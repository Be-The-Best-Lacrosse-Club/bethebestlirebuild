import { useReveal } from "@/hooks/useReveal"
import { useWordSplit, useStaggerReveal } from "@/hooks/useScrollAnimation"
import { Quote, Activity } from "lucide-react"

const testimonials = [
  {
    quote: "The film study changed my whole game. I started seeing defensive rotations before they happened. My high school coaches noticed the difference immediately.",
    role: "Player · 2028 BTB Black",
    spec: "PLAYER_VOUCH // 01"
  },
  {
    quote: "I committed to Stony Brook my junior year. I don't think that happens without BTB. The recruiting prep alone was worth it — knowing how to talk to coaches.",
    role: "Player · Stony Brook Commit",
    spec: "PLAYER_VOUCH // 02"
  },
  {
    quote: "My son came in as a good athlete who happened to play lacrosse. After two years at BTB, he is a true lacrosse player with high-level IQ and stick skills.",
    role: "Parent · 2028 Travel Team",
    spec: "PARENT_VOUCH // 03"
  }
]

const parentTestimonials = [
  {
    quote: "The level of organization BTB runs compared to other clubs is night and day. Communication is clear, expectations are set, and my son knows exactly where he stands.",
    role: "Parent · BTB 2031 Carnage",
    spec: "FEEDBACK // 01"
  },
  {
    quote: "We looked at several clubs before committing to BTB. What made the decision easy was watching a practice. The coaches coach. There's no wasted reps.",
    role: "Parent · BTB Thunder 2034",
    spec: "FEEDBACK // 02"
  },
  {
    quote: "BTB doesn't just develop lacrosse players — it develops confident young female competitors. My daughter is tougher, more coachable, and more self-aware.",
    role: "Parent · BTB Storm 2033",
    spec: "FEEDBACK // 03"
  }
]

export function Results() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)
  const cardsRef = useStaggerReveal(80)

  return (
    <section className="bg-black py-32 px-6 relative overflow-hidden border-t border-white/5" id="results">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
        <span className="font-display text-[25vw] leading-none text-white select-none">
          VOUCH_DATA
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8 pb-12 border-b border-white/10">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <Activity size={12} className="animate-pulse" />
              SOCIAL_PROOF // FIELD_REPORTS
            </div>
            <h2 className="font-display text-[clamp(2.8rem,8vw,5rem)] uppercase leading-[0.85] text-white">
              The Parent <br /> <span className="text-[var(--btb-red)]">Perspective.</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-white/10 pl-8">
            Authentic feedback from the families who live the BTB Standard every weekend. Real development. Real results.
          </p>
        </div>

        {/* Featured Quote */}
        <div className="relative bg-[#D22630] p-12 md:p-20 mb-0.5 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 skew-x-[-45deg] translate-x-16 -translate-y-16" />
          <Quote className="absolute top-10 left-10 text-black/10" size={120} />
          
          <div className="relative z-10">
            <div className="font-mono text-[10px] text-black/40 uppercase tracking-[3px] mb-8">FEATURED_VOUCH // 01</div>
            <p className="font-display text-[clamp(1.5rem,4vw,2.5rem)] uppercase leading-[1.1] text-white mb-12 max-w-[800px]">
              "{parentTestimonials[0].quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-white/30" />
              <div className="text-[0.75rem] font-black uppercase tracking-[3px] text-black/60">{parentTestimonials[0].role}</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-white/10 border-x border-b border-white/10">
          {[...testimonials, ...parentTestimonials.slice(1)].map((t, i) => (
            <div
              key={i}
              className="reveal-child group relative p-10 bg-black hover:bg-neutral-900 transition-all duration-300"
            >
              <div className="text-[10px] font-mono text-[var(--btb-red)] mb-8">{t.spec}</div>
              <p className="text-[0.92rem] text-white/50 leading-relaxed mb-10 italic group-hover:text-white/80 transition-colors">
                "{t.quote}"
              </p>
              <div className="pt-6 border-t border-white/5">
                <div className="font-display text-lg text-white uppercase tracking-wider">
                  {t.role}
                </div>
                <div className="text-[0.6rem] font-mono text-white/20 uppercase tracking-[1px] mt-1">
                  Verified_Feedback
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
