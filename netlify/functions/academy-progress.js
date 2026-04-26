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

async function findRecord(userId, courseId) {
  let formula = `{userId} = "${userId}"`
  if (courseId) formula = `AND({userId} = "${userId}", {courseId} = "${courseId}")`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`
  const data = await atFetch(url)
  return data.records?.[0] || null
}

async function findAllForUser(userId) {
  const formula = `{userId} = "${userId}"`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}`
  const data = await atFetch(url)
  return data.records || []
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

exports.handler = async (event) => {
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
      const body = JSON.parse(event.body || "{}")
      const { userId, courseId, completedLessons, completedAt, playerName, playerEmail } = body

      if (!userId || !courseId) return err(400, "userId and courseId are required")

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
