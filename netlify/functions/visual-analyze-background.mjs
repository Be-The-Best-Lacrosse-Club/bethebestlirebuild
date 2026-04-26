/**
 * visual-analyze-background — Gemini native video understanding for film breakdown.
 *
 * Background function variant: the file's `-background` suffix tells Netlify to
 * return 202 to the client immediately and let this function run up to 15min.
 * The result is written to Netlify Blobs at key `visual/${jobId}`. The client
 * polls /visual-result?jobId=X to retrieve it.
 *
 * Replaces the synchronous visual-analyze.js, which was hitting Netlify's ~30s
 * CDN edge timeout on full-game Gemini analyses and returning HTML to clients.
 *
 * POST body: { jobId, youtube_url, video_id, game_title, level?, focus? }
 *   jobId is generated client-side (any opaque string) so the client knows
 *   what to poll for. Must be URL-safe.
 */

import { getStore } from "@netlify/blobs";

const VISUAL_PROMPT = `You are an expert lacrosse film analyst for BTB Lacrosse Club on Long Island, NY.
Watch this lacrosse game video and identify EVERY notable play — not just the highlights.

For EACH play, return a JSON object with these EXACT fields (use these exact key names):
  event_sequence: (number, starting at 1)
  source_start_seconds: (number — start time in seconds when the play begins)
  source_end_seconds: (number — end time in seconds when the play ends)
  play_result: (one of: goal, save, turnover, ground_ball, clear_success, clear_fail, faceoff_win, faceoff_loss, shot_on_goal, shot_off_target, caused_turnover, penalty)
  team_focus: (one of: offense, defense)
  phase: (one of: "Offense - Settled 6v6", "Offense - Early Offense / Transition", "Offense - EMO", "Defense - Settled 6v6", "Defense - Recovery", "Defense - Man Down", "Faceoff", "Clear", "Ride")
  category: (one of: "Advantage Created", "Finish", "Shot Quality Win", "Decision Error", "Defensive Stop", "On Ball Win", "Slide Recover Win", "GB Win", "Faceoff Win", "Clear Success", "Ride Stop", "Special Teams Win")
  tags: (array of 2-5 tags from: dodge-downhill, paint-touch, draw-two, one-more, inside-feed, two-man-game, step-down, on-the-run, crease-finish, shot-selection-good, shot-selection-poor, approach-angle-win, top-side-denial, hot-slide, second-slide, recover-out, communication-win, gb-toughness, clamp-win, decision-making-plus, decision-making-minus, compete-plus, iq-off-ball, coachable-error)
  main_teaching_point: (one sentence — the key coaching takeaway from this play)
  event_summary: (one sentence — what happened on the play)
  players: (array of player references — see PLAYER NAMING below)
  period: (string — "1", "2", "3", "4", or "OT" if visible on scoreboard, else "")
  clock: (string — game clock if visible e.g. "8:32", else "")
  score_state: (string — score if visible e.g. "3-2", else "")
  ai_confidence: (number 0-1 — how confident you are in this play identification)

CRITICAL — VARIETY REQUIREMENT:
Goals are roughly 5–10% of plays in a real game. If your output is mostly goals you have failed.
For a typical full game (24-32 minutes of play), return AT LEAST 25 plays spanning these categories:
- Faceoffs (every faceoff: who clamped, who got the GB)
- Ground balls (every contested GB)
- Shot attempts (goals, saves, AND shots that missed the cage or hit the pipe)
- Goalie saves
- Turnovers (caused turnovers AND unforced)
- Defensive slides and recoveries
- Clears (success and failure)
- Rides (success and failure)
- EMO / man-down possessions (each one)
- Notable dodges that did NOT result in a shot (advantage created or denied)
- Communication wins/losses (sliding correctly, recovering, hot-slide arriving on time)

For shorter clips, tag every visible play.

PLAYER NAMING:
- Default to jersey numbers like "#7" or "#22"
- IF a roster is provided in the CONTEXT section below, use the provided names whenever
  the visible jersey number matches a roster entry, e.g. ["#7 Jace", "#22 Skelly"]
- If a jersey is not visible, use [] for players

Return ONLY a JSON array of play objects. No markdown, no explanation, no wrapper object.`;

const STORE_NAME = "film-breakdown-jobs";

function safeJobId(id) {
  // Allow alnum, dash, underscore. Anything else collapses to empty (which
  // the result endpoint will treat as not-found).
  return /^[A-Za-z0-9_-]{1,128}$/.test(id) ? id : "";
}

