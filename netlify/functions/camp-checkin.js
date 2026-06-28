// BTB Summer Camp — mobile check-in + walk-up registration
// Writes to a dedicated "Camp Check-Ins" tab in the BTB Master Registrant Tracker.
// Pre-registered campers (already paid $300 / $240) check in by name.
// Walk-ups register on the spot ($350) — logged here, then sent to QuickBooks to pay.
// Self-creates the tab + header row if it does not exist yet.

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const TAB = "Camp Check-Ins";
const CAMP_EVENT = "Summer Camp - June 30-July 3 - Plainedge Park";
const WALKUP_AMOUNT = "350";

const HEADER = [
  "Timestamp", "Type", "Player Name", "Grad Year", "Gender", "Shirt Size",
  "Parent Name", "Email", "Phone", "Emergency Contact", "Emergency Phone",
  "DOB", "Amount ($)", "Payment Status", "Event / Notes",
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
  const encoded = `${encodeURIComponent(TAB)}!A1`;
  await sheetsFetch(accessToken, `/values/${encoded}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    body: { values: [HEADER] },
  });
}

async function appendRow(accessToken, row) {
  const encoded = `${encodeURIComponent(TAB)}!A:O`;
  await sheetsFetch(
    accessToken,
    `/values/${encoded}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: { values: [row] } }
  );
}

exports.handler = async (event) => {
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
    row = [now, "Checked In", playerName, "", "", "", "", "", "", "", "", "", "", "Pre-Registered", CAMP_EVENT];
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
