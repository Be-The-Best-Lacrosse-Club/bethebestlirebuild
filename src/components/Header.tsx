import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Lock, LogOut, Shield, Activity, Layout, Users, GraduationCap } from "lucide-react"
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
  { label: "Boys Academy", href: "/boys/players" },
  { label: "Girls Academy", href: "/girls/players" },
  { label: "Coach Tools", href: "/coach-tools" },
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

  const isActive = (href: string) => location.pathname === href || (href !== "/" && location.pathname.startsWith(href))

  const roleLabel = user?.role === "owner" ? "Owner" : user?.role === "coach" ? "Coach" : "Player"

  const navItemClass = (href: string) => `px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[1.5px] transition-colors rounded ${
    isActive(href) 
      ? (scrolled ? "text-[var(--btb-red)] bg-[var(--btb-red)]/5" : "text-[var(--btb-red)] bg-white/10") 
      : (scrolled ? "text-black/60 hover:text-black hover:bg-black/5" : "text-white/60 hover:text-white hover:bg-white/5")
  }`

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <button onClick={() => go("/")} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[var(--btb-red)] flex items-center justify-center font-display text-xl text-white -skew-x-6 group-hover:scale-105 transition-transform">B</div>
          <div className={`font-display text-2xl tracking-tight uppercase transition-colors ${scrolled ? "text-black" : "text-white"}`}>
            Be The <span className="text-[var(--btb-red)]">Best</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
          
          <div className="relative group">
            <button
              onClick={() => setDropdown(dropdown === "academy" ? null : "academy")}
              className={navItemClass("/academy")}
            >
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
          
          <div className="relative group">
            <button 
              onClick={() => setDropdown(dropdown === "programs" ? null : "programs")}
              className={navItemClass("/programs")}
            >
              Programs <ChevronDown size={10} className={`inline ml-1 transition-transform ${dropdown === "programs" ? "rotate-180" : ""}`} />
            </button>
            {dropdown === "programs" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-black/5 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2">
                {programLinks.map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="w-full text-left px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[1px] text-black/60 hover:text-[var(--btb-red)] hover:bg-[var(--btb-red)]/5 transition-all">
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative group">
            <button 
              onClick={() => setDropdown(dropdown === "teams" ? null : "teams")}
              className={navItemClass("/teams")}
            >
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

          <button
            onClick={() => go("/tryouts")}
            className={`ml-2 px-4 py-2 text-[0.72rem] font-black uppercase tracking-[2px] transition-all rounded-lg bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red-dark)] shadow-lg shadow-red-500/20`}
          >
            Tryouts 2026
          </button>

          <button onClick={() => go("/contact")} className={navItemClass("/contact")}>
            Contact
          </button>

          <div className={`w-px h-5 mx-3 ${scrolled ? "bg-black/10" : "bg-white/10"}`} />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => go("/family-hub")}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[0.7rem] font-black uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red)] transition-all"
              >
                <Layout size={14} /> Family Hub
              </button>
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => go("/family-hub")}>
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
              <button
                onClick={() => go("/interest")}
                className={`px-4 py-2 text-[0.72rem] font-black uppercase tracking-[2px] transition-all rounded-lg border ${scrolled ? "border-black/20 text-black hover:bg-black hover:text-white" : "border-white/20 text-white hover:bg-white hover:text-black"}`}
              >
                Register
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button className={`lg:hidden z-[60] transition-colors ${scrolled || mobileOpen ? "text-black" : "text-white"}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto pt-24 pb-12 px-8 animate-in fade-in slide-in-from-right">
          <div className="space-y-6">
            <button onClick={() => go("/academy")} className="block w-full text-left text-2xl font-display uppercase text-black">Academy</button>
            <div>
              <div className="text-[0.6rem] font-black text-black/30 uppercase tracking-[3px] mb-4">Digital Academy</div>
              <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-[var(--btb-red)]/20">
                {academyLinks.map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="text-left text-lg font-bold uppercase text-black/60">{link.label}</button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-[0.6rem] font-black text-black/30 uppercase tracking-[3px] mb-4">Our Programs</div>
              <div className="grid grid-cols-1 gap-3">
                {programLinks.map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="text-left text-lg font-bold uppercase text-black/60">{link.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[0.6rem] font-black text-black/30 uppercase tracking-[3px] mb-4">Boys Teams</div>
              <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-black/5">
                {teamLinks("boys").map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="text-left text-lg font-bold uppercase text-black/60">{link.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[0.6rem] font-black text-black/30 uppercase tracking-[3px] mb-4">Girls Teams</div>
              <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-black/5">
                {teamLinks("girls").map(link => (
                  <button key={link.href} onClick={() => go(link.href)} className="text-left text-lg font-bold uppercase text-black/60">{link.label}</button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => go("/recruiting")} className="text-left text-lg font-bold uppercase text-black/60">Recruiting</button>
                <button onClick={() => go("/contact")} className="text-left text-lg font-bold uppercase text-black/60">Contact</button>
                <button onClick={() => go("/tryouts")} className="text-left text-lg font-bold uppercase text-[var(--btb-red)]">Tryouts 2026</button>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 space-y-4">
               {isAuthenticated ? (
                 <>
                   <button onClick={() => go("/family-hub")} className="flex items-center gap-3 w-full py-4 bg-black text-white font-black uppercase tracking-[2px] rounded-xl justify-center">
                     <Layout size={18} /> Family Hub
                   </button>
                   <button onClick={handleLogout} className="w-full text-center text-black/40 font-bold uppercase tracking-[2px]">Logout</button>
                 </>
               ) : (
                 <>
                   <button onClick={() => go("/login")} className="w-full py-4 border-2 border-black/10 text-black font-black uppercase tracking-[2px] rounded-xl flex items-center justify-center gap-2">
                     <Lock size={16} /> Login
                   </button>
                   <button onClick={() => go("/interest")} className="w-full py-4 bg-[var(--btb-red)] text-white font-black uppercase tracking-[2px] rounded-xl shadow-xl shadow-red-500/20">
                     Register Now
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
