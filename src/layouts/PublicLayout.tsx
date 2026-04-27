import { Outlet } from "react-router-dom"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { SmoothScroll } from "@/components/SmoothScroll"
import { ProgressBar } from "@/components/ProgressBar"

export function PublicLayout() {
  return (
    <SmoothScroll>
      <ProgressBar />
      <Header />
      <Outlet />
      <Footer />
    </SmoothScroll>
  )
}
