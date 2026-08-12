import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  SESSION_CAPACITY,
  groupForGradYear,
  registrationsInGroup,
  reserveSlot,
  saveNetlifyForm,
  validateRegistrationInput,
} from "../netlify/functions/girls-mini-camp-register.mjs";

const validRegistration = {
  player_first_name: "Test",
  player_last_name: "Player",
  player_dob: "2014-05-01",
  grad_year: "2032",
  position: "Midfield",
  school_town: "Test Town",
  parent_first_name: "Test",
  parent_last_name: "Parent",
  parent_email: "parent@example.com",
  parent_phone: "(516) 555-0100",
  address_state: "NY",
  address_zip: "11758",
  emergency_name: "Emergency Contact",
  emergency_phone: "516-555-0101",
  waiver_accepted: "Yes",
};

test("maps every eligible graduation year to the correct session", () => {
  assert.equal(groupForGradYear("2036")?.session, "5:00 PM–6:00 PM");
  assert.equal(groupForGradYear("2035")?.session, "5:00 PM–6:00 PM");
  assert.equal(groupForGradYear("2034")?.session, "6:00 PM–7:00 PM");
  assert.equal(groupForGradYear("2033")?.session, "6:00 PM–7:00 PM");
  assert.equal(groupForGradYear("2032")?.session, "7:00 PM–8:00 PM");
  assert.equal(groupForGradYear("2031")?.session, "7:00 PM–8:00 PM");
  assert.equal(groupForGradYear("2030"), null);
});

test("accepts a complete eligible registration", () => {
  const result = validateRegistrationInput(validRegistration);
  assert.equal(result.error, undefined);
  assert.equal(result.group?.key, "2032-2031");
  assert.equal(result.age, 12);
});

test("rejects incomplete or malformed registrations server-side", () => {
  const cases = [
    [{ ...validRegistration, player_first_name: "" }, "Required registration information is missing."],
    [{ ...validRegistration, grad_year: "2030" }, "Please choose an eligible graduation year."],
    [{ ...validRegistration, parent_email: "not-an-email" }, "Please enter a valid parent email address."],
    [{ ...validRegistration, parent_phone: "555" }, "Please enter a valid parent mobile number."],
    [{ ...validRegistration, player_dob: "2014-02-31" }, "Please check the player's date of birth."],
    [{ ...validRegistration, player_dob: "2024-01-01" }, "Please check the player's date of birth."],
    [{ ...validRegistration, position: "Quarterback" }, "Please choose a valid primary position."],
    [{ ...validRegistration, waiver_accepted: "" }, "The participation waiver must be accepted."],
  ];

  for (const [registration, expectedError] of cases) {
    assert.equal(validateRegistrationInput(registration).error, expectedError);
  }
});

test("the public page and backend use the same 18-player capacity", async () => {
  const page = await readFile(new URL("../public/register-girls-mini-camp.html", import.meta.url), "utf8");
  assert.equal(SESSION_CAPACITY, 18);
  assert.match(page, /Only 18 Players Per Group/);
});

test("the public page hands successful registrations to the configured Intuit checkout", async () => {
  const [page, relay] = await Promise.all([
    readFile(new URL("../public/register-girls-mini-camp.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
  ]);
  const match = page.match(/const PAYMENT_LINK = "([^"]+)"/);
  assert.ok(match, "QuickBooks payment link is configured");
  const paymentUrl = new URL(match[1]);
  assert.equal(paymentUrl.protocol, "https:");
  assert.equal(paymentUrl.hostname, "connect.intuit.com");
  assert.match(page, /window\.location\.href = PAYMENT_LINK/);

  const emailMatch = relay.match(/GIRLS_MINI_CAMP_PAYMENT_URL\s*=\s*\n?\s*"([^"]+)"/);
  assert.ok(emailMatch, "confirmation email payment link is configured");
  assert.equal(emailMatch[1], match[1]);
});

test("atomic slot allocation cannot overbook an 18-player group", async () => {
  const values = new Map();
  const store = {
    async set(key, value, options = {}) {
      if (options.onlyIfNew && values.has(key)) return { modified: false };
      values.set(key, value);
      return { modified: true };
    },
  };

  const occupiedCount = 11;

  const reservations = await Promise.all(
    Array.from({ length: SESSION_CAPACITY + 1 }, (_, index) => (
      reserveSlot(store, "2032-2031", `registration-${index}`, occupiedCount)
    )),
  );
  const allocated = reservations.filter(Boolean);

  assert.equal(allocated.length, SESSION_CAPACITY - occupiedCount);
  assert.equal(new Set(allocated).size, SESSION_CAPACITY - occupiedCount);
  assert.equal(allocated[0], "2032-2031/slots/12");
  assert.equal(reservations.filter((reservation) => reservation === null).length, occupiedCount + 1);
});

test("capacity counts saved registrations and ignores broken legacy slot keys", async () => {
  const store = {
    async list() {
      return {
        blobs: [
          { key: "2032-2031/legacy-registration" },
          { key: "2032-2031/registrations/current-registration" },
          { key: "2032-2031/slots/01" },
        ],
      };
    },
  };

  assert.equal(await registrationsInGroup(store, "2032-2031"), 2);
});

test("Netlify form handoff uses the Node function site URL", async () => {
  const originalSiteUrl = process.env.URL;
  process.env.URL = "https://deploy-preview.example.netlify.app";
  let request;

  try {
    await saveNetlifyForm({
      "form-name": "btb-girls-mini-camp-registration",
      parent_email: "parent@example.com",
    }, {}, async (url, init) => {
      request = { url: String(url), init };
      return new Response(null, { status: 302 });
    });
  } finally {
    if (originalSiteUrl === undefined) delete process.env.URL;
    else process.env.URL = originalSiteUrl;
  }

  assert.equal(request.url, "https://deploy-preview.example.netlify.app/");
  assert.equal(request.init.method, "POST");
  assert.match(request.init.body, /form-name=btb-girls-mini-camp-registration/);
});
