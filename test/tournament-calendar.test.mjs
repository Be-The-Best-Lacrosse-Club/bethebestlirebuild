import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

  add("seaford", tuesdays, "19:15", "21:15", [
    "2033 Renegades",
  ]);
  add("seaford", tuesdays, "19:15", "21:00", ["2033 Storm"]);
  add("seaford", wednesdays, "19:15", "21:15", [
    "2036 Dawgs", "2035 Bombers",
  ]);
  add("seaford", wednesdays, "19:15", "20:15", [
    "2036 Avalanche",
  ]);
  add("seaford", thursdays, "19:15", "21:15", [
    "2032 Riptide", "2031 Cyclones",
  ]);
  add("seaford", saturdays, "15:00", null, ["2035 Bombers"]);
  add("seaford", sundays, "09:00", "11:00", ["2032 Riptide"]);
  add("seaford", sundays, "08:00", "09:30", ["2031 Cyclones"]);

  add("stimson", mondays, "17:45", null, ["2034 Venom"]);
  add("stimson", sundays, "09:00", "10:30", [
    "2030 Rage", "2032 Cannons",
  ]);
  add("stimson", sundays, "10:30", "12:00", [
    "2028 Black", "2031 Carnage",
  ]);

  add("nickerson", mondays, "17:00", "18:30", ["2035 Hurricanes"]);
  add("nickerson", saturdays, "09:00", "10:30", ["2036 Dawgs"]);
  add("nickerson", saturdays, "10:30", "12:30", ["2033 Renegades"]);
  add("nickerson", saturdays, "08:15", "09:30", ["2036 Avalanche"]);
  add("nickerson", saturdays, "09:30", "11:00", ["2035 Hurricanes"]);
  add("nickerson", saturdays, "09:00", "10:30", ["2034 Venom"]);

  add("point-lookout", wednesdays, "18:00", "20:00", ["2034 Thunder"]);
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

