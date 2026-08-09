import { ALLOWED_ORIGINS } from "./_guard.js";

function requestOrigin(event) {
  return event.headers?.origin || event.headers?.Origin || "";
}

export function isAllowedCorsOrigin(event) {
  const origin = requestOrigin(event);
  return !origin || ALLOWED_ORIGINS.includes(origin);
}

export function corsHeaders(event, methods) {
  const origin = requestOrigin(event);
  const headers = {
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
    Vary: "Origin",
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
