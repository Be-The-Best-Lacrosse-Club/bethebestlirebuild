/**
 * academy-progress — GET and POST player academy progress via Airtable.
 *
 * GET  ?userId=xxx&courseId=yyy   → returns progress record for that player+course
 * GET  ?userId=xxx                → returns ALL progress records for that player
 * POST { userId, courseId, completedLessons[], completedAt? }
 *      → upsert (create or update) a progress record
 *
 * Airtable AcademyProgress table fields:
 *   Name (unused, auto), userId (text), courseId (text),
 *   completedLessons (long text / JSON array), completedAt (long text)
 *
 * Note: gender is derived from courseId prefix (boys-* / girls-*) — not stored separately.
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID
const PAT     = process.env.AIRTABLE_PAT
const TABLE   = "AcademyProgress"
const API     = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`

const atHeaders = {
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
}

// ── Airtable helpers ──────────────────────────────────────────────────

async function atFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: atHeaders })
  const text = await res.text()
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${text}`)
  return JSON.parse(text)
}

// Escape double-quotes so user-supplied strings can't break out of the Airtable formula.
function esc(s) { return String(s).replace(/"/g, '\\"') }

async function findRecord(userId, courseId) {
  let formula = `{userId} = "${esc(userId)}"`
  if (courseId) formula = `AND({userId} = "${esc(userId)}", {courseId} = "${esc(courseId)}")`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`
  const data = await atFetch(url)
  return data.records?.[0] || null
}

async function findAllForUser(userId) {
  const formula = `{userId} = "${esc(userId)}"`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}`
  const data = await atFetch(url)
  return data.records || []
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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

const ok  = (body) => ({ statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) })
const err = (s, m) => ({ statusCode: s,   headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: m }) })

// ── Handler ───────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" }

  try {
    // ── GET ───────────────────────────────────────────────────────────
    if (event.httpMethod === "GET") {
      const { userId, courseId } = event.queryStringParameters || {}
      if (!userId) return err(400, "userId is required")

      if (courseId) {
        const record = await findRecord(userId, courseId)
        if (!record) return ok({ found: false, progress: null })
        const f = record.fields
        return ok({
          found: true,
          progress: {
            courseId: f.courseId,
            completedLessons: f.completedLessons ? JSON.parse(f.completedLessons) : [],
            completedAt: f.completedAt || null,
          },
        })
      } else {
        const records = await findAllForUser(userId)
        const progressMap = {}
        for (const r of records) {
          const f = r.fields
          if (!f.courseId) continue
          progressMap[f.courseId] = {
            completedLessons: f.completedLessons ? JSON.parse(f.completedLessons) : [],
            completedAt: f.completedAt || null,
          }
        }
        return ok({ progressMap })
      }
    }

    // ── POST (upsert) ─────────────────────────────────────────────────
    if (event.httpMethod === "POST") {
      // Require a valid Netlify Identity JWT and force userId server-side
      // so callers can only write their OWN progress, not someone else's.
      const verifiedUser = await verifyIdentity(event)
      if (!verifiedUser) return err(401, "Unauthorized — login required to save progress")

      const body = JSON.parse(event.body || "{}")
      const { courseId, completedLessons, completedAt, playerName } = body
      const userId = verifiedUser.id
      const playerEmail = verifiedUser.email

      if (!userId || !courseId) return err(400, "courseId is required")

      const fields = {
        userId,
        courseId,
        completedLessons: JSON.stringify(completedLessons || []),
      }
      if (completedAt) fields.completedAt = completedAt
      // Store player name in the Airtable Name field so coach dashboard can display it
      if (playerName) fields.Name = playerName
      if (playerEmail) fields.playerEmail = playerEmail

      const existing = await findRecord(userId, courseId)
      if (existing) {
        await atFetch(`${API}/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({ fields }),
        })
        return ok({ success: true, action: "updated" })
      } else {
        await atFetch(API, {
          method: "POST",
          body: JSON.stringify({ records: [{ fields }] }),
        })
        return ok({ success: true, action: "created" })
      }
    }

    return err(405, "Method not allowed")
  } catch (e) {
    console.error("academy-progress error:", e)
    return err(500, e.message || "Internal server error")
  }
}
