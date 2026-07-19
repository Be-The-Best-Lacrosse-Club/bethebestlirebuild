/**
 * academy-checkout.js — Netlify Serverless Function
 *
 * Creates a Stripe Checkout Session for BTB Digital Academy access.
 * Called from the academy landing page when a user clicks Get Access.
 *
 * POST /.netlify/functions/academy-checkout
 * Body: { tier: "btb" | "public", email?: string, name?: string }
 *
 * Response: { url: string }  — Stripe hosted checkout URL to redirect to
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
}

// Price IDs created in Stripe for BTB account acct_1FDHTIGJiT62K6k4
const PRICES = {
  btb:    "price_1TQYWlGJiT62K6k4wAJr7vPJ",  // $30 — BTB member
  public: "price_1TQYWmGJiT62K6k4oRVwjoAe",  // $75 — public
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

  const sk = process.env.STRIPE_SECRET_KEY
  if (!sk) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Stripe not configured" }),
    }
  }

  let requestedTier, bodyEmail, bodyName, token
  try {
    const body = JSON.parse(event.body || "{}")
    requestedTier = body.tier === "btb" ? "btb" : "public"
    bodyEmail     = body.email || undefined
    bodyName      = body.name  || undefined
    token         = body.token || undefined
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid request body" }),
    }
  }

  // If the caller asked for the BTB member rate, verify their identity server-side.
  // Without a valid Netlify Identity JWT we downgrade to public pricing — never
  // trust the client to claim membership on its own.
  let tier  = "public"
  let email = bodyEmail
  let name  = bodyName

  if (requestedTier === "btb" && token) {
    const siteUrl = process.env.URL || "https://www.bethebestli.com"
    try {
      const idRes = await fetch(`${siteUrl}/.netlify/identity/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (idRes.ok) {
        const verifiedUser = await idRes.json()
        tier  = "btb"
        email = verifiedUser.email || bodyEmail
        name  = verifiedUser.user_metadata?.full_name || bodyName
      }
    } catch (err) {
      console.error("identity verification failed:", err)
      // Fall through with tier = "public"
    }
  }

  const priceId = PRICES[tier]
  const origin  = event.headers?.origin || event.headers?.referer?.replace(/\/$/, "") || "https://www.bethebestli.com"

  // Build Stripe Checkout Session via REST API (no SDK needed)
  const params = new URLSearchParams({
    "mode": "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "success_url": `${origin}/academy-success.html?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url":  `${origin}/academy-landing.html#pricing`,
    "payment_method_types[0]": "card",
    "metadata[tier]": tier,
    "metadata[source]": "btb-academy-landing",
  })

  // Pre-fill email if we have it (member flow)
  if (email) {
    params.set("customer_email", email)
  }

  // Custom text showing what they're buying
  if (tier === "btb") {
    params.set("custom_text[submit][message]", "You're getting the BTB member rate. Full member Academy access for the season.")
  } else {
    params.set("custom_text[submit][message]", "Public Video Academy access for the season. General video lessons, film study, and player education only.")
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sk}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const session = await res.json()

    if (!res.ok) {
      console.error("Stripe error:", session)
      return {
        statusCode: 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: session?.error?.message || "Stripe error" }),
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error("academy-checkout error:", err)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Internal error" }),
    }
  }
}
