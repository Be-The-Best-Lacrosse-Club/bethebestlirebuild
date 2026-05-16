import { useState, useEffect, type FormEvent } from "react"
import { toast } from "sonner"
import { Send, CheckCircle2, Shield } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

type Category = "Travel" | "Camp" | "Futures" | "Tryouts" | "Coaching" | "Digital Academy"
type Program = "Boys" | "Girls"

const BOYS_TRAVEL_TEAMS = [
  "2028 Black",
  "2029 Chrome",
  "2030 Rage",
  "2031 Carnage",
  "2032 Cannons",
  "2032 Grizzlies",
  "2033 Renegades",
  "2034 Venom",
  "2034 Snipers",
  "2035 Bombers",
  "2036 Dawgs",
]

const GIRLS_TRAVEL_TEAMS = [
  "2030 Tidal Wave",
  "2030 Reign",
  "2031 Cyclones",
  "2032 Riptide",
  "2033 Storm",
  "2034 Thunder",
  "2034 Tsunami",
  "2035 Hurricanes",
  "2035 Tornado",
  "2036 Avalanche",
]

const CATEGORIES: { id: Category; hasProgram: boolean; hasTeam: boolean }[] = [
  { id: "Travel", hasProgram: true, hasTeam: true },
  { id: "Camp", hasProgram: false, hasTeam: false },
  { id: "Futures", hasProgram: true, hasTeam: false },
  { id: "Tryouts", hasProgram: false, hasTeam: false },
  { id: "Coaching", hasProgram: true, hasTeam: false },
  { id: "Digital Academy", hasProgram: false, hasTeam: false },
]

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function InterestFormPage() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [program, setProgram] = useState<Program | "">("")
  const [team, setTeam] = useState("")
  const [notes, setNotes] = useState("")
  const [botField, setBotField] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const params = new URLSearchParams(window.location.search)
    const categoryParam = params.get("category")
    const notesParam = params.get("notes")
    if (categoryParam && CATEGORIES.some((c) => c.id === categoryParam)) {
      setCategory(categoryParam as Category)
    }
    if (notesParam) {
      setNotes(notesParam)
    }
  }, [])

  const activeCategory = CATEGORIES.find((c) => c.id === category)
  const teamList = category === "Travel" && program === "Boys" ? BOYS_TRAVEL_TEAMS : category === "Travel" && program === "Girls" ? GIRLS_TRAVEL_TEAMS : []

  function pickCategory(c: Category) {
    setCategory(c)
    setProgram("")
    setTeam("")
  }

  function pickProgram(p: Program) {
    setProgram(p)
    setTeam("")
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (botField) return
    if (!name || !phone || !email || !category) {
      toast.error("Please fill in name, phone, email, and what you're interested in.")
      return
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.")
      return
    }
    if (activeCategory?.hasProgram && !program) {
      toast.error(`Please select Male or Female for ${category}.`)
      return
    }
    if (activeCategory?.hasTeam && !team) {
      toast.error("Please select a team.")
      return
    }

    setSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "interest-form",
          name,
          phone,
          email,
          address,
          interestCategory: category,
          interestProgram: program,
          interestTeam: team,
          notes,
        }),
      })
      setSubmitted(true)
      toast.success("Thanks! We'll be in touch shortly.")
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[0.88rem] placeholder:text-white/20 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
  const labelClass = "block text-[0.65rem] font-black uppercase tracking-[2px] text-white/30 mb-2"

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-[500px] w-full text-center py-20 border border-white/5 bg-white/[0.02] rounded-2xl p-12">
          <div className="w-20 h-20 bg-[var(--btb-red)]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} className="text-[var(--btb-red)]" />
          </div>
          <h2 className="font-display text-4xl text-white uppercase mb-4">Interest Received</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Thanks for reaching out. Our team will review your information and follow up with the right next step for you.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-4 bg-[var(--btb-red)] text-white text-[0.75rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <SEO
        title="Interest Form | BTB Lacrosse Club"
        description="Tell us what you're interested in — travel teams, camps, futures, tryouts, or coaching. We'll route your inquiry to the right person and follow up fast."
        path="/interest"
      />

      <div className="max-w-[820px] mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6">
            <Shield size={14} />
            BTB_INTEREST_FORM
          </div>
          <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85] text-white mb-6">
            Tell Us What <br /> <span className="text-[var(--btb-red)]">You're After.</span>
          </h1>
          <p className="text-white/40 text-[0.95rem] leading-relaxed max-w-[560px]">
            One form for everything — travel teams, camps, futures, tryouts, coaching. Pick what fits, give us your info, and we'll route your inquiry to the right person.
          </p>
        </div>

        <form name="interest-form" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="space-y-10">
          <input type="hidden" name="form-name" value="interest-form" />
          <p className="hidden">
            <label>
              Don't fill this out if you're human: <input name="bot-field" value={botField} onChange={(e) => setBotField(e.target.value)} />
            </label>
          </p>

          {/* Contact */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
              <span className="font-display text-lg uppercase tracking-widest">Your Info</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" name="name" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" name="phone" required className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <input type="text" name="address" className={inputClass} placeholder="Street, City, State, ZIP" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          {/* Interest picker */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
              <span className="font-display text-lg uppercase tracking-widest">What Are You Interested In? *</span>
            </div>

            {/* Primary category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => pickCategory(c.id)}
                  className={`px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[1.5px] rounded-lg transition-all ${
                    category === c.id
                      ? "bg-[var(--btb-red)] text-white"
                      : "bg-white/[0.04] text-white/50 border border-white/10 hover:bg-white/[0.08] hover:text-white/80"
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>

            {/* Secondary: Boys / Girls (for categories that need it) */}
            {activeCategory?.hasProgram && (
              <div className="pl-4 border-l-2 border-[var(--btb-red)]/40 space-y-4">
                <div className="text-[0.65rem] font-black uppercase tracking-[2px] text-white/40">
                  {category} Program
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["Boys", "Girls"] as Program[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => pickProgram(p)}
                      className={`px-6 py-3 text-[0.78rem] font-bold uppercase tracking-[1.5px] rounded-lg transition-all ${
                        program === p
                          ? "bg-[var(--btb-red)] text-white"
                          : "bg-white/[0.04] text-white/50 border border-white/10 hover:bg-white/[0.08] hover:text-white/80"
                      }`}
                    >
                      {p === "Boys" ? "Male" : "Female"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tertiary: team dropdown (Travel only) */}
            {activeCategory?.hasTeam && program && (
              <div className="pl-4 border-l-2 border-[var(--btb-red)]/40 space-y-4">
                <div className="text-[0.65rem] font-black uppercase tracking-[2px] text-white/40">
                  {program} Travel Team
                </div>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-black">Select a team</option>
                  {teamList.map((t) => (
                    <option key={t} value={t} className="bg-black">{t}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Anything else we should know?</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[0.88rem] placeholder:text-white/20 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all resize-none"
              placeholder="Grad year, position, questions, scheduling constraints, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-[var(--btb-red)] text-white text-[0.8rem] font-black uppercase tracking-[3px] rounded-lg hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Send size={14} />
            {submitting ? "Submitting..." : "Submit Interest"}
          </button>
        </form>
      </div>
    </div>
  )
}
