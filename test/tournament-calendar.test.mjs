import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

import { ALLOWED_ORIGINS } from "../netlify/functions/_guard.js";
import {
  calendarAlertRecipients,
  calendarOriginsForRequest,
  claimPractice,
  deleteScheduledPractice,
  effectiveAssignedPractices,
  KNOWN_TEAMS,
  MAX_COACHES_PER_BOOKING,
  MAX_RECENT_CHANGES,
  normalizeRecentChanges,
  normalizePracticeOverrides,
  normalizeSnapshot,
  normalizeTournamentEvents,
  PRACTICE_WINDOWS,
  practiceBookingsConflict,
  readCalendarSnapshot,
  releasePractice,
  saveCalendarSnapshot,
  saveScheduledPractice,
  sendCalendarChangeAlert,
  validatePracticeBookings,
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

function staffPageHtml() {
  return readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8");
}

function pngDimensions(fileUrl) {
  const png = readFileSync(fileUrl);
  assert.deepEqual(Array.from(png.subarray(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

function pageConflictGroups(events) {
  const html = staffPageHtml();
  const start = html.indexOf("function normalizeTournamentPlanValue");
  const end = html.indexOf("function conflictForDay", start);
  assert.ok(start >= 0 && end > start, "conflict logic must remain extractable from the staff page");
  const context = {
    events: structuredClone(events),
    STATUS_META: {
      confirmed: { locked: true, score: 4 },
      entering: { locked: false, score: 2 },
    },
  };
  runInNewContext(`${html.slice(start, end)}\nthis.result = getConflictGroups();`, context);
  return JSON.parse(JSON.stringify(context.result));
}

function pagePracticeWindows() {
  const html = staffPageHtml();
  const start = html.indexOf("var SEAFORD_DATES =");
  const end = html.indexOf("var DEFAULT_EVENTS =", start);
  assert.ok(start >= 0 && end > start, "practice-window source must remain extractable from the staff page");
  const context = {};
  runInNewContext(`${html.slice(start, end)}\nthis.result = PRACTICE_WINDOWS;`, context);
  return JSON.parse(JSON.stringify(context.result));
}

function pageTrainingSessions() {
  const html = staffPageHtml();
  const start = html.indexOf("var TRAINING_COLOR =");
  const end = html.indexOf("var BLUE_CHIP_EVENT_IDS =", start);
  assert.ok(start >= 0 && end > start, "training-session source must remain extractable from the staff page");
  const context = {};
  runInNewContext(`${html.slice(start, end)}\nthis.result = TRAINING_SESSIONS;`, context);
  return JSON.parse(JSON.stringify(context.result));
}

function genericPracticeWindows(windows = PRACTICE_WINDOWS) {
  return windows.filter((window) => window.mode !== "assigned");
}

function assignedPracticeWindows(windows = PRACTICE_WINDOWS) {
  return windows.filter((window) => window.mode === "assigned");
}

function practiceWindow(id, windows = PRACTICE_WINDOWS) {
  const window = windows.find((candidate) => candidate.id === id);
  assert.ok(window, `expected practice window ${id}`);
  return window;
}

function expectedAssignedPracticeSlots() {
  const slots = [];
  const add = (locationKey, dates, startTime, endTime, teams) => {
    for (const date of dates) {
      for (const team of teams) {
        const teamSlug = team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        slots.push({
          id: `pdf-${locationKey}-${date}-${teamSlug}`,
          locationKey,
          date,
          startTime,
          endTime,
          team,
        });
      }
    }
  };

  const tuesdays = [
    "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29",
    "2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27",
  ];
  const wednesdays = [
    "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30",
    "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28",
  ];
  const thursdays = [
    "2026-09-10", "2026-09-17", "2026-09-24", "2026-10-01",
    "2026-10-08", "2026-10-15", "2026-10-22", "2026-10-29",
  ];
  const saturdays = [
    "2026-09-12", "2026-09-19", "2026-09-26", "2026-10-03",
    "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31",
  ];
  const sundays = [
    "2026-09-13", "2026-09-20", "2026-09-27", "2026-10-04",
    "2026-10-11", "2026-10-18", "2026-10-25",
  ];
  const mondays = [
    "2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05",
    "2026-10-12", "2026-10-19", "2026-10-26",
  ];
  const pointLookoutSaturdays = saturdays.filter((date) => date !== "2026-09-19");

  add("seaford", tuesdays, "19:15", "21:00", ["2033 Storm"]);
  add("seaford", wednesdays, "19:15", "21:15", [
    "2036 Dawgs", "2035 Bombers", "2032 Riptide",
  ]);
  add("seaford", wednesdays, "19:15", "20:15", [
    "2036 Avalanche",
  ]);
  add("seaford", thursdays, "19:15", "20:15", [
    "2035 Hurricanes",
  ]);
  add("seaford", thursdays, "20:00", "21:15", [
    "2031 Cyclones",
  ]);
  add("seaford", saturdays, "15:00", null, ["2035 Bombers"]);
  add("seaford", sundays, "09:00", "11:00", ["2032 Riptide", "2028 Black"]);
  add("seaford", sundays, "08:00", "09:30", ["2031 Cyclones"]);
  add("seaford", mondays, "19:15", "21:15", ["2033 Renegades"]);
  add("seaford", mondays, "19:15", "20:45", ["2034 Venom"]);

  add("stimson", sundays, "09:00", "10:30", [
    "2030 Rage", "2032 Cannons",
  ]);
  add("stimson", sundays, "10:30", "12:00", [
    "2031 Carnage",
  ]);

  add("nickerson", saturdays, "09:00", "10:30", ["2036 Dawgs"]);
  add("nickerson", saturdays, "10:30", "12:30", ["2033 Renegades"]);
  add("nickerson", saturdays, "08:15", "09:30", ["2036 Avalanche"]);
  add("nickerson", saturdays, "09:30", "11:00", ["2035 Hurricanes"]);
  add("nickerson", saturdays, "09:00", "10:30", ["2034 Venom"]);
  add("nickerson", saturdays, "10:30", "11:45", ["2037 Wolves"]);

  add("point-lookout", wednesdays, "18:00", "20:00", ["2034 Thunder"]);
  add("point-lookout", wednesdays, "18:00", "19:15", ["2037 Wolves"]);
  add("point-lookout", pointLookoutSaturdays, "08:00", "10:00", ["2033 Storm", "2034 Thunder"]);

  return slots;
}

async function expectCalendarError(promise, { status, code }) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
}

test("the server exposes 123 generic windows plus 198 recurring team practice slots", () => {
  const generic = genericPracticeWindows();
  const assigned = assignedPracticeWindows();
  const seaford = generic.filter((window) => window.venue === "Seaford HS Turf");
  const nickersonWeekdays = generic.filter((window) => (
    window.venue === "Nickerson Field 2" && window.kind === "weekday"
  ));
  const nickersonSaturdays = generic.filter((window) => (
    window.venue === "Nickerson Field 2" && window.kind === "saturday"
  ));
  const pointLookoutWeekdays = generic.filter((window) => (
    window.venue === "Point Lookout" && window.kind === "weekday"
  ));
  const pointLookoutSaturdays = generic.filter((window) => (
    window.venue === "Point Lookout" && window.kind === "saturday"
  ));
  const momentumOneHour = generic.filter((window) => (
    window.venue === "Momentum Sports LI" && window.requiredDurationHours === 1
  ));
  const momentumTwoHour = generic.filter((window) => (
    window.venue === "Momentum Sports LI" && window.requiredDurationHours === 2
  ));

  assert.equal(PRACTICE_WINDOWS.length, 321);
  assert.equal(generic.length, 123);
  assert.equal(assigned.length, 198);
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
    window.startIncrementMinutes === 60 && window.teamCount === 1 && window.claimCapacity === 2 &&
    window.location === "10 Dunton Avenue, Deer Park, NY 11729"
  )));
  assert.ok(momentumTwoHour.every((window) => (
    window.startTime === "08:00" && window.endTime === "15:00" &&
    window.startIncrementMinutes === 60 && window.teamCount === 1 && window.claimCapacity === 2 &&
    window.location === "10 Dunton Avenue, Deer Park, NY 11729"
  )));
  assert.ok(generic.every((window) => window.claimCapacity === 2));
  assert.ok(assigned.every((window) => window.claimCapacity === 1));
});

test("assigned team slots repeat every September pattern through October", () => {
  const assigned = assignedPracticeWindows();
  const countsByLocation = Object.fromEntries([
    "seaford", "stimson", "nickerson", "point-lookout",
  ].map((locationKey) => [
    locationKey,
    assigned.filter((window) => window.locationKey === locationKey).length,
  ]));
  const countsByTeam = assigned.reduce((counts, window) => {
    const team = window.assignedTeams[0];
    counts[team] = (counts[team] || 0) + 1;
    return counts;
  }, {});

  assert.equal(assigned.length, 198);
  assert.deepEqual(
    assigned.map((window) => ({
      id: window.id,
      locationKey: window.locationKey,
      date: window.date,
      startTime: window.startTime,
      endTime: window.endTime,
      team: window.assignedTeams[0],
    })).sort((a, b) => a.id.localeCompare(b.id)),
    expectedAssignedPracticeSlots().sort((a, b) => a.id.localeCompare(b.id)),
  );
  assert.deepEqual(countsByLocation, {
    seaford: 99,
    stimson: 21,
    nickerson: 48,
    "point-lookout": 30,
  });
  assert.deepEqual(countsByTeam, {
    "2036 Avalanche": 16,
    "2033 Renegades": 15,
    "2036 Dawgs": 16,
    "2035 Bombers": 16,
    "2032 Riptide": 15,
    "2031 Cyclones": 15,
    "2034 Venom": 15,
    "2030 Rage": 7,
    "2032 Cannons": 7,
    "2028 Black": 7,
    "2031 Carnage": 7,
    "2035 Hurricanes": 16,
    "2033 Storm": 15,
    "2034 Thunder": 15,
    "2037 Wolves": 16,
  });
  const expectedTuesdays = [
    "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29",
    "2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27",
  ];
  const stormTuesdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2033 Storm" && window.locationKey === "seaford" && window.startTime === "19:15"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(stormTuesdays.map((window) => window.date), expectedTuesdays);
  assert.ok(stormTuesdays.every((window) => window.endTime === "21:00"));
  const expectedMondays = [
    "2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05",
    "2026-10-12", "2026-10-19", "2026-10-26",
  ];
  const venomMondays = assigned.filter((window) => (
    window.assignedTeams[0] === "2034 Venom" && window.date >= "2026-09-14" &&
    window.locationKey === "seaford" && window.startTime === "19:15"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(venomMondays.map((window) => window.date), expectedMondays);
  assert.ok(venomMondays.every((window) => (
    window.endTime === "20:45" && window.requiredDurationHours === 1.5
  )));
  const renegadesMondays = assigned.filter((window) => (
    window.assignedTeams[0] === "2033 Renegades" && window.locationKey === "seaford" && window.startTime === "19:15"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(renegadesMondays.map((window) => window.date), expectedMondays);
  assert.ok(renegadesMondays.every((window) => (
    window.endTime === "21:15" && window.requiredDurationHours === 2 && window.assignmentStatus === "adjusted"
  )));
  assert.equal(assigned.some((window) => (
    window.assignedTeams[0] === "2034 Venom" && window.locationKey === "stimson"
  )), false);

  const expectedThursdays = [
    "2026-09-10", "2026-09-17", "2026-09-24", "2026-10-01",
    "2026-10-08", "2026-10-15", "2026-10-22", "2026-10-29",
  ];
  const hurricanesThursdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2035 Hurricanes" && window.locationKey === "seaford"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(hurricanesThursdays.map((window) => window.date), expectedThursdays);
  assert.ok(hurricanesThursdays.every((window) => (
    window.startTime === "19:15" && window.endTime === "20:15" && window.requiredDurationHours === 1
  )));
  assert.equal(assigned.some((window) => (
    window.assignedTeams[0] === "2035 Hurricanes" && window.locationKey !== "seaford" &&
    window.locationKey !== "nickerson"
  )), false);

  const cyclonesThursdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2031 Cyclones" && window.locationKey === "seaford" &&
    window.startTime === "20:00"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(cyclonesThursdays.map((window) => window.date), expectedThursdays);
  assert.ok(cyclonesThursdays.every((window) => (
    window.endTime === "21:15" && window.requiredDurationHours === 1.25
  )));

  const riptideWeekdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2032 Riptide" &&
    window.locationKey === "seaford" &&
    window.startTime === "19:15"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(riptideWeekdays.map((window) => window.date), [
    "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30",
    "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28",
  ]);
  assert.ok(riptideWeekdays.every((window) => window.endTime === "21:15"));
  const stormPointLookout = assigned.filter((window) => (
    window.assignedTeams[0] === "2033 Storm" && window.locationKey === "point-lookout"
  ));
  assert.equal(stormPointLookout.length, 7);
  assert.equal(stormPointLookout.some((window) => window.date === "2026-09-19"), false);

  const black2028Sundays = assigned.filter((window) => window.assignedTeams[0] === "2028 Black")
    .sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(black2028Sundays.map((window) => window.date), [
    "2026-09-13", "2026-09-20", "2026-09-27", "2026-10-04",
    "2026-10-11", "2026-10-18", "2026-10-25",
  ]);
  assert.ok(black2028Sundays.every((window) => (
    window.locationKey === "seaford" && window.startTime === "09:00" && window.endTime === "11:00" &&
    window.requiredDurationHours === 2
  )));
  assert.equal(assigned.some((window) => (
    window.assignedTeams[0] === "2028 Black" && window.locationKey === "stimson"
  )), false);

  const wolvesWednesdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2037 Wolves" && window.locationKey === "point-lookout"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(wolvesWednesdays.map((window) => window.date), [
    "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30",
    "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28",
  ]);
  assert.ok(wolvesWednesdays.every((window) => (
    window.startTime === "18:00" && window.endTime === "19:15" && window.requiredDurationHours === 1.25
  )));

  const wolvesSaturdays = assigned.filter((window) => (
    window.assignedTeams[0] === "2037 Wolves" && window.locationKey === "nickerson"
  )).sort((a, b) => a.date.localeCompare(b.date));
  assert.deepEqual(wolvesSaturdays.map((window) => window.date), [
    "2026-09-12", "2026-09-19", "2026-09-26", "2026-10-03",
    "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31",
  ]);
  assert.ok(wolvesSaturdays.every((window) => (
    window.startTime === "10:30" && window.endTime === "11:45" && window.requiredDurationHours === 1.25
  )));

  assert.equal(new Set(assigned.map((window) => window.id)).size, 198);
  assert.ok(assigned.every((window) => (
    /^pdf-(seaford|stimson|nickerson|point-lookout)-2026-(09|10)-\d{2}-[a-z0-9-]+$/.test(window.id) &&
    window.date >= "2026-09-08" && window.date <= "2026-10-31" &&
    window.mode === "assigned" && window.claimMode === "assigned" &&
    Array.isArray(window.assignedTeams) && window.assignedTeams.length === 1 &&
    KNOWN_TEAMS.includes(window.assignedTeams[0]) && window.teamCount === 1 && window.claimCapacity === 1
  )));
  assert.equal(
    assigned.some((window) => window.locationKey === "point-lookout" && window.date === "2026-09-19"),
    false,
  );
});

test("assigned PDF slots preserve updated, overlapping, and incomplete source times", () => {
  const avalancheWeekday = practiceWindow("pdf-seaford-2026-09-09-2036-avalanche");
  assert.deepEqual({
    team: avalancheWeekday.assignedTeams[0],
    startTime: avalancheWeekday.startTime,
    endTime: avalancheWeekday.endTime,
    timeLabel: avalancheWeekday.timeLabel,
    assignmentStatus: avalancheWeekday.assignmentStatus,
    requiredDurationHours: avalancheWeekday.requiredDurationHours,
  }, {
    team: "2036 Avalanche",
    startTime: "19:15",
    endTime: "20:15",
    timeLabel: "7:15 PM–8:15 PM",
    assignmentStatus: "confirmed",
    requiredDurationHours: 1,
  });

  const saturdayAvalanche = practiceWindow("pdf-nickerson-2026-09-12-2036-avalanche");
  assert.deepEqual({
    startTime: saturdayAvalanche.startTime,
    endTime: saturdayAvalanche.endTime,
    timeLabel: saturdayAvalanche.timeLabel,
    assignmentStatus: saturdayAvalanche.assignmentStatus,
    requiredDurationHours: saturdayAvalanche.requiredDurationHours,
  }, {
    startTime: "08:15",
    endTime: "09:30",
    timeLabel: "8:15 AM–9:30 AM",
    assignmentStatus: "pending",
    requiredDurationHours: 1.25,
  });

  const seafordNeedsTime = practiceWindow("pdf-seaford-2026-09-12-2035-bombers");
  assert.deepEqual({
    startTime: seafordNeedsTime.startTime,
    endTime: seafordNeedsTime.endTime,
    timeLabel: seafordNeedsTime.timeLabel,
    assignmentStatus: seafordNeedsTime.assignmentStatus,
    requiredDurationHours: seafordNeedsTime.requiredDurationHours,
  }, {
    startTime: "15:00",
    endTime: null,
    timeLabel: "3:00 PM–End time needed",
    assignmentStatus: "needs-time",
    requiredDurationHours: null,
  });

  const weekdayVenom = practiceWindow("pdf-seaford-2026-09-14-2034-venom");
  assert.deepEqual({
    locationKey: weekdayVenom.locationKey,
    startTime: weekdayVenom.startTime,
    endTime: weekdayVenom.endTime,
    timeLabel: weekdayVenom.timeLabel,
    assignmentStatus: weekdayVenom.assignmentStatus,
    requiredDurationHours: weekdayVenom.requiredDurationHours,
  }, {
    locationKey: "seaford",
    startTime: "19:15",
    endTime: "20:45",
    timeLabel: "7:15 PM–8:45 PM",
    assignmentStatus: "confirmed",
    requiredDurationHours: 1.5,
  });

  const weekdayHurricanes = practiceWindow("pdf-seaford-2026-09-17-2035-hurricanes");
  assert.deepEqual({
    locationKey: weekdayHurricanes.locationKey,
    startTime: weekdayHurricanes.startTime,
    endTime: weekdayHurricanes.endTime,
    timeLabel: weekdayHurricanes.timeLabel,
    requiredDurationHours: weekdayHurricanes.requiredDurationHours,
  }, {
    locationKey: "seaford",
    startTime: "19:15",
    endTime: "20:15",
    timeLabel: "7:15 PM–8:15 PM",
    requiredDurationHours: 1,
  });

  const dawgs = practiceWindow("pdf-nickerson-2026-09-12-2036-dawgs");
  const venom = practiceWindow("pdf-nickerson-2026-09-12-2034-venom");
  assert.deepEqual(
    [dawgs.startTime, dawgs.endTime, venom.startTime, venom.endTime],
    ["09:00", "10:30", "09:00", "10:30"],
  );

  const storm = practiceWindow("pdf-point-lookout-2026-09-12-2033-storm");
  const thunder = practiceWindow("pdf-point-lookout-2026-09-12-2034-thunder");
  assert.deepEqual(
    [storm.startTime, storm.endTime, thunder.startTime, thunder.endTime],
    ["08:00", "10:00", "08:00", "10:00"],
  );
});

test("the staff page and claim API expose identical practice-window rules", () => {
  const pageWindows = pagePracticeWindows();
  const coreFields = [
    "id", "venue", "location", "date", "startTime", "endTime", "kind", "approval",
    "startIncrementMinutes", "teamCount", "claimCapacity", "requiredDurationHours", "mode", "claimMode",
  ];
  const assignedFields = coreFields.concat([
    "assignedTeams", "locationKey", "field", "timeLabel", "assignmentStatus",
    "source", "note",
  ]);
  const normalize = (fields) => (window) => (
    Object.fromEntries(fields.map((field) => [field, window[field]]))
  );
  const byId = (a, b) => a.id.localeCompare(b.id);

  assert.deepEqual(
    pageWindows.map(normalize(coreFields)).sort(byId),
    PRACTICE_WINDOWS.map(normalize(coreFields)).sort(byId),
  );
  assert.deepEqual(
    assignedPracticeWindows(pageWindows).map(normalize(assignedFields)).sort(byId),
    assignedPracticeWindows().map(normalize(assignedFields)).sort(byId),
  );
});

test("the staff page keeps a Sunday-first calendar and Google-style practice ticker", () => {
  const html = staffPageHtml();
  const weekdayStart = html.indexOf('<div class="weekday-row"');
  const gridStart = html.indexOf('<div class="calendar-grid"', weekdayStart);
  assert.ok(weekdayStart >= 0 && gridStart > weekdayStart, "weekday header must precede the calendar grid");

  const weekdayLabels = Array.from(
    html.slice(weekdayStart, gridStart).matchAll(/<div class="weekday">([^<]+)<\/div>/g),
    (match) => match[1].trim(),
  );
  assert.deepEqual(weekdayLabels, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  assert.match(html, /\b(?:var|let|const) sundayOffset\s*=\s*first\.getDay\(\)\s*;/);
  assert.match(html, /\b(?:var|let|const) gridStart\s*=\s*addDays\(first,\s*-sundayOffset\)\s*;/);
  assert.doesNotMatch(html, /\bmondayOffset\b/);

  const typeFilterStart = html.indexOf('id="scheduleTypeFilter"');
  const typeFilterEnd = html.indexOf("</select>", typeFilterStart);
  assert.ok(typeFilterStart >= 0 && typeFilterEnd > typeFilterStart, "schedule type filter must exist");
  assert.match(html.slice(typeFilterStart, typeFilterEnd), /<option value="practices">Practices<\/option>/);
  assert.match(html, /id="practiceTicker"/);
  assert.match(html, /id="practiceTickerTrack"/);

  const tickerStart = html.indexOf("function renderPracticeTicker()");
  const tickerEnd = html.indexOf("function renderTeamChrome()", tickerStart);
  const tickerSource = html.slice(tickerStart, tickerEnd);
  assert.match(tickerSource, /practiceBookings\.map\(function \(booking\)/);
  assert.match(tickerSource, /isAssignedPractice\(windowItem\)/);

  const jumpStart = html.indexOf("function jumpToNextOpenPractice()");
  const jumpEnd = html.indexOf("function runSelfTest()", jumpStart);
  const jumpSource = html.slice(jumpStart, jumpEnd);
  assert.match(jumpSource, /\[nextAssigned, nextInventory\]\.filter\(Boolean\)\.sort/);
});

test("shared tournament plans do not create false conflicts", () => {
  const shared = [
    {
      id: "shared-one", team: "2034 Thunder", title: "Apex Fall Opener", location: "Capelli Sports Complex",
      start: "2026-10-03", end: "2026-10-03", status: "confirmed",
    },
    {
      id: "shared-two", team: "2035 Hurricanes", title: " apex   fall opener ", location: "capelli sports complex",
      start: "2026-10-03", end: "2026-10-03", status: "confirmed",
    },
  ];
  assert.deepEqual(pageConflictGroups(shared), []);

  const separatePlan = {
    id: "separate", team: "2036 Avalanche", title: "Another Tournament", location: "Another Venue",
    start: "2026-10-03", end: "2026-10-03", status: "entering",
  };
  const conflicts = pageConflictGroups([...shared, separatePlan]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].plans.length, 2);
  assert.equal(conflicts[0].events.length, 3);

  const sameTitleDifferentVenue = pageConflictGroups([...shared, {
    ...separatePlan,
    title: "Apex Fall Opener",
  }]);
  assert.equal(sameTitleDifferentVenue.length, 1);
});

test("the staff page uses a compact conflicts tab, wider calendar, transparent mark, and team export view", () => {
  const html = staffPageHtml();
  assert.doesNotMatch(html, /id="alertStrip"|class="alert-strip"/);
  assert.doesNotMatch(html, />\s*Conflict Radar\s*</);
  assert.match(html, /class="conflicts-tab" id="reviewConflictsButton"/);
  assert.match(html, /grid-template-columns:\s*minmax\(0, 1fr\) clamp\(230px, 17vw, 285px\)/);
  assert.match(html, /src="\/BTB_Silver_Mark_Transparent\.png"/);
  assert.ok(existsSync(new URL("../public/BTB_Silver_Mark_Transparent.png", import.meta.url)));
  assert.match(html, /data-view="export"/);
  assert.match(html, /id="exportTeam"/);
  assert.match(html, /id="downloadIcalButton"/);
  assert.match(html, /function googleCalendarUrl\(item\)/);
  assert.match(html, /function teamIcal\(team\)/);
});

test("the month grid is taller, scrolls crowded days, and opens a complete daily schedule", () => {
  const html = staffPageHtml();
  const calendarPanelStart = html.indexOf(".calendar-panel {");
  const calendarPanelEnd = html.indexOf(".calendar-toolbar", calendarPanelStart);
  const calendarPanelCss = html.slice(calendarPanelStart, calendarPanelEnd);
  assert.match(calendarPanelCss, /min-height:\s*clamp\(920px, 105vh, 1120px\)/);
  assert.match(html, /#wallView\s*{[^}]*overflow-y:\s*auto/s);

  const dayEventsStart = html.indexOf(".day-events {");
  const dayEventsEnd = html.indexOf(".day-events::-webkit-scrollbar", dayEventsStart);
  const dayEventsCss = html.slice(dayEventsStart, dayEventsEnd);
  assert.match(dayEventsCss, /min-height:\s*0/);
  assert.match(dayEventsCss, /overflow-y:\s*auto/);
  assert.match(dayEventsCss, /overscroll-behavior:\s*contain/);

  const renderStart = html.indexOf("function renderMonth()");
  const renderEnd = html.indexOf("function openDayDialog(dayIso)", renderStart);
  const renderSource = html.slice(renderStart, renderEnd);
  assert.match(renderSource, /var pills = allPills\.join\(""\)/);
  assert.doesNotMatch(renderSource, /allPills\.slice\(0,\s*4\)/);
  assert.match(renderSource, /class='day-number-button'/);
  assert.match(renderSource, /data-day-date='/);
  assert.match(renderSource, /openDayDialog\(button\.getAttribute\("data-day-date"\)\)/);

  assert.match(html, /id="dayDialog"/);
  assert.match(html, /id="dayDialogTitle"/);
  assert.match(html, /id="dayDialogBody"/);
  assert.match(html, /function scheduleItemsForDay\(dayIso, showTournaments, showPractices, showTrainings\)/);
  assert.match(html, /function openDayDialog\(dayIso\)/);
  assert.match(html, /body\.querySelectorAll\("\[data-day-detail-item\]"\)/);
});

test("independent claimed practices stay separate and show team, time, and location on the master calendar", () => {
  const html = staffPageHtml();
  const scheduleStart = html.indexOf("function scheduleItemsForDay(dayIso, showTournaments, showPractices, showTrainings)");
  const scheduleEnd = html.indexOf("function renderMonth()", scheduleStart);
  assert.ok(scheduleStart >= 0 && scheduleEnd > scheduleStart, "daily schedule logic must remain extractable");

  const scheduleContext = {
    events: [],
    visibleTeams: new Set(["2037 Wolves", "2037 Supernova"]),
    STATUS_META: {},
    practiceBookings: [
      { id: "claim-wolves", windowId: "split-field", team: "2037 Wolves", startTime: "09:00" },
      { id: "claim-supernova", windowId: "split-field", team: "2037 Supernova", startTime: "09:00" },
    ],
    findPracticeWindow: (id) => ({ id, date: "2026-09-05" }),
    isAssignedPractice: () => false,
    bookingMatchesVisibleTeams: () => true,
    PRACTICE_WINDOWS: [],
    assignedPracticeTeam: () => "",
    allTeamsAreVisible: () => false,
    isOpenInventoryWindow: () => false,
    practiceAvailability: () => ({ state: "open" }),
  };
  runInNewContext(
    `${html.slice(scheduleStart, scheduleEnd)}\n` +
      `this.result = scheduleItemsForDay("2026-09-05", false, true, false).bookings.map(function (item) { return item.booking.id; });`,
    scheduleContext,
  );
  assert.deepEqual(JSON.parse(JSON.stringify(scheduleContext.result)), ["claim-supernova", "claim-wolves"]);

  const renderStart = html.indexOf("function renderMonth()");
  const dialogStart = html.indexOf("function openDayDialog(dayIso)", renderStart);
  const renderSource = html.slice(renderStart, dialogStart);
  assert.match(renderSource, /var claimedPracticePills = dayBookings\.map\(function \(item\)/);
  assert.match(renderSource, /data-booking-id=/);
  assert.match(renderSource, /practiceTeamMarkup\(teams, windowItem, "short"\)[\s\S]*escapeHtml\(timeLabel \+ " • " \+ locationLabel\)/);
  assert.match(renderSource, /monthBookings = showPractices \? practiceBookings\.map\(function \(booking\)/);
  assert.match(renderSource, /kind: "claimed-practice"/);
  assert.match(renderSource, /practiceTeamMarkup\(claimedTeams, claimedWindow, "label"\)[\s\S]*escapeHtml\(claimedTime \+ " • " \+ practiceWindowLocation\(claimedWindow\)/);

  const dialogEnd = html.indexOf("function renderSidebar()", dialogStart);
  const dialogSource = html.slice(dialogStart, dialogEnd);
  assert.match(dialogSource, /var claimedPracticeCards = schedule\.bookings\.map\(function \(item\)/);
  assert.match(dialogSource, /practiceTeamMarkup\(teams, windowItem, "label"\)[\s\S]*escapeHtml\(timeLabel\)[\s\S]*practiceWindowLocation\(windowItem\)/);
});

test("the calendar team filter is an accessible multi-select that defaults to all teams on each page load", () => {
  const html = staffPageHtml();
  assert.match(html, /id="teamFilterSummary">All Teams<\/span>/);
  assert.match(html, /id="teamFilterMenu" popover aria-label="Choose teams shown on the calendar"/);
  assert.match(html, /id="selectAllTeamsButton"/);
  assert.match(html, /id="clearTeamsButton"/);
  assert.match(html, /var visibleTeams = new Set\(Object\.keys\(TEAM_META\)\)/);

  const chromeStart = html.indexOf("function renderTeamChrome()");
  const chromeEnd = html.indexOf("function allTeamsAreVisible()", chromeStart);
  const chromeSource = html.slice(chromeStart, chromeEnd);
  assert.match(chromeSource, /visibleTeams = new Set\(teamNames\)/);
  assert.match(chromeSource, /type='checkbox'[\s\S]*data-team-filter=[\s\S]*checked/);
  assert.match(chromeSource, /if \(visibleTeams\.size === teamNames\.length\) label = "All Teams"/);
  assert.match(chromeSource, /if \(input\.checked\) visibleTeams\.add\(team\)[\s\S]*else visibleTeams\.delete\(team\)/);
  assert.match(chromeSource, /setAllTeamFilters\(true\)/);
  assert.match(chromeSource, /setAllTeamFilters\(false\)/);
  assert.doesNotMatch(chromeSource, /localStorage|sessionStorage/);

  const scheduleStart = html.indexOf("function scheduleItemsForDay(dayIso, showTournaments, showPractices, showTrainings)");
  const scheduleEnd = html.indexOf("function renderMonth()", scheduleStart);
  const scheduleSource = html.slice(scheduleStart, scheduleEnd);
  assert.match(scheduleSource, /visibleTeams\.has\(event\.team\)/);
  assert.match(scheduleSource, /bookingMatchesVisibleTeams\(booking\)/);
  assert.match(scheduleSource, /visibleTeams\.has\(assignedPracticeTeam\(windowItem\)\)/);

  const mobileCssStart = html.indexOf(".team-filter-trigger {", html.indexOf("@media"));
  const mobileCssEnd = html.indexOf(".calendar-panel {", mobileCssStart);
  const mobileFilterCss = html.slice(mobileCssStart, mobileCssEnd);
  assert.match(mobileFilterCss, /min-height:\s*44px/);
  assert.match(mobileFilterCss, /width:\s*calc\(100vw - 1rem\)/);
});

test("boys share the exact green and girls share the exact light-purple program color", () => {
  const html = staffPageHtml();
  assert.match(html, /var BOYS_TEAM_COLOR = "#55D88A";/);
  assert.match(html, /var GIRLS_TEAM_COLOR = "#C9A7FF";/);

  const teamMetaStart = html.indexOf("var TEAM_META = {");
  const teamMetaEnd = html.indexOf("var STATUS_META =", teamMetaStart);
  const teamMetaSource = html.slice(teamMetaStart, teamMetaEnd);
  assert.equal((teamMetaSource.match(/color:\s*BOYS_TEAM_COLOR/g) || []).length, 9);
  assert.equal((teamMetaSource.match(/color:\s*GIRLS_TEAM_COLOR/g) || []).length, 7);
  assert.doesNotMatch(teamMetaSource, /color:\s*["']#/);

  const chromeStart = html.indexOf("function renderTeamChrome()");
  const chromeEnd = html.indexOf("function allTeamsAreVisible()", chromeStart);
  const chromeSource = html.slice(chromeStart, chromeEnd);
  assert.match(chromeSource, /<span class='legend-label'>Program Colors<\/span>/);
  assert.match(chromeSource, /BOYS_TEAM_COLOR[\s\S]*Boys Teams/);
  assert.match(chromeSource, /GIRLS_TEAM_COLOR[\s\S]*Girls Teams/);
});

test("practice team names keep program colors and show the field color dot on every schedule surface", () => {
  const html = staffPageHtml();
  assert.match(html, /seaford:\s*\{ label: "Seaford", color: "#D22630" \}/);
  assert.match(html, /nickerson:\s*\{ label: "Nickerson", color: "#00B894" \}/);
  assert.match(html, /"point-lookout":\s*\{ label: "Point Lookout", color: "#1479FF" \}/);
  assert.match(html, /momentum:\s*\{ label: "Momentum Sports LI", color: "#F3BA3F" \}/);
  assert.match(html, /stimson:\s*\{ label: "Stimson • Pending", color: "#87909C" \}/);

  const teamCssStart = html.indexOf(".practice-team-name {");
  const teamCssEnd = html.indexOf(".sidebar {", teamCssStart);
  const teamCss = html.slice(teamCssStart, teamCssEnd);
  assert.match(teamCss, /\.practice-team-name\s*\{[\s\S]*color:\s*var\(--team-color\)/);
  assert.match(teamCss, /\.practice-location-dot\s*\{[\s\S]*background:\s*var\(--location-color\)/);
  assert.doesNotMatch(teamCss, /\.practice-location-dot\s*\{[\s\S]*background:\s*var\(--team-color\)/);

  const helperStart = html.indexOf("function practiceLocationDot(windowItem)");
  const helperEnd = html.indexOf("function initialViewMonth()", helperStart);
  const helperSource = html.slice(helperStart, helperEnd);
  assert.match(helperSource, /class='practice-location-dot' aria-hidden='true'/);
  assert.match(helperSource, /PRACTICE_LOCATION_META\[windowItem\.locationKey\]/);
  assert.match(helperSource, /class='practice-team-name'[\s\S]*--team-color:/);
  assert.match(helperSource, /practiceLocationDot\(windowItem\)[\s\S]*escapeHtml\(label\)/);

  const monthStart = html.indexOf("function renderMonth()");
  const dayStart = html.indexOf("function openDayDialog(dayIso)", monthStart);
  const sidebarStart = html.indexOf("function renderSidebar()", dayStart);
  const boardStart = html.indexOf("function renderPracticeBoard()", sidebarStart);
  const directoryStart = html.indexOf("function coachDirectoryName", boardStart);
  const manageStart = html.indexOf("function renderManageTable()", directoryStart);
  const claimStart = html.indexOf("function openClaimDialog(windowId)", manageStart);
  assert.match(html.slice(monthStart, dayStart), /practiceTeamMarkup\(teams, windowItem, "short"\)/);
  assert.match(html.slice(monthStart, dayStart), /practiceTeamMarkup\(claimedTeams, claimedWindow, "label"\)/);
  assert.match(html.slice(dayStart, sidebarStart), /practiceTeamMarkup\(teams, windowItem, "label"\)/);
  assert.match(html.slice(sidebarStart, boardStart), /practiceTeamMarkup\(\[assignedTeam\], windowItem, "label"\)/);
  assert.match(html.slice(boardStart, directoryStart), /practiceTeamMarkup\(\[assignedTeam\], windowItem, "label"\)/);
  assert.match(html.slice(manageStart, claimStart), /practiceTeamMarkup\(\[assignedTeam\], assignedWindow, "short"\)/);
});

test("assign coach uses the protected directory as a mobile multi-select attendance dropdown", () => {
  const html = staffPageHtml();
  assert.match(html, /<details class="coach-attendance-picker" id="claimCoachPicker">/);
  assert.match(html, /id="claimCoachOptions" role="group"/);
  assert.doesNotMatch(html, /id="claimCoach" type="text"/);

  const pickerCssStart = html.indexOf(".coach-attendance-picker {");
  const pickerCssEnd = html.indexOf(".manage-filter {", pickerCssStart);
  const pickerCss = html.slice(pickerCssStart, pickerCssEnd);
  assert.match(pickerCss, /min-height:\s*44px/);
  assert.match(pickerCss, /max-height:\s*min\(17rem, 42vh\)/);
  assert.match(pickerCss, /overflow-y:\s*auto/);

  const pickerStart = html.indexOf("function selectedClaimCoaches()");
  const dialogStart = html.indexOf("function openClaimDialog(windowId)", pickerStart);
  const pickerSource = html.slice(pickerStart, dialogStart);
  assert.match(pickerSource, /coachDirectoryEntries\.map\(function \(entry\)/);
  assert.match(pickerSource, /type='checkbox' data-claim-coach/);
  assert.match(pickerSource, /loadCoachDirectory\(false\)/);
  assert.match(pickerSource, /coaches\.length === 1 \? coaches\[0\] : coaches\.length \+ " coaches selected"/);

  const submitStart = html.indexOf("async function submitPracticeClaim", dialogStart);
  const submitEnd = html.indexOf("async function releasePractice", submitStart);
  const submitSource = html.slice(submitStart, submitEnd);
  assert.match(submitSource, /var coaches = selectedClaimCoaches\(\)/);
  assert.match(submitSource, /coach:\s*coaches\[0\][\s\S]*coaches:\s*coaches/);
  assert.match(html, /function coachAttendanceLabel\(booking\)/);
});

test("the shared practice editor exposes daily availability and automatic team coaches", () => {
  const html = staffPageHtml();
  assert.match(html, /id="addPracticeButton"[^>]*>\+ Add Practice</);
  assert.match(html, /id="practiceEditorDialog"/);
  assert.match(html, /id="practiceEditorTeam"/);
  assert.match(html, /id="practiceEditorDate"/);
  assert.match(html, /id="practiceEditorLocation"/);
  assert.match(html, /id="practiceEditorStart"/);
  assert.match(html, /id="practiceEditorEnd"/);
  assert.match(html, /Coaches added automatically/);

  const availabilityStart = html.indexOf("function fieldAvailabilityWindowsForDay");
  const editorStart = html.indexOf("function practiceEditorWindow", availabilityStart);
  assert.ok(availabilityStart >= 0 && editorStart > availabilityStart);
  const availabilitySource = html.slice(availabilityStart, editorStart);
  assert.match(availabilitySource, /capacity:\s*2|rule\.capacity/);
  assert.match(availabilitySource, /Multiple fields/);
  assert.match(availabilitySource, /dayAvailabilityMarkup/);

  const editorEnd = html.indexOf("function openClaimDialog", editorStart);
  const editorSource = html.slice(editorStart, editorEnd);
  assert.match(editorSource, /coachesForTeam\(team\)/);
  assert.match(editorSource, /saveScheduledPractice/);
  assert.match(editorSource, /deleteScheduledPractice/);

  const boardStart = html.indexOf("function renderPracticeBoard");
  const boardEnd = html.indexOf("function coachDirectoryName", boardStart);
  const boardSource = html.slice(boardStart, boardEnd);
  assert.match(boardSource, /dayAvailabilityMarkup\(group\.date, false\)/);
  assert.match(boardSource, /class='btn subtle edit-practice'/);
  assert.match(boardSource, /class='btn danger delete-practice'/);
  assert.doesNotMatch(boardSource, /Assign Coach/);
});

test("recent shared saves appear beside open fields with useful schedule details", () => {
  const html = staffPageHtml();
  const sidebarStart = html.indexOf('<aside class="sidebar">');
  const sidebarEnd = html.indexOf("</aside>", sidebarStart);
  const sidebarSource = html.slice(sidebarStart, sidebarEnd);
  const coachNeededIndex = sidebarSource.indexOf("Upcoming Practices + Open Fields");
  const recentIndex = sidebarSource.indexOf("Recent Changes");
  const dataNoteIndex = sidebarSource.indexOf('class="panel data-note"');
  assert.ok(coachNeededIndex >= 0 && recentIndex > coachNeededIndex && dataNoteIndex > recentIndex);
  assert.match(sidebarSource, /id="recentChangeCount"/);
  assert.match(sidebarSource, /id="recentChangeList" aria-live="polite"/);

  const renderStart = html.indexOf("function renderSidebar()");
  const renderEnd = html.indexOf("function renderPracticeBoard()", renderStart);
  const renderSource = html.slice(renderStart, renderEnd);
  assert.match(renderSource, /recentChanges\.slice\(0, 5\)\.map\(function \(change\)/);
  assert.match(renderSource, /escapeHtml\(change\.summary\)/);
  assert.match(renderSource, /change\.date[\s\S]*timeLabel[\s\S]*change\.location[\s\S]*change\.occurredAt/);
  assert.match(renderSource, /class='recent-change-item'/);

  const recentCssStart = html.indexOf(".recent-changes-panel {");
  const recentCssEnd = html.indexOf(".panel-header {", recentCssStart);
  const recentCss = html.slice(recentCssStart, recentCssEnd);
  assert.match(recentCss, /max-height:\s*17rem/);
  assert.match(recentCss, /overflow-y:\s*auto/);
  assert.match(html, /@media[\s\S]*\.recent-changes-panel\s*{[\s\S]*max-height:\s*none/);
});

test("the calendar defaults wide with a collapsible openings rail and a black high-contrast canvas", () => {
  const html = staffPageHtml();
  assert.match(html, /class="wall-layout sidebar-collapsed"/);
  assert.match(html, /id="sidebarToggleButton"[^>]*aria-expanded="false"[^>]*aria-controls="scheduleSidebarPanels"/);
  assert.match(html, /class="sidebar-toggle-text">Openings &amp; Changes</);
  assert.match(html, /id="scheduleSidebarPanels" hidden/);

  const readabilityCssStart = html.indexOf("/* Readable calendar wall:");
  const readabilityCssEnd = html.indexOf("</style>", readabilityCssStart);
  const readabilityCss = html.slice(readabilityCssStart, readabilityCssEnd);
  assert.match(readabilityCss, /\.wall-layout\.sidebar-collapsed\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 48px/);
  assert.match(readabilityCss, /\.sidebar\.is-collapsed\s*\{[\s\S]*max-width:\s*48px/);
  assert.match(readabilityCss, /#wallView \.calendar-panel\s*\{[\s\S]*background:\s*#0b0c0e[;\s][\s\S]*color:\s*#f5f5f6/);
  assert.match(readabilityCss, /#wallView \.day\s*\{[\s\S]*background:\s*#0b0c0e[;\s][\s\S]*color:\s*#f5f5f6/);
  assert.match(readabilityCss, /#wallView \.day-availability-label\s*\{[\s\S]*color:\s*#d8dbe0[;\s][\s\S]*font-size:\s*clamp\(9px/);
  assert.match(readabilityCss, /@media \(max-width: 900px\)[\s\S]*\.sidebar\.is-collapsed \.sidebar-toggle-text\s*\{[\s\S]*writing-mode:\s*horizontal-tb/);

  const behaviorStart = html.indexOf("var SIDEBAR_COLLAPSED_STORAGE_KEY");
  const behaviorEnd = html.indexOf("function bindEvents()", behaviorStart);
  const behaviorSource = html.slice(behaviorStart, behaviorEnd);
  assert.match(behaviorSource, /btb-calendar-sidebar-collapsed/);
  assert.match(behaviorSource, /layout\.classList\.toggle\("sidebar-collapsed", collapsed\)/);
  assert.match(behaviorSource, /panels\.hidden = collapsed/);
  assert.match(behaviorSource, /button\.setAttribute\("aria-expanded", String\(!collapsed\)\)/);
  assert.match(behaviorSource, /window\.matchMedia\("\(min-width: 901px\)"\)\.matches/);
  assert.match(html, /initializeScheduleSidebar\(\);[\s\S]*bindEvents\(\);/);
});

test("coach phone and email actions use larger wrapping text on responsive cards", () => {
  const html = staffPageHtml();
  const contactStart = html.indexOf(".coach-contact-actions {");
  const contactEnd = html.indexOf(".coach-contact-link:hover", contactStart);
  const contactCss = html.slice(contactStart, contactEnd);
  assert.match(contactCss, /grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(contactCss, /min-width:\s*0/);
  assert.match(contactCss, /min-height:\s*44px/);
  assert.match(contactCss, /font-size:\s*clamp\(14px, 0\.82rem, 18px\)/);
  assert.match(contactCss, /line-height:\s*1\.35/);
  assert.match(contactCss, /text-align:\s*left/);
  assert.match(contactCss, /white-space:\s*normal/);
  assert.match(contactCss, /overflow-wrap:\s*anywhere/);
  assert.match(contactCss, /word-break:\s*break-word/);

  const cardStart = html.indexOf(".coach-card {");
  const cardEnd = html.indexOf(".coach-card-head {", cardStart);
  assert.match(html.slice(cardStart, cardEnd), /min-width:\s*0/);
  assert.match(html, /@media[\s\S]*\.coach-directory-grid\s*{[\s\S]*grid-template-columns:\s*1fr/);
});

test("the staff calendar installs as a narrowly scoped phone app without caching protected data", () => {
  const html = staffPageHtml();
  const manifestUrl = new URL("../public/btb-staff-calendar.webmanifest", import.meta.url);
  const workerUrl = new URL("../public/btb-staff-calendar-sw.js", import.meta.url);
  const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
  const worker = readFileSync(workerUrl, "utf8");
  const netlifyConfig = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");

  assert.equal(manifest.id, "/dan-calendar");
  assert.equal(manifest.start_url, "/dan-calendar");
  assert.equal(manifest.scope, "/dan-calendar");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.background_color, "#050505");
  assert.equal(manifest.theme_color, "#050505");
  assert.ok(manifest.short_name.length <= 12);

  const regularIcons = manifest.icons.filter((icon) => icon.purpose === "any");
  const icon192 = regularIcons.find((icon) => icon.sizes === "192x192");
  const icon512 = regularIcons.find((icon) => icon.sizes === "512x512");
  const maskable = manifest.icons.find((icon) => icon.sizes === "512x512" && icon.purpose === "maskable");
  assert.ok(icon192 && icon512 && maskable);
  for (const [icon, size] of [[icon192, 192], [icon512, 512], [maskable, 512]]) {
    const iconUrl = new URL(`../public${icon.src}`, import.meta.url);
    assert.ok(existsSync(iconUrl));
    assert.deepEqual(pngDimensions(iconUrl), { width: size, height: size });
  }
  const appleIconUrl = new URL("../public/assets/dan-calendar/btb-staff-apple-touch-icon-180-v1.png", import.meta.url);
  assert.deepEqual(pngDimensions(appleIconUrl), { width: 180, height: 180 });

  assert.match(html, /<link rel="manifest" href="\/btb-staff-calendar\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180"/);
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="BTB Schedule">/);
  assert.match(html, /id="installAppButton"/);
  assert.match(html, /id="installDialog"/);
  assert.match(html, /beforeinstallprompt/);
  assert.match(html, /appinstalled/);
  assert.match(html, /navigator\.standalone/);
  assert.match(html, /display-mode: standalone/);
  assert.match(html, /serviceWorker\.register\("\/btb-staff-calendar-sw\.js"/);
  assert.match(html, /scope:\s*"\/dan-calendar"/);
  assert.match(html, /installReady:/);
  assert.match(html, /result\.installReady/);

  assert.match(worker, /addEventListener\("install"/);
  assert.match(worker, /addEventListener\("activate"/);
  assert.match(worker, /addEventListener\("fetch"/);
  assert.match(worker, /request\.method !== "GET"/);
  assert.match(worker, /\/\.netlify\/functions\//);
  assert.match(worker, /event\.respondWith\(fetch\(request\)\)/);
  assert.doesNotMatch(worker, /\bcaches\.(?:open|match)\b/);

  assert.match(netlifyConfig, /for = "\/btb-staff-calendar\.webmanifest"/);
  assert.match(netlifyConfig, /for = "\/btb-staff-calendar-sw\.js"/);
  assert.match(netlifyConfig, /Service-Worker-Allowed = "\/dan-calendar"/);
});

test("known-team validation covers the active 16-team 2026-27 operating list", () => {
  assert.deepEqual(KNOWN_TEAMS, [
    "2028 Black", "2030 Rage", "2031 Carnage", "2032 Cannons", "2033 Renegades",
    "2034 Venom", "2035 Bombers", "2036 Dawgs", "2037 Wolves",
    "2031 Cyclones", "2032 Riptide", "2033 Storm", "2034 Thunder", "2035 Hurricanes",
    "2036 Avalanche", "2037 Supernova",
  ]);
  assert.equal(new Set(KNOWN_TEAMS).size, 16);
});

test("legacy 2037 aliases canonicalize while retired stored bookings are pruned", () => {
  const legacyAliases = {
    id: "legacy-2037-aliases",
    windowId: "momentum-2026-11-07",
    team: "2037 Boys",
    teams: ["2037 Boys", "2037 Girls"],
    secondTeam: "2037 Girls",
    coach: "Coach Legacy",
    startTime: "08:00",
    endTime: "10:00",
    durationHours: 2,
    createdAt: "2026-08-28T12:00:00.000Z",
  };
  const retiredTeams = [
    "2029 Chrome", "2032 Grizzlies", "Boys Futures", "2030 Reign",
    "2030 Tidal Wave", "2034 Tsunami", "Girls Futures", "2036 Fury",
    "2035 Tornadoes", "2035 Tornado",
  ];
  const retiredBookings = retiredTeams.map((team, index) => ({
    id: `retired-team-${index}`,
    windowId: "nickerson-2026-09-26",
    team,
    teams: [team],
    secondTeam: null,
    coach: `Coach Retired ${index}`,
    startTime: "09:00",
    endTime: "10:00",
    durationHours: 1,
    createdAt: "2026-08-28T12:00:00.000Z",
  }));

  const snapshot = normalizeSnapshot({
    events: retiredTeams.map((team, index) => ({ id: `retired-event-${index}`, team })),
    practiceBookings: [legacyAliases, ...retiredBookings],
    recentChanges: retiredTeams.map((team, index) => ({
      id: `retired-change-${index}`,
      type: "schedule_updated",
      occurredAt: `2026-08-28T12:${String(index).padStart(2, "0")}:00.000Z`,
      summary: `${team} schedule updated`,
      team,
      teams: [team],
    })),
  });
  assert.deepEqual(snapshot.events, []);
  assert.equal(snapshot.practiceBookings.length, 1);
  assert.deepEqual(snapshot.recentChanges, []);
  const normalized = validatePracticeBookings(snapshot.practiceBookings);
  assert.equal(normalized.length, 1);
  assert.deepEqual({
    team: normalized[0].team,
    teams: normalized[0].teams,
    secondTeam: normalized[0].secondTeam,
  }, {
    team: "2037 Wolves",
    teams: ["2037 Wolves", "2037 Supernova"],
    secondTeam: "2037 Supernova",
  });
});

test("legacy snapshots normalize to an empty practice booking list", () => {
  assert.deepEqual(normalizeSnapshot({ events: [{ id: "event-1" }], savedAt: "legacy" }), {
    version: 0,
    events: [{ id: "event-1" }],
    practiceBookings: [],
    practiceOverrides: [],
    recentChanges: [],
    savedAt: "legacy",
  });
});

test("legacy tournament data receives the requested newsletter corrections", async () => {
  const legacyEvents = [
    { id: "b36-fury-fall-classic", team: "2036 Fury", title: "Fall Classic", status: "optional" },
    { id: "g35-tornadoes", team: "2035 Tornadoes", title: "War at the Shore", status: "confirmed" },
    { id: "g35-tornado", team: "2035 Tornado", title: "Long Ireland", status: "confirmed" },
    { id: "custom-retired-title", team: "2033 Storm", title: "2036 Fury Fall Classic", status: "confirmed" },
    { id: "custom-retired-note", team: "2034 Thunder", title: "Fall Classic", note: "For 2035 Tornadoes", status: "confirmed" },
    { id: "b28-igloo", team: "2028 Black", title: "Blue Chip", status: "confirmed" },
    { id: "b31-igloo", team: "2031 Carnage", title: "Igloo Elite Invitational", status: "entering", note: "Formerly Igloo Elite Invitational" },
    { id: "custom-igloo", team: "2032 Cannons", title: "Igloo Elite Holiday Tournament", status: "entering", source: "Igloo Elite schedule" },
    { id: "g31-queen-fall", team: "2031 Cyclones", title: "Queen of the Island", status: "optional" },
    { id: "g31-fall-classic", team: "2031 Cyclones", title: "Fall Classic", status: "confirmed" },
    { id: "b36-dawgs-fall-classic", team: "2036 Dawgs", title: "Fall Classic", status: "optional", note: "Optional tournament.", source: "Dan — optional Fall Classic for all boys teams" },
    { id: "b37-fall-classic", team: "2037 Wolves", title: "Fall Classic", status: "optional", note: "Optional tournament.", source: "Dan — optional Fall Classic for all boys teams" },
    { id: "untouched", team: "2033 Storm", title: "Apex Round Up", status: "confirmed" },
  ];
  const original = structuredClone(legacyEvents);

  const normalized = normalizeTournamentEvents(legacyEvents);
  assert.deepEqual(legacyEvents, original);
  assert.ok(!normalized.some((event) => ["2036 Fury", "2035 Tornadoes", "2035 Tornado"].includes(event.team)));
  assert.ok(!normalized.some((event) => ["custom-retired-title", "custom-retired-note"].includes(event.id)));
  for (const event of normalized.filter((item) => ["b28-igloo", "b31-igloo", "custom-igloo"].includes(item.id))) {
    assert.equal(event.title, "BLUE CHIP INVITATIONAL");
  }
  assert.doesNotMatch(JSON.stringify(normalized), /igloo elite/i);
  assert.equal(normalized.find((event) => event.id === "g31-queen-fall").status, "confirmed");
  assert.equal(normalized.find((event) => event.id === "g31-fall-classic").status, "optional");
  assert.equal(normalized.find((event) => event.id === "b36-dawgs-fall-classic").status, "confirmed");
  assert.equal(normalized.find((event) => event.id === "b37-fall-classic").status, "confirmed");
  assert.equal(normalized.find((event) => event.id === "b36-dawgs-fall-classic").note, "Scheduled tournament; one additional tournament selection is pending.");
  assert.equal(normalized.find((event) => event.id === "b37-fall-classic").note, "Only fall tournament.");
  assert.doesNotMatch(JSON.stringify(normalized.filter((event) => ["b36-dawgs-fall-classic", "b37-fall-classic"].includes(event.id))), /optional/i);
  assert.equal(normalized.find((event) => event.id === "untouched").title, "Apex Round Up");

  const store = memoryStore({
    version: 2,
    events: legacyEvents,
    practiceBookings: [],
    recentChanges: [],
    savedAt: FIXED_NOW.toISOString(),
  });
  const loaded = await readCalendarSnapshot(store);
  assert.deepEqual(loaded.snapshot.events, normalized);

  const saved = await saveCalendarSnapshot(store, {
    events: legacyEvents,
    practiceBookings: [],
  }, store.etag, { now: FIXED_NOW });
  assert.deepEqual(saved.snapshot.events, normalized);
  assert.deepEqual(store.data.events, normalized);
});

test("recent changes normalize aliases and fields without mutating the source", () => {
  const rawChanges = [{
    id: " change-one ",
    type: "practice_claimed",
    occurredAt: "2026-08-30T13:15:00-04:00",
    summary: "  Split-field   practice\nclaimed  ",
    team: "2037 Boys",
    teams: ["2037 Boys", "2037 Girls", "Unknown Team"],
    secondTeam: "2037 Girls",
    coach: "  Coach   Example  ",
    date: "2026-09-01",
    startTime: "19:15",
    endTime: "20:15",
    location: "  Example   Field  ",
    ignored: "not part of the stored schema",
  }, {
    id: "change-one",
    type: "practice_released",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: "duplicate id",
  }, {
    id: "change-two",
    type: "schedule_updated",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: " Igloo Elite   schedule updated ",
    team: "Unknown Team",
    coach: "",
    date: "08/30/2026",
    startTime: "8:00",
    endTime: "25:00",
    location: "   ",
  }, {
    id: "change-bad-type",
    type: "unsupported_change",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: "unsupported",
  }, {
    id: "change-bad-time",
    type: "schedule_updated",
    occurredAt: "not-a-date",
    summary: "invalid timestamp",
  }, null];
  const original = structuredClone(rawChanges);

  const normalized = normalizeRecentChanges(rawChanges);

  assert.deepEqual(rawChanges, original);
  assert.deepEqual(normalized, [{
    id: "change-one",
    type: "practice_claimed",
    occurredAt: "2026-08-30T17:15:00.000Z",
    summary: "Split-field practice claimed",
    team: "2037 Wolves",
    teams: ["2037 Wolves", "2037 Supernova"],
    coach: "Coach Example",
    coaches: ["Coach Example"],
    date: "2026-09-01",
    startTime: "19:15",
    endTime: "20:15",
    location: "Example Field",
  }, {
    id: "change-two",
    type: "schedule_updated",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: "BLUE CHIP INVITATIONAL schedule updated",
    team: null,
    teams: [],
    coach: null,
    coaches: [],
    date: null,
    startTime: null,
    endTime: null,
    location: null,
  }]);
  assert.deepEqual(normalizeRecentChanges(normalized), normalized);
  assert.deepEqual(normalizeSnapshot({
    events: [],
    practiceBookings: [],
    recentChanges: rawChanges,
  }).recentChanges, normalized);
});

test("recent changes retain newest-first order and enforce the history limit", () => {
  const changes = Array.from({ length: MAX_RECENT_CHANGES + 5 }, (_, index) => ({
    id: `change-${index}`,
    type: "schedule_updated",
    occurredAt: new Date(Date.UTC(2026, 7, 30, 18, index)).toISOString(),
    summary: `Schedule update ${index}`,
  }));

  const normalized = normalizeRecentChanges(changes);

  assert.equal(normalized.length, MAX_RECENT_CHANGES);
  assert.equal(normalized[0].id, "change-0");
  assert.equal(normalized.at(-1).id, `change-${MAX_RECENT_CHANGES - 1}`);
});

test("legacy Thursday Riptide coach assignments follow the team to Wednesday", () => {
  const snapshot = normalizeSnapshot({
    practiceBookings: [{
      id: "legacy-riptide-thursday",
      windowId: "pdf-seaford-2026-09-10-2032-riptide",
      venue: "Seaford HS Turf",
      location: "Seaford High School — HS Turf/Track (Football Field)",
      date: "2026-09-10",
      team: "2032 Riptide",
      teams: ["2032 Riptide"],
      secondTeam: null,
      coach: "Coach Riptide",
      startTime: "19:15",
      endTime: "21:15",
      durationHours: 2,
      createdAt: "2026-08-29T12:00:00.000Z",
    }],
  });
  assert.equal(snapshot.practiceBookings[0].windowId, "pdf-seaford-2026-09-09-2032-riptide");
  assert.equal(snapshot.practiceBookings[0].date, "2026-09-09");
  assert.deepEqual(validatePracticeBookings(snapshot.practiceBookings)[0], {
    ...snapshot.practiceBookings[0],
    date: "2026-09-09",
    coaches: ["Coach Riptide"],
  });
});

test("legacy Venom and Hurricanes coach assignments follow their teams to the new fields", () => {
  const snapshot = normalizeSnapshot({
    practiceBookings: [{
      id: "legacy-venom-stimson",
      windowId: "pdf-stimson-2026-09-14-2034-venom",
      venue: "Stimson Middle School",
      location: "Stimson Middle School — Field",
      date: "2026-09-14",
      team: "2034 Venom",
      teams: ["2034 Venom"],
      secondTeam: null,
      coach: "Coach Venom",
      startTime: "17:45",
      endTime: null,
      durationHours: null,
      createdAt: "2026-08-29T12:00:00.000Z",
    }, {
      id: "legacy-hurricanes-nickerson",
      windowId: "pdf-nickerson-2026-09-14-2035-hurricanes",
      venue: "Nickerson Field 2",
      location: "Nickerson Beach — Field 2, Lido Beach, NY",
      date: "2026-09-14",
      team: "2035 Hurricanes",
      teams: ["2035 Hurricanes"],
      secondTeam: null,
      coach: "Coach Hurricanes",
      startTime: "17:00",
      endTime: "18:30",
      durationHours: 1.5,
      createdAt: "2026-08-29T12:00:00.000Z",
    }],
  });

  assert.deepEqual(snapshot.practiceBookings.map((booking) => ({
    id: booking.id,
    windowId: booking.windowId,
    venue: booking.venue,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    durationHours: booking.durationHours,
  })), [{
    id: "legacy-venom-stimson",
    windowId: "pdf-seaford-2026-09-14-2034-venom",
    venue: "Seaford HS Turf",
    date: "2026-09-14",
    startTime: "19:15",
    endTime: "20:45",
    durationHours: 1.5,
  }, {
    id: "legacy-hurricanes-nickerson",
    windowId: "pdf-seaford-2026-09-17-2035-hurricanes",
    venue: "Seaford HS Turf",
    date: "2026-09-17",
    startTime: "19:15",
    endTime: "20:15",
    durationHours: 1,
  }]);
  assert.equal(validatePracticeBookings(snapshot.practiceBookings).length, 2);
});

test("legacy 2028 coach assignments follow the team from Stimson to Seaford", () => {
  const sundays = [
    "2026-09-13", "2026-09-20", "2026-09-27", "2026-10-04",
    "2026-10-11", "2026-10-18", "2026-10-25",
  ];
  const snapshot = normalizeSnapshot({
    practiceBookings: sundays.map((date) => ({
      id: `legacy-2028-${date}`,
      windowId: `pdf-stimson-${date}-2028-black`,
      venue: "Stimson Middle School",
      location: "Stimson Middle School — Field",
      date,
      team: "2028 Black",
      teams: ["2028 Black"],
      secondTeam: null,
      coach: "Coach 2028",
      startTime: "10:30",
      endTime: "12:00",
      durationHours: 1.5,
      createdAt: "2026-08-29T12:00:00.000Z",
    })),
  });

  assert.ok(snapshot.practiceBookings.every((booking) => (
    booking.windowId === `pdf-seaford-${booking.date}-2028-black` &&
    booking.venue === "Seaford HS Turf" && booking.startTime === "09:00" &&
    booking.endTime === "11:00" && booking.durationHours === 2
  )));
  assert.equal(validatePracticeBookings(snapshot.practiceBookings).length, sundays.length);
});

test("a Nickerson weekday accepts 1.5 hours and rejects a 2-hour claim", async () => {
  const store = memoryStore();
  const valid = await claimPractice(store, {
    windowId: "nickerson-2026-09-02",
    team: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "17:00",
    durationHours: 1.5,
  }, claimOptions("weekday-valid"));

  assert.equal(valid.booking.endTime, "18:30");
  assert.equal(valid.snapshot.practiceBookings.length, 1);
  assert.equal(valid.change.type, "practice_claimed");
  assert.equal(valid.snapshot.recentChanges[0].team, "2037 Wolves");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-02",
    team: "2037 Supernova",
    coach: "Coach Marisa",
    startTime: "17:00",
    durationHours: 2,
  }, claimOptions("weekday-too-long")), { status: 400, code: "outside_window" });
});

test("Seaford alignment is relative to its 19:15 start and allows a full 2 hours", async () => {
  const valid = await claimPractice(memoryStore(), {
    windowId: "seaford-2026-09-01",
    team: "2037 Supernova",
    coach: "Coach Emma",
    startTime: "19:15",
    durationHours: 2,
  }, claimOptions("seaford-full-window"));

  assert.equal(valid.booking.startTime, "19:15");
  assert.equal(valid.booking.endTime, "21:15");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "seaford-2026-09-01",
    team: "2037 Wolves",
    coach: "Coach Mike",
    startTime: "19:30",
    durationHours: 1,
  }, claimOptions("seaford-misaligned")), { status: 400, code: "invalid_start" });
});

test("Point Lookout weekday and Saturday inventory use assigned team slots", async () => {
  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-28",
    team: "2030 Rage",
    coach: "Coach Taylor",
    startTime: "18:00",
    durationHours: 2,
  }, claimOptions("point-lookout-weekday-parent")), { status: 409, code: "window_closed" });

  const weekday = await claimPractice(memoryStore(), {
    windowId: "pdf-point-lookout-2026-09-30-2034-thunder",
    coach: "Coach Taylor",
  }, claimOptions("point-lookout-weekday"));
  assert.equal(weekday.booking.startTime, "18:00");
  assert.equal(weekday.booking.endTime, "20:00");
  assert.equal(weekday.booking.location, "Point Lookout Town Park — Lacrosse Field, Point Lookout, NY");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-26",
    team: "2034 Thunder",
    coach: "Coach Marisa",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("point-lookout-saturday-parent")), { status: 409, code: "window_closed" });

  const saturday = await claimPractice(memoryStore(), {
    windowId: "pdf-point-lookout-2026-09-26-2034-thunder",
    coach: "Coach Marisa",
  }, claimOptions("point-lookout-saturday"));
  assert.equal(saturday.booking.endTime, "10:00");
});

test("an assigned PDF slot derives its fixed team and time from a coach-only claim", async () => {
  const store = memoryStore();
  const claimed = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-storm",
    coach: "Coach Taylor",
  }, claimOptions("assigned-storm"));

  assert.deepEqual({
    team: claimed.booking.team,
    teams: claimed.booking.teams,
    secondTeam: claimed.booking.secondTeam,
    startTime: claimed.booking.startTime,
    endTime: claimed.booking.endTime,
    durationHours: claimed.booking.durationHours,
  }, {
    team: "2033 Storm",
    teams: ["2033 Storm"],
    secondTeam: null,
    startTime: "19:15",
    endTime: "21:00",
    durationHours: 1.75,
  });

  const released = await releasePractice(store, "assigned-storm", { now: FIXED_NOW });
  assert.equal(released.snapshot.practiceBookings.length, 0);

  const reclaimed = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-storm",
    coach: "Coach Two",
  }, claimOptions("assigned-storm-again"));
  assert.equal(reclaimed.booking.coach, "Coach Two");

  const avalanche = await claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-12-2036-avalanche",
    coach: "Coach Emma",
  }, claimOptions("assigned-avalanche"));
  assert.deepEqual({
    startTime: avalanche.booking.startTime,
    endTime: avalanche.booking.endTime,
    durationHours: avalanche.booking.durationHours,
  }, {
    startTime: "08:15",
    endTime: "09:30",
    durationHours: 1.25,
  });
});

test("practice claims preserve every attending coach while retaining the legacy primary coach", async () => {
  const store = memoryStore();
  const claimed = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-storm",
    coach: "Coach Taylor",
    coaches: [" Coach Taylor ", "Coach Sean", "coach taylor"],
  }, claimOptions("assigned-storm-multiple-coaches"));

  assert.equal(claimed.booking.coach, "Coach Taylor");
  assert.deepEqual(claimed.booking.coaches, ["Coach Taylor", "Coach Sean"]);
  assert.deepEqual(claimed.snapshot.practiceBookings[0].coaches, ["Coach Taylor", "Coach Sean"]);
  assert.equal(claimed.change.coach, "Coach Taylor");
  assert.deepEqual(claimed.change.coaches, ["Coach Taylor", "Coach Sean"]);
  assert.deepEqual(claimed.snapshot.recentChanges[0].coaches, ["Coach Taylor", "Coach Sean"]);
});

test("coach attendance lists reject malformed, oversized, and contradictory values", async () => {
  const base = {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    startTime: "09:00",
    durationHours: 1,
  };

  await expectCalendarError(claimPractice(memoryStore(), {
    ...base,
    coaches: [],
  }, claimOptions("no-attending-coaches")), { status: 400, code: "invalid_coach" });

  await expectCalendarError(claimPractice(memoryStore(), {
    ...base,
    coaches: "Coach One",
  }, claimOptions("bad-coach-list")), { status: 400, code: "invalid_coach" });

  await expectCalendarError(claimPractice(memoryStore(), {
    ...base,
    coaches: ["x".repeat(121)],
  }, claimOptions("long-coach-name")), { status: 400, code: "invalid_coach" });

  await expectCalendarError(claimPractice(memoryStore(), {
    ...base,
    coaches: Array.from({ length: MAX_COACHES_PER_BOOKING + 1 }, (_, index) => `Coach ${index}`),
  }, claimOptions("too-many-coaches")), { status: 400, code: "invalid_coach" });

  await expectCalendarError(claimPractice(memoryStore(), {
    ...base,
    coach: "Coach Primary",
    coaches: ["Coach Different"],
  }, claimOptions("contradictory-primary-coach")), { status: 400, code: "invalid_coach" });
});

test("assigned PDF slots with unresolved ends remain coach-claimable without invented times", async () => {
  const store = memoryStore();
  const claimed = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-12-2035-bombers",
    coach: "Coach Brad",
  }, claimOptions("assigned-dark"));

  assert.equal(claimed.booking.team, "2035 Bombers");
  assert.equal(claimed.booking.startTime, "15:00");
  assert.equal(claimed.booking.endTime, null);
  assert.equal(claimed.booking.durationHours, null);

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-seaford-2026-09-12-2035-bombers",
    coach: "Coach Two",
  }, claimOptions("assigned-dark-second")), { status: 409, code: "practice_overlap" });
});

test("assigned PDF claims reject supplied team, start, or duration tampering", async () => {
  const windowId = "pdf-seaford-2026-09-15-2033-storm";

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId,
    coach: "Coach Taylor",
    team: "2034 Thunder",
  }, claimOptions("assigned-wrong-team")), { status: 400, code: "invalid_teams" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId,
    coach: "Coach Taylor",
    startTime: "18:30",
  }, claimOptions("assigned-wrong-start")), { status: 400, code: "invalid_start" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId,
    coach: "Coach Taylor",
    durationHours: 1,
  }, claimOptions("assigned-wrong-duration")), { status: 400, code: "invalid_duration" });
});

