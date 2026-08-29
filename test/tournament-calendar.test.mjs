import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { ALLOWED_ORIGINS } from "../netlify/functions/_guard.js";
import {
  calendarOriginsForRequest,
  claimPractice,
  KNOWN_TEAMS,
  normalizeSnapshot,
  PRACTICE_WINDOWS,
  practiceBookingsConflict,
  readCalendarSnapshot,
  releasePractice,
  saveCalendarSnapshot,
} from "../netlify/functions/tournament-calendar.mjs";

const FIXED_NOW = new Date("2026-08-29T14:00:00.000Z");

function memoryStore(initial = null) {
  let data = initial === null ? null : structuredClone(initial);
  let sequence = initial === null ? 0 : 1;
  let etag = initial === null ? null : `"v${sequence}"`;
  let forcedMisses = 0;
  let writeCount = 0;

  return {
    get data() {
      return data === null ? null : structuredClone(data);
    },
    get etag() {
      return etag;
    },
    get writeCount() {
      return writeCount;
    },
    forceConditionalMisses(count) {
      forcedMisses = count;
    },
    async getWithMetadata(_key, options = {}) {
      assert.equal(options.type, "json");
      if (data === null) return null;
      return { data: structuredClone(data), etag, metadata: {} };
    },
    async setJSON(_key, value, options = {}) {
      writeCount += 1;
      if (forcedMisses > 0) {
        forcedMisses -= 1;
        return { modified: false };
      }
      if (options.onlyIfNew && data !== null) return { modified: false };
      if (options.onlyIfMatch && options.onlyIfMatch !== etag) return { modified: false };

      data = structuredClone(value);
      sequence += 1;
      etag = `"v${sequence}"`;
      return { modified: true, etag };
    },
  };
}

function claimOptions(id) {
  return {
    now: FIXED_NOW,
    idFactory: () => id,
  };
}

function pagePracticeWindows() {
  const html = readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8");
  const start = html.indexOf("var SEAFORD_DATES =");
  const end = html.indexOf("var DEFAULT_EVENTS =", start);
  assert.ok(start >= 0 && end > start, "practice-window source must remain extractable from the staff page");
  const context = {};
  runInNewContext(`${html.slice(start, end)}\nthis.result = PRACTICE_WINDOWS;`, context);
  return JSON.parse(JSON.stringify(context.result));
}

async function expectCalendarError(promise, { status, code }) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

