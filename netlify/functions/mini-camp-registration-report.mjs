import { getStore } from "@netlify/blobs";

export const MINI_CAMP_FORM_ID = "6a7395e531cdab00081c68b3";
export const FUTURES_FORM_ID = "69f4c0032e7f520008e1b768";
export const REPORT_RECIPIENTS = [
  { email: "info@bethebestli.com", name: "BTB Lacrosse" },
  { email: "beardedlax19@gmail.com", name: "Matt Mauro" },
];
export const SESSION_CAPACITY = 18;

const REPORT_START_DATE = "2026-08-07";
const REPORT_FINAL_DATE = "2026-08-19";
const POSSIBLE_MISROUTE_START = Date.parse("2026-08-06T04:00:00.000Z");
const REPORT_STORE = "mini-camp-daily-registration-reports";
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

export const SESSIONS = [
  {
    key: "2036-2035",
    years: ["2036", "2035"],
    time: "5:00 PM–6:00 PM",
    label: "2036 + 2035 · 5:00–6:00 PM",
  },
  {
    key: "2034-2033",
    years: ["2034", "2033"],
    time: "6:00 PM–7:00 PM",
    label: "2034 + 2033 · 6:00–7:00 PM",
  },
  {
    key: "2032-2031",
    years: ["2032", "2031"],
    time: "7:00 PM–8:00 PM",
    label: "2032 + 2031 · 7:00–8:00 PM",
  },
];

function clean(value, maxLength = 500) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function dateKeyInNewYork(value) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function reportPeriodFor(value) {
  const now = new Date(value);
  if (Number.isNaN(now.getTime())) throw new Error("Invalid report time");

  const dateKey = dateKeyInNewYork(now);
  if (dateKey < REPORT_START_DATE || dateKey > REPORT_FINAL_DATE) {
    return { active: false, dateKey };
  }

  // Every report date is during EDT, so 8:00 AM America/New_York is 12:00 UTC.
  const cutoff = new Date(`${dateKey}T12:00:00.000Z`);
  const windowStart = new Date(`${addDays(dateKey, -1)}T12:00:00.000Z`);
  return { active: true, dateKey, cutoff, windowStart };
}