test("intentional exact overlaps succeed for different assigned teams and coaches", async () => {
  const store = memoryStore();
  const first = await claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-12-2036-dawgs",
    coach: "Coach One",
  }, claimOptions("assigned-dawgs"));
  const second = await claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-12-2034-venom",
    coach: "Coach Two",
  }, claimOptions("assigned-venom"));

  assert.equal(first.booking.startTime, second.booking.startTime);
  assert.equal(first.booking.endTime, second.booking.endTime);
  assert.equal(second.snapshot.practiceBookings.length, 2);
});

test("the same coach cannot claim overlapping assigned PDF team slots", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-12-2036-dawgs",
    coach: "Coach Shared",
  }, claimOptions("assigned-shared-dawgs"));

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-12-2034-venom",
    coach: "  coach shared ",
  }, claimOptions("assigned-shared-venom")), { status: 409, code: "practice_overlap" });
});

test("any shared attendee blocks overlapping practices while disjoint coach lists succeed", async () => {
  const conflictStore = memoryStore();
  await claimPractice(conflictStore, {
    windowId: "pdf-nickerson-2026-09-12-2036-dawgs",
    coach: "Coach One",
    coaches: ["Coach One", "Coach Shared"],
  }, claimOptions("assigned-multi-dawgs"));

  await expectCalendarError(claimPractice(conflictStore, {
    windowId: "pdf-nickerson-2026-09-12-2034-venom",
    coach: "Coach Two",
    coaches: ["Coach Two", " coach shared "],
  }, claimOptions("assigned-multi-venom-conflict")), { status: 409, code: "practice_overlap" });

  const separateStore = memoryStore();
  await claimPractice(separateStore, {
    windowId: "pdf-nickerson-2026-09-12-2036-dawgs",
    coaches: ["Coach One", "Coach Assistant"],
  }, claimOptions("assigned-multi-dawgs-separate"));
  const second = await claimPractice(separateStore, {
    windowId: "pdf-nickerson-2026-09-12-2034-venom",
    coaches: ["Coach Two", "Coach Guest"],
  }, claimOptions("assigned-multi-venom-separate"));

  assert.equal(second.snapshot.practiceBookings.length, 2);
});

