const https = require("https");

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZEaoj0tR6juiV_K-OTlah5NbeaClFPu0zW3OKK7psjnIC_E_XAqML3UhyxQL4Id_Kjw/exec";

function postFollowRedirects(targetUrl, body, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    let redirectsLeft = maxRedirects;
    const payload = Buffer.from(body, "utf8");

    function request(url) {
      const parsed = new URL(url);
      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
        },
      };

      const req = https.request(options, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (redirectsLeft-- <= 0) {
            reject(new Error("Too many redirects"));
            return;
          }
          const next = new URL(res.headers.location, url).toString();
          return request(next);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: data })
        );
      });

      req.on("error", reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error("Apps Script request timed out"));
      });
      req.write(payload);
      req.end();
    }

    request(targetUrl);
  });
}

function ok(payload) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true, ...payload }),
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return ok({ method: event.httpMethod });
  }

  const apiKey = process.env.SHEETS_FORMS_KEY;
  if (!apiKey) {
    console.error("forms-to-sheet: SHEETS_FORMS_KEY env var not set");
    return ok({ env_set: false, forwarded: false });
  }

  try {
    const url = `${APPS_SCRIPT_URL}?key=${encodeURIComponent(apiKey)}`;
    const result = await postFollowRedirects(url, event.body || "{}");
    return ok({
      env_set: true,
      forwarded: true,
      apps_script_status: result.status,
    });
  } catch (err) {
    console.error("forms-to-sheet error:", err.message);
    return ok({ env_set: true, forwarded: false, error: err.message });
  }
};
