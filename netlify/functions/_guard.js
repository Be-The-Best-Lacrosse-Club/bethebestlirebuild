/**
 * Shared abuse protection for public Netlify Functions.
 *
 * This is the guard that coach-b.js already implements inline, lifted out so
 * other public endpoints stop reinventing it. Same trade-offs as documented
 * there:
 *
 * 1. Origin check — only our own pages are accepted. Blocks curl-from-script
 *    abuse. Origin/Referer are forgeable outside a browser, so this is a speed
 *    bump, not authentication.
 * 2. Per-IP rate limit — in-memory, so it is per warm function instance. Good
 *    enough to stop casual abuse; a determined caller across many IPs gets
 *    through.
 *
 * For anything that must actually be private, use the Netlify Identity check in
 * leads-list.js instead.
 */

export const ALLOWED_ORIGINS = [
  "https://www.bethebestli.com",
  "https://bethebestli.com",
  "https://os.bethebestli.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

export function isOriginAllowed(event, allowed = ALLOWED_ORIGINS) {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  if (!origin) {
    // Same-origin GETs and curl both omit Origin, so fall back to Referer.
    const referer = event.headers?.referer || event.headers?.Referer || "";
    return allowed.some((o) => referer.startsWith(o + "/"));
  }
  return allowed.includes(origin);
}

export function clientIp(event) {
  return (
    event.headers?.["x-nf-client-connection-ip"] ||
    event.headers?.["client-ip"] ||
    event.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  );
}

const buckets = new Map(); // key → number[] of request timestamps in window

export function rateLimit(key, { limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic sweep so the map can't grow without bound on a warm instance.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return hits.length <= limit;
}

/**
 * Returns an error response object if the request should be rejected, else null.
 * Callers supply their own CORS headers so each endpoint keeps its own policy.
 */
export function guard(event, headers, opts = {}) {
  if (!isOriginAllowed(event, opts.allowedOrigins)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Forbidden" }) };
  }
  if (!rateLimit(clientIp(event), opts)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "Rate limit exceeded" }) };
  }
  return null;
}
