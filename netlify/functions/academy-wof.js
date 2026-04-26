/**
 * academy-wof — Wall of Fame via Airtable.
 *
 * GET              → returns all WallOfFame entries (sorted newest first)
 * POST { name, gender, tier, courseId }  → add new entry
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID
const PAT     = process.env.AIRTABLE_PAT
const TABLE   = "WallOfFame"
const API     = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`

const headers = () => ({
  Authorization: `Bearer ${PAT}`,
  "Content-Type": "application/json",
})

async function airtableFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: headers() })
  const text = await res.text()
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${text}`)
  return JSON.parse(text)
}

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

exports.handler = async (event) => {
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
    // ── GET all entries ───────────────────────────────────────────────
    if (event.httpMethod === "GET") {
      const url = `${API}?sort%5B0%5D%5Bfield%5D=completedAt&sort%5B0%5D%5Bdirection%5D=desc&maxRecords=100`
      const data = await airtableFetch(url)

      const entries = (data.records || []).map((r) => ({
        name: r.fields.name || "",
        gender: r.fields.gender || "boys",
        tier: r.fields.tier || "youth",
        courseId: r.fields.courseId || "",
        completedAt: r.fields.completedAt || "",
      }))

      return ok({ entries })
    }

    // ── POST add entry ────────────────────────────────────────────────
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}")
      const { name, gender, tier, courseId } = body

      if (!name || !gender || !tier) return err(400, "name, gender, and tier are required")

      const fields = {
        name: name.trim(),
        gender,
        tier,
        courseId: courseId || "",
        completedAt: new Date().toISOString().split("T")[0],
      }

      await airtableFetch(API, {
        method: "POST",
        body: JSON.stringify({ records: [{ fields }] }),
      })

      return ok({ success: true })
    }

    return err(405, "Method not allowed")
  } catch (e) {
    console.error("academy-wof error:", e)
    return err(500, e.message || "Internal server error")
  }
}
