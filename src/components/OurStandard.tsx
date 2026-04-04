import { useReveal } from "@/hooks/useReveal"
import { SectionHeader } from "@/components/shared/SectionHeader"

const standards = [
  { title: "You will be coached, not managed.", text: "Every correction comes with a coaching point and a path forward. We don't yell from the sideline — we teach on the field." },
  { title: "You will study film every week.", text: "It is not optional. It is not occasional. Film study is where lacrosse IQ is built, and we take it as seriously as practice." },
  { title: "You will earn your playing time.", text: "There are no guaranteed roles. The player who prepares harder and executes with more consistency will play. That is the only formula." },
  { title: "You will be held accountable.", text: "If you have a bad practice, we know. If you're not executing what you learned last week, we'll address it. That is not a threat — it's how players improve." },
]

export function OurStandard() {
  const listRef = useReveal({ className: "reveal-stagger" })

  return (
    <section className="bg-black text-white py-28 px-6" id="standard">
      <div className="max-w-[900px] mx-auto">
        <SectionHeader
          number="07"
          label="The Standard"
          title={"What We Expect\nFrom Every Athlete"}
          subtitle="BTB is selective because development requires commitment. If you're serious about getting better — this is what that actually looks like."
        />

        <div ref={listRef} className="space-y-0 border-t border-white/[0.07] mb-14">
          {standards.map((s, i) => (
            <div key={i} className="reveal-child flex items-start gap-8 py-8 border-b border-white/[0.07] group">
              <div className="font-display text-[0.7rem] text-white/15 group-hover:text-[var(--btb-red)] transition-colors shrink-0 pt-0.5 w-6">
                0{i + 1}
              </div>
              <div>
                <h4 className="font-display text-[1.15rem] uppercase tracking-wide text-white group-hover:text-[var(--btb-red)] transition-colors mb-2">{s.title}</h4>
                <p className="text-[0.84rem] text-white/35 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative border border-[var(--btb-red)]/25 rounded-2xl px-10 py-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[var(--btb-red)]/[0.04]" />
          <p className="relative font-display text-[clamp(1.3rem,3vw,1.9rem)] uppercase tracking-wide text-white leading-[1.15]">
            "This program is not for everyone.<br />
            It's for athletes who want to be <span className="text-[var(--btb-red)]">the best version</span><br />
            of themselves."
          </p>
        </div>
      </div>
    </section>
  )
}
