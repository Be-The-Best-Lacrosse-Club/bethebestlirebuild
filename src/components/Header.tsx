import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useLocation } from "react-router"
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
  { label: "Sixes League · Register", href: "https://www.thesixesleague.com" },
  { label: "Players Wanted", href: "/players-wanted" },
  { label: "BTB Futures (K-2)", href: "/futures" },
  { label: "Camps & Clinics", href: "/camps" },
  { label: "Recruiting", href: "/recruiting" },
]

const HEADER_EVENTS: {
  label: string
  title: string
  details: string
  href?: string
  actionLabel?: string
  ariaAction?: string
}[] = [
  {
    label: "Go BTB",
    title: "Good luck, BTB",
    details: "Good luck to all our BTB players on their first week of school",
  },
  {
    label: "Now open",
    title: "Sixes League",
    details: "Coleman Sundays · Momentum Thursdays · 8–10 per team",
    href: "https://www.thesixesleague.com",
    actionLabel: "Sign up",
    ariaAction: "Register for",
  },
  {
    label: "Coming next",
    title: "Camps & Clinics",
    details: "New dates are being finalized · Request an update",
    href: "/camps",
    actionLabel: "View schedule",
    ariaAction: "View",
  },
]

const parentLinks = [
  { label: "Season Newsletter", href: "/fall-winter-newsletter" },
  { label: "Winter Training", href: "/parent-training" },
  { label: "Parent Hub", href: "/parent-hub" },
  { label: "Contact BTB", href: "/contact" },
]

const resourceLinks = [
  { label: "Digital Academy", href: "/academy" },
  { label: "Recruiting", href: "/recruiting" },
  { label: "Coaches Hub", href: "/coach-tools.html" },
]

