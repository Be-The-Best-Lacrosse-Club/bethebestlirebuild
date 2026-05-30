/**
 * GET /.netlify/functions/leads-list?formName=<optional>&limit=<optional>
 *
 * Reads recent submissions from the Airtable "Submissions" table populated by
 * brevo-relay. Powers the in-app /leads dashboard.
 *
 * Env vars (same as brevo-relay):
 *   AIRTABLE_FORMS_API_KEY (or fallback AIRTABLE_OPS_API_KEY)
 *   AIRTABLE_FORMS_BASE_ID
 *   AIRTABLE_FORMS_TABLE (default "Submissions")
 */

const https = require("https");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function airtableGet({ baseId, table, params }) {
  const apiKey = process.env.AIRTABLE_FORMS_API_KEY || process.env.AIRTABLE_OPS_API_KEY;
  const query = params
    ? "?" + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
    : "";
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: "api.airtable.com",
        path: `/v0/${baseId}/${encodeURIComponent(table)}${query}`,
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          } else {
            reject(new Error(`Airtable ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Airtable request timed out")); });
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: CORS, body: "" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const baseId = process.env.AIRTABLE_FORMS_BASE_ID;
  const table = process.env.AIRTABLE_FORMS_TABLE || "Submissions";
  const apiKey = process.env.AIRTABLE_FORMS_API_KEY || process.env.AIRTABLE_OPS_API_KEY;

  if (!baseId || !apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "Airtable env vars not configured" }) };
  }

  const params = (event.queryStringParameters || {});
  const limit = Math.min(Number(params.limit) || 100, 100);
  const formName = params.formName;

  const airtableParams = {
    pageSize: String(limit),
    "sort[0][field]": "Submitted At",
    "sort[0][direction]": "desc",
  };
  if (formName) airtableParams.filterByFormula = `{Form Name} = "${formName.replace(/"/g, '\\"')}"`;

  try {
    const data = await airtableGet({ baseId, table, params: airtableParams });
    const records = (data.records || []).map((r) => ({ id: r.id, ...r.fields }));
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ records }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
