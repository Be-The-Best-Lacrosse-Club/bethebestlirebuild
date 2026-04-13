/**
 * Coach payment data — fetched live from BTB-OS API.
 * Falls back to local data if the API is unreachable.
 */

const API_URL = "https://btb-os.netlify.app/.netlify/functions/api-coach-payments"

export interface CoachPayment {
  firstName: string
  lastName: string
  role: string
  title: string
  teamAssignment?: string
  seasonContract: number
}

export interface PaymentInstallment {
  label: string
  date: string
  status: "paid" | "scheduled" | "upcoming"
  amount: number
}

export interface CoachPaymentResponse {
  found: boolean
  season: string
  coach?: CoachPayment
  installments?: PaymentInstallment[]
}

/**
 * Fetch a coach's payment data from the BTB-OS API by email.
 * Returns null if the coach isn't found or the API fails.
 */
export async function fetchCoachPayment(email: string): Promise<CoachPaymentResponse | null> {
  if (!email) return null

  try {
    const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`, {
      headers: { Accept: "application/json" },
    })

    if (!res.ok) return null

    const data = await res.json()
    return data as CoachPaymentResponse
  } catch {
    // API unreachable — fall back to local data
    return getLocalCoachPayment(email)
  }
}

// ─── Local fallback data ────────────────────────────────────────────────────

interface LocalCoach {
  firstName: string
  lastName: string
  email: string
  role: string
  title: string
  teamAssignment?: string
  seasonContract: number
}

const FALLBACK_SEASON = "Spring 2026"

const FALLBACK_INSTALLMENTS: { label: string; date: string; status: "paid" | "scheduled" | "upcoming" }[] = [
  { label: "Payment 1 of 3", date: "2026-02-15", status: "paid" },
  { label: "Payment 2 of 3", date: "2026-04-01", status: "paid" },
  { label: "Payment 3 of 3", date: "2026-05-15", status: "scheduled" },
]

const FALLBACK_COACHES: LocalCoach[] = [
  { firstName: "Dan", lastName: "Achatz", email: "info@bethebestli.com", role: "director", title: "Founder & Girls Program Director", seasonContract: 15000 },
  { firstName: "Sean", lastName: "Reynolds", email: "btb.director.reynolds@gmail.com", role: "director", title: "Boys Program Director", teamAssignment: "Boys Program", seasonContract: 9000 },
  { firstName: "Marisa", lastName: "D'Angelo", email: "marisadangelo321@gmail.com", role: "director", title: "Girls Futures Director", teamAssignment: "Girls Futures", seasonContract: 9000 },
  { firstName: "Peter", lastName: "Ferrizz", email: "btblacrosseteams@gmail.com", role: "admin", title: "Operations", seasonContract: 6000 },
  { firstName: "Erynn", lastName: "Rocovich", email: "erynn.rocovich@gmail.com", role: "coach", title: "Head Coach", teamAssignment: "2030 Tidal Wave", seasonContract: 7500 },
  { firstName: "Hunter", lastName: "Isnardi", email: "hunterisnardi4@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2031 CYCLONES", seasonContract: 4000 },
  { firstName: "Nick", lastName: "Nicolosi", email: "nnicolosi42@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2033 RENEGADES", seasonContract: 4000 },
  { firstName: "Nick", lastName: "Defelice", email: "nickdefelice50@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2032 CANNONS", seasonContract: 4000 },
  { firstName: "Tommy", lastName: "Brewer", email: "brewu024@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2034 SNIPERS", seasonContract: 4000 },
  { firstName: "Brian", lastName: "Himberger", email: "brian.himberger@oerlikon.com", role: "coach", title: "Assistant Coach", teamAssignment: "2034 SNIPERS", seasonContract: 4000 },
  { firstName: "Jeff", lastName: "Schaefer", email: "jeffschaefer87@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 BOMBERS", seasonContract: 4000 },
  { firstName: "Brian", lastName: "Gubelli", email: "bgubelli@hotmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 BOMBERS", seasonContract: 4000 },
  { firstName: "James", lastName: "Rao", email: "laxrao3@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 BOMBERS", seasonContract: 4000 },
  { firstName: "Ryan", lastName: "Quinn", email: "rtq15@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 BOMBERS", seasonContract: 4000 },
  { firstName: "Dan", lastName: "Sciulla", email: "dsciulla32@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2036 DAWGS", seasonContract: 4000 },
  { firstName: "Frank", lastName: "Ingenito", email: "f.inge1386@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2036 DAWGS", seasonContract: 4000 },
  { firstName: "Scott", lastName: "Bryan", email: "sbryan2683@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2031 CARNAGE", seasonContract: 4000 },
  { firstName: "JT", lastName: "Prior", email: "jtprior@btb.com", role: "coach", title: "Assistant Coach", teamAssignment: "2031 CARNAGE", seasonContract: 4000 },
  { firstName: "Jake", lastName: "Oemcke", email: "jake.oemcke@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2032 CANNONS", seasonContract: 4000 },
  { firstName: "Justin", lastName: "Anderson", email: "anderson.justin720@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2033 RENEGADES", seasonContract: 4000 },
  { firstName: "Matthew", lastName: "Roberts", email: "matthew.thomas.roberts@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2033 RENEGADES", seasonContract: 4000 },
  { firstName: "Alex", lastName: "Leggio", email: "aleggiolax2022@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2033 RED STORM", seasonContract: 4000 },
  { firstName: "Christian", lastName: "Trasolini", email: "cftrasolini@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2030 Rage", seasonContract: 4000 },
  { firstName: "Ryan", lastName: "Smith", email: "rsmith@btb.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 Tornadoes", seasonContract: 4000 },
  { firstName: "Steven", lastName: "Bentz", email: "steven@bethebestli.com", role: "coach", title: "Assistant Coach", teamAssignment: "Boys Program", seasonContract: 4000 },
  { firstName: "Brad", lastName: "McLam", email: "brad@bethebestli.com", role: "coach", title: "Assistant Coach", teamAssignment: "Girls Program", seasonContract: 4000 },
  { firstName: "Emma", lastName: "McLam", email: "emma@bethebestli.com", role: "coach", title: "Girls Draw Director", teamAssignment: "Girls Program", seasonContract: 4000 },
  { firstName: "Ava", lastName: "Hernandez", email: "avahernandez16@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2034 TSUNAMI", seasonContract: 4000 },
  { firstName: "Kerrin", lastName: "Heuser", email: "kheuser17@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2033 RED STORM", seasonContract: 4000 },
  { firstName: "Lily", lastName: "Bilello", email: "lilybilello36@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2032 RIPTIDE", seasonContract: 4000 },
  { firstName: "Tara", lastName: "Babnik", email: "tarababnik@icloud.com", role: "coach", title: "Assistant Coach", teamAssignment: "2034 TSUNAMI", seasonContract: 4000 },
  { firstName: "Juliana", lastName: "Keenan", email: "julesk327@gmail.com", role: "coach", title: "Assistant Coach", teamAssignment: "2031 CYCLONES", seasonContract: 4000 },
  { firstName: "Danielle", lastName: "Carson", email: "daniellecarson4@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 HURRICANES", seasonContract: 4000 },
  { firstName: "Megan", lastName: "Gordon", email: "mgordon@btb.com", role: "coach", title: "Assistant Coach", teamAssignment: "2035 HURRICANES", seasonContract: 4000 },
  { firstName: "Krista", lastName: "Ancona", email: "kancona10@yahoo.com", role: "coach", title: "Assistant Coach", teamAssignment: "2036 Avalanche", seasonContract: 4000 },
  { firstName: "Aidan", lastName: "DeRupo", email: "derupoaiden@gmail.com", role: "trainer", title: "Trainer", teamAssignment: "2036 DAWGS", seasonContract: 3000 },
]

function getLocalCoachPayment(email: string): CoachPaymentResponse | null {
  const normalized = email.toLowerCase().trim()
  const coach = FALLBACK_COACHES.find((c) => c.email.toLowerCase() === normalized)
  if (!coach) return { found: false, season: FALLBACK_SEASON }

  const perPayment = Math.round((coach.seasonContract / 3) * 100) / 100
  return {
    found: true,
    season: FALLBACK_SEASON,
    coach: {
      firstName: coach.firstName,
      lastName: coach.lastName,
      role: coach.role,
      title: coach.title,
      teamAssignment: coach.teamAssignment,
      seasonContract: coach.seasonContract,
    },
    installments: FALLBACK_INSTALLMENTS.map((inst) => ({
      ...inst,
      amount: perPayment,
    })),
  }
}
