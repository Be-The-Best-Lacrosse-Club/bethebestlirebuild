import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import https from "node:https";
import test from "node:test";

import { handler } from "../netlify/functions/brevo-relay.js";

const validEvaluation = {
  playerName: "Test Player",
  age: "12",
  email: "test@example.com",
  phone: "555-555-0100",
  gradYear: "2032",
  gender: "Boys",
  teamInterested: "2032 Boys",
  currentClub: "Example Lacrosse",
  level: "AA",
  reason: "Looking for strong coaching and a competitive fit.",
};

const evaluationRecipients = [
  "info@bethebestli.com",
  "btblacrosseteams@gmail.com",
  "btb.director.reynolds@gmail.com",
  "taylorjhoran26@gmail.com",
];

function captureHttpsRequests() {
  const calls = [];
  const originalRequest = https.request;

  https.request = (options, callback) => {
    const request = new EventEmitter();
    let requestBody = "";

    request.setTimeout = () => request;
    request.destroy = () => {};
    request.write = (chunk) => {
      requestBody += String(chunk);
    };
    request.end = () => {
      calls.push({
        options,
        body: requestBody ? JSON.parse(requestBody) : null,
      });

      const response = new EventEmitter();
      response.statusCode = 201;
      callback(response);
      queueMicrotask(() => {
        response.emit("data", "{}");
        response.emit("end");
      });
    };

    return request;
  };

  return {
    calls,
    restore() {
      https.request = originalRequest;
    },
  };
}

function preserveEnvironment(keys) {
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

async function submit(data) {
  const response = await handler({
    httpMethod: "POST",
    body: JSON.stringify({
      form_name: "players-wanted-evaluation",
      data,
    }),
  });
  return JSON.parse(response.body);
}

test("evaluation relay rejects missing required answers before fan-out", async () => {
  const result = await submit({ ...validEvaluation, reason: "" });

  assert.equal(result.skipped, true);
  assert.equal(result.reason, "missing reason");
});

test("evaluation relay rejects malformed emails and invalid select values", async () => {
  const invalidEmail = await submit({ ...validEvaluation, email: "not-an-email" });
  const invalidGender = await submit({ ...validEvaluation, gender: "Other" });
  const invalidLevel = await submit({ ...validEvaluation, level: "Elite" });

  assert.equal(invalidEmail.reason, "invalid email");
  assert.equal(invalidGender.reason, "invalid gender");
  assert.equal(invalidLevel.reason, "invalid level");
});

test("evaluation relay rejects honeypot submissions", async () => {
  const result = await submit({ ...validEvaluation, "bot-field": "spam" });

  assert.equal(result.skipped, true);
  assert.equal(result.reason, "honeypot completed");
});

test("evaluation relay emails all four staff with program and grad year in the subject", async () => {
  const environmentKeys = [
    "BREVO_API_KEY",
    "BREVO_SENDER_EMAIL",
    "BREVO_SENDER_NAME",
    "BREVO_NOTIFY_EMAIL",
    "AIRTABLE_FORMS_API_KEY",
    "AIRTABLE_OPS_API_KEY",
    "AIRTABLE_FORMS_BASE_ID",
  ];
  const restoreEnvironment = preserveEnvironment(environmentKeys);
  const httpsCapture = captureHttpsRequests();

  process.env.BREVO_API_KEY = "test-brevo-key";
  process.env.BREVO_SENDER_EMAIL = "info@bethebestli.com";
  process.env.BREVO_SENDER_NAME = "BTB Website";
  process.env.BREVO_NOTIFY_EMAIL = "unexpected-recipient@example.com";
  delete process.env.AIRTABLE_FORMS_API_KEY;
  delete process.env.AIRTABLE_OPS_API_KEY;
  delete process.env.AIRTABLE_FORMS_BASE_ID;

  try {
    for (const [gender, gradYear] of [["Boys", "2032"], ["Girls", "2030"]]) {
      const firstCallIndex = httpsCapture.calls.length;
      const result = await submit({
        ...validEvaluation,
        gender,
        gradYear,
        teamInterested: `${gradYear} ${gender}`,
      });

      assert.equal(result.brevoEmail.ok, true);
      const notification = httpsCapture.calls
        .slice(firstCallIndex)
        .find((call) => call.options.path === "/v3/smtp/email" && call.body.subject.startsWith("Evaluation Requested"));

      assert.ok(notification, `expected a staff notification for ${gender}`);
      assert.equal(notification.body.subject, `Evaluation Requested ${gender} ${gradYear}`);
      assert.deepEqual(notification.body.to.map(({ email }) => email), evaluationRecipients);
    }
  } finally {
    httpsCapture.restore();
    restoreEnvironment();
  }
});
