# Interest Form → Google Sheet sync

The `/interest` form posts to Netlify Forms. This doc wires Netlify → Google Sheet so every submission appends a row.

## 1. Create the Google Sheet

1. Open https://sheets.new
2. Name it **BTB Interest Form Submissions**
3. Row 1 headers (exact order, case-sensitive):

```
Timestamp | Name | Phone | Email | Address | Category | Program | Team | Notes
```

## 2. Apps Script webhook

1. In the sheet: **Extensions → Apps Script**
2. Replace the default code with `docs/interest-form-sheets-sync.gs` (below)
3. **Deploy → New deployment → Web app**
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Copy the web-app URL (ends in `/exec`)

## 3. Netlify webhook

1. Netlify → **btb-lacrosse** → **Project configuration** → **Notifications**
2. Add a notification → **Outgoing webhook**
3. Event: **Form submission**
4. URL: paste the Apps Script web-app URL
5. Form: **interest-form**
6. Save.

Every new submission now fires the webhook → the Apps Script appends a row.

## Troubleshooting

- **No rows appearing** → in the sheet, check **Extensions → Apps Script → Executions** for errors. Most common: redeploy with a new version (Apps Script caches old code).
- **403 at webhook** → the web-app deployment access must be **Anyone**, not **Anyone with Google account**.
- **Form name mismatch** → the form must be named `interest-form` in both `index.html` and `InterestFormPage.tsx`.
