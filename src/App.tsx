import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HubLayout } from "@/layouts/HubLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SEO } from "@/components/shared/SEO"
import { ComingSoon } from "@/components/ComingSoon"

// Landing page sections
import { Hero } from "@/components/Hero"
import { ProofSection } from "@/components/ProofSection"
import { WhatYouGet } from "@/components/WhatYouGet"
import { DevelopmentModel } from "@/components/DevelopmentModel"
import { FilmStudy } from "@/components/FilmStudy"
import { CoachesHub } from "@/components/CoachesHub"
import { Results } from "@/components/Results"
import { OurStandard } from "@/components/OurStandard"
import { HubsSection } from "@/components/HubsSection"
import { CTASection } from "@/components/CTASection"

// Pages
import { AcademyPage } from "@/components/AcademyPage"
import { LoginPage } from "@/pages/LoginPage"
import { ProgramPage } from "@/pages/ProgramPage"
import { PlayerHubPage } from "@/pages/PlayerHubPage"
import { CoachesHubPage } from "@/pages/CoachesHubPage"
import { AcademyElearningPage } from "@/pages/AcademyElearningPage"
import { TravelPage } from "@/pages/TravelPage"
import { CoachingStaffPage } from "@/pages/CoachingStaffPage"
import { TeamsPage } from "@/pages/TeamsPage"

// ── MODE TOGGLE ──
// Set to true  → full site with all pages & navigation
// Set to false → Coming Soon landing page only (production)
const DEV_MODE = new URLSearchParams(window.location.search).has("dev")

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

function LandingPage() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Be The Best"
        description="Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program for boys and girls."
        path="/"
      />
      <Hero />
      <ProofSection />
      <WhatYouGet />
      <DevelopmentModel />
      <FilmStudy />
      <CoachesHub />
      <Results />
      <OurStandard />
      <HubsSection />
      <CTASection />
    </>
  )
}

function App() {
  // Production: Coming Soon only (unless ?dev is in the URL)
  if (!DEV_MODE) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ComingSoonPage />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Dev mode: full site
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/boys" element={<ProgramPage gender="boys" />} />
              <Route path="/boys/travel" element={<TravelPage gender="boys" />} />
              <Route path="/boys/coaches" element={<CoachingStaffPage gender="boys" />} />
              <Route path="/boys/teams" element={<TeamsPage gender="boys" />} />
              <Route path="/girls" element={<ProgramPage gender="girls" />} />
              <Route path="/girls/travel" element={<TravelPage gender="girls" />} />
              <Route path="/girls/coaches" element={<CoachingStaffPage gender="girls" />} />
              <Route path="/girls/teams" element={<TeamsPage gender="girls" />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

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

            <Route path="*" element={<ComingSoonPage />} />
          </Routes>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