test("Venom and Renegades Monday overlap requires different coaches", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-14-2034-venom",
    coach: "Coach Shared",
  }, claimOptions("assigned-venom-overlap"));

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-seaford-2026-09-14-2033-renegades",
    coach: " coach shared ",
  }, claimOptions("assigned-renegades-overlap")), { status: 409, code: "practice_overlap" });

  const separateCoach = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-14-2033-renegades",
    coach: "Coach Two",
  }, claimOptions("assigned-renegades-separate-coach"));
  assert.equal(separateCoach.snapshot.practiceBookings.length, 2);
});

test("two coaches racing for one assigned PDF slot produce one winner", async () => {
  const store = memoryStore();
  const results = await Promise.allSettled([
    claimPractice(store, {
      windowId: "pdf-point-lookout-2026-09-12-2034-thunder",
      coach: "Coach One",
    }, claimOptions("assigned-race-one")),
    claimPractice(store, {
      windowId: "pdf-point-lookout-2026-09-12-2034-thunder",
      coach: "Coach Two",
    }, claimOptions("assigned-race-two")),
  ]);
  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.status, 409);
  assert.equal(rejected[0].reason.code, "practice_overlap");
  assert.equal(store.data.practiceBookings.length, 1);
});

test("recurring team practices close matching generic parent windows only to new claims", async () => {
  const closed = genericPracticeWindows().filter((window) => window.claimMode === "closed-to-new");
  assert.equal(closed.length, 44);
  assert.deepEqual(closed.map((window) => window.id).sort(), [
    "nickerson-2026-09-12", "nickerson-2026-09-19", "nickerson-2026-09-26",
    "nickerson-2026-10-03", "nickerson-2026-10-10", "nickerson-2026-10-17",
    "nickerson-2026-10-24", "nickerson-2026-10-31",
    "point-lookout-2026-09-09", "point-lookout-2026-09-12", "point-lookout-2026-09-14",
    "point-lookout-2026-09-16", "point-lookout-2026-09-21", "point-lookout-2026-09-23",
    "point-lookout-2026-09-26", "point-lookout-2026-09-28", "point-lookout-2026-09-30",
    "point-lookout-2026-10-03", "point-lookout-2026-10-05", "point-lookout-2026-10-07",
    "point-lookout-2026-10-10", "point-lookout-2026-10-12", "point-lookout-2026-10-14",
    "point-lookout-2026-10-17", "point-lookout-2026-10-19", "point-lookout-2026-10-21",
    "point-lookout-2026-10-24", "point-lookout-2026-10-26", "point-lookout-2026-10-28",
    "seaford-2026-09-08", "seaford-2026-09-09", "seaford-2026-09-10", "seaford-2026-09-14",
    "seaford-2026-09-15", "seaford-2026-09-16", "seaford-2026-09-17", "seaford-2026-09-21",
    "seaford-2026-09-22", "seaford-2026-09-23", "seaford-2026-09-24", "seaford-2026-09-28",
    "seaford-2026-09-29", "seaford-2026-09-30", "seaford-2026-10-01",
  ]);

  const reopenedNickerson = await claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-14",
    team: "2037 Supernova",
    coach: "Coach Reopened",
    startTime: "17:00",
    durationHours: 1.5,
  }, claimOptions("reopened-nickerson"));
  assert.equal(reopenedNickerson.booking.endTime, "18:30");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-14",
    team: "2037 Supernova",
    coach: "Coach Legacy",
    startTime: "18:00",
    durationHours: 2,
  }, claimOptions("closed-parent-new-claim")), { status: 409, code: "window_closed" });

  const legacyBooking = {
    id: "legacy-before-pdf-schedule",
    windowId: "point-lookout-2026-09-14",
    team: "2037 Supernova",
    teams: ["2037 Supernova"],
    secondTeam: null,
    coach: "Coach Legacy",
    startTime: "18:00",
    endTime: "20:00",
    durationHours: 2,
    createdAt: "2026-08-28T12:00:00.000Z",
  };
  const normalized = validatePracticeBookings([legacyBooking]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].windowId, "point-lookout-2026-09-14");
  assert.equal(normalized[0].team, "2037 Supernova");
});

