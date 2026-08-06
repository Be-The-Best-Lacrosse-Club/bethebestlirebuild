import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { guardRequest } from "./_guard.js";

const STORE_NAME = "boys-mini-camp-capacity";
export const SESSION_CAPACITY = 24;
const FORM_NAME = "btb-boys-mini-camp-registration";
const CAMP_DATE = new Date("2026-08-23T12:00:00-04:00");
const POST_RATE = { limit: 8, windowMs: 60_000 };

const POSITIONS = new Set([
  "Attack", "Midfield", "Defense", "Goalie", "Faceoff Specialist", "Unsure",
]);

const GROUPS = {
  "2036": { key: "2036-2035", session: "5:00 PM–6:00 PM" },
  "2035": { key: "2036-2035", session: "5:00 PM–6:00 PM" },
  "2034": { key: "2034-2033", session: "6:00 PM–7:00 PM" },
  "2033": { key: "2034-2033", session: "6:00 PM–7:00 PM" },
  "2032": { key: "2032-2031", session: "7:00 PM–8:00 PM" },
  "2031": { key: "2032-2031", session: "7:00 PM–8:00 PM" },
};

const ALLOWED_FIELDS = [
  "player_first_name", "player_last_name", "player_dob", "grad_year", "position",
  "school_town", "current_team", "parent_first_name", "parent_last_name", "parent_email",
  "parent_phone", "address_street", "address_city", "address_state", "address_zip",
  "emergency_name", "emergency_phone", "medical_notes", "waiver_accepted", "media_release",
  "player_age_at_camp", "bot-field",
];

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, max-age=0",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength = 2000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function groupForGradYear(value) {
  return GROUPS[clean(value, 4)] || null;
}

function digitsOnly(value) {
  return clean(value, 40).replace(/\D/g, "");
}

function ageAtCamp(value) {
  const raw = clean(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split("-").map(Number);
  const birthDate = new Date(`${raw}T12:00:00-04:00`);
  if (
    Number.isNaN(birthDate.getTime())
    || birthDate.getUTCFullYear() !== year
    || birthDate.getUTCMonth() !== month - 1
    || birthDate.getUTCDate() !== day
  ) return null;

  let age = CAMP_DATE.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday = CAMP_DATE.getUTCMonth() < birthDate.getUTCMonth()
    || (CAMP_DATE.getUTCMonth() === birthDate.getUTCMonth() && CAMP_DATE.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function validateRegistrationInput(input = {}) {
  const group = groupForGradYear(input.grad_year);
  if (!group) return { error: "Please choose an eligible graduation year." };

  const requiredFields = [
    "player_first_name", "player_last_name", "player_dob", "position", "school_town",
    "parent_first_name", "parent_last_name", "parent_email", "parent_phone",
    "emergency_name", "emergency_phone",
  ];
  if (requiredFields.some((field) => !clean(input[field]))) {
    return { error: "Required registration information is missing." };
  }

  const email = clean(input.parent_email, 320);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid parent email address." };
  }
  if (digitsOnly(input.parent_phone).length < 10 || digitsOnly(input.parent_phone).length > 15) {
    return { error: "Please enter a valid parent mobile number." };
  }
  if (digitsOnly(input.emergency_phone).length < 10 || digitsOnly(input.emergency_phone).length > 15) {
    return { error: "Please enter a valid emergency contact number." };
  }

  const age = ageAtCamp(input.player_dob);
  if (age === null || age < 6 || age > 16) {
    return { error: "Please check the player's date of birth." };
  }
  if (!POSITIONS.has(clean(input.position, 40))) {
    return { error: "Please choose a valid primary position." };
  }
  if (clean(input.waiver_accepted) !== "Yes") {
    return { error: "The participation waiver must be accepted." };
  }

  const state = clean(input.address_state, 2);
  if (state && !/^[A-Za-z]{2}$/.test(state)) {
    return { error: "Please enter a valid two-letter state." };
  }
  const zip = clean(input.address_zip, 10);
  if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip)) {
    return { error: "Please enter a valid ZIP code." };
  }

  return { group, age };
}

function fingerprint(data) {
  const identity = [
    clean(data.parent_email, 320).toLowerCase(),
    clean(data.player_first_name, 120).toLowerCase(),
    clean(data.player_last_name, 120).toLowerCase(),
    clean(data.grad_year, 4),
  ].join("|");
  return createHash("sha256").update(identity).digest("hex");
}

