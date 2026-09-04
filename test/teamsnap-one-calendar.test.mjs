import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isValidTeamSnapOneCalendarUrl,
  loadTeamSnapOneCalendar,
  parseTeamSnapOneCalendar,
  resetTeamSnapOneCalendarCache,
  TEAMSNAP_ONE_TEAMS,
  unescapeIcsText,
} from "../netlify/functions/_teamsnap-one-calendar.mjs";
import { createHandler as createCalendarHandler } from "../netlify/functions/tournament-calendar.mjs";

const FEED_URL = "https://calendar-api.teamsnap.com/v1/user.ics?token=test-token-not-a-secret";

const SAMPLE_CALENDAR = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "X-WR-CALNAME:TeamSnap ONE Schedule",
  "BEGIN:VEVENT",
  "UID:event-practice@teamsnapone.com",
  "DTSTAMP:20260901T140000Z",
  "SUMMARY:Practice: 2036 DAWGS BTB DAWGS",
  "DTSTART:20260909T231500Z",
  "DESCRIPTION:Practice: 2036 DAWGS BTB DAWGS\\nLocation: Seaford High School - Turf\\nDuration: 1 hour 30 minutes\\nArrival: Bring water\\, ",
  " pinnie\\; mouthguard\\nCoach: Dan\\\\Achatz\\nLink: https://link.teamsnapone.com/practice",
  "LOCATION:Seaford High School - Turf\\, Field 1",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:event-game@teamsnapone.com",
  "LAST-MODIFIED:20260902T150000Z",
  "SUMMARY:Game: 2036 AVALANCHE vs TBD (Arrive 30 minutes early)",
  "DTSTART:20261115T160000Z",
  "DESCRIPTION:Duration: 30 minutes",
  "LOCATION:Burns Park",
  "STATUS:CANCELLED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:event-tournament@teamsnapone.com",
  "SUMMARY:2030 RAGE Apex Fall Championship",
  "DTSTART;VALUE=DATE:20261101",
  "DTEND;VALUE=DATE:20261103",
  "DESCRIPTION:Bring both uniforms",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "UID:event-unknown@teamsnapone.com",
  "SUMMARY:Practice: 2099 Mystery Team",
  "DTSTART:20260910T220000Z",
  "DESCRIPTION:Duration: 1 hour",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

test("the TeamSnap ONE team allowlist contains the 16 BTB teams", () => {
  assert.equal(TEAMSNAP_ONE_TEAMS.length, 16);
  assert.ok(TEAMSNAP_ONE_TEAMS.includes("2037 Supernova"));
  assert.ok(TEAMSNAP_ONE_TEAMS.includes("2037 Wolves"));
  assert.ok(Object.isFrozen(TEAMSNAP_ONE_TEAMS));
});

