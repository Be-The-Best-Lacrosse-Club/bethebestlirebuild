// BTB Futures Clinic — real-time Google Sheet sync
// Triggered by Netlify form submission webhook for futures-clinic-registration
// Appends a row to "Clinic RSVPs" tab in the BTB Master Registrant Tracker

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const SEAFORD_CLINIC_LOCATION = "June 28 - Seaford High School - 9:00-11:00 AM";
const DOB_RANGES = {
  2030: { min: "2011-12-02", max: "2012-12-01" },
  2031: { min: "2012-12-02", max: "2013-12-01" },
  2032: { min: "2013-12-02", max: "2014-12-01" },
  2033: { min: "2014-12-02", max: "2015-12-01" },
  2034: { min: "2015-12-02", max: "2016-12-01" },
  2035: { min: "2016-12-02", max: "2017-12-01" },
  2036: { min: "2017-12-02", max: "2018-12-01" },
  2037: { min: "2018-12-02", max: "2019-12-01" },
  2038: { min: "2019-12-02", max: "2020-12-01" },
};

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function gradYearForDob(value) {
  const dob = parseIsoDate(value);
  if (!dob) return null;
  for (const [gradYear, range] of Object.entries(DOB_RANGES)) {
    if (dob >= range.min && dob <= range.max) return gradYear;
  }
  return null;
}

function validateFuturesClinicSubmission(data) {
  const clinicLocation = String(data.clinic_location || "").trim();
  if (clinicLocation !== SEAFORD_CLINIC_LOCATION) {
    return { ok: false, reason: "wrong clinic location" };
  }

  const dob = parseIsoDate(String(data.player_dob || "").trim());
  if (!dob) return { ok: false, reason: "invalid DOB" };

  const expectedGradYear = gradYearForDob(dob);
  if (!expectedGradYear) {
    return { ok: false, reason: "DOB outside clinic range" };
  }

  const gradYear = String(data.grad_year || "").trim();
  if (!gradYear) return { ok: false, reason: "missing grad year" };
  if (gradYear !== "Not sure" && gradYear !== expectedGradYear) {
    return { ok: false, reason: `DOB/grad year mismatch: expected ${expectedGradYear}` };
  }

  return {
    ok: true,
    data: {
      ...data,
      clinic_location: SEAFORD_CLINIC_LOCATION,
      grad_year: expectedGradYear,
      grad_year_entered: gradYear === "Not sure" ? "Not sure" : data.grad_year_entered,
    },
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Bad JSON" };
  }

  // Netlify sends form submissions as { payload: { data: {...} } }
  const data = payload?.payload?.data || payload?.data || {};

  const email      = (data.parent_email || "").trim().toLowerCase();
  // Skip test emails
  const TEST = ["info@bethebestli.com", "bethebestsportscamp@gmail.com"];
  if (!email || TEST.includes(email)) {
    return { statusCode: 200, body: "Skipped test" };
  }

  const validation = validateFuturesClinicSubmission(data);
  if (!validation.ok) {
    console.warn(`Skipped invalid clinic registration: ${validation.reason} | ${email}`);
    return { statusCode: 200, body: `Skipped invalid: ${validation.reason}` };
  }

  const cleanData = validation.data;
  const playerName = `${cleanData.player_first_name || ""} ${cleanData.player_last_name || ""}`.trim();
  const parentName = `${cleanData.parent_first_name || ""} ${cleanData.parent_last_name || ""}`.trim();
  const location   = cleanData.clinic_location || "";
  const gradYear   = cleanData.grad_year || "";
  const gender     = cleanData.program_gender || "";
  const phone      = cleanData.parent_phone || "";
  const submitted  = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  try {
    // Get fresh Google access token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type:    "refresh_token",
      }),
    });
    const { access_token } = await tokenResp.json();

    const row = [submitted, email, playerName, parentName, phone, gradYear, gender, location, "New Registration"];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Clinic%20RSVPs!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      }
    );

    console.log(`Logged: ${playerName} | ${email} | ${location}`);
    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.error("Sheet write error:", err);
    return { statusCode: 500, body: "Sheet write failed" };
  }
};
