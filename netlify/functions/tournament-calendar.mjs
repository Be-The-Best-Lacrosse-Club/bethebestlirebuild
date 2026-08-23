/**
 * Shared store for the Coach Dan tournament wall calendar.
 *
 * The calendar page used to keep its events in localStorage, which meant edits
 * made on the laptop never reached the phone. This holds one snapshot blob that
 * every device reads and writes, so the last edit wins everywhere.
 *
 * The password lives in the TOURNAMENT_CALENDAR_PASSWORD env var and is checked
 * here, not in the page. The page prompts on every load and sends the typed
 * value with each call — nothing about the password is stored client-side.
 */
import { getStore } from "@netlify/blobs";
import { ALLOWED_ORIGINS, guardRequest } from "./_guard.js";

// Deploy previews get their own host, so the shared origin list would reject
// them and the page would look broken on every PR. Scoped to this endpoint.
const CALENDAR_ORIGINS = ALLOWED_ORIGINS.concat(["https://deploy-preview-196--btb-lacrosse.netlify.app"]);

const STORE_NAME = "tournament-calendar";
const SNAPSHOT_KEY = "dan-wall-snapshot";

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function suppliedPassword(req, body) {
  return req.headers.get("x-btb-calendar-key") || body?.password || "";
}

export default async (req) => {
  const blocked = guardRequest(req, { limit: 60, windowMs: 60_000, allowedOrigins: CALENDAR_ORIGINS });
  if (blocked) return blocked;

  const expected = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  if (!expected) {
    console.error("TOURNAMENT_CALENDAR_PASSWORD is not set");
    return new Response(JSON.stringify({ error: "Calendar store is not configured" }), {
      status: 500,
      headers: HEADERS,
    });
  }

  let body = null;
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Bad request" }), { status: 400, headers: HEADERS });
    }
  }

  if (suppliedPassword(req, body) !== expected) {
    return new Response(JSON.stringify({ error: "Wrong password" }), { status: 401, headers: HEADERS });
  }

  const store = getStore(STORE_NAME);

  try {
    if (req.method === "GET" || (req.method === "POST" && body?.action === "load")) {
      const snapshot = await store.get(SNAPSHOT_KEY, { type: "json" });
      // No snapshot yet means nobody has saved from any device — the page falls
      // back to the schedule baked into its source.
      return new Response(JSON.stringify({ snapshot: snapshot || null }), { status: 200, headers: HEADERS });
    }

    if (req.method === "POST" && body?.action === "save") {
      if (!body.snapshot || !Array.isArray(body.snapshot.events)) {
        return new Response(JSON.stringify({ error: "Bad snapshot" }), { status: 400, headers: HEADERS });
      }
      const saved = { events: body.snapshot.events, savedAt: new Date().toISOString() };
      await store.setJSON(SNAPSHOT_KEY, saved);
      return new Response(JSON.stringify({ ok: true, savedAt: saved.savedAt }), { status: 200, headers: HEADERS });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), { status: 405, headers: HEADERS });
  } catch (err) {
    console.error("tournament-calendar failed", err);
    return new Response(JSON.stringify({ error: "Calendar store is unavailable" }), {
      status: 500,
      headers: HEADERS,
    });
  }
};
