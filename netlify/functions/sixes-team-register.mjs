/**
 * The Sixes League — team registration intake.
 *
 * POST /api/sixes-team-register
 *   Validates a full team submission (team details, billing contact, 8–12 player
 *   roster with USA Lacrosse numbers and pinnie sizes), reserves one of the eight
 *   slots in the requested division, and stores the record in Netlify Blobs so the
 *   $2,500 QuickBooks invoice can be raised against it.
 *
 * GET /api/sixes-team-register?division=Boys%202034
 *   Public capacity check — returns remaining slots for that division.
 */

import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { guardRequest } from "./_guard.js";

const STORE_NAME = "sixes-league-registrations";
const FORM_NAME = "btb-sixes-league-team-registration";
const TEAM_FEE = 2500;
const DIVISION_CAPACITY = 8;
const MIN_PLAYERS = 8;
const MAX_PLAYERS = 12;
const POST_RATE = { limit: 8, windowMs: 60_000 };

const DIVISIONS = [
  "Boys 2033", "Boys 2034", "Boys 2035", "Boys 2036",
  "Girls 2033", "Girls 2034", "Girls 2035", "Girls 2036",
];
const TIERS = ["A", "B"];
const PINNIE_SIZES = ["Youth S", "Youth M", "Youth L", "Adult S", "Adult M", "Adult L", "Adult XL"];
const GRAD_YEARS = ["2033", "2034", "2035", "2036"];
const ROLES = ["Head Coach", "Assistant Coach", "Team Manager", "Club Director", "Parent Organizer"];

const TEAM_FIELDS = [
  "team_name", "club_name", "division", "team_tier", "home_town",
  "contact_first_name", "contact_last_name", "contact_email", "contact_phone", "contact_role",
  "billing_street", "billing_city", "billing_state", "billing_zip",
  "usal_confirmed", "waiver_accepted", "payment_terms", "media_release", "notes",
];

function clean(value, maxLength = 200) {
  return String(value == null ? "" : value).trim().slice(0, maxLength);
}