test("the server exposes exactly 123 authoritative outdoor and Momentum windows", () => {
  const seaford = PRACTICE_WINDOWS.filter((window) => window.venue === "Seaford HS Turf");
  const nickersonWeekdays = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Nickerson Field 2" && window.kind === "weekday"
  ));
  const nickersonSaturdays = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Nickerson Field 2" && window.kind === "saturday"
  ));
  const pointLookoutWeekdays = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Point Lookout" && window.kind === "weekday"
  ));
  const pointLookoutSaturdays = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Point Lookout" && window.kind === "saturday"
  ));
  const momentumOneHour = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Momentum Sports LI" && window.requiredDurationHours === 1
  ));
  const momentumTwoHour = PRACTICE_WINDOWS.filter((window) => (
    window.venue === "Momentum Sports LI" && window.requiredDurationHours === 2
  ));

  assert.equal(PRACTICE_WINDOWS.length, 123);
  assert.equal(seaford.length, 24);
  assert.equal(nickersonWeekdays.length, 26);
  assert.equal(nickersonSaturdays.length, 9);
  assert.equal(pointLookoutWeekdays.length, 15);
  assert.equal(pointLookoutSaturdays.length, 6);
  assert.equal(momentumOneHour.length, 21);
  assert.equal(momentumTwoHour.length, 22);

  assert.deepEqual(seaford.map((window) => window.date), [
    "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
    "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
    "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
    "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25",
    "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02",
  ]);
  assert.deepEqual(seaford.slice(0, 4).map((window) => window.approval), Array(4).fill("confirmed"));
  assert.deepEqual(seaford.slice(4).map((window) => window.approval), Array(20).fill("week-by-week"));
  assert.ok(seaford.every((window) => window.startTime === "19:15" && window.endTime === "21:15"));

  assert.deepEqual(nickersonWeekdays.map((window) => window.date), [
    "2026-09-02", "2026-09-04", "2026-09-07", "2026-09-09", "2026-09-11",
    "2026-09-14", "2026-09-16", "2026-09-18", "2026-09-21", "2026-09-23",
    "2026-09-25", "2026-09-28", "2026-09-30",
    "2026-10-02", "2026-10-05", "2026-10-07", "2026-10-09", "2026-10-12",
    "2026-10-14", "2026-10-16", "2026-10-19", "2026-10-21", "2026-10-23",
    "2026-10-26", "2026-10-28", "2026-10-30",
  ]);
  assert.ok(nickersonWeekdays.every((window) => window.startTime === "17:00" && window.endTime === "18:30"));
  assert.deepEqual(nickersonSaturdays.map((window) => window.date), [
    "2026-09-05", "2026-09-12", "2026-09-19", "2026-09-26",
    "2026-10-03", "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31",
  ]);
  assert.ok(nickersonSaturdays.every((window) => window.startTime === "09:00" && window.endTime === "13:00"));

  assert.deepEqual(pointLookoutWeekdays.map((window) => window.date), [
    "2026-09-09", "2026-09-14", "2026-09-16", "2026-09-21", "2026-09-23",
    "2026-09-28", "2026-09-30", "2026-10-05", "2026-10-07", "2026-10-12",
    "2026-10-14", "2026-10-19", "2026-10-21", "2026-10-26", "2026-10-28",
  ]);
  assert.ok(pointLookoutWeekdays.every((window) => (
    window.startTime === "18:00" && window.endTime === "20:00" && window.approval === "confirmed"
  )));
  assert.deepEqual(pointLookoutSaturdays.map((window) => window.date), [
    "2026-09-12", "2026-09-26", "2026-10-03",
    "2026-10-10", "2026-10-17", "2026-10-24",
  ]);
  assert.ok(pointLookoutSaturdays.every((window) => (
    window.startTime === "08:00" && window.endTime === "10:00" && window.approval === "confirmed"
  )));
  assert.equal(PRACTICE_WINDOWS.some((window) => window.id === "point-lookout-2026-09-19"), false);
  assert.equal(PRACTICE_WINDOWS.some((window) => window.id === "point-lookout-2026-09-05"), false);
  assert.equal(PRACTICE_WINDOWS.some((window) => window.id === "point-lookout-2026-10-31"), false);

  assert.deepEqual(momentumOneHour.map((window) => window.date), [
    "2026-11-01", "2026-11-14", "2026-11-15", "2026-11-28", "2026-11-29",
    "2026-12-12", "2026-12-13", "2026-12-26", "2026-12-27",
    "2027-01-09", "2027-01-10", "2027-01-23", "2027-01-24",
    "2027-02-06", "2027-02-07", "2027-02-20", "2027-02-21",
    "2027-03-06", "2027-03-07", "2027-03-20", "2027-03-21",
  ]);
  assert.deepEqual(momentumTwoHour.map((window) => window.date), [
    "2026-11-07", "2026-11-08", "2026-11-21", "2026-11-22",
    "2026-12-05", "2026-12-06", "2026-12-19", "2026-12-20",
    "2027-01-02", "2027-01-03", "2027-01-16", "2027-01-17", "2027-01-30", "2027-01-31",
    "2027-02-13", "2027-02-14", "2027-02-27", "2027-02-28",
    "2027-03-13", "2027-03-14", "2027-03-27", "2027-03-28",
  ]);
  assert.ok(momentumOneHour.every((window) => (
    window.startTime === "08:00" && window.endTime === "15:00" &&
    window.startIncrementMinutes === 60 && window.teamCount === 1 &&
    window.location === "10 Dunton Avenue, Deer Park, NY 11729"
  )));
  assert.ok(momentumTwoHour.every((window) => (
    window.startTime === "08:00" && window.endTime === "15:00" &&
    window.startIncrementMinutes === 60 && window.teamCount === 2 &&
    window.location === "10 Dunton Avenue, Deer Park, NY 11729"
  )));
});

