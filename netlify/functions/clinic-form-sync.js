// BTB Futures Clinic — real-time Google Sheet sync
// Triggered by Netlify form submission webhook for futures-clinic-registration
// Appends a row to "Clinic RSVPs" tab in the BTB Master Registrant Tracker

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";

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
  const playerName = `${data.player_first_name || ""} ${data.player_last_name || ""}`.trim();
  const parentName = `${data.parent_first_name || ""} ${data.parent_last_name || ""}`.trim();
  const location   = data.clinic_location || "";
  const gradYear   = data.grad_year || "";
  const gender     = data.program_gender || "";
  const phone      = data.parent_phone || "";
  const submitted  = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  // Skip test emails
  const TEST = ["info@bethebestli.com", "bethebestsportscamp@gmail.com"];
  if (!email || TEST.includes(email)) {
    return { statusCode: 200, body: "Skipped test" };
  }

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
