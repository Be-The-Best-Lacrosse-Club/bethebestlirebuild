// BTB Interest Form → Google Sheet webhook handler
// Paste into Extensions → Apps Script of the target sheet, then Deploy → Web app.
// Execute as: Me. Access: Anyone.

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const payload = JSON.parse(e.postData.contents);
    const data = payload.data || payload; // Netlify wraps submission under `data`

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.address || "",
      data.interestCategory || "",
      data.interestProgram || "",
      data.interestTeam || "",
      data.notes || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
