import {
  acceptInvite,
  getUser as getIdentityUser,
  handleAuthCallback,
  login as identityLogin,
  logout as identityLogout,
  refreshSession,
  requestPasswordRecovery as identityRequestPasswordRecovery,
  signup as identitySignup,
  updateUser,
  type CallbackResult,
  type User as IdentityUser,
} from "@netlify/identity"
import type { User, UserRole, Gender, AcademyAccess } from "@/types"

const OWNER_ACCESS_STORAGE_KEY = "btb-owner-access-until"
const OWNER_ACCESS_TTL_MS = 12 * 60 * 60 * 1000
const PENDING_AUTH_STORAGE_KEY = "btb-pending-auth-action"
const AUTH_CALLBACK_ERROR_KEY = "btb-auth-callback-error"

export type PendingAuthAction =
  | { type: "recovery" }
  | { type: "invite"; token: string }

let cachedUser: User | null = null

function readMetadata(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key]
  return typeof value === "string" ? value : undefined
}

function syncOwnerPageAccess(user: User | null): void {
  if (typeof window === "undefined") return

  try {
    if (user?.role === "owner") {
      window.localStorage.setItem(
        OWNER_ACCESS_STORAGE_KEY,
        String(Date.now() + OWNER_ACCESS_TTL_MS),
      )
    } else {
      window.localStorage.removeItem(OWNER_ACCESS_STORAGE_KEY)
    }
  } catch {
    // Authentication still works when browser storage is unavailable.
  }
}

function cacheIdentityUser(identityUser: IdentityUser | null): User | null {
  cachedUser = mapNetlifyUser(identityUser)
  syncOwnerPageAccess(cachedUser)
  return cachedUser
}

/** Map Netlify Identity's normalized user to the website's user shape. */
export function mapNetlifyUser(identityUser: IdentityUser | null): User | null {
  if (!identityUser) return null

  const metadataRoles = identityUser.appMetadata?.roles
  const roles = [
    ...(identityUser.roles ?? (Array.isArray(metadataRoles) ? metadataRoles : [])),
    ...(identityUser.role ? [identityUser.role] : []),
  ]
  const role: UserRole = roles.includes("owner")
    ? "owner"
    : roles.includes("coach")
      ? "coach"
      : "player"

  const program = readMetadata(identityUser.userMetadata, "program") || "boys"
  const gender: Gender = program === "girls" ? "girls" : "boys"
  const rawAcademyAccess =
    readMetadata(identityUser.appMetadata, "academy_access") ||
    readMetadata(identityUser.userMetadata, "academy_access") ||
    readMetadata(identityUser.userMetadata, "academyAccess")
  const academyAccess: AcademyAccess = rawAcademyAccess === "public" ? "public" : "member"

  return {
    id: identityUser.id,
    email: identityUser.email ?? "",
    name:
      identityUser.name ||
      readMetadata(identityUser.userMetadata, "full_name") ||
      identityUser.email?.split("@")[0] ||
      "",
    role,
    gender,
    gradYear: readMetadata(identityUser.userMetadata, "grad_year"),
    academyAccess,
  }
}

/** Process confirmation, recovery, and invite links before the React app starts. */
export async function prepareAuthCallback(): Promise<CallbackResult | null> {
  const result = await handleAuthCallback()
  if (!result) return null

  if (result.type === "recovery") {
    setPendingAuthAction({ type: "recovery" })
  } else if (result.type === "invite" && result.token) {
    setPendingAuthAction({ type: "invite", token: result.token })
  }

  if (result.user) cacheIdentityUser(result.user)
  return result
}

function setPendingAuthAction(action: PendingAuthAction | null): void {
  if (typeof window === "undefined") return
  if (action) {
    window.sessionStorage.setItem(PENDING_AUTH_STORAGE_KEY, JSON.stringify(action))
  } else {
    window.sessionStorage.removeItem(PENDING_AUTH_STORAGE_KEY)
  }
}

export function getPendingAuthAction(): PendingAuthAction | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(PENDING_AUTH_STORAGE_KEY)
    if (!raw) return null
    const action = JSON.parse(raw) as Partial<PendingAuthAction>
    if (action.type === "recovery") return { type: "recovery" }
    if (action.type === "invite" && typeof action.token === "string") {
      return { type: "invite", token: action.token }
    }
  } catch {
    window.sessionStorage.removeItem(PENDING_AUTH_STORAGE_KEY)
  }
  return null
}

export function storeAuthCallbackError(message: string): void {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(AUTH_CALLBACK_ERROR_KEY, message)
}

export function consumeAuthCallbackError(): string {
  if (typeof window === "undefined") return ""
  const message = window.sessionStorage.getItem(AUTH_CALLBACK_ERROR_KEY) || ""
  window.sessionStorage.removeItem(AUTH_CALLBACK_ERROR_KEY)
  return message
}

export async function completePendingPassword(password: string): Promise<User> {
  const action = getPendingAuthAction()
  if (!action) throw new Error("This password link is no longer active. Request a new reset link.")

  const identityUser = action.type === "invite"
    ? await acceptInvite(action.token, password)
    : await updateUser({ password })
  setPendingAuthAction(null)

  const user = cacheIdentityUser(identityUser)
  if (!user) throw new Error("Password updated, but the account could not be loaded.")
  return user
}

export async function login(email: string, password: string): Promise<User> {
  const user = cacheIdentityUser(await identityLogin(email, password))
  if (!user) throw new Error("Login failed — could not read user data.")
  return user
}

export async function signup(
  email: string,
  password: string,
  fullName: string,
  program: Gender,
  gradYear?: string,
): Promise<{ requiresConfirmation: boolean }> {
  const created = await identitySignup(email, password, {
    full_name: fullName,
    program,
    grad_year: gradYear,
  })
  const current = await getIdentityUser()
  const requiresConfirmation = current?.id !== created.id
  if (!requiresConfirmation) cacheIdentityUser(current)
  return { requiresConfirmation }
}

export async function logout(): Promise<void> {
  try {
    await identityLogout()
  } finally {
    cachedUser = null
    syncOwnerPageAccess(null)
  }
}

export function getCurrentUser(): User | null {
  return cachedUser
}

export function isAuthenticated(): boolean {
  return cachedUser !== null
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  await identityRequestPasswordRecovery(email)
}

/** Owner sees every program and every role level. */
export function hasAccess(gender: Gender, requiredRole: UserRole): boolean {
  const user = getCurrentUser()
  if (!user) return false
  if (user.role === "owner") return true
  if (user.role === "coach") {
    return user.gender === gender && (requiredRole === "coach" || requiredRole === "player")
  }
  return user.role === "player" && user.gender === gender && requiredRole === "player"
}

export async function validateSession(): Promise<User | null> {
  return cacheIdentityUser(await getIdentityUser())
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const prefix = `${name}=`
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix))
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
}

/** Return a current JWT for the website's authenticated Netlify Functions. */
export async function getAuthToken(): Promise<string | null> {
  const identityUser = await getIdentityUser()
  if (!identityUser) {
    cacheIdentityUser(null)
    return null
  }

  cacheIdentityUser(identityUser)
  const refreshedToken = await refreshSession()
  return refreshedToken || readCookie("nf_jwt")
}
