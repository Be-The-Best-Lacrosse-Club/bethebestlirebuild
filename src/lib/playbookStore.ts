import { getSupabase } from "@/lib/supabase"
import type { User } from "@/types"

// ─── Canvas state types (persisted as playbook.canvas_state jsonb) ──────────

export type PlayerKind = "attack" | "middie" | "defense" | "goalie"
export type LineTool = "route" | "pass"

export interface PlayerToken {
  id: string
  kind: PlayerKind
  label: string
  x: number
  y: number
}

export interface DrawnLine {
  id: string
  tool: LineTool
  /** Flattened [x1, y1, x2, y2, ...] in field coordinates (800×1000). */
  points: number[]
}

export interface CanvasState {
  players: PlayerToken[]
  lines: DrawnLine[]
}

export interface SavedPlay {
  id: string
  title: string
  canvas_state: CanvasState
  created_at: string
  /** Where this play lives — Supabase (cloud) or this browser's localStorage. */
  source: "cloud" | "local"
}

interface PlaybookRow {
  id: string
  title: string
  canvas_state: CanvasState
  created_at: string
}

// ─── Local fallback (per-user key so demo accounts don't share plays) ───────

const localKey = (userId: string) => `btb-playbook:${userId}`

function readLocal(userId: string): SavedPlay[] {
  try {
    const raw = localStorage.getItem(localKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedPlay[]
    return parsed.map((p) => ({ ...p, source: "local" as const }))
  } catch {
    return []
  }
}

function writeLocal(userId: string, plays: SavedPlay[]) {
  localStorage.setItem(localKey(userId), JSON.stringify(plays))
}

// ─── Supabase helpers ───────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The playbook.coach_id column is a uuid FK onto users(id). Netlify Identity
 * ids are uuids; the localhost dev-bypass user ("dev-owner") is not, so it
 * always saves locally.
 */
function canUseSupabase(user: User): boolean {
  return getSupabase() !== null && UUID_RE.test(user.id)
}

/** Make sure a users row exists for this coach before inserting plays (FK). */
async function ensureCoachRow(user: User): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error("Supabase is not configured")
  const { error } = await supabase.from("users").upsert(
    { id: user.id, email: user.email, full_name: user.name, role: user.role },
    { onConflict: "id" },
  )
  if (error) throw new Error(error.message)
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Save a play. Prefers Supabase; falls back to localStorage when Supabase is
 * unconfigured, the user id isn't a uuid, or the request fails.
 */
export async function savePlay(
  user: User,
  title: string,
  canvasState: CanvasState,
): Promise<SavedPlay> {
  if (canUseSupabase(user)) {
    try {
      await ensureCoachRow(user)
      const supabase = getSupabase()
      if (!supabase) throw new Error("Supabase is not configured")
      const { data, error } = await supabase
        .from("playbook")
        .insert({ coach_id: user.id, title, canvas_state: canvasState })
        .select("id, title, canvas_state, created_at")
        .single<PlaybookRow>()
      if (error || !data) throw new Error(error?.message ?? "Insert returned no row")
      return { ...data, source: "cloud" }
    } catch (err) {
      console.warn("Supabase save failed, falling back to localStorage:", err)
    }
  }

  const play: SavedPlay = {
    id: crypto.randomUUID(),
    title,
    canvas_state: canvasState,
    created_at: new Date().toISOString(),
    source: "local",
  }
  writeLocal(user.id, [play, ...readLocal(user.id)])
  return play
}

/** List this coach's saved plays, newest first (cloud + local merged). */
export async function listPlays(user: User): Promise<SavedPlay[]> {
  const local = readLocal(user.id)
  if (!canUseSupabase(user)) return local

  try {
    const supabase = getSupabase()
    if (!supabase) return local
    const { data, error } = await supabase
      .from("playbook")
      .select("id, title, canvas_state, created_at")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .returns<PlaybookRow[]>()
    if (error) throw new Error(error.message)
    const cloud: SavedPlay[] = (data ?? []).map((row) => ({ ...row, source: "cloud" }))
    return [...cloud, ...local]
  } catch (err) {
    console.warn("Supabase list failed, showing local plays only:", err)
    return local
  }
}

/** Delete a saved play from wherever it lives. */
export async function deletePlay(user: User, play: SavedPlay): Promise<void> {
  if (play.source === "local") {
    writeLocal(
      user.id,
      readLocal(user.id).filter((p) => p.id !== play.id),
    )
    return
  }
  const supabase = getSupabase()
  if (!supabase) throw new Error("Supabase is not configured")
  const { error } = await supabase
    .from("playbook")
    .delete()
    .eq("id", play.id)
    .eq("coach_id", user.id)
  if (error) throw new Error(error.message)
}
