const https = require("https");

const CLIENT_ID = process.env.TEAMSNAP_CLIENT_ID;
const CLIENT_SECRET = process.env.TEAMSNAP_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.TEAMSNAP_REFRESH_TOKEN;
const STATIC_TOKEN = process.env.TEAMSNAP_ACCESS_TOKEN;

const AUTH_HOST = "auth.teamsnap.com";
const API_HOST = "api.teamsnap.com";
const API_PREFIX = "/v3";

function httpsRequest({ hostname, path, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    if (body) req.write(body);
    req.end();
  });
}

async function exchangeRefreshToken() {
  const body =
    `grant_type=refresh_token` +
    `&refresh_token=${encodeURIComponent(REFRESH_TOKEN)}` +
    `&client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;

  const res = await httpsRequest({
    hostname: AUTH_HOST,
    path: "/oauth/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
    body,
  });

  if (res.statusCode >= 400) {
    throw new Error(`TeamSnap token refresh failed (${res.statusCode}): ${res.body.slice(0, 300)}`);
  }

  const json = JSON.parse(res.body);
  if (!json.access_token) throw new Error("No access_token in refresh response");
  return json.access_token;
}

async function apiGet(path, accessToken) {
  const res = await httpsRequest({
    hostname: API_HOST,
    path: API_PREFIX + path,
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
      Accept: "application/vnd.collection+json",
    },
  });
  if (res.statusCode >= 400) {
    throw new Error(`TeamSnap API ${res.statusCode} on ${path}: ${res.body.slice(0, 200)}`);
  }
  return JSON.parse(res.body);
}

function itemToObj(item) {
  const obj = {};
  for (const d of item.data || []) obj[d.name] = d.value;
  return obj;
}

function collectionItems(res) {
  return (res && res.collection && res.collection.items) || [];
}

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
  };

  try {
    let accessToken;
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      accessToken = await exchangeRefreshToken();
    } else if (STATIC_TOKEN) {
      accessToken = STATIC_TOKEN;
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error:
            "TeamSnap is not configured. Set TEAMSNAP_CLIENT_ID, TEAMSNAP_CLIENT_SECRET, and TEAMSNAP_REFRESH_TOKEN in Netlify environment variables. Run /teamsnap-setup.html for the one-time authorization flow.",
        }),
      };
    }

    const q = event.queryStringParameters || {};
    const year = parseInt(q.year, 10) || new Date().getFullYear();
    const fromMonth = parseInt(q.from, 10) || 5;
    const toMonth = parseInt(q.to, 10) || 7;
    const startedAfter = `${year}-${String(fromMonth).padStart(2, "0")}-01T00:00:00Z`;
    const lastDay = new Date(year, toMonth, 0).getDate();
    const startedBefore = `${year}-${String(toMonth).padStart(2, "0")}-${lastDay}T23:59:59Z`;

    const meRes = await apiGet("/me", accessToken);
    const meItems = collectionItems(meRes);
    if (!meItems.length) throw new Error("Could not load TeamSnap user profile.");
    const userId = itemToObj(meItems[0]).id;

    const teamsRes = await apiGet(`/teams/search?user_id=${userId}`, accessToken);
    const teams = collectionItems(teamsRes).map(itemToObj);

    const eventsByTeam = await Promise.all(
      teams.map(async (team) => {
        try {
          const res = await apiGet(
            `/events/search?team_id=${team.id}&started_after=${encodeURIComponent(
              startedAfter
            )}&started_before=${encodeURIComponent(startedBefore)}`,
            accessToken
          );
          return collectionItems(res)
            .map(itemToObj)
            .map((ev) => ({ ...ev, _team_name: team.name, _team_id: team.id }));
        } catch {
          return [];
        }
      })
    );

    const EXCLUDE_RE = /\b(practice|training|workout|clinic|film|meeting|tryout|evaluation|scrimmage)\b/i;
    const allEvents = eventsByTeam
      .flat()
      .filter((ev) => ev.start_date && ev.name && !EXCLUDE_RE.test(ev.name));

    const sorted = [...allEvents].sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );

    const grouped = [];
    for (const ev of sorted) {
      const last = grouped[grouped.length - 1];
      const sameTournament =
        last &&
        last._team_name === ev._team_name &&
        last.name === ev.name &&
        (last.location_name || "") === (ev.location_name || "");
      if (sameTournament) {
        const lastEnd = new Date(last._end_date || last.start_date);
        const thisStart = new Date(ev.start_date);
        const daysApart = (thisStart - lastEnd) / (1000 * 60 * 60 * 24);
        if (daysApart >= 0 && daysApart <= 7) {
          last._end_date = ev.start_date;
          last._days = (last._days || 1) + 1;
          continue;
        }
      }
      grouped.push({ ...ev, _end_date: ev.start_date, _days: 1 });
    }

    const months = {};
    for (const ev of grouped) {
      const d = new Date(ev.start_date);
      const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!months[key]) months[key] = [];
      months[key].push({
        team: ev._team_name,
        name: ev.name,
        opponent: ev.opponent_name || null,
        start: ev.start_date,
        end: ev._end_date || ev.start_date,
        days: ev._days || 1,
        location: ev.location_name || null,
        is_tbd: !!ev.is_tbd,
        is_game: !!ev.is_game,
      });
    }
    for (const k of Object.keys(months)) {
      months[k].sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        updated: new Date().toISOString(),
        range: { year, from: fromMonth, to: toMonth },
        teamCount: teams.length,
        eventCount: allEvents.length,
        months,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
