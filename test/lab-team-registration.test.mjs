import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  LAB_TEAMS,
  TEAM_MINIMUM,
  buildTeamProgress,
  createHandler,
  teamForName,
  validateLabRegistration,
} from "../netlify/functions/lab-team-registration.mjs";

const validRegistration = {
  team_name: "2033 Renegades",
  player_first_name: "Test",
  player_last_name: "Player",
  player_dob: "2014-05-01",
  position: "Midfield",
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
  schedule_preference: "Either works",
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

test("The Lab roster contains every eligible 2033-and-older boys and girls team", () => {
  assert.equal(TEAM_MINIMUM, 10);
  assert.deepEqual(LAB_TEAMS.map((team) => team.name), [
    "2028 Black",
    "2029 Chrome",
    "2030 Rage",
    "2030 Reign",
    "2030 Tidal Wave",
    "2031 Carnage",
    "2031 Cyclones",
    "2032 Cannons",
    "2032 Grizzlies",
    "2032 Riptide",
    "2033 Renegades",
    "2033 Storm",
  ]);
  assert.equal(teamForName("2033 Renegades")?.gender, "Boys");
  assert.equal(teamForName("2033 Storm")?.gender, "Girls");
  assert.equal(teamForName("2034 Snipers"), null);
});

test("server validation requires complete player, family, medical, and scheduling information", () => {
  assert.equal(validateLabRegistration(validRegistration).error, undefined);

  const cases = [
    [{ ...validRegistration, team_name: "2034 Snipers" }, "Please choose the player's BTB team."],
    [{ ...validRegistration, address_street: "" }, "Required registration information is missing."],
    [{ ...validRegistration, medical_notes: "" }, "Required registration information is missing."],
    [{ ...validRegistration, parent_email: "not-an-email" }, "Please enter a valid parent email address."],
    [{ ...validRegistration, parent_phone: "555" }, "Please enter a valid parent mobile number."],
    [{ ...validRegistration, player_dob: "2014-02-31" }, "Please check the player's date of birth."],
    [{ ...validRegistration, position: "Quarterback" }, "Please choose a valid primary position."],
    [{ ...validRegistration, schedule_preference: "Whenever" }, "Please choose a schedule preference."],
    [{ ...validRegistration, waiver_accepted: "" }, "The participation waiver must be accepted."],
  ];

  for (const [registration, expected] of cases) {
    assert.equal(validateLabRegistration(registration).error, expected);
  }
});

test("team progress reports counts and remaining commitments without family data", async () => {
  const store = memoryStore({
    "2033-renegades/registrations/one": JSON.stringify({ parent_email: "private@example.com" }),
    "2033-renegades/registrations/two": JSON.stringify({ medical_notes: "private" }),
  });
  const progress = await buildTeamProgress(store);
  const renegades = progress.find((team) => team.name === "2033 Renegades");

  assert.deepEqual(renegades, {
    name: "2033 Renegades",
    gender: "Boys",
    gradYear: "2033",
    count: 2,
    remaining: 8,
    minimumMet: false,
  });
  assert.equal(JSON.stringify(progress).includes("private@example.com"), false);
  assert.equal(JSON.stringify(progress).includes("medical_notes"), false);
});

test("registration saves one team commitment, forwards the full form, and returns the updated Road to 10 count", async () => {
  const store = memoryStore({
    "2033-renegades/registrations/existing-one": JSON.stringify({ status: "pending_payment" }),
    "2033-renegades/registrations/existing-two": JSON.stringify({ status: "pending_payment" }),
  });
  const formSubmissions = [];
  const handler = createHandler({
    getBlobStore: () => store,
    saveForm: async (data) => formSubmissions.push(data),
    now: () => new Date("2026-09-01T14:00:00.000Z"),
  });

  const response = await handler(new Request("http://localhost:5173/api/lab-team-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify(validRegistration),
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    team: "2033 Renegades",
    count: 3,
    remaining: 7,
    minimumMet: false,
  });
  assert.equal(formSubmissions.length, 1);
  assert.equal(formSubmissions[0]["form-name"], "btb-lab-team-strength-registration");
  assert.equal(formSubmissions[0].program_gender, "Boys");
  assert.equal(formSubmissions[0].grad_year, "2033");
  assert.equal(formSubmissions[0].team_registration_count, "3");
  assert.equal(formSubmissions[0].team_spots_to_minimum, "7");
  assert.equal(formSubmissions[0].medical_notes, "None");

  const savedRecord = [...store.values.entries()].find(([key]) => key.includes("/registrations/") && !key.includes("existing"))[1];
  assert.equal(savedRecord.includes("parent@example.com"), false);
  assert.equal(savedRecord.includes("medical_notes"), false);
});

test("the public registration page collects required details and connects parent surfaces to the form", async () => {
  const [registrationPage, parentTraining, newsletter, relay] = await Promise.all([
    readFile(new URL("../public/register-lab-team-strength.html", import.meta.url), "utf8"),
    readFile(new URL("../public/parent-training.html", import.meta.url), "utf8"),
    readFile(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
  ]);

  for (const field of [
    "team_name",
    "player_first_name",
    "player_last_name",
    "player_dob",
    "position",
    "school_town",
    "parent_first_name",
    "parent_last_name",
    "parent_email",
    "parent_phone",
    "address_street",
    "address_city",
    "address_state",
    "address_zip",
    "emergency_name",
    "emergency_phone",
    "medical_notes",
    "schedule_preference",
    "waiver_accepted",
  ]) {
    assert.match(registrationPage, new RegExp(`name="${field}"`), `missing ${field}`);
  }
  assert.match(registrationPage, /Road to 10/);
  assert.match(registrationPage, /team totals only/);
  assert.match(registrationPage, /const REGISTRATION_ENDPOINT = "\/api\/lab-team-registration"/);
  assert.match(registrationPage, /window\.location\.href = PAYMENT_LINK/);
  assert.match(parentTraining, /lab: "\/register-lab-team-strength"/);
  assert.match(newsletter, /href="https:\/\/www\.bethebestli\.com\/register-lab-team-strength"/);

  assert.match(relay, /DEFAULT_LAB_TEAM_STRENGTH_NOTIFY_EMAILS = \["info@bethebestli\.com", "quintingermain@gmail\.com"\]/);
  assert.match(relay, /The Lab — \$\{data\.team_name/);
  assert.match(relay, /"btb-lab-team-strength-registration": \{/);
  assert.match(relay, /COMPLETE \$500 PAYMENT/);
});
