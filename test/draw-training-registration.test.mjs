import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SESSION_DATES,
  TRAINING_GROUPS,
  buildGroupCounts,
  config,
  createHandler,
  groupForName,
  validateDrawTrainingRegistration,
} from "../netlify/functions/draw-training-registration.mjs";

const DRAW_GROUP = "Girls Draw Training · 7:00–8:00 PM";

const validRegistration = {
  training_group: DRAW_GROUP,
  player_first_name: "Test",
  player_last_name: "Player",
  player_dob: "2014-05-01",
  grad_year: "2034",
  btb_team: "2034 Thunder",
  position: "Draw Specialist",
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

test("Emma Mclam draw training is one five-session Thursday package", () => {
  assert.deepEqual(SESSION_DATES, [
    "September 17, 2026",
    "September 24, 2026",
    "October 1, 2026",
    "October 8, 2026",
    "October 15, 2026",
  ]);
  assert.deepEqual(TRAINING_GROUPS, [
    {
      name: DRAW_GROUP,
      slug: "girls-draw-training-7pm",
      gender: "Girls",
      gradYears: ["2037", "2036", "2035", "2034", "2033", "2032", "2031"],
      time: "7:00–8:00 PM",
    },
  ]);
  assert.equal(groupForName(DRAW_GROUP)?.gender, "Girls");
  assert.equal(groupForName("Boys Draw Training · 7:00–8:00 PM"), null);
  assert.equal(config.path, "/api/draw-training-registration");
});

test("server validation requires the complete girls player, family, medical, and waiver record", () => {
  for (const position of ["Attack", "Midfield", "Defense", "Goalie", "Draw Specialist", "Unsure"]) {
    assert.equal(validateDrawTrainingRegistration({ ...validRegistration, position }).error, undefined);
  }
  for (const grad_year of ["2037", "2036", "2035", "2034", "2033", "2032", "2031"]) {
    assert.equal(validateDrawTrainingRegistration({ ...validRegistration, grad_year }).error, undefined);
  }

  const cases = [
    [{ ...validRegistration, training_group: "Girls Monday Night" }, "Please choose the girls draw training package."],
    [{ ...validRegistration, btb_team: "" }, "Required registration information is missing."],
    [{ ...validRegistration, medical_notes: "" }, "Required registration information is missing."],
    [{ ...validRegistration, parent_email: "not-an-email" }, "Please enter a valid parent email address."],
    [{ ...validRegistration, parent_phone: "555" }, "Please enter a valid parent mobile number."],
    [{ ...validRegistration, emergency_phone: "555" }, "Please enter a valid emergency contact number."],
    [{ ...validRegistration, player_dob: "2014-02-31" }, "Please check the player's date of birth."],
    [{ ...validRegistration, grad_year: "2030" }, "Girls draw training is open to graduation years 2037 through 2031."],
    [{ ...validRegistration, grad_year: "2038" }, "Girls draw training is open to graduation years 2037 through 2031."],
    [{ ...validRegistration, position: "Faceoff Specialist" }, "Please choose a valid primary position."],
    [{ ...validRegistration, waiver_accepted: "" }, "The participation waiver must be accepted."],
  ];

  for (const [registration, expected] of cases) {
    assert.equal(validateDrawTrainingRegistration(registration).error, expected);
  }
});

test("the live total is exact, uncapped, and exposes no player or family data", async () => {
  const records = {};
  for (let index = 0; index < 30; index += 1) {
    records[`registrations/${index}`] = JSON.stringify({
      group: DRAW_GROUP,
      parent_email: `private-${index}@example.com`,
      medical_notes: "private",
    });
  }
  const counts = await buildGroupCounts(memoryStore(records));

  assert.deepEqual(counts, [{
    name: DRAW_GROUP,
    gender: "Girls",
    gradYears: ["2037", "2036", "2035", "2034", "2033", "2032", "2031"],
    time: "7:00–8:00 PM",
    count: 30,
  }]);
  assert.equal("capacity" in counts[0], false);
  assert.equal(JSON.stringify(counts).includes("private-"), false);
  assert.equal(JSON.stringify(counts).includes("medical_notes"), false);
});

test("registration saves the package summary and stores no PII in the live-total record", async () => {
  const store = memoryStore({
    "registrations/existing": JSON.stringify({ group: DRAW_GROUP, status: "pending_payment_instructions" }),
  });
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
    now: () => new Date("2026-09-03T14:00:00.000Z"),
  });

  const response = await handler(new Request("http://localhost:5173/api/draw-training-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, group: DRAW_GROUP, count: 2 });
  assert.equal(formSubmissions.length, 1);
  assert.equal(formSubmissions[0]["form-name"], "btb-draw-training-registration");
  assert.equal(formSubmissions[0].program, "BTB Girls Draw Training with Emma Mclam — 5-Session Package");
  assert.equal(formSubmissions[0].program_gender, "Girls");
  assert.equal(formSubmissions[0].coach, "Emma Mclam");
  assert.equal(formSubmissions[0].training_day, "Thursdays");
  assert.equal(formSubmissions[0].training_time, "7:00–8:00 PM");
  assert.equal(formSubmissions[0].group_grad_years, "2037, 2036, 2035, 2034, 2033, 2032, 2031");
  assert.equal(formSubmissions[0].location, "Momentum Sports · 10 Dunton Ave, Deer Park, NY 11729");
  assert.equal(formSubmissions[0].amount, "175");
  assert.equal(formSubmissions[0].session_dates, SESSION_DATES.join("; "));
  assert.equal(formSubmissions[0].registration_status, "Pending $175 payment instructions");
  assert.equal(formSubmissions[0].group_registration_count, "2");
  assert.doesNotMatch(JSON.stringify(formSubmissions[0]), /connect\.intuit\.com|quickbooks|checkout/i);

  const savedRecord = [...store.values.entries()].find(([key]) => key.startsWith("registrations/") && key !== "registrations/existing")[1];
  assert.equal(savedRecord.includes("parent@example.com"), false);
  assert.equal(savedRecord.includes("medical_notes"), false);
  assert.equal(savedRecord.includes("Test Player"), false);
  assert.equal(JSON.parse(savedRecord).status, "pending_payment_instructions");
});

test("one player cannot be double-counted for the package", async () => {
  const store = memoryStore();
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
  });
  const request = () => new Request("http://localhost:5173/api/draw-training-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  });

  const first = await handler(request());
  assert.equal(first.status, 200);

  const duplicate = await handler(request());
  assert.equal(duplicate.status, 200);
  assert.deepEqual(await duplicate.json(), {
    ok: true,
    duplicate: true,
    group: DRAW_GROUP,
    count: 1,
  });
  assert.equal(formSubmissions.length, 1);
  assert.equal((await buildGroupCounts(store))[0].count, 1);
});

