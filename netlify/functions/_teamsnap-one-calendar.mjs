import { createHash } from "node:crypto";

const FEED_ENV_KEY = "TEAMSNAP_ONE_CALENDAR_URL";
const FEED_HOST = "calendar-api.teamsnap.com";
const FEED_PATH = "/v1/user.ics";
const DEFAULT_TIME_ZONE = "America/New_York";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1_000;
const MAX_FEED_BYTES = 5 * 1024 * 1024;
const DEFAULT_CALENDAR_NAME = "TeamSnap ONE Schedule";

export const TEAMSNAP_ONE_TEAMS = Object.freeze([
  "2028 Black",
  "2030 Rage",
  "2031 Carnage",
  "2031 Cyclones",
  "2032 Cannons",
  "2032 Riptide",
  "2033 Renegades",
  "2033 Storm",
  "2034 Thunder",
  "2034 Venom",
  "2035 Bombers",
  "2035 Hurricanes",
  "2036 Avalanche",
  "2036 Dawgs",
  "2037 Supernova",
  "2037 Wolves",
]);

const TEAM_MATCHERS = TEAMSNAP_ONE_TEAMS
  .map((team) => ({
    team,
    matcher: new RegExp(`\\b${team.split(/\\s+/).map(escapeRegExp).join("[\\s_-]+")}\\b`, "i"),
  }))
  .sort((left, right) => right.team.length - left.team.length);

let calendarCache = null;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : new Date();
}

function clone(value) {
  return structuredClone(value);
}

function parseFeedUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    if (url.hostname.toLowerCase() !== FEED_HOST) return null;
    if (url.pathname !== FEED_PATH) return null;
    if (url.username || url.password || url.hash) return null;
    if (url.port && url.port !== "443") return null;
    return url;
  } catch {
    return null;
  }
}

export function isValidTeamSnapOneCalendarUrl(value) {
  return parseFeedUrl(value) !== null;
}

function unfoldCalendarLines(calendarText) {
  return calendarText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

export function unescapeIcsText(value = "") {
  return String(value).replace(/\\([nN,;\\])/g, (_match, escaped) => {
    if (escaped === "n" || escaped === "N") return "\n";
    return escaped;
  });
}

function parsePropertyLine(line) {
  const colonIndex = line.indexOf(":");
  if (colonIndex < 1) return null;

  const property = line.slice(0, colonIndex);
  const segments = property.split(";");
  const name = segments.shift().toUpperCase();
  const params = {};

  for (const segment of segments) {
    const equalsIndex = segment.indexOf("=");
    if (equalsIndex < 1) continue;
    const key = segment.slice(0, equalsIndex).toUpperCase();
    const rawValue = segment.slice(equalsIndex + 1);
    params[key] = rawValue.replace(/^"|"$/g, "");
  }

  return { name, params, value: line.slice(colonIndex + 1) };
}

function datePartsToIso(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function timePartsToIso(parts) {
  return `${parts.hour}:${parts.minute}`;
}

function zonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return parts;
}

function localDateTimeToDate(components, timeZone) {
  const desiredUtc = Date.UTC(
    components.year,
    components.month - 1,
    components.day,
    components.hour,
    components.minute,
    components.second,
  );
  let candidateMs = desiredUtc;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rendered = zonedParts(new Date(candidateMs), timeZone);
    const renderedUtc = Date.UTC(
      Number(rendered.year),
      Number(rendered.month) - 1,
      Number(rendered.day),
      Number(rendered.hour),
      Number(rendered.minute),
      Number(rendered.second),
    );
    candidateMs += desiredUtc - renderedUtc;
  }

  return new Date(candidateMs);
}

