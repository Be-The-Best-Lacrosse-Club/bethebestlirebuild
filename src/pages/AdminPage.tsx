import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router"
import { SEO } from "@/components/shared/SEO"

const areas = [
  ["Filmroom with Coach Dan", "NCAA championship breakdowns and coaching film sessions", "/coach-filmroom"],
  ["Website Editor", "Edit website content with your approved staff account", "/admin/"],
  ["Boys Coaches Hub", "Practice plans, film, and Boys coaching resources", "/boys/coaches-hub"],
  ["Girls Coaches Hub", "Practice plans, film, and Girls coaching resources", "/girls/coaches-hub"],
  ["Boys Players Hub", "Player development and Academy resources", "/boys/players"],
  ["Girls Players Hub", "Player development and Academy resources", "/girls/players"],
  ["Coaching Library", "Playbooks, manuals, and sideline downloads", "/coach-tools.html"],
  ["Staff Calendar & Directory", "Schedules and staff contact information", "/dan-calendar"],
  ["Website Leads", "View website inquiries and registration interest", "/leads"],
  ["Recruiting Hub", "Recruiting tools and resources", "/recruiting-hub/"],
  ["Coach Whiteboard", "Build plays and practice diagrams", "/coach-ed/whiteboard"],
  ["Parent Hub", "Parent information and resources", "/parent-hub"],
]

export function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <main className="min-h-screen bg-black text-white border-t-4 border-[#D22630] px-5 py-12">
      <SEO title="Admin Hub | BTB Lacrosse Club" description="BTB website access for approved administrators and directors." path="/admin-hub" />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between gap-4 mb-10">
          <a href="/" className="text-white/80">← BTB Website</a>
          <button onClick={async () => { await logout(); navigate("/admin-login") }} className="underline">Sign Out</button>
        </div>
        <p className="text-[#D22630] font-bold uppercase tracking-widest">Be The Best • Administration</p>
        <h1 className="font-display text-5xl mt-3">Welcome, {user?.name}</h1>
        <p className="text-white/70 mt-4 mb-8">Your account has access to both Boys and Girls programs and all website resource areas.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {areas.map(([title, description, href]) => (
            <a key={href} href={href} className="rounded-xl border border-white/15 bg-white/5 p-6 hover:border-[#D22630] transition-colors">
              <h2 className="font-display text-2xl">{title} →</h2>
              <p className="text-white/70 mt-2">{description}</p>
            </a>
          ))}
        </div>
        <a className="inline-block mt-8 text-white/80 underline" href="/forgot-password">Reset your password</a>
      </div>
    </main>
  )
}