test("the staff page and claim API expose identical practice-window rules", () => {
  const fields = [
    "id", "venue", "location", "date", "startTime", "endTime", "kind", "approval",
    "startIncrementMinutes", "teamCount", "requiredDurationHours",
  ];
  const normalize = (window) => Object.fromEntries(fields.map((field) => [field, window[field]]));
  const byId = (a, b) => a.id.localeCompare(b.id);

  assert.deepEqual(
    pagePracticeWindows().map(normalize).sort(byId),
    PRACTICE_WINDOWS.map(normalize).sort(byId),
  );
});

test("known-team validation covers the full 25-team 2026-27 operating list", () => {
  assert.deepEqual(KNOWN_TEAMS, [
    "2028 Black", "2029 Chrome", "2030 Rage", "2031 Carnage", "2032 Grizzlies",
    "2032 Cannons", "2033 Renegades", "2034 Venom", "2035 Bombers", "2036 Fury",
    "2036 Dawgs", "Boys Futures", "2037 Boys", "2030 Reign", "2030 Tidal Wave",
    "2031 Cyclones", "2032 Riptide", "2033 Storm", "2034 Thunder", "2034 Tsunami",
    "2035 Hurricanes", "2035 Tornadoes", "2036 Avalanche", "Girls Futures", "2037 Girls",
  ]);
  assert.equal(new Set(KNOWN_TEAMS).size, 25);
});

test("legacy snapshots normalize to an empty practice booking list", () => {
  assert.deepEqual(normalizeSnapshot({ events: [{ id: "event-1" }], savedAt: "legacy" }), {
    version: 0,
    events: [{ id: "event-1" }],
    practiceBookings: [],
    savedAt: "legacy",
  });
});

test("a Nickerson weekday accepts 1.5 hours and rejects a 2-hour claim", async () => {
  const store = memoryStore();
  const valid = await claimPractice(store, {
    windowId: "nickerson-2026-09-02",
    team: "2037 Boys",
    coach: "Coach Taylor",
    startTime: "17:00",
    durationHours: 1.5,
  }, claimOptions("weekday-valid"));

  assert.equal(valid.booking.endTime, "18:30");
  assert.equal(valid.snapshot.practiceBookings.length, 1);

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-02",
    team: "2037 Girls",
    coach: "Coach Marisa",
    startTime: "17:00",
    durationHours: 2,
  }, claimOptions("weekday-too-long")), { status: 400, code: "outside_window" });
});

test("Seaford alignment is relative to its 19:15 start and allows a full 2 hours", async () => {
  const valid = await claimPractice(memoryStore(), {
    windowId: "seaford-2026-09-01",
    team: "Girls Futures",
    coach: "Coach Emma",
    startTime: "19:15",
    durationHours: 2,
  }, claimOptions("seaford-full-window"));

  assert.equal(valid.booking.startTime, "19:15");
  assert.equal(valid.booking.endTime, "21:15");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "seaford-2026-09-01",
    team: "Boys Futures",
    coach: "Coach Mike",
    startTime: "19:30",
    durationHours: 1,
  }, claimOptions("seaford-misaligned")), { status: 400, code: "invalid_start" });
});

test("Point Lookout weekday and Saturday claims fit their full approved windows", async () => {
  const weekday = await claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-09",
    team: "2030 Rage",
    coach: "Coach Taylor",
    startTime: "18:00",
    durationHours: 2,
  }, claimOptions("point-lookout-weekday"));
  assert.equal(weekday.booking.endTime, "20:00");
  assert.equal(weekday.booking.location, "Point Lookout Town Park — Lacrosse Field, Point Lookout, NY");

  const saturday = await claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-12",
    team: "2034 Thunder",
    coach: "Coach Marisa",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("point-lookout-saturday"));
  assert.equal(saturday.booking.endTime, "10:00");
});

