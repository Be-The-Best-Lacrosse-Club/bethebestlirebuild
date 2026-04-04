import { ArrowRight } from "lucide-react"
import { useReveal } from "@/hooks/useReveal"
import { useNavigate } from "react-router-dom"
import { SectionHeader } from "@/components/shared/SectionHeader"

const cards = [
  { num: "01", title: "Game IQ Development", text: "Read defensive formations before they develop. Recognize slide packages. Make faster decisions. This is taught, not hoped for." },
  { num: "02", title: "Decision-Making Under Pressure", text: "Film slows the game down. Players see what happened, why it happened, and what the right decision was — before they face it live." },
  { num: "03", title: "Accountability Through Review", text: "Every player sees their own performance. Missed assignments and poor positioning are identified on film — then corrected on the field." },
  { num: "04", title: "Position-Specific Learning", text: "Attackmen study feeding angles. Middies study transitions. Defensemen study approach. Goalies study shot tendencies. Purpose-built curricula for each role." },
  { num: "05", title: "Self-Scouting", text: "Players learn to identify their own tendencies, strengths, and weaknesses. The skill that separates college-ready athletes from everyone else." },
  { num: "06", title: "Opponent Preparation", text: "Before key matchups, teams review opponent film together. Players enter games with a plan — not just effort." },
]

export function FilmStudy() {
  const gridRef = useReveal({ className: "reveal-stagger" })
  const navigate = useNavigate()

  return (
    <section className="bg-white py-28 px-6" id="filmstudy">
      <div className="max-w-[1000px] mx-auto">
        <SectionHeader
          number="04"
          label="Film Study"
          title={"The Game Is Won\nBefore the Whistle"}
          light
        />

        {/* Cinematic callout */}
        <div className="relative rounded-2xl bg-black text-white overflow-hidden mb-10 px-10 py-12">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 60% 80% at 0% 50%, rgba(210,38,48,0.2) 0%, transparent 60%)"
          }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="font-display text-[clamp(1.4rem,3vw,2rem)] uppercase tracking-wide leading-[1.1] text-white mb-3">
                Film study is the most<br />
                <span className="text-[var(--btb-red)]">underused tool</span><br />
                in youth lacrosse.
              </p>
              <p className="text-[0.82rem] text-white/40 leading-relaxed max-w-[340px]">
                At BTB, it is required. Not optional. Not occasional. Every player, every week.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              {[
                { num: "Weekly", label: "Film sessions" },
                { num: "6", label: "Program modules" },
                { num: "5", label: "Position tracks" },
              ].map((s) => (
                <div key={s.label} className="text-center border border-white/[0.08] rounded-xl py-5 px-3">
                  <div className="font-display text-[1.8rem] text-[var(--btb-red)] leading-none">{s.num}</div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-[1.5px] text-white/25 mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {cards.map((c) => (
            <div
              key={c.num}
              className="reveal-child group p-6 rounded-xl border border-neutral-100 bg-neutral-50 hover:border-black hover:bg-black hover:text-white transition-all duration-300 cursor-default card-hover"
            >
              <div className="font-display text-4xl text-neutral-200 group-hover:text-[var(--btb-red)] leading-none mb-4 transition-colors">{c.num}</div>
              <h4 className="font-display text-[1rem] uppercase tracking-wide text-black group-hover:text-white mb-2 transition-colors">{c.title}</h4>
              <p className="text-[0.8rem] text-neutral-500 group-hover:text-white/45 leading-relaxed transition-colors">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => navigate("/academy")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-[0.7rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red)] btn-glow transition-all duration-200"
          >
            Browse Film Programs <ArrowRight size={13} />
          </button>
          <a href="#apply" className="text-[0.72rem] font-bold uppercase tracking-[1.5px] text-neutral-400 hover:text-[var(--btb-red)] transition-colors">
            Apply to BTB →
          </a>
        </div>
      </div>
    </section>
  )
}
