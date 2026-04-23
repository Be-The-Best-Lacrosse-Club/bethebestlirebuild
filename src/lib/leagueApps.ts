/**
 * BTB Academy — LeagueApps Integration Service
 *
 * Fetches real-time roster and program data for the public site.
 */

const SITE_ID = '55150';
const API_KEY = '5bffdbe1c7887495552f285682df12';
const BASE_URL = 'https://public.leagueapps.io';

export interface LARegistration {
  id: number;
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  teamName?: string;
  gradYear?: number;
  status: string;
}

/**
 * Fetch registrations for a specific program.
 */
export async function fetchRoster(programId: number): Promise<LARegistration[]> {
  try {
    const res = await fetch(`${BASE_URL}/v1/sites/${SITE_ID}/programs/${programId}/registrations?la-api-key=${API_KEY}`);
    if (!res.ok) throw new Error(`LeagueApps Error: ${res.status}`);

    const data = await res.json();
    const regs = Array.isArray(data) ? data : (data.registrations || []);

    return regs.map((r: any) => ({
      id: r.registrationId || r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      jerseyNumber: r.jerseyNumber || r.uniform || '—',
      teamName: r.teamName || '',
      gradYear: r.gradYear,
      status: r.status || 'ACTIVE'
    })).filter((r: any) => r.status === 'ACTIVE');
  } catch (err) {
    console.error('Failed to fetch roster:', err);
    return [];
  }
}
