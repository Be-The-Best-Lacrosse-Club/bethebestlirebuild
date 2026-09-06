import { identityRoles } from "../../shared/access-roles.js";
const DEFAULT_SITE_URL = "https://www.bethebestli.com";

function headerValue(event, name) {
  if (typeof event.headers?.get === "function") {
    return event.headers.get(name) || "";
  }
  const match = Object.entries(event.headers || {}).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return match?.[1] || "";
}

function cookieValue(event, name) {
  const cookieHeader = headerValue(event, "cookie");
  const prefix = `${name}=`;
  const cookie = cookieHeader.split(/;\s*/).find((entry) => entry.startsWith(prefix));
  if (!cookie) return "";
  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

function bearerToken(event) {
  const authHeader = headerValue(event, "authorization");
  return authHeader.replace(/^Bearer\s+/i, "").trim() || cookieValue(event, "nf_jwt");
}

export async function authorizeIdentity(
  event,
  allowedRoles,
  { fetchImpl = fetch, siteUrl = process.env.URL || DEFAULT_SITE_URL } = {},
) {
  const token = bearerToken(event);
  if (!token) {
    return { ok: false, statusCode: 401, error: "Authentication required" };
  }

  try {
    const identityUrl = `${String(siteUrl).replace(/\/$/, "")}/.netlify/identity/user`;
    const response = await fetchImpl(identityUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return { ok: false, statusCode: 401, error: "Invalid or expired session" };
    }

    const user = await response.json();
    const roles = identityRoles(user);
    if (!allowedRoles.some((role) => roles.includes(role))) {
      return { ok: false, statusCode: 403, error: "Insufficient permissions" };
    }

    return { ok: true, user };
  } catch {
    return { ok: false, statusCode: 401, error: "Unable to verify session" };
  }
}

export const _internal = { bearerToken, cookieValue, headerValue };
