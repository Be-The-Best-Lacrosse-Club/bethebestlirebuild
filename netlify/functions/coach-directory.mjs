/**
 * Password-protected staff directory for the BTB season schedule.
 *
 * Contact records live only in Netlify Blobs. They are never bundled into the
 * public calendar page or committed to the repository.
 */
import { getStore } from "@netlify/blobs";
import { ALLOWED_ORIGINS, guardRequest } from "./_guard.js";
import { authorizeIdentity } from "./_identity.js";

const STORE_NAME = "coach-directory";
export const DIRECTORY_KEY = "staff-directory-v1";

const HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{2,79}$/;

export class DirectoryApiError extends Error {
  constructor(message, { status = 400, code = "bad_request", snapshot, etag } = {}) {
    super(message);
    this.name = "DirectoryApiError";
    this.status = status;
    this.code = code;
    this.snapshot = snapshot;
    this.etag = etag;
  }
}

function suppliedPassword(req, body) {
  return req.headers.get("x-btb-calendar-key") || body?.password || "";
}

export function directoryOriginsForRequest() {
  // Production contact data must never be exposed to deploy-preview origins.
  return ALLOWED_ORIGINS;
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: HEADERS });
}

function cleanText(value, label, maxLength) {
  if (typeof value !== "string") {
    throw new DirectoryApiError(`${label} is required`, { code: "invalid_contact" });
  }
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned || cleaned.length > maxLength) {
    throw new DirectoryApiError(`Invalid ${label.toLowerCase()}`, { code: "invalid_contact" });
  }
  return cleaned;
}

function cleanList(value, label, maxItems = 20) {
  if (!Array.isArray(value)) {
    throw new DirectoryApiError(`Invalid ${label.toLowerCase()}`, { code: "invalid_directory" });
  }
  const cleaned = value.map((item) => cleanText(item, label, 100));
  const unique = [...new Set(cleaned)];
  if (unique.length > maxItems) {
    throw new DirectoryApiError(`Too many ${label.toLowerCase()}`, { code: "invalid_directory" });
  }
  return unique;
}

export function normalizeEmail(value) {
  if (value == null || String(value).trim() === "") return "";
  const email = String(value).trim().toLowerCase();
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DirectoryApiError("Enter a valid email address", { code: "invalid_email" });
  }
  return email;
}

export function normalizePhone(value) {
  if (value == null || String(value).trim() === "") return "";
  const phone = String(value).trim().replace(/\s+/g, " ");
  const digits = phone.replace(/\D/g, "");
  if (phone.length > 40 || !/^[0-9+().\-\s]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    throw new DirectoryApiError("Enter a valid phone number", { code: "invalid_phone" });
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function normalizeDirectoryEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new DirectoryApiError("Invalid staff record", { code: "invalid_directory" });
  }

  const id = typeof value.id === "string" ? value.id.trim().toLowerCase() : "";
  if (!ID_PATTERN.test(id)) {
    throw new DirectoryApiError("Invalid staff record ID", { code: "invalid_directory" });
  }

  const firstName = cleanText(value.firstName, "First name", 60);
  const lastName = cleanText(value.lastName, "Last name", 60);
  const phone = normalizePhone(value.phone);
  const email = normalizeEmail(value.email);
  if (!phone && !email) {
    throw new DirectoryApiError("At least one contact method is required", { code: "invalid_contact" });
  }

  return {
    id,
    firstName,
    lastName,
    roles: cleanList(value.roles, "Role", 10),
    divisions: cleanList(value.divisions, "Program", 5),
    teams: cleanList(value.teams, "Team", 20),
    phone,
    email,
    updatedAt: typeof value.updatedAt === "string" && value.updatedAt.trim()
      ? value.updatedAt.trim()
      : null,
  };
}

export function normalizeDirectorySnapshot(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const staff = Array.isArray(source.staff) ? source.staff.map(normalizeDirectoryEntry) : [];
  const ids = new Set();
  for (const entry of staff) {
    if (ids.has(entry.id)) {
      throw new DirectoryApiError("Duplicate staff record ID", { code: "invalid_directory" });
    }
    ids.add(entry.id);
  }

  return {
    version: Number.isSafeInteger(source.version) && source.version >= 0 ? source.version : 0,
    staff,
    savedAt: typeof source.savedAt === "string" ? source.savedAt : null,
  };
}

