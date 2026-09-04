import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { ALLOWED_ORIGINS, guardRequest } from "./_guard.js";

const STORE_NAME = "draw-training-registrations";
const FORM_NAME = "btb-draw-training-registration";

export const SESSION_DATES = Object.freeze([
  "September 17, 2026",
  "September 24, 2026",
  "October 1, 2026",
  "October 8, 2026",
  "October 15, 2026",
]);

export const TRAINING_GROUPS = Object.freeze([
  {
    name: "Girls Draw Training · 7:00–8:00 PM",
    slug: "girls-draw-training-7pm",
    gender: "Girls",
    gradYears: ["2037", "2036", "2035", "2034", "2033", "2032", "2031"],
    time: "7:00–8:00 PM",
  },
]);

const GROUP_BY_NAME = new Map(TRAINING_GROUPS.map((group) => [group.name, group]));
const GRAD_YEARS = new Set(TRAINING_GROUPS.flatMap((group) => group.gradYears));
const POSITIONS = new Set([
  "Attack",
  "Midfield",
  "Defense",
  "Goalie",
  "Draw Specialist",
  "Unsure",
]);
const ALLOWED_FIELDS = [
  "training_group",
  "player_first_name",
  "player_last_name",
  "player_dob",
  "grad_year",
  "btb_team",
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
    && year >= 2008
    && year <= 2021;
}

export function groupForName(value) {
  return GROUP_BY_NAME.get(clean(value, 80)) || null;
}

export function validateDrawTrainingRegistration(input = {}) {
  const group = groupForName(input.training_group);
  if (!group) return { error: "Please choose the girls draw training package." };

  const requiredFields = [
    "player_first_name",
    "player_last_name",
    "player_dob",
    "grad_year",
    "btb_team",
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
  const gradYear = clean(input.grad_year, 4);
  if (!GRAD_YEARS.has(gradYear)) {
    return { error: "Girls draw training is open to graduation years 2037 through 2031." };
  }
  if (!POSITIONS.has(clean(input.position, 40))) {
    return { error: "Please choose a valid primary position." };
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

  return { group };
}

function registrationFingerprint(input) {
  const identity = [
    clean(input.parent_email, 320).toLowerCase(),
    clean(input.player_first_name, 120).toLowerCase(),
    clean(input.player_last_name, 120).toLowerCase(),
  ].join("|");
  return createHash("sha256").update(identity).digest("hex");
}

function registrationData(input, group, count) {
  const data = {};
  for (const field of ALLOWED_FIELDS) data[field] = clean(input[field]);
  data["form-name"] = FORM_NAME;
  data.program = "BTB Girls Draw Training with Emma Mclam — 5-Session Package";
  data.program_gender = group.gender;
  data.coach = "Emma Mclam";
  data.training_day = "Thursdays";
  data.training_time = group.time;
  data.group_grad_years = group.gradYears.join(", ");
  data.location = "Momentum Sports · 10 Dunton Ave, Deer Park, NY 11729";
  data.amount = "175";
  data.session_dates = SESSION_DATES.join("; ");
  data.registration_status = "Pending QuickBooks payment verification";
  data.payment_match_reference = `${clean(input.player_first_name, 120)} ${clean(input.player_last_name, 120)} · ${clean(input.parent_email, 320)}`;
  data.group_registration_count = String(count);
  return data;
}

export async function buildGroupCounts(store) {
  const { blobs } = await store.list({ prefix: "registrations/" });
  const records = await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json" })));
  return TRAINING_GROUPS.map((group) => ({
    name: group.name,
    gender: group.gender,
    gradYears: group.gradYears,
    time: group.time,
    count: records.filter((record) => record?.group === group.name).length,
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
        return json({ groups: await buildGroupCounts(store) });
      } catch (error) {
        console.error("draw training group count failed:", error);
        return json({ error: "The registration total is temporarily unavailable." }, 500);
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

    const validation = validateDrawTrainingRegistration(input);
    if (validation.error) return json({ error: validation.error }, 400);
    const { group } = validation;
    const registrationKey = `registrations/${registrationFingerprint(input)}`;
    let recordSaved = false;
    let formSaved = false;

    try {
      const existing = await store.get(registrationKey, { type: "json" });
      if (existing) {
        const groups = await buildGroupCounts(store);
        const existingGroup = groups.find((item) => item.name === existing.group);
        return json({
          ok: true,
          duplicate: true,
          group: existing.group,
          count: existingGroup?.count || 1,
        });
      }

      const write = await store.set(registrationKey, JSON.stringify({
        status: "processing",
        group: group.name,
        gender: group.gender,
        acceptedAt: now().toISOString(),
      }), { onlyIfNew: true });
      if (!write.modified) {
        return json({
          error: "This registration is already being processed. Please wait a moment and try again.",
          code: "registration_processing",
        }, 409);
      }
      recordSaved = true;

      const groups = await buildGroupCounts(store);
      const count = groups.find((item) => item.name === group.name)?.count || 1;
      await saveForm(registrationData(input, group, count), context);
      formSaved = true;

      try {
        await store.setJSON(registrationKey, {
          status: "pending_payment",
          group: group.name,
          gender: group.gender,
          acceptedAt: now().toISOString(),
        });
      } catch (error) {
        console.warn("draw training registration status update failed:", error);
      }

      return json({ ok: true, group: group.name, count });
    } catch (error) {
      if (recordSaved && !formSaved) await Promise.allSettled([store.delete(registrationKey)]);
      console.error("draw training registration failed:", error);
      return json({ error: "Registration could not be completed. Please try again." }, 500);
    }
  };
}

export default createHandler();

export const config = {
  path: "/api/draw-training-registration",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
