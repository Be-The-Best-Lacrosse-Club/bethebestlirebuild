import { useState, useRef, useEffect } from "react"
import type React from "react"
import {
  ArrowRight, GraduationCap, Video, Target, Brain, Trophy, Swords, Lock,
  Play, ChevronRight, Shield,
} from "lucide-react"
import { useWordSplit } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"
import {
  ATTACK_LESSONS,
  DEFENSE_LESSONS,
  MIDFIELD_LESSONS,
  GOALIE_LESSONS,
  FOGO_LESSONS,
} from "@/lib/academyData"

// ─── Track config ────────────────────────────────────────────────────────────

const TRACKS = [
  {
    id: "attack",
    label: "Attack",
    spec: "TRACK // 01",
    icon: Swords,
    color: "#D22630",
    tagline: "Create goals. Beat defenders. Own the cage.",
    lessons: ATTACK_LESSONS.slice(0, 3),
  },
  {
    id: "midfield",
    label: "Midfield",
    spec: "TRACK // 02",
    icon: Target,
    color: "#D22630",
    tagline: "Transition reads, ground balls, and two-way play.",
    lessons: MIDFIELD_LESSONS.slice(0, 3),
  },
  {
    id: "defense",
    label: "Defense",
    spec: "TRACK // 03",
    icon: Shield,
    color: "#D22630",
    tagline: "Slides, communication, and a lock-down mentality.",
    lessons: DEFENSE_LESSONS.slice(0, 3),
  },
  {
    id: "goalie",
    label: "Goalie",
    spec: "TRACK // 04",
    icon: Trophy,
    color: "#D22630",
    tagline: "Save mechanics, outlets, and leadership from the cage.",
    lessons: GOALIE_LESSONS.slice(0, 3),
  },
  {
    id: "fogo",
    label: "FOGO / Draw",
    spec: "TRACK // 05",
    icon: Brain,
    color: "#D22630",
    tagline: "The most specialized position. Dominated by the most prepared.",
    lessons: FOGO_LESSONS.slice(0, 3),
  },
  {
    id: "film",
    label: "Film Study",
    spec: "TRACK // 06",
    icon: Video,
    color: "#D22630",
    tagline: "Watch, break down, and learn from real lacrosse film.",
    lessons: [],
  },
]

