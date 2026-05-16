import { Fragment } from "react"

// ─── TYPES ────────────────────────────────────────────────────────────
// Field coordinate system: 0,0 = top-left of the diagram, 100,100 = bottom-right.
// Renderer handles orientation. Keep coordinates sport-accurate to the view.

export type DiagramView =
  | "men-full"
  | "men-half-offensive"
  | "men-half-defensive"
  | "women-full"
  | "women-half-offensive"
  | "women-half-defensive"

export type PlayerRole =
  | "attack"
  | "midfield"
  | "defense"
  | "lsm"
  | "goalie"
  | "offense"
  | "defender"
  | "ball"
  | "pick"
  | "neutral"

export interface DiagramPlayer {
  id?: string
  x: number // 0–100
  y: number // 0–100
  role: PlayerRole
  label?: string // e.g. "A1", "M", "G"
  ball?: boolean
  highlight?: boolean
}

export interface DiagramArrow {
  from: { x: number; y: number }
  to: { x: number; y: number }
  // "run" = solid curved path (player movement)
  // "pass" = dashed straight (pass)
  // "shot" = thick red (shot)
  // "screen" = short flat T (pick)
  kind?: "run" | "pass" | "shot" | "screen"
  curve?: number // -30..30, how much the path bows (positive = right/down)
  label?: string
}

export interface DiagramZone {
  shape: "rect" | "circle" | "arc"
  x: number
  y: number
  w?: number
  h?: number
  r?: number
  startAngle?: number
  endAngle?: number
  color?: string
  label?: string
}

export interface DiagramLabel {
  x: number
  y: number
  text: string
  size?: "xs" | "sm" | "md"
}

export interface FieldDiagramSpec {
  title: string
  caption?: string
  view: DiagramView
  players?: DiagramPlayer[]
  arrows?: DiagramArrow[]
  zones?: DiagramZone[]
  labels?: DiagramLabel[]
  legend?: Array<{ label: string; color: string; shape?: "circle" | "square" | "arrow" }>
}

// ─── COLORS ────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<
  PlayerRole,
  { fill: string; stroke: string; text: string }
> = {
  attack: { fill: "#D22630", stroke: "#7A1015", text: "#FFFFFF" },
  offense: { fill: "#D22630", stroke: "#7A1015", text: "#FFFFFF" },
  midfield: { fill: "#EAB308", stroke: "#7A5A04", text: "#0A0A0A" },
  defense: { fill: "#2563EB", stroke: "#0F2D78", text: "#FFFFFF" },
  defender: { fill: "#2563EB", stroke: "#0F2D78", text: "#FFFFFF" },
  lsm: { fill: "#1D4ED8", stroke: "#0F2D78", text: "#FFFFFF" },
  goalie: { fill: "#10B981", stroke: "#064E3B", text: "#FFFFFF" },
  pick: { fill: "#A855F7", stroke: "#4C1D95", text: "#FFFFFF" },
  ball: { fill: "#FFFFFF", stroke: "#0A0A0A", text: "#0A0A0A" },
  neutral: { fill: "#9CA3AF", stroke: "#374151", text: "#FFFFFF" },
}

const ARROW_STYLES: Record<
  NonNullable<DiagramArrow["kind"]>,
  { stroke: string; width: number; dash?: string }
> = {
  run: { stroke: "#FACC15", width: 2.2 },
  pass: { stroke: "#FFFFFF", width: 1.8, dash: "3 2" },
  shot: { stroke: "#D22630", width: 3.2 },
  screen: { stroke: "#A855F7", width: 2.2 },
}

// ─── FIELD BACKGROUNDS ─────────────────────────────────────────────────
// viewBox is always 0 0 100 100 — content scales to fill.
// The actual field outline differs per view.