test("Momentum one-hour windows allow two independent teams for one hour", async () => {
  const store = memoryStore();
  const valid = await claimPractice(store, {
    windowId: "momentum-2026-11-01",
    team: "2037 Supernova",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team"));

  assert.equal(valid.booking.team, "2037 Supernova");
  assert.deepEqual(valid.booking.teams, ["2037 Supernova"]);
  assert.equal(valid.booking.secondTeam, null);
  assert.equal(valid.booking.endTime, "09:00");
  assert.equal(valid.booking.venue, "Momentum Sports LI");
  assert.equal(
    valid.booking.location,
    "10 Dunton Avenue, Deer Park, NY 11729",
  );

  const second = await claimPractice(store, {
    windowId: "momentum-2026-11-01",
    team: "2037 Wolves",
    coach: "Coach Mike",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team-second"));
  assert.equal(second.snapshot.practiceBookings.length, 2);

  await expectCalendarError(claimPractice(store, {
    windowId: "momentum-2026-11-01",
    team: "2036 Dawgs",
    coach: "Coach Sean",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team-third")), { status: 409, code: "field_capacity" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Supernova",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-one-team-too-long")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Supernova",
    coach: "Coach Emma",
    startTime: "08:30",
    durationHours: 1,
  }, claimOptions("momentum-half-hour-start")), { status: 400, code: "invalid_start" });
});

test("Momentum two-hour windows allow two independent teams and reject a third", async () => {
  const store = memoryStore();
  const first = await claimPractice(store, {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-first"));

  assert.equal(first.booking.team, "2037 Wolves");
  assert.deepEqual(first.booking.teams, ["2037 Wolves"]);
  assert.equal(first.booking.secondTeam, null);
  assert.equal(first.booking.endTime, "10:00");

  const shared = await claimPractice(store, {
    windowId: "momentum-2026-11-07",
    team: "2037 Supernova",
    coach: "Coach Marisa",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-second"));
  assert.equal(shared.snapshot.practiceBookings.length, 2);
  assert.deepEqual(shared.booking.teams, ["2037 Supernova"]);

  await expectCalendarError(claimPractice(store, {
    windowId: "momentum-2026-11-07",
    team: "2036 Dawgs",
    coach: "Coach Sean",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-third")), { status: 409, code: "field_capacity" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    secondTeam: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-duplicate-team")), { status: 400, code: "invalid_teams" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    secondTeam: "Unknown Team",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-unknown-second")), { status: 400, code: "invalid_team" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-on-shared-day")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "14:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-remainder")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
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

test("field windows accept two overlapping team claims and reject a third", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 2,
  }, claimOptions("occupied"));

  const second = await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2033 Renegades",
    coach: "Coach Two",
    startTime: "10:30",
    durationHours: 1.5,
  }, claimOptions("overlap-second"));
  assert.equal(second.snapshot.practiceBookings.length, 2);

  await expectCalendarError(claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2034 Venom",
    coach: "Coach Three",
    startTime: "10:30",
    durationHours: 1,
  }, claimOptions("overlap-third")), { status: 409, code: "field_capacity" });

  await expectCalendarError(claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Different Coach",
    startTime: "10:30",
    durationHours: 1,
  }, claimOptions("duplicate-team")), { status: 409, code: "practice_overlap" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "08:30",
    durationHours: 1,
  }, claimOptions("outside")), { status: 400, code: "outside_window" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 1.25,
  }, claimOptions("duration")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-05",
    team: "Unknown Team",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("unknown-team")), { status: 400, code: "invalid_team" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "   ",
    startTime: "09:00",
    durationHours: 1,
  }, claimOptions("missing-coach")), { status: 400, code: "invalid_coach" });
});

