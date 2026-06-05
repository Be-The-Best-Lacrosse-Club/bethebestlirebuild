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
 *   AIRTABLE_FORMS_BASE_ID   — Base id (default target: BTB-OS = appGAETGobQBTwf7j)
 *   AIRTABLE_FORMS_TABLE     — Table name (default: "Leads" — the existing BTB-OS lead workflow)
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
  const table = process.env.AIRTABLE_FORMS_TABLE || "Leads";

  if (!apiKey || !baseId) return { skipped: "airtable env vars missing" };

  // Maps to the existing BTB-OS "Leads" table so submissions land directly in
  // the lead workflow (Status, Assigned Staff, Follow-up Logs already wired up).
  // typecast: true lets Airtable auto-create new singleSelect choices for Source.
  const fields = {
    "Lead Name": data.name || [data.firstName, data.lastName].filter(Boolean).join(" ") || data.parentName || data.email || "(no name)",
    "Contact Email": data.email || data.parentEmail || "",
    "Contact Phone": data.phone || data.parentPhone || "",
    "Submission Date": submissionTime || new Date().toISOString(),
    Source: formName,
    Subject: data.subject || data.interestCategory || "",
    Notes: data.message || data.notes || data.experience || "",
    "Site URL": siteUrl || "",
    "Raw Payload": JSON.stringify(data, null, 2),
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

// ─── Registrant Confirmation Email ────────────────────────────────────────────

const BOYS_FLYER = "https://www.bethebestli.com/images/tryouts/BTB_Boys_Futures_June_Clinic.jpg";
const GIRLS_FLYER = "https://www.bethebestli.com/images/tryouts/BTB_Girls_Futures_June_Clinic.jpg";

// Per-form confirmation config. Add new programs here as they're created.
const CONFIRMATION_CONFIG = {
  "futures-clinic-registration": {
    subject: (data) => `You're Registered — BTB ${data.program_gender || ""}  Futures Clinic | June 18 & 28`,
    getHtml: (data) => {
      const gender = (data.program_gender || "Boys").trim();
      const parentFirst = (data.parent_first_name || "BTB Family").trim();
      const playerFirst = (data.player_first_name || "").trim();
      const playerLast = (data.player_last_name || "").trim();
      const playerName = [playerFirst, playerLast].filter(Boolean).join(" ") || "your player";
      const flyerUrl = gender.toLowerCase() === "girls" ? GIRLS_FLYER : BOYS_FLYER;
      return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-bottom:3px solid #D22630;">
    <tr><td style="padding:24px 20px;text-align:center;">
      <p style="margin:0 0 6px;color:#D22630;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">BE THE BEST LACROSSE CLUB</p>
      <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:2px;text-transform:uppercase;font-weight:900;">You're Registered!</h1>
      <p style="margin:8px 0 0;color:#D22630;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${gender} Futures — June Free Clinic Series</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="padding:28px 24px 0;background:#111;">
      <p style="font-size:16px;color:#ccc;line-height:1.7;margin:0 0 24px;">
        Hi ${parentFirst},<br><br>
        We have <strong style="color:#fff;">${playerName}</strong> locked in for the BTB ${gender} Futures Free Clinic Series this June. See the flyer below for all the details — and please share it with a friend! <strong style="color:#fff;">Spots are limited and filling fast.</strong>
      </p>
    </td></tr>
    <tr><td style="padding:0 24px;background:#111;">
      <a href="https://www.bethebestli.com/futures-clinic" style="display:block;">
        <img src="${flyerUrl}" alt="BTB ${gender} Futures June Free Clinic Series" width="100%" style="display:block;border-radius:8px;max-width:552px;" />
      </a>
    </td></tr>
    <tr><td style="padding:24px 24px 40px;background:#111;">
      <div style="background:#1a1a1a;border-left:3px solid #D22630;border-radius:6px;padding:20px 22px;margin-bottom:22px;">
        <p style="color:#D22630;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px;">CLINIC DATES & LOCATIONS</p>
        <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 2px;">📍 Clinic 1 — June 18</p>
        <p style="color:#ccc;font-size:14px;margin:0 0 4px;">6:00 – 8:00 PM</p>
        <p style="color:#aaa;font-size:13px;margin:0 0 18px;">Stimson Middle School, Huntington NY</p>
        <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 2px;">📍 Clinic 2 — June 28</p>
        <p style="color:#ccc;font-size:14px;margin:0 0 4px;">9:00 – 11:00 AM</p>
        <p style="color:#aaa;font-size:13px;margin:0;">Seaford High School, Seaford NY</p>
      </div>
      <div style="background:#1a0a0b;border:1px solid #D22630;border-radius:6px;padding:20px 22px;margin-bottom:24px;text-align:center;">
        <p style="color:#D22630;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">KNOW SOMEONE WHO SHOULD JOIN?</p>
        <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 16px;">This clinic is 100% free — bring a teammate, a neighbor, a friend. Forward this email or send them the link to grab their spot before it fills up.</p>
        <a href="https://www.bethebestli.com/futures-clinic" style="display:inline-block;background:#D22630;color:#fff;text-decoration:none;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;border-radius:6px;">INVITE A FRIEND — REGISTER FREE</a>
      </div>
      <div style="background:#1a1a1a;border-left:3px solid #333;border-radius:6px;padding:18px 22px;margin-bottom:24px;">
        <p style="color:#D22630;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">WHAT TO EXPECT</p>
        <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0;">
          ✅ Coached by BTB ${gender} Futures staff and players<br>
          ✅ Stickwork fundamentals + fun drills (K–2nd grade)<br>
          ✅ Q&A with coaches — kids ask, coaches answer<br>
          ✅ Exclusive info shared only with registered families<br>
          ✅ No prior experience needed
        </p>
      </div>
      <p style="font-size:13px;color:#777;line-height:1.7;margin:0 0 24px;text-align:center;">Wear athletic clothes and bring a stick if you have one — no worries if not.<br>We'll send field, gear, and weather updates closer to each date.</p>
      <p style="font-size:13px;color:#555;text-align:center;margin:0;">Questions? Reply to this email or reach us at <a href="mailto:info@bethebestli.com" style="color:#D22630;text-decoration:none;">info@bethebestli.com</a></p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-top:1px solid #1a1a1a;">
    <tr><td style="padding:20px;text-align:center;">
      <p style="margin:0 0 6px;color:#555;font-size:12px;">Be The Best Lacrosse Club — Long Island, NY</p>
      <p style="margin:0;color:#555;font-size:12px;">
        <a href="https://www.bethebestli.com" style="color:#D22630;text-decoration:none;">bethebestli.com</a> &nbsp;|&nbsp;
        <a href="https://instagram.com/bethebestli" style="color:#D22630;text-decoration:none;">@bethebestli</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
    },
  },
  "camp-registration": {
    subject: () => "You're Registered — BTB Summer Camp 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerFirst = (data.player_first_name || "").trim();
      const playerLast = (data.player_last_name || "").trim();
      const playerName = [playerFirst, playerLast].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Summer Camp", details: "We'll follow up with camp schedule, what to bring, and daily logistics closer to the start date.", cta: "VIEW CAMP INFO", ctaUrl: "https://www.bethebestli.com/camps" });
    },
  },
  "positional-registration": {
    subject: () => "You're Registered — BTB Positional Camp 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Positional Camp", details: "We'll send session times, location details, and what to bring closer to the date.", cta: "VIEW CAMP INFO", ctaUrl: "https://www.bethebestli.com/camps" });
    },
  },
  "btb-boys-tryout-registration": {
    subject: () => "You're Registered — BTB Boys Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Boys Tryouts 2026", details: "Tryout times are assigned by grad year. We'll send your specific time slot and location details shortly.", cta: "TRYOUT INFO", ctaUrl: "https://www.bethebestli.com/tryouts" });
    },
  },
  "btb-girls-tryout-registration": {
    subject: () => "You're Registered — BTB Girls Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Girls Tryouts 2026", details: "Tryout times are assigned by grad year. We'll send your specific time slot and location details shortly.", cta: "TRYOUT INFO", ctaUrl: "https://www.bethebestli.com/tryouts" });
    },
  },
  "btb-east-boys-tryout-registration": {
    subject: () => "You're Registered — BTB East Boys Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB East Boys Tryouts 2026", details: "Location: St. Joseph's University New York — Suffolk Campus, 155 West Roe Blvd, Patchogue, NY 11772. We'll send your specific time slot closer to the date.", cta: "TRYOUT INFO", ctaUrl: "https://www.bethebestli.com/tryouts" });
    },
  },
};

