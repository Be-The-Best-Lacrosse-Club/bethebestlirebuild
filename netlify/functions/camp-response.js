/**
 * Retired legacy camp response endpoint.
 *
 * Older email links placed a sheet row and action in a GET query string, which
 * allowed guessed links and email security scanners to mutate registration
 * status. Current mini-camp confirmations link directly to payment and do not
 * use this function. Keep a non-mutating response for anyone opening an older
 * message instead of preserving the unsafe write path.
 */

const HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
  "Content-Type": "text/html; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

const BODY = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Camp response link retired</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:42rem;margin:10vh auto;padding:0 1.25rem;color:#171717}h1{line-height:1.2}a{color:#b51f29}</style></head>
<body><h1>This camp response link is no longer active.</h1><p>For attendance or payment help, email <a href="mailto:info@bethebestli.com">info@bethebestli.com</a>.</p></body></html>`;

export const handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    return { statusCode: 405, headers: { ...HEADERS, Allow: "GET, HEAD" }, body: "" };
  }

  return { statusCode: 410, headers: HEADERS, body: event.httpMethod === "HEAD" ? "" : BODY };
};
