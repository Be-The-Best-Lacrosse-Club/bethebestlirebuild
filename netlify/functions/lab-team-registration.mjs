import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { ALLOWED_ORIGINS, guardRequest } from "./_guard.js";

const STORE_NAME = "lab-team-registrations";
const FORM_NAME = "btb-lab-team-strength-registration";
export const TEAM_MINIMUM = 10;

export const LAB_TEAMS = Object.freeze([
  { name: "2028 Black", slug: "2028-black", gradYear: "2028", gender: "Boys" },
  { name: "2029 Chrome", slug: "2029-chrome", gradYear: "2029", gender: "Boys" },
  { name: "2030 Rage", slug: "2030-rage", gradYear: "2030", gender: "Boys" },
  { name: "2030 Reign", slug: "2030-reign", gradYear: "2030", gender: "Girls" },
  { name: "2030 Tidal Wave", slug: "2030-tidal-wave", gradYear: "2030", gender: "Girls" },
  { name: "2031 Carnage", slug: "2031-carnage", gradYear: "2031", gender: "Boys" },
  { name: "2031 Cyclones", slug: "2031-cyclones", gradYear: "2031", gender: "Girls" },
  { name: "2032 Cannons", slug: "2032-cannons", gradYear: "2032", gender: "Boys" },
  { name: "2032 Grizzlies", slug: "2032-grizzlies", gradYear: "2032", gender: "Boys" },
  { name: "2032 Riptide", slug: "2032-riptide", gradYear: "2032", gender: "Girls" },
  { name: "2033 Renegades", slug: "2033-renegades", gradYear: "2033", gender: "Boys" },
  { name: "2033 Storm", slug: "2033-storm", gradYear: "2033", gender: "Girls" },
]);

