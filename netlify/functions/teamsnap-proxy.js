/**
 * GET /.netlify/functions/teamsnap-proxy?action=teams|events|roster&teamId=...&divisionId=...
 *
 * Server-side proxy for TeamSnap. Replaces the previous client-side
 * src/lib/teamSnap.ts that bundled an access token.
 *
 * actions:
 *   teams                                  → list teams in a division (default 1027769 = boys)
 *   teams&divisionId=1027768               → girls
 *   events&teamId=...                      → events for one team
 *   roster&teamId=...                      → members for one team
 */

const https = require("https");

const TEAMSNAP_HOST = "api.teamsnap.com";
const DEFAULT_BOYS_DIVISION = 1027769;

function tsRequest(path) {
  const token = process.env.TEAMSNAP_ACCESS_TOKEN;
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: TEAMSNAP_HOST,
        path: `/v3${path}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.collection+json",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          } else {
            reject(new Error(`TeamSnap ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function parseCollection(collection) {
  if (!collection?.collection?.items) return [];
  return collection.collection.items.map((item) => {
    const obj = {};
    (item.data || []).forEach((d) => {
      const key = d.name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      obj[key] = d.value;
    });
    return obj;
  });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!process.env.TEAMSNAP_ACCESS_TOKEN) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "TEAMSNAP_ACCESS_TOKEN not configured" }) };
  }

  const q = event.queryStringParameters || {};
  const action = q.action;

  let path;
  if (action === "teams") {
    const divisionId = q.divisionId || DEFAULT_BOYS_DIVISION;
    path = `/teams/search?division_id=${encodeURIComponent(divisionId)}`;
  } else if (action === "events") {
    if (!q.teamId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "teamId required for events" }) };
    path = `/events/search?team_id=${encodeURIComponent(q.teamId)}`;
  } else if (action === "roster") {
    if (!q.teamId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "teamId required for roster" }) };
    path = `/members/search?team_id=${encodeURIComponent(q.teamId)}`;
  } else {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "action must be teams|events|roster" }) };
  }

  try {
    const json = await tsRequest(path);
    const items = parseCollection(json);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ items }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
