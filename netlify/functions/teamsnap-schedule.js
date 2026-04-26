/**
 * GET /.netlify/functions/teamsnap-schedule?gender=boys&gradYear=2036
 *
 * Returns upcoming schedule + roster for a BTB team, looked up by gender + gradYear.
 * The TeamSnap access token stays server-side; the client only ever sees the
 * normalized event/team payload.
 *
 * Query params:
 *   gender    "boys" | "girls"     required if no teamId
 *   gradYear  e.g. "2036"          required if no teamId
 *   teamId    number               optional — bypass lookup
 *   limit     default 8            cap on returned events
 *
 * Response: { team: {...} | null, events: [...], teams?: [...] }
 *   - team is null and teams is populated when multiple matches exist
 *   - events is empty when no team matched
 */

const https = require("https");

const TEAMSNAP_HOST = "api.teamsnap.com";
const TEAMSNAP_BASE = "/v3";

// 25-26 BTB Season division IDs (mirrors BTB-OS teamSnapService.ts).
const BTB_DIVISION_IDS = {
  boys: 1027769,
  girls: 1027768,
};

// Teams to exclude from search results (duplicates / non-real teams).
const EXCLUDED_TEAM_IDS = new Set([10427986, 10427987, 10427988, 10427984]);

function tsRequest(path) {
  const token = process.env.TEAMSNAP_ACCESS_TOKEN;
  if (!token) return Promise.reject(new Error("TEAMSNAP_ACCESS_TOKEN not configured"));
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

// TeamSnap returns Collection+JSON. Items have a `data` array of {name, value}.
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

// Pick teams matching a graduation year. The team name typically contains the year
// (e.g. "BTB 2036 Dawgs"). Falls back to substring match.
function filterByGradYear(teams, gradYear) {
  const year = String(gradYear).trim();
  if (!year) return teams;
  return teams.filter((t) => (t.name || "").includes(year));
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300", // 5 min — TeamSnap data is slow-moving
  };

  try {
    const params = event.queryStringParameters || {};
    const gender = (params.gender || "").toLowerCase();
    const gradYear = (params.gradYear || "").trim();
    const teamId = params.teamId ? Number(params.teamId) : null;
    const limit = Math.min(Number(params.limit) || 8, 50);

    // Direct team-id mode skips lookup
    if (teamId) {
      const eventsJson = await tsRequest(`/events/search?team_id=${teamId}`);
      const events = filterUpcoming(parseCollection(eventsJson)).slice(0, limit);
      return { statusCode: 200, headers, body: JSON.stringify({ team: { id: teamId }, events }) };
    }

    if (!gender || !gradYear) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing gender or gradYear (or teamId)" }),
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

    // 1. Find the team(s) for this gender + gradYear
    const teamsJson = await tsRequest(`/teams/search?division_id=${divisionId}`);
    const allTeams = parseCollection(teamsJson).filter((t) => !EXCLUDED_TEAM_IDS.has(t.id));
    const matches = filterByGradYear(allTeams, gradYear);

    if (matches.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ team: null, events: [], message: `No team found for ${gender} ${gradYear}` }),
      };
    }

    // 2. Pick the first match's events. If multiple match, return the full list
    //    so the client can render a picker and re-fetch via teamId.
    const team = matches[0];
    const eventsJson = await tsRequest(`/events/search?team_id=${team.id}`);
    const events = filterUpcoming(parseCollection(eventsJson)).slice(0, limit);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        team: { id: team.id, name: team.name },
        events,
        teams: matches.length > 1 ? matches.map((t) => ({ id: t.id, name: t.name })) : undefined,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "TeamSnap fetch failed" }),
    };
  }
};

// Keep events whose start_date is today or later, sorted ascending.
function filterUpcoming(events) {
  const now = Date.now();
  return events
    .filter((e) => {
      const t = new Date(e.startDate || 0).getTime();
      return t >= now - 6 * 60 * 60 * 1000; // include events from the last 6h (in-progress)
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}
