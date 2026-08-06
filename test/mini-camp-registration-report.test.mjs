import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReport,
  dedupeRegistrations,
  fetchFormSubmissions,
  registrationIdentity,
  renderReportHtml,
  reportPeriodFor,
  REPORT_RECIPIENTS,
  runDailyRegistrationReport,
} from "../netlify/functions/mini-camp-registration-report.mjs";

function submission(id, createdAt, overrides = {}) {
  return {
    id,
    created_at: createdAt,
    data: {
      player_first_name: "Ava",
      player_last_name: "Tester",
      grad_year: "2035",
      assigned_session: "5:00 PM–6:00 PM",
      position: "Midfield",
      school_town: "Massapequa",
      parent_first_name: "Pat",
      parent_last_name: "Tester",
      parent_email: "pat@example.com",
      parent_phone: "516-555-0100",
      program_gender: "Girls",
      ...overrides,
    },
  };
}

function memoryStore() {
  const values = new Map();
  return {
    values,
    async get(key) {
      return values.get(key) ?? null;
    },
    async setJSON(key, value, options = {}) {
      if (options.onlyIfNew && values.has(key)) return { modified: false };
      values.set(key, value);
      return { modified: true };
    },
    async delete(key) {
      values.delete(key);
    },
  };
}

test("report period runs at 8 AM ET through the first clinic day only", () => {
  assert.equal(reportPeriodFor("2026-08-06T12:00:00.000Z").active, false);

  const first = reportPeriodFor("2026-08-07T12:00:00.000Z");
  assert.equal(first.active, true);
  assert.equal(first.dateKey, "2026-08-07");
  assert.equal(first.windowStart.toISOString(), "2026-08-06T12:00:00.000Z");
  assert.equal(first.cutoff.toISOString(), "2026-08-07T12:00:00.000Z");

  assert.equal(reportPeriodFor("2026-08-19T12:00:00.000Z").active, true);
  assert.equal(reportPeriodFor("2026-08-20T12:00:00.000Z").active, false);
});

test("registration identity keeps siblings separate and normalizes casing", () => {
  const first = registrationIdentity({
    parent_email: " Parent@Example.com ",
    player_first_name: " Ava ",
    player_last_name: " Smith ",
    grad_year: "2034",
  });
  const same = registrationIdentity({
    parent_email: "parent@example.com",
    player_first_name: "AVA",
    player_last_name: "SMITH",
    grad_year: "2034",
  });
  const sibling = registrationIdentity({
    parent_email: "parent@example.com",
    player_first_name: "Emma",
    player_last_name: "Smith",
    grad_year: "2034",
  });

  assert.equal(first, same);
  assert.notEqual(first, sibling);
});

test("deduplication retains the latest submission and flags malformed rows", () => {
  const rows = [
    submission("old", "2026-08-05T15:00:00.000Z"),
    submission("new", "2026-08-06T15:00:00.000Z", { parent_phone: "516-555-0199" }),
    submission("sibling", "2026-08-06T16:00:00.000Z", { player_first_name: "Emma" }),
    submission("missing", "2026-08-06T17:00:00.000Z", { parent_email: "" }),
    submission("bad-time", "not-a-date"),
    submission("future", "2026-08-07T13:00:00.000Z", { player_first_name: "Future" }),
  ];

  const result = dedupeRegistrations(rows, new Date("2026-08-07T12:00:00.000Z"));
  assert.equal(result.roster.length, 2);
  assert.equal(result.roster[0].id, "new");
  assert.equal(result.roster[1].id, "sibling");
  assert.equal(result.duplicateCount, 1);
  assert.deepEqual(result.missingIdentity, ["missing"]);
  assert.deepEqual(result.invalidTimestamps, ["bad-time"]);
});

test("report calculates session totals, new registrations, and Futures misroutes", () => {
  const period = reportPeriodFor("2026-08-07T12:00:00.000Z");
  const miniCamp = [
    submission("ava-old", "2026-08-05T15:00:00.000Z"),
    submission("ava-latest", "2026-08-06T15:00:00.000Z"),
    submission("emma", "2026-08-06T16:00:00.000Z", {
      player_first_name: "Emma",
      grad_year: "2032",
      assigned_session: "7:00 PM–8:00 PM",
    }),
  ];
  const futures = [
    submission("futures-match", "2026-08-06T14:00:00.000Z"),
    submission("futures-review", "2026-08-06T17:00:00.000Z", {
      player_first_name: "Mia",
      player_last_name: "Review",
      parent_email: "mia@example.com",
      grad_year: "2034",
    }),
    submission("old-futures", "2026-08-05T14:00:00.000Z", {
      player_first_name: "Old",
      parent_email: "old@example.com",
    }),
    submission("boys-futures", "2026-08-06T18:00:00.000Z", {
      player_first_name: "Ben",
      parent_email: "ben@example.com",
      program_gender: "Boys",
    }),
  ];

  const report = buildReport({ miniCampSubmissions: miniCamp, futuresSubmissions: futures, period });
  assert.equal(report.roster.length, 2);
  assert.equal(report.newRegistrations.length, 2);
  assert.deepEqual(report.sessionTotals.map((session) => session.count), [1, 0, 1]);
  assert.equal(report.futuresCandidateCount, 2);
  assert.equal(report.futuresMatchedCount, 1);
  assert.equal(report.possibleMisroutes.length, 1);
  assert.equal(report.possibleMisroutes[0].playerName, "Mia Review");

  const html = renderReportHtml(report);
  assert.match(html, /cannot confirm payment/i);
  assert.match(html, /QuickBooks match needed/);
  assert.match(html, /Mia Review/);
});

