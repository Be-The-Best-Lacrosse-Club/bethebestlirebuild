const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const webhook = process.env.FILM_WEBHOOK_URL || process.env.SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyLz8IzFau00mve4vCxSbtpGAKHmZRHFhXx-Dx6qUGrM9Yz8wqGU3HLiYeGxyvlXnEpCw/exec";
  const apiKey = process.env.FILM_WEBHOOK_API_KEY || process.env.SHEETS_API_KEY;
  if (!webhook || !apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Film study env vars not configured" }) };
  }

  const params = event.queryStringParameters || {};
  const action = params.action || "list_events";
  let url;

  if (action === "list_events") {
    url = `${webhook}?json=${encodeURIComponent(JSON.stringify({ api_key: apiKey, action: "list_events" }))}`;
  } else if (action === "read") {
    const program = params.program || "all";
    if (!["all", "boys", "girls"].includes(program)) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unsupported program" }) };
    }
    url = `${webhook}?action=read&program=${encodeURIComponent(program)}&key=${encodeURIComponent(apiKey)}`;
  } else {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unsupported action" }) };
  }

  try {
    const resp = await fetch(url);
    const text = await resp.text();
    return {
      statusCode: resp.ok ? 200 : resp.status,
      headers: CORS,
      body: text || "{}",
    };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
