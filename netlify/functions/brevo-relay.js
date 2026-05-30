/**
 * POST /.netlify/functions/brevo-relay
 *
 * Receives Netlify Forms outgoing webhook submissions and fans them out to:
 *   1. Brevo — create/update contact with form data as attributes
 *   2. Brevo — send transactional notification email to BREVO_NOTIFY_EMAIL
 *   3. Airtable — append a row to the submissions table (permanent archive)
 *
 * Configure in Netlify dashboard:
 *   Site config → Forms → Notifications → Outgoing webhook
 *   URL: https://www.bethebestli.com/.netlify/functions/brevo-relay
 *   Event: "New form submission"
 *
 * Required env vars (set in Netlify → Site config → Environment variables):
 *   BREVO_API_KEY            — Brevo "v3" API key
 *   BREVO_LIST_ID            — Default list to add contacts to (numeric id)
 *   BREVO_SENDER_EMAIL       — Verified sender in Brevo (e.g. info@bethebestli.com)
 *   BREVO_SENDER_NAME        — Sender display name (e.g. "BTB Website")
 *   BREVO_NOTIFY_EMAIL       — Where notifications land (e.g. info@bethebestli.com)
 *
 * Optional env vars:
 *   BREVO_LIST_NEWSLETTER    — Override list for form-name="newsletter"
 *   BREVO_LIST_INTEREST_FORM — Override list for form-name="interest-form"
 *   BREVO_LIST_TRYOUT        — Override list for form-name="tryout-interest" + registration forms
 *   AIRTABLE_FORMS_API_KEY   — Airtable PAT (falls back to AIRTABLE_OPS_API_KEY)
 *   AIRTABLE_FORMS_BASE_ID   — Base id for the submissions table
 *   AIRTABLE_FORMS_TABLE     — Table name (default: "Submissions")
 */

const https = require("https");

// ─── HTTP helper ──────────────────────────────────────────────────────────────

function httpsRequest({ host, path, method, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request({ host, path, method, headers }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`${host} request timed out`));
    });
    if (body) req.write(body);
    req.end();
  });
}

// ─── Brevo ────────────────────────────────────────────────────────────────────

function brevoListIdFor(formName) {
  const map = {
    newsletter: process.env.BREVO_LIST_NEWSLETTER,
    "interest-form": process.env.BREVO_LIST_INTEREST_FORM,
    "tryout-interest": process.env.BREVO_LIST_TRYOUT,
    "btb-boys-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-girls-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-east-boys-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "camp-registration": process.env.BREVO_LIST_TRYOUT,
    "positional-registration": process.env.BREVO_LIST_TRYOUT,
    "futures-registration": process.env.BREVO_LIST_TRYOUT,
    "futures-clinic-registration": process.env.BREVO_LIST_TRYOUT,
  };
  const listId = map[formName] || process.env.BREVO_LIST_ID;
  return listId ? Number(listId) : null;
}

function brevoAttributesFromSubmission(formName, data) {
  // Map common field names to Brevo's conventional attributes (FIRSTNAME, LASTNAME, SMS).
  // Anything else gets passed through verbatim so you can create custom attributes in Brevo.
  const attrs = { LASTFORM: formName, LASTSOURCE: data.source || "website" };

  const fullName = data.name || [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    attrs.FIRSTNAME = parts.shift() || "";
    attrs.LASTNAME = parts.join(" ");
  }
  if (data.parentName) attrs.PARENTNAME = data.parentName;
  if (data.phone) attrs.SMS = normalizePhone(data.phone);
  if (data.parentPhone) attrs.PARENTPHONE = normalizePhone(data.parentPhone);
  if (data.address) attrs.ADDRESS = data.address;
  if (data.gradYear) attrs.GRADYEAR = data.gradYear;
  if (data.gender) attrs.GENDER = data.gender;
  if (data.position) attrs.POSITION = data.position;
  if (data.currentClub) attrs.CURRENTCLUB = data.currentClub;
  if (data.interestCategory) attrs.INTEREST = data.interestCategory;
  if (data.interestProgram) attrs.INTEREST_PROGRAM = data.interestProgram;
  if (data.interestTeam) attrs.INTEREST_TEAM = data.interestTeam;
  if (data.requested_program) attrs.REQUESTED_PROGRAM = data.requested_program;

  return attrs;
}

function normalizePhone(raw) {
  if (!raw) return raw;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw;
}

async function brevoUpsertContact({ email, attributes, listId }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not set");
  if (!email) return { skipped: "no email" };

  const post = async (attrs) => {
    const body = JSON.stringify({
      email,
      attributes: attrs,
      listIds: listId ? [listId] : undefined,
      updateEnabled: true,
    });
    return httpsRequest({
      host: "api.brevo.com",
      path: "/v3/contacts",
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
        "content-length": Buffer.byteLength(body),
      },
      body,
    });
  };

  // 201 = created, 204 = updated (no body)
  const res = await post(attributes);
  if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status };

  // Brevo rejects unknown attributes with 400. Retry with only the standard ones
  // so contacts still land in the list even if custom attributes haven't been created.
  if (res.status === 400) {
    const SAFE = new Set(["FIRSTNAME", "LASTNAME", "SMS"]);
    const safeAttrs = Object.fromEntries(Object.entries(attributes).filter(([k]) => SAFE.has(k)));
    const retry = await post(safeAttrs);
    if (retry.status >= 200 && retry.status < 300) {
      return { ok: true, status: retry.status, retried: true, droppedAttrs: Object.keys(attributes).filter((k) => !SAFE.has(k)) };
    }
    throw new Error(`Brevo upsert ${retry.status} (after attr-stripped retry): ${retry.body.slice(0, 300)}`);
  }

  throw new Error(`Brevo contact upsert ${res.status}: ${res.body.slice(0, 300)}`);
}