const staticLinks = new Set([
  "/newsletter",
  "/parent-training",
  "/fall-winter-newsletter",
  "/coach-tools.html",
  "https://www.thesixesleague.com",
])

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [tickerPaused, setTickerPaused] = useState(false)
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
    if (staticLinks.has(href)) {
      window.location.assign(href)
      return
    }
    navigate(href)
    setDropdown(null)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    go("/")
  }

  const isActive = (href: string) => location.pathname === href || (href !== "/" && location.pathname.startsWith(href))

  const navItemClass = (href: string) => `px-3 py-2 text-[1.0rem] font-bold uppercase tracking-[1.5px] transition-colors rounded ${
    isActive(href)
      ? "text-[var(--btb-red)] bg-[var(--btb-red)]/5"
      : "text-black/70 hover:text-black hover:bg-black/5"
  }`

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "shadow-lg" : "shadow-sm"
      }`}>
        {/* Announcement ticker — one bar, every page */}
        <section className="btb-home__events" aria-label="Current BTB announcements">
          <div className="btb-home__events-inner">
            <div className="btb-home__events-viewport">
              <div className={`btb-home__events-track${tickerPaused ? " is-paused" : ""}`}>
                {HEADER_EVENTS.map((event) => {
                  const content = (
                    <>
                      <span className="btb-home__event-label">{event.label}</span>
                      <strong>{event.title}</strong>
                      <span className="btb-home__event-meta">{event.details}</span>
                      {event.href ? (
                        <span className="btb-home__event-register">{event.actionLabel ?? "Learn more"} <span aria-hidden="true">→</span></span>
                      ) : null}
                    </>
                  )

                  return event.href ? (
                    <a
                      className="btb-home__event-item"
                      href={event.href}
                      key={event.title}
                      aria-label={`${event.ariaAction ?? "Learn more about"} ${event.title}: ${event.details}`}
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="btb-home__event-item" key={event.title}>
                      {content}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="btb-home__event-actions">
              <button
                className="btb-home__event-pause"
                type="button"
                aria-label={`${tickerPaused ? "Play" : "Pause"} announcements`}
                aria-pressed={tickerPaused}
                onClick={() => setTickerPaused((paused) => !paused)}
              >
                <span aria-hidden="true">{tickerPaused ? "▶" : "Ⅱ"}</span>
              </button>
              <a className="btb-home__events-all" href="/camps">All camps <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        <div className="max-w-[1320px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => go("/")} className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
            <img
              src="/assets/brand/btb-circle-logo.png"
              alt="BTB Lacrosse Club"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="font-display text-lg md:text-2xl tracking-tight uppercase text-black">
              Be The <span className="text-[var(--btb-red)]">Best</span>
            </div>
          </button>

          {/* Desktop Nav — only when the full menu has room */}
          <nav className="hidden min-[1380px]:flex items-center gap-1" ref={dropdownRef}>

            <div className="relative">
              <button onClick={() => setDropdown(dropdown === "programs" ? null : "programs")} className={navItemClass("/programs")}>
                Programs <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "programs" ? "rotate-180" : ""}`} />
              </button>
              {dropdown === "programs" && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  {programLinks.map(link => (
                    <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[1.25rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
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
                  <div className="px-4 pb-2 col-span-2 text-[1.08rem] font-black text-black/20 uppercase tracking-[2px]">Boys Program</div>
                  {teamLinks("boys").map(link => (
                    <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2 text-[1.15rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] transition-all">
                      {link.label}
                    </button>
                  ))}
                  <div className="px-4 py-2 col-span-2 border-t border-black/5 mt-2 text-[1.08rem] font-black text-black/20 uppercase tracking-[2px]">Girls Program</div>
                  {teamLinks("girls").map(link => (
                    <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2 text-[1.15rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] transition-all">
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setDropdown(dropdown === "parents" ? null : "parents")} className={navItemClass("/parents")}>
                Parents <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "parents" ? "rotate-180" : ""}`} />
              </button>
              {dropdown === "parents" && (
                <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  {parentLinks.map(link => (
                    <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[1.25rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setDropdown(dropdown === "resources" ? null : "resources")} className={navItemClass("/resources")}>
                Resources <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "resources" ? "rotate-180" : ""}`} />
              </button>
              {dropdown === "resources" && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                  {resourceLinks.map(link => (
                    <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[1.25rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => go("/logos")} className={navItemClass("/logos")}>
              Logos
            </button>

            <div className="w-px h-5 mx-3 bg-black/10" />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button onClick={() => go("/family-hub")} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[1.25rem] font-black uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red)] transition-all">
                  <Layout size={14} /> Family Hub
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--btb-red)] to-red-700 flex items-center justify-center font-display text-white text-xs border-2 border-white/20">
                    {user?.name?.[0]}
                  </div>
                  <button onClick={handleLogout} className="p-2 text-black/40 transition-colors hover:text-black">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => go("/login")} className={navItemClass("/login")}>
                  <Lock size={11} className="inline mr-1" /> Login
                </button>
                <button onClick={() => go("/interest")} className="rounded-lg border border-black/20 px-4 py-2 text-[1.0rem] font-black uppercase tracking-[2px] text-black transition-all hover:bg-black hover:text-white">
                  Join BTB
                </button>
              </div>
            )}
          </nav>

          {/* Mobile/Tablet toggle — shows until the full menu has room */}
          <div className="min-[1380px]:hidden flex items-center gap-3">
            <button
              className="z-[60] p-1 text-black transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="btb-mobile-menu"
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay — rendered via portal so it escapes the header's
          backdrop-filter stacking context, which was preventing fixed positioning
          from covering the full viewport when the user had scrolled down. */}
      {mobileOpen && createPortal(
        <div
          id="btb-mobile-menu"
          className="fixed inset-0 bg-black z-[200] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
            <button onClick={() => go("/")} className="font-display text-xl text-white uppercase tracking-tight">
              Be The <span className="text-[var(--btb-red)]">Best</span>
            </button>
            <button onClick={() => setMobileOpen(false)} className="text-white p-1" aria-label="Close menu">
              <X size={26} />
            </button>
          </div>

          <div className="px-5 py-8 space-y-0">

            {/* Primary CTAs */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button
                onClick={() => go("https://www.thesixesleague.com")}
                className="col-span-2 py-4 bg-[var(--btb-red)] text-white font-black text-sm uppercase tracking-[1.5px] rounded-xl"
              >
                Sixes League · Register
              </button>
              <button
                onClick={() => go("/boys")}
                className="py-4 border-2 border-white/20 text-white font-black text-sm uppercase tracking-[2px] rounded-xl"
              >
                Boys Program
              </button>
              <button
                onClick={() => go("/interest")}
                className="py-4 border-2 border-white/20 text-white font-black text-sm uppercase tracking-[2px] rounded-xl"
              >
                Ask a Question
              </button>
            </div>

            {/* Nav sections */}
            {[
              {
                label: "Programs",
                links: [
                  { label: "Boys Program", href: "/boys" },
                  { label: "Girls Program", href: "/girls" },
                  { label: "Sixes League · Register", href: "https://www.thesixesleague.com" },
                  { label: "Players Wanted", href: "/players-wanted" },
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
                label: "Parents",
                links: [
                  { label: "Season Newsletter", href: "/fall-winter-newsletter" },
                  { label: "Winter Training", href: "/parent-training" },
                  { label: "Parent Hub", href: "/parent-hub" },
                  { label: "Contact BTB", href: "/contact" },
                ],
              },
              {
                label: "Resources",
                links: [
                  { label: "Digital Academy", href: "/academy" },
                  { label: "Recruiting", href: "/recruiting" },
                  { label: "Logos", href: "/logos" },
                  { label: "Coaches Hub", href: "/coach-tools.html" },
                  { label: "Login", href: "/login" },
                ],
              },
            ].map((section) => (
              <div key={section.label} className="border-t border-white/10 py-5">
                <div className="text-[1.15rem] font-black text-white/85 uppercase tracking-[4px] mb-4">{section.label}</div>
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
                <button onClick={handleLogout} className="w-full text-center text-white/70 font-bold uppercase tracking-[2px] text-sm py-2">Logout</button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
