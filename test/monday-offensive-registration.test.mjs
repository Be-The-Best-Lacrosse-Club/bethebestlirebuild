import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SESSION_DATES,
  TRAINING_GROUPS,
  buildGroupCounts,
  createHandler,
  groupForName,
  validateMondayRegistration,
} from "../netlify/functions/monday-offensive-registration.mjs";

const validRegistration = {
  training_group: "Boys Monday Night",
  player_first_name: "Test",
  player_last_name: "Player",
  player_dob: "2014-05-01",
  grad_year: "2032",
  btb_team: "2032 Cannons",
  position: "Attack",
  school_town: "Test Town",
  parent_first_name: "Test",
  parent_last_name: "Parent",
  parent_email: "parent@example.com",
  parent_phone: "(516) 555-0100",
  address_street: "10 Test Street",
  address_city: "Deer Park",
  address_state: "NY",
  address_zip: "11729",
  emergency_name: "Emergency Contact",
  emergency_phone: "516-555-0101",
  medical_notes: "None",
  waiver_accepted: "Yes",
  media_release: "No",
};

function memoryStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    async get(key) {
      const value = values.get(key);
      return value === undefined ? null : JSON.parse(value);
    },
    async list({ prefix }) {
      return { blobs: [...values.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })) };
    },
    async set(key, value, options = {}) {
      if (options.onlyIfNew && values.has(key)) return { modified: false };
      values.set(key, value);
      return { modified: true };
    },
    async setJSON(key, value) {
      values.set(key, JSON.stringify(value));
    },
    async delete(key) {
      values.delete(key);
    },
  };
}

test("Monday offensive training has six dates and exactly two separately tracked groups", () => {
  assert.deepEqual(SESSION_DATES, [
    "September 14, 2026",
    "September 21, 2026",
    "September 28, 2026",
    "October 5, 2026",
    "October 12, 2026",
    "October 19, 2026",
  ]);
  assert.deepEqual(TRAINING_GROUPS, [
    { name: "Boys Monday Night", slug: "boys-monday-night", gender: "Boys" },
    { name: "Girls Monday Night", slug: "girls-monday-night", gender: "Girls" },
  ]);
  assert.equal(groupForName("Boys Monday Night")?.gender, "Boys");
  assert.equal(groupForName("Girls Monday Night")?.gender, "Girls");
  assert.equal(groupForName("Combined Monday Night"), null);
});

test("server validation requires the complete Lab-style player and family record", () => {
  assert.equal(validateMondayRegistration(validRegistration).error, undefined);

  const cases = [
    [{ ...validRegistration, training_group: "Combined Monday Night" }, "Please choose the boys or girls Monday night group."],
    [{ ...validRegistration, btb_team: "" }, "Required registration information is missing."],
    [{ ...validRegistration, medical_notes: "" }, "Required registration information is missing."],
    [{ ...validRegistration, parent_email: "not-an-email" }, "Please enter a valid parent email address."],
    [{ ...validRegistration, parent_phone: "555" }, "Please enter a valid parent mobile number."],
    [{ ...validRegistration, player_dob: "2014-02-31" }, "Please check the player's date of birth."],
    [{ ...validRegistration, grad_year: "2040" }, "Please choose a valid graduation year."],
    [{ ...validRegistration, position: "Quarterback" }, "Please choose a valid primary position."],
    [{ ...validRegistration, waiver_accepted: "" }, "The participation waiver must be accepted."],
  ];

  for (const [registration, expected] of cases) {
    assert.equal(validateMondayRegistration(registration).error, expected);
  }
});

test("public group totals stay separate and expose no player or family data", async () => {
  const store = memoryStore({
    "registrations/one": JSON.stringify({ group: "Boys Monday Night", parent_email: "private@example.com" }),
    "registrations/two": JSON.stringify({ group: "Boys Monday Night", medical_notes: "private" }),
    "registrations/three": JSON.stringify({ group: "Girls Monday Night", player_first_name: "Private" }),
  });
  const counts = await buildGroupCounts(store);

  assert.deepEqual(counts, [
    { name: "Boys Monday Night", gender: "Boys", count: 2 },
    { name: "Girls Monday Night", gender: "Girls", count: 1 },
  ]);
  assert.equal(JSON.stringify(counts).includes("private@example.com"), false);
  assert.equal(JSON.stringify(counts).includes("medical_notes"), false);
  assert.equal(JSON.stringify(counts).includes("player_first_name"), false);
});

