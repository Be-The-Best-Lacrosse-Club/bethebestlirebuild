/**
 * GET /.netlify/functions/airtable-proxy?module=players|parents|coaches|events|schedule|payments
 *
 * Reads from BTB Operations or Roster Airtable bases for verified owners only.
 * Airtable credentials remain server-side in environment variables.
 */

import https from "node:https";

import { corsHeaders, isAllowedCorsOrigin } from "./_cors.js";
import { authorizeIdentity } from "./_identity.js";

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

function json(statusCode, body, headers) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function createHandler({ authorize = authorizeIdentity, getRecords = airtableGet } = {}) {
  return async (event) => {
    const headers = corsHeaders(event, "GET, OPTIONS");
    if (event.httpMethod === "OPTIONS") {
      if (!isAllowedCorsOrigin(event)) return json(403, { error: "Forbidden origin" }, headers);
      return { statusCode: 204, headers, body: "" };
    }
    if (event.httpMethod !== "GET") {
      return json(405, { error: "Method not allowed" }, headers);
    }

    const identity = await authorize(event, ["owner"]);
    if (!identity.ok) {
      return json(identity.statusCode, { error: identity.error }, headers);
    }

    const module = (event.queryStringParameters || {}).module;
    if (!module) {
      return json(400, { error: "module query param required" }, headers);
    }

    const route = routeFor(module);
    if (!route) {
      return json(400, { error: `Unknown module: ${module}` }, headers);
    }

    if (!process.env.AIRTABLE_OPS_API_KEY || !route.baseId) {
      return json(500, { error: "Airtable env vars not configured" }, headers);
    }

    try {
      const data = await getRecords(route.baseId, route.table);
      const records = (data.records || []).map((r) => ({ id: r.id, ...r.fields }));
      return json(200, { records }, headers);
    } catch (err) {
      return json(502, { error: err.message }, headers);
    }
  };
}

export const handler = createHandler();
