/**
 * GET /.netlify/functions/teamsnap-roster?gender=boys&gradYear=2036
 *
 * Returns roster for a BTB team, looked up by gender + gradYear.
 */

import https from "node:https";
import { getTeamSnapAccessToken } from "./_teamsnap-auth.js";
import { guard } from "./_guard.js";

const TEAMSNAP_HOST = "api.teamsnap.com";
const TEAMSNAP_BASE = "/v3";

const BTB_DIVISION_IDS = {
  boys: 1027769,
  girls: 1027768,
};

const EXCLUDED_TEAM_IDS = new Set([10427986, 10427987, 10427988, 10427984]);

async function tsRequest(path) {
  const token = await getTeamSnapAccessToken();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: TEAMSNAP_HOST,
        path: TEAMSNAP_BASE + path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.collection+json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Bad JSON from TeamSnap: ${e.message}`));
            }
          } else {
            reject(new Error(`TeamSnap API ${res.statusCode}: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("TeamSnap request timeout"));
    });
    req.end();
  });
}

function parseCollection(json) {
  if (!json?.collection?.items) return [];
  return json.collection.items.map((item) => {
    const obj = {};
    (item.data || []).forEach((d) => {
      const key = d.name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      obj[key] = d.value;
    });
    return obj;
  });
}

function filterByGradYear(teams, gradYear) {
  const year = String(gradYear).trim();
  if (!year) return teams;
  return teams.filter((t) => (t.name || "").includes(year));
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600", // 1 hour
  };

  // This returns youth athlete names and jersey numbers, so it is closed to
  // callers that are not one of our own pages. If a server-side consumer needs
  // it, add its origin to ALLOWED_ORIGINS in _guard.js rather than removing this.
  const rejected = guard(event, headers);
  if (rejected) return rejected;

  try {
    const params = event.queryStringParameters || {};
    const gender = (params.gender || "").toLowerCase();
    const gradYear = (params.gradYear || "").trim();

    // A caller-supplied teamId used to short-circuit the lookup below, which
    // meant any team id the TeamSnap token could reach was readable — including
    // other organizations' teams. The only way in now is gender + gradYear,
    // which is resolved inside our own divisions and honors EXCLUDED_TEAM_IDS.
    let targetTeamId = null;
    let teamName = "";

    {
      if (!gender || !gradYear) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing gender or gradYear" }),
        };
      }

      const divisionId = BTB_DIVISION_IDS[gender];
      if (!divisionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown gender "${gender}" — expected boys or girls` }),
        };
      }

      const teamsJson = await tsRequest(`/teams/search?division_id=${divisionId}`);
      const matches = filterByGradYear(parseCollection(teamsJson).filter(t => !EXCLUDED_TEAM_IDS.has(t.id)), gradYear);

      if (matches.length === 0) {
        return { statusCode: 200, headers, body: JSON.stringify({ players: [], message: "No team found" }) };
      }
      targetTeamId = matches[0].id;
      teamName = matches[0].name;
    }

    const membersJson = await tsRequest(`/members/search?team_id=${targetTeamId}`);
    const players = parseCollection(membersJson)
      .filter(m => !m.isNonPlayer && m.status === 'active')
      .map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        jerseyNumber: p.jerseyNumber,
        position: p.position
      }))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ teamName, players }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "TeamSnap fetch failed" }),
    };
  }
};