function digitsOnly(value) {
  return String(value == null ? "" : value).replace(/\D/g, "");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function slug(value) {
  return clean(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function normalizeRoster(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_PLAYERS + 4).map((raw) => ({
    first_name: clean(raw && raw.first_name, 60),
    last_name: clean(raw && raw.last_name, 60),
    grad_year: clean(raw && raw.grad_year, 4),
    usa_lacrosse_number: digitsOnly(raw && raw.usa_lacrosse_number).slice(0, 12),
    pinnie_size: clean(raw && raw.pinnie_size, 20),
    parent_name: clean(raw && raw.parent_name, 80),
    parent_email: clean(raw && raw.parent_email, 120).toLowerCase(),
    parent_phone: digitsOnly(raw && raw.parent_phone).slice(0, 15),
  }));
}

function validate(team, roster) {
  for (const field of [
    "team_name", "club_name", "division", "team_tier", "home_town",
    "contact_first_name", "contact_last_name", "contact_email", "contact_phone", "contact_role",
    "billing_street", "billing_city", "billing_state", "billing_zip",
  ]) {
    if (!team[field]) return `Missing required field: ${field}`;
  }
  if (!DIVISIONS.includes(team.division)) return "Unrecognized division.";
  if (!TIERS.includes(team.team_tier)) return "Team must be designated A or B.";
  if (!ROLES.includes(team.contact_role)) return "Unrecognized contact role.";
  if (!isEmail(team.contact_email)) return "Team contact email is not valid.";
  if (digitsOnly(team.contact_phone).length < 10) return "Team contact phone is not valid.";
  if (!/^[A-Za-z]{2}$/.test(team.billing_state)) return "Billing state must be two letters.";
  if (!/^\d{5}(?:-\d{4})?$/.test(team.billing_zip)) return "Billing ZIP is not valid.";
  if (team.usal_confirmed !== "Yes") return "USA Lacrosse membership confirmation is required.";
  if (team.waiver_accepted !== "Yes") return "Waiver acceptance is required.";
  if (team.payment_terms !== "Yes") return "Payment terms acknowledgement is required.";

  if (roster.length < MIN_PLAYERS) return `A roster needs at least ${MIN_PLAYERS} players.`;
  if (roster.length > MAX_PLAYERS) return `A roster can hold at most ${MAX_PLAYERS} players.`;

  const seen = new Set();
  for (let i = 0; i < roster.length; i += 1) {
    const p = roster[i];
    const who = `Player ${i + 1}`;
    if (!p.first_name || !p.last_name) return `${who} is missing a name.`;
    if (!GRAD_YEARS.includes(p.grad_year)) return `${who} has an invalid graduation year.`;
    if (p.usa_lacrosse_number.length < 5 || p.usa_lacrosse_number.length > 12) {
      return `${who} has an invalid USA Lacrosse number.`;
    }
    if (!PINNIE_SIZES.includes(p.pinnie_size)) return `${who} has an invalid pinnie size.`;
    if (!p.parent_name) return `${who} is missing a parent or guardian name.`;
    if (!isEmail(p.parent_email)) return `${who} has an invalid parent email.`;
    if (p.parent_phone.length < 10) return `${who} has an invalid parent phone.`;
    if (seen.has(p.usa_lacrosse_number)) {
      return `Duplicate USA Lacrosse number ${p.usa_lacrosse_number} on the roster.`;
    }
    seen.add(p.usa_lacrosse_number);
  }
  return "";
}

async function divisionCount(store, division) {
  const prefix = `division/${slug(division)}/`;
  const { blobs } = await store.list({ prefix });
  return Array.isArray(blobs) ? blobs.length : 0;
}

async function saveNetlifyForm(req, team, roster) {
  const body = new URLSearchParams();
  body.set("form-name", FORM_NAME);
  for (const field of TEAM_FIELDS) {
    if (team[field]) body.set(field, team[field]);
  }
  body.set("player_count", String(roster.length));
  body.set("team_fee", String(TEAM_FEE));
  body.set(
    "roster_summary",
    roster
      .map((p, i) =>
        `${i + 1}. ${p.first_name} ${p.last_name} (${p.grad_year}) — USAL ${p.usa_lacrosse_number} — ${p.pinnie_size} — ${p.parent_name} / ${p.parent_email} / ${p.parent_phone}`,
      )
      .join("\n"),
  );
  body.set("roster_json", JSON.stringify(roster));

  const origin = new URL(req.url).origin;
  const response = await fetch(origin, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    redirect: "manual",
  });
  if (![200, 302, 303].includes(response.status)) {
    throw new Error(`Netlify form save failed with status ${response.status}`);
  }
}

async function handleGet(req) {
  const division = clean(new URL(req.url).searchParams.get("division"), 40);
  if (!DIVISIONS.includes(division)) {
    return json({ ok: false, error: "Unrecognized division." }, 400);
  }
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const used = await divisionCount(store, division);
  return json({
    ok: true,
    division,
    capacity: DIVISION_CAPACITY,
    registered: used,
    remaining: Math.max(0, DIVISION_CAPACITY - used),
    full: used >= DIVISION_CAPACITY,
  });
}

async function handlePost(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  if (clean(payload["bot-field"], 40)) {
    return json({ ok: true, skipped: true });
  }

  const team = {};
  for (const field of TEAM_FIELDS) {
    team[field] = clean(payload[field], field === "notes" ? 1200 : 160);
  }
  team.contact_email = team.contact_email.toLowerCase();
  team.billing_state = team.billing_state.toUpperCase();
  team.media_release = team.media_release === "Yes" ? "Yes" : "No";

  const roster = normalizeRoster(payload.roster);
  const error = validate(team, roster);
  if (error) return json({ ok: false, error, code: "validation_failed" }, 400);

  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const divisionSlug = slug(team.division);
  const fingerprint = createHash("sha256")
    .update(`${divisionSlug}|${slug(team.team_name)}|${team.team_tier}`)
    .digest("hex")
    .slice(0, 24);
  const slotKey = `division/${divisionSlug}/${fingerprint}`;

  const used = await divisionCount(store, team.division);
  if (used >= DIVISION_CAPACITY) {
    return json(
      { ok: false, error: `${team.division} is full.`, code: "division_full" },
      409,
    );
  }

  const registrationId = `SIX-${divisionSlug.toUpperCase().replace(/-/g, "")}-${fingerprint.slice(0, 8).toUpperCase()}`;
  const record = {
    registration_id: registrationId,
    form: FORM_NAME,
    program: "The Sixes League",
    season: "Winter 2026-27",
    team_fee: TEAM_FEE,
    status: "pending_payment",
    quickbooks: {
      payment_link_used: true,
      item: String(team.division || "").startsWith("Girls")
        ? "Sixes League — Girls Team Entry"
        : "Sixes League — Boys Team Entry",
      income_account: "Services",
      reconciled: false,
      payment_id: null,
      paid_at: null
    },
    submitted_at: new Date().toISOString(),
    team,
    player_count: roster.length,
    roster,
  };

  let reserved;
  try {
    reserved = await store.setJSON(slotKey, record, { onlyIfNew: true });
  } catch {
    return json(
      { ok: false, error: "Registration is still processing.", code: "registration_processing" },
      409,
    );
  }

  if (reserved && reserved.modified === false) {
    return json({
      ok: true,
      duplicate: true,
      registration_id: registrationId,
      code: "duplicate_team",
      message: "This team is already registered for that division.",
    });
  }

  try {
    await saveNetlifyForm(req, team, roster);
  } catch (formError) {
    // The blob record is the source of truth; a failed mirror must not lose the
    // registration. Flag it so the nightly reconciliation can pick it up.
    record.form_mirror_error = String(formError && formError.message).slice(0, 300);
    await store.setJSON(slotKey, record);
  }

  return json({
    ok: true,
    registration_id: registrationId,
    division: team.division,
    player_count: roster.length,
    amount_due: TEAM_FEE,
    remaining_in_division: Math.max(0, DIVISION_CAPACITY - (used + 1)),
  });
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const blocked = guardRequest(req, req.method === "POST" ? POST_RATE : { limit: 60, windowMs: 60_000 });
  if (blocked) return blocked;

  try {
    if (req.method === "GET") return await handleGet(req);
    if (req.method === "POST") return await handlePost(req);
    return json({ ok: false, error: "Method not allowed." }, 405);
  } catch (err) {
    console.error("sixes-team-register failed", err);
    return json({ ok: false, error: "Registration could not be saved." }, 500);
  }
};

export const config = {
  path: "/api/sixes-team-register",
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
  },
};
