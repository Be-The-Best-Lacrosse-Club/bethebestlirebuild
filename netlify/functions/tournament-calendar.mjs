/**
 * Shared store for Coach Dan's tournament wall and coach practice claims.
 *
 * Tournament edits and practice claims share one strongly-consistent snapshot.
 * Every write uses the blob ETag so an older browser cannot erase a newer
 * claim. Practice windows live here as the server-side source of truth.
 */
import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { ALLOWED_ORIGINS, guardRequest } from "./_guard.js";
import { authorizeIdentity } from "./_identity.js";

const STORE_NAME = "tournament-calendar";
export const SNAPSHOT_KEY = "dan-wall-snapshot";

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const DEPLOY_PREVIEW_ORIGIN = /^https:\/\/deploy-preview-\d+--btb-lacrosse\.netlify\.app$/;
const VALID_DURATIONS = new Set([1, 1.5, 2]);
const MAX_ATOMIC_ATTEMPTS = 3;

export const KNOWN_TEAMS = Object.freeze([
  "2028 Black",
  "2030 Rage",
  "2031 Carnage",
  "2032 Cannons",
  "2033 Renegades",
  "2034 Venom",
  "2035 Bombers",
  "2036 Fury",
  "2036 Dawgs",
  "2037 Wolves",
  "2031 Cyclones",
  "2032 Riptide",
  "2033 Storm",
  "2034 Thunder",
  "2035 Hurricanes",
  "2035 Tornadoes",
  "2036 Avalanche",
  "2037 Supernova",
]);

const KNOWN_TEAM_SET = new Set(KNOWN_TEAMS);
const TEAM_ALIASES = Object.freeze({
  "2037 Boys": "2037 Wolves",
  "2037 Girls": "2037 Supernova",
});
const RETIRED_TEAM_SET = new Set([
  "2029 Chrome",
  "2032 Grizzlies",
  "Boys Futures",
  "2030 Reign",
  "2030 Tidal Wave",
  "2034 Tsunami",
  "Girls Futures",
]);

const SEAFORD_DATES = Object.freeze([
  "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04",
  "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11",
  "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25",
  "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02",
]);

const NICKERSON_WEEKDAY_DATES = Object.freeze([
  "2026-09-02", "2026-09-04", "2026-09-07", "2026-09-09", "2026-09-11",
  "2026-09-14", "2026-09-16", "2026-09-18", "2026-09-21", "2026-09-23",
  "2026-09-25", "2026-09-28", "2026-09-30",
  "2026-10-02", "2026-10-05", "2026-10-07", "2026-10-09", "2026-10-12",
  "2026-10-14", "2026-10-16", "2026-10-19", "2026-10-21", "2026-10-23",
  "2026-10-26", "2026-10-28", "2026-10-30",
]);

const NICKERSON_SATURDAY_DATES = Object.freeze([
  "2026-09-05", "2026-09-12", "2026-09-19", "2026-09-26",
  "2026-10-03", "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31",
]);

const POINT_LOOKOUT_WEEKDAY_DATES = Object.freeze([
  "2026-09-09", "2026-09-14", "2026-09-16", "2026-09-21", "2026-09-23",
  "2026-09-28", "2026-09-30", "2026-10-05", "2026-10-07", "2026-10-12",
  "2026-10-14", "2026-10-19", "2026-10-21", "2026-10-26", "2026-10-28",
]);

const POINT_LOOKOUT_SATURDAY_DATES = Object.freeze([
  "2026-09-12", "2026-09-26", "2026-10-03",
  "2026-10-10", "2026-10-17", "2026-10-24",
]);

const MOMENTUM_ONE_HOUR_DATES = Object.freeze([
  "2026-11-01", "2026-11-14", "2026-11-15", "2026-11-28", "2026-11-29",
  "2026-12-12", "2026-12-13", "2026-12-26", "2026-12-27",
  "2027-01-09", "2027-01-10", "2027-01-23", "2027-01-24",
  "2027-02-06", "2027-02-07", "2027-02-20", "2027-02-21",
  "2027-03-06", "2027-03-07", "2027-03-20", "2027-03-21",
]);

const MOMENTUM_TWO_HOUR_DATES = Object.freeze([
  "2026-11-07", "2026-11-08", "2026-11-21", "2026-11-22",
  "2026-12-05", "2026-12-06", "2026-12-19", "2026-12-20",
  "2027-01-02", "2027-01-03", "2027-01-16", "2027-01-17", "2027-01-30", "2027-01-31",
  "2027-02-13", "2027-02-14", "2027-02-27", "2027-02-28",
  "2027-03-13", "2027-03-14", "2027-03-27", "2027-03-28",
]);

export const CLOSED_TO_NEW_PRACTICE_WINDOW_IDS = Object.freeze([
  "seaford-2026-09-08", "seaford-2026-09-09", "seaford-2026-09-10",
  "seaford-2026-09-15", "seaford-2026-09-16", "seaford-2026-09-17",
  "seaford-2026-09-22", "seaford-2026-09-23", "seaford-2026-09-24",
  "nickerson-2026-09-12", "nickerson-2026-09-14",
  "nickerson-2026-09-19", "nickerson-2026-09-21",
  "point-lookout-2026-09-09", "point-lookout-2026-09-12",
  "point-lookout-2026-09-16", "point-lookout-2026-09-23",
]);

