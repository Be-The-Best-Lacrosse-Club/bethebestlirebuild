import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"
import * as authLib from "@/lib/auth"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => User | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(authLib.getStoredUser())
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const u = authLib.login(email, password)
    setUser(u)
    return u
  }

  const logout = () => {
    authLib.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
