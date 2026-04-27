/**
 * BTB Digital Academy — Airtable client
 *
 * Calls /.netlify/functions/airtable-proxy so credentials stay server-side.
 * Modules: players, parents, coaches, events, schedule, payments
 */

const PROXY_URL = "/.netlify/functions/airtable-proxy";

export interface AirtableRecord {
  id: string;
  [field: string]: unknown;
}

export async function fetchAirtableRecords(module: string): Promise<AirtableRecord[]> {
  try {
    const response = await fetch(`${PROXY_URL}?module=${encodeURIComponent(module)}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error || `Airtable proxy ${response.status}`);
    }
    const data = await response.json();
    return (data.records || []) as AirtableRecord[];
  } catch (err) {
    console.error(`Failed to fetch Airtable ${module}:`, err);
    return [];
  }
}