// YouTube thumbnail helper
function ytThumb(url?: string): string | null {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DigitalAcademy() {
  const [activeTrack, setActiveTrack] = useState(0)
  const [animating, setAnimating] = useState(false)
  const titleRef = useWordSplit(55)
  const navigate = useNavigate()
  const lessonPanelRef = useRef<HTMLDivElement>(null)

  const track = TRACKS[activeTrack]
  const hasLessons = track.lessons.length > 0

  function switchTrack(idx: number) {
    if (idx === activeTrack || animating) return
    setAnimating(true)
    setTimeout(() => {
      setActiveTrack(idx)
      setAnimating(false)
    }, 180)
  }

  return (
    <section
      className="bg-black text-white py-20 md:py-32 px-4 md:px-6 relative overflow-hidden"
      id="digital-academy"
    >
      {/* Ghost BG */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025]">
        <span className="font-display text-[28vw] leading-none text-white">ACADEMY</span>
      </div>

      {/* Red accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--btb-red)]" />

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 pb-12 border-b border-white/10">
          <div>
            <div className="text-[var(--btb-red)] font-mono text-[0.6rem] tracking-[5px] mb-5 flex items-center gap-3">
              <GraduationCap size={11} />
              BTB_DIGITAL_ACADEMY // ONLINE_PLATFORM
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2.4rem,7vw,5rem)] uppercase leading-[0.85] text-white"
            >
              Train Smarter.<br />
              <span className="text-[var(--btb-red)]">Compete Better.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-[320px] border-l border-white/10 pl-6">
            90+ lessons. 6 position-specific tracks. Film study, skill progressions,
            and knowledge checks — available 24/7 to every BTB player and coach.
          </p>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 mb-12">
          {[
            { num: "90+", label: "Lessons" },
            { num: "6",   label: "Position Tracks" },
            { num: "3",   label: "Age Tiers" },
            { num: "4",   label: "Pillars" },
          ].map(s => (
            <div key={s.label} className="bg-black px-6 py-7 text-center">
              <div className="font-display text-[3rem] leading-none text-[var(--btb-red)]">{s.num}</div>
              <div className="text-[0.58rem] font-black uppercase tracking-[3px] text-white/25 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Track tabs ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-px mb-px bg-white/10 border border-white/10">
          {TRACKS.map((t, i) => {
            const Icon = t.icon
            const active = i === activeTrack
            return (
              <button
                key={t.id}
                onClick={() => switchTrack(i)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-[0.62rem] font-black uppercase tracking-[2px]
                  transition-all duration-200 flex-1 justify-center
                  ${active
                    ? "bg-[var(--btb-red)] text-white"
                    : "bg-black text-white/40 hover:text-white hover:bg-white/5"}
                `}
              >
                <Icon size={12} strokeWidth={2.5} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Track panel ────────────────────────────────────────────────── */}
        <div
          ref={lessonPanelRef}
          className={`
            border border-white/10 border-t-0 bg-[#0A0A0A] transition-opacity duration-200
            ${animating ? "opacity-0" : "opacity-100"}
          `}
        >
          {/* Track header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 bg-[var(--btb-red)] flex items-center justify-center flex-shrink-0">
                <track.icon size={16} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <div className="text-white font-display text-xl uppercase tracking-wide leading-none">{track.label}</div>
                <div className="text-white/35 text-[0.62rem] font-mono tracking-[2px] mt-0.5">{track.spec}</div>
              </div>
            </div>
            <p className="text-white/40 text-sm max-w-[400px]">{track.tagline}</p>
          </div>

          {/* Lessons */}
          {hasLessons ? (
            <div className="divide-y divide-white/5">
              {track.lessons.map((lesson, i) => {
                const thumb = ytThumb(lesson.videoUrl)
                const isFirst = i === 0
                return (
                  <div
                    key={lesson.id}
                    className={`
                      relative flex gap-5 p-5 group
                      ${isFirst ? "" : "opacity-60"}
                    `}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 sm:w-40 flex-shrink-0 aspect-video bg-white/5 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video size={20} className="text-white/20" />
                        </div>
                      )}
                      {/* Lock overlay on non-first */}
                      {!isFirst ? (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Lock size={16} className="text-white/40" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-9 h-9 rounded-full bg-[var(--btb-red)] flex items-center justify-center">
                            <Play size={14} className="text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      )}
                      {isFirst && (
                        <div className="absolute top-1.5 left-1.5 bg-[var(--btb-red)] text-white text-[0.5rem] font-black uppercase tracking-[2px] px-1.5 py-0.5">
                          Preview
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[0.55rem] font-mono text-white/25 tracking-[2px] uppercase">
                          Lesson {lesson.lessonNumber || i + 1}
                        </span>
                        {lesson.topic && (
                          <>
                            <span className="text-white/10">·</span>
                            <span className="text-[0.55rem] font-mono text-white/25 tracking-[2px] uppercase">{lesson.topic}</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-display text-base sm:text-lg uppercase tracking-wide text-white leading-tight mb-2">
                        {lesson.title}
                      </h4>
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                        {lesson.description.slice(0, 160)}...
                      </p>
                      {!isFirst && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <Lock size={10} className="text-white/20" />
                          <span className="text-[0.58rem] text-white/20 uppercase tracking-[2px] font-bold">Academy Access Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* More lessons row */}
              <div className="px-5 py-4 flex items-center justify-between bg-white/[0.02]">
                <span className="text-white/25 text-[0.62rem] font-mono tracking-[2px] uppercase">
                  + {(
                    track.id === "attack" ? ATTACK_LESSONS.length :
                    track.id === "midfield" ? MIDFIELD_LESSONS.length :
                    track.id === "defense" ? DEFENSE_LESSONS.length :
                    track.id === "fogo" ? FOGO_LESSONS.length :
                    GOALIE_LESSONS.length
                  ) - 3} more lessons locked
                </span>
                <div className="flex items-center gap-1.5 text-[var(--btb-red)] text-[0.62rem] font-black uppercase tracking-[2px]">
                  Get Academy Access <ChevronRight size={12} />
                </div>
              </div>
            </div>
          ) : (
            /* Coming soon tracks (FOGO, Film) */
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-5">
                <track.icon size={22} className="text-white/20" strokeWidth={2} />
              </div>
              <div className="font-display text-2xl uppercase text-white/20 mb-2">{track.label}</div>
              <p className="text-white/25 text-sm max-w-[360px]">
                {track.id === "fogo"
                  ? "FOGO / Draw-specific track — ground ball dominance, clamp techniques, and fast break reads."
                  : "Game film breakdowns, cut-up analysis, and positional reads. Full track launching with the academy."}
              </p>
              <div className="mt-6 flex items-center gap-2 text-[0.6rem] font-mono text-white/15 tracking-[3px] uppercase">
                <div className="w-6 h-px bg-white/10" />
                Launching with Academy Access
                <div className="w-6 h-px bg-white/10" />
              </div>
            </div>
          )}
        </div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/10">
          <div>
            <div className="text-white font-display text-xl uppercase mb-1">Ready to access all 90+ lessons?</div>
            <div className="text-white/35 text-sm">Full platform — boys and girls — with progress tracking, quizzes, and film study.</div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => navigate("/boys/players")}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-[var(--btb-red)] text-white text-[0.68rem] font-black uppercase tracking-[2px] hover:bg-white hover:text-black transition-all group"
            >
              Boys Academy <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/girls/players")}
              className="flex items-center gap-2.5 px-7 py-3.5 border border-white/20 text-white text-[0.68rem] font-black uppercase tracking-[2px] hover:bg-white hover:text-black transition-all group"
            >
              Girls Academy <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
