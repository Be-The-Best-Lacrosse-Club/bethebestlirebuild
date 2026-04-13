import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import { HubLayout } from "@/layouts/HubLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SEO } from "@/components/shared/SEO"

// Coming Soon takeover (public site temporarily disabled)
import { ComingSoon } from "@/components/ComingSoon"

// Pages still reachable via login
import { LoginPage } from "@/pages/LoginPage"
import { PlayerHubPage } from "@/pages/PlayerHubPage"
import { CoachesHubPage } from "@/pages/CoachesHubPage"
import { AcademyElearningPage } from "@/pages/AcademyElearningPage"

function ComingSoonPage() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Something Big Is Coming"
        description="Be The Best Lacrosse Club is dropping a brand new website that offers BTB families more than just lacrosse. Stay tuned!"
        path="/"
      />
      <ComingSoon />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <Routes>
            {/* Login still accessible so families/coaches can reach hubs */}
            <Route path="/login" element={<LoginPage />} />

            {/* Login-gated hub routes remain live */}
            <Route element={<ProtectedRoute />}>
              <Route element={<HubLayout />}>
                <Route path="/boys/players" element={<PlayerHubPage gender="boys" />} />
                <Route path="/boys/academy" element={<AcademyElearningPage gender="boys" />} />
                <Route path="/boys/coaches-hub" element={<CoachesHubPage gender="boys" />} />
                <Route path="/girls/players" element={<PlayerHubPage gender="girls" />} />
                <Route path="/girls/academy" element={<AcademyElearningPage gender="girls" />} />
                <Route path="/girls/coaches-hub" element={<CoachesHubPage gender="girls" />} />
              </Route>
            </Route>

            {/* Public site is temporarily replaced with Coming Soon takeover.
                Catch-all sends every other URL to the Coming Soon page. */}
            <Route path="*" element={<ComingSoonPage />} />
          </Routes>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
