import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User, Gender } from "@/types"
import * as authLib from "@/lib/auth"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  requestPasswordRecovery: (email: string) => Promise<void>
  completePendingPassword: (password: string) => Promise<User>
  signup: (
    email: string,
    password: string,
    fullName: string,
    program: Gender,
    gradYear?: string,
  ) => Promise<{ requiresConfirmation: boolean }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check for an existing session
  useEffect(() => {
    let cancelled = false

    // Localhost dev bypass — auto-login as owner so hubs are accessible without Netlify Identity
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    if (isDev) {
      const devAcademyAccess = new URLSearchParams(window.location.search).get("academy_access") === "public"
        ? "public"
        : "member"
      setUser({
        id: "dev-owner",
        email: "dan@btb.dev",
        name: "Coach Dan (Dev)",
        role: "owner",
        gender: "boys",
        gradYear: "2036",
        academyAccess: devAcademyAccess,
      })
      setLoading(false)
      return
    }

    async function init() {
      try {
        // Load and validate the cookie-backed Netlify Identity session.
        const validUser = await authLib.validateSession()
        if (!cancelled) {
          setUser(validUser)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const u = await authLib.login(email, password)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authLib.logout()
    setUser(null)
  }, [])

  const requestPasswordRecovery = useCallback(async (email: string) => {
    await authLib.requestPasswordRecovery(email)
  }, [])

  const completePendingPassword = useCallback(async (password: string): Promise<User> => {
    await authLib.completePendingPassword(password)
    const u = await authLib.validateSession()
    if (!u) throw new Error("Password updated, but the account could not be loaded.")
    setUser(u)
    return u
  }, [])

  const signup = useCallback(
    async (email: string, password: string, fullName: string, program: Gender, gradYear?: string) => {
      const result = await authLib.signup(email, password, fullName, program, gradYear)
      // If no email confirmation is needed, auto-login
      if (!result.requiresConfirmation) {
        const u = await authLib.login(email, password)
        setUser(u)
      }
      return result
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        requestPasswordRecovery,
        completePendingPassword,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
