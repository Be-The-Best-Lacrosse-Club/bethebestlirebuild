import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HubLayout } from "@/layouts/HubLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ProgressBar } from "@/components/ProgressBar"
import { SEO } from "@/components/shared/SEO"

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
import { ProgramPage } from "@/pages/ProgramPage"
import { TravelPage } from "@/pages/TravelPage"
import { CoachingStaffPage } from "@/pages/CoachingStaffPage"
import { TeamsPage } from "@/pages/TeamsPage"
import { LoginPage } from "@/pages/LoginPage"
import { PlayerHubPage } from "@/pages/PlayerHubPage"
import { CoachesHubPage } from "@/pages/CoachesHubPage"
import { AcademyElearningPage } from "@/pages/AcademyElearningPage"
import { ContactPage } from "@/pages/ContactPage"

function Landing() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Elite Youth Lacrosse on Long Island"
        description="Be The Best Lacrosse Club is Long Island's premier character-driven youth lacrosse development program. Travel teams, film study, and college prep for boys and girls."
        path="/"
      />
      <ProgressBar />
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
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <Routes>
            {/* Public routes with Header + Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/academy" element={<AcademyPage onBack={() => {}} />} />

              {/* Boys program */}
              <Route path="/boys" element={<ProgramPage gender="boys" />} />
              <Route path="/boys/travel" element={<TravelPage gender="boys" />} />
              <Route path="/boys/coaches" element={<CoachingStaffPage gender="boys" />} />
              <Route path="/boys/teams" element={<TeamsPage gender="boys" />} />

              {/* Girls program */}
              <Route path="/girls" element={<ProgramPage gender="girls" />} />
              <Route path="/girls/travel" element={<TravelPage gender="girls" />} />
              <Route path="/girls/coaches" element={<CoachingStaffPage gender="girls" />} />
              <Route path="/girls/teams" element={<TeamsPage gender="girls" />} />

              {/* Contact */}
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Login (no layout) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Login-gated hub routes */}
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
          </Routes>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
