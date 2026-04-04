import { Video, Users, BookOpen, Target, TrendingUp, Shield } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"

const benefits = [
  {
    icon: Users,
    title: "Small-Group Training",
    what: "Max 8 players per coach.",
    detail: "You get real reps, real corrections, and real coaching — not a number in a line drill. Every session is intentional.",
    tag: "Year-Round"
  },
  {
    icon: Video,
    title: "Weekly Film Study",
    what: "Your game. On film. Every week.",
    detail: "You'll watch your own footage with a coach who breaks down exactly what you did right, what you missed, and how to fix it.",
    tag: "Required"
  },
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    what: "A plan built for you — not a generic workout.",
    detail: "Every practice follows a written plan with timed segments and specific skill targets based on where you are in the development cycle.",
    tag: "16-Week Cycle"
  },
  {
    icon: Target,
    title: "Position-Specific Coaching",
    what: "Attack. Midfield. Defense. Goalie. FOGO.",
    detail: "Your training is built for your position. Attackmen work on feeding and shot selection. Defenders work approach and slide timing. You get what you actually need.",
    tag: "All Positions"
  },
  {
    icon: TrendingUp,
    title: "Recruiting Preparation",
    what: "We help you build a highlight reel that gets noticed.",
    detail: "Learn how to market yourself, which programs fit your profile, and what college coaches actually look for — before you start reaching out.",
    tag: "College Track"
  },
  {
    icon: Shield,
    title: "Certified Coaching Staff",
    what: "Every coach is background-checked and US Lacrosse certified.",
    detail: "You're being coached by people who prepared for this — not just former players who showed up. Practice plans are submitted before every session.",
    tag: "Verified"
  },
]

export function WhatYouGet() {
  const gridRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black text-white py-28 px-6" id="whatyouget">
      <div className="max-w-[1000px] mx-auto">
        <SectionHeader
          number="02"
          label="The Program"
          title={"Here's Exactly\nWhat You Get"}
          subtitle="No guesswork. No generic drills. This is what BTB athletes actually receive when they join the program."
        />

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`reveal-child group rounded-2xl border p-7 transition-all duration-300 cursor-default card-hover ${
                i === 1
                  ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5 hover:bg-[var(--btb-red)]/8"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  i === 1 ? "bg-[var(--btb-red)]/20" : "bg-white/[0.05]"
                }`}>
                  <b.icon size={18} className={i === 1 ? "text-[var(--btb-red)]" : "text-white/40 group-hover:text-white/60"} strokeWidth={1.5} />
                </div>
                <span className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-1 rounded-full ${
                  i === 1 ? "bg-[var(--btb-red)]/20 text-[var(--btb-red)]" : "bg-white/[0.05] text-white/25"
                }`}>{b.tag}</span>
              </div>

              <h4 className="font-display text-[1.05rem] uppercase tracking-wide mb-2">{b.title}</h4>
              <p className={`text-[0.82rem] font-semibold mb-3 ${i === 1 ? "text-[var(--btb-red)]" : "text-white/55"}`}>{b.what}</p>
              <p className="text-[0.8rem] text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">{b.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="#apply" className="text-[0.72rem] font-bold uppercase tracking-[2px] text-white/25 hover:text-[var(--btb-red)] transition-colors">
            Ready to join? Apply below →
          </a>
        </div>
      </div>
    </section>
  )
}