test("three concurrent claims for a split field produce exactly two winners", async () => {
  const store = memoryStore();
  const claims = [
    ["2036 Dawgs", "Coach One", "race-one"],
    ["2033 Renegades", "Coach Two", "race-two"],
    ["2034 Venom", "Coach Three", "race-three"],
  ].map(([team, coach, id]) => claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team,
    coach,
    startTime: "09:00",
    durationHours: 2,
  }, claimOptions(id)));

  const results = await Promise.allSettled(claims);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 2);
  const rejected = results.filter((result) => result.status === "rejected");
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.code, "field_capacity");
  assert.equal(store.data.practiceBookings.length, 2);
});

test("releasing one of two split-field claims preserves the other", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "seaford-2026-09-18",
    team: "2033 Storm",
    coach: "Coach Dan",
    startTime: "19:15",
    durationHours: 1.5,
  }, claimOptions("storm-sep-18"));
  await claimPractice(store, {
    windowId: "seaford-2026-09-18",
    team: "2033 Renegades",
    coach: "Coach Sean",
    startTime: "19:15",
    durationHours: 1.5,
  }, claimOptions("renegades-sep-18"));

  const released = await releasePractice(store, "storm-sep-18", { now: FIXED_NOW });
  assert.deepEqual(released.snapshot.practiceBookings.map((booking) => booking.id), ["renegades-sep-18"]);
  assert.equal(released.change.type, "practice_released");
  assert.equal(released.snapshot.recentChanges[0].team, "2033 Storm");
});

