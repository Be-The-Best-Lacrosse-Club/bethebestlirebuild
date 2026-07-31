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

import https from "node:https";
import { getTeamSnapAccessToken, hasTeamSnapCredentials } from "./_teamsnap-auth.js";
import { guard } from "./_guard.js";

const TEAMSNAP_HOST = "api.teamsnap.com";
const DEFAULT_BOYS_DIVISION = 1027769;

// Only these two divisions are ours. A caller-supplied teamId used to be passed
// straight through to TeamSnap, so any team id the token could see was readable
// — including teams belonging to other organizations. teamId is now checked
// against the teams that actually live in our divisions.
const BTB_DIVISION_IDS = [1027769, 1027768];

let teamIdCache = null;
let teamIdCacheAt = 0;
const TEAM_CACHE_MS = 10 * 60 * 1000;

async function btbTeamIds() {
  if (teamIdCache && Date.now() - teamIdCacheAt < TEAM_CACHE_MS) return teamIdCache;
  const ids = new Set();
  for (const divisionId of BTB_DIVISION_IDS) {
    const json = await tsRequest(`/teams/search?division_id=${divisionId}`);
    for (const t of parseCollection(json)) ids.add(String(t.id));
  }
  teamIdCache = ids;
  teamIdCacheAt = Date.now();
  return ids;
}

// TeamSnap member records carry contact details for youth athletes. Only the
// fields the UI actually renders leave the server.
function publicMember(m) {
  return {
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    jerseyNumber: m.jerseyNumber,
    position: m.position,
    isNonPlayer: m.isNonPlayer,
  };
}

async function tsRequest(path) {
  const token = await getTeamSnapAccessToken();
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
  "Access-Control-Allow-Origin": "https://www.bethebestli.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const rejected = guard(event, CORS);
  if (rejected) return rejected;

  if (!hasTeamSnapCredentials()) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "TeamSnap credentials not configured" }) };
  }

  const q = event.queryStringParameters || {};
  const action = q.action;

  try {
    if (action === "teams") {
      const divisionId = Number(q.divisionId || DEFAULT_BOYS_DIVISION);
      if (!BTB_DIVISION_IDS.includes(divisionId)) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown division" }) };
      }
      const json = await tsRequest(`/teams/search?division_id=${encodeURIComponent(divisionId)}`);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: parseCollection(json) }) };
    }

    if (action !== "events" && action !== "roster") {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "action must be teams|events|roster" }) };
    }

    if (!q.teamId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `teamId required for ${action}` }) };
    }

    // The IDOR fix: a team id only resolves if it is one of ours.
    const allowedTeams = await btbTeamIds();
    if (!allowedTeams.has(String(q.teamId))) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Unknown team" }) };
    }

    if (action === "events") {
      const json = await tsRequest(`/events/search?team_id=${encodeURIComponent(q.teamId)}`);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ items: parseCollection(json) }) };
    }

    const json = await tsRequest(`/members/search?team_id=${encodeURIComponent(q.teamId)}`);
    const items = parseCollection(json).map(publicMember);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ items }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
