import type { User, UserRole, Gender } from "@/types"

const STORAGE_KEY = "btb-auth-user"

// Demo accounts for development — replace with Wix member auth later
const DEMO_USERS: User[] = [
  { id: "p-boys-1", email: "player@btb.com", name: "Demo Player", role: "player", gender: "boys", gradYear: "2030" },
  { id: "c-boys-1", email: "coach@btb.com", name: "Demo Coach", role: "coach", gender: "boys" },
  { id: "p-girls-1", email: "player-girls@btb.com", name: "Demo Player", role: "player", gender: "girls", gradYear: "2032" },
  { id: "c-girls-1", email: "coach-girls@btb.com", name: "Demo Coach", role: "coach", gender: "girls" },
]

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function login(email: string, password: string): User | null {
  // Demo: any password works, just match email
  const user = DEMO_USERS.find((u) => u.email === email)
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }
  return null
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  return getStoredUser() !== null
}

export function hasRole(role: UserRole): boolean {
  const user = getStoredUser()
  return user?.role === role
}

export function hasAccess(gender: Gender, role: UserRole): boolean {
  const user = getStoredUser()
  if (!user) return false
  return user.gender === gender && user.role === role
}
