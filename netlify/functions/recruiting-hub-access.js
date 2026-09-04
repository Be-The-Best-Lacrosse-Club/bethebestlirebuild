import crypto from "node:crypto"
import { authorizeIdentity } from "./_identity.js"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
}

const DAY_MS = 24 * 60 * 60 * 1000
const ACCESS_TTL_MS = 30 * DAY_MS

function json(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  }
}

function normalizeCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

function codeMatches(input, expected) {
  return normalizeCode(input) === normalizeCode(expected)
}

function getAccessConfig() {
  const accessCode = process.env.RECRUITING_HUB_ACCESS_CODE || ""
  const secret = process.env.RECRUITING_HUB_SECRET || ""

  if (!accessCode || !secret) return null
  return { accessCode, secret }
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url")
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function codeVersion(config) {
  return sign(`code:${normalizeCode(config.accessCode)}`, config.secret).slice(0, 22)
}

function createAccessToken(config, date = new Date()) {
  const payload = {
    v: 2,
    scope: "recruiting-hub",
    codeVersion: codeVersion(config),
    expiresAt: date.getTime() + ACCESS_TTL_MS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${encodedPayload}.${sign(encodedPayload, config.secret)}`
}

function verifyAccessToken(token, config, date = new Date()) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload, config.secret))) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
    return payload.v === 2
      && payload.scope === "recruiting-hub"
      && payload.codeVersion === codeVersion(config)
      && Number.isFinite(payload.expiresAt)
      && payload.expiresAt > date.getTime()
  } catch {
    return false
  }
}

export const _internal = {
  codeVersion,
  createAccessToken,
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

  if (body.owner === true) {
    const identity = await authorize(event, ["owner"])
    if (!identity.ok) {
      return json(identity.statusCode, { error: identity.error })
    }
    return json(200, { ok: true, owner: true })
  }

  const config = getAccessConfig()
  if (!config) {
    console.error("RECRUITING_HUB_ACCESS_CODE or RECRUITING_HUB_SECRET is not set")
    return json(503, { error: "Recruiting Hub access is temporarily unavailable" })
  }

  if (body.token) {
    if (!verifyAccessToken(body.token, config)) {
      return json(401, { error: "Access expired" })
    }

    return json(200, { ok: true })
  }

  if (!body.code) {
    return json(400, { error: "Access code required" })
  }

  if (!codeMatches(body.code, config.accessCode)) {
    return json(401, { error: "Access code is incorrect" })
  }

  return json(200, {
    ok: true,
    token: createAccessToken(config),
  })
}

export const handler = createHandler()