function confirmationBase({ parentFirst, playerName, program, details, cta, ctaUrl }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-bottom:3px solid #D22630;">
    <tr><td style="padding:24px 20px;text-align:center;">
      <p style="margin:0 0 6px;color:#D22630;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">BE THE BEST LACROSSE CLUB</p>
      <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:2px;text-transform:uppercase;font-weight:900;">You're Registered!</h1>
      <p style="margin:8px 0 0;color:#D22630;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(program)}</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="padding:32px 24px 40px;background:#111;">
      <p style="font-size:16px;color:#ccc;line-height:1.7;margin:0 0 24px;">
        Hi ${escapeHtml(parentFirst)},<br><br>
        We have <strong style="color:#fff;">${escapeHtml(playerName)}</strong> registered for <strong style="color:#fff;">${escapeHtml(program)}</strong>. We're looking forward to seeing them on the field!
      </p>
      <div style="background:#1a1a1a;border-left:3px solid #D22630;border-radius:6px;padding:20px 22px;margin-bottom:24px;">
        <p style="color:#D22630;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">WHAT'S NEXT</p>
        <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0;">${escapeHtml(details)}</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:center;padding:4px 0 24px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#D22630;color:#fff;text-decoration:none;font-size:14px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:16px 32px;border-radius:6px;">${escapeHtml(cta)}</a>
        </td></tr>
      </table>
      <p style="font-size:13px;color:#555;text-align:center;margin:0;">Questions? Reply to this email or reach us at <a href="mailto:info@bethebestli.com" style="color:#D22630;text-decoration:none;">info@bethebestli.com</a></p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-top:1px solid #1a1a1a;">
    <tr><td style="padding:20px;text-align:center;">
      <p style="margin:0 0 6px;color:#555;font-size:12px;">Be The Best Lacrosse Club — Long Island, NY</p>
      <p style="margin:0;color:#555;font-size:12px;">
        <a href="https://www.bethebestli.com" style="color:#D22630;text-decoration:none;">bethebestli.com</a> &nbsp;|&nbsp;
        <a href="https://instagram.com/bethebestli" style="color:#D22630;text-decoration:none;">@bethebestli</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

async function brevoSendConfirmation({ formName, data }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "BTB Lacrosse";

  const config = CONFIRMATION_CONFIG[formName];
  if (!config) return { skipped: `no confirmation template for ${formName}` };

  const toEmail = data.parent_email || data.email;
  const toName = data.parent_first_name || data.name || toEmail;
  if (!toEmail) return { skipped: "no registrant email" };
  if (!apiKey || !senderEmail) return { skipped: "brevo env vars missing" };

  const subject = config.subject(data);
  const htmlContent = config.getHtml(data);

  const body = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName }],
    replyTo: { email: senderEmail },
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

  if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status, to: toEmail };
  throw new Error(`Brevo confirmation ${res.status}: ${res.body.slice(0, 300)}`);
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

  const results = { formName, brevoContact: null, brevoEmail: null, brevoConfirmation: null, airtable: null, errors: [] };

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

  // Brevo: notification email to Dan
  try {
    results.brevoEmail = await brevoSendNotification({ formName, data, submissionTime, siteUrl });
  } catch (err) {
    console.error("brevo-relay email error:", err.message);
    results.errors.push(`brevo email: ${err.message}`);
  }

  // Brevo: confirmation email to registrant
  try {
    results.brevoConfirmation = await brevoSendConfirmation({ formName, data });
  } catch (err) {
    console.error("brevo-relay confirmation error:", err.message);
    results.errors.push(`brevo confirmation: ${err.message}`);
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