test("registration saves one group count, forwards the summary, and stores no PII", async () => {
  const store = memoryStore({
    "registrations/existing-one": JSON.stringify({ group: "Boys Monday Night", status: "pending_payment" }),
    "registrations/existing-two": JSON.stringify({ group: "Girls Monday Night", status: "pending_payment" }),
  });
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
    now: () => new Date("2026-09-01T14:00:00.000Z"),
  });

  const response = await handler(new Request("http://localhost:5173/api/monday-offensive-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, group: "Boys Monday Night", count: 2 });
  assert.equal(formSubmissions.length, 1);
  assert.equal(formSubmissions[0]["form-name"], "btb-monday-offensive-training-registration");
  assert.equal(formSubmissions[0].program_gender, "Boys");
  assert.equal(formSubmissions[0].amount, "250");
  assert.equal(formSubmissions[0].group_registration_count, "2");
  assert.equal(formSubmissions[0].registration_status, "Pending QuickBooks payment verification");
  assert.equal(formSubmissions[0].payment_match_reference, "Test Player · parent@example.com");
  assert.equal(formSubmissions[0].session_dates, SESSION_DATES.join("; "));

  const savedRecord = [...store.values.entries()].find(([key]) => key.startsWith("registrations/") && !key.includes("existing"))[1];
  assert.equal(savedRecord.includes("parent@example.com"), false);
  assert.equal(savedRecord.includes("medical_notes"), false);
  assert.equal(savedRecord.includes("Test Player"), false);
});

test("one player cannot be double-counted by switching Monday groups", async () => {
  const store = memoryStore();
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
  });

  const first = await handler(new Request("http://localhost:5173/api/monday-offensive-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  assert.equal(first.status, 200);

  const duplicate = await handler(new Request("http://localhost:5173/api/monday-offensive-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ ...validRegistration, training_group: "Girls Monday Night" }),
  }));
  const duplicateBody = await duplicate.json();

  assert.deepEqual(duplicateBody, {
    ok: true,
    duplicate: true,
    group: "Boys Monday Night",
    count: 1,
  });
  assert.equal(formSubmissions.length, 1);
  assert.deepEqual(await buildGroupCounts(store), [
    { name: "Boys Monday Night", gender: "Boys", count: 1 },
    { name: "Girls Monday Night", gender: "Girls", count: 0 },
  ]);
});

test("public pages, route, QuickBooks handoff, and owner-only registration email stay aligned", async () => {
  const [registrationPage, parentTraining, newsletter, relay, netlifyConfig] = await Promise.all([
    readFile(new URL("../public/register-monday-offensive-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/parent-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
  ]);

  assert.match(registrationPage, /name="btb-monday-offensive-training-registration"/);
  assert.match(registrationPage, /Boys Monday Night/);
  assert.match(registrationPage, /Girls Monday Night/);
  assert.match(registrationPage, /September 14, 2026/);
  assert.match(registrationPage, /October 19, 2026/);
  assert.match(registrationPage, /const REGISTRATION_ENDPOINT = "\/api\/monday-offensive-registration"/);
  assert.match(registrationPage, /scs-v1-d7ed4f0985e8442391d477a68a779dc7b3e11703e8f548e3a3ec1afb9538ce130dba73afcce5431e9680a8065f5c54ed/);
  assert.match(registrationPage, /info@bethebestli\.com/);

  assert.match(parentTraining, /offense: "\/register-monday-offensive-training"/);
  assert.match(parentTraining, /Monday nights beginning September 14/);
  assert.match(newsletter, /href="https:\/\/www\.bethebestli\.com\/register-monday-offensive-training"/);
  assert.doesNotMatch(newsletter.match(/<h3>OFFENSIVE TRAINING[\s\S]*?<h3>BOYS FACE-OFF/)?.[0] || "", /COMING SOON/i);
  assert.match(netlifyConfig, /from = "\/register-monday-offensive-training"[\s\S]*?to = "\/register-monday-offensive-training\.html"/);

  assert.match(relay, /const MONDAY_OFFENSIVE_NOTIFY_EMAIL = "info@bethebestli\.com"/);
  assert.match(relay, /const emails = isMondayOffensive\s*\? \[MONDAY_OFFENSIVE_NOTIFY_EMAIL\]/);
  assert.match(relay, /Monday Offensive Training — REGISTRATION SAVED \/ PAYMENT PENDING/);
  assert.match(relay, /\$\{data\.training_group \|\| "Monday Night"\} · \$\{data\.group_registration_count \|\| "\?"\} registered/);
  assert.match(relay, /COMPLETE \$250 PAYMENT/);
  assert.match(relay, /separate QuickBooks payment-received email/);
});
