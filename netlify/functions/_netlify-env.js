import https from "node:https";

const NETLIFY_API_TOKEN = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN || "";
const NETLIFY_ACCOUNT_ID = process.env.NETLIFY_ACCOUNT_ID || "";
const NETLIFY_SITE_IDS = [
  process.env.BTB_OS_NETLIFY_SITE_ID,
  process.env.BTB_WEBSITE_NETLIFY_SITE_ID,
].filter(Boolean);
const NETLIFY_CONTEXTS = ["production", "deploy-preview", "branch-deploy"];
const NETLIFY_SCOPES = ["builds", "functions", "runtime"];

function httpsRequest({ hostname, path, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Netlify API request timed out"));
    });
    if (body) req.write(body);
    req.end();
  });
}

async function netlifyRequest(path, method = "GET", body = null) {
  if (!NETLIFY_API_TOKEN) throw new Error("NETLIFY_API_TOKEN is not configured");

  const payload = body == null ? null : JSON.stringify(body);
  const res = await httpsRequest({
    hostname: "api.netlify.com",
    path,
    method,
    headers: {
      Authorization: `Bearer ${NETLIFY_API_TOKEN}`,
      Accept: "application/json",
      ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
    },
    body: payload,
  });

  if (res.statusCode >= 400) {
    throw new Error(`Netlify API ${res.statusCode}: ${String(res.body || "").slice(0, 220)}`);
  }

  return res.body ? JSON.parse(res.body) : null;
}

async function createEnvVar(siteId, key, value) {
  const values = NETLIFY_CONTEXTS.map((context) => ({ context, value }));
  await netlifyRequest(
    `/api/v1/accounts/${encodeURIComponent(NETLIFY_ACCOUNT_ID)}/env?site_id=${encodeURIComponent(siteId)}`,
    "POST",
    [{ key, is_secret: true, scopes: NETLIFY_SCOPES, values }],
  );
}

async function setEnvValue(siteId, key, value) {
  for (const context of NETLIFY_CONTEXTS) {
    const path =
      `/api/v1/accounts/${encodeURIComponent(NETLIFY_ACCOUNT_ID)}/env/${encodeURIComponent(key)}` +
      `?site_id=${encodeURIComponent(siteId)}`;
    const payload = JSON.stringify({ context, value });
    const res = await httpsRequest({
      hostname: "api.netlify.com",
      path,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NETLIFY_API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      body: payload,
    });

    if (res.statusCode === 404) {
      await createEnvVar(siteId, key, value);
      return;
    }

    if (res.statusCode >= 400) {
      throw new Error(`Netlify API ${res.statusCode}: ${String(res.body || "").slice(0, 220)}`);
    }
  }
}

async function triggerBuild(siteId) {
  await netlifyRequest(`/api/v1/sites/${encodeURIComponent(siteId)}/builds`, "POST", {});
}

async function storeTeamSnapTokens(tokens) {
  if (!NETLIFY_ACCOUNT_ID || NETLIFY_SITE_IDS.length < 2) {
    throw new Error("Netlify project IDs are not configured");
  }

  const updates = [];
  if (tokens.access_token) updates.push(["TEAMSNAP_ACCESS_TOKEN", tokens.access_token]);
  if (tokens.refresh_token) updates.push(["TEAMSNAP_REFRESH_TOKEN", tokens.refresh_token]);
  if (tokens.access_token && tokens.expires_in) {
    const expiresAt = new Date(Date.now() + Number(tokens.expires_in) * 1000).toISOString();
    updates.push(["TEAMSNAP_ACCESS_TOKEN_EXPIRES_AT", expiresAt]);
  }
  if (updates.length === 0) throw new Error("TeamSnap did not return a token");

  for (const siteId of NETLIFY_SITE_IDS) {
    for (const [key, value] of updates) {
      await setEnvValue(siteId, key, value);
    }
    await triggerBuild(siteId);
  }

  return {
    siteCount: NETLIFY_SITE_IDS.length,
    stored: updates.map(([key]) => key),
  };
}

export { storeTeamSnapTokens };
