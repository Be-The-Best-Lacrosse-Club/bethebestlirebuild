import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"

const testimonials = [
  {
    quote: "The film study changed my whole game. I started seeing defensive rotations before they happened. My high school coaches noticed within the first week of tryouts.",
    name: "Ethan K.",
    role: "Player · Class of 2027 · Made Varsity as Freshman",
    initials: "EK",
  },
  {
    quote: "I committed to Stony Brook my junior year. I don't think that happens without BTB. The recruiting prep alone was worth it — knowing how to reach out, what to send, how to talk to coaches.",
    name: "Connor B.",
    role: "Player · Committed to Stony Brook University",
    initials: "CB",
  },
  {
    quote: "My son came in as a good athlete who happened to play lacrosse. After two years at BTB, he is a lacrosse player who happens to be a good athlete. The difference is coaching.",
    name: "Jennifer M.",
    role: "Parent · 2028 Travel Team",
    initials: "JM",
  },
  {
    quote: "I made JV as a 7th grader because of the footwork and positioning work. It's not just drills — they teach you why every move matters.",
    name: "Marcus T.",
    role: "Player · Class of 2030",
    initials: "MT",
  },
]

const parentTestimonials = [
  {
    quote: "BTB arrived on the scene when my son was in 6th grade. He is now in 10th and being highly recruited. But the best part for us was the confidence, care, and love for the game Coach Dan brought back into his life. It's an all-in mentality here — buy into the culture, and great things will happen.",
    role: "BTB Black 2028 Parent",
  },
  {
    quote: "The level of organization BTB runs compared to other clubs is night and day. Communication is clear, expectations are set, and my son knows exactly where he stands. That accountability is what separates good programs from great ones.",
    role: "BTB 2031 Carnage Parent",
  },
  {
    quote: "We looked at several clubs before committing to BTB. What made the decision easy was watching a practice. The coaches coach. There's no standing around, no wasted reps. My daughter left that first session already better than when she walked in.",
    role: "BTB Thunder 2034 Parent",
  },
  {
    quote: "BTB doesn't just develop lacrosse players — it develops confident young female competitors. My daughter, through the guidance of BTB, is tougher, more coachable, and more self-aware than she was a year ago. That's the program. That's the staff. The passion to be great is contagious.",
    role: "BTB Storm 2033 Parent",
  },
  {
    quote: "My son didn't come in with a highlight reel. He just wanted a shot. BTB gave him that — and then pushed him to do something with it. No kid gets written off here. If you show up, work, and compete, this program will find a place for you.",
    role: "BTB 2032 Cannon Parent",
  },
  {
    quote: "He's six. He thinks practice is the best part of his week. That tells you everything about how BTB coaches interact with young players — high energy, high standard, but always fun.",
    role: "BTB 2036 Dawgs Parent",
  },
]

export function Results() {
  const playerGridRef = useReveal({ className: "reveal-stagger" })
  const parentGridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-white py-28 px-6" id="results">
      <div className="max-w-[1000px] mx-auto">
        <SectionHeader
          number="05"
          label="Testimonials"
          title={"Hear It From\nThe Players"}
          subtitle="These are BTB athletes and their families — in their own words, unedited."
          light
        />

        {/* Featured commit story */}
        <div className="relative rounded-2xl bg-black text-white overflow-hidden mb-5 p-10">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
          <div className="absolute top-4 right-6 font-display text-[7rem] text-white/[0.04] leading-none select-none">"</div>
          <div className="relative z-10">
            <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-5 inline-block">Commit Story</span>
            <p className="font-display text-[clamp(1.2rem,2.5vw,1.65rem)] uppercase tracking-wide leading-[1.2] text-white mb-8 max-w-[700px]">
              "{testimonials[1].quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--btb-red)] flex items-center justify-center font-bold text-sm">{testimonials[1].initials}</div>
              <div>
                <div className="font-semibold text-white text-sm">{testimonials[1].name}</div>
                <div className="text-white/40 text-[0.72rem]">{testimonials[1].role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Player grid */}
        <div ref={playerGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[testimonials[0], testimonials[2], testimonials[3]].map((t) => (
            <div key={t.initials} className="reveal-child rounded-2xl border border-neutral-100 bg-neutral-50 p-7 hover:border-[var(--btb-red)]/30 hover:bg-white transition-all card-hover group">
              <div className="font-display text-4xl text-neutral-200 group-hover:text-[var(--btb-red)] leading-none mb-4 transition-colors -mt-1">"</div>
              <p className="text-[0.84rem] text-neutral-600 leading-[1.8] mb-6">{t.quote}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center font-bold text-[0.72rem] text-white shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-black text-[0.82rem]">{t.name}</div>
                  <div className="text-neutral-400 text-[0.7rem]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Testimonials */}
        <div className="mt-28">
          <SectionHeader
            number="06"
            label="Families"
            title={"The Parent\nPerspective"}
            subtitle="From the families who live this every weekend."
            light
          />

          {/* Featured parent quote */}
          <div className="relative rounded-2xl bg-black text-white overflow-hidden mb-5 p-10">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btb-red)]" />
            <div className="absolute top-4 right-6 font-display text-[7rem] text-white/[0.04] leading-none select-none">"</div>
            <div className="relative z-10">
              <span className="text-[0.65rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-5 inline-block">Parent Testimonial</span>
              <p className="font-display text-[clamp(1.2rem,2.5vw,1.65rem)] uppercase tracking-wide leading-[1.2] text-white mb-8 max-w-[700px]">
                "{parentTestimonials[0].quote}"
              </p>
              <div className="text-white/40 text-[0.78rem] font-medium">— {parentTestimonials[0].role}</div>
            </div>
          </div>

          {/* Parent grid */}
          <div ref={parentGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parentTestimonials.slice(1).map((t) => (
              <div key={t.role} className="reveal-child rounded-2xl border border-neutral-100 bg-neutral-50 p-7 hover:border-[var(--btb-red)]/30 hover:bg-white transition-all card-hover group">
                <div className="font-display text-4xl text-neutral-200 group-hover:text-[var(--btb-red)] leading-none mb-4 transition-colors -mt-1">"</div>
                <p className="text-[0.84rem] text-neutral-600 leading-[1.8] mb-6">{t.quote}</p>
                <div className="pt-4 border-t border-neutral-100">
                  <div className="text-neutral-400 text-[0.78rem] font-medium">— {t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