test("the practice editor supports one full Seaford slot plus sequential half-slot teams", async () => {
  const store = memoryStore();
  const save = (id, team, startTime, endTime) => saveScheduledPractice(store, {
    team,
    coaches: [`Coach ${team}`],
    date: "2026-09-01",
    locationKey: "seaford",
    startTime,
    endTime,
  }, {
    now: FIXED_NOW,
    idFactory: () => id,
  });

  await save("staff-practice-full", "2030 Rage", "19:15", "21:15");
  await save("staff-practice-first-half", "2031 Carnage", "19:15", "20:15");
  await save("staff-practice-second-half", "2032 Cannons", "20:15", "21:15");

  assert.equal(store.data.practiceOverrides.length, 3);
  await expectCalendarError(
    save("staff-practice-third-overlap", "2033 Storm", "19:15", "20:15"),
    { status: 409, code: "field_capacity" },
  );
  assert.equal(store.data.practiceOverrides.length, 3);
});

test("Nickerson allows multiple simultaneous fields while Point Lookout remains two-team capacity", async () => {
  const nickersonStore = memoryStore();
  const nickerson = await saveScheduledPractice(nickersonStore, {
    team: "2030 Rage",
    coaches: ["Coach Rage"],
    date: "2026-09-12",
    locationKey: "nickerson",
    startTime: "09:00",
    endTime: "10:00",
  }, {
    now: FIXED_NOW,
    idFactory: () => "staff-practice-nickerson-extra",
  });
  assert.equal(nickerson.practice.locationKey, "nickerson");

  const pointLookoutStore = memoryStore();
  await expectCalendarError(saveScheduledPractice(pointLookoutStore, {
    team: "2030 Rage",
    coaches: ["Coach Rage"],
    date: "2026-09-12",
    locationKey: "point-lookout",
    startTime: "08:00",
    endTime: "09:00",
  }, {
    now: FIXED_NOW,
    idFactory: () => "staff-practice-point-lookout-third",
  }), { status: 409, code: "field_capacity" });
});

