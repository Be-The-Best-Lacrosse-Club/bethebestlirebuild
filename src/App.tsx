import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HubLayout } from "@/layouts/HubLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SEO } from "@/components/shared/SEO"

// Landing page sections
import { Hero } from "@/components/Hero"
import { TheStandard } from "@/components/TheStandard"
import { CharacterLab } from "@/components/CharacterLab"
import { ProofSection } from "@/components/ProofSection"
import { WhatYouGet } from "@/components/WhatYouGet"
import { DevelopmentModel } from "@/components/DevelopmentModel"
import { FilmStudy } from "@/components/FilmStudy"
import { CoachesHub } from "@/components/CoachesHub"
import { FeaturedCoaches } from "@/components/FeaturedCoaches"
import { EliteCircuit } from "@/components/EliteCircuit"
import { Results } from "@/components/Results"
import { CTASection } from "@/components/CTASection"

// Pages
import { AcademyPage } from "@/components/AcademyPage"
import { LoginPage } from "@/pages/LoginPage"
import { ParentPortalPage } from "@/pages/ParentPortalPage"
import { TryoutsPage } from "@/pages/TryoutsPage"
import { InterestFormPage } from "@/pages/InterestFormPage"
import { ProgramPage } from "@/pages/ProgramPage"
import { PlayerHubPage } from "@/pages/PlayerHubPage"
import { CoachesHubPage } from "@/pages/CoachesHubPage"
import { AcademyElearningPage } from "@/pages/AcademyElearningPage"
import { TravelPage } from "@/pages/TravelPage"
import { CoachingStaffPage } from "@/pages/CoachingStaffPage"
import { TeamsPage } from "@/pages/TeamsPage"
import { SmsPolicyPage } from "@/pages/SmsPolicyPage"
import { FuturesPage } from "@/pages/FuturesPage"
import { CampsPage } from "@/pages/CampsPage"
function LandingPage() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Be The Best"
        description="Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program for boys and girls."
        path="/"
      />
      <Hero />
      <EliteCircuit />
      <TheStandard />
      <CharacterLab />
      <ProofSection />
      <WhatYouGet />
      <DevelopmentModel />
      <FilmStudy />
      <CoachesHub />
      <FeaturedCoaches />
      <Results />
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
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/tryouts" element={<TryoutsPage />} />
              <Route path="/interest" element={<InterestFormPage />} />
              <Route path="/parent-portal" element={<ParentPortalPage />} />
              <Route path="/boys" element={<ProgramPage programKey="boys" />} />
              <Route path="/boys/travel" element={<TravelPage gender="boys" />} />
              <Route path="/boys/coaches" element={<CoachingStaffPage gender="boys" />} />
              <Route path="/boys/teams" element={<TeamsPage gender="boys" />} />
              <Route path="/girls" element={<ProgramPage programKey="girls" />} />
              <Route path="/girls/travel" element={<TravelPage gender="girls" />} />
              <Route path="/girls/coaches" element={<CoachingStaffPage gender="girls" />} />
              <Route path="/girls/teams" element={<TeamsPage gender="girls" />} />
              <Route path="/futures" element={<FuturesPage />} />
              <Route path="/camps" element={<CampsPage />} />
              <Route path="/sms-policy" element={<SmsPolicyPage />} />
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
          </Routes>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
