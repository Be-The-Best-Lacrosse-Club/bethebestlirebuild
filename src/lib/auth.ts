import GoTrue, { User as GoTrueUser } from "gotrue-js"
import type { User, UserRole, Gender } from "@/types"

// Initialize GoTrue client — points to /.netlify/identity by default
const auth = new GoTrue({
  APIUrl: `${window.location.origin}/.netlify/identity`,
  setCookie: false,
})

export { auth }

/**
 * Map a Netlify Identity (GoTrue) user object to the app's User type.
 * Roles come from app_metadata.roles (set via Netlify admin dashboard).
 * Program (boys/girls) comes from user_metadata.program.
 */
export function mapNetlifyUser(gotrueUser: GoTrueUser | null): User | null {
  if (!gotrueUser) return null

  const roles: string[] = gotrueUser.app_metadata?.roles ?? []
  const role: UserRole = roles.includes("owner")
    ? "owner"
    : roles.includes("coach")
      ? "coach"
      : "player"

  const program = (gotrueUser.user_metadata?.program as string) || "boys"
  const gender: Gender = program === "girls" ? "girls" : "boys"

  return {
    id: gotrueUser.id ?? "",
    email: gotrueUser.email ?? "",
    name: (gotrueUser.user_metadata?.full_name as string) || gotrueUser.email?.split("@")[0] || "",
    role,
    gender,
    gradYear: (gotrueUser.user_metadata?.grad_year as string) || undefined,
  }
}

/**
 * Log in with email + password via GoTrue.
 * Returns the mapped User on success, throws on failure.
 */
export async function login(email: string, password: string): Promise<User> {
  const gotrueUser = await auth.login(email, password, true)
  const user = mapNetlifyUser(gotrueUser)
  if (!user) throw new Error("Login failed — could not read user data.")
  return user
}

/**
 * Sign up with email + password + metadata.
 * After signup, the user may need to confirm their email before they can log in.
 */
export async function signup(
  email: string,
  password: string,
  fullName: string,
  program: Gender,
  gradYear?: string,
): Promise<{ requiresConfirmation: boolean }> {
  const result = await auth.signup(email, password, {
    full_name: fullName,
    program,
    grad_year: gradYear,
  })
  // If email confirmation is required, the user object won't have a token yet
  const requiresConfirmation = !result.token
  return { requiresConfirmation }
}

/**
 * Log out the current user.
 */
export async function logout(): Promise<void> {
  const current = auth.currentUser()
  if (current) {
    await current.logout()
  }
}

/**
 * Get the currently logged-in user (from localStorage session), or null.
 */
export function getCurrentUser(): User | null {
  const gotrueUser = auth.currentUser()
  return mapNetlifyUser(gotrueUser)
}

/**
 * Check if a user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return auth.currentUser() !== null
}

/**
 * Request a password recovery email.
 */
export async function requestPasswordRecovery(email: string): Promise<void> {
  await auth.requestPasswordRecovery(email)
}

/**
 * Check if the current user has access to a given program + role level.
 * Owner role bypasses all gender restrictions.
 */
export function hasAccess(gender: Gender, requiredRole: UserRole): boolean {
  const user = getCurrentUser()
  if (!user) return false
  // Owner sees everything
  if (user.role === "owner") return true
  // Coach can access coach + player content for their program
  if (user.role === "coach") {
    return user.gender === gender && (requiredRole === "coach" || requiredRole === "player")
  }
  // Player can only access player content for their program
  return user.role === "player" && user.gender === gender && requiredRole === "player"
}

/**
 * Validate the current session is still good (token not expired).
 * Returns the user if valid, null if expired/invalid.
 */
export async function validateSession(): Promise<User | null> {
  const gotrueUser = await auth.validateCurrentSession()
  return mapNetlifyUser(gotrueUser)
}

/**
 * Get a fresh JWT for the current user, refreshing if needed.
 * Returns null if no user is logged in.
 * Use this to authorize fetch calls to Netlify Functions that verify identity.
 */
export async function getAuthToken(): Promise<string | null> {
  const current = auth.currentUser()
  if (!current) return null
  try {
    return await current.jwt()
  } catch {
    return null
  }
}