function parseDateTimeProperty(property, defaultTimeZone) {
  if (!property) return null;
  const rawValue = property.value.trim();
  const isDateOnly = property.params.VALUE?.toUpperCase() === "DATE" || /^\d{8}$/.test(rawValue);

  if (isDateOnly) {
    const match = /^(\d{4})(\d{2})(\d{2})$/.exec(rawValue);
    if (!match) return null;
    const [, year, month, day] = match;
    return {
      allDay: true,
      date: `${year}-${month}-${day}`,
      dateTime: null,
      timeZone: null,
    };
  }

  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z|[+-]\d{4})?$/.exec(rawValue);
  if (!match) return null;

  const components = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0),
  };
  const offset = match[7];
  let dateTime;

  if (offset === "Z") {
    dateTime = new Date(Date.UTC(
      components.year,
      components.month - 1,
      components.day,
      components.hour,
      components.minute,
      components.second,
    ));
  } else if (offset) {
    const sign = offset.startsWith("-") ? -1 : 1;
    const offsetMinutes = sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(3, 5)));
    dateTime = new Date(Date.UTC(
      components.year,
      components.month - 1,
      components.day,
      components.hour,
      components.minute - offsetMinutes,
      components.second,
    ));
  } else {
    const timeZone = property.params.TZID || defaultTimeZone;
    try {
      dateTime = localDateTimeToDate(components, timeZone);
    } catch {
      dateTime = localDateTimeToDate(components, defaultTimeZone);
    }
  }

  if (!Number.isFinite(dateTime.getTime())) return null;
  return {
    allDay: false,
    date: null,
    dateTime,
    timeZone: property.params.TZID || (offset === "Z" ? "UTC" : defaultTimeZone),
  };
}

function parseDurationMinutes(description, durationProperty) {
  if (durationProperty) {
    const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(durationProperty.trim());
    if (match) {
      const minutes = Number(match[1] || 0) * 24 * 60
        + Number(match[2] || 0) * 60
        + Number(match[3] || 0)
        + Math.round(Number(match[4] || 0) / 60);
      if (minutes > 0) return minutes;
    }
  }

  const durationLine = String(description).match(
    /(?:^|\n)\s*Duration:\s*(?:(\d+(?:\.\d+)?)\s*(?:hours?|hrs?))?(?:\s*(\d+)\s*(?:minutes?|mins?))?\s*(?:\n|$)/i,
  );
  if (!durationLine) return null;
  const minutes = Math.round(Number(durationLine[1] || 0) * 60 + Number(durationLine[2] || 0));
  return minutes > 0 ? minutes : null;
}

function findFirstTeam(value) {
  const haystack = String(value || "");
  let firstMatch = null;

  for (const candidate of TEAM_MATCHERS) {
    const match = candidate.matcher.exec(haystack);
    if (!match) continue;
    if (!firstMatch || match.index < firstMatch.index
        || (match.index === firstMatch.index && match[0].length > firstMatch.length)) {
      firstMatch = { candidate, index: match.index, length: match[0].length };
    }
  }

  return firstMatch?.candidate || null;
}

function findTeam(summary, description) {
  return findFirstTeam(summary) || findFirstTeam(description);
}

function normalizeSummary(summary) {
  return unescapeIcsText(summary).replace(/\s+/g, " ").trim();
}

function eventKind(summary) {
  if (/^Practice\s*:/i.test(summary)) return "practice";
  if (/^Game\s*:/i.test(summary)) return "game";
  return "event";
}

function usefulTitle(summary, kind, teamMatch) {
  let title = summary.replace(/^(?:Practice|Game)\s*:\s*/i, "");
  title = title.replace(teamMatch.matcher, "").replace(/^[\s:|\-–—]+|[\s:|\-–—]+$/g, "").trim();

  const mascot = teamMatch.team.replace(/^\d{4}\s+/, "");
  const redundantTeamLabel = new RegExp(`^BTB[\\s_-]+${escapeRegExp(mascot)}(?:\\b|$)`, "i");
  title = title.replace(redundantTeamLabel, "").replace(/^[\s:|\-–—]+/, "").trim();

  if (title) return title;
  if (kind === "practice") return "Practice";
  if (kind === "game") return "Game";
  return "Team Event";
}

function normalizedStatus(value) {
  const status = String(value || "CONFIRMED").trim().toUpperCase();
  if (status === "CANCELLED" || status === "CANCELED") return "cancelled";
  return "confirmed";
}

