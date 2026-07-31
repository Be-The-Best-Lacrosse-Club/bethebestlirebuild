// BTB Summer Camp — mobile check-in + walk-up registration
// Writes to a dedicated "Camp Check-Ins" tab in the BTB Master Registrant Tracker.
// Check-in matches the camper name against the live "camp-registration" Netlify Forms
// roster (the real pre-registered list) and flags pre-registered vs not-found.
// Walk-ups register on the spot ($350) — logged here, then sent to QuickBooks to pay.
// Self-creates the tab + header row if it does not exist yet.

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const TAB = "Camp Check-Ins";
const CAMP_EVENT = "Summer Camp - June 30-July 3 - Plainedge Park";
const WALKUP_AMOUNT = "350";
const CAMP_FORM_ID = "69f4c0032e7f520008e1b766"; // Netlify "camp-registration" form

const HEADER = [
  "Timestamp", "Type", "Player Name", "Grad Year", "Gender", "Shirt Size",
  "Parent Name", "Email", "Phone", "Emergency Contact", "Emergency Phone",
  "DOB", "Amount ($)", "Status", "Event / Notes",
];

function response(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Token-based name match: every token of the typed name must appear in the roster name.
function sameName(input, existing) {
  const a = normalizeName(input);
  const b = normalizeName(existing);
  if (!a || !b) return false;
  if (a === b) return true;
  const aTokens = a.split(" ").filter(Boolean);
  const bTokens = b.split(" ").filter(Boolean);
  if (aTokens.length < 2) return false;
  return aTokens.every((token) => bTokens.includes(token));
}

async function getAccessToken() {
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  const tokenJson = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok || !tokenJson.access_token) throw new Error("Google auth failed");
  return tokenJson.access_token;
}

async function sheetsFetch(accessToken, path, options = {}) {
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`, {
    method: options.method || "GET",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.error?.message || `Sheets request failed: ${resp.status}`);
  return body;
}

async function ensureTab(accessToken) {
  const meta = await sheetsFetch(accessToken, "?fields=sheets.properties.title");
  const titles = (meta.sheets || []).map((s) => s.properties?.title);
  if (titles.includes(TAB)) return;
  await sheetsFetch(accessToken, ":batchUpdate", {
    method: "POST",
    body: { requests: [{ addSheet: { properties: { title: TAB } } }] },
  });
  await sheetsFetch(accessToken, `/values/${encodeURIComponent(TAB)}!A1?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: { values: [HEADER] },
  });
}

async function appendRow(accessToken, row) {
  await sheetsFetch(
    accessToken,
    `/values/${encodeURIComponent(TAB)}!A:O:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: { values: [row] } }
  );
}

// Live pre-registered roster from the camp-registration Netlify form.
async function fetchCampRoster() {
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("NETLIFY_API_TOKEN not configured");
  const names = [];
  for (let page = 1; page <= 6; page += 1) {
    const resp = await fetch(
      `https://api.netlify.com/api/v1/forms/${CAMP_FORM_ID}/submissions?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );
    if (!resp.ok) throw new Error(`Netlify forms ${resp.status}`);
    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const sub of batch) {
      const d = sub.data || {};
      const full = clean(`${d.player_first_name || ""} ${d.player_last_name || ""}`);
      if (full) names.push(full);
    }
    if (batch.length < 100) break;
  }
  return names;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return response(204, {});
  if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Method not allowed" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { ok: false, error: "Invalid JSON" });
  }

  const mode = payload.mode === "walkup" ? "walkup" : "checkin";
  const dryRun = payload.dry_run === true;
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  let row;
  let matched = null;
  let rosterSize = null;

  if (mode === "walkup") {
    const playerName = clean(`${payload.player_first || ""} ${payload.player_last || ""}`);
    const email = clean(payload.email);
    const phone = clean(payload.phone);
    if (playerName.length < 3 || !email || !phone) {
      return response(400, { ok: false, error: "Player name, email, and phone are required." });
    }
    row = [
      now, "Walk-Up", playerName, clean(payload.grad_year), clean(payload.gender),
      clean(payload.shirt_size), clean(payload.parent_name), email, phone,
      clean(payload.emergency_name), clean(payload.emergency_phone), clean(payload.dob),
      WALKUP_AMOUNT, "Payment Pending", CAMP_EVENT,
    ];
  } else {
    const playerName = clean(payload.player_name);
    if (playerName.length < 3) {
      return response(400, { ok: false, error: "Enter the player's name." });
    }
    // Read-only roster match — never blocks check-in if it fails.
    try {
      const roster = await fetchCampRoster();
      rosterSize = roster.length;
      matched = roster.some((name) => sameName(playerName, name));
    } catch (err) {
      console.warn("camp-checkin roster match skipped:", err.message);
    }
    const status =
      matched === true ? "Pre-Registered ✓" :
      matched === false ? "⚠ Not found in pre-reg" :
      "Checked In";
    row = [now, "Checked In", playerName, "", "", "", "", "", "", "", "", "", "", status, CAMP_EVENT];
  }

  try {
    const accessToken = await getAccessToken();
    if (!dryRun) {
      await ensureTab(accessToken);
      await appendRow(accessToken, row);
    }
    return response(200, {
      ok: true,
      status: mode === "walkup" ? "walkup_logged" : "checked_in",
      matched,
      roster_size: rosterSize,
      dry_run: dryRun,
    });
  } catch (err) {
    console.error("camp-checkin error:", err.message);
    return response(500, {
      ok: false,
      error: "Could not reach the Google Sheet. Try again or tell staff.",
    });
  }
};