function MenFullField() {
  // Men's field: 110 yds × 60 yds, restraining lines, midline, boxes, crease
  return (
    <g>
      {/* Turf */}
      <rect x={0} y={0} width={100} height={100} fill="#0F5132" />
      {/* Sideline grid for depth perception */}
      {[25, 50, 75].map((y) => (
        <line key={y} x1={0} y1={y} x2={100} y2={y} stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={0.3} />
      ))}
      {/* Outline */}
      <rect x={2} y={2} width={96} height={96} fill="none" stroke="#FFFFFF" strokeWidth={0.6} />
      {/* Midfield line */}
      <line x1={2} y1={50} x2={98} y2={50} stroke="#FFFFFF" strokeWidth={0.5} />
      {/* Center X face-off */}
      <circle cx={50} cy={50} r={1.8} fill="none" stroke="#FFFFFF" strokeWidth={0.4} />
      <line x1={48} y1={50} x2={52} y2={50} stroke="#FFFFFF" strokeWidth={0.6} />
      {/* Restraining lines */}
      <line x1={2} y1={30} x2={98} y2={30} stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.8 0.8" />
      <line x1={2} y1={70} x2={98} y2={70} stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.8 0.8" />
      {/* Goal lines */}
      <line x1={2} y1={18} x2={98} y2={18} stroke="#FFFFFF" strokeWidth={0.4} />
      <line x1={2} y1={82} x2={98} y2={82} stroke="#FFFFFF" strokeWidth={0.4} />
      {/* Creases */}
      <circle cx={50} cy={18} r={4.5} fill="none" stroke="#FFFFFF" strokeWidth={0.4} />
      <circle cx={50} cy={82} r={4.5} fill="none" stroke="#FFFFFF" strokeWidth={0.4} />
      {/* Goals */}
      <rect x={48.5} y={17.5} width={3} height={1} fill="#FFFFFF" />
      <rect x={48.5} y={81.5} width={3} height={1} fill="#FFFFFF" />
    </g>
  )
}

function MenHalfField({ offensive = true }: { offensive?: boolean }) {
  // Half-field view, goal at the bottom. offensive = true means we're attacking.
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} fill="#0F5132" />
      <rect x={2} y={2} width={96} height={96} fill="none" stroke="#FFFFFF" strokeWidth={0.6} />
      {/* Restraining line across top (midfield line in a half view) */}
      <line x1={2} y1={8} x2={98} y2={8} stroke="#FFFFFF" strokeWidth={0.5} />
      <text x={50} y={6} textAnchor="middle" fill="#FFFFFF" fillOpacity={0.5} fontSize={2.8} fontWeight={700}>
        {offensive ? "MIDFIELD" : "MIDFIELD"}
      </text>
      {/* Goal line */}
      <line x1={2} y1={80} x2={98} y2={80} stroke="#FFFFFF" strokeWidth={0.4} />
      {/* Crease */}
      <circle cx={50} cy={80} r={6} fill="none" stroke="#FFFFFF" strokeWidth={0.5} />
      {/* Goal */}
      <rect x={47.5} y={79} width={5} height={1.5} fill="#FFFFFF" />
      {/* X (behind goal) */}
      <text x={50} y={93} textAnchor="middle" fill="#FFFFFF" fillOpacity={0.5} fontSize={3} fontWeight={700}>
        X
      </text>
      {/* GLE label */}
      <text x={8} y={83} fill="#FFFFFF" fillOpacity={0.45} fontSize={2.5} fontWeight={700}>GLE</text>
      {offensive && (
        <>
          {/* Rough arc zones */}
          <path d="M 25 55 Q 50 40 75 55" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={0.4} fill="none" strokeDasharray="1 1" />
        </>
      )}
    </g>
  )
}

function WomenFullField() {
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} fill="#0F5132" />
      <rect x={2} y={2} width={96} height={96} fill="none" stroke="#FFFFFF" strokeWidth={0.6} />
      <line x1={2} y1={50} x2={98} y2={50} stroke="#FFFFFF" strokeWidth={0.5} />
      {/* Draw circle at center */}
      <circle cx={50} cy={50} r={4} fill="none" stroke="#FFFFFF" strokeWidth={0.5} />
      <circle cx={50} cy={50} r={0.5} fill="#FFFFFF" />
      {/* Restraining lines */}
      <line x1={2} y1={25} x2={98} y2={25} stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.8 0.8" />
      <line x1={2} y1={75} x2={98} y2={75} stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.8 0.8" />
      {/* Goal lines */}
      <line x1={2} y1={15} x2={98} y2={15} stroke="#FFFFFF" strokeWidth={0.4} />
      <line x1={2} y1={85} x2={98} y2={85} stroke="#FFFFFF" strokeWidth={0.4} />
      {/* 12m fan + 8m arc (approximated) — bottom end */}
      <path d="M 38 85 A 14 14 0 0 0 62 85" fill="none" stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.6 0.6" />
      <path d="M 42 85 A 8 8 0 0 0 58 85" fill="none" stroke="#FFFFFF" strokeWidth={0.45} />
      {/* top end */}
      <path d="M 38 15 A 14 14 0 0 1 62 15" fill="none" stroke="#FFFFFF" strokeWidth={0.4} strokeDasharray="0.6 0.6" />
      <path d="M 42 15 A 8 8 0 0 1 58 15" fill="none" stroke="#FFFFFF" strokeWidth={0.45} />
      {/* Creases */}
      <circle cx={50} cy={85} r={3} fill="none" stroke="#FFFFFF" strokeWidth={0.4} />
      <circle cx={50} cy={15} r={3} fill="none" stroke="#FFFFFF" strokeWidth={0.4} />
      {/* Goals */}
      <rect x={48.5} y={84.5} width={3} height={1} fill="#FFFFFF" />
      <rect x={48.5} y={14.5} width={3} height={1} fill="#FFFFFF" />
    </g>
  )
}

