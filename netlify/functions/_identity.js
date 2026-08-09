const DEFAULT_SITE_URL = "https://www.bethebestli.com";

function bearerToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
  return authHeader.replace(/^Bearer\s+/i, "").trim();
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
    const roles = Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [];
    if (!allowedRoles.some((role) => roles.includes(role))) {
      return { ok: false, statusCode: 403, error: "Insufficient permissions" };
    }

    return { ok: true, user };
  } catch {
    return { ok: false, statusCode: 401, error: "Unable to verify session" };
  }
}

export const _internal = { bearerToken };
