import { useCallback, useEffect, useRef, useState } from "react"
import { Stage, Layer, Image as KonvaImage, Rect, Arrow, Circle, Group, Text } from "react-konva"
import type Konva from "konva"
import { toast } from "sonner"
import {
  MousePointer2,
  ArrowUpRight,
  Spline,
  Eraser,
  Undo2,
  Trash2,
  Save,
  Download,
  FolderOpen,
  Loader2,
  CloudUpload,
  HardDrive,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { isSupabaseConfigured } from "@/lib/supabase"
import {
  savePlay,
  listPlays,
  deletePlay,
  type CanvasState,
  type DrawnLine,
  type LineTool,
  type PlayerKind,
  type PlayerToken,
  type SavedPlay,
} from "@/lib/playbookStore"

// ─── Field / canvas constants ───────────────────────────────────────────────
// All positions are stored in "field coordinates" (800×1000, matching
// /whiteboard-field.svg) and the Stage is scaled to fit its container, so
// saved plays render identically on any screen size.

const FIELD_W = 800
const FIELD_H = 1000
const TOKEN_R = 26
const LINE_COLOR = "#1D3557"
const ERASE_RADIUS = 24
const MAX_HISTORY = 50

type Tool = "select" | LineTool | "erase"

const TOKEN_STYLE: Record<PlayerKind, { fill: string; label: string; button: string }> = {
  attack: { fill: "#1D4ED8", label: "A", button: "Add Attack (A)" },
  middie: { fill: "#3B82F6", label: "M", button: "Add Middie (M)" },
  defense: { fill: "#D22630", label: "D", button: "Add Defense (D)" },
  goalie: { fill: "#991B24", label: "G", button: "Add Goalie (G)" },
}

const PLAYER_KINDS: PlayerKind[] = ["attack", "middie", "defense", "goalie"]

const SPAWN_X = [400, 260, 540, 170, 630, 330, 470]
const SPAWN_Y: Record<PlayerKind, number> = {
  attack: 640,
  middie: 410,
  defense: 730,
  goalie: 830,
}

// ─── Small helpers ──────────────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/** Squared distance from point p to segment ab — used for eraser hit-testing. */
function distToSegmentSq(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const abx = bx - ax
  const aby = by - ay
  const lenSq = abx * abx + aby * aby
  const t = lenSq === 0 ? 0 : clamp(((px - ax) * abx + (py - ay) * aby) / lenSq, 0, 1)
  const cx = ax + t * abx
  const cy = ay + t * aby
  return (px - cx) * (px - cx) + (py - cy) * (py - cy)
}

function lineHit(line: DrawnLine, x: number, y: number): boolean {
  const pts = line.points
  if (pts.length < 4) {
    return pts.length >= 2 && (pts[0] - x) ** 2 + (pts[1] - y) ** 2 <= ERASE_RADIUS ** 2
  }
  for (let i = 0; i + 3 < pts.length; i += 2) {
    if (distToSegmentSq(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3]) <= ERASE_RADIUS ** 2) {
      return true
    }
  }
  return false
}

