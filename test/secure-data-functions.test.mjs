import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createHandler as createAirtableHandler } from "../netlify/functions/airtable-proxy.js";
import { handler as campResponseHandler } from "../netlify/functions/camp-response.js";
import { authorizeIdentity } from "../netlify/functions/_identity.js";
import { createHandler as createSheetsHandler } from "../netlify/functions/sheets-save.js";

const SITE_ORIGIN = "https://www.bethebestli.com";

function preserveEnvironment(keys) {
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  return () => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

function jsonBody(response) {
  return JSON.parse(response.body);
}

test("Identity authorization rejects missing tokens without making a verification request", async () => {
  let fetchCalled = false;
  const result = await authorizeIdentity(
    { headers: {} },
    ["owner"],
    {
      fetchImpl: async () => {
        fetchCalled = true;
        throw new Error("unexpected fetch");
      },
      siteUrl: "https://identity.example",
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.statusCode, 401);
  assert.equal(fetchCalled, false);
});

test("Identity authorization verifies the bearer token and enforces roles", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      async json() {
        return { id: "user-1", app_metadata: { roles: ["coach"] } };
      },
    };
  };
  const event = { headers: { Authorization: "Bearer signed-jwt" } };

  const forbidden = await authorizeIdentity(event, ["owner"], {
    fetchImpl,
    siteUrl: "https://identity.example/",
  });
  const allowed = await authorizeIdentity(event, ["coach", "owner"], {
    fetchImpl,
    siteUrl: "https://identity.example/",
  });

  assert.equal(forbidden.statusCode, 403);
  assert.equal(allowed.ok, true);
  assert.equal(calls[0].url, "https://identity.example/.netlify/identity/user");
  assert.equal(calls[0].options.headers.Authorization, "Bearer signed-jwt");
});

