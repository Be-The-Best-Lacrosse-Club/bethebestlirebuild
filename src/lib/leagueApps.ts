/**
 * BTB Academy — LeagueApps Integration Service
 *
 * Fetches real-time roster and program data for the public site.
 */

const ROSTER_ENDPOINT = '/.netlify/functions/leagueapps-roster';

export interface LARegistration {
  id: number;
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  teamName?: string;
  gradYear?: number;
  status: string;
}

type RawRegistration = {
  registrationId?: number;
  id?: number;
  firstName?: string;
  lastName?: string;
  jerseyNumber?: string;
  uniform?: string;
  teamName?: string;
  gradYear?: number;
  status?: string;
}

/**
 * Fetch registrations for a specific program.
 */
export async function fetchRoster(programId: number): Promise<LARegistration[]> {
  try {
    const res = await fetch(`${ROSTER_ENDPOINT}?programId=${encodeURIComponent(String(programId))}`);
    if (!res.ok) throw new Error(`LeagueApps Error: ${res.status}`);

    const data = await res.json();
    const regs: RawRegistration[] = Array.isArray(data) ? data : (data.registrations || []);

    return regs.map((r) => ({
      id: r.registrationId || r.id || 0,
      firstName: r.firstName || '',
      lastName: r.lastName || '',
      jerseyNumber: r.jerseyNumber || r.uniform || '—',
      teamName: r.teamName || '',
      gradYear: r.gradYear,
      status: r.status || 'ACTIVE'
    })).filter((r) => r.status === 'ACTIVE');
  } catch (err) {
    console.error('Failed to fetch roster:', err);
    return [];
  }
}