async function brevoSendNotification({ formName, data, submissionTime, siteUrl }) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = {
    name: process.env.BREVO_SENDER_NAME || "BTB Website",
    email: process.env.BREVO_SENDER_EMAIL,
  };
  const to = (process.env.BREVO_NOTIFY_EMAIL || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  if (!apiKey || !sender.email || to.length === 0) {
    return { skipped: "brevo notification env vars missing" };
  }

  const rows = Object.entries(data)
    .filter(([k]) => !["ip", "user_agent", "referrer", "bot-field"].includes(k))
    .map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;text-transform:uppercase;font-size:12px;letter-spacing:1px">${escapeHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#111">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  const subject = `New ${prettyFormName(formName)} submission — ${data.name || data.parentName || data.email || "unknown"}`;
  const htmlContent = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;padding:24px;margin:0">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden">
    <div style="background:#D22630;color:#fff;padding:20px 28px">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;opacity:0.85">BTB Website Form</div>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:700">${escapeHtml(prettyFormName(formName))}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <div style="padding:16px 28px;color:#888;font-size:12px;background:#fafafa;border-top:1px solid #eee">
      Submitted ${escapeHtml(submissionTime || new Date().toISOString())} · ${escapeHtml(siteUrl || "bethebestli.com")}
    </div>
  </div>
</body></html>`.trim();

  const body = JSON.stringify({
    sender,
    to,
    replyTo: data.email ? { email: data.email, name: data.name || data.email } : undefined,
    subject,
    htmlContent,
  });

  const res = await httpsRequest({
    host: "api.brevo.com",
    path: "/v3/smtp/email",
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
      "content-length": Buffer.byteLength(body),
    },
    body,
  });

  if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status };
  throw new Error(`Brevo notification ${res.status}: ${res.body.slice(0, 300)}`);
}

function prettyFormName(formName) {
  return String(formName || "form")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Airtable ─────────────────────────────────────────────────────────────────

async function airtableAppend({ formName, data, submissionTime, siteUrl }) {
  const apiKey = process.env.AIRTABLE_FORMS_API_KEY || process.env.AIRTABLE_OPS_API_KEY;
  const baseId = process.env.AIRTABLE_FORMS_BASE_ID;
  const table = process.env.AIRTABLE_FORMS_TABLE || "Submissions";

  if (!apiKey || !baseId) return { skipped: "airtable env vars missing" };

  // Stringify the full submission payload — the Airtable table only needs core columns,
  // and the raw JSON keeps every field around for later inspection.
  const fields = {
    "Form Name": formName,
    Name: data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || data.parentName || "",
    Email: data.email || data.parentEmail || "",
    Phone: data.phone || data.parentPhone || "",
    Subject: data.subject || "",
    Message: data.message || data.notes || data.experience || "",
    "Submitted At": submissionTime || new Date().toISOString(),
    "Site URL": siteUrl || "",
    "Raw Payload": JSON.stringify(data),
  };

  const body = JSON.stringify({ records: [{ fields }], typecast: true });

  const res = await httpsRequest({
    host: "api.airtable.com",
    path: `/v0/${baseId}/${encodeURIComponent(table)}`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body),
    },
    body,
  });

  if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status };
  throw new Error(`Airtable append ${res.status}: ${res.body.slice(0, 300)}`);
}

// ─── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  // Netlify's outgoing webhook payload shape:
  // { form_name, data: {...}, created_at, site_url, ... }
  const formName = payload.form_name || payload.formName || "unknown";
  const data = payload.data || payload.fields || payload;
  const submissionTime = payload.created_at || new Date().toISOString();
  const siteUrl = payload.site_url || "https://www.bethebestli.com";

  const results = { formName, brevoContact: null, brevoEmail: null, airtable: null, errors: [] };

  // Brevo: upsert contact
  try {
    const email = data.email || data.parentEmail;
    if (email) {
      const listId = brevoListIdFor(formName);
      const attributes = brevoAttributesFromSubmission(formName, data);
      results.brevoContact = await brevoUpsertContact({ email, attributes, listId });
    } else {
      results.brevoContact = { skipped: "no email in submission" };
    }
  } catch (err) {
    console.error("brevo-relay contact error:", err.message);
    results.errors.push(`brevo contact: ${err.message}`);
  }

  // Brevo: notification email
  try {
    results.brevoEmail = await brevoSendNotification({ formName, data, submissionTime, siteUrl });
  } catch (err) {
    console.error("brevo-relay email error:", err.message);
    results.errors.push(`brevo email: ${err.message}`);
  }

  // Airtable: append row
  try {
    results.airtable = await airtableAppend({ formName, data, submissionTime, siteUrl });
  } catch (err) {
    console.error("brevo-relay airtable error:", err.message);
    results.errors.push(`airtable: ${err.message}`);
  }

  // Always 200 so Netlify doesn't retry — partial success is recorded in the response body
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results),
  };
};