test("the server exposes 123 generic windows plus 182 recurring team practice slots", () => {
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

  assert.equal(PRACTICE_WINDOWS.length, 305);
  assert.equal(generic.length, 123);
  assert.equal(assigned.length, 182);
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

  assert.equal(assigned.length, 182);
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
    seaford: 78,
    stimson: 35,
    nickerson: 47,
    "point-lookout": 22,
  });
  assert.deepEqual(countsByTeam, {
    "2036 Avalanche": 16,
    "2033 Renegades": 16,
    "2036 Dawgs": 16,
    "2035 Bombers": 16,
    "2032 Riptide": 15,
    "2031 Cyclones": 15,
    "2034 Venom": 15,
    "2030 Rage": 7,
    "2032 Cannons": 7,
    "2028 Black": 7,
    "2031 Carnage": 7,
    "2035 Hurricanes": 15,
    "2033 Storm": 15,
    "2034 Thunder": 15,
  });
  const expectedTuesdays = [
    "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29",
    "2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27",
  ];
  for (const team of ["2033 Renegades", "2033 Storm"]) {
    const tuesdaySlots = assigned.filter((window) => (
      window.assignedTeams[0] === team && window.locationKey === "seaford" && window.startTime === "19:15"
    )).sort((a, b) => a.date.localeCompare(b.date));
    assert.deepEqual(tuesdaySlots.map((window) => window.date), expectedTuesdays);
    assert.ok(tuesdaySlots.every((window) => (
      window.endTime === (team === "2033 Storm" ? "21:00" : "21:15")
    )));
  }
  const stormPointLookout = assigned.filter((window) => (
    window.assignedTeams[0] === "2033 Storm" && window.locationKey === "point-lookout"
  ));
  assert.equal(stormPointLookout.length, 7);
  assert.equal(stormPointLookout.some((window) => window.date === "2026-09-19"), false);

  assert.equal(new Set(assigned.map((window) => window.id)).size, 182);
  assert.ok(assigned.every((window) => (
    /^pdf-(seaford|stimson|nickerson|point-lookout)-2026-(09|10)-\d{2}-[a-z0-9-]+$/.test(window.id) &&
    window.date >= "2026-09-08" && window.date <= "2026-10-31" &&
    window.mode === "assigned" && window.claimMode === "assigned" &&
    Array.isArray(window.assignedTeams) && window.assignedTeams.length === 1 &&
    KNOWN_TEAMS.includes(window.assignedTeams[0]) && window.teamCount === 1
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

  const stimsonNeedsTime = practiceWindow("pdf-stimson-2026-09-14-2034-venom");
  assert.deepEqual({
    startTime: stimsonNeedsTime.startTime,
    endTime: stimsonNeedsTime.endTime,
    timeLabel: stimsonNeedsTime.timeLabel,
    assignmentStatus: stimsonNeedsTime.assignmentStatus,
    requiredDurationHours: stimsonNeedsTime.requiredDurationHours,
  }, {
    startTime: "17:45",
    endTime: null,
    timeLabel: "5:45 PM–Dark",
    assignmentStatus: "needs-time",
    requiredDurationHours: null,
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
    "startIncrementMinutes", "teamCount", "requiredDurationHours", "mode", "claimMode",
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
  assert.match(html, /function scheduleItemsForDay\(dayIso, showTournaments, showPractices\)/);
  assert.match(html, /function openDayDialog\(dayIso\)/);
  assert.match(html, /body\.querySelectorAll\("\[data-day-detail-item\]"\)/);
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

test("known-team validation covers the active 18-team 2026-27 operating list", () => {
  assert.deepEqual(KNOWN_TEAMS, [
    "2028 Black", "2030 Rage", "2031 Carnage", "2032 Cannons", "2033 Renegades",
    "2034 Venom", "2035 Bombers", "2036 Fury", "2036 Dawgs", "2037 Wolves",
    "2031 Cyclones", "2032 Riptide", "2033 Storm", "2034 Thunder", "2035 Hurricanes",
    "2035 Tornadoes", "2036 Avalanche", "2037 Supernova",
  ]);
  assert.equal(new Set(KNOWN_TEAMS).size, 18);
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
    "2030 Tidal Wave", "2034 Tsunami", "Girls Futures",
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
    events: [],
    practiceBookings: [legacyAliases, ...retiredBookings],
  });
  assert.equal(snapshot.practiceBookings.length, 1);
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
    savedAt: "legacy",
  });
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

test("Point Lookout weekday inventory stays claimable while recurring Saturdays use assigned slots", async () => {
  const weekday = await claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-28",
    team: "2030 Rage",
    coach: "Coach Taylor",
    startTime: "18:00",
    durationHours: 2,
  }, claimOptions("point-lookout-weekday"));
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

test("assigned PDF slots with unresolved ends remain coach-claimable without invented times", async () => {
  const store = memoryStore();
  const claimed = await claimPractice(store, {
    windowId: "pdf-stimson-2026-09-14-2034-venom",
    coach: "Coach Brad",
  }, claimOptions("assigned-dark"));

  assert.equal(claimed.booking.team, "2034 Venom");
  assert.equal(claimed.booking.startTime, "17:45");
  assert.equal(claimed.booking.endTime, null);
  assert.equal(claimed.booking.durationHours, null);

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-stimson-2026-09-14-2034-venom",
    coach: "Coach Two",
  }, claimOptions("assigned-dark-second")), { status: 409, code: "practice_overlap" });

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-nickerson-2026-09-14-2035-hurricanes",
    coach: "Coach Brad",
  }, claimOptions("assigned-dark-overlap")), { status: 409, code: "practice_overlap" });
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

