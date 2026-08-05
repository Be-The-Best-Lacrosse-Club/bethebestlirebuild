import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "girls-mini-camp-capacity";
const SESSION_CAPACITY = 24;
const FORM_NAME = "btb-girls-mini-camp-registration";

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

function fingerprint(data) {
  const identity = [
    clean(data.parent_email, 320).toLowerCase(),
    clean(data.player_first_name, 120).toLowerCase(),
    clean(data.player_last_name, 120).toLowerCase(),
    clean(data.grad_year, 4),
  ].join("|");
  return createHash("sha256").update(identity).digest("hex");
}

function registrationData(input, group) {
  const data = {};
  for (const field of ALLOWED_FIELDS) data[field] = clean(input[field]);
  data["form-name"] = FORM_NAME;
  data.program = "BTB x Bearded Lax Girls Mini Camp 2026";
  data.program_gender = "Girls";
  data.amount = "150";
  data.assigned_session = group.session;
  return data;
}

async function registrationsInGroup(store, groupKey) {
  const { blobs } = await store.list({ prefix: `${groupKey}/` });
  return blobs.length;
}

async function saveNetlifyForm(data, context) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) params.append(key, value);

  const siteUrl = Netlify.env.get("URL") || context.site?.url || "https://www.bethebestli.com";
  const response = await fetch(new URL("/", siteUrl), {
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
      console.error("girls-mini-camp capacity check failed:", error);
      return json({ error: "Could not check session availability" }, 500);
    }
  }

  let input;
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  if (clean(input["bot-field"])) return json({ ok: true });

  const group = groupForGradYear(input.grad_year);
  if (!group) return json({ error: "Please choose an eligible graduation year." }, 400);
  if (!clean(input.player_first_name) || !clean(input.player_last_name) || !clean(input.parent_email)) {
    return json({ error: "Required registration information is missing." }, 400);
  }
  if (clean(input.waiver_accepted) !== "Yes") {
    return json({ error: "The participation waiver must be accepted." }, 400);
  }

  const data = registrationData(input, group);
  const registrationId = fingerprint(data);
  const key = `${group.key}/${registrationId}`;

  try {
    const existing = await store.get(key, { type: "json" });
    if (existing) return json({ ok: true, duplicate: true });

    const count = await registrationsInGroup(store, group.key);
    if (count >= SESSION_CAPACITY) {
      return json({ error: "This session is currently full. Please email info@bethebestli.com for assistance." }, 409);
    }

    await store.setJSON(key, {
      status: "reserved",
      gradYear: data.grad_year,
      acceptedAt: new Date().toISOString(),
    });

    try {
      await saveNetlifyForm(data, context);
      await store.setJSON(key, {
        status: "registered",
        gradYear: data.grad_year,
        acceptedAt: new Date().toISOString(),
      });
    } catch (error) {
      await store.delete(key);
      throw error;
    }

    return json({ ok: true });
  } catch (error) {
    console.error("girls-mini-camp registration failed:", error);
    return json({ error: "Registration could not be completed. Please try again." }, 500);
  }
};

export const config = {
  path: "/api/girls-mini-camp-register",
};
