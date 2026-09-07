const PLAY_RESULTS = [
  "goal",
  "save",
  "turnover",
  "ground_ball",
  "clear_success",
  "clear_fail",
  "faceoff_win",
  "faceoff_loss",
  "shot_on_goal",
  "shot_off_target",
  "caused_turnover",
  "penalty",
];

const TEAM_FOCUS = ["offense", "defense"];

const PHASES = [
  "Offense - Settled 6v6",
  "Offense - Early Offense / Transition",
  "Offense - EMO",
  "Defense - Settled 6v6",
  "Defense - Recovery",
  "Defense - Man Down",
  "Faceoff",
  "Clear",
  "Ride",
];

const CATEGORIES = [
  "Advantage Created",
  "Finish",
  "Shot Quality Win",
  "Decision Error",
  "Defensive Stop",
  "On Ball Win",
  "Slide Recover Win",
  "GB Win",
  "Faceoff Win",
  "Clear Success",
  "Ride Stop",
  "Special Teams Win",
];

const TAGS = [
  "dodge-downhill",
  "paint-touch",
  "draw-two",
  "one-more",
  "inside-feed",
  "two-man-game",
  "step-down",
  "on-the-run",
  "crease-finish",
  "shot-selection-good",
  "shot-selection-poor",
  "approach-angle-win",
  "top-side-denial",
  "hot-slide",
  "second-slide",
  "recover-out",
  "communication-win",
  "gb-toughness",
  "clamp-win",
  "decision-making-plus",
  "decision-making-minus",
  "compete-plus",
  "iq-off-ball",
  "coachable-error",
];

export const PLAY_ARRAY_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      event_sequence: { type: "integer", minimum: 1 },
      source_start_seconds: { type: "number", minimum: 0 },
      source_end_seconds: { type: "number", minimum: 0 },
      play_result: { type: "string", enum: PLAY_RESULTS },
      team_focus: { type: "string", enum: TEAM_FOCUS },
      phase: { type: "string", enum: PHASES },
      category: { type: "string", enum: CATEGORIES },
      tags: {
        type: "array",
        minItems: 2,
        maxItems: 5,
        items: { type: "string", enum: TAGS },
      },
      main_teaching_point: { type: "string" },
      event_summary: { type: "string" },
      players: { type: "array", items: { type: "string" } },
      period: { type: "string" },
      clock: { type: "string" },
      score_state: { type: "string" },
      ai_confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: [
      "event_sequence",
      "source_start_seconds",
      "source_end_seconds",
      "play_result",
      "team_focus",
      "phase",
      "category",
      "tags",
      "main_teaching_point",
      "event_summary",
      "players",
      "period",
      "clock",
      "score_state",
      "ai_confidence",
    ],
  },
};

export function buildGeminiVideoRequest(videoUrl, promptText) {
  return {
    contents: [{
      role: "user",
      parts: [
        { file_data: { file_uri: videoUrl } },
        { text: promptText },
      ],
    }],
    generationConfig: {
      // Full broadcasts commonly exceed an hour. Low media resolution keeps up
      // to roughly three hours inside Gemini 2.5 Flash's input context.
      mediaResolution: "MEDIA_RESOLUTION_LOW",
      // The model supports 65,536 output tokens. The former 16,384 limit cut
      // long play arrays off mid-object and caused the entire result to fail.
      maxOutputTokens: 65536,
      responseMimeType: "application/json",
      responseJsonSchema: PLAY_ARRAY_SCHEMA,
      temperature: 0.2,
    },
  };
}

function stripMarkdownFence(text) {
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function unwrapPlayArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;
  for (const key of ["plays", "events", "data"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  return null;
}

function recoverCompleteObjects(text) {
  const arrayStart = text.indexOf("[");
  if (arrayStart === -1) return [];

  const objects = [];
  let objectStart = -1;
  let objectDepth = 0;
  let inString = false;
  let escaped = false;

  for (let index = arrayStart + 1; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (objectDepth === 0) objectStart = index;
      objectDepth += 1;
      continue;
    }

    if (char === "}" && objectDepth > 0) {
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart !== -1) {
        try {
          objects.push(JSON.parse(text.slice(objectStart, index + 1)));
        } catch {
          // Keep scanning. Only individually valid, complete objects are safe.
        }
        objectStart = -1;
      }
    }
  }

  return objects;
}

export function parseGeminiPlays(rawText, { finishReason = "" } = {}) {
  const cleaned = stripMarkdownFence(rawText);

  try {
    let jsonText = cleaned;
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      jsonText = cleaned.slice(arrayStart, arrayEnd + 1);
    }

    const plays = unwrapPlayArray(JSON.parse(jsonText));
    if (!plays) throw new Error("Gemini did not return a play array");
    return { plays, partial: false };
  } catch (error) {
    const looksTruncated = finishReason === "MAX_TOKENS"
      || (cleaned.includes("[") && !cleaned.includes("]"));
    if (looksTruncated) {
      const plays = recoverCompleteObjects(cleaned);
      if (plays.length > 0) return { plays, partial: true };
    }

    throw new Error("Gemini did not return a valid JSON play array", { cause: error });
  }
}
