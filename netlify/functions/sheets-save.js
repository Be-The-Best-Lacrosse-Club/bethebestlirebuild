/**
 * Staff-only relay for saving film breakdown results to the configured Sheets
 * webhook. The browser supplies a Netlify Identity JWT; the webhook credential
 * remains server-side.
 */

import https from "node:https";

import { corsHeaders, isAllowedCorsOrigin } from "./_cors.js";
import { authorizeIdentity } from "./_identity.js";

function postJsonFollowRedirects(url, bodyStr, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let redirectsLeft = maxRedirects;

    function request(target, method, payloadBuf) {
      const parsed = new URL(target);
      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method,
        headers:
          method === "POST"
            ? {
                "Content-Type": "application/json",
                "Content-Length": payloadBuf.length,
              }
            : {},
      };

      const req = https.request(options, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectsLeft-- <= 0) {
            reject(new Error("Too many redirects"));
            return;
          }
          const next = new URL(res.headers.location, target).toString();
          return request(next, "GET", Buffer.alloc(0));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      });

      req.on("error", reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error("Sheets webhook timed out"));
      });
      if (method === "POST") req.write(payloadBuf);
      req.end();
    }

    request(url, "POST", Buffer.from(bodyStr, "utf8"));
  });
}

function json(statusCode, body, headers) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function createHandler({ authorize = authorizeIdentity, postJson = postJsonFollowRedirects } = {}) {
  return async function (event) {
    const headers = corsHeaders(event, "POST, OPTIONS");

    if (event.httpMethod === "OPTIONS") {
      if (!isAllowedCorsOrigin(event)) return json(403, { error: "Forbidden origin" }, headers);
      return { statusCode: 204, headers, body: "" };
    }
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed. Use POST." }, headers);
    }

    const identity = await authorize(event, ["coach", "owner"]);
    if (!identity.ok) {
      return json(identity.statusCode, { error: identity.error }, headers);
    }

    const webhook = process.env.SHEETS_WEBHOOK_URL;
    const apiKey = process.env.SHEETS_API_KEY;
    if (!webhook || !apiKey) {
      return json(500, {
        error: "Server misconfigured: SHEETS_WEBHOOK_URL or SHEETS_API_KEY not set.",
      }, headers);
    }

    if (Buffer.byteLength(event.body || "", "utf8") > 1_000_000) {
      return json(413, { error: "Request body is too large." }, headers);
    }

    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON in request body." }, headers);
    }

    if (!Array.isArray(payload.plays) || payload.plays.length === 0) {
      return json(400, { error: "Missing 'plays' array." }, headers);
    }
    if (
      payload.plays.length > 500 ||
      payload.plays.some((play) => !play || typeof play !== "object" || Array.isArray(play))
    ) {
      return json(400, { error: "The 'plays' array is invalid or too large." }, headers);
    }

    const forwardBody = JSON.stringify({
      api_key: apiKey,
      video_id: payload.video_id || "",
      game_context: payload.game_context || "",
      analyzed_at: payload.analyzed_at || new Date().toISOString(),
      plays: payload.plays,
    });

    try {
      const upstream = await postJson(webhook, forwardBody);
      return {
        statusCode: upstream.status >= 200 && upstream.status < 300 ? 200 : upstream.status,
        headers,
        body: JSON.stringify({
          ok: upstream.status >= 200 && upstream.status < 300,
          upstream_status: upstream.status,
        }),
      };
    } catch (err) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `Upstream error: ${err.message}` }),
      };
    }
  };
}

export const handler = createHandler();