test("Storm and Renegades Tuesday overlap requires different coaches", async () => {
  const store = memoryStore();
  await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-storm",
    coach: "Coach Shared",
  }, claimOptions("assigned-storm-overlap"));

  await expectCalendarError(claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-renegades",
    coach: " coach shared ",
  }, claimOptions("assigned-renegades-overlap")), { status: 409, code: "practice_overlap" });

  const separateCoach = await claimPractice(store, {
    windowId: "pdf-seaford-2026-09-15-2033-renegades",
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
  assert.equal(closed.length, 41);
  assert.deepEqual(closed.map((window) => window.id).sort(), [
    "nickerson-2026-09-12", "nickerson-2026-09-14", "nickerson-2026-09-19",
    "nickerson-2026-09-21", "nickerson-2026-09-26", "nickerson-2026-09-28",
    "nickerson-2026-10-03", "nickerson-2026-10-05", "nickerson-2026-10-10",
    "nickerson-2026-10-12", "nickerson-2026-10-17", "nickerson-2026-10-19",
    "nickerson-2026-10-24", "nickerson-2026-10-26", "nickerson-2026-10-31",
    "point-lookout-2026-09-09", "point-lookout-2026-09-12", "point-lookout-2026-09-16",
    "point-lookout-2026-09-23", "point-lookout-2026-09-26", "point-lookout-2026-09-30",
    "point-lookout-2026-10-03", "point-lookout-2026-10-07", "point-lookout-2026-10-10",
    "point-lookout-2026-10-14", "point-lookout-2026-10-17", "point-lookout-2026-10-21",
    "point-lookout-2026-10-24", "point-lookout-2026-10-28",
    "seaford-2026-09-08", "seaford-2026-09-09", "seaford-2026-09-10",
    "seaford-2026-09-15", "seaford-2026-09-16", "seaford-2026-09-17",
    "seaford-2026-09-22", "seaford-2026-09-23", "seaford-2026-09-24",
    "seaford-2026-09-29", "seaford-2026-09-30", "seaford-2026-10-01",
  ]);

  const reopenedPointLookout = await claimPractice(memoryStore(), {
    windowId: "point-lookout-2026-09-14",
    team: "2037 Supernova",
    coach: "Coach Reopened",
    startTime: "18:00",
    durationHours: 2,
  }, claimOptions("reopened-point-lookout"));
  assert.equal(reopenedPointLookout.booking.endTime, "20:00");

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "nickerson-2026-09-14",
    team: "2037 Supernova",
    coach: "Coach Legacy",
    startTime: "17:00",
    durationHours: 1.5,
  }, claimOptions("closed-parent-new-claim")), { status: 409, code: "window_closed" });

  const legacyBooking = {
    id: "legacy-before-pdf-schedule",
    windowId: "nickerson-2026-09-14",
    team: "2037 Supernova",
    teams: ["2037 Supernova"],
    secondTeam: null,
    coach: "Coach Legacy",
    startTime: "17:00",
    endTime: "18:30",
    durationHours: 1.5,
    createdAt: "2026-08-28T12:00:00.000Z",
  };
  const normalized = validatePracticeBookings([legacyBooking]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].windowId, "nickerson-2026-09-14");
  assert.equal(normalized[0].team, "2037 Supernova");
});

test("Momentum one-hour windows require one team, one hour, and hourly starts", async () => {
  const valid = await claimPractice(memoryStore(), {
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
    secondTeam: "2037 Wolves",
    coach: "Coach Emma",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-team-extra")), { status: 400, code: "invalid_team_count" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-01",
    team: "2037 Supernova",
    coach: "Coach Emma",
    startTime: "08:30",
    durationHours: 1,
  }, claimOptions("momentum-half-hour-start")), { status: 400, code: "invalid_start" });
});

test("Momentum shared windows require two distinct known teams for exactly two hours", async () => {
  const store = memoryStore();
  const first = await claimPractice(store, {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    secondTeam: "2037 Supernova",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-shared-first"));

  assert.equal(first.booking.team, "2037 Wolves");
  assert.deepEqual(first.booking.teams, ["2037 Wolves", "2037 Supernova"]);
  assert.equal(first.booking.secondTeam, "2037 Supernova");
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
    team: "2037 Wolves",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 2,
  }, claimOptions("momentum-missing-second")), { status: 400, code: "invalid_team_count" });

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
    secondTeam: "2037 Supernova",
    coach: "Coach Taylor",
    startTime: "08:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-on-shared-day")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    secondTeam: "2037 Supernova",
    coach: "Coach Taylor",
    startTime: "14:00",
    durationHours: 1,
  }, claimOptions("momentum-one-hour-remainder")), { status: 400, code: "invalid_duration" });

  await expectCalendarError(claimPractice(memoryStore(), {
    windowId: "momentum-2026-11-07",
    team: "2037 Wolves",
    secondTeam: "2037 Supernova",
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
    windowId: "nickerson-2026-09-05",
    team: "2036 Dawgs",
    coach: "Coach One",
    startTime: "09:00",
    durationHours: 2,
  }, claimOptions("occupied"));

  await expectCalendarError(claimPractice(store, {
    windowId: "nickerson-2026-09-05",
    team: "2033 Renegades",
    coach: "Coach Two",
    startTime: "10:30",
    durationHours: 1.5,
  }, claimOptions("overlap")), { status: 409, code: "practice_overlap" });

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
    team: "2035 Tornadoes",
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
    team: "2036 Fury",
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
    team: "2036 Fury",
    coach: "Coach Mike",
    startTime: "17:00",
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
