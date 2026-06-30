const https = require("https");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const DEFAULT_PUBLIC_PROGRAM_IDS = [
  4835133, 4682970, 4681558, 4681552, 4681523, 4681502,
  4693014, 4681584, 4681581, 4681576, 4681483, 4681471,
];

function getAllowedProgramIds() {
  const raw = process.env.LEAGUEAPPS_PUBLIC_ROSTER_PROGRAM_IDS || "";
  const ids = raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Boolean);
  return new Set(ids.length ? ids : DEFAULT_PUBLIC_PROGRAM_IDS);
}

function normalizeRegistrations(data) {
  const registrations = Array.isArray(data) ? data : (data.registrations || []);
  return registrations
    .map((r) => ({
      id: r.registrationId || r.id || 0,
      firstName: r.firstName || "",
      lastName: r.lastName || "",
      jerseyNumber: r.jerseyNumber || r.uniform || "",
      teamName: r.teamName || "",
      gradYear: r.gradYear,
      status: r.status || "ACTIVE",
    }))
    .filter((r) => r.status === "ACTIVE");
}

function leagueAppsGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: "public.leagueapps.io",
        path,
        method: "GET",
        headers: { Accept: "application/json" },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          } else {
            reject(new Error(`LeagueApps ${res.statusCode}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("LeagueApps request timed out"));
    });
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const programId = Number(event.queryStringParameters?.programId);
  if (!programId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Missing programId" }) };
  }
  if (!getAllowedProgramIds().has(programId)) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: "Program roster is not public" }) };
  }

  const siteId = process.env.LEAGUEAPPS_SITE_ID || "55150";
  const apiKey = process.env.LEAGUEAPPS_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "LeagueApps env vars not configured" }) };
  }

  const qs = new URLSearchParams({ "la-api-key": apiKey }).toString();
  try {
    const data = await leagueAppsGet(`/v1/sites/${siteId}/programs/${programId}/registrations?${qs}`);
    return { statusCode: 200, headers: CORS, body: JSON.stringify(normalizeRegistrations(data)) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
