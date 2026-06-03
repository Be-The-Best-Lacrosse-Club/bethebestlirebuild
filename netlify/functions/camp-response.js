// camp-response.js
// Handles "Not Attending" and "Pay Now" link clicks from summer camp payment emails.
// URL params: ?row=<sheet_row>&action=not_attending|pay_now&player=<name>

const https = require("https");
const querystring = require("querystring");

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const CAMP_PAYMENT_URL = process.env.CAMP_PAYMENT_URL || "https://www.bethebestli.com/#programs";

function httpsPost(url, data, headers) {
  return new Promise((resolve, reject) => {
    const body = typeof data === "string" ? data : querystring.stringify(data);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: { "Content-Length": Buffer.byteLength(body), ...headers },
    };
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function httpsRequest(method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const bodyStr = body ? JSON.stringify(body) : "";
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        ...headers,
      },
    };
    const req = https.request(options, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.GOOGLE_CLIENT_ID}:${process.env.GOOGLE_CLIENT_SECRET}`
  ).toString("base64");
  const result = await httpsPost(
    "https://oauth2.googleapis.com/token",
    {
      grant_type: "refresh_token",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    },
    {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${creds}`,
    }
  );
  if (!result.access_token) throw new Error("Token refresh failed: " + JSON.stringify(result));
  return result.access_token;
}

async function updateSheet(accessToken, updates) {
  // updates = [{range, value}]
  const data = updates.map(({ range, value }) => ({
    range,
    values: [[value]],
  }));
  return httpsRequest(
    "POST",
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`,
    { valueInputOption: "USER_ENTERED", data },
    { Authorization: `Bearer ${accessToken}` }
  );
}

exports.handler = async (event) => {
  const { row, action, player } = event.queryStringParameters || {};

  if (!row || !action) {
    return { statusCode: 400, body: "Missing required parameters." };
  }

  const rowNum = parseInt(row, 10);
  if (isNaN(rowNum) || rowNum < 2 || rowNum > 1000) {
    return { statusCode: 400, body: "Invalid row." };
  }

  try {
    const token = await getAccessToken();
    const today = new Date().toISOString().slice(0, 10);

    if (action === "not_attending") {
      await updateSheet(token, [
        { range: `Registrants!N${rowNum}`, value: "Not Attending" },
        { range: `Registrants!R${rowNum}`, value: `Opted out via email link ${today}` },
      ]);
      return {
        statusCode: 302,
        headers: {
          Location: `https://www.bethebestli.com?camp=not-attending&name=${encodeURIComponent(player || "")}`,
        },
        body: "",
      };
    }

    if (action === "pay_now") {
      await updateSheet(token, [
        { range: `Registrants!N${rowNum}`, value: "Payment Link Sent" },
        { range: `Registrants!R${rowNum}`, value: `Payment link clicked ${today}` },
      ]);
      return {
        statusCode: 302,
        headers: { Location: CAMP_PAYMENT_URL },
        body: "",
      };
    }

    return { statusCode: 400, body: "Unknown action." };
  } catch (err) {
    console.error("camp-response error:", err);
    return {
      statusCode: 500,
      body: "Something went wrong. Please email info@bethebestli.com directly.",
    };
  }
};
