/**
 * DigitalAcademy — Homepage section
 * Design language: academy-btb.netlify.app
 * Anton font, #FF000A red, black/charcoal cards, aggressive uppercase copy
 */

import { useState } from "react"
import type React from "react"
import { ArrowRight, Lock, Play, Video, Shield, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  ATTACK_LESSONS,
  DEFENSE_LESSONS,
  MIDFIELD_LESSONS,
  GOALIE_LESSONS,
  FOGO_LESSONS,
} from "@/lib/academyData"
import type { AcademyLesson } from "@/lib/academyData"

// ─── Design tokens (matching academy-btb) ───────────────────────────────────
const RED   = "#FF000A"
const CHAR  = "#141414"
const STEEL = "#1F1F1F"
const IRON  = "#2A2A2A"
const MUTE  = "#888888"

// ─── Track config ────────────────────────────────────────────────────────────

interface Track {
  id: string
  label: string
  num: string
  tagline: string
  lessons: AcademyLesson[]
  total: number
}

const TRACKS: Track[] = [
  { id: "attack",   label: "Attack",      num: "01", tagline: "Dodges, feeds, and finishing. Build the instincts that create goals.",            lessons: ATTACK_LESSONS.slice(0, 3),   total: ATTACK_LESSONS.length },
  { id: "midfield", label: "Midfield",    num: "02", tagline: "Transition reads, ground balls, and two-way play. Be dangerous in every phase.",  lessons: MIDFIELD_LESSONS.slice(0, 3), total: MIDFIELD_LESSONS.length },
  { id: "defense",  label: "Defense",     num: "03", tagline: "Slides, communication, and containment. Build a lock-down mentality.",            lessons: DEFENSE_LESSONS.slice(0, 3),  total: DEFENSE_LESSONS.length },
  { id: "goalie",   label: "Goalie",      num: "04", tagline: "Save mechanics, outlets, and leadership. Own the cage.",                          lessons: GOALIE_LESSONS.slice(0, 3),   total: GOALIE_LESSONS.length },
  { id: "fogo",     label: "FOGO / Draw", num: "05", tagline: "The most specialized position. Dominated by the most prepared.",                  lessons: FOGO_LESSONS.slice(0, 3),     total: FOGO_LESSONS.length },
  { id: "film",     label: "Film Study",  num: "06", tagline: "125 hours of curated film. Watch, break down, and learn like a coach.",           lessons: [],                           total: 0 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ytThumb(url?: string): string | null {
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DigitalAcademy() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const navigate = useNavigate()

  function switchTrack(i: number) {
    if (i === active || fading) return
    setFading(true)
    setTimeout(() => { setActive(i); setFading(false) }, 160)
  }

  const track = TRACKS[active]
  const hasLessons = track.lessons.length > 0

  return (
    <section
      id="digital-academy"
      style={{ background: "#000", fontFamily: "'Inter', system-ui, sans-serif" }}
      className="relative overflow-hidden py-24 md:py-36 px-4 md:px-6"
    >
      {/* Red top border */}
      <div style={{ background: RED, height: 3 }} className="absolute top-0 left-0 right-0" />

      {/* Ghost BG text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ opacity: 0.022 }}
      >
        <span style={{
          fontFamily: "'Anton', 'Bebas Neue', sans-serif",
          fontSize: "clamp(120px, 22vw, 300px)",
          color: "#fff",
          letterSpacing: "0.04em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}>
          ACADEMY
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 pb-10"
          style={{ borderBottom: `1px solid ${STEEL}` }}>
          <div>
            <div className="flex items-center gap-3 mb-5"
              style={{ color: RED, fontFamily: "monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase" }}>
              <div style={{ width: 24, height: 24, background: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: "skew(-8deg)" }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, color: "#fff" }}>B</span>
              </div>
              BTB_DIGITAL_ACADEMY &nbsp;·&nbsp; FILM / IQ / SYSTEMS / EXECUTION
            </div>
            <h2 style={{
              fontFamily: "'Anton', 'Bebas Neue', sans-serif",
              fontSize: "clamp(3rem, 9vw, 7rem)",
              lineHeight: 0.88,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#fff",
              margin: 0,
            }}>
              TRAIN<br />
              LIKE THE{" "}
              <span style={{
                color: RED,
                textDecoration: "line-through",
                textDecorationColor: "#fff",
                textDecorationThickness: 4,
              }}>BEST</span>
            </h2>
          </div>
          <p style={{ color: MUTE, fontSize: 14, lineHeight: 1.7, maxWidth: 300, borderLeft: `1px solid ${STEEL}`, paddingLeft: 24 }}>
            90+ lessons. 6 position-specific tracks. Film study, skill progressions,
            and knowledge checks — available 24/7 to every BTB player.
            <br /><br />
            <span style={{ color: RED, fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Launching Sept 1, 2026
            </span>
          </p>
        </div>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 mb-10"
          style={{ gap: 2, background: STEEL }}>
          {[
            { num: "340+", label: "Active Players" },
            { num: "125",  label: "Hours of Film" },
            { num: "48",   label: "Coaching Modules" },
            { num: "12",   label: "D1 Commits" },
          ].map(s => (
            <div key={s.label} style={{ background: "#000", padding: "28px 24px", textAlign: "center" }}>
              <div style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                lineHeight: 1,
                color: RED,
                letterSpacing: "0.02em",
              }}>{s.num}</div>
              <div style={{ color: MUTE, fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 6 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Track tabs ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap mb-px" style={{ gap: 2, background: STEEL }}>
          {TRACKS.map((t, i) => {
            const isActive = i === active
            return (
              <button
                key={t.id}
                onClick={() => switchTrack(i)}
                style={{
                  flex: "1 1 auto",
                  background: isActive ? RED : CHAR,
                  color: isActive ? "#fff" : MUTE,
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "14px 16px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 180ms",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget.style.color = "#fff") }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget.style.color = MUTE) }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Track panel ───────────────────────────────────────────────── */}
        <div style={{
          background: CHAR,
          border: `1px solid ${STEEL}`,
          borderTop: "none",
          opacity: fading ? 0 : 1,
          transition: "opacity 160ms",
        }}>
          {/* Panel header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
            style={{ borderBottom: `1px solid ${STEEL}` }}>
            <div className="flex items-center gap-4">
              <div style={{ background: RED, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: "#fff" }}>{track.num}</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>
                  {track.label}
                </div>
                <div style={{ color: MUTE, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", marginTop: 3 }}>
                  TRACK // {track.num} &nbsp;·&nbsp; {track.total > 0 ? `${track.total} LESSONS` : "FILM LIBRARY"}
                </div>
              </div>
            </div>
            <p style={{ color: MUTE, fontSize: 13, maxWidth: 380 }}>{track.tagline}</p>
          </div>

          {/* Lessons */}
          {hasLessons ? (
            <div>
              {track.lessons.map((lesson, i) => {
                const thumb = ytThumb(lesson.videoUrl)
                const locked = i > 0
                return (
                  <div key={lesson.id} className="flex gap-4 p-4"
                    style={{
                      borderBottom: `1px solid ${IRON}`,
                      opacity: locked ? 0.55 : 1,
                    }}>
                    {/* Thumbnail */}
                    <div style={{ position: "relative", width: 148, flexShrink: 0, aspectRatio: "16/9", background: STEEL, overflow: "hidden" }}>
                      {thumb
                        ? <img src={thumb} alt={lesson.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Video size={20} color={MUTE} /></div>
                      }
                      {/* overlay */}
                      {locked ? (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock size={16} color={MUTE} />
                        </div>
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                          className="group">
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Play size={14} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
                          </div>
                        </div>
                      )}
                      {!locked && (
                        <div style={{ position: "absolute", top: 6, left: 6, background: RED, color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", padding: "3px 7px" }}>
                          Free Preview
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ color: MUTE, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                        Lesson {lesson.lessonNumber || i + 1}
                        {lesson.topic ? ` · ${lesson.topic}` : ""}
                      </div>
                      <div style={{
                        fontFamily: "'Anton', sans-serif",
                        fontSize: "clamp(14px, 2.5vw, 18px)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 1.1,
                        marginBottom: 8,
                      }}>
                        {lesson.title}
                      </div>
                      <p style={{ color: MUTE, fontSize: 12, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {lesson.description.slice(0, 180)}...
                      </p>
                      {locked && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                          <Lock size={10} color={MUTE} />
                          <span style={{ color: MUTE, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Academy Access Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* More lessons footer */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ background: STEEL }}>
                <span style={{ color: MUTE, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  + {track.total - 3} more lessons locked
                </span>
                <a
                  href="https://academy-btb.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, color: RED, fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none" }}
                >
                  Get Academy Access <ChevronRight size={12} />
                </a>
              </div>
            </div>
          ) : (
            /* Film Study — coming soon */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, border: `1px solid ${IRON}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Video size={24} color={MUTE} strokeWidth={1.5} />
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTE, marginBottom: 10 }}>
                Film Study
              </div>
              <p style={{ color: MUTE, fontSize: 13, maxWidth: 360, lineHeight: 1.7 }}>
                125 hours of curated college and elite club film — tagged by concept, position, and team. Launching with Academy Access Sept 1, 2026.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, color: IRON, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em" }}>
                <div style={{ width: 32, height: 1, background: IRON }} />
                LAUNCHING SEPT 1, 2026
                <div style={{ width: 32, height: 1, background: IRON }} />
              </div>
            </div>
          )}
        </div>

        {/* ── CTA row ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-12 pt-10"
          style={{ borderTop: `1px solid ${STEEL}` }}>
          <div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1 }}>
              YOU EITHER GET ON THE LIST<br />
              OR GET LEFT BEHIND.
            </div>
            <div style={{ color: MUTE, fontSize: 12, marginTop: 8, letterSpacing: "0.05em" }}>
              Season Pass · $50 BTB Members · $150 Public · Launches Sept 1, 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
            <a
              href="https://academy-btb.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: RED, color: "#fff",
                fontWeight: 900, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                padding: "14px 24px", textDecoration: "none", whiteSpace: "nowrap",
                transition: "all 180ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff", e.currentTarget.style.color = "#000")}
              onMouseLeave={e => (e.currentTarget.style.background = RED, e.currentTarget.style.color = "#fff")}
            >
              Reserve Your Spot ▸
            </a>
            <a
              href="https://academy-btb.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                border: `1px solid ${STEEL}`, color: "#fff",
                fontWeight: 900, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                padding: "14px 24px", textDecoration: "none", background: "transparent", whiteSpace: "nowrap",
                transition: "all 180ms",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = STEEL)}
            >
              Preview the Platform
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
