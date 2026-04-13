const https = require("https");

function fetch(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    };

    const req = https.request(options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    req.end();
  });
}

function extractVideoId(input) {
  if (!input) return null;

  // Already a plain video ID (11 chars, alphanumeric + dash + underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // Try parsing as URL
  try {
    const url = new URL(input);

    // youtube.com/watch?v=ID
    if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
      return url.searchParams.get("v");
    }

    // youtu.be/ID
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0];
    }

    // youtube.com/embed/ID
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2];
    }

    // youtube.com/shorts/ID
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2];
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

function findCaptionUrl(html) {
  // Look for the captions data in ytInitialPlayerResponse
  // Try multiple patterns since YouTube changes their page structure

  // Pattern 1: ytInitialPlayerResponse as a JS variable
  let match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
  if (!match) {
    // Pattern 2: embedded in script tag
    match = html.match(/var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
  }
  if (!match) {
    // Pattern 3: sometimes it's set differently
    match = html.match(/window\["ytInitialPlayerResponse"\]\s*=\s*(\{.+?\});/s);
  }

  if (!match) {
    // Try finding caption track URL directly in the HTML
    const directMatch = html.match(/"captionTracks":\s*(\[.+?\])/);
    if (directMatch) {
      try {
        const tracks = JSON.parse(directMatch[1]);
        if (tracks.length > 0) {
          // Prefer English, fall back to first track
          const enTrack = tracks.find(
            (t) => t.languageCode === "en" || t.languageCode === "en-US"
          );
          const track = enTrack || tracks[0];
          return track.baseUrl || null;
        }
      } catch {
        // JSON parse failed
      }
    }
    return null;
  }

  // Parse the player response JSON
  // The JSON can be huge so we extract just what we need
  try {
    const json = JSON.parse(match[1]);
    const captionTracks =
      json?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      return null;
    }

    // Prefer English captions, fall back to first available
    const enTrack = captionTracks.find(
      (t) => t.languageCode === "en" || t.languageCode === "en-US"
    );
    const track = enTrack || captionTracks[0];
    return track.baseUrl || null;
  } catch {
    // JSON too large or malformed — try regex extraction instead
    const baseUrlMatch = html.match(
      /"captionTracks":\[.*?"baseUrl":"(https?:[^"]+?)"/
    );
    if (baseUrlMatch) {
      // Unescape the URL
      return baseUrlMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    }
    return null;
  }
}

function parseTimedTextXml(xml) {
  const lines = [];

  // Match each <text> element with start and dur attributes
  const textRegex = /<text\s+start="([^"]*)"(?:\s+dur="([^"]*)")?[^>]*>([\s\S]*?)<\/text>/g;
  let m;

  while ((m = textRegex.exec(xml)) !== null) {
    const startSeconds = parseFloat(m[1]);
    const rawText = m[3];

    // Decode HTML entities and strip tags
    const text = rawText
      .replace(/<[^>]+>/g, "") // strip nested tags like <font>
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
      .replace(/\n/g, " ")
      .trim();

    if (!text) continue;

    // Format timestamp as M:SS
    const totalSec = Math.floor(startSeconds);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const timestamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    lines.push(`[${timestamp}] ${text}`);
  }

  return lines;
}

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use GET." }),
    };
  }

  const videoIdParam = event.queryStringParameters?.videoId;

  if (!videoIdParam) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Missing required query parameter: videoId. Provide a YouTube video ID or URL.",
      }),
    };
  }

  const videoId = extractVideoId(videoIdParam);

  if (!videoId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: `Could not extract a valid video ID from: "${videoIdParam}"`,
      }),
    };
  }

  try {
    // Step 1: Fetch the YouTube video page
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let html;
    try {
      html = await fetch(videoUrl);
    } catch (err) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Failed to fetch YouTube page: ${err.message}`,
        }),
      };
    }

    // Check if video exists
    if (html.includes('"playabilityStatus":{"status":"ERROR"')) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Video not found or unavailable." }),
      };
    }

    // Step 2: Extract the captions track URL
    const captionUrl = findCaptionUrl(html);

    if (!captionUrl) {
      // Check if it's an age-restricted or login-required video
      if (
        html.includes("Sign in to confirm your age") ||
        html.includes("LOGIN_REQUIRED")
      ) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error: "This video requires sign-in (possibly age-restricted). Cannot fetch transcript.",
          }),
        };
      }

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "No captions found for this video. The video may not have subtitles or auto-generated captions.",
        }),
      };
    }

    // Step 3: Fetch the captions XML
    // Unescape any escaped characters in the URL
    const cleanCaptionUrl = captionUrl
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/");

    let captionXml;
    try {
      captionXml = await fetch(cleanCaptionUrl);
    } catch (err) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Failed to fetch captions: ${err.message}`,
        }),
      };
    }

    // Step 4: Parse the XML into timestamped lines
    const lines = parseTimedTextXml(captionXml);

    if (lines.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Captions track was found but contained no text.",
        }),
      };
    }

    const transcript = lines.join("\n");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        transcript,
        lines: lines.length,
        videoId,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Unexpected error: ${err.message}`,
      }),
    };
  }
};
