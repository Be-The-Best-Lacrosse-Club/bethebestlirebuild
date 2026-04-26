/**
 * visual-result — fetch the result of a visual-analyze-background job.
 *
 * The client polls this endpoint while a film-breakdown job is running.
 * Background function writes status/results to Blobs; this reads them back.
 *
 * GET /.netlify/functions/visual-result?jobId=X
 * Response: { status: "pending" | "done" | "error", ...payload }
 *           404 if no record exists for the jobId.
 */

import { getStore } from "@netlify/blobs";

const STORE_NAME = "film-breakdown-jobs";

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "GET only" }), { status: 405, headers });
  }

  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId") || "";

  if (!/^[A-Za-z0-9_-]{1,128}$/.test(jobId)) {
    return new Response(JSON.stringify({ error: "Missing or invalid jobId" }), { status: 400, headers });
  }

  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(jobId, { type: "json" });
    if (!data) {
      // Race: client polled before background fn wrote the first "pending"
      // entry. Tell client to keep polling rather than fail.
      return new Response(JSON.stringify({ status: "pending" }), { status: 200, headers });
    }
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), { status: 500, headers });
  }
};