function extractLink(description, urlProperty) {
  const directUrl = unescapeIcsText(urlProperty || "").trim();
  if (/^https:\/\//i.test(directUrl)) return directUrl;
  const linkLine = String(description).match(/(?:^|\n)\s*Link:\s*(https:\/\/\S+)/i);
  return linkLine ? linkLine[1].trim() : null;
}

function linkIdentity(value) {
  if (!value) return null;
  return `link-${createHash("sha256").update(value).digest("hex").slice(0, 20)}`;
}

function cleanNotes(description, summary) {
  return String(description)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.toLowerCase() !== summary.toLowerCase())
    .filter((line) => !/^(?:Location|Duration|Link):/i.test(line))
    .join("\n");
}

function parseRawEvents(calendarText) {
  const lines = unfoldCalendarLines(calendarText);
  const rawEvents = [];
  let currentEvent = null;

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    if (upperLine === "BEGIN:VEVENT") {
      currentEvent = {};
      continue;
    }
    if (upperLine === "END:VEVENT") {
      if (currentEvent) rawEvents.push(currentEvent);
      currentEvent = null;
      continue;
    }
    if (!currentEvent) continue;

    const property = parsePropertyLine(line);
    if (!property) continue;
    if (!currentEvent[property.name]) currentEvent[property.name] = [];
    currentEvent[property.name].push(property);
  }

  return rawEvents;
}

function firstProperty(rawEvent, name) {
  return rawEvent[name]?.[0] || null;
}

function propertyValue(rawEvent, name) {
  return firstProperty(rawEvent, name)?.value || "";
}

function timestampValue(rawEvent, name, timeZone) {
  const parsed = parseDateTimeProperty(firstProperty(rawEvent, name), timeZone);
  return parsed && !parsed.allDay ? parsed.dateTime.toISOString() : null;
}

function normalizeEvent(rawEvent, index, timeZone) {
  const summary = normalizeSummary(propertyValue(rawEvent, "SUMMARY"));
  const description = unescapeIcsText(propertyValue(rawEvent, "DESCRIPTION")).trim();
  const teamMatch = findTeam(summary, description);
  if (!summary || !teamMatch) return null;

  const start = parseDateTimeProperty(firstProperty(rawEvent, "DTSTART"), timeZone);
  if (!start) return null;

  const end = parseDateTimeProperty(firstProperty(rawEvent, "DTEND"), timeZone);
  const kind = eventKind(summary);
  const status = normalizedStatus(propertyValue(rawEvent, "STATUS"));
  const location = unescapeIcsText(propertyValue(rawEvent, "LOCATION")).replace(/\s+/g, " ").trim();
  let durationMinutes = parseDurationMinutes(description, propertyValue(rawEvent, "DURATION"));
  let sortStart;
  let startDate;
  let endDate = null;
  let startTime = null;
  let endTime = null;

  if (start.allDay) {
    startDate = start.date;
    endDate = start.date;
    if (end?.allDay && end.date > start.date) {
      const exclusiveEnd = new Date(`${end.date}T00:00:00.000Z`);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() - 1);
      endDate = exclusiveEnd.toISOString().slice(0, 10);
    }
    sortStart = `${startDate}T00:00:00.000Z`;
  } else {
    sortStart = start.dateTime.toISOString();
    let endDateTime = end && !end.allDay ? end.dateTime : null;
    if (endDateTime && endDateTime > start.dateTime) {
      durationMinutes = Math.round((endDateTime.getTime() - start.dateTime.getTime()) / 60_000);
    } else if (durationMinutes) {
      endDateTime = new Date(start.dateTime.getTime() + durationMinutes * 60_000);
    }

    const localStart = zonedParts(start.dateTime, timeZone);
    startDate = datePartsToIso(localStart);
    endDate = startDate;
    startTime = timePartsToIso(localStart);
    if (endDateTime) {
      const localEnd = zonedParts(endDateTime, timeZone);
      endDate = datePartsToIso(localEnd);
      endTime = timePartsToIso(localEnd);
    }
  }

  const uid = unescapeIcsText(propertyValue(rawEvent, "UID")).trim();
  const fallbackUid = encodeURIComponent(`${startDate}:${startTime || "all-day"}:${teamMatch.team}:${summary}:${index}`);
  const recurrence = parseDateTimeProperty(firstProperty(rawEvent, "RECURRENCE-ID"), timeZone);
  const instanceStart = recurrence
    ? (recurrence.allDay ? `${recurrence.date}T00:00:00.000Z` : recurrence.dateTime.toISOString())
    : sortStart;
  const deepLink = extractLink(description, propertyValue(rawEvent, "URL"));
  // Expanded TeamSnap series omit RECURRENCE-ID; their occurrence link stays stable when DTSTART moves.
  const instanceKey = recurrence ? instanceStart : linkIdentity(deepLink);
  const title = usefulTitle(summary, kind, teamMatch);
  const updatedAt = timestampValue(rawEvent, "LAST-MODIFIED", timeZone)
    || timestampValue(rawEvent, "DTSTAMP", timeZone);

  return {
    id: `teamsnap-one:${uid || fallbackUid}`,
    uid: uid || null,
    provider: "teamsnap-one",
    team: teamMatch.team,
    kind,
    title,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay: start.allDay,
    durationMinutes,
    location: location || null,
    description: cleanNotes(description, summary) || null,
    deepLink,
    status,
    updatedAt,
    hasRecurrenceId: Boolean(recurrence),
    instanceKey,
    sortStart,
  };
}

