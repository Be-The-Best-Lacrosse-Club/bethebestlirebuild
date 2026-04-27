import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Lock, LogOut, Layout } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const teamLinks = (gender: string) => [
  { label: `${gender.charAt(0).toUpperCase() + gender.slice(1)} Overview`, href: `/${gender}` },
  { label: "Travel Teams", href: `/${gender}/travel` },
  { label: "Coaching Staff", href: `/${gender}/coaches` },
  { label: "Rosters", href: `/${gender}/teams` },
]

const programLinks = [
  { label: "Boys Lacrosse", href: "/boys" },
  { label: "Girls Lacrosse", href: "/girls" },
  { label: "BTB Futures (K-2)", href: "/futures" },
  { label: "Camps & Clinics", href: "/camps" },
  { label: "Recruiting", href: "/recruiting" },
]

const academyLinks = [
  { label: "About the Academy", href: "/academy-info" },
  { label: "Player Academy", href: "/boys/players" },
  { label: "Coach Tools", href: "/coach-tools" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    setDropdown(null)
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const go = (href: string) => {
    navigate(href)
    setDropdown(null)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    go("/")
  }

  const isActive = (href: string) => location.pathname === href || (href !== "/" && location.pathname.startsWith(href))

  const navItemClass = (href: string) => `px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[1.5px] transition-colors rounded ${
    isActive(href)
      ? (scrolled ? "text-[var(--btb-red)] bg-[var(--btb-red)]/5" : "text-[var(--btb-red)] bg-white/10")
      : (scrolled ? "text-black/60 hover:text-black hover:bg-black/5" : "text-white/60 hover:text-white hover:bg-white/5")
  }`

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={() => go("/")} className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-[var(--btb-red)] flex items-center justify-center font-display text-lg md:text-xl text-white -skew-x-6 group-hover:scale-105 transition-transform">B</div>
          <div className={`font-display text-lg md:text-2xl tracking-tight uppercase transition-colors ${scrolled ? "text-black" : "text-white"}`}>
            Be The <span className="text-[var(--btb-red)]">Best</span>
          </div>
        </button>

        {/* Desktop Nav — only at xl (1280px+) */}
        <nav className="hidden xl:flex items-center gap-1" ref={dropdownRef}>

          <div className="relative">
            <button onClick={() => setDropdown(dropdown === "academy" ? null : "academy")} className={navItemClass("/academy")}>
              Academy <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "academy" ? "rotate-180" : ""}`} />
            </button>
            {dropdown === "academy" && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                {academyLinks.map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setDropdown(dropdown === "programs" ? null : "programs")} className={navItemClass("/programs")}>
              Programs <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "programs" ? "rotate-180" : ""}`} />
            </button>
            {dropdown === "programs" && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                {programLinks.map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setDropdown(dropdown === "teams" ? null : "teams")} className={navItemClass("/teams")}>
              Teams <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "teams" ? "rotate-180" : ""}`} />
            </button>
            {dropdown === "teams" && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-black/5 rounded-xl shadow-2xl py-3 grid grid-cols-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 col-span-2 text-[0.6rem] font-black text-black/20 uppercase tracking-[2px]">Boys Program</div>
                {teamLinks("boys").map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] transition-all">
                    {link.label}
                  </button>
                ))}
                <div className="px-4 py-2 col-span-2 border-t border-black/5 mt-2 text-[0.6rem] font-black text-black/20 uppercase tracking-[2px]">Girls Program</div>
                {teamLinks("girls").map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] transition-all">
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => go("/tryouts")} className="ml-2 px-4 py-2 text-[0.72rem] font-black uppercase tracking-[2px] transition-all rounded-lg bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red-dark)] shadow-lg shadow-red-500/20">
            Tryouts 2026
          </button>

          <button onClick={() => go("/contact")} className={navItemClass("/contact")}>Contact</button>

          <div className={`w-px h-5 mx-3 ${scrolled ? "bg-black/10" : "bg-white/10"}`} />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button onClick={() => go("/family-hub")} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[0.7rem] font-black uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red)] transition-all">
                <Layout size={14} /> Family Hub
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--btb-red)] to-red-700 flex items-center justify-center font-display text-white text-xs border-2 border-white/20">
                  {user?.name?.[0]}
                </div>
                <button onClick={handleLogout} className={`p-2 transition-colors ${scrolled ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}>
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => go("/login")} className={navItemClass("/login")}>
                <Lock size={11} className="inline mr-1" /> Login
              </button>
              <button onClick={() => go("/interest")} className={`px-4 py-2 text-[0.72rem] font-black uppercase tracking-[2px] transition-all rounded-lg border ${scrolled ? "border-black/20 text-black hover:bg-black hover:text-white" : "border-white/20 text-white hover:bg-white hover:text-black"}`}>
                Register
              </button>
            </div>
          )}
        </nav>

        {/* Mobile/Tablet toggle — shows below xl */}
        <div className="xl:hidden flex items-center gap-3">
          {/* Tryouts pill — always visible on mobile */}
          <button
            onClick={() => go("/tryouts")}
            className="px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[1.5px] bg-[var(--btb-red)] text-white rounded-md"
          >
            Tryouts
          </button>
          <button
            className={`z-[60] transition-colors p-1 ${scrolled || mobileOpen ? "text-black" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          {/* Header row */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
            <button onClick={() => go("/")} className="font-display text-xl text-white uppercase tracking-tight">
              Be The <span className="text-[var(--btb-red)]">Best</span>
            </button>
            <button onClick={() => setMobileOpen(false)} className="text-white p-1">
              <X size={26} />
            </button>
          </div>

          <div className="px-5 py-8 space-y-0">

            {/* Primary CTAs */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={() => go("/tryouts")}
                className="py-4 bg-[var(--btb-red)] text-white font-black text-sm uppercase tracking-[2px] rounded-xl"
              >
                Tryouts 2026
              </button>
              <button
                onClick={() => go("/interest")}
                className="py-4 border-2 border-white/20 text-white font-black text-sm uppercase tracking-[2px] rounded-xl"
              >
                Register
              </button>
            </div>

            {/* Nav sections */}
            {[
              {
                label: "Programs",
                links: [
                  { label: "Boys Program", href: "/boys" },
                  { label: "Girls Program", href: "/girls" },
                  { label: "BTB Futures", href: "/futures" },
                  { label: "Camps & Clinics", href: "/camps" },
                ],
              },
              {
                label: "Teams",
                links: [
                  { label: "Boys Travel", href: "/boys/travel" },
                  { label: "Boys Rosters", href: "/boys/teams" },
                  { label: "Girls Travel", href: "/girls/travel" },
                  { label: "Girls Rosters", href: "/girls/teams" },
                ],
              },
              {
                label: "Academy",
                links: [
                  { label: "About the Academy", href: "/academy-info" },
                  { label: "Player Academy", href: "/boys/players" },
                  { label: "Coach Tools", href: "/coach-tools" },
                ],
              },
              {
                label: "More",
                links: [
                  { label: "Recruiting", href: "/recruiting" },
                  { label: "Contact", href: "/contact" },
                  { label: "Login", href: "/login" },
                ],
              },
            ].map((section) => (
              <div key={section.label} className="border-t border-white/10 py-5">
                <div className="text-[0.65rem] font-black text-white/30 uppercase tracking-[4px] mb-4">{section.label}</div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {section.links.map((l) => (
                    <button
                      key={l.href}
                      onClick={() => go(l.href)}
                      className="text-left text-base font-bold uppercase text-white/70 hover:text-white transition-colors"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Authenticated */}
            {isAuthenticated && (
              <div className="border-t border-white/10 pt-6 space-y-3">
                <button onClick={() => go("/family-hub")} className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-[2px] rounded-xl flex items-center justify-center gap-2">
                  <Layout size={16} /> Family Hub
                </button>
                <button onClick={handleLogout} className="w-full text-center text-white/40 font-bold uppercase tracking-[2px] text-sm py-2">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
