const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const SHEET_NAME = "Futures Coaches";

const COACHES = [
  ["Dan Achatz", "Owner / Head Coach"],
  ["Sean Reynolds", "Boys Director"],
  ["Brad McLam", "Head Coach"],
  ["Marisa D'Angelo", "Head Coach"],
  ["Aidan DeRupo", "Goalie Trainer"],
  ["Alex Leggio", "Assistant Coach"],
  ["Alexa Adduci", "Assistant Coach"],
  ["Antonina Buscemi", "Assistant Coach"],
  ["Ava Hernandez", "Assistant Coach"],
  ["Brian Gubelli", "Assistant Coach"],
  ["Brian Himberger", "Head Coach"],
  ["Chris Lehmann", "Assistant Coach"],
  ["Chris Rumfield", "Assistant Coach"],
  ["Meg Gordon", "Co-Head Coach"],
  ["Dan Sciulla", "Assistant Coach"],
  ["Danielle Carson", "Co-Head Coach"],
  ["Emma Mclam", "Assistant Coach"],
  ["Erynn Rocovich", "Head Coach"],
  ["Frank Ingenito", "Head Coach"],
  ["Hunter Isnardi", "Assistant Coach"],
  ["Jaclyn Jackowski", "Assistant Coach"],
  ["Jake Oemcke", "Assistant Coach"],
  ["James Rao", "Assistant Coach"],
  ["Jeff Schaefer", "Assistant Coach"],
  ["JT Prior", "Assistant Coach"],
  ["Juliana Keenan", "Assistant Coach"],
  ["Kaitlyn Meyer", "Assistant Coach"],
  ["Katie Dascher", "Assistant Coach"],
  ["Kerrin Heuser", "Assistant Coach"],
  ["Krista Ancona", "Assistant Coach"],
  ["Leif Blomquist", "Assistant Coach"],
  ["Lily Bilello", "Assistant Coach"],
  ["Mike Guercio", "Futures Director / Assistant Coach"],
  ["Nick Defelice", "Assistant Coach"],
  ["Nick Ebel", "Assistant Coach"],
  ["Nick Nicolosi", "Assistant Coach"],
  ["Pat Frazer", "Assistant Coach"],
  ["Peter Ferrizz", "BTB Operations / Assistant Coach"],
  ["Peter Hespe", "Assistant Coach"],
  ["Rob Valdez", "Assistant Coach"],
  ["Ryan O'Neill", "Assistant Coach"],
  ["Ryan Quinn", "Assistant Coach"],
  ["Ryan Smith", "Assistant Coach"],
  ["Scott Bryan", "Assistant Coach"],
  ["Steven Romano", "Assistant Coach"],
  ["Tara Babnik", "Co-Head Coach"],
  ["Tommy Brewer", "Assistant Coach"],
];

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nowEt() {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
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

async function googleJson(accessToken, url, options = {}) {
  const resp = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.error?.message || `Google request failed: ${resp.status}`);
  return body;
}

function valuesUrl(range, action = "", query = "") {
  const encoded = encodeURIComponent(range).replace(/%21/g, "!");
  return `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encoded}${action ? `:${action}` : ""}${query}`;
}

async function ensureSheet(accessToken) {
  const metadata = await googleJson(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`
  );
  const exists = (metadata.sheets || []).some((sheet) => sheet.properties?.title === SHEET_NAME);
  if (exists) return;

  await googleJson(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`,
    {
      method: "POST",
      body: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    }
  );
}

async function getRows(accessToken) {
  const data = await googleJson(accessToken, valuesUrl(`${SHEET_NAME}!A:F`));
  return Array.isArray(data.values) ? data.values : [];
}

async function seedRoster(accessToken, rows) {
  if (rows.length > 1) return;
  const seededAt = nowEt();
  const values = [
    ["Coach Name", "Role", "Available", "Updated At", "Source", "Note"],
    ...COACHES.map(([name, role]) => [name, role, "", "", "Roster", seededAt]),
  ];
  await googleJson(
    accessToken,
    valuesUrl(`${SHEET_NAME}!A:F`, "", "?valueInputOption=USER_ENTERED"),
    { method: "PUT", body: { values } }
  );
}

function rosterFromRows(rows) {
  const lookup = new Map();
  rows.slice(1).forEach((row, index) => {
    lookup.set(normalize(row[0]), { row, rowIndex: index + 2 });
  });

  return COACHES.map(([name, role]) => {
    const found = lookup.get(normalize(name));
    const row = found?.row || [];
    return {
      name,
      role,
      available: String(row[2] || "").toUpperCase() === "YES",
      updated_at: row[3] || "",
    };
  });
}

async function markCoach(accessToken, coachName, available) {
  const rows = await getRows(accessToken);
  await seedRoster(accessToken, rows);
  const freshRows = rows.length > 1 ? rows : await getRows(accessToken);
  const normalized = normalize(coachName);
  let rowIndex = -1;
  let role = "";

  freshRows.slice(1).forEach((row, index) => {
    if (normalize(row[0]) === normalized) {
      rowIndex = index + 2;
      role = row[1] || "";
    }
  });

  const timestamp = nowEt();
  if (rowIndex === -1) {
    await googleJson(
      accessToken,
      valuesUrl(`${SHEET_NAME}!A:F`, "append", "?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS"),
      {
        method: "POST",
        body: { values: [[coachName, role, available ? "YES" : "", timestamp, "Coach Signup Page", "Added from page"]] },
      }
    );
  } else {
    await googleJson(
      accessToken,
      valuesUrl(`${SHEET_NAME}!C${rowIndex}:F${rowIndex}`, "", "?valueInputOption=USER_ENTERED"),
      {
        method: "PUT",
        body: { values: [[available ? "YES" : "", timestamp, "Coach Signup Page", available ? "Available" : "Cleared"]] },
      }
    );
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const accessToken = await getAccessToken();
    await ensureSheet(accessToken);

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const coachName = String(payload.coach_name || "").trim();
      const available = payload.available !== false;
      if (!coachName) return json(400, { ok: false, error: "Missing coach name" });
      await markCoach(accessToken, coachName, available);
    }

    const rows = await getRows(accessToken);
    await seedRoster(accessToken, rows);
    const currentRows = rows.length > 1 ? rows : await getRows(accessToken);
    const roster = rosterFromRows(currentRows);
    const count = roster.filter((coach) => coach.available).length;

    return json(200, { ok: true, count, roster });
  } catch (err) {
    console.error("futures-coach-availability error:", err.message);
    return json(500, { ok: false, error: "Could not update the Futures Coaches sheet." });
  }
};
