/**
 * academy-wof — Wall of Fame via Airtable.
 *
 * GET              → returns all WallOfFame entries (sorted newest first)
 * POST { name, gender, tier, courseId }  → add new entry
 *
 * Tries "WallOfFame" table first, falls back to "Table 2" while you rename it in Airtable.
 * Fields used: Name (player name), gender (text), tier (text), courseId (text), completedAt (text)
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID
const PAT     = process.env.AIRTABLE_PAT

const atHeaders = {
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

const ok  = (body) => ({ statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) })
const err = (s, m) => ({ statusCode: s,   headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: m }) })

async function atFetch(tableName, path = "", options = {}) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}${path}`
  const res = await fetch(url, { ...options, headers: atHeaders })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

// Try WallOfFame table name, fall back to "Table 2" if not renamed yet
async function wofFetch(path = "", options = {}) {
  try {
    return await atFetch("WallOfFame", path, options)
  } catch (e) {
    if (e.message.startsWith("404")) {
      return atFetch("Table 2", path, options)
    }
    throw e
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" }

  try {
    // ── GET all entries ───────────────────────────────────────────────
    if (event.httpMethod === "GET") {
      const data = await wofFetch("?maxRecords=100")
      const entries = (data.records || [])
        .filter(r => r.fields.Name && r.fields.Name !== "test-wof")
        .map(r => ({
          name:        r.fields.Name        || "",
          gender:      r.fields.gender      || "boys",
          tier:        r.fields.tier        || "foundation",
          courseId:    r.fields.courseId    || "",
          completedAt: r.fields.completedAt || "",
        }))
        .sort((a, b) => (b.completedAt > a.completedAt ? 1 : -1))

      return ok({ entries })
    }

    // ── POST add entry ────────────────────────────────────────────────
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}")
      const { name, gender, tier, courseId } = body
      if (!name || !gender || !tier) return err(400, "name, gender, and tier are required")

      await wofFetch("", {
        method: "POST",
        body: JSON.stringify({
          records: [{
            fields: {
              Name:        name.trim(),
              gender:      gender,
              tier:        tier,
              courseId:    courseId || "",
              completedAt: new Date().toISOString().split("T")[0],
            }
          }]
        }),
      })

      return ok({ success: true })
    }

    return err(405, "Method not allowed")
  } catch (e) {
    console.error("academy-wof error:", e)
    return err(500, e.message || "Internal server error")
  }
}
