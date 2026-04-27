/**
 * GET /.netlify/functions/airtable-proxy?module=players|parents|coaches|events|schedule|payments
 *
 * Reads from BTB Operations or Roster Airtable bases via env-only auth.
 * Replaces the previous client-side src/lib/airtable.ts that bundled a PAT.
 */

const https = require("https");

function airtableGet(baseId, table) {
  const apiKey = process.env.AIRTABLE_OPS_API_KEY;
  return new Promise((resolve, reject) => {
    const path = `/v0/${baseId}/${encodeURIComponent(table)}`;
    const req = https.request(
      {
        host: "api.airtable.com",
        path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          } else {
            reject(new Error(`Airtable ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function routeFor(module) {
  const opsBase = process.env.AIRTABLE_OPS_BASE_ID;
  const rosterBase = process.env.AIRTABLE_ROSTER_BASE_ID;

  const rosterTables = { players: "Players", parents: "Parents", coaches: "Coaches" };
  const opsTables = { events: "Events", schedule: "Schedule", payments: "Payments" };

  if (rosterTables[module]) return { baseId: rosterBase, table: rosterTables[module] };
  if (opsTables[module]) return { baseId: opsBase, table: opsTables[module] };
  return null;
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

  const module = (event.queryStringParameters || {}).module;
  if (!module) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "module query param required" }) };
  }

  const route = routeFor(module);
  if (!route) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown module: ${module}` }) };
  }

  if (!process.env.AIRTABLE_OPS_API_KEY || !route.baseId) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Airtable env vars not configured" }) };
  }

  try {
    const data = await airtableGet(route.baseId, route.table);
    const records = (data.records || []).map((r) => ({ id: r.id, ...r.fields }));
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ records }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
