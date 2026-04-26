import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Lock, LogOut, Shield, Activity, Layout } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const programLinks = (gender: string) => [
  { label: "Overview", href: `/${gender}` },
  { label: "Travel Teams", href: `/${gender}/travel` },
  { label: "Coaching Staff", href: `/${gender}/coaches` },
  { label: "Teams", href: `/${gender}/teams` },
  { label: "divider", href: "" },
  { label: "Players Hub", href: `/${gender}/players`, gated: true },
  { label: "Coaches Hub", href: `/${gender}/coaches-hub`, gated: true },
]

const roleBadgeStyles: Record<string, string> = {
  owner: "bg-[var(--btb-red)]/20 text-[var(--btb-red)]",
  coach: "bg-amber-500/15 text-amber-400",
  player: "bg-emerald-500/15 text-emerald-400",
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
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
    setMobileExpanded(null)
  }, [location.pathname])

  const go = (href: string) => {
    navigate(href)
    setDropdown(null)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    go("/")
  }

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/")

  const roleLabel = user?.role === "owner" ? "Owner" : user?.role === "coach" ? "Coach" : "Player"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)]" : "bg-transparent"
    }`}>
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => go("/")} className={`font-display text-2xl tracking-tight uppercase transition-colors ${scrolled ? "text-black" : "text-white"}`}>
          BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
          <button
            onClick={() => go("/academy")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/academy") 
                ? (scrolled ? "text-black" : "text-white") 
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Academy
          </button>

          <button
            onClick={() => go("/tryouts")}
            className={`px-3 py-2 text-[0.75rem] font-bold uppercase tracking-[1.5px] transition-all rounded bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 shadow-lg shadow-red-500/20`}
          >
            Tryouts
          </button>

          <button
            onClick={() => go("/interest")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/interest")
                ? (scrolled ? "text-black" : "text-white")
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Interest
          </button>

          <button
            onClick={() => go("/parent-portal")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/parent-portal")
                ? (scrolled ? "text-black" : "text-white")
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Parent Portal
          </button>

          <button
            onClick={() => go("/futures")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/futures")
                ? (scrolled ? "text-black" : "text-white")
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Futures
          </button>

          <button
            onClick={() => go("/camps")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/camps")
                ? (scrolled ? "text-black" : "text-white")
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Camps
          </button>

          {["boys", "girls"].map((gender) => (
            <div key={gender} className="relative">
              <button
                onClick={() => setDropdown(dropdown === gender ? null : gender)}
                className={`flex items-center gap-1 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
                  isActive(`/${gender}`)
                    ? (scrolled ? "text-black" : "text-white")
                    : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
                }`}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                <ChevronDown size={12} className={`transition-transform ${dropdown === gender ? "rotate-180" : ""}`} />
              </button>

              {dropdown === gender && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-black/[0.05] rounded-xl overflow-hidden shadow-2xl py-2">
                  {programLinks(gender).map((link, i) =>
                    link.label === "divider" ? (
                      <div key={i} className="h-px bg-black/[0.05] my-2 mx-3" />
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => go(link.href)}
                        className={`w-full text-left px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[1px] transition-colors flex items-center gap-2 ${
                          location.pathname === link.href
                            ? "text-[var(--btb-red)] bg-[var(--btb-red)]/5"
                            : "text-black/50 hover:text-black hover:bg-black/[0.02]"
                        }`}
                      >
                        {link.gated && <Lock size={10} className="text-black/25" />}
                        {link.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => go("/contact")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/contact")
                ? (scrolled ? "text-black" : "text-white")
                : (scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white")
            }`}
          >
            Contact
          </button>

          <a
            href="https://btb-os.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors ${
              scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white"
            }`}
          >
            <Shield size={11} /> Staff
          </a>

          <div className={`w-px h-5 mx-2 ${scrolled ? "bg-black/[0.08]" : "bg-white/[0.08]"}`} />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className={`text-[0.6rem] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded ${roleBadgeStyles[user.role] || "bg-black/5 text-black/40"}`}>
                {roleLabel}
              </span>
              <button
                onClick={() => go("/family-hub")}
                className={`text-[0.68rem] font-semibold uppercase tracking-[1px] transition-colors ${scrolled ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}
                title="Open Family Hub"
              >
                {user.name}
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 transition-colors ${scrolled ? "text-black/30 hover:text-black" : "text-white/30 hover:text-white"}`}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("/login")}
              className={`flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors ${
                scrolled ? "text-black/50 hover:text-black" : "text-white/50 hover:text-white"
              }`}
            >
              <Lock size={11} /> Login
            </button>
          )}

          <button
            onClick={() => go("/contact")}
            className="ml-2 px-5 py-2 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)] transition-colors shadow-lg shadow-red-500/20"
          >
            Interested in Coaching
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button className={`lg:hidden z-[60] transition-colors ${scrolled || mobileOpen ? "text-black" : "text-white"}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto pt-20 pb-12 px-8">
          <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-6 text-black">
            <X size={22} />
          </button>

          <button onClick={() => go("/")} className="font-display text-3xl text-black uppercase mb-8 block">
            BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
          </button>

          <div className="space-y-2">
            <button onClick={() => go("/academy")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Academy
            </button>

            <button onClick={() => go("/tryouts")} className="block w-full text-left text-lg font-bold uppercase tracking-[2px] text-[var(--btb-red)] py-2">
              Tryouts 2026
            </button>

            <button onClick={() => go("/interest")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Interest Form
            </button>

            <button onClick={() => go("/parent-portal")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Parent Portal
            </button>

            <button onClick={() => go("/futures")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Futures
            </button>

            <button onClick={() => go("/camps")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Camps & Clinics
            </button>

            {["boys", "girls"].map((gender) => (
              <div key={gender}>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === gender ? null : gender)}
                  className="flex items-center justify-between w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2"
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  <ChevronDown size={16} className={`transition-transform ${mobileExpanded === gender ? "rotate-180" : ""}`} />
                </button>

                {mobileExpanded === gender && (
                  <div className="pl-4 pb-2 space-y-1">
                    {programLinks(gender).map((link, i) =>
                      link.label === "divider" ? (
                        <div key={i} className="h-px bg-black/[0.05] my-2" />
                      ) : (
                        <button
                          key={link.href}
                          onClick={() => go(link.href)}
                          className="block w-full text-left py-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-black/40 hover:text-black flex items-center gap-2"
                        >
                          {link.gated && <Lock size={10} />}
                          {link.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => go("/contact")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2">
              Contact
            </button>

            <a
              href="https://btb-os.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[2px] text-black/60 hover:text-black py-2"
            >
              <Shield size={16} /> Staff Portal
            </a>

            <div className="h-px bg-black/[0.05] my-4" />

            {isAuthenticated && user ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded ${roleBadgeStyles[user.role] || "bg-black/5 text-black/40"}`}>
                    {roleLabel}
                  </span>
                  <button
                    onClick={() => { go("/family-hub"); setMobileOpen(false) }}
                    className="text-[0.78rem] font-semibold text-black/40 hover:text-black transition-colors"
                  >
                    {user.name}
                  </button>
                </div>
                <button
                  onClick={() => { go("/family-hub"); setMobileOpen(false) }}
                  className="flex items-center gap-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-black/60 hover:text-black py-2 mb-2"
                >
                  <Layout size={14} /> Family Hub
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-black/40 hover:text-black py-2"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => go("/login")}
                className="flex items-center gap-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-black/40 hover:text-black py-2"
              >
                <Lock size={12} /> Login
              </button>
            )}

            <button
              onClick={() => go("/contact")}
              className="mt-4 block w-full text-center px-8 py-3 bg-[var(--btb-red)] text-white font-bold uppercase tracking-[1.5px] rounded text-sm shadow-xl shadow-red-500/20"
            >
              Interested in Coaching
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
