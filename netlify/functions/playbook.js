/**
 * playbook — save/list/delete Coach's Whiteboard plays in Supabase.
 *
 * All Supabase access happens server-side with the service-role key so no
 * Supabase credentials ever reach the browser (supabase/schema.sql keeps RLS
 * enabled with no anon policies). Callers must present a Netlify Identity JWT
 * with the coach or owner role; coach_id is always taken from the verified
 * identity, never from the request body.
 *
 * GET                            → list this coach's plays (newest first)
 * POST { title, canvas_state }   → save a play
 * DELETE ?id=<uuid>              → delete one of this coach's plays
 *
 * Env (Netlify site settings): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// ── Supabase (PostgREST) helpers ──────────────────────────────────────

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

// Verify the caller's Netlify Identity JWT and return the verified user object, or null.
async function verifyIdentity(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) return null
  const siteUrl = process.env.URL || "https://www.bethebestli.com"
  try {
    const res = await fetch(`${siteUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── Response helpers ──────────────────────────────────────────────────

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const ok  = (body) => ({ statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) })
const err = (s, m) => ({ statusCode: s,   headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: m }) })

// ── Handler ───────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" }
  if (!SUPABASE_URL || !SERVICE_KEY) return err(503, "Cloud playbook is not configured")

  const user = await verifyIdentity(event)
  if (!user) return err(401, "Unauthorized — login required")
  const roles = (user.app_metadata && user.app_metadata.roles) || []
  if (!roles.includes("coach") && !roles.includes("owner")) return err(403, "Coach access required")

  try {
    if (event.httpMethod === "GET") {
      const rows = await sbFetch(
        `playbook?coach_id=eq.${user.id}&select=id,title,canvas_state,created_at&order=created_at.desc`,
      )
      return ok({ plays: rows || [] })
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}")
      const title =
        typeof body.title === "string" && body.title.trim()
          ? body.title.trim().slice(0, 120)
          : "Untitled Play"
      const canvasState = body.canvas_state
      if (!canvasState || !Array.isArray(canvasState.players) || !Array.isArray(canvasState.lines)) {
        return err(400, "canvas_state must include players[] and lines[]")
      }

      // Make sure the coach's users row exists (playbook.coach_id FK)
      await sbFetch("users?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: (user.user_metadata && user.user_metadata.full_name) || null,
          role: roles.includes("owner") ? "owner" : "coach",
        }),
      })

      const rows = await sbFetch("playbook", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ coach_id: user.id, title, canvas_state: canvasState }),
      })
      return ok({ play: rows[0] })
    }

    if (event.httpMethod === "DELETE") {
      const { id } = event.queryStringParameters || {}
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return err(400, "A valid play id is required")
      }
      await sbFetch(`playbook?id=eq.${id}&coach_id=eq.${user.id}`, { method: "DELETE" })
      return ok({ deleted: true })
    }

    return err(405, "Method not allowed")
  } catch (e) {
    console.error("playbook function error:", e)
    return err(502, "Cloud playbook request failed")
  }
}
