// BTB Futures Clinic RSVP tracker
// Deployed to bethebestlirebuild as netlify/functions/clinic-rsvp.js
// URL: https://www.bethebestli.com/.netlify/functions/clinic-rsvp
// Query params: ?email=...&player=...&location=stimson|seaford

const SHEET_ID = "1GKYBuDsEEf9KluyAlIvQ7-74DU-22IafebcuqSkW0vc";
const REDIRECT_URLS = {
  stimson: "https://www.bethebestli.com",
  seaford: "https://www.bethebestli.com",
};
const LOCATION_DETAILS = {
  stimson: { name: "Stimson Middle School — Huntington", date: "June 18, 2026 · 6:00–8:00 PM" },
  seaford: { name: "Seaford High School", date: "June 28, 2026 · 9:00–11:00 AM" },
};

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors };
  }

  const { email = "", player = "", location = "" } = event.queryStringParameters || {};
  const loc = location.toLowerCase().trim();

  if (!loc || !LOCATION_DETAILS[loc]) {
    return { statusCode: 400, headers: cors, body: "Invalid location" };
  }

  // Get fresh Google access token
  try {
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
    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;

    // Append row to "Clinic RSVPs" tab
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const details = LOCATION_DETAILS[loc];
    const row = [timestamp, decodeURIComponent(email), decodeURIComponent(player), details.name, details.date, loc];

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Clinic%20RSVPs!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      }
    );
  } catch (err) {
    console.error("Sheet write failed:", err);
    // Still redirect — don't leave parent stranded
  }

  // Redirect to a thank-you confirmation page
  const details = LOCATION_DETAILS[loc];
  const thankYouHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<title>See you there! — BTB Lacrosse</title>
</head>
<body style="margin:0;background:#111;font-family:Montserrat,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="max-width:480px;text-align:center;padding:40px 24px;">
  <div style="font-family:Anton,sans-serif;font-size:32px;color:#fff;letter-spacing:2px;margin-bottom:4px;">BE THE BEST</div>
  <div style="font-family:Anton,sans-serif;font-size:32px;color:#D22630;letter-spacing:2px;margin-bottom:32px;">LACROSSE</div>
  <div style="font-size:48px;margin-bottom:16px;">✅</div>
  <h1 style="color:#fff;font-size:24px;margin:0 0 12px;">You're confirmed!</h1>
  <p style="color:#ccc;font-size:15px;line-height:1.6;margin:0 0 24px;">
    We've recorded your spot for:<br>
    <strong style="color:#fff;">${details.name}</strong><br>
    <strong style="color:#D22630;">${details.date}</strong>
  </p>
  <p style="color:#888;font-size:13px;">We'll see you there. Questions? Email <a href="mailto:info@bethebestli.com" style="color:#D22630;">info@bethebestli.com</a></p>
</div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { ...cors, "Content-Type": "text/html" },
    body: thankYouHtml,
  };
};
