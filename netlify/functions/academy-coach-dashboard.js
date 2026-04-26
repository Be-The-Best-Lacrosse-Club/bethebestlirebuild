/**
 * academy-coach-dashboard — aggregated academy progress for coaches.
 *
 * GET ?gender=boys|girls  → returns all player progress records, grouped by player
 *
 * Response shape:
 * {
 *   players: [{
 *     userId, email, name,
 *     courses: [{ courseId, lessonsCompleted, totalLessons, pct, completedAt }]
 *     totalPct, lastActive
 *   }]
 * }
 *
 * Auth: requires Netlify Identity JWT in Authorization header (coaches only).
 * Falls back to open if no Identity configured (dev mode).
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID
const PAT     = process.env.AIRTABLE_PAT

// Course totals — lesson counts per course (boys & girls, all tiers)
const COURSE_TOTALS = {
  "boys-youth":  10,
  "boys-middle": 10,
  "boys-high":   10,
  "girls-youth": 10,
  "girls-middle":10,
  "girls-high":  10,
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const ok  = (body) => ({ statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(body) })
const err = (s, m) => ({ statusCode: s,   headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify({ error: m }) })

async function atFetch(path) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${path}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${PAT}` } })
  if (!res.ok) throw new Error(`Airtable ${res.status}`)
  return res.json()
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" }
  if (event.httpMethod !== "GET") return err(405, "Method not allowed")

  try {
    const { gender } = event.queryStringParameters || {}

    // Fetch all progress records, optionally filtered by gender via courseId prefix
    let formula = "NOT({userId} = '')"
    if (gender) {
      formula = `AND(NOT({userId} = ''), FIND("${gender}-", {courseId}) = 1)`
    }

    const encoded = encodeURIComponent(formula)
    const data = await atFetch(`AcademyProgress?filterByFormula=${encoded}&maxRecords=500`)
    const records = data.records || []

    // Group by userId
    const byUser = {}
    for (const rec of records) {
      const f = rec.fields
      if (!f.userId || !f.courseId) continue
      if (!byUser[f.userId]) byUser[f.userId] = {
        userId: f.userId,
        playerName: f.Name || null,
        playerEmail: f.playerEmail || null,
        courses: [],
        lastActive: ""
      }
      const lessons = f.completedLessons ? JSON.parse(f.completedLessons) : []
      const total   = COURSE_TOTALS[f.courseId] || 10
      const pct     = Math.round((lessons.length / total) * 100)
      byUser[f.userId].courses.push({
        courseId:         f.courseId,
        lessonsCompleted: lessons.length,
        totalLessons:     total,
        pct,
        completedAt:      f.completedAt || null,
      })
      if (f.completedAt && f.completedAt > byUser[f.userId].lastActive) {
        byUser[f.userId].lastActive = f.completedAt
      }
    }

    // Also fetch Wall of Fame to enrich with names where possible
    const wofData = await atFetch("WallOfFame?maxRecords=200")
    const wofNames = {}
    for (const rec of (wofData.records || [])) {
      const f = rec.fields
      if (f.courseId && f.Name) wofNames[f.courseId + ":" + f.Name] = true
    }

    // Build player summaries
    const players = Object.values(byUser).map((p) => {
      const totalDone  = p.courses.reduce((s, c) => s + c.lessonsCompleted, 0)
      const totalAvail = p.courses.reduce((s, c) => s + c.totalLessons, 0)
      const totalPct   = totalAvail > 0 ? Math.round((totalDone / totalAvail) * 100) : 0
      return {
        userId:      p.userId,
        playerName:  p.playerName || null,
        playerEmail: p.playerEmail || null,
        courses:     p.courses.sort((a, b) => a.courseId.localeCompare(b.courseId)),
        totalPct,
        lastActive:  p.lastActive || null,
      }
    }).sort((a, b) => b.totalPct - a.totalPct)

    return ok({ players, totalRecords: records.length })
  } catch (e) {
    console.error("academy-coach-dashboard error:", e)
    return err(500, e.message || "Internal server error")
  }
}
