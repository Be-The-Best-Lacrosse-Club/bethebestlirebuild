import React from "react"
import { useReveal } from "@/hooks/useReveal"
import { useWordSplit } from "@/hooks/useScrollAnimation"
import { MASTER_COACHES } from "@/lib/programData"

// Pull "2030 Rage", "2031 Carnage" etc out of a coach bio.
// Bios use phrasings like "Coaches BTB 2030 Reign", "Leads BTB 2032 Riptide and 2034 Thunder",
// "Directs BTB 2029 Chrome, 2032 Grizzlies, and 2030 Reign".
function extractTeams(bio: string): string {
  const matches = bio.match(/\b(20\d{2}\s+[A-Z][A-Za-z']+)/g)
  if (!matches || matches.length === 0) {
    if (/Futures/i.test(bio)) return "BTB Futures"
    return ""
  }
  return matches.slice(0, 2).join(" · ")
}

const FOUNDER = MASTER_COACHES.find((c) => c.name === "Dan Achatz")
const ROSTER = MASTER_COACHES.filter((c) => c.name !== "Dan Achatz")
  .map((c) => ({ name: c.name, teams: extractTeams(c.bio) }))
  .filter((c) => c.teams.length > 0)

// Split into 3 rows for alternating-direction marquees
const ROW_SIZE = Math.ceil(ROSTER.length / 3)
const ROW_1 = ROSTER.slice(0, ROW_SIZE)
const ROW_2 = ROSTER.slice(ROW_SIZE, ROW_SIZE * 2)
const ROW_3 = ROSTER.slice(ROW_SIZE * 2)

export function FeaturedCoaches() {
  const ref = useReveal({ className: "reveal-stagger" })
  const titleRef = useWordSplit(55)

  return (
    <section className="featured-coaches relative overflow-hidden bg-black border-t border-white/5 py-20 md:py-32">
      {/* Faint Dan-with-team background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/dan.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          opacity: 0.18,
          filter: "grayscale(0.3) contrast(1.1)",
        }}
      />
      {/* Dark gradient + red wash to give the photo "strong effect" without losing readability */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.85) 100%), radial-gradient(ellipse at 70% 30%, rgba(210,38,48,0.18) 0%, transparent 55%)",
        }}
      />
      {/* Ghost word */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <span className="font-display text-[22vw] leading-none text-white/[0.025] select-none translate-y-12">
          PRO_STAFF
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10 px-4 md:px-6">
        {/* Eyebrow + headline */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-3 text-[var(--btb-red)] font-display text-sm tracking-[5px] mb-6">
            <div className="w-8 h-px bg-[var(--btb-red)]" />
            ELITE COACHING ROSTER
            <div className="w-8 h-px bg-[var(--btb-red)]" />
          </div>
          <h2
            ref={titleRef as React.RefObject<HTMLHeadingElement>}
            className="font-display text-[clamp(2.2rem,8vw,6rem)] uppercase leading-[0.85] text-white"
          >
            Led by the <br /> <span className="text-[var(--btb-red)]">Professionals.</span>
          </h2>
        </div>

        {/* Founder bio */}
        <div ref={ref} className="grid md:grid-cols-12 gap-6 md:gap-10 items-end mb-16 md:mb-24">
          <div className="reveal-child md:col-span-7">
            <div className="text-[var(--btb-red)] font-display text-xs tracking-[4px] mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-[var(--btb-red)]" />
              THE FOUNDER · DAN ACHATZ
            </div>
            <h3 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] uppercase leading-[0.95] text-white mb-6">
              I'm Dan Achatz — <span className="text-[var(--btb-red)]">founder of Be The Best.</span>
            </h3>
            <div className="space-y-4 text-white/90 text-[1.02rem] leading-relaxed max-w-[640px]">
              <p>
                Rutgers lacrosse alum, Plainedge varsity head coach, and the founder of Be The Best. I started BTB in 2021 with one team and one belief: that every kid who walks in deserves to be coached like the work matters. Because it does.
              </p>
              <p>
                Five years later, we're 22 elite teams, 450+ players, and 45+ coaches — Boys and Girls, K through sophomore year. None of that happened because of me. It happened because of the players who kept showing up, the coaches who poured themselves into it, and the families who trusted us with something that matters more than lacrosse.
              </p>
              <p>
                The culture we built on day one — show up early, own your reps, watch the film, lift each other — that's not something I invented. It's something we earned together. <span className="text-white">I'm proud of what this club has become. More than that, I'm proud of who it's become.</span> That's the thing we protect above everything else.
              </p>
            </div>
          </div>
          <div className="reveal-child md:col-span-5 md:pb-2">
            <div className="border-l-2 border-[var(--btb-red)] pl-6 space-y-5">
              {FOUNDER && FOUNDER.credentials.map((cred) => (
                <div key={cred} className="flex flex-col">
                  <span className="text-[1.05rem] font-black text-white/90 uppercase tracking-[3px] mb-1">
                    Credential
                  </span>
                  <span className="font-display text-xl uppercase tracking-wider text-white leading-tight">
                    {cred}
                  </span>
                </div>
              ))}
              <div className="flex flex-col">
                <span className="text-[1.05rem] font-black text-white/90 uppercase tracking-[3px] mb-1">
                  Currently Coaches
                </span>
                <span className="font-display text-xl uppercase tracking-wider text-white leading-tight">
                  2033 Renegades · 2033 Storm · 2028 Black
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling coach roster — 3 marquee rows, alternating direction */}
        <div className="relative">
          <div className="text-[var(--btb-red)] font-display text-xs tracking-[4px] mb-6 flex items-center gap-3 px-1">
            <span className="w-6 h-px bg-[var(--btb-red)]" />
            THE STAFF · 45+ COACHES STRONG
          </div>

          <div className="space-y-3 md:space-y-4 mask-fade-x">
            <CoachRow coaches={ROW_1} duration={48} reverse={false} />
            <CoachRow coaches={ROW_2} duration={56} reverse={true} />
            <CoachRow coaches={ROW_3} duration={52} reverse={false} />
          </div>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <a
            href="/boys/coaches"
            className="inline-flex items-center gap-4 text-white/90 hover:text-white transition-colors group"
          >
            <span className="text-[1.05rem] font-black uppercase tracking-[4px]">
              View Full Staff Directory
            </span>
            <div className="w-10 h-px bg-white/20 group-hover:w-16 group-hover:bg-[var(--btb-red)] transition-all" />
          </a>
        </div>
      </div>

      <style>{`
        .featured-coaches .mask-fade-x {
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
        .featured-coaches .coach-marquee {
          display: flex;
          overflow: hidden;
        }
        .featured-coaches .coach-marquee-track {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          padding-right: 12px;
          animation: coachMarquee var(--coach-duration, 48s) linear infinite;
        }
        .featured-coaches .coach-marquee-track.reverse {
          animation-direction: reverse;
        }
        .featured-coaches .coach-marquee:hover .coach-marquee-track {
          animation-play-state: paused;
        }
        @keyframes coachMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .featured-coaches .coach-card {
          flex-shrink: 0;
          min-width: 240px;
          padding: 16px 22px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .featured-coaches .coach-card:hover {
          border-color: rgba(210,38,48,0.5);
          background: rgba(210,38,48,0.08);
          transform: translateY(-2px);
        }
        .featured-coaches .coach-card-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          line-height: 1;
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .featured-coaches .coach-card-teams {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }
        .featured-coaches .coach-card-dot {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--btb-red);
          margin-right: 8px;
          vertical-align: middle;
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .featured-coaches .coach-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  )
}

type RowProps = {
  coaches: Array<{ name: string; teams: string }>
  duration: number
  reverse: boolean
}

function CoachRow({ coaches, duration, reverse }: RowProps) {
  // Duplicate the array so the marquee loops seamlessly
  const items = [...coaches, ...coaches]
  return (
    <div className="coach-marquee">
      <div
        className={`coach-marquee-track ${reverse ? "reverse" : ""}`}
        style={{ ["--coach-duration" as string]: `${duration}s` }}
      >
        {items.map((c, i) => (
          <div key={`${c.name}-${i}`} className="coach-card">
            <div className="coach-card-name">
              <span className="coach-card-dot" />
              {c.name}
            </div>
            <div className="coach-card-teams">{c.teams}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