test("default team practices can be edited and deleted without rewriting the baseline", async () => {
  const store = memoryStore();
  const practiceId = "pdf-seaford-2026-09-14-2033-renegades";
  const edited = await saveScheduledPractice(store, {
    id: practiceId,
    team: "2033 Renegades",
    coaches: ["Coach Dan", "Coach Matt"],
    date: "2026-09-14",
    locationKey: "seaford",
    startTime: "19:15",
    endTime: "21:15",
    note: "Monday night practice",
  }, { now: FIXED_NOW });

  assert.equal(edited.change.type, "practice_updated");
  assert.deepEqual(edited.practice.coaches, ["Coach Dan", "Coach Matt"]);
  assert.equal(normalizePracticeOverrides(store.data.practiceOverrides).length, 1);
  assert.equal(effectiveAssignedPractices(store.data.practiceOverrides)
    .find((practice) => practice.id === practiceId).note, "Monday night practice");

  const deleted = await deleteScheduledPractice(store, practiceId, { now: FIXED_NOW });
  assert.equal(deleted.change.type, "practice_deleted");
  assert.equal(effectiveAssignedPractices(store.data.practiceOverrides)
    .some((practice) => practice.id === practiceId), false);
  assert.deepEqual(store.data.practiceOverrides, [{
    id: practiceId,
    deleted: true,
    updatedAt: FIXED_NOW.toISOString(),
  }]);
});

