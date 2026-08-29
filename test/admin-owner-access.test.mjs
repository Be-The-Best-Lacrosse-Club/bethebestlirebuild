import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import { authorizeIdentity } from "../netlify/functions/_identity.js"
import { createHandler as createRecruitingHandler } from "../netlify/functions/recruiting-hub-access.js"
import { createHandler as createCalendarHandler } from "../netlify/functions/tournament-calendar.mjs"

const SITE_ORIGIN = "https://www.bethebestli.com"
const OWNER_MARKER = "btb-owner-access-until"

test("Identity authorization accepts the supported nf_jwt session cookie", async () => {
  const calls = []
  const result = await authorizeIdentity(
    { headers: new Headers({ cookie: "theme=dark; nf_jwt=cookie-signed-jwt" }) },
    ["owner"],
    {
      siteUrl: "https://identity.example",
      fetchImpl: async (url, options) => {
        calls.push({ url, options })
        return {
          ok: true,
          async json() {
            return { id: "owner-1", app_metadata: { roles: ["owner"] } }
          },
        }
      },
    },
  )

  assert.equal(result.ok, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].options.headers.Authorization, "Bearer cookie-signed-jwt")
})

test("Recruiting hub lets a verified owner bypass the rotating family code", async () => {
  let requestedRoles
  const handler = createRecruitingHandler({
    authorize: async (_event, roles) => {
      requestedRoles = roles
      return { ok: true, user: { id: "owner-1" } }
    },
  })
  const response = await handler({
    httpMethod: "POST",
    headers: { cookie: "nf_jwt=owner-jwt" },
    body: JSON.stringify({ owner: true }),
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(requestedRoles, ["owner"])
  assert.equal(JSON.parse(response.body).owner, true)
})

test("Recruiting hub rejects an unverified owner bypass", async () => {
  const handler = createRecruitingHandler({
    authorize: async () => ({ ok: false, statusCode: 403, error: "Insufficient permissions" }),
  })
  const response = await handler({
    httpMethod: "POST",
    headers: {},
    body: JSON.stringify({ owner: true }),
  })

  assert.equal(response.statusCode, 403)
  assert.equal(JSON.parse(response.body).error, "Insufficient permissions")
})

test("Tournament calendar accepts a verified owner without the calendar password", async () => {
  const originalPassword = process.env.TOURNAMENT_CALENDAR_PASSWORD
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password"
  let requestedRoles
  const handler = createCalendarHandler({
    authorize: async (_request, roles) => {
      requestedRoles = roles
      return { ok: true, user: { id: "owner-1" } }
    },
    getBlobStore: () => ({
      getWithMetadata: async () => ({
        data: { events: [{ id: "event-1" }] },
        etag: '"v1"',
      }),
    }),
  })

  try {
    const response = await handler(new Request(
      "https://www.bethebestli.com/.netlify/functions/tournament-calendar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: SITE_ORIGIN },
        body: JSON.stringify({ action: "load", password: "" }),
      },
    ))

    assert.equal(response.status, 200)
    assert.deepEqual(requestedRoles, ["owner"])
    assert.deepEqual(await response.json(), {
      snapshot: {
        version: 0,
        events: [{ id: "event-1" }],
        practiceBookings: [],
        savedAt: null,
      },
      etag: '"v1"',
    })
  } finally {
    if (originalPassword === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = originalPassword
  }
})

test("Tournament calendar still rejects a wrong password without a verified owner", async () => {
  const originalPassword = process.env.TOURNAMENT_CALENDAR_PASSWORD
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password"
  let storeCalled = false
  const handler = createCalendarHandler({
    authorize: async () => ({ ok: false, statusCode: 401, error: "Authentication required" }),
    getBlobStore: () => {
      storeCalled = true
      return { get: async () => null }
    },
  })

  try {
    const response = await handler(new Request(
      "https://www.bethebestli.com/.netlify/functions/tournament-calendar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: SITE_ORIGIN },
        body: JSON.stringify({ action: "load", password: "wrong" }),
      },
    ))

    assert.equal(response.status, 401)
    assert.equal(storeCalled, false)
  } finally {
    if (originalPassword === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = originalPassword
  }
})

test("Every browser-only password gate recognizes an authenticated owner session", async () => {
  const gatedPages = [
    "public/academy-downloads/BTB_Academy_Training_Packets.html",
    "public/btb-boys-coaching-manual.html",
    "public/btb-boys-defense-playbook.html",
    "public/btb-boys-offense-playbook.html",
    "public/btb-boys-transition-playbook.html",
    "public/btb-coach-ai.html",
    "public/btb-girls-coaching-manual.html",
    "public/btb-girls-defense-playbook.html",
    "public/btb-girls-offense-playbook.html",
    "public/btb-girls-transition-playbook.html",
    "public/btb-positionless-guru.html",
    "public/coach-tools.html",
    "public/coaches-hub.html",
    "public/film-breakdown.html",
    "public/playbook-studio.html",
    "public/teamsnap-setup.html",
  ]

  for (const path of gatedPages) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8")
    assert.match(source, new RegExp(OWNER_MARKER), `${path} is missing the owner bypass`)
  }
})

test("Server-backed static areas request owner verification", async () => {
  const calendarPage = await readFile(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8")
  const recruitingLogin = await readFile(new URL("../public/recruiting-hub/index.html", import.meta.url), "utf8")
  const recruitingHub = await readFile(new URL("../public/recruiting-hub/hub/index.html", import.meta.url), "utf8")

  assert.match(calendarPage, new RegExp(OWNER_MARKER))
  assert.match(calendarPage, /tournament-calendar/)
  assert.match(recruitingLogin, /JSON\.stringify\(\{ owner: true \}\)/)
  assert.match(recruitingHub, /JSON\.stringify\(\{ owner: true \}\)/)
})
