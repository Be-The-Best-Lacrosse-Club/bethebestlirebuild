// Placeholder module for src/components/Roster.tsx. The full LeagueApps client
// hasn't been wired into this repo yet — this stub keeps the build green
// while that work is in flight.

export interface LARegistration {
  id: number
  firstName: string
  lastName: string
  email?: string
  phone?: string
  teamName?: string
  jerseyNumber?: string
  status: string
}

export async function fetchRoster(_programId: number): Promise<LARegistration[]> {
  return []
}
