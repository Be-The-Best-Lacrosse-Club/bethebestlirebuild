const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const SHEET_NAME = "Clinic RSVPs";
const CLINIC_LOCATION = "June 28 - Seaford High School - 9:00-11:00 AM";
const CHECKED_IN = "✅ Checked In";

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

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function isCheckedIn(row) {
  return String(row[8] || "").toLowerCase().includes("checked");
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
  if (!tokenResp.ok || !tokenJson.access_token) {
    throw new Error("Google auth failed");
  }
  return tokenJson.access_token;
}

async function sheetsRequest(accessToken, range, options = {}) {
  const encodedRange = encodeURIComponent(range).replace(/%21/g, "!");
  const action = options.action ? `:${options.action}` : "";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedRange}${action}${options.query || ""}`;
  const resp = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(body.error?.message || `Sheets request failed: ${resp.status}`);
  }
  return body;
}

function findMatch(rows, playerName) {
  let fallback = null;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const existingName = row[2] || "";
    if (!sameName(playerName, existingName)) continue;

    const match = { rowIndex: i + 1, row };
    if (!isCheckedIn(row)) return match;
    if (!fallback) fallback = match;
  }

  return fallback;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return response(204, {});
  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { ok: false, error: "Invalid JSON" });
  }

  const playerName = String(payload.player_name || "").replace(/\s+/g, " ").trim();
  const dryRun = payload.dry_run === true;
  if (normalizeName(playerName).length < 3) {
    return response(400, { ok: false, error: "Enter the player's name." });
  }

  const checkedAt = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  try {
    const accessToken = await getAccessToken();
    const current = await sheetsRequest(accessToken, `${SHEET_NAME}!A:L`);
    const rows = Array.isArray(current.values) ? current.values : [];
    const match = findMatch(rows, playerName);

    if (match) {
      if (!dryRun) {
        await sheetsRequest(accessToken, `${SHEET_NAME}!I${match.rowIndex}:L${match.rowIndex}`, {
          method: "PUT",
          query: "?valueInputOption=USER_ENTERED",
          body: { values: [[CHECKED_IN, checkedAt, "QR Check-In", playerName]] },
        });
      }

      return response(200, {
        ok: true,
        status: isCheckedIn(match.row) ? "already_checked_in" : "matched",
        message: isCheckedIn(match.row)
          ? "Player was already checked in."
          : "Matched registration and checked in.",
        dry_run: dryRun,
      });
    }

    return response(404, {
      ok: false,
      status: "not_found",
      message: "Player was not found. Complete the registration form first, then check in again.",
      dry_run: dryRun,
    });
  } catch (err) {
    console.error("futures-clinic-checkin error:", err.message);
    return response(500, {
      ok: false,
      error: "Check-in could not reach the Google Sheet. Try again or tell staff.",
    });
  }
};
