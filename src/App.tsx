import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { AuthProvider } from "@/context/AuthContext"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HubLayout } from "@/layouts/HubLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { SEO } from "@/components/shared/SEO"
import { useEffect } from "react"

// Landing page sections
import { Hero } from "@/components/Hero"
import { AudiencePaths } from "@/components/AudiencePaths"
import { TheStandard } from "@/components/TheStandard"
import { WhatYouGet } from "@/components/WhatYouGet"
import { DevelopmentModel } from "@/components/DevelopmentModel"
import { CharacterLab } from "@/components/CharacterLab"
import { FilmStudy } from "@/components/FilmStudy"
import { DigitalAcademy } from "@/components/DigitalAcademy"
import { EliteCircuit } from "@/components/EliteCircuit"
import { SpecTicker } from "@/components/SpecTicker"
import { FeaturedCoaches } from "@/components/FeaturedCoaches"
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
import { DigitalAcademyHubPage } from "@/pages/DigitalAcademyHubPage"
import { CoachesHubPage } from "@/pages/CoachesHubPage"
import { TravelPage } from "@/pages/TravelPage"
import { CoachingStaffPage } from "@/pages/CoachingStaffPage"
import { TeamsPage } from "@/pages/TeamsPage"
import { SmsPolicyPage } from "@/pages/SmsPolicyPage"
import { TermsAndConditionsPage } from "@/pages/TermsAndConditionsPage"
import { AcademyInfoPage } from "@/pages/AcademyInfoPage"
import { AcademyGatePage } from "@/pages/AcademyGatePage"
import { RecruitingPage } from "@/pages/RecruitingPage"
import { FuturesPage } from "@/pages/FuturesPage"
import { CampsPage } from "@/pages/CampsPage"
import { FamilyHubPage } from "@/pages/FamilyHubPage"
import { ScrollDemoPage } from "@/pages/ScrollDemoPage"
import { ContactPage } from "@/pages/ContactPage"
import { CoachToolsPage } from "@/pages/CoachToolsPage"
import homeContent from "@/content/home.json"

const SITE_URL = "https://bethebestli.com"
const homeOgImage = homeContent.seoImage.startsWith("http")
  ? homeContent.seoImage
  : `${SITE_URL}${homeContent.seoImage}`

function LandingPage() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Be The Best"
        description="Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program for boys and girls."
        path="/"
        ogImage={homeOgImage}
      />
      <Hero />
      <AudiencePaths />
      <TheStandard />
      <FeaturedCoaches />
      <WhatYouGet />
      <DevelopmentModel />
      <CharacterLab />
      <FilmStudy />
      <DigitalAcademy />
      <EliteCircuit />
      <SpecTicker />
      <Results />
      <CTASection />
    </>
  )
}


function App() {
  // ─── Global: custom cursor + scroll progress bar ───────────────
  useEffect(() => {
    // Inject DOM elements
    const cursor = document.createElement("div")
    cursor.id = "btb-cursor"
    const ring = document.createElement("div")
    ring.id = "btb-cursor-ring"
    const progress = document.createElement("div")
    progress.id = "btb-scroll-progress"
    document.body.appendChild(cursor)
    document.body.appendChild(ring)
    document.body.appendChild(progress)

    let mx = 0, my = 0, rx = 0, ry = 0, raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cursor.style.left = mx + "px"
      cursor.style.top  = my + "px"
    }

    const loop = () => {
      rx += (mx - rx) * 0.14
      ry += (my - ry) * 0.14
      ring.style.left = rx + "px"
      ring.style.top  = ry + "px"
      raf = requestAnimationFrame(loop)
    }
    loop()

    const onHoverIn  = () => { cursor.classList.add("hovered"); ring.classList.add("hovered") }
    const onHoverOut = () => { cursor.classList.remove("hovered"); ring.classList.remove("hovered") }

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      progress.style.width = total > 0 ? (window.scrollY / total) * 100 + "%" : "0%"
    }

    document.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("scroll",    onScroll, { passive: true })

    document.querySelectorAll("a, button, [role='button']").forEach(el => {
      el.addEventListener("mouseenter", onHoverIn)
      el.addEventListener("mouseleave", onHoverOut)
    })

    // Re-attach hover listeners when DOM changes (SPA navigations)
    const mo = new MutationObserver(() => {
      document.querySelectorAll("a:not([data-mg]), button:not([data-mg])").forEach(el => {
        el.setAttribute("data-mg", "1")
        el.addEventListener("mouseenter", onHoverIn)
        el.addEventListener("mouseleave", onHoverOut)
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("scroll", onScroll)
      cursor.remove(); ring.remove(); progress.remove()
      mo.disconnect()
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/academy" element={<AcademyGatePage />} />
              <Route path="/tryouts" element={<TryoutsPage />} />
              <Route path="/interest" element={<InterestFormPage />} />
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
              <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
              <Route path="/academy-info" element={<AcademyInfoPage />} />
              <Route path="/recruiting" element={<RecruitingPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/scroll-demo" element={<ScrollDemoPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/parent-hub" element={<ParentPortalPage />} />
              <Route path="/parent-portal" element={<ParentPortalPage />} />
              <Route path="/coach-tools" element={<CoachToolsPage />} />
              <Route element={<HubLayout />}>
                <Route path="/boys/players" element={<DigitalAcademyHubPage gender="boys" />} />
                <Route path="/boys/academy" element={<Navigate to="/boys/players" replace />} />
                <Route path="/boys/coaches-hub" element={<CoachesHubPage gender="boys" />} />
                <Route path="/girls/players" element={<DigitalAcademyHubPage gender="girls" />} />
                <Route path="/girls/academy" element={<Navigate to="/girls/players" replace />} />
                <Route path="/girls/coaches-hub" element={<CoachesHubPage gender="girls" />} />
                <Route path="/family-hub" element={<FamilyHubPage />} />
              </Route>
            </Route>
            {/* Catch-all 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