test("Airtable proxy rejects unauthenticated reads before contacting Airtable", async () => {
  let getRecordsCalled = false;
  const handler = createAirtableHandler({
    authorize: async (_event, roles) => {
      assert.deepEqual(roles, ["owner"]);
      return { ok: false, statusCode: 401, error: "Authentication required" };
    },
    getRecords: async () => {
      getRecordsCalled = true;
      return { records: [] };
    },
  });

  const response = await handler({
    httpMethod: "GET",
    headers: { origin: SITE_ORIGIN },
    queryStringParameters: { module: "players" },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(jsonBody(response).error, "Authentication required");
  assert.equal(getRecordsCalled, false);
  assert.equal(response.headers["Access-Control-Allow-Origin"], SITE_ORIGIN);
});

test("Airtable proxy allows a verified owner and returns mapped records", async () => {
  const restoreEnvironment = preserveEnvironment([
    "AIRTABLE_OPS_API_KEY",
    "AIRTABLE_ROSTER_BASE_ID",
  ]);
  process.env.AIRTABLE_OPS_API_KEY = "server-only-key";
  process.env.AIRTABLE_ROSTER_BASE_ID = "appRoster";

  try {
    const handler = createAirtableHandler({
      authorize: async () => ({ ok: true, user: { id: "owner-1" } }),
      getRecords: async (baseId, table) => {
        assert.equal(baseId, "appRoster");
        assert.equal(table, "Players");
        return { records: [{ id: "rec1", fields: { Name: "Test Player" } }] };
      },
    });

    const response = await handler({
      httpMethod: "GET",
      headers: { origin: SITE_ORIGIN },
      queryStringParameters: { module: "players" },
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(jsonBody(response), {
      records: [{ id: "rec1", Name: "Test Player" }],
    });
    assert.equal(response.body.includes("server-only-key"), false);
  } finally {
    restoreEnvironment();
  }
});

test("private data preflight only permits approved site origins", async () => {
  const handler = createAirtableHandler();
  const denied = await handler({
    httpMethod: "OPTIONS",
    headers: { origin: "https://attacker.example" },
  });
  const allowed = await handler({
    httpMethod: "OPTIONS",
    headers: { origin: SITE_ORIGIN },
  });

  assert.equal(denied.statusCode, 403);
  assert.equal(denied.headers["Access-Control-Allow-Origin"], undefined);
  assert.equal(allowed.statusCode, 204);
  assert.equal(allowed.headers["Access-Control-Allow-Origin"], SITE_ORIGIN);
  assert.match(allowed.headers["Access-Control-Allow-Headers"], /Authorization/);
});

test("Sheets relay rejects unauthenticated writes before calling its webhook", async () => {
  let postCalled = false;
  const handler = createSheetsHandler({
    authorize: async (_event, roles) => {
      assert.deepEqual(roles, ["coach", "owner"]);
      return { ok: false, statusCode: 401, error: "Authentication required" };
    },
    postJson: async () => {
      postCalled = true;
      return { status: 200, body: "ok" };
    },
  });

  const response = await handler({
    httpMethod: "POST",
    headers: { origin: SITE_ORIGIN },
    body: JSON.stringify({ plays: [{ quarter: 1 }] }),
  });

  assert.equal(response.statusCode, 401);
  assert.equal(postCalled, false);
});

test("Sheets relay validates and forwards writes from verified staff", async () => {
  const restoreEnvironment = preserveEnvironment(["SHEETS_WEBHOOK_URL", "SHEETS_API_KEY"]);
  process.env.SHEETS_WEBHOOK_URL = "https://script.google.example/exec";
  process.env.SHEETS_API_KEY = "server-only-sheets-key";
  const calls = [];

  try {
    const handler = createSheetsHandler({
      authorize: async () => ({ ok: true, user: { id: "coach-1" } }),
      postJson: async (url, body) => {
        calls.push({ url, body: JSON.parse(body) });
        return { status: 201, body: "created" };
      },
    });
    const response = await handler({
      httpMethod: "POST",
      headers: { origin: SITE_ORIGIN },
      body: JSON.stringify({
        video_id: "video-1",
        game_context: "BTB vs Test",
        analyzed_at: "2026-08-09T12:00:00.000Z",
        plays: [{ quarter: 1, time: "10:00" }],
      }),
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(jsonBody(response), { ok: true, upstream_status: 201 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://script.google.example/exec");
    assert.equal(calls[0].body.api_key, "server-only-sheets-key");
    assert.equal(response.body.includes("server-only-sheets-key"), false);
  } finally {
    restoreEnvironment();
  }
});

test("Sheets relay rejects invalid play collections before calling its webhook", async () => {
  const restoreEnvironment = preserveEnvironment(["SHEETS_WEBHOOK_URL", "SHEETS_API_KEY"]);
  process.env.SHEETS_WEBHOOK_URL = "https://script.google.example/exec";
  process.env.SHEETS_API_KEY = "server-only-sheets-key";
  let postCalled = false;

  try {
    const handler = createSheetsHandler({
      authorize: async () => ({ ok: true, user: { id: "coach-1" } }),
      postJson: async () => {
        postCalled = true;
        return { status: 200, body: "ok" };
      },
    });
    const response = await handler({
      httpMethod: "POST",
      headers: { origin: SITE_ORIGIN },
      body: JSON.stringify({ plays: ["not-an-object"] }),
    });

    assert.equal(response.statusCode, 400);
    assert.equal(postCalled, false);
  } finally {
    restoreEnvironment();
  }
});

test("legacy camp links are non-mutating and do not reflect query data", async () => {
  const response = await campResponseHandler({
    httpMethod: "GET",
    queryStringParameters: {
      row: "22",
      action: "not_attending",
      player: "Sensitive Player Name",
    },
  });
  const postResponse = await campResponseHandler({ httpMethod: "POST" });

  assert.equal(response.statusCode, 410);
  assert.equal(response.headers.Location, undefined);
  assert.equal(response.body.includes("Sensitive Player Name"), false);
  assert.match(response.headers["Content-Security-Policy"], /default-src 'none'/);
  assert.equal(postResponse.statusCode, 405);
});

test("browser callers attach Netlify Identity tokens to private data requests", async () => {
  const filmPage = await readFile(new URL("../public/film-breakdown.html", import.meta.url), "utf8");
  const airtableClient = await readFile(new URL("../src/lib/airtable.ts", import.meta.url), "utf8");

  assert.match(filmPage, /netlify-identity-widget\.js/);
  assert.match(filmPage, /currentUser\(\)/);
  assert.match(filmPage, /user\.jwt\(\)/);
  assert.match(filmPage, /'Authorization': `Bearer \$\{identityToken\}`/);
  assert.match(filmPage, /errorData\.error \|\| `Save failed/);
  assert.match(airtableClient, /getAuthToken\(\)/);
  assert.match(airtableClient, /Authorization: `Bearer \$\{token\}`/);
});
