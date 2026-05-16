import { Outlet } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { SmoothScroll } from "@/components/SmoothScroll"
import { ProgressBar } from "@/components/ProgressBar"
// Coach B AI assistant is temporarily disabled while it's being improved.
// Re-enable by uncommenting the import + <CoachB /> line below.
// import { CoachB } from "@/components/CoachB"
import { NewsletterPopup } from "@/components/NewsletterPopup"

export function PublicLayout() {
  return (
    <SmoothScroll>
      <ProgressBar />
      <Header />
      <Outlet />
      <Footer />
      {/* <CoachB surface="player_parent" /> */}
      <NewsletterPopup />
    </SmoothScroll>
  )
}
