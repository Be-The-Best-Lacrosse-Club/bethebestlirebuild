import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SESSION_DATES,
  TRAINING_GROUPS,
  buildGroupCounts,
  createHandler,
  groupForName,
  validateBoysTrainingRegistration,
} from "../netlify/functions/boys-training-registration.mjs";

const EARLY_GROUP = "Boys 2036–2034 · 6:00–7:00 PM";
const LATE_GROUP = "Boys 2033–2031 · 7:00–8:00 PM";
const PAYMENT_TOKEN = "scs-v1-d7ed4f0985e8442391d477a68a779dc7b3e11703e8f548e3a3ec1afb9538ce130dba73afcce5431e9680a8065f5c54ed";

const validRegistration = {
  training_group: EARLY_GROUP,
  player_first_name: "Test",
  player_last_name: "Player",
  player_dob: "2014-05-01",
  grad_year: "2034",
  btb_team: "2034 Boys",
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

test("Friday boys training has the six requested dates and two separately tracked groups", () => {
  assert.deepEqual(SESSION_DATES, [
    "September 18, 2026",
    "September 25, 2026",
    "October 2, 2026",
    "October 9, 2026",
    "October 23, 2026",
    "October 30, 2026",
  ]);
  assert.deepEqual(TRAINING_GROUPS, [
    {
      name: EARLY_GROUP,
      slug: "boys-2036-2034-6pm",
      gender: "Boys",
      gradYears: ["2036", "2035", "2034"],
      time: "6:00–7:00 PM",
    },
    {
      name: LATE_GROUP,
      slug: "boys-2033-2031-7pm",
      gender: "Boys",
      gradYears: ["2033", "2032", "2031"],
      time: "7:00–8:00 PM",
    },
  ]);
  assert.equal(groupForName(EARLY_GROUP)?.gender, "Boys");
  assert.equal(groupForName(LATE_GROUP)?.gender, "Boys");
  assert.equal(groupForName("Girls 2036–2034 · 7:00–8:00 PM"), null);
});

test("server validation requires a complete boys player record and the matching age group", () => {
  assert.equal(validateBoysTrainingRegistration(validRegistration).error, undefined);
  assert.equal(validateBoysTrainingRegistration({ ...validRegistration, position: "Faceoff Specialist" }).error, undefined);
  assert.equal(validateBoysTrainingRegistration({ ...validRegistration, position: "Long-Stick Midfield" }).error, undefined);

  const cases = [
    [{ ...validRegistration, training_group: "Girls Friday Night" }, "Please choose one of the two boys Friday training groups."],
    [{ ...validRegistration, btb_team: "" }, "Required registration information is missing."],
    [{ ...validRegistration, medical_notes: "" }, "Required registration information is missing."],
    [{ ...validRegistration, parent_email: "not-an-email" }, "Please enter a valid parent email address."],
    [{ ...validRegistration, parent_phone: "555" }, "Please enter a valid parent mobile number."],
    [{ ...validRegistration, player_dob: "2014-02-31" }, "Please check the player's date of birth."],
    [{ ...validRegistration, grad_year: "2030" }, "Boys Friday training is open to graduation years 2036 through 2031."],
    [{ ...validRegistration, training_group: LATE_GROUP }, "Please choose the boys group that matches the player's graduation year."],
    [{ ...validRegistration, position: "Draw Specialist" }, "Please choose a valid primary position."],
    [{ ...validRegistration, position: "Quarterback" }, "Please choose a valid primary position."],
    [{ ...validRegistration, waiver_accepted: "" }, "The participation waiver must be accepted."],
  ];

  for (const [registration, expected] of cases) {
    assert.equal(validateBoysTrainingRegistration(registration).error, expected);
  }
});

test("public boys group totals stay separate and expose no player or family data", async () => {
  const store = memoryStore({
    "registrations/one": JSON.stringify({ group: EARLY_GROUP, parent_email: "private@example.com" }),
    "registrations/two": JSON.stringify({ group: EARLY_GROUP, medical_notes: "private" }),
    "registrations/three": JSON.stringify({ group: LATE_GROUP, player_first_name: "Private" }),
  });
  const counts = await buildGroupCounts(store);

  assert.deepEqual(counts, [
    { name: EARLY_GROUP, gender: "Boys", gradYears: ["2036", "2035", "2034"], time: "6:00–7:00 PM", count: 2 },
    { name: LATE_GROUP, gender: "Boys", gradYears: ["2033", "2032", "2031"], time: "7:00–8:00 PM", count: 1 },
  ]);
  assert.equal(JSON.stringify(counts).includes("private@example.com"), false);
  assert.equal(JSON.stringify(counts).includes("medical_notes"), false);
  assert.equal(JSON.stringify(counts).includes("player_first_name"), false);
});

test("boys registration saves one group count, forwards the summary, and stores no PII", async () => {
  const store = memoryStore({
    "registrations/existing-one": JSON.stringify({ group: EARLY_GROUP, status: "pending_payment" }),
    "registrations/existing-two": JSON.stringify({ group: LATE_GROUP, status: "pending_payment" }),
  });
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
    now: () => new Date("2026-09-02T14:00:00.000Z"),
  });

  const response = await handler(new Request("http://localhost:5173/api/boys-training-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, group: EARLY_GROUP, count: 2 });
  assert.equal(formSubmissions.length, 1);
  assert.equal(formSubmissions[0]["form-name"], "btb-boys-training-registration");
  assert.equal(formSubmissions[0].program, "BTB Boys Friday Offensive Training with Coach Dan — 6 Sessions");
  assert.equal(formSubmissions[0].program_gender, "Boys");
  assert.equal(formSubmissions[0].training_time, "6:00–7:00 PM");
  assert.equal(formSubmissions[0].group_grad_years, "2036, 2035, 2034");
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

test("one player cannot be double-counted by switching Friday groups", async () => {
  const store = memoryStore();
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
  });

  const first = await handler(new Request("http://localhost:5173/api/boys-training-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  assert.equal(first.status, 200);

  const duplicate = await handler(new Request("http://localhost:5173/api/boys-training-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ ...validRegistration, training_group: LATE_GROUP, grad_year: "2032" }),
  }));
  const duplicateBody = await duplicate.json();

  assert.deepEqual(duplicateBody, {
    ok: true,
    duplicate: true,
    group: EARLY_GROUP,
    count: 1,
  });
  assert.equal(formSubmissions.length, 1);
  assert.deepEqual(await buildGroupCounts(store), [
    { name: EARLY_GROUP, gender: "Boys", gradYears: ["2036", "2035", "2034"], time: "6:00–7:00 PM", count: 1 },
    { name: LATE_GROUP, gender: "Boys", gradYears: ["2033", "2032", "2031"], time: "7:00–8:00 PM", count: 0 },
  ]);
});

test("boys page, dedicated route and store, QuickBooks handoff, and registration emails stay aligned", async () => {
  const [registrationPage, registrationFunction, parentTraining, newsletter, relay, netlifyConfig] = await Promise.all([
    readFile(new URL("../public/register-boys-training.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/boys-training-registration.mjs", import.meta.url), "utf8"),
    readFile(new URL("../public/parent-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
  ]);

  assert.match(registrationPage, /name="btb-boys-training-registration"/);
  assert.match(registrationPage, /BOYS FRIDAY/);
  assert.match(registrationPage, /TRAINING WITH COACH DAN/);
  assert.match(registrationPage, /Boys 2036–2034 · 6:00–7:00 PM/);
  assert.match(registrationPage, /Boys 2033–2031 · 7:00–8:00 PM/);
  assert.match(registrationPage, /Faceoff Specialist/);
  assert.match(registrationPage, /Long-Stick Midfield/);
  assert.doesNotMatch(registrationPage, /Draw Specialist/);
  assert.match(registrationPage, /September 18, 2026/);
  assert.match(registrationPage, /October 30, 2026/);
  assert.doesNotMatch(registrationPage, /October 16, 2026/);
  assert.match(registrationPage, /Momentum Sports/);
  assert.match(registrationPage, /10 Dunton Ave/);
  assert.match(registrationPage, /\$250/);
  assert.match(registrationPage, /const REGISTRATION_ENDPOINT = "\/api\/boys-training-registration"/);
  assert.match(registrationPage, new RegExp(PAYMENT_TOKEN));
  assert.match(registrationPage, /info@bethebestli\.com/);

  assert.match(registrationFunction, /const STORE_NAME = "boys-training-registrations"/);
  assert.match(registrationFunction, /const FORM_NAME = "btb-boys-training-registration"/);
  assert.doesNotMatch(registrationFunction, /monday-offensive-registrations/);

  assert.match(parentTraining, /href="\/register-boys-training"|boys[^\n]{0,120}: "\/register-boys-training"/i);
  assert.match(parentTraining, /2036&ndash;2034[^\n]{0,120}6:00&ndash;7:00 PM/);
  assert.match(parentTraining, /2033&ndash;2031[^\n]{0,120}7:00&ndash;8:00 PM/);
  assert.match(newsletter, /href="https:\/\/www\.bethebestli\.com\/register-boys-training"/);
  assert.match(newsletter, /BOYS FRIDAY/);
  assert.match(newsletter, /Boys 2036&ndash;2034[^\n]{0,120}6:00&ndash;7:00 PM/);
  assert.match(newsletter, /Boys 2033&ndash;2031[^\n]{0,120}7:00&ndash;8:00 PM/);
  assert.match(netlifyConfig, /from = "\/register-boys-training"[\s\S]*?to = "\/register-boys-training\.html"/);

  assert.match(relay, /btb-boys-training-registration/);
  assert.match(relay, /"btb-boys-training-registration": process\.env\.BREVO_LIST_TRYOUT/);
  assert.match(relay, /isBoysTraining[\s\S]*\[BOYS_TRAINING_NOTIFY_EMAIL\]/);
  const boysRegistrationForms = relay.match(/const BOYS_REGISTRATION_FORMS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || "";
  assert.doesNotMatch(boysRegistrationForms, /BOYS_TRAINING_FORM_NAME|btb-boys-training-registration/);
  assert.match(relay, /BTB Boys Friday Offensive Training with Coach Dan/);
  assert.match(relay, /COMPLETE \$250 PAYMENT/);
  assert.match(relay, /September 18/);
  assert.match(relay, /October 2, 9, 23, and 30, 2026/);
  assert.match(relay, new RegExp(PAYMENT_TOKEN));
  assert.match(relay, /separate QuickBooks payment-received email/);
});