function useFieldImage(): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new window.Image()
    img.src = "/whiteboard-field.svg"
    img.onload = () => setImage(img)
  }, [])
  return image
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Whiteboard() {
  const { user } = useAuth()
  const fieldImage = useFieldImage()
  const stageRef = useRef<Konva.Stage>(null)

  // Canvas state
  const [players, setPlayers] = useState<PlayerToken[]>([])
  const [lines, setLines] = useState<DrawnLine[]>([])
  const [draftLine, setDraftLine] = useState<DrawnLine | null>(null)
  const [tool, setTool] = useState<Tool>("select")

  // Undo history (snapshots pushed before each mutation)
  const historyRef = useRef<CanvasState[]>([])
  const [canUndo, setCanUndo] = useState(false)

  // Pointer-gesture flags
  const drawingRef = useRef(false)
  const erasingRef = useRef(false)
  const eraseTouchedRef = useRef(false)

  // Save / load dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [plays, setPlays] = useState<SavedPlay[]>([])
  const [loadingPlays, setLoadingPlays] = useState(false)

  // Responsive stage scale
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageWidth, setStageWidth] = useState(520)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setStageWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const scale = stageWidth / FIELD_W

  // ── History ───────────────────────────────────────────────────────────────

  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), { players, lines }]
    setCanUndo(true)
  }, [players, lines])

  const undo = () => {
    const prev = historyRef.current.pop()
    if (!prev) return
    setPlayers(prev.players)
    setLines(prev.lines)
    setCanUndo(historyRef.current.length > 0)
  }

  // ── Players ───────────────────────────────────────────────────────────────

  const addPlayer = (kind: PlayerKind) => {
    pushHistory()
    const count = players.filter((p) => p.kind === kind).length
    const x = SPAWN_X[count % SPAWN_X.length]
    const y = clamp(
      SPAWN_Y[kind] + Math.floor(count / SPAWN_X.length) * 70,
      TOKEN_R,
      FIELD_H - TOKEN_R,
    )
    setPlayers([
      ...players,
      { id: crypto.randomUUID(), kind, label: TOKEN_STYLE[kind].label, x, y },
    ])
  }

  const movePlayer = (id: string, x: number, y: number) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, x, y } : p)))
  }

  // ── Eraser ────────────────────────────────────────────────────────────────

  const eraseAt = (x: number, y: number) => {
    const hitLineIds = new Set(lines.filter((l) => lineHit(l, x, y)).map((l) => l.id))
    const hitPlayerIds = new Set(
      players
        .filter((p) => (p.x - x) ** 2 + (p.y - y) ** 2 <= (TOKEN_R + 6) ** 2)
        .map((p) => p.id),
    )
    if (hitLineIds.size === 0 && hitPlayerIds.size === 0) return
    if (!eraseTouchedRef.current) {
      pushHistory()
      eraseTouchedRef.current = true
    }
    if (hitLineIds.size > 0) setLines(lines.filter((l) => !hitLineIds.has(l.id)))
    if (hitPlayerIds.size > 0) setPlayers(players.filter((p) => !hitPlayerIds.has(p.id)))
  }

  // ── Stage pointer handlers (drawing + erasing) ────────────────────────────

  const getFieldPos = (): { x: number; y: number } | null => {
    const stage = stageRef.current
    if (!stage) return null
    const pos = stage.getRelativePointerPosition()
    if (!pos) return null
    return { x: clamp(pos.x, 0, FIELD_W), y: clamp(pos.y, 0, FIELD_H) }
  }

  const handlePointerDown = () => {
    const pos = getFieldPos()
    if (!pos) return
    if (tool === "route" || tool === "pass") {
      drawingRef.current = true
      setDraftLine({ id: crypto.randomUUID(), tool, points: [pos.x, pos.y] })
    } else if (tool === "erase") {
      erasingRef.current = true
      eraseTouchedRef.current = false
      eraseAt(pos.x, pos.y)
    }
  }

  const handlePointerMove = () => {
    if (!drawingRef.current && !erasingRef.current) return
    const pos = getFieldPos()
    if (!pos) return
    if (erasingRef.current) {
      eraseAt(pos.x, pos.y)
      return
    }
    setDraftLine((prev) => {
      if (!prev) return prev
      const pts = prev.points
      const lastX = pts[pts.length - 2]
      const lastY = pts[pts.length - 1]
      // Thin out points so freehand strokes stay light
      if ((pos.x - lastX) ** 2 + (pos.y - lastY) ** 2 < 16) return prev
      return { ...prev, points: [...pts, pos.x, pos.y] }
    })
  }

  const handlePointerUp = () => {
    erasingRef.current = false
    if (!drawingRef.current) return
    drawingRef.current = false
    if (draftLine && draftLine.points.length >= 4) {
      pushHistory()
      setLines([...lines, draftLine])
    }
    setDraftLine(null)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const boardIsEmpty = players.length === 0 && lines.length === 0

  const clearBoard = () => {
    if (boardIsEmpty) return
    pushHistory()
    setPlayers([])
    setLines([])
    setDraftLine(null)
    toast("Board cleared", { description: "Hit Undo to bring the play back." })
  }

  const refreshPlays = useCallback(async () => {
    if (!user) return
    setLoadingPlays(true)
    try {
      setPlays(await listPlays(user))
    } finally {
      setLoadingPlays(false)
    }
  }, [user])

  const openDialog = () => {
    setDialogOpen(true)
    void refreshPlays()
  }

  const handleSave = async () => {
    if (!user) return
    if (boardIsEmpty) {
      toast.error("Nothing to save yet — add players or draw a route first.")
      return
    }
    setSaving(true)
    try {
      const state: CanvasState = { players, lines }
      const play = await savePlay(user, title.trim() || "Untitled Play", state)
      toast.success(`"${play.title}" saved`, {
        description:
          play.source === "cloud" ? "Saved to your cloud playbook." : "Saved on this device.",
      })
      setTitle("")
      void refreshPlays()
    } catch (err) {
      toast.error("Could not save the play", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = (play: SavedPlay) => {
    pushHistory()
    setPlayers(play.canvas_state.players ?? [])
    setLines(play.canvas_state.lines ?? [])
    setDraftLine(null)
    setDialogOpen(false)
    toast(`Loaded "${play.title}"`)
  }

  const handleDelete = async (play: SavedPlay) => {
    if (!user) return
    try {
      await deletePlay(user, play)
      setPlays((prev) => prev.filter((p) => !(p.id === play.id && p.source === play.source)))
      toast(`Deleted "${play.title}"`)
    } catch (err) {
      toast.error("Could not delete the play", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const exportImage = () => {
    const stage = stageRef.current
    if (!stage) return
    // pixelRatio 2/scale → always exports at 1600×2000 regardless of screen size
    const uri = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 / scale })
    const link = document.createElement("a")
    link.download = `btb-play-${(title.trim() || "untitled").toLowerCase().replace(/\s+/g, "-")}.png`
    link.href = uri
    link.click()
    toast("Play exported as an image")
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderLine = (line: DrawnLine, isDraft: boolean) =>
    line.points.length >= 4 ? (
      <Arrow
        key={line.id}
        points={line.points}
        stroke={LINE_COLOR}
        fill={LINE_COLOR}
        strokeWidth={5}
        lineCap="round"
        lineJoin="round"
        tension={0.3}
        pointerLength={18}
        pointerWidth={16}
        dash={line.tool === "pass" ? [14, 12] : undefined}
        opacity={isDraft ? 0.6 : 1}
        listening={false}
      />
    ) : null

  const cursorClass =
    tool === "route" || tool === "pass"
      ? "cursor-crosshair"
      : tool === "erase"
        ? "cursor-cell"
        : ""

  const sectionLabel = "text-[0.95rem] font-bold uppercase tracking-[3px] text-white/45"

  const toolButton = (active: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-[1.02rem] font-bold uppercase tracking-[1.5px] transition-all ${
      active
        ? "bg-[#D22630] border-[#D22630] text-white"
        : "bg-white/[0.04] border-white/[0.1] text-white/80 hover:border-white/30 hover:bg-white/[0.08]"
    }`

  const cloudReady = isSupabaseConfigured()

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <aside className="lg:w-72 shrink-0 space-y-8">
        <div>
          <div className={`${sectionLabel} mb-3`}>Add Players</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {PLAYER_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => addPlayer(kind)}
                className={toolButton(false)}
              >
                <span
                  className="w-5 h-5 rounded-full border-2 border-white/80 shrink-0"
                  style={{ backgroundColor: TOKEN_STYLE[kind].fill }}
                  aria-hidden
                />
                {TOKEN_STYLE[kind].button}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={`${sectionLabel} mb-3`}>Drawing Tools</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2" role="group" aria-label="Drawing tools">
            <button
              type="button"
              onClick={() => setTool("select")}
              className={toolButton(tool === "select")}
              aria-pressed={tool === "select"}
            >
              <MousePointer2 size={16} className="shrink-0" /> Move Players
            </button>
            <button
              type="button"
              onClick={() => setTool("route")}
              className={toolButton(tool === "route")}
              aria-pressed={tool === "route"}
            >
              <ArrowUpRight size={16} className="shrink-0" /> Draw Route
            </button>
            <button
              type="button"
              onClick={() => setTool("pass")}
              className={toolButton(tool === "pass")}
              aria-pressed={tool === "pass"}
            >
              <Spline size={16} className="shrink-0" /> Draw Pass
            </button>
            <button
              type="button"
              onClick={() => setTool("erase")}
              className={toolButton(tool === "erase")}
              aria-pressed={tool === "erase"}
            >
              <Eraser size={16} className="shrink-0" /> Eraser
            </button>
          </div>
        </div>

        <div>
          <div className={`${sectionLabel} mb-3`}>Actions</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className={`${toolButton(false)} disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-white/[0.1] disabled:hover:bg-white/[0.04]`}
            >
              <Undo2 size={16} className="shrink-0" /> Undo
            </button>
            <button type="button" onClick={clearBoard} className={toolButton(false)}>
              <Trash2 size={16} className="shrink-0" /> Clear Board
            </button>
            <button type="button" onClick={openDialog} className={toolButton(false)}>
              <Save size={16} className="shrink-0" /> Save Play
            </button>
            <button type="button" onClick={exportImage} className={toolButton(false)}>
              <Download size={16} className="shrink-0" /> Export as Image
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[0.92rem] text-white/40">
            {cloudReady ? (
              <>
                <CloudUpload size={14} className="shrink-0 text-[#2A9D8F]" />
                Plays save to your cloud playbook
              </>
            ) : (
              <>
                <HardDrive size={14} className="shrink-0" />
                Plays save on this device
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div
          ref={containerRef}
          className={`mx-auto w-full max-w-[560px] rounded-xl overflow-hidden border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${cursorClass}`}
          style={{ touchAction: "none" }}
        >
          <Stage
            ref={stageRef}
            width={FIELD_W * scale}
            height={FIELD_H * scale}
            scaleX={scale}
            scaleY={scale}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            {/* Layer 1 — half-field diagram (lowest) */}
            <Layer listening={false}>
              {fieldImage ? (
                <KonvaImage image={fieldImage} x={0} y={0} width={FIELD_W} height={FIELD_H} />
              ) : (
                <Rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="#f0f5e6" />
              )}
            </Layer>

            {/* Layer 2 — routes and passes (below the tokens) */}
            <Layer listening={false}>
              {lines.map((line) => renderLine(line, false))}
              {draftLine && renderLine(draftLine, true)}
            </Layer>

            {/* Layer 3 — draggable player tokens (top) */}
            <Layer>
              {players.map((p) => (
                <Group
                  key={p.id}
                  x={p.x}
                  y={p.y}
                  draggable={tool === "select"}
                  onDragStart={pushHistory}
                  onDragEnd={(e) => movePlayer(p.id, e.target.x(), e.target.y())}
                  dragBoundFunc={(pos) => ({
                    x: clamp(pos.x, TOKEN_R * scale, (FIELD_W - TOKEN_R) * scale),
                    y: clamp(pos.y, TOKEN_R * scale, (FIELD_H - TOKEN_R) * scale),
                  })}
                >
                  <Circle
                    radius={TOKEN_R}
                    fill={TOKEN_STYLE[p.kind].fill}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    shadowColor="#000000"
                    shadowBlur={8}
                    shadowOpacity={0.35}
                    shadowOffsetY={3}
                  />
                  <Text
                    text={p.label}
                    fontSize={26}
                    fontStyle="bold"
                    fontFamily="Montserrat, Arial, sans-serif"
                    fill="#FFFFFF"
                    width={TOKEN_R * 2}
                    height={TOKEN_R * 2}
                    offsetX={TOKEN_R}
                    offsetY={TOKEN_R - 1}
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                  />
                </Group>
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.95rem] text-white/45">
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#1D4ED8]" /> Attack / Middie
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D22630]" /> Defense / Goalie
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-[#94A3B8]" /> Route
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-8 border-t-2 border-dashed border-[#94A3B8]" /> Pass
          </span>
        </div>
      </div>

      {/* ── Save / load dialog ──────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide text-[1.4rem]">
              Save <span className="text-[#D22630]">Play</span>
            </DialogTitle>
            <DialogDescription className="text-white/45">
              {cloudReady
                ? "Plays are saved to your BTB cloud playbook and available on any device."
                : "Cloud sync isn't configured — plays are saved in this browser."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave()
              }}
              placeholder="Play name — e.g. 2-3-1 Backside Fade"
              aria-label="Play name"
              className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2 bg-[#D22630] text-white text-[0.95rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[#B01F28] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>

          <div className="mt-2">
            <div className={`${sectionLabel} mb-3 flex items-center gap-2`}>
              <FolderOpen size={13} /> Saved Plays
            </div>
            {loadingPlays ? (
              <div className="flex items-center gap-2 text-white/40 text-[0.95rem] py-3">
                <Loader2 size={14} className="animate-spin" /> Loading your playbook…
              </div>
            ) : plays.length === 0 ? (
              <p className="text-white/35 text-[0.95rem] py-2">
                No saved plays yet. Build a play and save it to start your playbook.
              </p>
            ) : (
              <ul className="space-y-2">
                {plays.map((play) => (
                  <li
                    key={`${play.source}-${play.id}`}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-[1.0rem]">{play.title}</div>
                      <div className="text-[0.85rem] text-white/35">
                        {new Date(play.created_at).toLocaleDateString()} ·{" "}
                        {play.source === "cloud" ? "Cloud" : "This device"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoad(play)}
                      className="shrink-0 px-3 py-1.5 rounded border border-white/15 text-[0.85rem] font-bold uppercase tracking-[1px] text-white/80 hover:border-[#D22630] hover:text-[#D22630] transition-all"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(play)}
                      aria-label={`Delete ${play.title}`}
                      className="shrink-0 p-1.5 rounded text-white/40 hover:text-[#D22630] transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