const TEAM_BY_NAME = new Map(LAB_TEAMS.map((team) => [team.name, team]));
const POSITIONS = new Set([
  "Attack",
  "Midfield",
  "Defense",
  "Goalie",
  "Faceoff Specialist",
  "Long-Stick Midfield",
  "Draw Specialist",
  "Unsure",
]);
const SCHEDULE_PREFERENCES = new Set(["Before practice", "After practice", "Either works"]);
const ALLOWED_FIELDS = [
  "team_name",
  "player_first_name",
  "player_last_name",
  "player_dob",
  "position",
  "school_town",
  "parent_first_name",
  "parent_last_name",
  "parent_email",
  "parent_phone",
  "address_street",
  "address_city",
  "address_state",
  "address_zip",
  "emergency_name",
  "emergency_phone",
  "medical_notes",
  "schedule_preference",
  "additional_notes",
  "waiver_accepted",
  "media_release",
  "bot-field",
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

function digitsOnly(value) {
  return clean(value, 40).replace(/\D/g, "");
}

function validDate(value) {
  const raw = clean(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const [year, month, day] = raw.split("-").map(Number);
  const parsed = new Date(`${raw}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime())
    && parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    && year >= 2007
    && year <= 2017;
}

export function teamForName(value) {
  return TEAM_BY_NAME.get(clean(value, 80)) || null;
}

export function validateLabRegistration(input = {}) {
  const team = teamForName(input.team_name);
  if (!team) return { error: "Please choose the player's BTB team." };

  const requiredFields = [
    "player_first_name",
    "player_last_name",
    "player_dob",
    "position",
    "school_town",
    "parent_first_name",
    "parent_last_name",
    "parent_email",
    "parent_phone",
    "address_street",
    "address_city",
    "address_state",
    "address_zip",
    "emergency_name",
    "emergency_phone",
    "medical_notes",
    "schedule_preference",
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
  if (!validDate(input.player_dob)) {
    return { error: "Please check the player's date of birth." };
  }
  if (!POSITIONS.has(clean(input.position, 40))) {
    return { error: "Please choose a valid primary position." };
  }
  if (!SCHEDULE_PREFERENCES.has(clean(input.schedule_preference, 40))) {
    return { error: "Please choose a schedule preference." };
  }
  if (clean(input.waiver_accepted) !== "Yes") {
    return { error: "The participation waiver must be accepted." };
  }

  const state = clean(input.address_state, 2);
  if (!/^[A-Za-z]{2}$/.test(state)) {
    return { error: "Please enter a valid two-letter state." };
  }
  const zip = clean(input.address_zip, 10);
  if (!/^\d{5}(?:-\d{4})?$/.test(zip)) {
    return { error: "Please enter a valid ZIP code." };
  }

  return { team };
}

function registrationFingerprint(input, team) {
  const identity = [
    clean(input.parent_email, 320).toLowerCase(),
    clean(input.player_first_name, 120).toLowerCase(),
    clean(input.player_last_name, 120).toLowerCase(),
    team.slug,
  ].join("|");
  return createHash("sha256").update(identity).digest("hex");
}

function registrationData(input, team, count, remaining) {
  const data = {};
  for (const field of ALLOWED_FIELDS) data[field] = clean(input[field]);
  data["form-name"] = FORM_NAME;
  data.program = "The Lab at Momentum Sports — Team Strength Training";
  data.program_gender = team.gender;
  data.grad_year = team.gradYear;
  data.amount = "500";
  data.registration_status = "Pending QuickBooks payment verification";
  data.payment_match_reference = `${clean(input.player_first_name, 120)} ${clean(input.player_last_name, 120)} · ${clean(input.parent_email, 320)}`;
  data.team_registration_count = String(count);
  data.team_spots_to_minimum = String(remaining);
  return data;
}

export async function registrationsForTeam(store, teamSlug) {
  const { blobs } = await store.list({ prefix: `${teamSlug}/registrations/` });
  return blobs.length;
}

export async function buildTeamProgress(store) {
  return Promise.all(LAB_TEAMS.map(async (team) => {
    const count = await registrationsForTeam(store, team.slug);
    return {
      name: team.name,
      gender: team.gender,
      gradYear: team.gradYear,
      count,
      remaining: Math.max(0, TEAM_MINIMUM - count),
      minimumMet: count >= TEAM_MINIMUM,
    };
  }));
}

export async function saveNetlifyForm(data, context = {}, fetchImpl = fetch) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) params.append(key, value);

  const siteUrl = context.site?.url || "https://www.bethebestli.com";
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

export function createHandler({
  getBlobStore = () => getStore({ name: STORE_NAME, consistency: "strong" }),
  saveForm = saveNetlifyForm,
  now = () => new Date(),
} = {}) {
  return async (req, context = {}) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
    if (req.method !== "GET" && req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const store = getBlobStore();
    if (req.method === "GET") {
      try {
        return json({ minimum: TEAM_MINIMUM, teams: await buildTeamProgress(store) });
      } catch (error) {
        console.error("lab team progress failed:", error);
        return json({ error: "Team progress is temporarily unavailable." }, 500);
      }
    }

    const rejected = guardRequest(req, {
      allowedOrigins: [
        ...ALLOWED_ORIGINS,
        "http://localhost:8888",
        "http://127.0.0.1:8888",
      ],
      limit: 8,
      windowMs: 60_000,
    });
    if (rejected) return rejected;

    let input;
    try {
      input = await req.json();
    } catch {
      return json({ error: "Invalid request" }, 400);
    }
    if (clean(input["bot-field"])) return json({ ok: true });

    const validation = validateLabRegistration(input);
    if (validation.error) return json({ error: validation.error }, 400);
    const { team } = validation;
    const registrationId = registrationFingerprint(input, team);
    const registrationKey = `${team.slug}/registrations/${registrationId}`;
    let recordSaved = false;
    let formSaved = false;

    try {
      const existing = await store.get(registrationKey, { type: "json" });
      if (existing) {
        const count = await registrationsForTeam(store, team.slug);
        return json({
          ok: true,
          duplicate: true,
          team: team.name,
          count,
          remaining: Math.max(0, TEAM_MINIMUM - count),
          minimumMet: count >= TEAM_MINIMUM,
        });
      }

      const write = await store.set(registrationKey, JSON.stringify({
        status: "processing",
        team: team.name,
        gradYear: team.gradYear,
        acceptedAt: now().toISOString(),
      }), { onlyIfNew: true });
      if (!write.modified) {
        return json({
          error: "This registration is already being processed. Please wait a moment and try again.",
          code: "registration_processing",
        }, 409);
      }
      recordSaved = true;

      const count = await registrationsForTeam(store, team.slug);
      const remaining = Math.max(0, TEAM_MINIMUM - count);
      const data = registrationData(input, team, count, remaining);
      await saveForm(data, context);
      formSaved = true;

      try {
        await store.setJSON(registrationKey, {
          status: "pending_payment",
          team: team.name,
          gradYear: team.gradYear,
          acceptedAt: now().toISOString(),
        });
      } catch (error) {
        console.warn("lab registration status update failed:", error);
      }

      return json({
        ok: true,
        team: team.name,
        count,
        remaining,
        minimumMet: count >= TEAM_MINIMUM,
      });
    } catch (error) {
      if (recordSaved && !formSaved) await Promise.allSettled([store.delete(registrationKey)]);
      console.error("lab team registration failed:", error);
      return json({ error: "Registration could not be completed. Please try again." }, 500);
    }
  };
}

export default createHandler();

export const config = {
  path: "/api/lab-team-registration",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
