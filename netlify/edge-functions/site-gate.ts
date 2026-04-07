import type { Context, Config } from "@netlify/edge-functions"

// CHANGE THIS to whatever passcode you want
const SITE_PASSCODE = "BTB2026"
const COOKIE_NAME = "btb_unlocked"
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)

  // Allow Netlify Identity widget assets and tokens through
  if (
    url.pathname.startsWith("/.netlify/") ||
    url.pathname === "/confirmation" ||
    url.pathname === "/recovery" ||
    url.pathname === "/invite"
  ) {
    return context.next()
  }

  // Handle login form submission
  if (request.method === "POST" && url.pathname === "/__unlock") {
    const formData = await request.formData()
    const submitted = (formData.get("passcode") as string | null)?.trim() ?? ""

    if (submitted === SITE_PASSCODE) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": `${COOKIE_NAME}=${SITE_PASSCODE}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`,
        },
      })
    }

    return new Response(getLoginHTML(true), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  // Check for valid auth cookie
  const cookieHeader = request.headers.get("cookie") || ""
  const hasValidCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${COOKIE_NAME}=${SITE_PASSCODE}`)

  if (hasValidCookie) {
    return context.next()
  }

  // Not authenticated — return the gate page
  return new Response(getLoginHTML(false), {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}

function getLoginHTML(error: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>BTB Lacrosse — Coming Soon</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      min-height: 100vh;
      background: #000;
      color: #fff;
      font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 420px;
    }
    .header { text-align: center; margin-bottom: 32px; }
    .lock-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 9999px;
      background: rgba(210, 38, 48, 0.1);
      border: 1px solid rgba(210, 38, 48, 0.3);
      margin-bottom: 24px;
    }
    .lock-icon svg { color: #D22630; }
    h1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      color: #fff;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    form { display: flex; flex-direction: column; gap: 16px; }
    label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 8px;
    }
    input[type="password"] {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid ${error ? "#D22630" : "rgba(255, 255, 255, 0.1)"};
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="password"]:focus { border-color: #D22630; }
    .error-msg {
      color: #D22630;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    button {
      width: 100%;
      padding: 14px;
      background: #D22630;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 700;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #B01F28; }
    .footer {
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 11px;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="lock-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h1>BE THE BEST LACROSSE</h1>
      <p class="subtitle">Site Coming Soon</p>
    </div>
    <form method="POST" action="/__unlock">
      <div>
        <label for="passcode">Enter Passcode</label>
        <input type="password" id="passcode" name="passcode" autofocus autocomplete="off" placeholder="••••••••">
        ${error ? '<p class="error-msg">Incorrect passcode. Try again.</p>' : ""}
      </div>
      <button type="submit">Enter Site</button>
    </form>
    <p class="footer">BTB Lacrosse Club · Long Island, NY</p>
  </div>
</body>
</html>`
}

export const config: Config = {
  path: "/*",
}
