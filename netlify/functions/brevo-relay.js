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
 *   BOYS_DIRECTOR_NOTIFY_EMAIL — Boys-side registration copy recipient
 *   BOYS_MINI_CAMP_NOTIFY_EMAIL — Dan-only admin recipient for Boys Mini Camp registrations
 *   SUPPLEMENTAL_TRYOUT_NOTIFY_EMAILS — Comma-separated staff recipients for supplemental registrations
 *   AIRTABLE_FORMS_API_KEY   — Airtable PAT (falls back to AIRTABLE_OPS_API_KEY)
 *   AIRTABLE_FORMS_BASE_ID   — Base id (default target: BTB-OS = appGAETGobQBTwf7j)
 *   AIRTABLE_FORMS_TABLE     — Table name (default: "Leads" — the existing BTB-OS lead workflow)
 */

import https from "node:https";
const RETIRED_FORM_NAMES = new Set(["camp-registration", "supplemental-tryouts-registration"]);
const NETLIFY_ADMIN_NOTIFICATION_FORMS = new Set(["futures-clinic-registration"]);
const BOYS_DIRECTOR_NOTIFY_EMAIL = process.env.BOYS_DIRECTOR_NOTIFY_EMAIL || "coachtbtb@gmail.com";
const BOYS_MINI_CAMP_FORM_NAME = "btb-boys-mini-camp-registration";
const BOYS_MINI_CAMP_NOTIFY_EMAIL = process.env.BOYS_MINI_CAMP_NOTIFY_EMAIL || "info@bethebestli.com";
const LAB_TEAM_STRENGTH_FORM_NAME = "btb-lab-team-strength-registration";
const DEFAULT_LAB_TEAM_STRENGTH_NOTIFY_EMAILS = ["info@bethebestli.com", "quintingermain@gmail.com"];
const MONDAY_OFFENSIVE_FORM_NAME = "btb-monday-offensive-training-registration";
const MONDAY_OFFENSIVE_NOTIFY_EMAIL = "info@bethebestli.com";
const BOYS_TRAINING_FORM_NAME = "btb-boys-training-registration";
const BOYS_TRAINING_NOTIFY_EMAIL = "info@bethebestli.com";
const BOYS_REGISTRATION_FORMS = new Set([
  "btb-boys-tryout-registration",
  "btb-east-boys-tryout-registration",
]);
const PROGRAM_GENDER_REGISTRATION_FORMS = new Set([
  "camp-registration",
  "positional-registration",
  "futures-registration",
  "futures-clinic-registration",
  "supplemental-tryouts-registration",
  "players-wanted-evaluation",
]);
const EVALUATION_NOTIFY_EMAILS = [
  "info@bethebestli.com",
  "btblacrosseteams@gmail.com",
  "btb.director.reynolds@gmail.com",
  "coachtbtb@gmail.com",
];
const DEFAULT_SUPPLEMENTAL_TRYOUT_NOTIFY_EMAILS = EVALUATION_NOTIFY_EMAILS;
const SEAFORD_CLINIC_LOCATION = "June 28 - Seaford High School - 9:00-11:00 AM";
const GIRLS_MINI_CAMP_PAYMENT_URL =
  "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-1c3a01704f2547cbb09f23abdebff4aa0bd6cfdac675404383577857b777c553ce3f1437feae469385772f1ce703ed23-0?locale=EN_US";
const BOYS_MINI_CAMP_PAYMENT_URL =
  "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-1c3a01704f2547cbb09f23abdebff4aa0bd6cfdac675404383577857b777c553ce3f1437feae469385772f1ce703ed23-0?locale=EN_US";
const FUTURES_CLINIC_DOB_RANGES = {
  2036: { min: "2017-12-02", max: "2018-12-01" },
  2037: { min: "2018-12-02", max: "2019-12-01" },
  2038: { min: "2019-12-02", max: "2020-12-01" },
};

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function futuresClinicGradYearForDob(value) {
  const dob = parseIsoDate(value);
  if (!dob) return null;
  for (const [gradYear, range] of Object.entries(FUTURES_CLINIC_DOB_RANGES)) {
    if (dob >= range.min && dob <= range.max) return gradYear;
  }
  return null;
}

function validateFuturesClinicSubmission(data) {
  const clinicLocation = String(data.clinic_location || "").trim();
  if (clinicLocation !== SEAFORD_CLINIC_LOCATION) {
    return { ok: false, reason: "wrong clinic location" };
  }

  const dob = parseIsoDate(String(data.player_dob || "").trim());
  if (!dob) return { ok: false, reason: "invalid DOB" };

  const expectedGradYear = futuresClinicGradYearForDob(dob);
  if (!expectedGradYear) {
    return { ok: false, reason: "DOB outside K-2 clinic range" };
  }

  const gradYear = String(data.grad_year || "").trim();
  if (!gradYear) return { ok: false, reason: "missing grad year" };
  if (gradYear !== "Not sure" && gradYear !== expectedGradYear) {
    return { ok: false, reason: `DOB/grad year mismatch: expected ${expectedGradYear}` };
  }

  return {
    ok: true,
    data: {
      ...data,
      clinic_location: SEAFORD_CLINIC_LOCATION,
      grad_year: expectedGradYear,
      grad_year_entered: gradYear === "Not sure" ? "Not sure" : data.grad_year_entered,
    },
  };
}