test("Momentum one-hour windows require one team, one hour, and hourly starts", async () => {
  const valid = await claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Girls",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team"));

  assert.equal(valid.booking.team, "2037 Girls");
  assert.deepEqual(valid.booking.teams, ["2037 Girls"]);
  assert.equal(valid.booking.secondTeam, null);
  assert.equal(valid.booking.endTime, "09:00");
  assert.equal(valid.booking.venue, "Momentum Sports LI");
  assert.equal(
    valid.booking.location,
    "10 Dunton Avenue, Deer Park, NY 11729",
  );

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Girls",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-one-team-too-long")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Girls",
    secondTeam: "2037 Boys",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team-extra")), { status: 400, code: "invalid_team_count" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Girls",
    coach: "Coach Emma",
    startTime: "08:30",
    durationHours: 1,
  }, claimOptions("momentum-half-hour-start")), { status: 400, code: "invalid_start" });
});

test("Momentum shared windows require two distinct known teams for exactly two hours", async () => {
  const store = memoryStore();
  const first = await claimPractice(store, {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "2037 Girls",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-first"));

  assert.equal(first.booking.team, "2037 Boys");
  assert.deepEqual(first.booking.teams, ["2037 Boys", "2037 Girls"]);
  assert.equal(first.booking.secondTeam, "2037 Girls");
  assert.equal(first.booking.endTime, "10:00");

  const adjacent = await claimPractice(store, {
    windowId: "momentum-2026-11-07",
    teams: ["2036 Fury", "2036 Avalanche"],
    coach: "Coach Marisa",
    startTime: "10:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-adjacent"));
  assert.equal(adjacent.snapshot.practiceBookings.length, 2);
  assert.deepEqual(adjacent.booking.teams, ["2036 Fury", "2036 Avalanche"]);

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-missing-second")), { status: 400, code: "invalid_team_count" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "2037 Boys",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-duplicate-team")), { status: 400, code: "invalid_teams" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "Unknown Team",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-unknown-second")), { status: 400, code: "invalid_team" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "2037 Girls",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-on-shared-day")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "2037 Girls",
    coach: "Coach Taylor",
    startTime: "14:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-remainder")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    secondTeam: "2037 Girls",
    coach: "Coach Taylor",
    startTime: "14:00",
    durationHours: 2,
  }, claimOptions("momentum-two-hours-outside")), { status: 400, code: "outside_window" });
});

test("a Nickerson Saturday can be split into adjacent 9-11 and 11-1 claims", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 2,
  }, claimOptions("saturday-first"));
  const second = await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2033 Renegades",
    coach: "Coach Two",
    startTime: "11:00",
    durationHours: 2,
  }, claimOptions("saturday-second"));

  assert.equal(second.snapshot.practiceBookings.length, 2);
  assert.deepEqual(second.snapshot.practiceBookings.map((booking) => booking.startTime), ["09:00", "11:00"]);
});

test("claims reject same-window overlap, outside starts, invalid durations, teams, and coaches", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-12",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 2,
  }, claimOptions("occupied"));

  await expectCalendarError(claimPractice(store, {
    windowId: "nickerson-2026-09-12",
    team: "2033 Renegades",
    coach: "Coach Two",
    startTime: "10:30",
    durationHours: 1.5,
  }, claimOptions("overlap")), { status: 409, code: "practice_overlap" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-12",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "08:30",
    durationHours: 1,
  }, claimOptions("outside")), { status: 400, code: "outside_window" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-12",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 1.25,
  }, claimOptions("duration")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-12",
    team: "Unknown Team",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("unknown-team")), { status: 400, code: "invalid_team" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-12",
    team: "2036 Dawgs",
    coach: "   ",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("missing-coach")), { status: 400, code: "invalid_coach" });
});

test("same-team and same-coach overlaps are detected across different locations", () => {
  const first = {
    windowId: "field-a",
    date: "2026-09-01",
    team: "2036 Dawgs",
    coach: "Coach Taylor",
    startTime: "19:00",
    endTime: "20:30",
    durationHours: 1.5,
  };

  assert.equal(practiceBookingsConflict(first, {
    ...first,
    windowId: "field-b",
    coach: "Different Coach",
    startTime: "20:00",
    endTime: "21:00",
  }), true);
  assert.equal(practiceBookingsConflict(first, {
    ...first,
    windowId: "field-b",
    team: "2035 Hurricanes",
    coach: "  coach taylor ",
    startTime: "20:00",
    endTime: "21:00",
  }), true);
  assert.equal(practiceBookingsConflict(first, {
    ...first,
    windowId: "field-b",
    team: "2035 Hurricanes",
    coach: "Different Coach",
    startTime: "20:00",
    endTime: "21:00",
  }), false);

  const sharedPractice = {
    ...first,
    team: "2037 Boys",
    teams: ["2037 Boys", "2037 Girls"],
    secondTeam: "2037 Girls",
  };
  assert.equal(practiceBookingsConflict(sharedPractice, {
    ...first,
    windowId: "field-b",
    team: "2037 Girls",
    teams: ["2037 Girls"],
    secondTeam: null,
    coach: "Different Coach",
    startTime: "20:00",
    endTime: "21:00",
  }), true);
});

