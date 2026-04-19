const https = require("https");

const TOKEN = process.env.TEAMSNAP_TOKEN;
const API_HOST = "api.teamsnap.com";
const API_PATH_PREFIX = "/v3";

function request(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: API_HOST,
      path: API_PATH_PREFIX + path,
      method: "GET",
      headers: {
        Authorization: "Bearer " + TOKEN,
        Accept: "application/vnd.collection+json",
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`TeamSnap ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Invalid JSON from TeamSnap: " + e.message));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("TeamSnap request timed out"));
    });
    req.end();
  });
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

  if (!TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "TEAMSNAP_TOKEN environment variable is not set. Add it in Netlify → Site settings → Environment variables.",
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

  try {
    const meRes = await request("/me");
    const meItems = collectionItems(meRes);
    if (!meItems.length) throw new Error("Could not load TeamSnap user profile.");
    const userId = itemToObj(meItems[0]).id;

    const teamsRes = await request(`/teams/search?user_id=${userId}`);
    const teams = collectionItems(teamsRes).map(itemToObj);

    const eventsByTeam = await Promise.all(
      teams.map(async (team) => {
        try {
          const res = await request(
            `/events/search?team_id=${team.id}&started_after=${encodeURIComponent(
              startedAfter
            )}&started_before=${encodeURIComponent(startedBefore)}`
          );
          return collectionItems(res)
            .map(itemToObj)
            .map((ev) => ({ ...ev, _team_name: team.name, _team_id: team.id }));
        } catch (e) {
          return [];
        }
      })
    );

    const allEvents = eventsByTeam.flat().filter((ev) => ev.is_game);

    const months = {};
    for (const ev of allEvents) {
      if (!ev.start_date) continue;
      const d = new Date(ev.start_date);
      const key = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!months[key]) months[key] = [];
      months[key].push({
        team: ev._team_name,
        name: ev.name || ev.opponent_name || "Game",
        opponent: ev.opponent_name || null,
        start: ev.start_date,
        location: ev.location_name || null,
        is_tbd: !!ev.is_tbd,
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
