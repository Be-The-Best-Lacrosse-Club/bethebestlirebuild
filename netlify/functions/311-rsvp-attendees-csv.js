const FORM_ID = "6a5927b2a23a8c0008064c0c";

// This endpoint drives NETLIFY_API_TOKEN against the Netlify forms API and
// returns the attendee list. Nothing in the site calls it — it is opened by
// hand — so an Origin check would block the only real use of it (a top-level
// browser navigation sends no Origin). A shared key in the query string is
// what fits that workflow.
//
// Fails closed: with RSVP_EXPORT_KEY unset the endpoint is disabled rather
// than open. Set it with:
//   netlify env:set RSVP_EXPORT_KEY "$(openssl rand -hex 16)"
// then fetch /.netlify/functions/311-rsvp-attendees-csv?key=<value>
function isAuthorized(event) {
  const expected = process.env.RSVP_EXPORT_KEY;
  if (!expected) return false;
  const supplied =
    (event.queryStringParameters && event.queryStringParameters.key) ||
    event.headers?.["x-export-key"] ||
    "";
  if (supplied.length !== expected.length) return false;
  // Constant-time-ish compare so the key can't be recovered a byte at a time.
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://www.bethebestli.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Export-Key",
  "Vary": "Origin",
};

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function csv(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function formatEt(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

async function fetchSubmissions() {
  const token = process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("NETLIFY_API_TOKEN not configured");

  const submissions = [];
  for (let page = 1; page <= 10; page += 1) {
    const resp = await fetch(
      `https://api.netlify.com/api/v1/forms/${FORM_ID}/submissions?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );
    if (!resp.ok) throw new Error(`Netlify forms ${resp.status}`);

    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    submissions.push(...batch);
    if (batch.length < 100) break;
  }
  return submissions;
}

function toCsv(submissions) {
  const sorted = submissions.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const attending = sorted.filter((sub) =>
    clean(sub.data?.response).toLowerCase().startsWith("yes")
  );

  const rows = [
    ["BTB 311 Concert RSVP - Attending Coaches"],
    ["Last refreshed", formatEt(new Date().toISOString()), "Total Yes", attending.length, "Total Responses", sorted.length],
    [],
    ["Coach Name", "Notes", "Submitted At ET"],
    ...attending.map((sub) => [
      clean(sub.data?.coach_name),
      clean(sub.data?.notes),
      formatEt(sub.created_at || sub.data?.submitted_at),
    ]),
  ];

  return rows.map((row) => row.map(csv).join(",")).join("\n");
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  if (!isAuthorized(event)) {
    return {
      statusCode: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  try {
    const submissions = await fetchSubmissions();
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
      body: toCsv(submissions),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
