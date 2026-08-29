import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createHandler,
  DirectoryApiError,
  normalizeDirectoryEntry,
  normalizeDirectorySnapshot,
  normalizeEmail,
  normalizePhone,
  updateCoachContact,
} from "../netlify/functions/coach-directory.mjs";

const SITE_ORIGIN = "https://www.bethebestli.com";
const FIXED_NOW = new Date("2026-08-29T20:00:00.000Z");

function sampleStaff(overrides = {}) {
  return {
    id: "staff-123abc",
    firstName: "Taylor",
    lastName: "Coach",
    roles: ["Coach"],
    divisions: ["Girls Lacrosse Program"],
    teams: ["2032 RIPTIDE"],
    phone: "5165550123",
    email: "TAYLOR@example.com",
    updatedAt: null,
    ...overrides,
  };
}

function sampleSnapshot() {
  return {
    version: 1,
    staff: [sampleStaff()],
    savedAt: "2026-08-29T19:00:00.000Z",
  };
}

function memoryStore(initial = null) {
  let data = initial === null ? null : structuredClone(initial);
  let sequence = initial === null ? 0 : 1;
  let etag = initial === null ? null : `"v${sequence}"`;
  let forceMiss = false;

  return {
    get data() {
      return data === null ? null : structuredClone(data);
    },
    get etag() {
      return etag;
    },
    missNextWrite() {
      forceMiss = true;
    },
    async getWithMetadata(_key, options = {}) {
      assert.equal(options.type, "json");
      return data === null ? null : { data: structuredClone(data), etag, metadata: {} };
    },
    async setJSON(_key, value, options = {}) {
      if (forceMiss) {
        forceMiss = false;
        return { modified: false };
      }
      if (options.onlyIfMatch !== etag) return { modified: false };
      data = structuredClone(value);
      sequence += 1;
      etag = `"v${sequence}"`;
      return { modified: true, etag };
    },
  };
}

async function expectDirectoryError(promise, expected) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof DirectoryApiError);
    for (const [key, value] of Object.entries(expected)) assert.equal(error[key], value);
    return true;
  });
}