test("Netlify form retrieval paginates without silently truncating", async () => {
  const calls = [];
  const pageOne = Array.from({ length: 100 }, (_, index) => ({ id: `row-${index}` }));
  const fetchImpl = async (url) => {
    calls.push(url);
    const page = new URL(url).searchParams.get("page");
    return {
      ok: true,
      status: 200,
      async json() {
        return page === "1" ? pageOne : [{ id: "last" }];
      },
    };
  };

  const rows = await fetchFormSubmissions("form-id", { token: "token", fetchImpl });
  assert.equal(rows.length, 101);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /page=2$/);
});

test("daily run emails both recipients once and records successful delivery", async () => {
  const store = memoryStore();
  const emailPayloads = [];
  const miniCampRows = [submission("one", "2026-08-06T15:00:00.000Z")];
  const fetchImpl = async (url, init = {}) => {
    const parsed = new URL(url);
    if (parsed.hostname === "api.netlify.com" && parsed.pathname === "/api/v1/forms/6a7395e531cdab00081c68b3/submissions") {
      return { ok: true, status: 200, async json() { return miniCampRows; } };
    }
    if (parsed.hostname === "api.netlify.com") {
      return { ok: true, status: 200, async json() { return []; } };
    }
    if (parsed.hostname === "api.brevo.com" && parsed.pathname === "/v3/smtp/email") {
      emailPayloads.push(JSON.parse(init.body));
      return { ok: true, status: 201, async text() { return JSON.stringify({ messageId: "message-1" }); } };
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const env = {
    NETLIFY_AUTH_TOKEN: "netlify-token",
    BREVO_API_KEY: "brevo-key",
    BREVO_SENDER_EMAIL: "info@bethebestli.com",
    BREVO_SENDER_NAME: "BTB Lacrosse",
  };

  const first = await runDailyRegistrationReport({
    now: new Date("2026-08-07T12:01:00.000Z"),
    env,
    fetchImpl,
    store,
  });
  const second = await runDailyRegistrationReport({
    now: new Date("2026-08-07T16:00:00.000Z"),
    env,
    fetchImpl,
    store,
  });

  assert.equal(first.status, "sent");
  assert.equal(second.reason, "already-sent");
  assert.equal(emailPayloads.length, 1);
  assert.deepEqual(emailPayloads[0].to, REPORT_RECIPIENTS);
  assert.match(emailPayloads[0].subject, /1 total, 1 new/);
  assert.equal(store.values.get("sent/2026-08-07").messageId, "message-1");
});

test("no email or data request runs after the first clinic day", async () => {
  let fetchCalls = 0;
  const result = await runDailyRegistrationReport({
    now: new Date("2026-08-20T12:00:00.000Z"),
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error("should not run");
    },
    store: memoryStore(),
  });

  assert.equal(result.reason, "outside-report-window");
  assert.equal(fetchCalls, 0);
});

test("a manual run before 8 AM cannot suppress the scheduled report", async () => {
  let fetchCalls = 0;
  const store = memoryStore();
  const result = await runDailyRegistrationReport({
    now: new Date("2026-08-07T11:59:59.000Z"),
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error("should not run");
    },
    store,
  });

  assert.equal(result.reason, "before-report-cutoff");
  assert.equal(fetchCalls, 0);
  assert.equal(store.values.size, 0);
});

test("an atomic delivery claim prevents concurrent duplicate emails", async () => {
  const store = memoryStore();
  let emails = 0;
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.hostname === "api.netlify.com") {
      return { ok: true, status: 200, async json() { return []; } };
    }
    emails += 1;
    return { ok: true, status: 201, async text() { return "{}"; } };
  };
  const options = {
    now: new Date("2026-08-08T12:00:00.000Z"),
    env: {
      NETLIFY_API_TOKEN: "netlify-token",
      BREVO_API_KEY: "brevo-key",
      BREVO_SENDER_EMAIL: "info@bethebestli.com",
    },
    fetchImpl,
    store,
  };

  const results = await Promise.all([
    runDailyRegistrationReport(options),
    runDailyRegistrationReport(options),
  ]);
  assert.equal(results.filter((result) => result.status === "sent").length, 1);
  assert.equal(results.filter((result) => result.status === "skipped").length, 1);
  assert.equal(emails, 1);
});

test("a post-delivery state failure does not allow a duplicate retry", async () => {
  const store = memoryStore();
  const originalSetJSON = store.setJSON.bind(store);
  store.setJSON = async (key, value, options = {}) => {
    if (value.status === "sent") throw new Error("simulated Blob write failure");
    return originalSetJSON(key, value, options);
  };
  let emails = 0;
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.hostname === "api.netlify.com") {
      return { ok: true, status: 200, async json() { return []; } };
    }
    emails += 1;
    return { ok: true, status: 201, async text() { return JSON.stringify({ messageId: "accepted" }); } };
  };
  const options = {
    now: new Date("2026-08-09T12:00:00.000Z"),
    env: {
      NETLIFY_API_TOKEN: "netlify-token",
      BREVO_API_KEY: "brevo-key",
      BREVO_SENDER_EMAIL: "info@bethebestli.com",
    },
    fetchImpl,
    store,
  };

  await assert.rejects(runDailyRegistrationReport(options), /simulated Blob write failure/);
  const retry = await runDailyRegistrationReport(options);
  assert.equal(retry.reason, "delivery-in-progress");
  assert.equal(emails, 1);
});