function registrationData(input, group, age) {
  const data = {};
  for (const field of ALLOWED_FIELDS) data[field] = clean(input[field]);
  data["form-name"] = FORM_NAME;
  data.program = "BTB x Full Circle 3-Day Boys Mini Camp 2026";
  data.program_gender = "Boys";
  data.amount = "150";
  data.assigned_session = group.session;
  data.player_age_at_camp = String(age);
  return data;
}

async function registrationsInGroup(store, groupKey) {
  const { blobs } = await store.list({ prefix: `${groupKey}/slots/` });
  return blobs.length;
}

export async function reserveSlot(store, groupKey, registrationId) {
  for (let slot = 1; slot <= SESSION_CAPACITY; slot += 1) {
    const key = `${groupKey}/slots/${String(slot).padStart(2, "0")}`;
    const result = await store.setJSON(key, {
      registrationId,
      reservedAt: new Date().toISOString(),
    }, { onlyIfNew: true });
    if (result.modified) return key;
  }
  return null;
}

async function releaseSlot(store, key, registrationId) {
  if (!key) return;
  const reservation = await store.get(key, { type: "json" });
  if (reservation?.registrationId === registrationId) await store.delete(key);
}

export async function saveNetlifyForm(data, context = {}, fetchImpl = fetch) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) params.append(key, value);

  const siteUrl = process.env.URL || context.site?.url || "https://www.bethebestli.com";
  const response = await fetchImpl(new URL("/", siteUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    redirect: "manual",
  });

  if (!response.ok && response.status !== 302 && response.status !== 303) {
    throw new Error(`Netlify form submission failed (${response.status})`);
  }
}

export default async (req, context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if (req.method === "GET") {
    const url = new URL(req.url);
    const group = groupForGradYear(url.searchParams.get("grad_year"));
    if (!group) return json({ error: "Invalid graduation year" }, 400);

    try {
      const count = await registrationsInGroup(store, group.key);
      return json({ available: count < SESSION_CAPACITY });
    } catch (error) {
      console.error("boys-mini-camp capacity check failed:", error);
      return json({ error: "Could not check session availability" }, 500);
    }
  }

  let input;
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const rejected = guardRequest(req, POST_RATE);
  if (rejected) return rejected;
  if (clean(input["bot-field"])) return json({ ok: true });

  const validation = validateRegistrationInput(input);
  if (validation.error) return json({ error: validation.error }, 400);
  const { group } = validation;

  const data = registrationData(input, group, validation.age);
  const registrationId = fingerprint(data);
  const registrationKey = `${group.key}/registrations/${registrationId}`;
  let slotKey = null;
  let formSaved = false;

  try {
    const existing = await store.get(registrationKey, { type: "json" });
    if (["pending_payment", "registered"].includes(existing?.status)) {
      return json({ ok: true, duplicate: true });
    }
    if (existing) {
      return json({
        error: "This registration is already being processed. Please wait a moment and try again.",
        code: "registration_processing",
      }, 409);
    }

    slotKey = await reserveSlot(store, group.key, registrationId);
    if (!slotKey) {
      return json({
        error: "This session is currently full. Please email info@bethebestli.com for assistance.",
        code: "session_full",
      }, 409);
    }

    const registrationWrite = await store.setJSON(registrationKey, {
      status: "reserved",
      gradYear: data.grad_year,
      slotKey,
      acceptedAt: new Date().toISOString(),
    }, { onlyIfNew: true });
    if (!registrationWrite.modified) {
      await releaseSlot(store, slotKey, registrationId);
      const concurrentRegistration = await store.get(registrationKey, { type: "json" });
      if (["pending_payment", "registered"].includes(concurrentRegistration?.status)) {
        return json({ ok: true, duplicate: true });
      }
      return json({
        error: "This registration is already being processed. Please wait a moment and try again.",
        code: "registration_processing",
      }, 409);
    }

    await saveNetlifyForm(data, context);
    formSaved = true;

    try {
      await store.setJSON(registrationKey, {
        status: "pending_payment",
        gradYear: data.grad_year,
        slotKey,
        acceptedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("boys-mini-camp registration status update failed:", error);
    }

    return json({ ok: true });
  } catch (error) {
    if (!formSaved && slotKey) {
      await Promise.allSettled([
        store.delete(registrationKey),
        releaseSlot(store, slotKey, registrationId),
      ]);
    }
    console.error("boys-mini-camp registration failed:", error);
    return json({ error: "Registration could not be completed. Please try again." }, 500);
  }
};

export const config = {
  path: "/api/boys-mini-camp-register",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