export function parseTeamSnapOneCalendar(calendarText, {
  timeZone = DEFAULT_TIME_ZONE,
  recurringUids = new Set(),
} = {}) {
  if (typeof calendarText !== "string" || !/BEGIN:VCALENDAR/i.test(calendarText)) {
    throw new TypeError("Invalid TeamSnap ONE calendar response.");
  }

  const normalized = parseRawEvents(calendarText)
    .map((rawEvent, index) => normalizeEvent(rawEvent, index, timeZone))
    .filter(Boolean);
  const uidCounts = new Map();
  for (const event of normalized) {
    if (event.uid) uidCounts.set(event.uid, (uidCounts.get(event.uid) || 0) + 1);
  }
  const recurringUidRegistry = recurringUids instanceof Set ? recurringUids : null;
  const knownRecurringUids = new Set(recurringUidRegistry || []);
  for (const event of normalized) {
    if (event.uid && (event.hasRecurrenceId || uidCounts.get(event.uid) > 1)) {
      knownRecurringUids.add(event.uid);
    }
  }
  const recurringInstanceKeys = new Set();
  for (const event of normalized) {
    if (!event.uid || !knownRecurringUids.has(event.uid) || event.hasRecurrenceId) continue;
    if (!event.instanceKey) {
      throw new TypeError("A recurring TeamSnap ONE event is missing its stable instance link.");
    }
    const registryKey = `${event.uid}\n${event.instanceKey}`;
    if (recurringInstanceKeys.has(registryKey)) {
      throw new TypeError("Recurring TeamSnap ONE events share the same instance link.");
    }
    recurringInstanceKeys.add(registryKey);
  }
  for (const uid of knownRecurringUids) recurringUidRegistry?.add(uid);
  const uniqueEvents = new Map();
  for (const event of normalized) {
    const needsInstanceId = event.uid && knownRecurringUids.has(event.uid);
    const id = needsInstanceId ? `${event.id}:${encodeURIComponent(event.instanceKey)}` : event.id;
    uniqueEvents.set(id, { ...event, id });
  }

  return [...uniqueEvents.values()]
    .sort((left, right) => left.sortStart.localeCompare(right.sortStart) || left.team.localeCompare(right.team))
    .map(({ hasRecurrenceId: _hasRecurrenceId, instanceKey: _instanceKey, sortStart: _sortStart, ...event }) => event);
}

