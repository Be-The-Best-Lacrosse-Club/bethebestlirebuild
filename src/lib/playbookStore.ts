import { getAuthToken } from "@/lib/auth"
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
  /** Where this play lives — the Supabase cloud playbook or this browser. */
  source: "cloud" | "local"
}

export interface PlaybookList {
  plays: SavedPlay[]
  /** True when the cloud playbook answered — drives the sync badge. */
  cloud: boolean
}

interface PlaybookRow {
  id: string
  title: string
  canvas_state: CanvasState
  created_at: string
}

// ─── Cloud API ──────────────────────────────────────────────────────────────
// All Supabase access goes through the playbook Netlify Function, which
// verifies the caller's Netlify Identity JWT and holds the service-role key
// server-side (see netlify/functions/playbook.js and supabase/schema.sql).

const API_URL = "/.netlify/functions/playbook"

/**
 * Call the playbook function. Returns null when the cloud playbook isn't
 * reachable for this user (not signed in via Netlify Identity, function not
 * configured, coach role missing, or a network/server failure) so callers
 * fall back to localStorage.
 */
async function cloudRequest<T>(init: RequestInit, query = ""): Promise<T | null> {
  try {
    const token = await getAuthToken()
    if (!token) return null
    const res = await fetch(`${API_URL}${query}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    })
    if (!res.ok) {
      console.warn(`Cloud playbook unavailable (${res.status})`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn("Cloud playbook request failed:", err)
    return null
  }
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

// ─── Public API ─────────────────────────────────────────────────────────────

/** Save a play to the cloud playbook, falling back to this browser. */
export async function savePlay(
  user: User,
  title: string,
  canvasState: CanvasState,
): Promise<SavedPlay> {
  const result = await cloudRequest<{ play: PlaybookRow }>({
    method: "POST",
    body: JSON.stringify({ title, canvas_state: canvasState }),
  })
  if (result?.play) return { ...result.play, source: "cloud" }

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

/** List this coach's saved plays, cloud + local merged newest-first. */
export async function listPlays(user: User): Promise<PlaybookList> {
  const local = readLocal(user.id)
  const result = await cloudRequest<{ plays: PlaybookRow[] }>({ method: "GET" })
  const cloud: SavedPlay[] = (result?.plays ?? []).map((row) => ({ ...row, source: "cloud" }))
  const plays = [...cloud, ...local].sort((a, b) => b.created_at.localeCompare(a.created_at))
  return { plays, cloud: result !== null }
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
  const result = await cloudRequest<{ deleted: boolean }>(
    { method: "DELETE" },
    `?id=${encodeURIComponent(play.id)}`,
  )
  if (!result?.deleted) throw new Error("The cloud playbook could not delete this play")
}