function submissionTime(submission) {
  const raw = submission?.created_at || submission?.createdAt || submission?.data?.submitted_at;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function registrationIdentity(data = {}) {
  const parts = [
    clean(data.parent_email, 320).toLowerCase(),
    clean(data.player_first_name, 120).toLowerCase(),
    clean(data.player_last_name, 120).toLowerCase(),
    clean(data.grad_year, 4),
  ];
  return parts.every(Boolean) ? parts.join("|") : null;
}

export function dedupeRegistrations(submissions = [], cutoff = Number.POSITIVE_INFINITY) {
  const cutoffMs = cutoff instanceof Date ? cutoff.getTime() : Number(cutoff);
  const bySubmissionId = new Map();
  const invalidTimestamps = [];

  submissions.forEach((submission, index) => {
    const timestamp = submissionTime(submission);
    if (!Number.isFinite(timestamp)) {
      invalidTimestamps.push(clean(submission?.id) || `row-${index + 1}`);
      return;
    }
    if (timestamp >= cutoffMs) return;

    const id = clean(submission?.id) || `row-${index + 1}`;
    const existing = bySubmissionId.get(id);
    if (!existing || submissionTime(existing) <= timestamp) bySubmissionId.set(id, submission);
  });

  const byIdentity = new Map();
  const missingIdentity = [];
  const exactRows = [...bySubmissionId.values()].sort((a, b) => submissionTime(a) - submissionTime(b));
  for (const submission of exactRows) {
    const identity = registrationIdentity(submission.data);
    if (!identity) {
      missingIdentity.push(clean(submission.id) || "unknown submission");
      continue;
    }
    byIdentity.set(identity, submission);
  }

  const roster = [...byIdentity.values()].sort((a, b) => submissionTime(a) - submissionTime(b));
  return {
    roster,
    invalidTimestamps,
    missingIdentity,
    duplicateCount: exactRows.length - missingIdentity.length - roster.length,
  };
}

function sessionFor(data = {}) {
  const gradYear = clean(data.grad_year, 4);
  return SESSIONS.find((session) => session.years.includes(gradYear)) || null;
}

function registrationView(submission, source = "Mini Camp") {
  const data = submission?.data || {};
  const session = sessionFor(data);
  return {
    id: clean(submission?.id),
    identity: registrationIdentity(data),
    timestamp: submissionTime(submission),
    source,
    playerName: [clean(data.player_first_name, 120), clean(data.player_last_name, 120)].filter(Boolean).join(" "),
    gradYear: clean(data.grad_year, 4),
    sessionKey: session?.key || "unknown",
    session: clean(data.assigned_session, 80) || session?.time || "Needs review",
    position: clean(data.position, 80) || clean(data.experience, 80),
    schoolTown: clean(data.school_town, 160),
    currentTeam: clean(data.current_team, 160),
    parentName: [clean(data.parent_first_name, 120), clean(data.parent_last_name, 120)].filter(Boolean).join(" "),
    parentEmail: clean(data.parent_email, 320),
    parentPhone: clean(data.parent_phone, 60),
  };
}

function isPossibleFuturesMisroute(submission, cutoffMs) {
  const timestamp = submissionTime(submission);
  const data = submission?.data || {};
  return Number.isFinite(timestamp)
    && timestamp >= POSSIBLE_MISROUTE_START
    && timestamp < cutoffMs
    && clean(data.program_gender, 30).toLowerCase() === "girls"
    && SESSIONS.some((session) => session.years.includes(clean(data.grad_year, 4)));
}

function sessionAnomalies(roster) {
  const anomalies = [];
  for (const submission of roster) {
    const data = submission.data || {};
    const expected = sessionFor(data);
    const assigned = clean(data.assigned_session, 80);
    if (!expected) {
      anomalies.push(`${clean(submission.id) || "Unknown submission"}: graduation year needs review`);
    } else if (assigned && assigned !== expected.time) {
      anomalies.push(`${clean(submission.id) || "Unknown submission"}: assigned session does not match graduation year`);
    }
  }
  return anomalies;
}

export function buildReport({
  miniCampSubmissions = [],
  futuresSubmissions = [],
  futuresAuditAvailable = true,
  period,
}) {
  if (!period?.active) throw new Error("An active report period is required");

  const deduped = dedupeRegistrations(miniCampSubmissions, period.cutoff);
  const roster = deduped.roster.map((submission) => registrationView(submission));
  const newRegistrations = roster.filter((record) => record.timestamp >= period.windowStart.getTime());
  const officialIdentities = new Set(roster.map((record) => record.identity).filter(Boolean));

  let futuresCandidateCount = 0;
  let futuresMatchedCount = 0;
  let possibleMisroutes = [];
  if (futuresAuditAvailable) {
    const futuresCandidates = dedupeRegistrations(
      futuresSubmissions.filter((submission) => isPossibleFuturesMisroute(submission, period.cutoff.getTime())),
      period.cutoff,
    ).roster.map((submission) => registrationView(submission, "Futures form"));
    futuresCandidateCount = futuresCandidates.length;
    const matched = futuresCandidates.filter((record) => record.identity && officialIdentities.has(record.identity));
    futuresMatchedCount = matched.length;
    possibleMisroutes = futuresCandidates.filter((record) => !record.identity || !officialIdentities.has(record.identity));
  }

  const sessionTotals = SESSIONS.map((session) => {
    const count = roster.filter((record) => record.sessionKey === session.key).length;
    return {
      ...session,
      count,
      remaining: Math.max(0, SESSION_CAPACITY - count),
      atCapacity: count >= SESSION_CAPACITY,
    };
  });

  return {
    dateKey: period.dateKey,
    cutoff: period.cutoff,
    windowStart: period.windowStart,
    roster,
    newRegistrations,
    sessionTotals,
    possibleMisroutes,
    futuresAuditAvailable,
    futuresCandidateCount,
    futuresMatchedCount,
    duplicateCount: deduped.duplicateCount,
    exceptions: [
      ...deduped.invalidTimestamps.map((id) => `${id}: invalid submission timestamp`),
      ...deduped.missingIdentity.map((id) => `${id}: missing player, email, or graduation-year identity`),
      ...sessionAnomalies(deduped.roster),
    ],
  };
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    ...options,
  }).format(new Date(value));
}