function validatePlayersWantedEvaluation(data) {
  const requiredTextFields = [
    "playerName",
    "age",
    "email",
    "phone",
    "gradYear",
    "gender",
    "teamInterested",
    "currentClub",
    "level",
    "reason",
  ];
  const normalized = { ...data };

  for (const field of requiredTextFields) {
    normalized[field] = String(data[field] || "").trim();
    if (!normalized[field]) return { ok: false, reason: `missing ${field}` };
  }
  if (String(data["bot-field"] || "").trim()) {
    return { ok: false, reason: "honeypot completed" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    return { ok: false, reason: "invalid email" };
  }

  const age = Number(normalized.age);
  if (!Number.isInteger(age) || age < 5 || age > 19) {
    return { ok: false, reason: "invalid age" };
  }
  const gradYear = Number(normalized.gradYear);
  if (!Number.isInteger(gradYear) || gradYear < 2027 || gradYear > 2042) {
    return { ok: false, reason: "invalid grad year" };
  }
  if (!["Boys", "Girls"].includes(normalized.gender)) {
    return { ok: false, reason: "invalid gender" };
  }
  if (!["AA", "A", "B"].includes(normalized.level)) {
    return { ok: false, reason: "invalid level" };
  }

  return { ok: true, data: normalized };
}

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
    "players-wanted-evaluation": process.env.BREVO_LIST_TRYOUT,
    "tryout-interest": process.env.BREVO_LIST_TRYOUT,
    "btb-boys-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-girls-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-boys-mini-camp-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-girls-mini-camp-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-lab-team-strength-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-monday-offensive-training-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-boys-training-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-east-boys-tryout-registration": process.env.BREVO_LIST_TRYOUT,
    "supplemental-tryouts-registration": process.env.BREVO_LIST_TRYOUT,
    "camp-registration": process.env.BREVO_LIST_TRYOUT,
    "positional-registration": process.env.BREVO_LIST_TRYOUT,
    "futures-registration": process.env.BREVO_LIST_TRYOUT,
    "futures-clinic-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-sixes-league-team-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-sixes-league-team-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-sixes-league-team-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-sixes-league-team-registration": process.env.BREVO_LIST_TRYOUT,
    "btb-sixes-league-team-registration": process.env.BREVO_LIST_TRYOUT,
    "lacrosse-iq-waitlist": process.env.BREVO_LIST_LACROSSE_IQ || "26",
  };
  const listId = map[formName] || process.env.BREVO_LIST_ID;
  return listId ? Number(listId) : null;
}

