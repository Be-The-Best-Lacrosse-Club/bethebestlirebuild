import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Lock, LogOut, Shield } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const programLinks = (gender: "boys" | "girls") => [
  { label: "Overview", href: `/${gender}` },
  { label: "Travel Teams", href: `/${gender}/travel` },
  { label: "Coaching Staff", href: `/${gender}/coaches` },
  { label: "Teams", href: `/${gender}/teams` },
  { label: "divider", href: "" },
  { label: "Players Hub", href: `/${gender}/players`, gated: true },
  { label: "Coaches Hub", href: `/${gender}/coaches-hub`, gated: true },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<"boys" | "girls" | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<"boys" | "girls" | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close on route change
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

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/")

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-black/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-transparent"
    }`}>
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => go("/")} className="font-display text-2xl tracking-tight uppercase text-white">
          BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
          {/* Academy */}
          <button
            onClick={() => go("/academy")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/academy") ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Academy
          </button>

          {/* Boys Dropdown */}
          {(["boys", "girls"] as const).map((gender) => (
            <div key={gender} className="relative">
              <button
                onClick={() => setDropdown(dropdown === gender ? null : gender)}
                className={`flex items-center gap-1 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
                  isActive(`/${gender}`) ? "text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {gender === "boys" ? "Boys" : "Girls"}
                <ChevronDown size={12} className={`transition-transform ${dropdown === gender ? "rotate-180" : ""}`} />
              </button>

              {dropdown === gender && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-neutral-900 border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl py-2">
                  {programLinks(gender).map((link, i) =>
                    link.label === "divider" ? (
                      <div key={i} className="h-px bg-white/[0.07] my-2 mx-3" />
                    ) : (
                      <button
                        key={link.href}
                        onClick={() => go(link.href)}
                        className={`w-full text-left px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[1px] transition-colors flex items-center gap-2 ${
                          location.pathname === link.href
                            ? "text-[var(--btb-red)] bg-[var(--btb-red)]/5"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {link.gated && <Lock size={10} className="text-white/25" />}
                        {link.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Contact */}
          <button
            onClick={() => go("/contact")}
            className={`px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] transition-colors rounded ${
              isActive("/contact") ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Contact
          </button>

          {/* Staff Portal */}
          <a
            href="https://btb-os.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] text-white/50 hover:text-white transition-colors"
          >
            <Shield size={11} /> Staff
          </a>

          <div className="w-px h-5 bg-white/[0.08] mx-2" />

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-[0.68rem] font-semibold text-white/30 uppercase tracking-[1px]">{user?.name}</span>
              <button
                onClick={() => { logout(); go("/") }}
                className="p-2 text-white/30 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => go("/login")}
              className="flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[1.5px] text-white/50 hover:text-white transition-colors"
            >
              <Lock size={11} /> Login
            </button>
          )}

          <a
            href="#apply"
            className="ml-2 px-5 py-2 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)] transition-colors"
          >
            Apply Now
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white z-[60]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto pt-20 pb-12 px-8">
          <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-6 text-white">
            <X size={22} />
          </button>

          <button onClick={() => go("/")} className="font-display text-3xl text-white uppercase mb-8 block">
            BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
          </button>

          <div className="space-y-2">
            <button onClick={() => go("/academy")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-white/60 hover:text-white py-2">
              Academy
            </button>

            {(["boys", "girls"] as const).map((gender) => (
              <div key={gender}>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === gender ? null : gender)}
                  className="flex items-center justify-between w-full text-left text-lg font-semibold uppercase tracking-[2px] text-white/60 hover:text-white py-2"
                >
                  {gender === "boys" ? "Boys" : "Girls"}
                  <ChevronDown size={16} className={`transition-transform ${mobileExpanded === gender ? "rotate-180" : ""}`} />
                </button>

                {mobileExpanded === gender && (
                  <div className="pl-4 pb-2 space-y-1">
                    {programLinks(gender).map((link, i) =>
                      link.label === "divider" ? (
                        <div key={i} className="h-px bg-white/[0.07] my-2" />
                      ) : (
                        <button
                          key={link.href}
                          onClick={() => go(link.href)}
                          className="block w-full text-left py-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-white/40 hover:text-white flex items-center gap-2"
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

            <button onClick={() => go("/contact")} className="block w-full text-left text-lg font-semibold uppercase tracking-[2px] text-white/60 hover:text-white py-2">
              Contact
            </button>

            <a
              href="https://btb-os.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[2px] text-white/60 hover:text-white py-2"
            >
              <Shield size={16} /> Staff Portal
            </a>

            <div className="h-px bg-white/[0.07] my-4" />

            {isAuthenticated ? (
              <button
                onClick={() => { logout(); go("/") }}
                className="flex items-center gap-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-white/40 hover:text-white py-2"
              >
                <LogOut size={14} /> Logout ({user?.name})
              </button>
            ) : (
              <button
                onClick={() => go("/login")}
                className="flex items-center gap-2 text-[0.88rem] font-semibold uppercase tracking-[1.5px] text-white/40 hover:text-white py-2"
              >
                <Lock size={12} /> Login
              </button>
            )}

            <a
              href="#apply"
              onClick={() => setMobileOpen(false)}
              className="mt-4 block text-center px-8 py-3 bg-[var(--btb-red)] text-white font-bold uppercase tracking-[1.5px] rounded text-sm"
            >
              Apply Now
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
