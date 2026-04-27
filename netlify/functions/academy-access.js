/**
 * academy-access.js — Netlify Serverless Function
 *
 * Verifies whether a user is a BTB member (has a Netlify Identity account)
 * and returns the correct academy pricing tier.
 *
 * POST /.netlify/functions/academy-access
 * Body: { token: string }   ← the user's Netlify Identity JWT
 *
 * Response:
 *   { isMember: true,  tier: "btb",     price: 30,  name: "...", email: "..." }
 *   { isMember: false, tier: "public",  price: 75 }
 *   { error: "..." }
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  let token
  try {
    const body = JSON.parse(event.body || "{}")
    token = body.token
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid request body" }),
    }
  }

  // No token → public pricing
  if (!token) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ isMember: false, tier: "public", price: 75 }),
    }
  }

  try {
    // Verify the token against Netlify Identity admin API
    const siteUrl = process.env.URL || "https://www.bethebestli.com"
    const identityUrl = `${siteUrl}/.netlify/identity`

    const res = await fetch(`${identityUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      // Token invalid or expired → public pricing
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ isMember: false, tier: "public", price: 75 }),
      }
    }

    const userData = await res.json()
    const name = userData.user_metadata?.full_name || userData.email?.split("@")[0] || "BTB Member"
    const email = userData.email || ""
    const roles = userData.app_metadata?.roles || []
    const role = roles.includes("owner") ? "owner"
               : roles.includes("coach") ? "coach"
               : "player"

    // Valid Netlify Identity user = BTB member → $30
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        isMember: true,
        tier: "btb",
        price: 30,
        name,
        email,
        role,
      }),
    }
  } catch (err) {
    console.error("academy-access error:", err)
    // On any error → fall back to public pricing, don't block
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ isMember: false, tier: "public", price: 75 }),
    }
  }
}
