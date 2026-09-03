import { Outlet, useLocation } from "react-router"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { SmoothScroll } from "@/components/SmoothScroll"
import { ProgressBar } from "@/components/ProgressBar"
// Coach B AI assistant is temporarily disabled while it's being improved.
// Re-enable by uncommenting the import + <CoachB /> line below.
// import { CoachB } from "@/components/CoachB"
import { NewsletterPopup } from "@/components/NewsletterPopup"

export function PublicLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === "/"
  const pageProvidesMain = isHomePage || location.pathname === "/players-wanted"
  const suppressNewsletterPopup = location.pathname.startsWith("/2037-supernova")

  return (
    <SmoothScroll>
      {!isHomePage && (
        <a className="btb-skip-link" href="#main-content">
          Skip to main content
        </a>
      )}
      <ProgressBar />
      <Header />
      {pageProvidesMain ? (
        <Outlet />
      ) : (
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      )}
      {!isHomePage && <Footer />}
      {/* <CoachB surface="player_parent" /> */}
      {!suppressNewsletterPopup && <NewsletterPopup />}
    </SmoothScroll>
  )
}
