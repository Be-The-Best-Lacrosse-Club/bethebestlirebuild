import { useNavigate } from "react-router-dom"

export function Footer() {
  const navigate = useNavigate()
  const link = (href: string) => (e: React.MouseEvent) => { e.preventDefault(); navigate(href) }

  return (
    <footer className="bg-black text-white border-t border-white/[0.06]">
      <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-10 mb-12">

          <div className="col-span-2 md:col-span-1">
            <a href="/" onClick={link("/")} className="font-display text-xl text-white uppercase tracking-tight block mb-4">
              BTB <span className="text-[var(--btb-red)]">Lacrosse</span>
            </a>
            <p className="text-[0.92rem] text-white/65 leading-relaxed max-w-[260px]">
              A structured lacrosse development program built on accountability, film study, and intentional coaching. Long Island, NY.
            </p>
            <div className="flex gap-2.5 mt-6">
              {[
                { label: "IG", href: "https://www.instagram.com/bethebestli" },
                { label: "X", href: "https://x.com/bethebestli" },
                { label: "YT", href: "https://www.youtube.com/@bethebestlacrosse" },
              ].map((s) => (
                <a key={s.label} href={s.href} className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center text-[0.75rem] font-bold text-white/65 hover:bg-[var(--btb-red)] hover:border-[var(--btb-red)] hover:text-white transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Boys</h4>
            <a href="/boys" onClick={link("/boys")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/boys/travel" onClick={link("/boys/travel")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Travel</a>
            <a href="/boys/coaches" onClick={link("/boys/coaches")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Coaches</a>
            <a href="/boys/teams" onClick={link("/boys/teams")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Teams</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Girls</h4>
            <a href="/girls" onClick={link("/girls")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/girls/travel" onClick={link("/girls/travel")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Travel</a>
            <a href="/girls/coaches" onClick={link("/girls/coaches")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Coaches</a>
            <a href="/girls/teams" onClick={link("/girls/teams")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Teams</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Futures</h4>
            <a href="/futures" onClick={link("/futures")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/futures" onClick={link("/futures")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Foundation</a>
            <a href="/futures" onClick={link("/futures")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Enrollment</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">Camps</h4>
            <a href="/camps" onClick={link("/camps")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Overview</a>
            <a href="/camps" onClick={link("/camps")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Clinics</a>
            <a href="/camps" onClick={link("/camps")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Intensives</a>
          </div>

          <div>
            <h4 className="font-display text-white uppercase text-[0.72rem] tracking-[2.5px] mb-5">BTB</h4>
            <a href="/recruiting" onClick={link("/recruiting")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Recruiting</a>
            <a href="/coach-tools" onClick={link("/coach-tools")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Coach Tools</a>
            <a href="/interest" onClick={link("/interest")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Interest Form</a>
            <a href="/contact" onClick={link("/contact")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Contact</a>
            <a href="/login" onClick={link("/login")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Login</a>
            <a href="/sms-policy" onClick={link("/sms-policy")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">SMS Policy &amp; Privacy Policy</a>
            <a href="/terms-and-conditions" onClick={link("/terms-and-conditions")} className="block text-[0.88rem] text-white/60 py-1.5 hover:text-white transition-colors">Terms and Conditions</a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.05] text-[0.82rem] text-white/55">
          <span>&copy; 2026 Be The Best Lacrosse Academy. All rights reserved.</span>
          <div className="flex gap-6">
             <a href="mailto:info@bethebestli.com" className="hover:text-white/85 transition-colors">info@bethebestli.com</a>
             <span className="text-white/45 uppercase tracking-[1px]">Long Island, NY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
