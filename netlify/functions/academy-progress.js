/**
 * academy-progress — GET and PATCH player academy progress via Airtable.
 *
 * GET  ?userId=xxx&courseId=yyy   → returns progress record for that player+course
 * GET  ?userId=xxx                → returns ALL progress records for that player
 * POST { userId, courseId, completedLessons, completedAt?, gender }
 *      → upsert (create or update) progress record
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID
const PAT     = process.env.AIRTABLE_PAT
const TABLE   = "AcademyProgress"
const API     = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`

const headers = () => ({
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
})

// ── Airtable helpers ──────────────────────────────────────────────────

async function airtableFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: headers() })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Airtable ${res.status}: ${text}`)
  }
  return JSON.parse(text)
}

async function findRecord(userId, courseId) {
  // Search by userId + optional courseId using filterByFormula
  let formula = `{userId} = "${userId}"`
  if (courseId) formula = `AND({userId} = "${userId}", {courseId} = "${courseId}")`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`
  const data = await airtableFetch(url)
  return data.records?.[0] || null
}

async function findAllRecords(userId) {
  const formula = `{userId} = "${userId}"`
  const url = `${API}?filterByFormula=${encodeURIComponent(formula)}`
  const data = await airtableFetch(url)
  return data.records || []
}

async function createRecord(fields) {
  return airtableFetch(API, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] }),
  })
}

async function updateRecord(recordId, fields) {
  return airtableFetch(`${API}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  })
}

// ── Response helpers ──────────────────────────────────────────────────

function ok(body) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body),
  }
}

function err(status, msg) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: msg }),
  }
}

// ── Handler ───────────────────────────────────────────────────────────

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    }
  }

  try {
    // ── GET ───────────────────────────────────────────────────────────
    if (event.httpMethod === "GET") {
      const { userId, courseId } = event.queryStringParameters || {}
      if (!userId) return err(400, "userId is required")

      if (courseId) {
        // Single course progress
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
        // All progress for user — returns map keyed by courseId
        const records = await findAllRecords(userId)
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
      const { userId, courseId, completedLessons, completedAt, gender } = body

      if (!userId || !courseId) return err(400, "userId and courseId are required")

      const fields = {
        userId,
        courseId,
        completedLessons: JSON.stringify(completedLessons || []),
        gender: gender || "",
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      if (completedAt) fields.completedAt = completedAt

      // Check if record already exists
      const existing = await findRecord(userId, courseId)

      if (existing) {
        await updateRecord(existing.id, fields)
      } else {
        await createRecord(fields)
      }

      return ok({ success: true, action: existing ? "updated" : "created" })
    }

    return err(405, "Method not allowed")
  } catch (e) {
    console.error("academy-progress error:", e)
    return err(500, e.message || "Internal server error")
  }
}
