/**
 * BTB Digital Academy — TeamSnap client
 *
 * Calls /.netlify/functions/teamsnap-proxy so credentials stay server-side.
 */

const PROXY_URL = "/.netlify/functions/teamsnap-proxy";

export interface TSTeam {
  id: number;
  name: string;
}

export interface TSMember {
  id: number;
  firstName: string;
  lastName: string;
  isNonPlayer: boolean;
}

export interface TSEvent {
  id: number;
  name: string;
  startDate: string;
  locationName?: string;
}

async function tsCall<T>(action: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const search = new URLSearchParams({ action });
  Object.entries(params).forEach(([k, v]) => search.set(k, String(v)));

  try {
    const res = await fetch(`${PROXY_URL}?${search.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `TeamSnap proxy ${res.status}`);
    }
    const data = await res.json();
    return (data.items || []) as T[];
  } catch (err) {
    console.error(`Failed to fetch TeamSnap ${action}:`, err);
    return [];
  }
}

/** Boys division by default. Pass divisionId=1027768 for girls. */
export async function fetchTeams(divisionId?: number): Promise<TSTeam[]> {
  return tsCall<TSTeam>("teams", divisionId ? { divisionId } : {});
}

export async function fetchTeamEvents(teamId: number): Promise<TSEvent[]> {
  return tsCall<TSEvent>("events", { teamId });
}

export async function fetchTeamRoster(teamId: number): Promise<TSMember[]> {
  return tsCall<TSMember>("roster", { teamId });
}
