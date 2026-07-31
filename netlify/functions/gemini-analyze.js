import https from "node:https";

const MODEL = "gemini-2.5-flash";

function postJson(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(body, "utf8");
    const req = https.request(
      {
        hostname,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.setTimeout(45000, () => {
      req.destroy();
      reject(new Error("Gemini request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

export const handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Server misconfigured: GEMINI_API_KEY not set in Netlify environment.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
    };
  }

  if (!payload.contents || !Array.isArray(payload.contents)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Missing 'contents' array. Expected Gemini generateContent body.",
      }),
    };
  }

  const forwardBody = JSON.stringify({
    contents: payload.contents,
    generationConfig: payload.generationConfig || {},
  });

  try {
    const upstream = await postJson(
      "generativelanguage.googleapis.com",
      `/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      forwardBody
    );

    return {
      statusCode: upstream.status,
      headers,
      body: upstream.body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `Upstream error: ${err.message}` }),
    };
  }
};
