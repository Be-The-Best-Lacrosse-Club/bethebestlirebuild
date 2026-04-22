import { useNavigate } from "react-router-dom"

export function Footer() {
  const navigate = useNavigate()
  const link = (href: string) => (e: React.MouseEvent) => { e.preventDefault(); navigate(href) }

  return (
    <footer className="bg-black text-white border-t border-white/[0.06]">
      <div className="max-w-[1000px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-12">

          <div className="col-span-2 md:col-span-1">
            <a href="/" onClick={link("/")} className="font-display text-xl text-white uppercase tracking-tight block mb-4">
              BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
            </a>
            <p className="text-[0.8rem] text-white/30 leading-relaxed max-w-[220px]">
              A structured lacrosse development program built on accountability, film study, and intentional coaching. Long Island, NY.
            </p>
            <div className="flex gap-2.5 mt-6">
              {[
                { label: "IG", href: "#" },
                { label: "X", href: "#" },
                { label: "YT", href: "#" },
              ].map((s) => (
                <a key={s.label} href={s.href} className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center text-[0.65rem] font-bold text-white/25 hover:bg-[var(--btb-red)] hover:border-[var(--btb-red)] hover:text-white transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Boys</h4>
            <a href="/boys" onClick={link("/boys")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/boys/travel" onClick={link("/boys/travel")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Travel Teams</a>
            <a href="/boys/coaches" onClick={link("/boys/coaches")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Coaching Staff</a>
            <a href="/boys/teams" onClick={link("/boys/teams")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Teams</a>
            <a href="/boys/players" onClick={link("/boys/players")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Players Hub</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Girls</h4>
            <a href="/girls" onClick={link("/girls")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/girls/travel" onClick={link("/girls/travel")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Travel Teams</a>
            <a href="/girls/coaches" onClick={link("/girls/coaches")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Coaching Staff</a>
            <a href="/girls/teams" onClick={link("/girls/teams")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Teams</a>
            <a href="/girls/players" onClick={link("/girls/players")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Players Hub</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">BTB</h4>
            <a href="/academy" onClick={link("/academy")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Academy</a>
            <a href="/contact" onClick={link("/contact")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Contact</a>
            <a href="/login" onClick={link("/login")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Login</a>
            <a href="/sms-policy" onClick={link("/sms-policy")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">SMS Policy</a>
            <a href="mailto:info@bethebestli.com" className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">info@bethebestli.com</a>
            <span className="block text-[0.78rem] text-white/25 py-1.5">Long Island, NY</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.05] text-[0.7rem] text-white/20">
          <span>&copy; 2026 Be The Best Lacrosse. All rights reserved.</span>
          <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