function calendarName(calendarText) {
  for (const line of unfoldCalendarLines(calendarText)) {
    const property = parsePropertyLine(line);
    if (property?.name === "X-WR-CALNAME") {
      return unescapeIcsText(property.value).replace(/\s+/g, " ").trim() || DEFAULT_CALENDAR_NAME;
    }
  }
  return DEFAULT_CALENDAR_NAME;
}

function eventCounts(events) {
  return {
    total: events.length,
    active: events.filter((event) => event.status !== "cancelled").length,
    cancelled: events.filter((event) => event.status === "cancelled").length,
    practices: events.filter((event) => event.kind === "practice" && event.status !== "cancelled").length,
    games: events.filter((event) => event.kind === "game" && event.status !== "cancelled").length,
    other: events.filter((event) => event.kind === "event" && event.status !== "cancelled").length,
  };
}

function unavailablePayload({ configured, code = null }) {
  return {
    configured,
    available: false,
    stale: false,
    source: "TeamSnap ONE",
    syncedAt: null,
    calendarName: DEFAULT_CALENDAR_NAME,
    events: [],
    counts: eventCounts([]),
    error: code ? {
      code,
      message: code === "invalid_configuration"
        ? "The TeamSnap ONE calendar connection needs attention."
        : "The TeamSnap ONE calendar is temporarily unavailable.",
    } : null,
  };
}

function timeoutSignal(timeoutMs) {
  if (typeof globalThis.AbortSignal?.timeout === "function") return globalThis.AbortSignal.timeout(timeoutMs);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();
  return controller.signal;
}

export function resetTeamSnapOneCalendarCache() {
  calendarCache = null;
}

export async function loadTeamSnapOneCalendar({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  recurringUids = new Set(),
} = {}) {
  const configuredValue = env?.[FEED_ENV_KEY];
  if (!configuredValue) return unavailablePayload({ configured: false });

  const feedUrl = parseFeedUrl(configuredValue);
  if (!feedUrl) return unavailablePayload({ configured: true, code: "invalid_configuration" });

  const attemptDate = safeDate(typeof now === "function" ? now() : now);
  const attemptMs = attemptDate.getTime();
  const cacheKey = feedUrl.href;
  const recurringUidKey = recurringUids instanceof Set ? [...recurringUids].sort().join("\n") : "";
  if (calendarCache?.key === cacheKey && calendarCache.recurringUidKey === recurringUidKey
      && calendarCache.expiresAt > attemptMs) {
    return clone(calendarCache.payload);
  }

  try {
    if (typeof fetchImpl !== "function") throw new TypeError("Fetch is unavailable.");
    const response = await fetchImpl(feedUrl.href, {
      headers: { Accept: "text/calendar" },
      signal: timeoutSignal(timeoutMs),
    });
    if (!response?.ok) throw new Error("Calendar request failed.");

    const calendarText = await response.text();
    if (Buffer.byteLength(calendarText, "utf8") > MAX_FEED_BYTES) {
      throw new Error("Calendar response is too large.");
    }
    const events = parseTeamSnapOneCalendar(calendarText, { recurringUids });
    const payload = {
      configured: true,
      available: true,
      stale: false,
      source: "TeamSnap ONE",
      syncedAt: attemptDate.toISOString(),
      calendarName: calendarName(calendarText),
      events,
      counts: eventCounts(events),
      error: null,
    };
    calendarCache = {
      key: cacheKey,
      recurringUidKey: recurringUids instanceof Set ? [...recurringUids].sort().join("\n") : "",
      expiresAt: attemptMs + Math.max(0, Number(cacheTtlMs) || 0),
      payload: clone(payload),
    };
    return clone(payload);
  } catch {
    if (calendarCache?.key === cacheKey && calendarCache.recurringUidKey === recurringUidKey) {
      const stalePayload = clone(calendarCache.payload);
      stalePayload.stale = true;
      stalePayload.error = {
        code: "refresh_failed",
        message: "Showing the most recent TeamSnap ONE schedule while the live feed reconnects.",
      };
      return stalePayload;
    }
    return unavailablePayload({ configured: true, code: "unavailable" });
  }
}