test("a practice booking can be released atomically", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-19",
    team: "2034 Tsunami",
    coach: "Coach Brad",
    startTime: "09:00",
    durationHours: 1.5,
  }, claimOptions("release-me"));

  store.forceConditionalMisses(2);
  const released = await releasePractice(store, "release-me", { now: FIXED_NOW });
  assert.equal(released.snapshot.practiceBookings.length, 0);
  assert.equal(released.snapshot.version, 2);
  assert.equal(store.writeCount, 4);
});

test("an event-only legacy save without an ETag preserves current practice claims", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-26",
    team: "2032 Grizzlies",
    coach: "Coach Steve",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("preserved-claim"));

  const saved = await saveCalendarSnapshot(store, { events: [{ id: "event-2" }] }, undefined, {
    now: FIXED_NOW,
  });
  assert.deepEqual(saved.snapshot.events, [{ id: "event-2" }]);
  assert.equal(saved.snapshot.practiceBookings.length, 1);
  assert.equal(saved.snapshot.practiceBookings[0].id, "preserved-claim");
});

test("a stale full save cannot erase a newer practice claim", async () => {
  const store = memoryStore({
    version: 4,
    events: [{ id: "event-1" }],
    practiceBookings: [],
    savedAt: "2026-08-28T12:00:00.000Z",
  });
  const beforeClaim = await readCalendarSnapshot(store);

  await claimPractice(store, {
    windowId: "nickerson-2026-10-03",
    team: "2035 Tornadoes",
    coach: "Coach Marisa",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("newer-claim"));

  await expectCalendarError(saveCalendarSnapshot(store, {
    events: [{ id: "stale-event-edit" }],
    practiceBookings: [],
  }, beforeClaim.etag, { now: FIXED_NOW }), { status: 409, code: "stale_etag" });

  assert.equal(store.data.practiceBookings.length, 1);
  assert.equal(store.data.practiceBookings[0].id, "newer-claim");
  assert.deepEqual(store.data.events, [{ id: "event-1" }]);
});

test("atomic claims retry ETag misses three times and report contention after the limit", async () => {
  const eventuallyAvailable = memoryStore();
  eventuallyAvailable.forceConditionalMisses(2);
  const claimed = await claimPractice(eventuallyAvailable, {
    windowId: "nickerson-2026-10-10",
    team: "2036 Fury",
    coach: "Coach Mike",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("third-attempt"));
  assert.equal(eventuallyAvailable.writeCount, 3);
  assert.equal(claimed.snapshot.practiceBookings.length, 1);

  const contended = memoryStore();
  contended.forceConditionalMisses(3);
  await expectCalendarError(claimPractice(contended, {
    windowId: "nickerson-2026-10-17",
    team: "2036 Fury",
    coach: "Coach Mike",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("never-written")), { status: 409, code: "contention" });
  assert.equal(contended.writeCount, 3);
  assert.equal(contended.data, null);
});

test("deploy preview origins are allowed dynamically without widening the production list", () => {
  const preview = "https://deploy-preview-248--btb-lacrosse.netlify.app";
  const allowed = calendarOriginsForRequest(new Request("https://example.test", {
    headers: { origin: preview },
  }));
  assert.deepEqual(allowed, ALLOWED_ORIGINS.concat(preview));

  const malicious = "https://deploy-preview-248--btb-lacrosse.netlify.app.evil.test";
  assert.deepEqual(calendarOriginsForRequest(new Request("https://example.test", {
    headers: { origin: malicious },
  })), ALLOWED_ORIGINS);
});
