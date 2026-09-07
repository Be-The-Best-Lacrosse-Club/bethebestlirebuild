import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGeminiVideoRequest,
  parseGeminiPlays,
} from "../netlify/functions/_gemini-video-analysis.mjs";

test("Gemini receives a YouTube URL as video input with enough capacity for a full game", () => {
  const request = buildGeminiVideoRequest(
    "https://www.youtube.com/watch?v=jm_U5lhF5Rk",
    "Analyze the game",
  );

  assert.deepEqual(request.contents[0].parts[0], {
    file_data: {
      file_uri: "https://www.youtube.com/watch?v=jm_U5lhF5Rk",
    },
  });
  assert.deepEqual(request.contents[0].parts[1], { text: "Analyze the game" });
  assert.equal(request.generationConfig.mediaResolution, "MEDIA_RESOLUTION_LOW");
  assert.equal(request.generationConfig.responseMimeType, "application/json");
  assert.equal(request.generationConfig.maxOutputTokens, 65536);
  assert.equal(request.generationConfig.responseJsonSchema.type, "array");
});

test("complete structured Gemini output parses normally", () => {
  const output = parseGeminiPlays('[{"event_sequence":1},{"event_sequence":2}]');

  assert.equal(output.partial, false);
  assert.deepEqual(output.plays, [
    { event_sequence: 1 },
    { event_sequence: 2 },
  ]);
});

test("a token-truncated JSON array preserves every complete play", () => {
  const truncated = `\`\`\`json
[
  {"event_sequence":1,"event_summary":"Goal after a comma, then a dodge"},
  {"event_sequence":2,"event_summary":"Save with a \\\"quoted\\\" call"},
  {"event_sequence":3,"event_summary":"unfinished`;

  const output = parseGeminiPlays(truncated, { finishReason: "MAX_TOKENS" });

  assert.equal(output.partial, true);
  assert.deepEqual(output.plays.map((play) => play.event_sequence), [1, 2]);
});

test("malformed non-truncated Gemini output remains an error", () => {
  assert.throws(
    () => parseGeminiPlays("I cannot analyze that link", { finishReason: "STOP" }),
    /valid JSON play array/,
  );
});