test("an incomplete imported practice can have its missing end time repaired in place", async () => {
  const store = memoryStore();
  const practiceId = "pdf-seaford-2026-09-12-2035-bombers";
  const repaired = await saveScheduledPractice(store, {
    id: practiceId,
    team: "2035 Bombers",
    coaches: ["Coach Bombers"],
    date: "2026-09-12",
    locationKey: "seaford",
    startTime: "15:00",
    endTime: "17:00",
    note: "End time confirmed",
  }, { now: FIXED_NOW });

  assert.equal(repaired.practice.endTime, "17:00");
  assert.equal(repaired.change.type, "practice_updated");
  await expectCalendarError(saveScheduledPractice(store, {
    id: practiceId,
    team: "2035 Bombers",
    coaches: ["Coach Bombers"],
    date: "2026-09-12",
    locationKey: "seaford",
    startTime: "15:15",
    endTime: "17:00",
  }, { now: FIXED_NOW }), { status: 409, code: "outside_field_availability" });
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
    team: "2037 Wolves",
    teams: ["2037 Wolves", "2037 Supernova"],
    secondTeam: "2037 Supernova",
  };
  assert.equal(practiceBookingsConflict(sharedPractice, {
    ...first,
    windowId: "field-b",
    team: "2037 Supernova",
    teams: ["2037 Supernova"],
    secondTeam: null,
    coach: "Different Coach",
    startTime: "20:00",
    endTime: "21:00",
  }), true);
});

test("a practice booking can be released atomically", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2034 Thunder",
    coach: "Coach Brad",
    startTime: "09:00",
    durationHours: 1.5,
  }, claimOptions("release-me"));

  store.forceConditionalMisses(2);
  const released = await releasePractice(store, "release-me", { now: FIXED_NOW });
  assert.equal(released.snapshot.practiceBookings.length, 0);
  assert.equal(released.snapshot.version, 2);
  assert.equal(released.snapshot.recentChanges[0].type, "practice_released");
  assert.equal(store.writeCount, 4);
});

test("an event-only legacy save without an ETag preserves current practice claims", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2032 Cannons",
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
  assert.equal(saved.change.type, "tournament_added");
  assert.equal(saved.snapshot.recentChanges[0].type, "tournament_added");
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
    windowId: "nickerson-2026-09-02",
    team: "2035 Hurricanes",
    coach: "Coach Marisa",
    startTime: "17:00",
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
    windowId: "nickerson-2026-09-04",
    team: "2036 Dawgs",
    coach: "Coach Mike",
    startTime: "17:00",
    durationHours: 1,
  }, claimOptions("third-attempt"));
  assert.equal(eventuallyAvailable.writeCount, 3);
  assert.equal(claimed.snapshot.practiceBookings.length, 1);

  const contended = memoryStore();
  contended.forceConditionalMisses(3);
  await expectCalendarError(claimPractice(contended, {
    windowId: "nickerson-2026-09-07",
    team: "2036 Dawgs",
    coach: "Coach Mike",
    startTime: "17:00",
    durationHours: 1,
  }, claimOptions("never-written")), { status: 409, code: "contention" });
  assert.equal(contended.writeCount, 3);
  assert.equal(contended.data, null);
});

test("calendar alert recipients are validated and deduplicated case-insensitively", () => {
  assert.deepEqual(calendarAlertRecipients({
    TOURNAMENT_CALENDAR_NOTIFY_EMAILS: [
      "ops-one@example.com",
      " OPS-TWO@example.com ",
      "ops-one@example.com",
      "not-an-address",
      "ops-three@example.com",
      "",
    ].join(","),
  }), [
    "ops-one@example.com",
    "OPS-TWO@example.com",
    "ops-three@example.com",
  ]);
  assert.deepEqual(calendarAlertRecipients({}), []);
});

test("calendar change alerts send one escaped Brevo payload through injected fetch", async () => {
  const requests = [];
  const result = await sendCalendarChangeAlert({
    id: "change-email-test",
    type: "practice_claimed",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: "2033 Storm claimed <Field A>",
    team: "2033 Storm",
    teams: ["2033 Storm"],
    coach: "Coach Example",
    coaches: ["Coach Example", "Coach & Two"],
    date: "2026-09-01",
    startTime: "19:15",
    endTime: "20:15",
    location: "Example & Field",
  }, {
    env: {
      BREVO_API_KEY: "test-api-key",
      BREVO_SENDER_EMAIL: "calendar@example.com",
      BREVO_SENDER_NAME: "BTB Test Calendar",
      TOURNAMENT_CALENDAR_NOTIFY_EMAILS:
        "alerts-one@example.com,alerts-two@example.com,ALERTS-ONE@example.com",
    },
    fetchImpl: async (...args) => {
      requests.push(args);
      return {
        ok: true,
        status: 202,
        async text() { return ""; },
      };
    },
  });

  assert.equal(requests.length, 1);
  const [url, options] = requests[0];
  const payload = JSON.parse(options.body);
  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(options.method, "POST");
  assert.equal(options.headers["api-key"], "test-api-key");
  assert.deepEqual(payload.sender, { name: "BTB Test Calendar", email: "calendar@example.com" });
  assert.deepEqual(payload.replyTo, payload.sender);
  assert.deepEqual(payload.to, [
    { email: "alerts-one@example.com" },
    { email: "alerts-two@example.com" },
  ]);
  assert.equal(payload.subject, "[BTB SCHEDULE CHANGE] 2033 Storm claimed <Field A>");
  assert.match(payload.htmlContent, /2033 Storm claimed &lt;Field A&gt;/);
  assert.match(payload.htmlContent, /Example &amp; Field/);
  assert.match(payload.htmlContent, /Coaches: Coach Example, Coach &amp; Two/);
  assert.doesNotMatch(payload.htmlContent, /2033 Storm claimed <Field A>/);
  assert.match(payload.textContent, /Coaches: Coach Example, Coach & Two/);
  assert.match(payload.textContent, /Open Master Calendar: https:\/\/www\.bethebestli\.com\/dan-calendar/);
  assert.deepEqual(result, {
    sent: true,
    recipientCount: 2,
    subject: "[BTB SCHEDULE CHANGE] 2033 Storm claimed <Field A>",
  });
});

test("calendar change alerts skip without complete configuration and never call fetch", async () => {
  let fetchCalls = 0;
  const result = await sendCalendarChangeAlert({
    id: "change-email-skip",
    type: "schedule_updated",
    occurredAt: "2026-08-30T18:00:00.000Z",
    summary: "Schedule updated",
  }, {
    env: {
      TOURNAMENT_CALENDAR_NOTIFY_EMAILS: "alerts@example.com",
    },
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error("fetch must not run when alert configuration is incomplete");
    },
  });

  assert.deepEqual(result, { sent: false, skipped: "not_configured", recipientCount: 1 });
  assert.equal(fetchCalls, 0);
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

test("a la carte training runs at Momentum on girls Mondays and boys Fridays", () => {
  const sessions = pageTrainingSessions();
  const mondays = [
    "2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05",
    "2026-10-12", "2026-10-19", "2026-10-26",
  ];
  const fridays = [
    "2026-09-18", "2026-09-25", "2026-10-02", "2026-10-09",
    "2026-10-16", "2026-10-23", "2026-10-30",
  ];
  const weekday = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();

  assert.equal(sessions.length, 28);
  assert.ok(sessions.every((session) => (
    session.optional === true &&
    session.coach === "Coach Dan" &&
    session.price === "$250 for all sessions" &&
    session.locationKey === "momentum" &&
    session.venue === "Momentum Sports LI" &&
    session.location === "10 Dunton Avenue, Deer Park, NY 11729"
  )));

  const expected = {
    "girls-36-34": { dates: mondays, program: "Girls", startTime: "19:00", endTime: "20:00", teams: ["2036 Avalanche", "2035 Hurricanes", "2034 Thunder"] },
    "girls-33-31": { dates: mondays, program: "Girls", startTime: "20:00", endTime: "21:00", teams: ["2033 Storm", "2032 Riptide", "2031 Cyclones"] },
    "boys-36-34": { dates: fridays, program: "Boys", startTime: "19:00", endTime: "20:00", teams: ["2036 Dawgs", "2035 Bombers", "2034 Venom"] },
    "boys-33-31": { dates: fridays, program: "Boys", startTime: "20:00", endTime: "21:00", teams: ["2033 Renegades", "2032 Cannons", "2031 Carnage"] },
  };

  for (const [groupKey, group] of Object.entries(expected)) {
    const groupSessions = sessions.filter((session) => session.groupKey === groupKey);
    assert.deepEqual(groupSessions.map((session) => session.date), group.dates, groupKey);
    assert.ok(groupSessions.every((session) => (
      session.startTime === group.startTime &&
      session.endTime === group.endTime &&
      session.program === group.program
    )), groupKey);
    assert.deepEqual(groupSessions[0].teams, group.teams, groupKey);
  }

  // Girls run Mondays, boys run Fridays; each block starts the week the season opens
  // and ends on the last one of October.
  assert.ok(mondays.every((date) => weekday(date) === 1));
  assert.ok(fridays.every((date) => weekday(date) === 5));
  assert.equal(mondays[0], "2026-09-14");
  assert.equal(mondays[mondays.length - 1], "2026-10-26");
  assert.equal(fridays[0], "2026-09-18");
  assert.equal(fridays[fridays.length - 1], "2026-10-30");

  // Optional training is not a claimable field window and never collides with practice ids.
  const practiceIds = new Set(PRACTICE_WINDOWS.map((window) => window.id));
  assert.ok(sessions.every((session) => !practiceIds.has(session.id)));

  // No team is booked for two training sessions on the same night.
  const seen = new Set();
  for (const session of sessions) {
    for (const team of session.teams) {
      const slot = `${session.date}|${team}`;
      assert.equal(seen.has(slot), false, `duplicate training slot ${slot}`);
      seen.add(slot);
    }
  }
});