function WomenHalfField({ offensive = true }: { offensive?: boolean }) {
  return (
    <g>
      <rect x={0} y={0} width={100} height={100} fill="#0F5132" />
      <rect x={2} y={2} width={96} height={96} fill="none" stroke="#FFFFFF" strokeWidth={0.6} />
      <line x1={2} y1={8} x2={98} y2={8} stroke="#FFFFFF" strokeWidth={0.5} />
      <text x={50} y={6} textAnchor="middle" fill="#FFFFFF" fillOpacity={0.5} fontSize={2.8} fontWeight={700}>
        RESTRAINING LINE
      </text>
      {/* Goal line */}
      <line x1={2} y1={82} x2={98} y2={82} stroke="#FFFFFF" strokeWidth={0.4} />
      {/* 12m fan */}
      <path d="M 28 82 A 22 22 0 0 0 72 82" fill="none" stroke="#FFFFFF" strokeWidth={0.5} strokeDasharray="0.8 0.8" />
      <text x={76} y={64} fill="#FFFFFF" fillOpacity={0.55} fontSize={2.4} fontWeight={700}>12M</text>
      {/* 8m arc */}
      <path d="M 35 82 A 15 15 0 0 0 65 82" fill="none" stroke="#FFFFFF" strokeWidth={0.7} />
      <text x={68} y={70} fill="#FFFFFF" fillOpacity={0.7} fontSize={2.4} fontWeight={700}>8M</text>
      {/* Hash marks on 8m */}
      {[
        { x: 42, y: 69 },
        { x: 50, y: 67 },
        { x: 58, y: 69 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={0.6} fill="#FFFFFF" />
      ))}
      {/* Crease */}
      <circle cx={50} cy={82} r={3.5} fill="none" stroke="#FFFFFF" strokeWidth={0.5} />
      <rect x={48} y={81} width={4} height={1.2} fill="#FFFFFF" />
      {offensive && (
        <text x={8} y={85} fill="#FFFFFF" fillOpacity={0.45} fontSize={2.5} fontWeight={700}>GLE</text>
      )}
    </g>
  )
}

// ─── ARROW HELPERS ─────────────────────────────────────────────────────