const CLOSED_TO_NEW_PRACTICE_WINDOW_SET = new Set(CLOSED_TO_NEW_PRACTICE_WINDOW_IDS);
const PRACTICE_TIMES_PDF_SOURCE = "Practice Times PDF • Sept. 8–24, 2026";

function practiceWindow({
  id,
  venue,
  location,
  locationKey = null,
  field = null,
  date,
  startTime,
  endTime,
  kind,
  approval,
  startIncrementMinutes = 30,
  teamCount = 1,
  requiredDurationHours = null,
  mode = "inventory",
  claimMode = "open",
  assignedTeams = [],
  timeLabel = null,
  assignmentStatus = null,
  source = "",
  note = "",
}) {
  return Object.freeze({
    id,
    venue,
    location,
    locationKey,
    field,
    date,
    startTime,
    endTime,
    kind,
    approval,
    startIncrementMinutes,
    teamCount,
    requiredDurationHours,
    mode,
    claimMode,
    assignedTeams: Object.freeze(assignedTeams.slice()),
    timeLabel,
    assignmentStatus,
    source,
    note,
  });
}

function practiceTeamSlug(team) {
  return team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function assignedPracticeWindowsForDates({
  dates,
  locationKey,
  venue,
  location,
  field,
  assignmentStatus,
  note,
  sessions,
}) {
  return dates.flatMap((date) => sessions.map((session) => {
    const status = session.assignmentStatus || assignmentStatus;
    const sessionNote = session.note || note;
    return practiceWindow({
      id: `pdf-${locationKey}-${date}-${practiceTeamSlug(session.team)}`,
      locationKey,
      venue,
      location,
      field,
      date,
      startTime: session.startTime,
      endTime: session.endTime,
      kind: "assigned",
      approval: status === "confirmed" || status === "adjusted" ? "confirmed" : "pending",
      startIncrementMinutes: 30,
      teamCount: 1,
      requiredDurationHours: session.requiredDurationHours,
      mode: "assigned",
      claimMode: "assigned",
      assignedTeams: [session.team],
      timeLabel: session.timeLabel,
      assignmentStatus: status,
      source: PRACTICE_TIMES_PDF_SOURCE,
      note: sessionNote,
    });
  }));
}

const SEAFORD_ASSIGNED_LOCATION = Object.freeze({
  locationKey: "seaford",
  venue: "Seaford HS Turf",
  location: "Seaford High School — HS Turf/Track (Football Field)",
  field: "HS Turf/Track (Football Field)",
});

const STIMSON_ASSIGNED_LOCATION = Object.freeze({
  locationKey: "stimson",
  venue: "Stimson Middle School",
  location: "Stimson Middle School — Field",
  field: "Field",
});

const NICKERSON_ASSIGNED_LOCATION = Object.freeze({
  locationKey: "nickerson",
  venue: "Nickerson Field 2",
  location: "Nickerson Beach — Field 2, Lido Beach, NY",
  field: "Field 2",
});

const POINT_LOOKOUT_ASSIGNED_LOCATION = Object.freeze({
  locationKey: "point-lookout",
  venue: "Point Lookout",
  location: "Point Lookout Town Park — Lacrosse Field, Point Lookout, NY",
  field: "Lacrosse Field",
});

const ADJUSTED_SEAFORD_NOTE = "Adjusted to Kevin-approved 7:15–9:15 PM; the PDF listed 7:00–9:00 PM.";
const OUTSIDE_INVENTORY_NOTE = "Listed in the PDF outside the current approved master inventory.";
const ASSIGNED_PDF_NOTE = "Assigned in the Practice Times PDF.";

export const ASSIGNED_PRACTICE_WINDOWS = Object.freeze([
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-08", "2026-09-15", "2026-09-22"],
    assignmentStatus: "adjusted",
    note: ADJUSTED_SEAFORD_NOTE,
    sessions: [
      { team: "2033 Renegades", startTime: "19:15", endTime: "21:15", timeLabel: "7:15 PM–9:15 PM", requiredDurationHours: 2 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-15", "2026-09-22"],
    assignmentStatus: "confirmed",
    note: "Updated by Dan to Tuesdays 7:15–9:00 PM inside the Kevin-approved Seaford field window, replacing Mondays at Point Lookout.",
    sessions: [
      { team: "2033 Storm", startTime: "19:15", endTime: "21:00", timeLabel: "7:15 PM–9:00 PM", requiredDurationHours: 1.75 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-09", "2026-09-16", "2026-09-23"],
    assignmentStatus: "adjusted",
    note: ADJUSTED_SEAFORD_NOTE,
    sessions: [
      { team: "2036 Dawgs", startTime: "19:15", endTime: "21:15", timeLabel: "7:15 PM–9:15 PM", requiredDurationHours: 2 },
      { team: "2035 Bombers", startTime: "19:15", endTime: "21:15", timeLabel: "7:15 PM–9:15 PM", requiredDurationHours: 2 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-09", "2026-09-16", "2026-09-23"],
    assignmentStatus: "confirmed",
    note: "Updated by Dan to Wednesdays 7:15–8:15 PM inside the Kevin-approved Seaford field window.",
    sessions: [
      { team: "2036 Avalanche", startTime: "19:15", endTime: "20:15", timeLabel: "7:15 PM–8:15 PM", requiredDurationHours: 1 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-10", "2026-09-17", "2026-09-24"],
    assignmentStatus: "adjusted",
    note: ADJUSTED_SEAFORD_NOTE,
    sessions: [
      { team: "2032 Riptide", startTime: "19:15", endTime: "21:15", timeLabel: "7:15 PM–9:15 PM", requiredDurationHours: 2 },
      { team: "2031 Cyclones", startTime: "19:15", endTime: "21:15", timeLabel: "7:15 PM–9:15 PM", requiredDurationHours: 2 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-12", "2026-09-19"],
    assignmentStatus: "needs-time",
    note: "The PDF lists a 3:00 PM start but no end time.",
    sessions: [
      { team: "2035 Bombers", startTime: "15:00", endTime: null, timeLabel: "3:00 PM–End time needed", requiredDurationHours: null },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...SEAFORD_ASSIGNED_LOCATION,
    dates: ["2026-09-13", "2026-09-20"],
    assignmentStatus: "pending",
    note: OUTSIDE_INVENTORY_NOTE,
    sessions: [
      { team: "2032 Riptide", startTime: "09:00", endTime: "11:00", timeLabel: "9:00 AM–11:00 AM", requiredDurationHours: 2 },
      { team: "2031 Cyclones", startTime: "08:00", endTime: "09:30", timeLabel: "8:00 AM–9:30 AM", requiredDurationHours: 1.5 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...STIMSON_ASSIGNED_LOCATION,
    dates: ["2026-09-14", "2026-09-21"],
    assignmentStatus: "needs-time",
    note: "The PDF lists 5:45 PM to dark; an exact end time is still needed.",
    sessions: [
      { team: "2034 Venom", startTime: "17:45", endTime: null, timeLabel: "5:45 PM–Dark", requiredDurationHours: null },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...STIMSON_ASSIGNED_LOCATION,
    dates: ["2026-09-13", "2026-09-20"],
    assignmentStatus: "pending",
    note: OUTSIDE_INVENTORY_NOTE,
    sessions: [
      { team: "2030 Rage", startTime: "09:00", endTime: "10:30", timeLabel: "9:00 AM–10:30 AM", requiredDurationHours: 1.5 },
      { team: "2032 Cannons", startTime: "09:00", endTime: "10:30", timeLabel: "9:00 AM–10:30 AM", requiredDurationHours: 1.5 },
      { team: "2028 Black", startTime: "10:30", endTime: "12:00", timeLabel: "10:30 AM–12:00 PM", requiredDurationHours: 1.5 },
      { team: "2031 Carnage", startTime: "10:30", endTime: "12:00", timeLabel: "10:30 AM–12:00 PM", requiredDurationHours: 1.5 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...NICKERSON_ASSIGNED_LOCATION,
    dates: ["2026-09-14", "2026-09-21"],
    assignmentStatus: "confirmed",
    note: ASSIGNED_PDF_NOTE,
    sessions: [
      { team: "2035 Hurricanes", startTime: "17:00", endTime: "18:30", timeLabel: "5:00 PM–6:30 PM", requiredDurationHours: 1.5 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...NICKERSON_ASSIGNED_LOCATION,
    dates: ["2026-09-12", "2026-09-19"],
    assignmentStatus: "confirmed",
    note: ASSIGNED_PDF_NOTE,
    sessions: [
      { team: "2036 Dawgs", startTime: "09:00", endTime: "10:30", timeLabel: "9:00 AM–10:30 AM", requiredDurationHours: 1.5 },
      { team: "2033 Renegades", startTime: "10:30", endTime: "12:30", timeLabel: "10:30 AM–12:30 PM", requiredDurationHours: 2 },
      { team: "2035 Hurricanes", startTime: "09:30", endTime: "11:00", timeLabel: "9:30 AM–11:00 AM", requiredDurationHours: 1.5 },
      { team: "2034 Venom", startTime: "09:00", endTime: "10:30", timeLabel: "9:00 AM–10:30 AM", requiredDurationHours: 1.5 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...NICKERSON_ASSIGNED_LOCATION,
    dates: ["2026-09-12", "2026-09-19"],
    assignmentStatus: "pending",
    note: "Updated by Dan to Saturdays 8:15–9:30 AM; the start is before the current 9:00 AM approved Nickerson window.",
    sessions: [
      { team: "2036 Avalanche", startTime: "08:15", endTime: "09:30", timeLabel: "8:15 AM–9:30 AM", requiredDurationHours: 1.25 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...POINT_LOOKOUT_ASSIGNED_LOCATION,
    dates: ["2026-09-09", "2026-09-16", "2026-09-23"],
    assignmentStatus: "confirmed",
    note: ASSIGNED_PDF_NOTE,
    sessions: [
      { team: "2034 Thunder", startTime: "18:00", endTime: "20:00", timeLabel: "6:00 PM–8:00 PM", requiredDurationHours: 2 },
    ],
  }),
  ...assignedPracticeWindowsForDates({
    ...POINT_LOOKOUT_ASSIGNED_LOCATION,
    dates: ["2026-09-12"],
    assignmentStatus: "confirmed",
    note: ASSIGNED_PDF_NOTE,
    sessions: [
      { team: "2033 Storm", startTime: "08:00", endTime: "10:00", timeLabel: "8:00 AM–10:00 AM", requiredDurationHours: 2 },
      { team: "2034 Thunder", startTime: "08:00", endTime: "10:00", timeLabel: "8:00 AM–10:00 AM", requiredDurationHours: 2 },
    ],
  }),
]);

export const PRACTICE_WINDOWS = Object.freeze([
  ...SEAFORD_DATES.map((date, index) => practiceWindow({
    id: `seaford-${date}`,
    venue: "Seaford HS Turf",
    location: "Seaford High School — HS Turf/Track (Football Field)",
    locationKey: "seaford",
    field: "HS Turf/Track (Football Field)",
    date,
    startTime: "19:15",
    endTime: "21:15",
    kind: "weekday",
    approval: index < 4 ? "confirmed" : "week-by-week",
    claimMode: CLOSED_TO_NEW_PRACTICE_WINDOW_SET.has(`seaford-${date}`) ? "closed-to-new" : "open",
  })),
  ...NICKERSON_WEEKDAY_DATES.map((date) => practiceWindow({
    id: `nickerson-${date}`,
    venue: "Nickerson Field 2",
    location: "Nickerson Beach — Field 2, Lido Beach, NY",
    locationKey: "nickerson",
    field: "Field 2",
    date,
    startTime: "17:00",
    endTime: "18:30",
    kind: "weekday",
    approval: "confirmed",
    claimMode: CLOSED_TO_NEW_PRACTICE_WINDOW_SET.has(`nickerson-${date}`) ? "closed-to-new" : "open",
  })),
  ...NICKERSON_SATURDAY_DATES.map((date) => practiceWindow({
    id: `nickerson-${date}`,
    venue: "Nickerson Field 2",
    location: "Nickerson Beach — Field 2, Lido Beach, NY",
    locationKey: "nickerson",
    field: "Field 2",
    date,
    startTime: "09:00",
    endTime: "13:00",
    kind: "saturday",
    approval: "confirmed",
    claimMode: CLOSED_TO_NEW_PRACTICE_WINDOW_SET.has(`nickerson-${date}`) ? "closed-to-new" : "open",
  })),
  ...POINT_LOOKOUT_WEEKDAY_DATES.map((date) => practiceWindow({
    id: `point-lookout-${date}`,
    venue: "Point Lookout",
    location: "Point Lookout Town Park — Lacrosse Field, Point Lookout, NY",
    locationKey: "point-lookout",
    field: "Lacrosse Field",
    date,
    startTime: "18:00",
    endTime: "20:00",
    kind: "weekday",
    approval: "confirmed",
    claimMode: CLOSED_TO_NEW_PRACTICE_WINDOW_SET.has(`point-lookout-${date}`) ? "closed-to-new" : "open",
  })),
  ...POINT_LOOKOUT_SATURDAY_DATES.map((date) => practiceWindow({
    id: `point-lookout-${date}`,
    venue: "Point Lookout",
    location: "Point Lookout Town Park — Lacrosse Field, Point Lookout, NY",
    locationKey: "point-lookout",
    field: "Lacrosse Field",
    date,
    startTime: "08:00",
    endTime: "10:00",
    kind: "saturday",
    approval: "confirmed",
    claimMode: CLOSED_TO_NEW_PRACTICE_WINDOW_SET.has(`point-lookout-${date}`) ? "closed-to-new" : "open",
  })),
  ...MOMENTUM_ONE_HOUR_DATES.map((date) => practiceWindow({
    id: `momentum-${date}`,
    venue: "Momentum Sports LI",
    location: "10 Dunton Avenue, Deer Park, NY 11729",
    locationKey: "momentum",
    field: "Turf Field",
    date,
    startTime: "08:00",
    endTime: "15:00",
    kind: "weekend",
    approval: "confirmed",
    startIncrementMinutes: 60,
    teamCount: 1,
    requiredDurationHours: 1,
  })),
  ...MOMENTUM_TWO_HOUR_DATES.map((date) => practiceWindow({
    id: `momentum-${date}`,
    venue: "Momentum Sports LI",
    location: "10 Dunton Avenue, Deer Park, NY 11729",
    locationKey: "momentum",
    field: "Turf Field",
    date,
    startTime: "08:00",
    endTime: "15:00",
    kind: "weekend",
    approval: "confirmed",
    startIncrementMinutes: 60,
    teamCount: 2,
    requiredDurationHours: 2,
  })),
  ...ASSIGNED_PRACTICE_WINDOWS,
]);

const PRACTICE_WINDOW_BY_ID = new Map(PRACTICE_WINDOWS.map((window) => [window.id, window]));

export class CalendarApiError extends Error {
  constructor(message, { status = 400, code = "bad_request", snapshot, etag } = {}) {
    super(message);
    this.name = "CalendarApiError";
    this.status = status;
    this.code = code;
    this.snapshot = snapshot;
    this.etag = etag;
  }
}

function suppliedPassword(req, body) {
  return req.headers.get("x-btb-calendar-key") || body?.password || "";
}

export function calendarOriginsForRequest(req) {
  const origin = req.headers.get("origin") || "";
  let candidate = origin;

  if (!candidate) {
    const referer = req.headers.get("referer") || "";
    try {
      candidate = referer ? new URL(referer).origin : "";
    } catch {
      candidate = "";
    }
  }

  return DEPLOY_PREVIEW_ORIGIN.test(candidate)
    ? ALLOWED_ORIGINS.concat(candidate)
    : ALLOWED_ORIGINS;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: HEADERS });
}

function nowIso(now = () => new Date()) {
  const value = typeof now === "function" ? now() : now;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid server timestamp");
  return date.toISOString();
}

function timeToMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeStartTime(value, window) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const plainMinutes = timeToMinutes(trimmed);
  if (plainMinutes !== null) return { date: window.date, time: trimmed, minutes: plainMinutes };

  const iso = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.exec(trimmed);
  if (!iso || iso[1] !== window.date) return null;
  const isoMinutes = timeToMinutes(iso[2]);
  return isoMinutes === null ? null : { date: iso[1], time: iso[2], minutes: isoMinutes };
}

function normalizeCoach(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function coachKey(value) {
  return normalizeCoach(value).toLocaleLowerCase("en-US");
}

function intervalsOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

function teamValue(value) {
  if (typeof value !== "string") return "";
  const team = value.trim();
  return Object.prototype.hasOwnProperty.call(TEAM_ALIASES, team)
    ? TEAM_ALIASES[team]
    : team;
}

function bookingTeams(booking) {
  const candidates = [
    teamValue(booking?.team),
    ...(Array.isArray(booking?.teams) ? booking.teams.map(teamValue) : []),
    teamValue(booking?.secondTeam),
  ];
  return candidates.filter((team, index) => team && candidates.indexOf(team) === index);
}

function storedBookingReferencesRetiredTeam(booking) {
  if (!booking || typeof booking !== "object" || Array.isArray(booking)) return false;
  const candidates = [
    booking.team,
    ...(Array.isArray(booking.teams) ? booking.teams : []),
    booking.secondTeam,
  ];
  return candidates.some((team) => (
    typeof team === "string" && RETIRED_TEAM_SET.has(team.trim())
  ));
}

function canonicalizeStoredBookingTeamAliases(booking) {
  if (!booking || typeof booking !== "object" || Array.isArray(booking)) return booking;
  const normalized = { ...booking };
  if (typeof normalized.team === "string") normalized.team = teamValue(normalized.team);
  if (typeof normalized.secondTeam === "string") normalized.secondTeam = teamValue(normalized.secondTeam);
  if (Array.isArray(normalized.teams)) {
    normalized.teams = normalized.teams.map((team) => (
      typeof team === "string" ? teamValue(team) : team
    ));
  }
  return normalized;
}

function normalizeBookingTeams(input, window) {
  if (input.teams !== undefined && !Array.isArray(input.teams)) {
    throw new CalendarApiError("Practice teams must be a list", { code: "invalid_teams" });
  }
  if ((input.team !== undefined && typeof input.team !== "string") ||
      (input.secondTeam !== undefined && input.secondTeam !== null && typeof input.secondTeam !== "string") ||
      (Array.isArray(input.teams) && input.teams.some((team) => typeof team !== "string"))) {
    throw new CalendarApiError("Practice teams must be names", { code: "invalid_teams" });
  }
  const listedTeams = Array.isArray(input.teams) ? input.teams.map(teamValue) : [];
  if (listedTeams.some((team) => !team) || listedTeams.length > 2) {
    throw new CalendarApiError("Practice must include one or two valid teams", { code: "invalid_teams" });
  }

  const primaryField = teamValue(input.team);
  const secondField = teamValue(input.secondTeam);
  if ((primaryField && listedTeams[0] && primaryField !== listedTeams[0]) ||
      (secondField && listedTeams[1] && secondField !== listedTeams[1])) {
    throw new CalendarApiError("Practice team fields do not match", { code: "invalid_teams" });
  }

  const primary = primaryField || listedTeams[0] || "";
  const second = secondField || listedTeams[1] || "";
  const teams = [primary, second].filter(Boolean);
  if (!teams.length || teams.some((team) => !KNOWN_TEAM_SET.has(team))) {
    throw new CalendarApiError("Unknown BTB team", { code: "invalid_team" });
  }
  if (new Set(teams).size !== teams.length) {
    throw new CalendarApiError("Momentum sharing requires two distinct teams", { code: "invalid_teams" });
  }
  if (teams.length !== window.teamCount) {
    const message = window.teamCount === 2
      ? "This Momentum window requires exactly two teams"
      : "This practice window requires exactly one team";
    throw new CalendarApiError(message, { code: "invalid_team_count" });
  }
  return teams;
}

function normalizeAssignedBookingTeams(input, window) {
  const canonicalTeams = window.assignedTeams.slice();
  const hasSuppliedTeams = Object.prototype.hasOwnProperty.call(input, "team") ||
    Object.prototype.hasOwnProperty.call(input, "teams") ||
    Object.prototype.hasOwnProperty.call(input, "secondTeam");
  if (!hasSuppliedTeams) return canonicalTeams;

  if (input.teams !== undefined && !Array.isArray(input.teams)) {
    throw new CalendarApiError("Assigned practice teams cannot be changed", { code: "invalid_teams" });
  }
  if ((input.team !== undefined && typeof input.team !== "string") ||
      (input.secondTeam !== undefined && input.secondTeam !== null && typeof input.secondTeam !== "string") ||
      (Array.isArray(input.teams) && input.teams.some((team) => typeof team !== "string"))) {
    throw new CalendarApiError("Assigned practice teams cannot be changed", { code: "invalid_teams" });
  }

  const suppliedTeams = bookingTeams(input);
  if (suppliedTeams.length !== canonicalTeams.length ||
      suppliedTeams.some((team, index) => team !== canonicalTeams[index])) {
    throw new CalendarApiError("Assigned practice teams cannot be changed", { code: "invalid_teams" });
  }
  return canonicalTeams;
}

export function practiceBookingsConflict(first, second) {
  if (!first || !second) return false;
  const sameWindow = Boolean(first.windowId) && first.windowId === second.windowId;
  const authoritativeWindow = sameWindow ? PRACTICE_WINDOW_BY_ID.get(first.windowId) : null;
  if (sameWindow && authoritativeWindow?.mode === "assigned") return true;
  if (first.date !== second.date) return false;
  const firstStart = timeToMinutes(first.startTime);
  const secondStart = timeToMinutes(second.startTime);
  const firstWindow = PRACTICE_WINDOW_BY_ID.get(first.windowId);
  const secondWindow = PRACTICE_WINDOW_BY_ID.get(second.windowId);
  const firstEnd = timeToMinutes(first.endTime) ?? (
    firstWindow?.mode === "assigned" && firstWindow.endTime === null
      ? 24 * 60
      : firstStart + Number(first.durationHours) * 60
  );
  const secondEnd = timeToMinutes(second.endTime) ?? (
    secondWindow?.mode === "assigned" && secondWindow.endTime === null
      ? 24 * 60
      : secondStart + Number(second.durationHours) * 60
  );
  if (![firstStart, firstEnd, secondStart, secondEnd].every(Number.isFinite)) return false;
  if (!intervalsOverlap(firstStart, firstEnd, secondStart, secondEnd)) return false;

  const firstTeams = bookingTeams(first);
  const secondTeams = bookingTeams(second);
  return sameWindow ||
    firstTeams.some((team) => secondTeams.includes(team)) ||
    coachKey(first.coach) === coachKey(second.coach);
}

function assertNoBookingConflict(existingBookings, candidate) {
  const conflict = existingBookings.find((booking) => practiceBookingsConflict(booking, candidate));
  if (!conflict) return;

  let reason = "That practice window is already claimed for the selected time.";
  const sharedTeam = bookingTeams(candidate).find((team) => bookingTeams(conflict).includes(team));
  if (conflict.windowId !== candidate.windowId && sharedTeam) {
    reason = `${sharedTeam} already has an overlapping practice.`;
  } else if (conflict.windowId !== candidate.windowId && coachKey(conflict.coach) === coachKey(candidate.coach)) {
    reason = `${candidate.coach} already has an overlapping practice.`;
  }
  throw new CalendarApiError(reason, { status: 409, code: "practice_overlap" });
}

function normalizeBooking(input, { requireId = false, id, createdAt } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new CalendarApiError("Bad practice booking", { code: "invalid_booking" });
  }

  const windowId = typeof input.windowId === "string" ? input.windowId.trim() : "";
  const window = PRACTICE_WINDOW_BY_ID.get(windowId);
  if (!window) {
    throw new CalendarApiError("Unknown or inactive practice window", { code: "invalid_window" });
  }

  if (!requireId && window.claimMode === "closed-to-new") {
    throw new CalendarApiError("This master window has been replaced by assigned team practices", {
      status: 409,
      code: "window_closed",
    });
  }

  const assigned = window.claimMode === "assigned";
  const teams = assigned
    ? normalizeAssignedBookingTeams(input, window)
    : normalizeBookingTeams(input, window);

  const coach = normalizeCoach(input.coach);
  if (!coach || coach.length > 120) {
    throw new CalendarApiError("Coach name is required", { code: "invalid_coach" });
  }

  const windowStart = timeToMinutes(window.startTime);
  const windowEnd = timeToMinutes(window.endTime);
  let start;
  let durationHours;
  let endMinutes;

  if (assigned) {
    if (Object.prototype.hasOwnProperty.call(input, "startTime")) {
      const suppliedStart = normalizeStartTime(input.startTime, window);
      if (!suppliedStart || suppliedStart.time !== window.startTime) {
        throw new CalendarApiError("Assigned practice start time cannot be changed", { code: "invalid_start" });
      }
    }
    if (Object.prototype.hasOwnProperty.call(input, "durationHours") &&
        input.durationHours !== window.requiredDurationHours) {
      throw new CalendarApiError("Assigned practice duration cannot be changed", { code: "invalid_duration" });
    }
    if (Object.prototype.hasOwnProperty.call(input, "endTime") && input.endTime !== window.endTime) {
      throw new CalendarApiError("Assigned practice end time cannot be changed", { code: "invalid_end" });
    }

    start = normalizeStartTime(window.startTime, window);
    durationHours = window.requiredDurationHours;
    endMinutes = windowEnd;
    if (!start || !Number.isFinite(windowStart) ||
        (window.endTime !== null && (!Number.isFinite(windowEnd) ||
          !Number.isFinite(durationHours) || durationHours <= 0 ||
          start.minutes + durationHours * 60 !== windowEnd)) ||
        (window.endTime === null && durationHours !== null)) {
      throw new CalendarApiError("Assigned practice time is invalid", { code: "invalid_window" });
    }
  } else {
    durationHours = input.durationHours;
    if (!VALID_DURATIONS.has(durationHours)) {
      throw new CalendarApiError("Practice duration must be 1, 1.5, or 2 hours", { code: "invalid_duration" });
    }
    if (window.requiredDurationHours !== null && durationHours !== window.requiredDurationHours) {
      throw new CalendarApiError(
        `This Momentum window requires a ${window.requiredDurationHours}-hour practice`,
        { code: "invalid_duration" },
      );
    }

    start = normalizeStartTime(input.startTime, window);
    if (!start) {
      throw new CalendarApiError("Practice start time is invalid", { code: "invalid_start" });
    }

    endMinutes = start.minutes + durationHours * 60;
    if (start.minutes < windowStart || endMinutes > windowEnd) {
      throw new CalendarApiError("Practice must fit fully inside the field window", { code: "outside_window" });
    }
    // Alignment is relative to the field window. Seaford begins at 19:15, so
    // valid starts there are 19:15, 19:45, 20:15, etc.
    if ((start.minutes - windowStart) % window.startIncrementMinutes !== 0) {
      throw new CalendarApiError(
        `Practice starts must use ${window.startIncrementMinutes}-minute increments`,
        { code: "invalid_start" },
      );
    }
  }

  const bookingId = requireId
    ? (typeof input.id === "string" ? input.id.trim() : "")
    : id;
  if (!bookingId) {
    throw new CalendarApiError("Practice booking ID is required", { code: "invalid_booking" });
  }

  return {
    id: bookingId,
    windowId,
    venue: window.venue,
    location: window.location,
    date: window.date,
    team: teams[0],
    teams,
    secondTeam: teams[1] || null,
    coach,
    startTime: minutesToTime(start.minutes),
    endTime: endMinutes === null ? null : minutesToTime(endMinutes),
    durationHours,
    createdAt: requireId && typeof input.createdAt === "string" && input.createdAt
      ? input.createdAt
      : createdAt,
  };
}

export function validatePracticeBookings(bookings) {
  if (!Array.isArray(bookings)) {
    throw new CalendarApiError("Bad practice bookings", { code: "invalid_bookings" });
  }

  const normalized = [];
  const ids = new Set();
  for (const booking of bookings) {
    const clean = normalizeBooking(booking, { requireId: true });
    if (ids.has(clean.id)) {
      throw new CalendarApiError("Duplicate practice booking ID", { code: "invalid_booking" });
    }
    assertNoBookingConflict(normalized, clean);
    ids.add(clean.id);
    normalized.push(clean);
  }
  return normalized;
}

export function normalizeSnapshot(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const storedBookings = Array.isArray(source.practiceBookings)
    ? source.practiceBookings
      .filter((booking) => !storedBookingReferencesRetiredTeam(booking))
      .map(canonicalizeStoredBookingTeamAliases)
    : [];
  return {
    version: Number.isSafeInteger(source.version) && source.version >= 0 ? source.version : 0,
    events: Array.isArray(source.events) ? source.events : [],
    practiceBookings: storedBookings,
    savedAt: typeof source.savedAt === "string" ? source.savedAt : null,
  };
}

export async function readCalendarSnapshot(store) {
  const entry = await store.getWithMetadata(SNAPSHOT_KEY, { type: "json" });
  return {
    exists: Boolean(entry),
    snapshot: normalizeSnapshot(entry?.data),
    etag: entry?.etag || null,
  };
}

async function conditionalWrite(store, current, snapshot) {
  if (current.exists && !current.etag) {
    throw new Error("Existing calendar snapshot is missing an ETag");
  }
  return store.setJSON(
    SNAPSHOT_KEY,
    snapshot,
    current.exists ? { onlyIfMatch: current.etag } : { onlyIfNew: true },
  );
}

async function currentAfterMiss(store) {
  const latest = await readCalendarSnapshot(store);
  return { snapshot: latest.snapshot, etag: latest.etag };
}

export async function mutateSnapshotAtomically(store, mutator, {
  now = () => new Date(),
  maxAttempts = MAX_ATOMIC_ATTEMPTS,
} = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const current = await readCalendarSnapshot(store);
    const currentBookings = validatePracticeBookings(current.snapshot.practiceBookings);
    const candidate = await mutator({
      ...current.snapshot,
      practiceBookings: currentBookings,
    });

    if (!candidate || !Array.isArray(candidate.events) || !Array.isArray(candidate.practiceBookings)) {
      throw new CalendarApiError("Bad snapshot", { code: "invalid_snapshot" });
    }

    const saved = {
      version: current.snapshot.version + 1,
      events: candidate.events,
      practiceBookings: validatePracticeBookings(candidate.practiceBookings),
      savedAt: nowIso(now),
    };
    const write = await conditionalWrite(store, current, saved);
    if (write.modified) {
      return { snapshot: saved, etag: write.etag || null };
    }
  }

  const latest = await currentAfterMiss(store);
  throw new CalendarApiError("Practice schedule changed. Please try again.", {
    status: 409,
    code: "contention",
    ...latest,
  });
}

export async function claimPractice(store, input, {
  now = () => new Date(),
  idFactory = () => `practice-${randomUUID()}`,
  maxAttempts = MAX_ATOMIC_ATTEMPTS,
} = {}) {
  const createdAt = nowIso(now);
  const booking = normalizeBooking(input, {
    id: idFactory(),
    createdAt,
  });

  const result = await mutateSnapshotAtomically(store, (snapshot) => {
    assertNoBookingConflict(snapshot.practiceBookings, booking);
    return {
      ...snapshot,
      practiceBookings: snapshot.practiceBookings.concat(booking),
    };
  }, { now: createdAt, maxAttempts });

  return { ...result, booking };
}

export async function releasePractice(store, bookingId, options = {}) {
  const id = typeof bookingId === "string" ? bookingId.trim() : "";
  if (!id) {
    throw new CalendarApiError("Practice booking ID is required", { code: "invalid_booking" });
  }

  return mutateSnapshotAtomically(store, (snapshot) => {
    if (!snapshot.practiceBookings.some((booking) => booking.id === id)) {
      throw new CalendarApiError("Practice booking was not found", {
        status: 404,
        code: "booking_not_found",
      });
    }
    return {
      ...snapshot,
      practiceBookings: snapshot.practiceBookings.filter((booking) => booking.id !== id),
    };
  }, options);
}

export async function saveCalendarSnapshot(store, incoming, etag, { now = () => new Date() } = {}) {
  if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.events)) {
    throw new CalendarApiError("Bad snapshot", { code: "invalid_snapshot" });
  }

  const current = await readCalendarSnapshot(store);
  const includesBookings = Object.prototype.hasOwnProperty.call(incoming, "practiceBookings");
  const legacyEventOnlySave = !includesBookings && !etag;
  if ((current.exists && !legacyEventOnlySave && (!etag || etag !== current.etag)) ||
      (!current.exists && etag)) {
    throw new CalendarApiError("Calendar changed on another device. Reload and try again.", {
      status: 409,
      code: "stale_etag",
      snapshot: current.snapshot,
      etag: current.etag,
    });
  }

  // A legacy browser only sends `{ events }`. Preserve the latest claims in
  // that case; a modern client may send the validated booking array explicitly.
  const requestedBookings = includesBookings
    ? incoming.practiceBookings
    : current.snapshot.practiceBookings;
  const saved = {
    version: current.snapshot.version + 1,
    events: incoming.events,
    practiceBookings: validatePracticeBookings(requestedBookings),
    savedAt: nowIso(now),
  };

  const write = await conditionalWrite(store, current, saved);
  if (!write.modified) {
    const latest = await currentAfterMiss(store);
    throw new CalendarApiError("Calendar changed on another device. Reload and try again.", {
      status: 409,
      code: "stale_etag",
      ...latest,
    });
  }
  return { snapshot: saved, etag: write.etag || null };
}

function errorPayload(error) {
  const payload = { error: error.message, code: error.code };
  if (error.snapshot !== undefined) payload.snapshot = error.snapshot;
  if (error.etag !== undefined) payload.etag = error.etag;
  return payload;
}

export function createHandler({ authorize = authorizeIdentity, getBlobStore = getStore } = {}) {
  return (req) => handleRequest(req, { authorize, getBlobStore });
}

async function handleRequest(req, { authorize, getBlobStore }) {
  const blocked = guardRequest(req, {
    limit: 60,
    windowMs: 60_000,
    allowedOrigins: calendarOriginsForRequest(req),
  });
  if (blocked) return blocked;

  const expected = process.env.TOURNAMENT_CALENDAR_PASSWORD;

  let body = null;
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Bad request" }, 400);
    }
  }

  const passwordMatches = Boolean(expected) && suppliedPassword(req, body) === expected;
  if (!passwordMatches) {
    const identity = await authorize(req, ["owner"]);
    if (!identity.ok) {
      if (!expected) {
        console.error("TOURNAMENT_CALENDAR_PASSWORD is not set");
        return jsonResponse({ error: "Calendar store is not configured" }, 500);
      }
      return jsonResponse({ error: "Wrong password" }, 401);
    }
  }

  const store = getBlobStore(STORE_NAME, { consistency: "strong" });

  try {
    if (req.method === "GET" || (req.method === "POST" && body?.action === "load")) {
      const current = await readCalendarSnapshot(store);
      return jsonResponse({ snapshot: current.snapshot, etag: current.etag });
    }

    if (req.method === "POST" && body?.action === "save") {
      const result = await saveCalendarSnapshot(store, body.snapshot, body.etag);
      return jsonResponse({ ok: true, ...result });
    }

    if (req.method === "POST" && body?.action === "claimPractice") {
      const result = await claimPractice(store, body.booking);
      return jsonResponse({ ok: true, ...result });
    }

    if (req.method === "POST" && body?.action === "releasePractice") {
      const result = await releasePractice(store, body.bookingId);
      return jsonResponse({ ok: true, ...result });
    }

    return jsonResponse({ error: "Unsupported action" }, 405);
  } catch (error) {
    if (error instanceof CalendarApiError) {
      return jsonResponse(errorPayload(error), error.status);
    }
    console.error("tournament-calendar failed", error);
    return jsonResponse({ error: "Calendar store is unavailable" }, 500);
  }
}

export default createHandler();
