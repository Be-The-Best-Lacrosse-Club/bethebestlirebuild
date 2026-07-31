import https from "node:https";

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

export const handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  const webhook = process.env.SHEETS_WEBHOOK_URL;
  const apiKey = process.env.SHEETS_API_KEY;
  if (!webhook || !apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Server misconfigured: SHEETS_WEBHOOK_URL or SHEETS_API_KEY not set.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
    };
  }

  if (!Array.isArray(payload.plays) || payload.plays.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing 'plays' array." }),
    };
  }

  const forwardBody = JSON.stringify({
    api_key: apiKey,
    video_id: payload.video_id || "",
    game_context: payload.game_context || "",
    analyzed_at: payload.analyzed_at || new Date().toISOString(),
    plays: payload.plays,
  });

  try {
    const upstream = await postJsonFollowRedirects(webhook, forwardBody);
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