function directoryRequest(body, ip = "198.51.100.20") {
  return new Request(`${SITE_ORIGIN}/.netlify/functions/coach-directory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: SITE_ORIGIN,
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

test("directory normalization keeps staff contacts and excludes private source fields", () => {
  const normalized = normalizeDirectoryEntry({
    ...sampleStaff(),
    birthdate: "1980-01-01",
    age: 46,
    address: "Never store this",
  });

  assert.deepEqual(normalized, {
    id: "staff-123abc",
    firstName: "Taylor",
    lastName: "Coach",
    roles: ["Coach"],
    divisions: ["Girls Lacrosse Program"],
    teams: ["2032 RIPTIDE"],
    phone: "(516) 555-0123",
    email: "taylor@example.com",
    updatedAt: null,
  });
  assert.equal("birthdate" in normalized, false);
  assert.equal("age" in normalized, false);
  assert.equal("address" in normalized, false);
});

test("directory normalization validates contacts and duplicate staff IDs", () => {
  assert.equal(normalizePhone("516.555.0199"), "(516) 555-0199");
  assert.equal(normalizeEmail(" Staff@Example.COM "), "staff@example.com");
  assert.throws(() => normalizePhone("call me"), /valid phone/i);
  assert.throws(() => normalizeEmail("not-an-email"), /valid email/i);
  assert.throws(() => normalizeDirectorySnapshot({
    staff: [sampleStaff(), sampleStaff()],
  }), /Duplicate staff record ID/);
});

test("contact update changes only phone and email and uses the blob ETag", async () => {
  const store = memoryStore(sampleSnapshot());
  const result = await updateCoachContact(store, {
    id: "staff-123abc",
    phone: "631-555-0110",
    email: "new@example.com",
    firstName: "Attempted overwrite",
    teams: ["Attempted overwrite"],
  }, store.etag, { now: FIXED_NOW });

  assert.equal(result.snapshot.version, 2);
  assert.equal(result.snapshot.staff[0].firstName, "Taylor");
  assert.deepEqual(result.snapshot.staff[0].teams, ["2032 RIPTIDE"]);
  assert.equal(result.snapshot.staff[0].phone, "(631) 555-0110");
  assert.equal(result.snapshot.staff[0].email, "new@example.com");
  assert.equal(result.snapshot.staff[0].updatedAt, FIXED_NOW.toISOString());
  assert.equal(result.etag, '"v2"');
});

test("contact update rejects stale browsers and missing records", async () => {
  const store = memoryStore(sampleSnapshot());
  await expectDirectoryError(updateCoachContact(store, {
    id: "staff-123abc",
    phone: "5165550100",
    email: "staff@example.com",
  }, '"old"'), { status: 409, code: "stale_etag" });

  await expectDirectoryError(updateCoachContact(store, {
    id: "staff-missing",
    phone: "5165550100",
    email: "staff@example.com",
  }, store.etag), { status: 404, code: "not_found" });
});

test("protected directory loads with the existing staff password and is never cached", async () => {
  const previous = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password";
  let authorizeCalled = false;
  const store = memoryStore(sampleSnapshot());
  const handler = createHandler({
    authorize: async () => {
      authorizeCalled = true;
      return { ok: false };
    },
    getBlobStore: () => store,
  });

  try {
    const response = await handler(directoryRequest({ action: "load", password: "server-password" }));
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(authorizeCalled, false);
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(payload.snapshot.staff.length, 1);
    assert.equal(payload.etag, '"v1"');
  } finally {
    if (previous === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD;
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = previous;
  }
});

test("protected directory rejects a wrong password before opening the private store", async () => {
  const previous = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password";
  let storeCalled = false;
  const handler = createHandler({
    authorize: async () => ({ ok: false }),
    getBlobStore: () => {
      storeCalled = true;
      return memoryStore(sampleSnapshot());
    },
  });

  try {
    const response = await handler(directoryRequest({ action: "load", password: "wrong" }, "198.51.100.21"));
    assert.equal(response.status, 401);
    assert.equal(storeCalled, false);
  } finally {
    if (previous === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD;
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = previous;
  }
});

test("verified owners can load the directory without the shared password", async () => {
  const previous = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password";
  let requestedRoles;
  const handler = createHandler({
    authorize: async (_request, roles) => {
      requestedRoles = roles;
      return { ok: true, user: { id: "owner-1" } };
    },
    getBlobStore: () => memoryStore(sampleSnapshot()),
  });

  try {
    const response = await handler(directoryRequest({ action: "load", password: "" }, "198.51.100.22"));
    assert.equal(response.status, 200);
    assert.deepEqual(requestedRoles, ["owner"]);
  } finally {
    if (previous === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD;
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = previous;
  }
});

test("production contacts are not served to deploy-preview origins", async () => {
  const handler = createHandler({
    authorize: async () => ({ ok: true, user: { id: "owner-1" } }),
    getBlobStore: () => memoryStore(sampleSnapshot()),
  });
  const response = await handler(new Request(
    "https://deploy-preview-999--btb-lacrosse.netlify.app/.netlify/functions/coach-directory",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://deploy-preview-999--btb-lacrosse.netlify.app",
        "x-forwarded-for": "198.51.100.23",
      },
      body: JSON.stringify({ action: "load", password: "" }),
    },
  ));
  assert.equal(response.status, 403);
});

test("staff schedule has a lazy-loaded mobile Coach Directory without embedded records", () => {
  const html = readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8");
  assert.match(html, /data-view="directory"/);
  assert.match(html, /id="directoryView"/);
  assert.match(html, /id="coachDirectorySearch"/);
  assert.match(html, /id="coachDirectoryCount"[^>]*aria-live="polite"/);
  assert.match(html, /id="coachDirectoryList"/);
  assert.match(html, /id="coachDirectoryDialog"/);
  assert.match(html, /id="coachDirectoryForm"/);
  assert.match(html, /\.netlify\/functions\/coach-directory/);
  assert.match(html, /if \(name === "directory"\) loadCoachDirectory/);
  assert.match(html, /@media \(max-width: 760px\)[\s\S]*\.coach-directory-grid[\s\S]*grid-template-columns:\s*1fr/);
  assert.doesNotMatch(html, /DEFAULT_COACHES|COACHES DIRECTORY\.csv|var\s+coachDirectorySeed\s*=/);
});
