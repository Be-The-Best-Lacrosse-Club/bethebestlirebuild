/**
 * Coach payment data — fetched live from the authenticated BTB-OS API.
 * No local payment fallback belongs in the browser bundle.
 */

const API_URL = "https://os.bethebestli.com/.netlify/functions/api-coach-payments"

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

export async function fetchCoachPayment(email: string, token: string): Promise<CoachPaymentResponse | null> {
  if (!email || !token) return null

  try {
    const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) return null
    return await res.json() as CoachPaymentResponse
  } catch {
    return null
  }
}