function buildArrowPath(a: DiagramArrow): string {
  const curve = a.curve ?? 0
  if (!curve) {
    return `M ${a.from.x} ${a.from.y} L ${a.to.x} ${a.to.y}`
  }
  const mx = (a.from.x + a.to.x) / 2
  const my = (a.from.y + a.to.y) / 2
  // Perpendicular offset
  const dx = a.to.x - a.from.x
  const dy = a.to.y - a.from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len
  const py = dx / len
  const cx = mx + px * curve
  const cy = my + py * curve
  return `M ${a.from.x} ${a.from.y} Q ${cx} ${cy} ${a.to.x} ${a.to.y}`
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────

export function FieldDiagram({ spec }: { spec: FieldDiagramSpec }) {
  const isFull = spec.view.endsWith("full")
  const aspect = isFull ? "aspect-[1/1.6]" : "aspect-[1/1]"

  return (
    <figure className="my-8">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-[2px] text-[#D22630]">
          {spec.title}
        </h3>
      </div>
      <div
        className={`relative w-full max-w-lg mx-auto ${aspect} rounded-xl overflow-hidden border border-white/10 bg-[#0A1F12] shadow-2xl`}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={spec.title}
        >
          <defs>
            <marker id="arrow-run" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#FACC15" />
            </marker>
            <marker id="arrow-pass" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFFFF" />
            </marker>
            <marker id="arrow-shot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#D22630" />
            </marker>
            <marker id="arrow-screen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 10 2 L 10 8 L 0 8 z" fill="#A855F7" />
            </marker>
          </defs>

          {/* Field background */}
          {spec.view === "men-full" && <MenFullField />}
          {spec.view === "men-half-offensive" && <MenHalfField offensive />}
          {spec.view === "men-half-defensive" && <MenHalfField offensive={false} />}
          {spec.view === "women-full" && <WomenFullField />}
          {spec.view === "women-half-offensive" && <WomenHalfField offensive />}
          {spec.view === "women-half-defensive" && <WomenHalfField offensive={false} />}

          {/* Zones */}
          {spec.zones?.map((z, i) => {
            const fill = z.color ?? "#FACC15"
            if (z.shape === "rect") {
              return (
                <g key={`zone-${i}`}>
                  <rect
                    x={z.x}
                    y={z.y}
                    width={z.w ?? 10}
                    height={z.h ?? 10}
                    fill={fill}
                    fillOpacity={0.18}
                    stroke={fill}
                    strokeOpacity={0.55}
                    strokeWidth={0.4}
                    strokeDasharray="1 1"
                  />
                  {z.label && (
                    <text
                      x={z.x + (z.w ?? 10) / 2}
                      y={z.y + (z.h ?? 10) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fillOpacity={0.85}
                      fontSize={2.6}
                      fontWeight={700}
                    >
                      {z.label}
                    </text>
                  )}
                </g>
              )
            }
            if (z.shape === "circle") {
              return (
                <g key={`zone-${i}`}>
                  <circle
                    cx={z.x}
                    cy={z.y}
                    r={z.r ?? 6}
                    fill={fill}
                    fillOpacity={0.18}
                    stroke={fill}
                    strokeOpacity={0.6}
                    strokeWidth={0.4}
                  />
                  {z.label && (
                    <text
                      x={z.x}
                      y={z.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fillOpacity={0.85}
                      fontSize={2.6}
                      fontWeight={700}
                    >
                      {z.label}
                    </text>
                  )}
                </g>
              )
            }
            return null
          })}

          {/* Arrows */}
          {spec.arrows?.map((a, i) => {
            const kind = a.kind ?? "run"
            const style = ARROW_STYLES[kind]
            const marker = `url(#arrow-${kind})`
            return (
              <Fragment key={`arrow-${i}`}>
                <path
                  d={buildArrowPath(a)}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash}
                  strokeLinecap="round"
                  markerEnd={marker}
                />
                {a.label && (
                  <text
                    x={(a.from.x + a.to.x) / 2}
                    y={(a.from.y + a.to.y) / 2 - 1.5}
                    textAnchor="middle"
                    fill={style.stroke}
                    fontSize={2.2}
                    fontWeight={700}
                  >
                    {a.label}
                  </text>
                )}
              </Fragment>
            )
          })}

          {/* Players */}
          {spec.players?.map((p, i) => {
            const st = ROLE_STYLES[p.role]
            const isOffense = ["attack", "midfield", "offense"].includes(p.role)
            const r = p.highlight ? 3.6 : 3
            return (
              <g key={`player-${p.id ?? i}`}>
                {p.highlight && (
                  <circle cx={p.x} cy={p.y} r={r + 1.2} fill="none" stroke="#FACC15" strokeWidth={0.6} strokeDasharray="0.8 0.6" />
                )}
                {isOffense ? (
                  <circle cx={p.x} cy={p.y} r={r} fill={st.fill} stroke={st.stroke} strokeWidth={0.5} />
                ) : (
                  <rect
                    x={p.x - r}
                    y={p.y - r}
                    width={r * 2}
                    height={r * 2}
                    fill={st.fill}
                    stroke={st.stroke}
                    strokeWidth={0.5}
                  />
                )}
                {p.label && (
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={st.text}
                    fontSize={2.6}
                    fontWeight={800}
                  >
                    {p.label}
                  </text>
                )}
                {p.ball && (
                  <circle cx={p.x + r - 0.4} cy={p.y - r + 0.4} r={1.1} fill="#FFFFFF" stroke="#0A0A0A" strokeWidth={0.3} />
                )}
              </g>
            )
          })}

          {/* Labels */}
          {spec.labels?.map((l, i) => {
            const size = l.size === "xs" ? 2.2 : l.size === "sm" ? 2.6 : 3
            return (
              <text
                key={`label-${i}`}
                x={l.x}
                y={l.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fillOpacity={0.85}
                fontSize={size}
                fontWeight={700}
              >
                {l.text}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend + caption */}
      <div className="max-w-lg mx-auto mt-3 space-y-2">
        {spec.legend && spec.legend.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/60">
            {spec.legend.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-3 h-3 ${
                    item.shape === "square" ? "rounded-sm" : "rounded-full"
                  }`}
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        )}
        {spec.caption && (
          <figcaption className="text-white/55 text-sm leading-relaxed">
            {spec.caption}
          </figcaption>
        )}
      </div>
    </figure>
  )
}