function formatReportDate(value) {
  return formatDate(value, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTimestamp(value) {
  return formatDate(value, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function escapeHtml(value) {
  return clean(value, 5000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function registrationRows(records, emptyMessage) {
  if (records.length === 0) {
    return `<tr><td colspan="6" style="padding:14px;color:#666;border-bottom:1px solid #e8e8e8">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return records.map((record) => {
    const playerDetails = [record.position, record.schoolTown, record.currentTeam].filter(Boolean).join(" · ");
    return `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top;white-space:nowrap">${escapeHtml(formatTimestamp(record.timestamp))}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top"><strong>${escapeHtml(record.playerName || "Needs review")}</strong>${playerDetails ? `<br><span style="color:#666">${escapeHtml(playerDetails)}</span>` : ""}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top"><strong>${escapeHtml(record.gradYear || "—")}</strong><br><span style="color:#666">${escapeHtml(record.session)}</span></td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top">${escapeHtml(record.parentName || "—")}<br><a href="mailto:${escapeHtml(record.parentEmail)}" style="color:#b51f29">${escapeHtml(record.parentEmail || "—")}</a></td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top;white-space:nowrap">${escapeHtml(record.parentPhone || "—")}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top;color:#8a5a00;font-weight:700">QuickBooks match needed</td>
    </tr>`;
  }).join("");
}

function reportTable(records, emptyMessage) {
  return `<div style="overflow-x:auto"><table role="table" style="width:100%;border-collapse:collapse;font-size:13px;line-height:1.35">
    <thead><tr style="background:#f3f3f3;text-align:left">
      <th style="padding:9px 8px">Submitted ET</th><th style="padding:9px 8px">Player</th><th style="padding:9px 8px">Grad / session</th><th style="padding:9px 8px">Parent</th><th style="padding:9px 8px">Phone</th><th style="padding:9px 8px">Payment</th>
    </tr></thead><tbody>${registrationRows(records, emptyMessage)}</tbody>
  </table></div>`;
}

export function renderReportHtml(report) {
  const exceptionItems = [
    ...(report.duplicateCount > 0 ? [`${report.duplicateCount} duplicate submission${report.duplicateCount === 1 ? "" : "s"} collapsed in the roster.`] : []),
    ...report.exceptions,
    ...(!report.futuresAuditAvailable ? ["The Futures-form cross-check was unavailable for this run; review that form manually."] : []),
  ];
  const sessionRows = report.sessionTotals.map((session) => `<tr>
    <td style="padding:10px;border-bottom:1px solid #e8e8e8"><strong>${escapeHtml(session.label)}</strong></td>
    <td style="padding:10px;border-bottom:1px solid #e8e8e8;text-align:center">${session.count}</td>
    <td style="padding:10px;border-bottom:1px solid #e8e8e8;text-align:center;${session.atCapacity ? "color:#b51f29;font-weight:800" : ""}">${session.atCapacity ? "FULL / REVIEW" : session.remaining}</td>
  </tr>`).join("");
  const auditSummary = report.futuresAuditAvailable
    ? `${report.futuresCandidateCount} eligible Girls Futures submission${report.futuresCandidateCount === 1 ? "" : "s"} since Aug. 6; ${report.futuresMatchedCount} already matched to the Mini Camp roster.`
    : "Futures cross-check unavailable for this run.";

  return `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#171717">
  <div style="max-width:980px;margin:0 auto;padding:22px">
    <div style="background:#111;color:#fff;padding:24px 28px;border-top:7px solid #d22630">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ddd">BTB × Bearded Lax</div>
      <h1 style="margin:7px 0 4px;font-size:25px">Girls Mini Camp Registration Report</h1>
      <div style="color:#ddd">As of 8:00 AM ET · ${escapeHtml(formatReportDate(report.cutoff))}</div>
    </div>
    <div style="background:#fff;padding:24px 28px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px">
        <div style="background:#f4f4f4;border-left:4px solid #d22630;padding:12px 16px"><strong style="font-size:24px">${report.roster.length}</strong><br><span style="color:#666">saved total</span></div>
        <div style="background:#f4f4f4;border-left:4px solid #111;padding:12px 16px"><strong style="font-size:24px">${report.newRegistrations.length}</strong><br><span style="color:#666">new / updated since yesterday</span></div>
        <div style="background:#fff4df;border-left:4px solid #d59100;padding:12px 16px"><strong style="font-size:24px">${report.possibleMisroutes.length}</strong><br><span style="color:#6c4a00">possible Futures misroutes</span></div>
      </div>

      <div style="background:#fff4df;border:1px solid #ebc978;padding:14px 16px;margin-bottom:24px;line-height:1.45">
        <strong>Payment status:</strong> the website saves each registration before opening QuickBooks checkout. This report cannot confirm payment; every registration must be matched in QuickBooks before it is marked paid.
      </div>

      <h2 style="font-size:19px;margin:0 0 10px">Session totals</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:26px"><thead><tr style="background:#f3f3f3;text-align:left"><th style="padding:10px">Session</th><th style="padding:10px;text-align:center">Saved</th><th style="padding:10px;text-align:center">Estimated spots left (of ${SESSION_CAPACITY})</th></tr></thead><tbody>${sessionRows}</tbody></table>
      <p style="margin:-16px 0 26px;color:#666;font-size:12px">Capacity is a best-effort estimate from deduplicated saved submissions. Confirm manual transfers and QuickBooks payment separately.</p>

      <h2 style="font-size:19px;margin:0 0 5px">New / updated since the prior 8:00 AM report</h2>
      <p style="margin:0 0 10px;color:#666;font-size:13px">Window: ${escapeHtml(formatTimestamp(report.windowStart))} through ${escapeHtml(formatTimestamp(report.cutoff))} ET.</p>
      ${reportTable(report.newRegistrations, "No new or updated Mini Camp registrations in this reporting window.")}

      <h2 style="font-size:19px;margin:28px 0 5px">Possible registrations submitted through Futures</h2>
      <p style="margin:0 0 10px;color:#666;font-size:13px">${escapeHtml(auditSummary)} Unmatched eligible entries are shown below for review.</p>
      ${reportTable(report.possibleMisroutes, "No unmatched eligible Futures submissions found.")}

      <h2 style="font-size:19px;margin:28px 0 10px">Current Mini Camp roster</h2>
      ${reportTable(report.roster, "No saved Mini Camp registrations found.")}

      ${exceptionItems.length ? `<div style="margin-top:24px;background:#fff1f1;border:1px solid #efb4b4;padding:14px 16px"><strong>Data checks requiring attention</strong><ul style="margin:8px 0 0;padding-left:20px">${exceptionItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
    </div>
    <div style="padding:15px 28px;background:#e9e9e9;color:#666;font-size:12px">Automatic daily report · Final scheduled email: August 19, 2026 · Be The Best Lacrosse Club</div>
  </div>
  </body></html>`;
}

export function renderReportText(report) {
  const lines = [
    "BTB x Bearded Lax Girls Mini Camp Registration Report",
    `As of 8:00 AM ET - ${formatReportDate(report.cutoff)}`,
    "",
    `${report.roster.length} saved total; ${report.newRegistrations.length} new/updated since yesterday; ${report.possibleMisroutes.length} possible Futures misroutes.`,
    "Payment status: saved registrations still require a manual QuickBooks payment match.",
    "",
    "SESSION TOTALS",
    ...report.sessionTotals.map((session) => `${session.label}: ${session.count} saved, ${session.atCapacity ? "FULL / REVIEW" : `${session.remaining} estimated spots left`}`),
    "",
    "NEW / UPDATED",
    ...(report.newRegistrations.length ? report.newRegistrations.map((record) => `${formatTimestamp(record.timestamp)} ET | ${record.playerName} | ${record.gradYear} | ${record.session} | ${record.parentName} | ${record.parentEmail} | ${record.parentPhone} | QuickBooks match needed`) : ["None"]),
    "",
    "POSSIBLE FUTURES MISROUTES",
    ...(report.futuresAuditAvailable
      ? (report.possibleMisroutes.length ? report.possibleMisroutes.map((record) => `${formatTimestamp(record.timestamp)} ET | ${record.playerName} | ${record.gradYear} | ${record.parentName} | ${record.parentEmail} | ${record.parentPhone}`) : ["None"])
      : ["Futures cross-check unavailable; review manually."]),
    "",
    "CURRENT ROSTER",
    ...(report.roster.length ? report.roster.map((record) => `${formatTimestamp(record.timestamp)} ET | ${record.playerName} | ${record.gradYear} | ${record.session} | ${record.parentName} | ${record.parentEmail} | ${record.parentPhone} | QuickBooks match needed`) : ["None"]),
  ];
  return lines.join("\n");
}

export async function fetchFormSubmissions(formId, { token, fetchImpl = fetch } = {}) {
  if (!token) throw new Error("NETLIFY_API_TOKEN is not configured");
  const submissions = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetchImpl(
      `https://api.netlify.com/api/v1/forms/${encodeURIComponent(formId)}/submissions?per_page=${PAGE_SIZE}&page=${page}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error(`Netlify form ${formId} returned ${response.status}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error(`Netlify form ${formId} returned an invalid response`);
    submissions.push(...batch);
    if (batch.length < PAGE_SIZE) return submissions;
  }

  throw new Error(`Netlify form ${formId} exceeded the ${MAX_PAGES * PAGE_SIZE}-submission report limit`);
}

export async function sendReportEmail(report, { env = process.env, fetchImpl = fetch } = {}) {
  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL;
  const senderName = env.BREVO_SENDER_NAME || "BTB Lacrosse";
  if (!apiKey || !senderEmail) throw new Error("Brevo report email environment variables are not configured");

  const newLabel = report.newRegistrations.length === 1 ? "1 new" : `${report.newRegistrations.length} new`;
  const subject = `BTB Mini Camp Registrations — ${report.roster.length} total, ${newLabel} — ${formatDate(report.cutoff, { month: "short", day: "numeric" })}`;
  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: REPORT_RECIPIENTS,
    replyTo: { email: senderEmail, name: senderName },
    subject,
    htmlContent: renderReportHtml(report),
    textContent: renderReportText(report),
  };

  let response;
  try {
    response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (cause) {
    const error = new Error(`Brevo report email request did not return: ${cause?.message || "network error"}`);
    error.deliveryUncertain = true;
    error.cause = cause;
    throw error;
  }
  let responseText = "";
  try {
    responseText = await response.text();
  } catch (cause) {
    if (response.ok) return { subject };
    const error = new Error(`Brevo report email rejection could not be read: ${cause?.message || "response error"}`);
    error.deliveryRejected = true;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Brevo report email returned ${response.status}: ${responseText.slice(0, 200)}`);
    error.deliveryRejected = true;
    throw error;
  }

  let result = {};
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = {};
  }
  return { ...result, subject };
}

export async function runDailyRegistrationReport({
  now = new Date(),
  env = process.env,
  fetchImpl = fetch,
  store = getStore({ name: REPORT_STORE, consistency: "strong" }),
} = {}) {
  const period = reportPeriodFor(now);
  if (!period.active) return { status: "skipped", reason: "outside-report-window", dateKey: period.dateKey };
  if (new Date(now).getTime() < period.cutoff.getTime()) {
    return { status: "skipped", reason: "before-report-cutoff", dateKey: period.dateKey };
  }

  const sentKey = `sent/${period.dateKey}`;
  const claim = await store.setJSON(sentKey, {
    status: "sending",
    claimedAt: new Date().toISOString(),
  }, { onlyIfNew: true });
  if (!claim.modified) {
    const existing = await store.get(sentKey, { type: "json" });
    const reason = existing?.status === "sent"
      ? "already-sent"
      : existing?.status === "delivery-uncertain"
        ? "delivery-uncertain"
        : "delivery-in-progress";
    return { status: "skipped", reason, dateKey: period.dateKey };
  }

  const token = env.NETLIFY_API_TOKEN || env.NETLIFY_AUTH_TOKEN;
  let report;
  let emailResult;
  try {
    const [miniCampResult, futuresResult] = await Promise.allSettled([
      fetchFormSubmissions(MINI_CAMP_FORM_ID, { token, fetchImpl }),
      fetchFormSubmissions(FUTURES_FORM_ID, { token, fetchImpl }),
    ]);
    if (miniCampResult.status === "rejected") throw miniCampResult.reason;

    const futuresAuditAvailable = futuresResult.status === "fulfilled";
    if (!futuresAuditAvailable) console.error("Mini Camp report Futures cross-check failed:", futuresResult.reason?.message || "unknown error");
    report = buildReport({
      miniCampSubmissions: miniCampResult.value,
      futuresSubmissions: futuresAuditAvailable ? futuresResult.value : [],
      futuresAuditAvailable,
      period,
    });
    emailResult = await sendReportEmail(report, { env, fetchImpl });
  } catch (error) {
    if (error?.deliveryUncertain) {
      try {
        await store.setJSON(sentKey, {
          status: "delivery-uncertain",
          attemptedAt: new Date().toISOString(),
          reason: clean(error.message, 300),
        });
      } catch (stateError) {
        console.error("Mini Camp report could not record uncertain delivery:", stateError?.message || stateError);
      }
    } else {
      try {
        await store.delete(sentKey);
      } catch (deleteError) {
        console.error("Mini Camp report could not release its delivery claim:", deleteError?.message || deleteError);
      }
    }
    throw error;
  }

  await store.setJSON(sentKey, {
    status: "sent",
    sentAt: new Date().toISOString(),
    messageId: clean(emailResult.messageId, 200),
    recipients: REPORT_RECIPIENTS.map((recipient) => recipient.email),
    total: report.roster.length,
    newOrUpdated: report.newRegistrations.length,
    possibleMisroutes: report.possibleMisroutes.length,
  });

  return {
    status: "sent",
    dateKey: period.dateKey,
    total: report.roster.length,
    newOrUpdated: report.newRegistrations.length,
    possibleMisroutes: report.possibleMisroutes.length,
    subject: emailResult.subject,
  };
}

export default async () => {
  try {
    const result = await runDailyRegistrationReport();
    console.log("Mini Camp daily registration report:", JSON.stringify(result));
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Mini Camp daily registration report failed:", error?.message || error);
    throw error;
  }
};

export const config = {
  schedule: "0 12 * * *",
};
