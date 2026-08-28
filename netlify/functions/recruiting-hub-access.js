import crypto from "node:crypto"
import { authorizeIdentity } from "./_identity.js"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
}

const ACCESS_PREFIX = "BTB-2028"
const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_DAYS = 14
const EPOCH_DATE_UTC_MS = Date.UTC(2026, 4, 24)
const SECRET = process.env.RECRUITING_HUB_SECRET || "BTB_RECRUITING_HUB_ROTATION_2026"

function json(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  }
}

function getEasternDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const part = (type) => Number(parts.find((entry) => entry.type === type)?.value)
  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
  }
}

function getCurrentPeriod(date = new Date()) {
  const easternDate = getEasternDateParts(date)
  const currentDateUtcMs = Date.UTC(easternDate.year, easternDate.month - 1, easternDate.day)
  const daysSinceEpoch = Math.floor((currentDateUtcMs - EPOCH_DATE_UTC_MS) / DAY_MS)
  const periodIndex = Math.max(0, Math.floor(daysSinceEpoch / PERIOD_DAYS))
  const startDateUtcMs = EPOCH_DATE_UTC_MS + periodIndex * PERIOD_DAYS * DAY_MS
  const validThroughUtcMs = startDateUtcMs + (PERIOD_DAYS - 1) * DAY_MS
  const nextRotationUtcMs = startDateUtcMs + PERIOD_DAYS * DAY_MS

  return {
    periodIndex,
    startDateUtcMs,
    validThroughUtcMs,
    nextRotationUtcMs,
  }
}

function pad2(value) {
  return String(value).padStart(2, "0")
}

function isoDateFromUtcMs(utcMs) {
  const date = new Date(utcMs)
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

function dateStampFromUtcMs(utcMs) {
  const date = new Date(utcMs)
  return `${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`
}

function currentAccessCode(date = new Date()) {
  const period = getCurrentPeriod(date)
  return `${ACCESS_PREFIX}-${dateStampFromUtcMs(period.startDateUtcMs)}`
}

function normalizeCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

function codeMatches(input, expected) {
  return normalizeCode(input) === normalizeCode(expected)
}

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url")
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function createAccessToken(period) {
  const payload = {
    v: 1,
    scope: "recruiting-hub",
    period: period.periodIndex,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${encodedPayload}.${sign(encodedPayload)}`
}

function verifyAccessToken(token, date = new Date()) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
    const period = getCurrentPeriod(date)
    return payload.v === 1 && payload.scope === "recruiting-hub" && payload.period === period.periodIndex
  } catch {
    return false
  }
}

export const _internal = {
  currentAccessCode,
  createAccessToken,
  getCurrentPeriod,
  verifyAccessToken,
}

export function createHandler({ authorize = authorizeIdentity } = {}) {
  return (event) => handleRequest(event, authorize)
}

async function handleRequest(event, authorize) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" })
  }

  let body
  try {
    body = JSON.parse(event.body || "{}")
  } catch {
    return json(400, { error: "Invalid request body" })
  }

  const period = getCurrentPeriod()
  const validThrough = isoDateFromUtcMs(period.validThroughUtcMs)
  const nextRotation = isoDateFromUtcMs(period.nextRotationUtcMs)

  if (body.owner === true) {
    const identity = await authorize(event, ["owner"])
    if (!identity.ok) {
      return json(identity.statusCode, { error: identity.error })
    }
    return json(200, { ok: true, owner: true, validThrough, nextRotation })
  }

  if (body.token) {
    if (!verifyAccessToken(body.token)) {
      return json(401, { error: "Access expired" })
    }

    return json(200, { ok: true, validThrough, nextRotation })
  }

  if (!body.code) {
    return json(400, { error: "Access code required" })
  }

  if (!codeMatches(body.code, currentAccessCode())) {
    return json(401, { error: "Access code expired or incorrect" })
  }

  return json(200, {
    ok: true,
    token: createAccessToken(period),
    validThrough,
    nextRotation,
  })
}

export const handler = createHandler()