test("the draw page, parent hub, newsletter, route, and email flow stay aligned", async () => {
  const [registrationPage, parentTraining, newsletter, relay, netlifyConfig] = await Promise.all([
    readFile(new URL("../public/register-draw-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/parent-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
  ]);

  assert.match(registrationPage, /name="btb-draw-training-registration"/);
  assert.match(registrationPage, /EMMA MCLAM/);
  assert.match(registrationPage, /DRAW TRAINING/);
  assert.match(registrationPage, /Girls Draw Training · 7:00–8:00 PM/);
  assert.match(registrationPage, /September 17, 2026/);
  assert.match(registrationPage, /October 15, 2026/);
  assert.match(registrationPage, /\$175/);
  assert.match(registrationPage, /Momentum Sports/);
  assert.match(registrationPage, /10 Dunton Ave/);
  assert.match(registrationPage, /const REGISTRATION_ENDPOINT = "\/api\/draw-training-registration"/);
  assert.doesNotMatch(registrationPage, /connect\.intuit\.com|PAYMENT_LINK|QuickBooks/i);

  assert.match(parentTraining, /draw: "\/register-draw-training"/);
  assert.match(parentTraining, /REGISTER FOR DRAW TRAINING &mdash; \$175/);
  assert.match(parentTraining, /September 17 and 24; October 1, 8, and 15, 2026/);
  assert.match(newsletter, /href="https:\/\/www\.bethebestli\.com\/register-draw-training"/);
  assert.match(newsletter, /\$175 for 5 Thursday sessions/);
  assert.match(netlifyConfig, /from = "\/register-draw-training"[\s\S]*?to = "\/register-draw-training\.html"/);

  assert.match(relay, /btb-draw-training-registration/);
  assert.match(relay, /Emma Mclam Draw Training/);
  assert.match(relay, /September 17 and 24/);
  assert.match(relay, /BTB will send[^\n]{0,120}payment instructions/i);
  assert.doesNotMatch(relay, /DRAW_TRAINING_PAYMENT_URL/);
});
