// camp-response.js
// Handles "Not Attending" and "Pay Now" link clicks from summer camp payment emails.
// URL params: ?row=<sheet_row>&action=not_attending|pay_now&player=<name>

import https from "node:https";

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const CAMP_PAYMENT_URL = process.env.CAMP_PAYMENT_URL ||
  "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-1435d07c4e4244bca62765520c1a9168d86972f13c7f4e62b183da56e129c5038557bd7ed87d4922b8d1c13598c7c3f8?locale=EN_US&cta=paylinkbuybutton";

function post(url, formData, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const body = Object.entries(formData)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        ...extraHeaders,
      },
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function sheetsRequest(method, path, accessToken, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : "";
    const opts = {
      hostname: "sheets.googleapis.com",
      path,
      method,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    });
    req.on("error", reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function getAccessToken() {
  // Google OAuth token refresh — client_id/secret go in the POST body, NOT Basic auth
  const result = await post("https://oauth2.googleapis.com/token", {
    client_id:     process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type:    "refresh_token",
  });
  if (!result.access_token) {
    throw new Error("Token refresh failed: " + JSON.stringify(result));
  }
  return result.access_token;
}

async function updateSheet(accessToken, updates) {
  const data = updates.map(({ range, value }) => ({ range, values: [[value]] }));
  const path = `/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`;
  return sheetsRequest("POST", path, accessToken, {
    valueInputOption: "USER_ENTERED",
    data,
  });
}

export const handler = async (event) => {
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
    console.error("camp-response error:", err.message);
    return {
      statusCode: 500,
      body: "Something went wrong. Please email info@bethebestli.com directly.",
    };
  }
};