async function writeJob(jobId, payload) {
  if (!jobId) return;
  const store = getStore(STORE_NAME);
  await store.setJSON(jobId, { ...payload, updatedAt: new Date().toISOString() });
}

export default async (req) => {
  // Background functions still receive the request; we just don't expose
  // a meaningful response to the client (Netlify returns 202 immediately).
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { youtube_url, video_id, game_title, level, focus, roster_text } = body;
  const jobId = safeJobId(body.jobId || "");

  if (!jobId) {
    return new Response(JSON.stringify({ error: "Missing or invalid jobId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!youtube_url) {
    await writeJob(jobId, { status: "error", error: "youtube_url is required" });
    return new Response(JSON.stringify({ error: "youtube_url is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    await writeJob(jobId, { status: "error", error: "GEMINI_API_KEY not configured" });
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Mark the job as in-flight so the client poller sees a state immediately.
  await writeJob(jobId, { status: "pending", startedAt: new Date().toISOString() });

  // Do the long-running work. Errors are caught and recorded so the client
  // poller can surface them — never let this throw uncaught.
  try {
    const videoUrl = youtube_url.startsWith("http")
      ? youtube_url
      : `https://www.youtube.com/watch?v=${video_id}`;

    const contextLines = [
      game_title ? `Game: ${game_title}` : "",
      level      ? `Level: ${level}`     : "",
      focus && focus !== "all" && focus !== "both" ? `Focus: ${focus} plays only` : "",
    ].filter(Boolean).join("\n");

    const rosterTrim = (roster_text || "").trim().slice(0, 4000);
    const rosterBlock = rosterTrim ? `\n\nROSTER (use these names when jersey numbers match):\n${rosterTrim}` : "";

    const promptText = VISUAL_PROMPT
      + (contextLines ? `\n\n--- CONTEXT ---\n${contextLines}` : "")
      + rosterBlock;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `VIDEO URL: ${videoUrl}\n\n${promptText}` }],
          }],
          generationConfig: {
            maxOutputTokens: 16384,
            temperature: 0.2,
          },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      await writeJob(jobId, {
        status: "error",
        error: `Gemini video analysis failed: ${errText.slice(0, 400)}`,
        suggestion: "Make sure the YouTube URL is public and accessible.",
      });
      return new Response("", { status: 200 });
    }

    const geminiData = await resp.json();
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      const blockReason = geminiData.promptFeedback?.blockReason;
      await writeJob(jobId, {
        status: "error",
        error: blockReason
          ? `Video blocked by Gemini safety filter: ${blockReason}`
          : "Gemini returned no candidates. The video may be private, age-restricted, or unsupported.",
      });
      return new Response("", { status: 200 });
    }

    const rawText = candidate.content?.parts?.[0]?.text ?? "";
    if (!rawText) {
      await writeJob(jobId, { status: "error", error: "Gemini returned an empty response for this video." });
      return new Response("", { status: 200 });
    }

    let plays;
    try {
      let cleaned = rawText.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
      const arrStart = cleaned.indexOf("[");
      const arrEnd = cleaned.lastIndexOf("]");
      if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
        cleaned = cleaned.slice(arrStart, arrEnd + 1);
      }
      plays = JSON.parse(cleaned);
      if (!Array.isArray(plays)) {
        plays = plays.plays ?? plays.events ?? plays.data ?? [];
      }
    } catch {
      await writeJob(jobId, {
        status: "error",
        error: "Gemini returned text that could not be parsed as JSON. The video may not be supported for visual analysis.",
        hint: "Try a video with captions enabled, or a shorter clip.",
        raw: rawText.slice(0, 300),
      });
      return new Response("", { status: 200 });
    }

    const vid = video_id || (youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? "");
    plays = plays.map((p, i) => {
      // Gemini returns source_start_seconds per the prompt schema. Older shape used
      // `start` — keep that as a fallback so we always produce a clickable timestamp.
      const startSec = Number(p.source_start_seconds ?? p.start ?? 0);
      return {
        ...p,
        index: i,
        youtube_url: vid
          ? `https://www.youtube.com/watch?v=${vid}&t=${Math.floor(startSec)}s`
          : videoUrl,
        teaching_points: p.main_teaching_point
          ? [p.main_teaching_point]
          : (p.teaching_point ? [p.teaching_point] : []),
        source: "gemini-visual",
      };
    });

    await writeJob(jobId, {
      status: "done",
      plays,
      count: plays.length,
      source: "gemini-visual",
    });
    return new Response("", { status: 200 });
  } catch (err) {
    await writeJob(jobId, { status: "error", error: String(err?.message ?? err) });
    return new Response("", { status: 200 });
  }
};
