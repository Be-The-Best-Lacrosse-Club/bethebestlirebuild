import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ArrowLeft, ShieldX } from "lucide-react"
import type { Gender } from "@/types"

/**
 * Extracts the gender (boys/girls) from a pathname like /boys/coaches-hub.
 */
function getGenderFromPath(pathname: string): Gender | null {
  if (pathname.startsWith("/boys")) return "boys"
  if (pathname.startsWith("/girls")) return "girls"
  return null
}

/**
 * Checks if a route is a coaches-hub route.
 */
function isCoachRoute(pathname: string): boolean {
  return pathname.includes("/coaches-hub") || pathname === "/coach-tools"
}

export function ProtectedRoute() {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/30 text-sm uppercase tracking-[2px]">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Owner bypasses all access checks
  if (user.role !== "owner") {
    const pathGender = getGenderFromPath(location.pathname)
    const coachRoute = isCoachRoute(location.pathname)

    // Check gender mismatch
    const genderMismatch = pathGender !== null && user.gender !== pathGender

    // Check role mismatch: players can't access coach routes
    const roleMismatch = coachRoute && user.role === "player"

    if (genderMismatch || roleMismatch) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-xl bg-[var(--btb-red)]/15 flex items-center justify-center mx-auto mb-6">
              <ShieldX size={26} className="text-[var(--btb-red)]" />
            </div>
            <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-3">
              Access <span className="text-[var(--btb-red)]">Denied</span>
            </h1>
            <p className="text-[0.88rem] text-white/35 leading-relaxed mb-8">
              {genderMismatch
                ? `Your account is assigned to the ${user.gender} program. You don't have access to ${pathGender} content.`
                : "You don't have the required permissions to view this page. Contact your program director if you need access."
              }
            </p>
            <a
              href={user.role === "coach" ? `/${user.gender}/coaches-hub` : `/${user.gender}/players`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors"
            >
              <ArrowLeft size={14} />
              Go to My Hub
            </a>
          </div>
        </div>
      )
    }
  }

  return <Outlet />
}