export async function readDirectorySnapshot(store) {
  const entry = await store.getWithMetadata(DIRECTORY_KEY, { type: "json" });
  return {
    exists: Boolean(entry),
    snapshot: normalizeDirectorySnapshot(entry?.data),
    etag: entry?.etag || null,
  };
}

function nowIso(now = () => new Date()) {
  const value = typeof now === "function" ? now() : now;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid server timestamp");
  return date.toISOString();
}

function staleDirectory(current) {
  return new DirectoryApiError("The directory changed on another device. Refresh and try again.", {
    status: 409,
    code: "stale_etag",
    snapshot: current.snapshot,
    etag: current.etag,
  });
}

export async function updateCoachContact(store, update, expectedEtag, { now = () => new Date() } = {}) {
  if (!update || typeof update !== "object" || Array.isArray(update)) {
    throw new DirectoryApiError("Invalid contact update", { code: "invalid_contact" });
  }
  const id = typeof update.id === "string" ? update.id.trim().toLowerCase() : "";
  if (!ID_PATTERN.test(id)) {
    throw new DirectoryApiError("Invalid staff record ID", { code: "invalid_contact" });
  }
  const phone = normalizePhone(update.phone);
  const email = normalizeEmail(update.email);
  if (!phone && !email) {
    throw new DirectoryApiError("At least one contact method is required", { code: "invalid_contact" });
  }

  const current = await readDirectorySnapshot(store);
  if (!current.exists) {
    throw new DirectoryApiError("Coach directory has not been imported", {
      status: 503,
      code: "directory_not_configured",
    });
  }
  if (!expectedEtag || expectedEtag !== current.etag) throw staleDirectory(current);

  const index = current.snapshot.staff.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new DirectoryApiError("Staff member not found", { status: 404, code: "not_found" });
  }

  const savedAt = nowIso(now);
  const staff = current.snapshot.staff.slice();
  staff[index] = { ...staff[index], phone, email, updatedAt: savedAt };
  const snapshot = {
    version: current.snapshot.version + 1,
    staff,
    savedAt,
  };
  const write = await store.setJSON(DIRECTORY_KEY, snapshot, { onlyIfMatch: current.etag });
  if (!write.modified) throw staleDirectory(await readDirectorySnapshot(store));
  return { snapshot, etag: write.etag || null };
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
    limit: 45,
    windowMs: 60_000,
    allowedOrigins: directoryOriginsForRequest(req),
  });
  if (blocked) return blocked;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Unsupported action" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Bad request" }, 400);
  }

  const expected = process.env.TOURNAMENT_CALENDAR_PASSWORD;
  const passwordMatches = Boolean(expected) && suppliedPassword(req, body) === expected;
  if (!passwordMatches) {
    const identity = await authorize(req, ["owner"]);
    if (!identity.ok) {
      if (!expected) {
        console.error("TOURNAMENT_CALENDAR_PASSWORD is not set");
        return jsonResponse({ error: "Coach directory is not configured" }, 500);
      }
      return jsonResponse({ error: "Wrong password" }, 401);
    }
  }

  const store = getBlobStore(STORE_NAME, { consistency: "strong" });
  try {
    if (body?.action === "load") {
      const current = await readDirectorySnapshot(store);
      if (!current.exists) {
        throw new DirectoryApiError("Coach directory has not been imported", {
          status: 503,
          code: "directory_not_configured",
        });
      }
      return jsonResponse({ snapshot: current.snapshot, etag: current.etag });
    }

    if (body?.action === "updateContact") {
      const result = await updateCoachContact(store, body.contact, body.etag);
      return jsonResponse({ ok: true, ...result });
    }

    return jsonResponse({ error: "Unsupported action" }, 405);
  } catch (error) {
    if (error instanceof DirectoryApiError) {
      return jsonResponse(errorPayload(error), error.status);
    }
    console.error("coach-directory failed", error);
    return jsonResponse({ error: "Coach directory is unavailable" }, 500);
  }
}

export default createHandler();
