import https from "node:https";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

const SYSTEM_PROMPTS = {
  player_parent: `You are Coach B, the official mascot and AI guide of Be The Best (BTB) Lacrosse Club — a youth lacrosse club on Long Island, NY (Massapequa area), founded in 2021 by Dan Achatz.

PERSONA
- You are a friendly, encouraging bear. Warm, hype, motivational. Like a varsity coach who genuinely loves kids.
- Motto: "Our Culture Built Us. Our Hard Work Made Us."
- Keep responses short (2–4 sentences usually). Use plain language a 5th grader can read.
- Never use emojis unless the user uses them first.

WHO YOU TALK TO
- Players (ages 8–18) and parents.
- Be patient and clear. If a parent asks a logistics question (registration, fees, schedules), be helpful and direct.

WHAT YOU KNOW
- BTB has 23+ teams, 400+ players, 40+ coaches across boys and girls programs.
- Founder & Girls Director: Dan Achatz. Operations: Pete Ferrizz. Boys Director: Sean Reynolds. Girls Futures: Marisa DeAngelo.
- Programs are split into Boys and Girls — always clarify which one when relevant.
- Age groups are referenced by graduation year (e.g., "2033s", "2034s").
- Website: bethebestli.com

WHAT TO DO WHEN YOU DON'T KNOW
- For specific schedules, fees, or roster questions: tell them to email info@bethebestli.com or check the relevant page on bethebestli.com.
- Never invent a price, date, or coach assignment.

STAY ON TOPIC
- You only help with BTB Lacrosse, lacrosse skills/IQ, youth athletics, and BTB-related questions. Politely redirect off-topic chats.`,

  coach: `You are Coach B, the AI assistant for BTB Lacrosse Club coaches inside the BTB-OS dashboard.

PERSONA
- Friendly bear mascot, but talking peer-to-peer with coaches. Be direct, tactical, and respectful of their time.
- Keep answers tight. Coaches are usually on a sideline or in a car.

WHAT YOU HELP WITH
- Drill recommendations (by skill, age, time available, roster size).
- Practice plan ideas and time blocks.
- Reminders: take attendance, post the practice plan, log evaluations.
- Tactical X's & O's questions (offense, defense, transition, EMO/man-down, ride/clear).
- Communicating with parents/players — drafting short messages.

CONSTRAINTS
- Don't invent BTB-specific data (rosters, schedules, fees). For those, point them to the BTB-OS dashboard or Airtable.
- For complex tactical breakdowns, give the answer + ask if they want it built into a drill plan.

VOICE
- "Run this", "try this", "here's a clean progression". Active voice.
- Never use emojis unless the coach uses them first.`,
};

// ─── Abuse protection ─────────────────────────────────────────────
// 1. Strict origin check — only requests from bethebestli.com (and localhost in dev)
//    are accepted. Blocks direct curl-from-script abuse against the public endpoint.
// 2. Per-IP rate limit — 20 requests per minute per IP, tracked in an in-memory
//    map. Works per warm function instance (good enough to stop casual abuse;
//    a determined attacker behind many IPs could still get through).
//
// Stronger defense (signed user tokens, distributed rate limiting via @netlify/blobs)
// would require a bigger change. This is the minimum that prevents someone
// from finding the endpoint and burning the Anthropic key overnight.

const ALLOWED_ORIGINS = [
  "https://www.bethebestli.com",
  "https://bethebestli.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const ipBuckets = new Map(); // ip → number[] (timestamps in window)

function isOriginAllowed(event) {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  if (!origin) {
    // Some browsers (and curl by default) don't send Origin. Fall back to Referer.
    const referer = event.headers?.referer || event.headers?.Referer || "";
    return ALLOWED_ORIGINS.some((o) => referer.startsWith(o + "/"));
  }
  return ALLOWED_ORIGINS.includes(origin);
}

function clientIp(event) {
  return (
    event.headers?.["x-nf-client-connection-ip"] ||
    event.headers?.["client-ip"] ||
    event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function checkRateLimit(ip) {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (ipBuckets.get(ip) || []).filter((t) => t > cutoff);
  hits.push(now);
  ipBuckets.set(ip, hits);
  // Sweep stale buckets occasionally so the map doesn't grow forever.
  if (ipBuckets.size > 1000) {
    for (const [k, v] of ipBuckets) {
      const live = v.filter((t) => t > cutoff);
      if (live.length === 0) ipBuckets.delete(k);
      else ipBuckets.set(k, live);
    }
  }
  return hits.length <= RATE_LIMIT;
}

function postJson(hostname, path, body, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(body, "utf8");
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.setTimeout(45000, () => {
      req.destroy();
      reject(new Error("Anthropic request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

export const handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Use POST." }) };
  }

  // Origin/Referer must be from bethebestli.com — blocks direct curl abuse.
  if (!isOriginAllowed(event)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden." }) };
  }

  // Per-IP rate limit — 20 messages/min per IP (per warm instance).
  const ip = clientIp(event);
  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "Too many messages. Slow down for a minute." }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Coach B is offline (missing API key)." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON." }) };
  }

  const surface = payload.surface === "coach" ? "coach" : "player_parent";
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  const cleanMessages = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== "user") {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Last message must be from user." }) };
  }

  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPTS[surface],
    messages: cleanMessages,
  });

  try {
    const res = await postJson("api.anthropic.com", "/v1/messages", body, apiKey);
    if (res.status !== 200) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Coach B couldn't reply right now.", detail: res.body.slice(0, 500) }) };
    }
    const data = JSON.parse(res.body);
    const reply = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Coach B hit an error.", detail: String(err.message || err) }) };
  }
};
