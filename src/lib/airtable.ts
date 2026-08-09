/**
 * BTB Digital Academy — Airtable client
 *
 * Calls /.netlify/functions/airtable-proxy so credentials stay server-side.
 * Modules: players, parents, coaches, events, schedule, payments
 */

import { getAuthToken } from "@/lib/auth";

const PROXY_URL = "/.netlify/functions/airtable-proxy";

export interface AirtableRecord {
  id: string;
  [field: string]: unknown;
}

export async function fetchAirtableRecords(module: string): Promise<AirtableRecord[]> {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Owner login required");
    const response = await fetch(`${PROXY_URL}?module=${encodeURIComponent(module)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
