import assert from "node:assert/strict";
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