function firstValue(data, keys) {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function joinedName(data, keyPairs) {
  for (const [firstKey, lastKey] of keyPairs) {
    const name = [data[firstKey], data[lastKey]].filter(Boolean).join(" ").trim();
    if (name) return name;
  }
  return "";
}

function brevoAttributesFromSubmission(formName, data) {
  // Map common field names to Brevo's conventional attributes (FIRSTNAME, LASTNAME, SMS).
  // Anything else gets passed through verbatim so you can create custom attributes in Brevo.
  const attrs = { LASTFORM: formName, LASTSOURCE: data.source || "website" };

  const fullName = firstValue(data, ["name", "playerName"]) || joinedName(data, [
    ["firstName", "lastName"],
    ["parent_first_name", "parent_last_name"],
    ["player_first_name", "player_last_name"],
  ]);
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    attrs.FIRSTNAME = parts.shift() || "";
    attrs.LASTNAME = parts.join(" ");
  }
  const parentName = firstValue(data, ["parentName"]) || joinedName(data, [["parent_first_name", "parent_last_name"]]);
  const phone = firstValue(data, ["phone", "parent_phone"]);
  const parentPhone = firstValue(data, ["parentPhone", "parent_phone"]);
  const gradYear = firstValue(data, ["gradYear", "grad_year"]);
  const gender = firstValue(data, ["gender", "program_gender"]);
  if (parentName) attrs.PARENTNAME = parentName;
  if (phone) attrs.SMS = normalizePhone(phone);
  if (parentPhone) attrs.PARENTPHONE = normalizePhone(parentPhone);
  if (data.address) attrs.ADDRESS = data.address;
  if (gradYear) attrs.GRADYEAR = gradYear;
  if (gender) attrs.GENDER = gender;
  if (data.position) attrs.POSITION = data.position;
  if (data.currentClub) attrs.CURRENTCLUB = data.currentClub;
  if (data.level) attrs.PLAYERLEVEL = data.level;
  if (data.teamInterested) attrs.INTEREST_TEAM = data.teamInterested;
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

function notificationEmailsFromEnv() {
  return (process.env.BREVO_NOTIFY_EMAIL || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function supplementalTryoutNotificationEmails() {
  const configured = (process.env.SUPPLEMENTAL_TRYOUT_NOTIFY_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const seen = new Set();
  return [...DEFAULT_SUPPLEMENTAL_TRYOUT_NOTIFY_EMAILS, ...configured].filter((email) => {
    const key = email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function labTeamStrengthNotificationEmails() {
  const configured = (process.env.LAB_REGISTRATION_NOTIFY_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return [...notificationEmailsFromEnv(), ...DEFAULT_LAB_TEAM_STRENGTH_NOTIFY_EMAILS, ...configured];
}

function isBoysSideRegistration(formName, data) {
  const normalizedFormName = String(formName || "").toLowerCase();
  if (BOYS_REGISTRATION_FORMS.has(normalizedFormName)) return true;
  if (!PROGRAM_GENDER_REGISTRATION_FORMS.has(normalizedFormName)) return false;
  return firstValue(data, ["program_gender", "gender"]).toLowerCase().includes("boy");
}

function uniqueRecipients(emails) {
  const seen = new Set();
  return emails
    .map((email) => email.trim())
    .filter(Boolean)
    .filter((email) => {
      const key = email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((email) => ({ email }));
}

async function brevoSendNotification({ formName, data, submissionTime, siteUrl, includeDefaultRecipients = true }) {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = {
    name: process.env.BREVO_SENDER_NAME || "BTB Website",
    email: process.env.BREVO_SENDER_EMAIL,
  };
  const isBoysMiniCamp = formName === BOYS_MINI_CAMP_FORM_NAME;
  const isLabTeamStrength = formName === LAB_TEAM_STRENGTH_FORM_NAME;
  const isMondayOffensive = formName === MONDAY_OFFENSIVE_FORM_NAME;
  const isBoysTraining = formName === BOYS_TRAINING_FORM_NAME;
  const isEvaluationRequest = formName === "players-wanted-evaluation";
  const emails = isMondayOffensive
    ? [MONDAY_OFFENSIVE_NOTIFY_EMAIL]
    : isBoysTraining
    ? [BOYS_TRAINING_NOTIFY_EMAIL]
    : isLabTeamStrength
    ? labTeamStrengthNotificationEmails()
    : isBoysMiniCamp
    ? [BOYS_MINI_CAMP_NOTIFY_EMAIL]
    : isEvaluationRequest
      ? [...EVALUATION_NOTIFY_EMAILS]
      : (includeDefaultRecipients ? notificationEmailsFromEnv() : []);
  if (!isBoysMiniCamp && isBoysSideRegistration(formName, data)) {
    if (!isMondayOffensive && !isEvaluationRequest) emails.push(BOYS_DIRECTOR_NOTIFY_EMAIL);
  }
  if (formName === "supplemental-tryouts-registration") {
    emails.push(...supplementalTryoutNotificationEmails());
  }
  const to = uniqueRecipients(emails);

  if (!apiKey || !sender.email || to.length === 0) {
    return { skipped: "brevo notification env vars missing" };
  }

  const rows = Object.entries(data)
    .filter(([k]) => !["ip", "user_agent", "referrer", "bot-field"].includes(k))
    .map(([k, v]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;color:#555;text-transform:uppercase;font-size:12px;letter-spacing:1px">${escapeHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#111">${escapeHtml(String(v ?? ""))}</td></tr>`)
    .join("");

  const playerName = [data.player_first_name, data.player_last_name].filter(Boolean).join(" ").trim();
  const isSupplementalTryout = formName === "supplemental-tryouts-registration";
  let subject;
  if (isEvaluationRequest) {
    subject = `Evaluation Requested ${data.gender} ${data.gradYear}`;
  } else if (isBoysTraining) {
    subject = `Boys Friday Training — REGISTRATION SAVED / PAYMENT PENDING — ${data.training_group || "Friday Training"}: ${data.group_registration_count || "?"} registered — ${playerName || data.parent_email || "new registration"}`;
  } else if (isMondayOffensive) {
    subject = `Monday Offensive Training — REGISTRATION SAVED / PAYMENT PENDING — ${data.training_group || "Monday Night"}: ${data.group_registration_count || "?"} registered — ${playerName || data.parent_email || "new registration"}`;
  } else if (isLabTeamStrength) {
    subject = `The Lab — REGISTRATION SAVED / PAYMENT PENDING — ${data.team_name || "Team"}: ${data.team_registration_count || "?"}/10 — ${playerName || data.parent_email || "new registration"}`;
  } else if (isSupplementalTryout) {
    subject = `Supplemental Tryout Registration Confirmed — ${playerName || data.parent_email || "unknown"}`;
  } else {
    subject = `New ${prettyFormName(formName)} submission — ${data.name || data.playerName || data.parentName || data.email || "unknown"}`;
  }
  const emailEyebrow = isBoysTraining ? "BTB Boys Friday Offensive Training with Coach Dan" : isMondayOffensive ? "BTB Girls Monday Night Offensive Training" : isLabTeamStrength ? "The Lab at Momentum Sports" : isSupplementalTryout ? "BTB Supplemental Tryouts" : "BTB Website Form";
  const emailHeading = isBoysTraining ? `${data.training_group || "Friday Training"} · ${data.group_registration_count || "?"} registered` : isMondayOffensive ? `${data.training_group || "Monday Night"} · ${data.group_registration_count || "?"} registered` : isLabTeamStrength ? `${data.team_name || "Team"} · ${data.team_registration_count || "?"} of 10` : isSupplementalTryout ? "Registration Confirmed" : prettyFormName(formName);
  const htmlContent = `
<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f7f7;padding:24px;margin:0">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden">
    <div style="background:#D22630;color:#fff;padding:20px 28px">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;opacity:0.85">${escapeHtml(emailEyebrow)}</div>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:700">${escapeHtml(emailHeading)}</h1>
    </div>
    ${isBoysTraining || isMondayOffensive || isLabTeamStrength ? '<div style="padding:14px 28px;background:#fff4f4;border-bottom:1px solid #f2cccc;color:#7a1c22;font-size:13px;font-weight:700">Registration saved — payment is not confirmed. Wait for the separate QuickBooks payment-received email before marking this player paid. Match it using the player name and parent email below.</div>' : isSupplementalTryout ? '<div style="padding:14px 28px;background:#fff4f4;border-bottom:1px solid #f2cccc;color:#7a1c22;font-size:13px;font-weight:700">Registration details are saved. QuickBooks payment is still pending verification.</div>' : ""}
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <div style="padding:16px 28px;color:#888;font-size:12px;background:#fafafa;border-top:1px solid #eee">
      Submitted ${escapeHtml(submissionTime || new Date().toISOString())} · ${escapeHtml(siteUrl || "bethebestli.com")}
    </div>
  </div>
</body></html>`.trim();

  const body = JSON.stringify({
    sender,
    to,
    replyTo: firstValue(data, ["email", "parent_email"])
      ? {
          email: firstValue(data, ["email", "parent_email"]),
          name:
            firstValue(data, ["name", "playerName", "parentName"]) ||
            joinedName(data, [["parent_first_name", "parent_last_name"]]) ||
            firstValue(data, ["email", "parent_email"]),
        }
      : undefined,
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
  const leadName = firstValue(data, ["name", "playerName"])
    || joinedName(data, [["firstName", "lastName"], ["parent_first_name", "parent_last_name"], ["player_first_name", "player_last_name"]])
    || firstValue(data, ["parentName", "email", "parentEmail", "parent_email"])
    || "(no name)";
  const contactEmail = firstValue(data, ["email", "parentEmail", "parent_email"]);
  const contactPhone = firstValue(data, ["phone", "parentPhone", "parent_phone"]);

  const fields = {
    "Lead Name": leadName,
    "Contact Email": contactEmail,
    "Contact Phone": contactPhone,
    "Submission Date": submissionTime || new Date().toISOString(),
    Source: formName,
    Subject: data.subject || data.interestCategory || data.teamInterested || "",
    Notes: data.message || data.notes || data.reason || data.experience || "",
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

// ─── Tryout Google Sheet Live Sync ────────────────────────────────────────────

const TRYOUT_ROSTER_SHEET_ID = "1Jqoh4hth_PhY-EgnBzpJ9J7bPvHv9hN53mZZJ3xRHF8";
const TRYOUT_REGISTRATION_CONFIG = {
  "btb-boys-tryout-registration": { program: "Boys Tryouts", tab: "Boys Roster" },
  "btb-girls-tryout-registration": { program: "Girls Tryouts", tab: "Girls Roster" },
  "btb-east-boys-tryout-registration": { program: "BTB East Boys Tryouts", tab: "East Roster" },
  "supplemental-tryouts-registration": { program: "Supplemental Tryouts", tab: "Supplemental Roster" },
};

const TRYOUT_ROSTER_HEADERS = [
  "Checked In", "Pinnie #", "Eval Group", "Grad Year", "Player Last Name", "Player First Name",
  "Player Name", "Position", "School / Town", "Player DOB", "Parent Name", "Parent Email",
  "Parent Phone", "Emergency Contact", "Emergency Phone", "Medical Notes", "Submission Count",
  "Duplicate Flag", "Latest Submission Date", "Coach Notes",
];
const TRYOUT_RAW_HEADERS = [
  "Program", "Form Source", "Submission Date", "Player First Name", "Player Last Name", "Player Name",
  "Grad Year", "Gender", "Position", "School / Town", "Player DOB", "Parent Name", "Parent Email",
  "Parent Phone", "Street", "City", "State", "Zip", "Emergency Contact", "Emergency Phone",
  "Medical Notes", "How Heard", "Waiver Accepted", "Amount", "Payment Verified", "Referrer",
  "Netlify Submission ID",
];
const TRYOUT_ALL_HEADERS = ["Program", ...TRYOUT_ROSTER_HEADERS];

function clean(value) {
  return String(value || "").replace(/\r/g, " ").replace(/\n/g, " ").trim();
}

function smartCase(value) {
  const text = clean(value);
  if (!text) return "";
  return text === text.toLowerCase() || text === text.toUpperCase()
    ? text.toLowerCase().replace(/\b[a-z]/g, (char) => char.toUpperCase())
    : text;
}

function displayPhone(value) {
  const text = clean(value);
  const digits = text.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return text;
}

function formatEtDateTime(value = new Date()) {
  const date = new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(safeDate).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} ${parts.dayPeriod} ET`;
}

function playerFullName(data) {
  return [smartCase(data.player_first_name), smartCase(data.player_last_name)].filter(Boolean).join(" ").trim();
}

function parentFullName(data) {
  return [smartCase(data.parent_first_name), smartCase(data.parent_last_name)].filter(Boolean).join(" ").trim();
}

function tryoutRowsFromSubmission({ formName, data, submissionTime, submissionId }) {
  const config = TRYOUT_REGISTRATION_CONFIG[formName];
  const submitted = formatEtDateTime(submissionTime);
  const firstName = smartCase(data.player_first_name);
  const lastName = smartCase(data.player_last_name);
  const playerName = playerFullName(data);
  const gradYear = clean(data.grad_year);
  const dob = clean(data.player_dob);
  const parentEmail = clean(data.parent_email).toLowerCase();
  const parentName = parentFullName(data);

  const rawRow = [
    config.program,
    formName,
    submitted,
    firstName,
    lastName,
    playerName,
    gradYear,
    smartCase(data.program_gender),
    smartCase(data.position),
    clean(data.school_town),
    dob,
    parentName,
    parentEmail,
    displayPhone(data.parent_phone),
    clean(data.address_street),
    smartCase(data.address_city),
    clean(data.address_state).toUpperCase(),
    clean(data.address_zip),
    smartCase(data.emergency_name),
    displayPhone(data.emergency_phone),
    clean(data.medical_notes),
    clean(data.how_heard),
    clean(data.waiver_accepted),
    clean(data.amount),
    "",
    clean(data.referrer),
    clean(submissionId),
  ];

  const rosterRow = [
    "",
    "",
    clean(data.session),
    gradYear,
    lastName,
    firstName,
    playerName,
    smartCase(data.position),
    clean(data.school_town),
    dob,
    parentName,
    parentEmail,
    displayPhone(data.parent_phone),
    smartCase(data.emergency_name),
    displayPhone(data.emergency_phone),
    clean(data.medical_notes),
    1,
    "",
    submitted,
    "",
  ];

  return {
    rawRow,
    rosterRow,
    allRow: [config.program, ...rosterRow],
    key: `${config.program.toLowerCase()}|${playerName.toLowerCase()}|${dob}|${gradYear}`,
    rawFallbackKey: `${config.program.toLowerCase()}|${playerName.toLowerCase()}|${dob}|${gradYear}|${submitted}`,
  };
}

async function googleAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Sheet env vars missing");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(`Google token refresh failed: ${response.status}`);
  }
  return body.access_token;
}

async function sheetsFetch(token, range, { method = "GET", values } = {}) {
  const encodedRange = encodeURIComponent(range);
  const query = method === "GET" ? "" : "?valueInputOption=USER_ENTERED";
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${TRYOUT_ROSTER_SHEET_ID}/values/${encodedRange}${query}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: method === "GET" ? undefined : JSON.stringify({ values }),
    }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Sheets ${method} ${range} failed: ${response.status} ${JSON.stringify(body).slice(0, 160)}`);
  }
  return body.values || [];
}

async function sheetsAppend(token, range, values) {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${TRYOUT_ROSTER_SHEET_ID}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Sheets append ${range} failed: ${response.status} ${JSON.stringify(body).slice(0, 160)}`);
  }
  return body;
}

function columnLetter(index) {
  let n = index;
  let value = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    value = String.fromCharCode(65 + remainder) + value;
    n = Math.floor((n - 1) / 26);
  }
  return value;
}

function rosterKey(row, program) {
  return `${program.toLowerCase()}|${clean(row[6]).toLowerCase()}|${clean(row[9])}|${clean(row[3])}`;
}

function allRosterKey(row) {
  return `${clean(row[0]).toLowerCase()}|${clean(row[7]).toLowerCase()}|${clean(row[10])}|${clean(row[4])}`;
}

function rawSubmissionSeen(rawRows, submissionId, fallbackKey) {
  const id = clean(submissionId);
  return rawRows.slice(1).some((row) => {
    if (id && clean(row[26]) === id) return true;
    const rowFallbackKey = `${clean(row[0]).toLowerCase()}|${clean(row[5]).toLowerCase()}|${clean(row[10])}|${clean(row[6])}|${clean(row[2])}`;
    return rowFallbackKey === fallbackKey;
  });
}

function mergeRosterRow(existing, next) {
  const merged = next.slice();
  merged[0] = existing[0] || "";
  merged[1] = existing[1] || "";
  // Keep a staff-assigned eval group, but fall back to the session picked at registration.
  merged[2] = existing[2] || next[2] || "";
  const count = Math.max(Number(existing[16]) || 1, 1) + 1;
  merged[16] = count;
  merged[17] = "Review";
  merged[19] = existing[19] || "";
  return merged;
}

function mergeAllRosterRow(existing, next) {
  const merged = next.slice();
  merged[1] = existing[1] || "";
  merged[2] = existing[2] || "";
  merged[3] = existing[3] || next[3] || "";
  const count = Math.max(Number(existing[17]) || 1, 1) + 1;
  merged[17] = count;
  merged[18] = "Review";
  merged[20] = existing[20] || "";
  return merged;
}

async function ensureTryoutHeaders(token, tabName, existingRows, headers) {
  if (existingRows.length > 0) return existingRows;
  await sheetsFetch(token, `${tabName}!A1:${columnLetter(headers.length)}1`, {
    method: "PUT",
    values: [headers],
  });
  return [headers];
}

async function updateTryoutSummary(token) {
  const [rawRows, boysRows, girlsRows, eastRows, supplementalRows, interestRows] = await Promise.all([
    sheetsFetch(token, "Raw Submissions!A:AA"),
    sheetsFetch(token, "Boys Roster!A:T"),
    sheetsFetch(token, "Girls Roster!A:T"),
    sheetsFetch(token, "East Roster!A:T"),
    sheetsFetch(token, "Supplemental Roster!A:T"),
    sheetsFetch(token, "Interest Only!A:P"),
  ]);

  const rosterCounts = {
    "Boys Tryouts": Math.max(boysRows.length - 1, 0),
    "Girls Tryouts": Math.max(girlsRows.length - 1, 0),
    "BTB East Boys Tryouts": Math.max(eastRows.length - 1, 0),
    "Supplemental Tryouts": Math.max(supplementalRows.length - 1, 0),
  };
  const rawCounts = {
    "Boys Tryouts": 0,
    "Girls Tryouts": 0,
    "BTB East Boys Tryouts": 0,
    "Supplemental Tryouts": 0,
  };
  const latest = {
    "Boys Tryouts": "",
    "Girls Tryouts": "",
    "BTB East Boys Tryouts": "",
    "Supplemental Tryouts": "",
  };

  for (const row of rawRows.slice(1)) {
    const program = clean(row[0]);
    if (!(program in rawCounts)) continue;
    rawCounts[program] += 1;
    if (clean(row[2])) latest[program] = clean(row[2]);
  }

  const programs = ["Boys Tryouts", "Girls Tryouts", "BTB East Boys Tryouts", "Supplemental Tryouts"];
  const programRows = programs.map((program) => [
    program,
    rawCounts[program],
    rosterCounts[program],
    rawCounts[program] - rosterCounts[program],
    latest[program],
    "Clean roster keeps latest registration per player.",
  ]);
  const totalLive = programs.reduce((sum, program) => sum + rawCounts[program], 0);
  const totalUnique = programs.reduce((sum, program) => sum + rosterCounts[program], 0);

  await sheetsFetch(token, "Summary!A3:F12", {
    method: "PUT",
    values: [
      ["Generated", formatEtDateTime()],
      ["Source", "Live Netlify Forms API + registration webhook - bethebestli.com"],
      [],
      ["Program", "Live Submissions", "Clean Unique Players", "Duplicate Extra Rows", "Latest Submission", "Notes"],
      ...programRows,
      ["TOTAL OFFICIAL TRYOUTS", totalLive, totalUnique, totalLive - totalUnique, "", ""],
      ["Tryout Interest Only", Math.max(interestRows.length - 1, 0), "Not official registrations", "", "", "Shown on separate reference tab."],
    ],
  });
}

async function syncTryoutRosterSheet({ formName, data, submissionTime, submissionId }) {
  const config = TRYOUT_REGISTRATION_CONFIG[formName];
  if (!config) return { skipped: "not a tryout registration form" };

  const token = await googleAccessToken();
  const { rawRow, rosterRow, allRow, key, rawFallbackKey } = tryoutRowsFromSubmission({
    formName,
    data,
    submissionTime,
    submissionId,
  });

  const [rawInitial, programInitial, allInitial] = await Promise.all([
    sheetsFetch(token, "Raw Submissions!A:AA"),
    sheetsFetch(token, `${config.tab}!A:T`),
    sheetsFetch(token, "All Clean Rosters!A:U"),
  ]);
  const rawRows = await ensureTryoutHeaders(token, "Raw Submissions", rawInitial, TRYOUT_RAW_HEADERS);
  const programRows = await ensureTryoutHeaders(token, config.tab, programInitial, TRYOUT_ROSTER_HEADERS);
  const allRows = await ensureTryoutHeaders(token, "All Clean Rosters", allInitial, TRYOUT_ALL_HEADERS);

  if (rawSubmissionSeen(rawRows, submissionId, rawFallbackKey)) {
    return { ok: true, skipped: "submission already synced" };
  }

  await sheetsAppend(token, "Raw Submissions!A:AA", [rawRow]);

  const rosterIndex = programRows.findIndex((row, index) => index > 0 && rosterKey(row, config.program) === key);
  if (rosterIndex === -1) {
    await sheetsAppend(token, `${config.tab}!A:T`, [rosterRow]);
  } else {
    await sheetsFetch(token, `${config.tab}!A${rosterIndex + 1}:T${rosterIndex + 1}`, {
      method: "PUT",
      values: [mergeRosterRow(programRows[rosterIndex], rosterRow)],
    });
  }

  const allIndex = allRows.findIndex((row, index) => index > 0 && allRosterKey(row) === key);
  if (allIndex === -1) {
    await sheetsAppend(token, "All Clean Rosters!A:U", [allRow]);
  } else {
    await sheetsFetch(token, `All Clean Rosters!A${allIndex + 1}:U${allIndex + 1}`, {
      method: "PUT",
      values: [mergeAllRosterRow(allRows[allIndex], allRow)],
    });
  }

  await updateTryoutSummary(token);
  return {
    ok: true,
    sheet: "BTB Tryout Rosters - Dan Pete - Live Netlify",
    program: config.program,
    player: playerFullName(data),
  };
}

// ─── Registrant Confirmation Email ────────────────────────────────────────────

const BOYS_FLYER = "https://www.bethebestli.com/images/tryouts/BTB_Boys_Futures_June_Clinic.jpg";
const GIRLS_FLYER = "https://www.bethebestli.com/images/tryouts/BTB_Girls_Futures_June_Clinic.jpg";
const LAB_TEAM_STRENGTH_PAYMENT_URL =
  "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-005e529290034c1784c41b75a25a08d7ffa08f9eed7c4342bb332487cbb29ea11ebdb27a2e174ca8af980aac794f8232?locale=EN_US";
const MONDAY_OFFENSIVE_PAYMENT_URL =
  "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-d7ed4f0985e8442391d477a68a779dc7b3e11703e8f548e3a3ec1afb9538ce130dba73afcce5431e9680a8065f5c54ed?locale=EN_US";
// The QuickBooks item is gender-neutral: "BTB Offensive Training with Coach Dan (6 Sessions)".
const BOYS_TRAINING_PAYMENT_URL = MONDAY_OFFENSIVE_PAYMENT_URL;

const CONFIRMATION_DISABLED_FORMS = new Set([
  "camp-registration",
  "positional-registration",
]);

// Per-form confirmation config. Add new programs here as they're created.
const CONFIRMATION_CONFIG = {
  "futures-clinic-registration": {
    subject: (data) => `You're Registered — BTB ${data.program_gender || ""} Futures Clinic | June 28 Seaford`,
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
      <p style="margin:8px 0 0;color:#D22630;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${gender} Futures — June 28 Seaford Free Clinic</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="padding:28px 24px 0;background:#111;">
      <p style="font-size:16px;color:#ccc;line-height:1.7;margin:0 0 24px;">
        Hi ${parentFirst},<br><br>
        We have <strong style="color:#fff;">${playerName}</strong> locked in for the BTB ${gender} Futures Free Clinic on June 28 at Seaford High School. See the flyer below for the details — and please share it with a friend! <strong style="color:#fff;">Spots are limited and filling fast.</strong>
      </p>
    </td></tr>
    <tr><td style="padding:0 24px;background:#111;">
      <a href="https://www.bethebestli.com/futures-clinic" style="display:block;">
        <img src="${flyerUrl}" alt="BTB ${gender} Futures June 28 Free Clinic" width="100%" style="display:block;border-radius:8px;max-width:552px;" />
      </a>
    </td></tr>
    <tr><td style="padding:24px 24px 40px;background:#111;">
      <div style="background:#1a1a1a;border-left:3px solid #D22630;border-radius:6px;padding:20px 22px;margin-bottom:22px;">
        <p style="color:#D22630;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px;">CLINIC DATE & LOCATION</p>
        <p style="color:#fff;font-size:15px;font-weight:700;margin:0 0 2px;">📍 Sunday, June 28</p>
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
          ✅ Stickwork fundamentals + fun drills (Kindergarten-2nd grade)<br>
          ✅ Q&A with coaches — kids ask, coaches answer<br>
          ✅ Exclusive info shared only with registered families<br>
          ✅ No prior experience needed
        </p>
      </div>
      <p style="font-size:13px;color:#777;line-height:1.7;margin:0 0 24px;text-align:center;">Wear athletic clothes and bring a stick if you have one — no worries if not.<br>We'll send any field, gear, or weather updates before June 28.</p>
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
  "players-wanted-evaluation": {
    subject: (data) => `Evaluation Request Received — ${data.playerName || "BTB Lacrosse"}`,
    getHtml: (data) => {
      const playerName = String(data.playerName || "your player").trim();
      return confirmationBase({
        parentFirst: "BTB Family",
        playerName,
        program: "a BTB player evaluation",
        details: "Our coaching staff will review the information you shared and follow up about team fit, evaluation timing, and next steps.",
        cta: "VIEW PLAYERS WANTED",
        ctaUrl: "https://www.bethebestli.com/players-wanted#request-evaluation",
        headline: "Request Received",
        introVerb: "submitted for",
      });
    },
  },
  "btb-boys-tryout-registration": {
    subject: () => "You're Registered — BTB Boys Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Boys Tryouts 2026", details: "Tryout times are assigned by grad year. We'll send your specific time slot and location details shortly.", cta: "REQUEST AN EVALUATION", ctaUrl: "https://www.bethebestli.com/players-wanted#request-evaluation" });
    },
  },
  "btb-girls-tryout-registration": {
    subject: () => "You're Registered — BTB Girls Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB Girls Tryouts 2026", details: "Tryout times are assigned by grad year. We'll send your specific time slot and location details shortly.", cta: "REQUEST AN EVALUATION", ctaUrl: "https://www.bethebestli.com/players-wanted#request-evaluation" });
    },
  },
  "btb-boys-mini-camp-registration": {
    subject: (data) => `Registration Received — Boys Mini Camp | ${data.assigned_session || "August 23, 24 & 26"}`,
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const assignedSession = data.assigned_session || "the session assigned to his graduation year";
      const details = `August 23, 24, and 26 at ${assignedSession}. Momentum Sports, 10 Dunton Ave, Deer Park, NY. His registration is finalized after the $150 QuickBooks payment is completed.`;
      return confirmationBase({
        parentFirst,
        playerName,
        program: "BTB × Full Circle 3-Day Boys Mini Camp",
        details,
        cta: "COMPLETE $150 PAYMENT",
        ctaUrl: BOYS_MINI_CAMP_PAYMENT_URL,
        headline: "Registration Received",
        introVerb: "saved for",
      });
    },
  },
  "btb-girls-mini-camp-registration": {
    subject: (data) => `Registration Received — Girls Mini Camp | ${data.assigned_session || "August 19–21"}`,
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const assignedSession = data.assigned_session || "the session assigned to her graduation year";
      const details = `August 19, 20, and 21 at ${assignedSession}. Momentum Sports, 10 Dunton Ave, Deer Park, NY. Her registration is finalized after the $150 QuickBooks payment is completed.`;
      return confirmationBase({
        parentFirst,
        playerName,
        program: "BTB × Bearded Lax Girls Mini Camp",
        details,
        cta: "COMPLETE $150 PAYMENT",
        ctaUrl: GIRLS_MINI_CAMP_PAYMENT_URL,
        headline: "Registration Received",
        introVerb: "saved for",
      });
    },
  },
  "btb-lab-team-strength-registration": {
    subject: (data) => `Registration Received — The Lab | ${data.team_name || "BTB Team"}`,
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const teamName = String(data.team_name || "their BTB team").trim();
      const count = String(data.team_registration_count || "").trim();
      const remaining = String(data.team_spots_to_minimum || "").trim();
      const progress = count
        ? remaining === "0"
          ? `${teamName} has reached the 10-player team minimum. `
          : `${teamName} now has ${count} commitment${count === "1" ? "" : "s"} and needs ${remaining} more to reach the 10-player minimum. `
        : "";
      return confirmationBase({
        parentFirst,
        playerName,
        program: "The Lab at Momentum Sports — Team Strength Training",
        details: `${progress}The registration details are saved for BTB and Quintin Germain. Complete the secure $500 QuickBooks payment to finalize the player's 16-session registration. At QuickBooks checkout, enter the player's full name and the same parent email used on this form so the payment confirmation can be matched correctly.`,
        cta: "COMPLETE $500 PAYMENT",
        ctaUrl: LAB_TEAM_STRENGTH_PAYMENT_URL,
        headline: "Registration Received",
        introVerb: "saved for",
      });
    },
  },
  "btb-monday-offensive-training-registration": {
    subject: (data) => `Registration Received — Monday Offensive Training | ${data.training_group || "Monday Night"}`,
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const groupName = String(data.training_group || "the selected Monday night group").trim();
      const count = String(data.group_registration_count || "").trim();
      const progress = count ? `${groupName} now has ${count} registration${count === "1" ? "" : "s"}. ` : "";
      return confirmationBase({
        parentFirst,
        playerName,
        program: "BTB Girls Monday Night Offensive Training — 6 Sessions",
        details: `${progress}This group trains ${String(data.training_time || "at its listed Monday time").trim()} on September 14, 21, and 28 and October 5, 12, and 19, 2026 at Momentum Sports. Complete the secure $250 QuickBooks payment to finalize registration. At checkout, enter the player's full name and the same parent email used on this form so BTB can match the payment receipt correctly.`,
        cta: "COMPLETE $250 PAYMENT",
        ctaUrl: MONDAY_OFFENSIVE_PAYMENT_URL,
        headline: "Registration Received",
        introVerb: "saved for",
      });
    },
  },
  "btb-boys-training-registration": {
    subject: (data) => `Registration Received — Boys Friday Training | ${data.training_group || "Friday Training"}`,
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const groupName = String(data.training_group || "the selected Friday training group").trim();
      const count = String(data.group_registration_count || "").trim();
      const progress = count ? `${groupName} now has ${count} registration${count === "1" ? "" : "s"}. ` : "";
      return confirmationBase({
        parentFirst,
        playerName,
        program: "BTB Boys Friday Offensive Training with Coach Dan — 6 Sessions",
        details: `${progress}This group trains ${String(data.training_time || "at its listed Friday time").trim()} on September 18 and 25 and October 2, 9, 23, and 30, 2026 at Momentum Sports. Complete the secure $250 QuickBooks payment to finalize registration. At checkout, enter the player's full name and the same parent email used on this form so BTB can match the payment receipt correctly.`,
        cta: "COMPLETE $250 PAYMENT",
        ctaUrl: BOYS_TRAINING_PAYMENT_URL,
        headline: "Registration Received",
        introVerb: "saved for",
      });
    },
  },
  "btb-east-boys-tryout-registration": {
    subject: () => "You're Registered — BTB East Boys Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      return confirmationBase({ parentFirst, playerName, program: "BTB East Boys Tryouts 2026", details: "Location: Seaford High School, 1575 Seamans Neck Rd, Seaford, NY 11783. We'll send your specific time slot closer to the date.", cta: "REQUEST AN EVALUATION", ctaUrl: "https://www.bethebestli.com/players-wanted#request-evaluation" });
    },
  },
  "supplemental-tryouts-registration": {
    subject: () => "Registration Received — BTB Supplemental Tryouts 2026",
    getHtml: (data) => {
      const parentFirst = (data.parent_first_name || data.name || "BTB Family").trim();
      const playerName = [(data.player_first_name || ""), (data.player_last_name || "")].filter(Boolean).join(" ") || "your player";
      const session = String(data.session || "").trim();
      const sessionLine = session
        ? `Session selected: ${session} at Plainedge Park. `
        : "";
      return confirmationBase({
        parentFirst,
        playerName,
        program: "BTB Supplemental Tryouts 2026",
        details: `${sessionLine}Your registration details are saved. Complete the secure $75 QuickBooks payment to finalize registration.`,
        cta: "COMPLETE PAYMENT",
        ctaUrl: "https://connect.intuit.com/pay/BTBLacrossecamp/scs-v1-7970852e308b44d9aa7e9d9dc98e9546db991b33985344129932805af4b0c571c7bdd588f3a14c1093ca48e70401ddc6?locale=EN_US",
      });
    },
  },
};

function confirmationBase({
  parentFirst,
  playerName,
  program,
  details,
  cta,
  ctaUrl,
  headline = "You're Registered!",
  introVerb = "registered for",
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;border-bottom:3px solid #D22630;">
    <tr><td style="padding:24px 20px;text-align:center;">
      <p style="margin:0 0 6px;color:#D22630;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">BE THE BEST LACROSSE CLUB</p>
      <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:2px;text-transform:uppercase;font-weight:900;">${escapeHtml(headline)}</h1>
      <p style="margin:8px 0 0;color:#D22630;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(program)}</p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="padding:32px 24px 40px;background:#111;">
      <p style="font-size:16px;color:#ccc;line-height:1.7;margin:0 0 24px;">
        Hi ${escapeHtml(parentFirst)},<br><br>
        We have <strong style="color:#fff;">${escapeHtml(playerName)}</strong> ${escapeHtml(introVerb)} <strong style="color:#fff;">${escapeHtml(program)}</strong>. We're looking forward to seeing them on the field!
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

  if (CONFIRMATION_DISABLED_FORMS.has(formName)) {
    return { skipped: `confirmation disabled for ${formName}` };
  }

  const config = CONFIRMATION_CONFIG[formName];
  if (!config) return { skipped: `no confirmation template for ${formName}` };

  const toEmail = data.parent_email || data.email;
  const toName = data.parent_first_name || data.name || data.playerName || toEmail;
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

export const handler = async (event) => {
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
  let data = payload.data || payload.fields || payload;
  const submissionTime = payload.created_at || new Date().toISOString();
  const siteUrl = payload.site_url || "https://www.bethebestli.com";

  // Ignore late webhook retries or submissions from retired registration pages
  // so they cannot create contacts or send emails.
  if (RETIRED_FORM_NAMES.has(formName)) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formName,
        skipped: true,
        reason: "registration retired",
      }),
    };
  }

  if (formName === "players-wanted-evaluation") {
    const validation = validatePlayersWantedEvaluation(data);
    if (!validation.ok) {
      console.warn(`Skipped invalid player evaluation relay: ${validation.reason}`);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formName, skipped: true, reason: validation.reason }),
      };
    }
    data = validation.data;
  }

  if (formName === "futures-clinic-registration") {
    const validation = validateFuturesClinicSubmission(data);
    if (!validation.ok) {
      console.warn(`Skipped invalid futures clinic relay: ${validation.reason}`);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formName, skipped: true, reason: validation.reason }),
      };
    }
    data = validation.data;
  }

  const results = { formName, brevoContact: null, brevoEmail: null, brevoConfirmation: null, airtable: null, tryoutRosterSheet: null, errors: [] };

  // Brevo: upsert contact
  try {
    const email = firstValue(data, ["email", "parentEmail", "parent_email"]);
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

  // Brevo: notification email to admins. Futures Clinic keeps Netlify's built-in
  // form notification as the default admin alert, but boys-side submissions still
  // get copied to the boys director from this relay.
  const netlifyHandlesDefaultAdminNotification = NETLIFY_ADMIN_NOTIFICATION_FORMS.has(formName);
  const boysSideRegistration = isBoysSideRegistration(formName, data);
  if (netlifyHandlesDefaultAdminNotification && !boysSideRegistration) {
    results.brevoEmail = { skipped: "netlify form email handles admin notification" };
  } else {
    try {
      results.brevoEmail = await brevoSendNotification({
        formName,
        data,
        submissionTime,
        siteUrl,
        includeDefaultRecipients: !netlifyHandlesDefaultAdminNotification,
      });
    } catch (err) {
      console.error("brevo-relay email error:", err.message);
      results.errors.push(`brevo email: ${err.message}`);
    }
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

  // Google Sheet: keep Dan/Pete's tryout roster current as registrations land.
  try {
    const submissionId = payload.id || payload.submission_id || payload.submissionId || "";
    results.tryoutRosterSheet = await syncTryoutRosterSheet({ formName, data, submissionTime, submissionId });
  } catch (err) {
    console.error("brevo-relay tryout sheet error:", err.message);
    results.errors.push(`tryout sheet: ${err.message}`);
  }

  // Always 200 so Netlify doesn't retry — partial success is recorded in the response body
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(results),
  };
};
