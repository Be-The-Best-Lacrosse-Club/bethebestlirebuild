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
} from "../netlify/functions/boys-mini-camp-register.mjs";

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

test("the public page displays an 18-player limit while backend capacity is 24", async () => {
  const page = await readFile(new URL("../public/register-boys-mini-camp.html", import.meta.url), "utf8");
  assert.equal(SESSION_CAPACITY, 24);
  assert.match(page, /Only 18 Players Per Age Group/);
  assert.doesNotMatch(page, /24 Players Per (?:Age )?Group/);
});

test("the public page hands successful registrations to the configured Intuit checkout", async () => {
  const [page, relay] = await Promise.all([
    readFile(new URL("../public/register-boys-mini-camp.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8"),
  ]);
  const match = page.match(/const PAYMENT_LINK = "([^"]+)"/);
  assert.ok(match, "QuickBooks payment link is configured");
  const paymentUrl = new URL(match[1]);
  assert.equal(paymentUrl.protocol, "https:");
  assert.equal(paymentUrl.hostname, "connect.intuit.com");
  assert.match(page, /window\.location\.href = PAYMENT_LINK/);

  const emailMatch = relay.match(/BOYS_MINI_CAMP_PAYMENT_URL\s*=\s*\n?\s*"([^"]+)"/);
  assert.ok(emailMatch, "confirmation email payment link is configured");
  assert.equal(emailMatch[1], match[1]);
});

test("boys and girls use separate confirmation templates and Boys admin mail is Dan-only", async () => {
  const relay = await readFile(new URL("../netlify/functions/brevo-relay.js", import.meta.url), "utf8");

  assert.match(relay, /"btb-boys-mini-camp-registration":\s*\{/);
  assert.match(relay, /Registration Received — Boys Mini Camp/);
  assert.match(relay, /August 23, 24, and 26/);
  assert.match(relay, /"btb-girls-mini-camp-registration":\s*\{/);
  assert.match(relay, /Registration Received — Girls Mini Camp/);
  assert.match(relay, /August 19, 20, and 21/);
  assert.match(relay, /const isBoysMiniCamp = formName === BOYS_MINI_CAMP_FORM_NAME/);
  assert.match(relay, /isBoysMiniCamp\s*\? \[BOYS_MINI_CAMP_NOTIFY_EMAIL\]/);
  assert.match(relay, /if \(!isBoysMiniCamp && isBoysSideRegistration/);
});

test("atomic slot allocation cannot overbook a 24-player group", async () => {
  const values = new Map();
  const store = {
    async set(key, value, options = {}) {
      if (options.onlyIfNew && values.has(key)) return { modified: false };
      values.set(key, value);
      return { modified: true };
    },
  };

  const occupiedCount = 6;

  const reservations = await Promise.all(
    Array.from({ length: SESSION_CAPACITY + 1 }, (_, index) => (
      reserveSlot(store, "2032-2031", `registration-${index}`, occupiedCount)
    )),
  );
  const allocated = reservations.filter(Boolean);

  assert.equal(allocated.length, SESSION_CAPACITY - occupiedCount);
  assert.equal(new Set(allocated).size, SESSION_CAPACITY - occupiedCount);
  assert.equal(allocated[0], "2032-2031/slots/07");
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

test("the API and page distinguish processing conflicts from a full session", async () => {
  const [functionSource, page] = await Promise.all([
    readFile(new URL("../netlify/functions/boys-mini-camp-register.mjs", import.meta.url), "utf8"),
    readFile(new URL("../public/register-boys-mini-camp.html", import.meta.url), "utf8"),
  ]);

  assert.match(functionSource, /code: "registration_processing"/);
  assert.match(functionSource, /code: "session_full"/);
  assert.match(page, /registrationError\.sessionFull = result\.code === "session_full"/);
  assert.match(page, /error\.code === "registration_processing"/);
  assert.match(page, /if \(isFull\) \{/);
});

test("Netlify form handoff uses the Node function site URL", async () => {
  const originalSiteUrl = process.env.URL;
  process.env.URL = "https://deploy-preview.example.netlify.app";
  let request;

  try {
    await saveNetlifyForm({
      "form-name": "btb-boys-mini-camp-registration",
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
  assert.match(request.init.body, /form-name=btb-boys-mini-camp-registration/);
});
