const https = require("https");

const CLIENT_ID = process.env.TEAMSNAP_CLIENT_ID;
const CLIENT_SECRET = process.env.TEAMSNAP_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.TEAMSNAP_REFRESH_TOKEN;
const STATIC_TOKEN = process.env.TEAMSNAP_ACCESS_TOKEN;

let cachedAccessToken = "";
let cachedAccessTokenExpiresAt = 0;

function hasTeamSnapCredentials() {
  return Boolean(STATIC_TOKEN || (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN));
}

function httpsRequest({ hostname, path, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
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

async function getTeamSnapAccessToken() {
  if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
    if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt) {
      return cachedAccessToken;
    }

    const body =
      `grant_type=refresh_token` +
      `&refresh_token=${encodeURIComponent(REFRESH_TOKEN)}` +
      `&client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;

    const res = await httpsRequest({
      hostname: "auth.teamsnap.com",
      path: "/oauth/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        Accept: "application/json",
      },
      body,
    });

    if (res.statusCode >= 400) {
      throw new Error(`TeamSnap token refresh failed (${res.statusCode}): ${res.body.slice(0, 200)}`);
    }

    const json = JSON.parse(res.body);
    if (!json.access_token) throw new Error("TeamSnap token refresh did not return an access token");

    cachedAccessToken = json.access_token;
    cachedAccessTokenExpiresAt = Date.now() + Math.max(60, (json.expires_in || 3600) - 300) * 1000;
    return cachedAccessToken;
  }

  if (STATIC_TOKEN) return STATIC_TOKEN;
  throw new Error("TeamSnap credentials not configured");
}

module.exports = { getTeamSnapAccessToken, hasTeamSnapCredentials };