test("TeamSnap ONE feed URLs are restricted to the official HTTPS calendar endpoint", () => {
  assert.equal(isValidTeamSnapOneCalendarUrl(FEED_URL), true);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://CALENDAR-API.TEAMSNAP.COM/v1/user.ics?token=test"), true);
  assert.equal(isValidTeamSnapOneCalendarUrl("http://calendar-api.teamsnap.com/v1/user.ics?token=test"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://evil.calendar-api.teamsnap.com/v1/user.ics?token=test"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://calendar-api.teamsnap.com/v1/team.ics?token=test"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://calendar-api.teamsnap.com/v1/user.ics/?token=test"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://user:password@calendar-api.teamsnap.com/v1/user.ics"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("https://calendar-api.teamsnap.com/v1/user.ics#token"), false);
  assert.equal(isValidTeamSnapOneCalendarUrl("not a URL"), false);
});

test("ICS text escaping is decoded without changing ordinary text", () => {
  assert.equal(unescapeIcsText("Line one\\nLine two\\, yes\\; okay\\\\done"), "Line one\nLine two, yes; okay\\done");
});

test("the parser normalizes UTC, all-day, canceled, duration, folding, and known teams", () => {
  const events = parseTeamSnapOneCalendar(SAMPLE_CALENDAR);
  assert.equal(events.length, 3, "unknown teams must never enter Dan's calendar");

  const practice = events.find((event) => event.uid === "event-practice@teamsnapone.com");
  assert.deepEqual(practice, {
    id: "teamsnap-one:event-practice@teamsnapone.com",
    uid: "event-practice@teamsnapone.com",
    provider: "teamsnap-one",
    team: "2036 Dawgs",
    kind: "practice",
    title: "Practice",
    startDate: "2026-09-09",
    endDate: "2026-09-09",
    startTime: "19:15",
    endTime: "20:45",
    allDay: false,
    durationMinutes: 90,
    location: "Seaford High School - Turf, Field 1",
    description: "Arrival: Bring water, pinnie; mouthguard\nCoach: Dan\\Achatz",
    deepLink: "https://link.teamsnapone.com/practice",
    status: "confirmed",
    updatedAt: "2026-09-01T14:00:00.000Z",
  });

  const game = events.find((event) => event.uid === "event-game@teamsnapone.com");
  assert.equal(game.team, "2036 Avalanche");
  assert.equal(game.kind, "game");
  assert.equal(game.title, "vs TBD (Arrive 30 minutes early)");
  assert.equal(game.startDate, "2026-11-15");
  assert.equal(game.startTime, "11:00");
  assert.equal(game.endTime, "11:30");
  assert.equal(game.status, "cancelled", "canceled events remain available as tombstones");
  assert.equal(game.updatedAt, "2026-09-02T15:00:00.000Z");

  const tournament = events.find((event) => event.uid === "event-tournament@teamsnapone.com");
  assert.equal(tournament.team, "2030 Rage");
  assert.equal(tournament.kind, "event");
  assert.equal(tournament.title, "Apex Fall Championship");
  assert.equal(tournament.startDate, "2026-11-01");
  assert.equal(tournament.endDate, "2026-11-02", "all-day DTEND is converted from exclusive to inclusive");
  assert.equal(tournament.startTime, null);
  assert.equal(tournament.endTime, null);
  assert.equal(tournament.allDay, true);
});

test("an explicit DTEND takes priority over the description duration", () => {
  const calendar = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT",
    "UID:meeting@teamsnapone.com",
    "SUMMARY:2033 RENEGADES Team Meeting",
    "DTSTART;TZID=America/New_York:20261005T190000",
    "DTEND;TZID=America/New_York:20261005T200000",
    "DESCRIPTION:Duration: 30 minutes",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");

  const [meeting] = parseTeamSnapOneCalendar(calendar);
  assert.equal(meeting.startDate, "2026-10-05");
  assert.equal(meeting.startTime, "19:00");
  assert.equal(meeting.endTime, "20:00");
  assert.equal(meeting.durationMinutes, 60);
  assert.equal(meeting.title, "Team Meeting");
});

test("the loader fetches once, reports counts, caches for five minutes, and never returns its token", async () => {
  resetTeamSnapOneCalendarCache();
  let fetchCount = 0;
  const fetchImpl = async (url, options) => {
    fetchCount += 1;
    assert.equal(url, FEED_URL);
    assert.deepEqual(options.headers, { Accept: "text/calendar" });
    assert.equal(options.signal instanceof AbortSignal, true);
    return { ok: true, text: async () => SAMPLE_CALENDAR };
  };

  const first = await loadTeamSnapOneCalendar({
    env: { TEAMSNAP_ONE_CALENDAR_URL: FEED_URL },
    fetchImpl,
    now: new Date("2026-09-03T15:00:00.000Z"),
  });
  assert.equal(first.configured, true);
  assert.equal(first.available, true);
  assert.equal(first.stale, false);
  assert.equal(first.syncedAt, "2026-09-03T15:00:00.000Z");
  assert.equal(first.calendarName, "TeamSnap ONE Schedule");
  assert.deepEqual(first.counts, {
    total: 3,
    active: 2,
    cancelled: 1,
    practices: 1,
    games: 0,
    other: 1,
  });
  assert.equal(JSON.stringify(first).includes("test-token-not-a-secret"), false);

  first.events.length = 0;
  const cached = await loadTeamSnapOneCalendar({
    env: { TEAMSNAP_ONE_CALENDAR_URL: FEED_URL },
    fetchImpl,
    now: new Date("2026-09-03T15:04:59.000Z"),
  });
  assert.equal(fetchCount, 1);
  assert.equal(cached.events.length, 3, "callers cannot mutate the cached feed");
});

test("the loader serves an expired cached schedule when a refresh fails", async () => {
  let fetchCount = 0;
  const stale = await loadTeamSnapOneCalendar({
    env: { TEAMSNAP_ONE_CALENDAR_URL: FEED_URL },
    fetchImpl: async () => {
      fetchCount += 1;
      throw new Error(`failed to fetch ${FEED_URL}`);
    },
    now: new Date("2026-09-03T15:05:01.000Z"),
  });

  assert.equal(fetchCount, 1);
  assert.equal(stale.available, true);
  assert.equal(stale.stale, true);
  assert.equal(stale.events.length, 3);
  assert.equal(stale.error.code, "refresh_failed");
  assert.equal(JSON.stringify(stale).includes("test-token-not-a-secret"), false);
});

test("missing, invalid, and unavailable connections fail softly without revealing configuration", async () => {
  resetTeamSnapOneCalendarCache();
  const missing = await loadTeamSnapOneCalendar({ env: {} });
  assert.equal(missing.configured, false);
  assert.equal(missing.available, false);
  assert.equal(missing.error, null);

  let fetchCalled = false;
  const invalidValue = "https://example.com/v1/user.ics?token=private-value";
  const invalid = await loadTeamSnapOneCalendar({
    env: { TEAMSNAP_ONE_CALENDAR_URL: invalidValue },
    fetchImpl: async () => {
      fetchCalled = true;
      throw new Error("must not run");
    },
  });
  assert.equal(fetchCalled, false);
  assert.equal(invalid.configured, true);
  assert.equal(invalid.available, false);
  assert.equal(invalid.error.code, "invalid_configuration");
  assert.equal(JSON.stringify(invalid).includes("private-value"), false);

  const unavailable = await loadTeamSnapOneCalendar({
    env: { TEAMSNAP_ONE_CALENDAR_URL: FEED_URL },
    fetchImpl: async () => ({ ok: false, status: 503, text: async () => "secret body" }),
  });
  assert.equal(unavailable.configured, true);
  assert.equal(unavailable.available, false);
  assert.equal(unavailable.stale, false);
  assert.equal(unavailable.events.length, 0);
  assert.equal(unavailable.error.code, "unavailable");
  assert.equal(JSON.stringify(unavailable).includes("test-token-not-a-secret"), false);
});

test("the protected calendar load includes TeamSnap ONE data without exposing the feed URL", async () => {
  const originalPassword = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  process.env.TOURNAMENT_CALENDAR_PASSWORD = "server-password";
  const teamsnapOne = {
    configured: true,
    available: true,
    stale: false,
    source: "TeamSnap ONE",
    syncedAt: "2026-09-03T15:00:00.000Z",
    calendarName: "TeamSnap ONE Schedule",
    events: parseTeamSnapOneCalendar(SAMPLE_CALENDAR),
    counts: { total: 3, active: 2, cancelled: 1, practices: 1, games: 0, other: 1 },
    error: null,
  };
  const handler = createCalendarHandler({
    authorize: async () => ({ ok: false }),
    getBlobStore: () => ({
      getWithMetadata: async () => ({ data: { events: [] }, etag: '"v1"' }),
    }),
    loadTeamSnapOne: async () => teamsnapOne,
  });

  try {
    const response = await handler(new Request(
      "https://www.bethebestli.com/.netlify/functions/tournament-calendar",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://www.bethebestli.com" },
        body: JSON.stringify({ action: "load", password: "server-password" }),
      },
    ));
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(payload.teamsnapOne, teamsnapOne);
    assert.doesNotMatch(JSON.stringify(payload), /calendar-api[.]teamsnap[.]com/);
  } finally {
    if (originalPassword === undefined) delete process.env.TOURNAMENT_CALENDAR_PASSWORD;
    else process.env.TOURNAMENT_CALENDAR_PASSWORD = originalPassword;
  }
});

test("calendar loads expose configured TeamSnap outages but omit Netlify's invalid secret placeholder", async () => {
  const store = {
    getWithMetadata: async () => ({ data: { events: [] }, etag: '"v1"' }),
  };
  const request = () => new Request(
    "https://www.bethebestli.com/.netlify/functions/tournament-calendar",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://www.bethebestli.com" },
      body: JSON.stringify({ action: "load" }),
    },
  );
  const configuredFailure = {
    configured: true,
    available: false,
    stale: false,
    source: "TeamSnap ONE",
    syncedAt: null,
    calendarName: "TeamSnap ONE Schedule",
    events: [],
    counts: { total: 0, active: 0, cancelled: 0, practices: 0, games: 0, other: 0 },
    error: { code: "unavailable", message: "The TeamSnap ONE calendar is temporarily unavailable." },
  };
  const outageHandler = createCalendarHandler({
    authorize: async () => ({ ok: true }),
    getBlobStore: () => store,
    loadTeamSnapOne: async () => configuredFailure,
  });

  const outageResponse = await outageHandler(request());
  const outagePayload = await outageResponse.json();
  assert.equal(outageResponse.status, 200);
  assert.deepEqual(outagePayload.teamsnapOne, configuredFailure);

  const placeholderHandler = createCalendarHandler({
    authorize: async () => ({ ok: true }),
    getBlobStore: () => store,
    loadTeamSnapOne: async () => ({
      ...configuredFailure,
      configured: true,
      error: {
        code: "invalid_configuration",
        message: "The TeamSnap ONE calendar connection needs attention.",
      },
    }),
  });
  const placeholderResponse = await placeholderHandler(request());
  const placeholderPayload = await placeholderResponse.json();
  assert.equal(placeholderResponse.status, 200);
  assert.equal(Object.prototype.hasOwnProperty.call(placeholderPayload, "teamsnapOne"), false);
});

test("Dan's calendar renders a native TeamSnap ONE view and never embeds the private feed", () => {
  const html = readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8");
  assert.match(html, /id="liveAgenda"/);
  assert.match(html, /function renderTeamSnapOneFeed\(/);
  assert.match(html, /function refreshTeamSnapOne\(/);
  assert.match(html, /function applyScheduleData\(data, resetMissingTeamSnapOne\)/);
  assert.match(html, /else if \(resetMissingTeamSnapOne\)\s*{\s*normalizeTeamSnapOneData\(\{}\);/);
  assert.match(html, /function loadSchedule\(\)[\s\S]*?applyScheduleData\(data, true\);/);
  assert.match(html, /TeamSnap ONE practices are updated in TeamSnap ONE/);
  assert.doesNotMatch(html, /id="liveFrame"|calendar\.google\.com\/calendar\/embed/);
  assert.doesNotMatch(html, /calendar-api\.teamsnap\.com\/v1\/user\.ics/);
});
