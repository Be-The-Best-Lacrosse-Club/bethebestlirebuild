import { useState, useEffect, type FormEvent } from "react"
import { toast } from "sonner"
import { ArrowRight, ChevronDown, CheckCircle2, Shield, Calendar, Activity, MapPin } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

type TryoutForm = {
  playerFirstName: string
  playerLastName: string
  gender: string
  gradYear: string
  position: string
  parentName: string
  parentEmail: string
  parentPhone: string
  currentClub: string
  experience: string
}

const BOYS_GRAD_YEARS = Array.from({ length: 10 }, (_, i) => String(2028 + i))
const GIRLS_GRAD_YEARS = Array.from({ length: 8 }, (_, i) => String(2030 + i))
const POSITIONS = ["Attack", "Midfield", "Defense", "Goalie", "FOGO", "LSM", "Draw Specialist"]
const LAST_UPDATED = "July 12, 2026"

const TRYOUT_OPTIONS = [
  {
    title: "Boys Tryouts",
    subtitle: "Seaford HS",
    detail: "2028-2037 grads · $75 evaluation",
    dates: "July 13, 14, 16, 20, 21",
    href: "/register-boys-tryouts",
  },
  {
    title: "Girls Tryouts",
    subtitle: "Seaford HS",
    detail: "2030-2037 grads · $75 evaluation",
    dates: "July 13, 14, 17, 21",
    href: "/register-girls-tryouts",
  },
  {
    title: "Boys East",
    subtitle: "Seaford HS",
    detail: "2032-2037 boys · $75 evaluation",
    dates: "July 13 & 16 · 6:00-8:00 PM",
    scheduleLines: ["2032 @ 6 PM", "2036/2037 @ 6 PM", "2035/2034 @ 7 PM"],
    href: "/register-boys-east-tryouts",
  },
]

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function TryoutsPage() {
  const [activeTab, setActiveTab] = useState<"boys" | "girls">("boys")
  const [form, setForm] = useState<TryoutForm>({
    playerFirstName: "",
    playerLastName: "",
    gender: "",
    gradYear: "",
    position: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    currentClub: "",
    experience: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !form.playerFirstName ||
      !form.playerLastName ||
      !form.gender ||
      !form.gradYear ||
      !form.parentName ||
      !form.parentEmail ||
      !form.parentPhone
    ) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!validateEmail(form.parentEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }
    setSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "tryout-interest", ...form }),
      })
      setSubmitted(true)
      toast.success("Interest submitted! We will contact you about upcoming evaluations.")
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
  const selectClass = "w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.15rem] focus:outline-none focus:border-[var(--btb-red)]/50 transition-all appearance-none cursor-pointer"
  const labelClass = "block text-[1.15rem] font-black uppercase tracking-[2px] text-white/85 mb-2"
  const textareaClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all resize-none"
  const activeDates = activeTab === "boys"
    ? ["July 13", "July 14", "July 16", "July 20", "July 21"]
    : ["July 13", "July 14", "July 17", "July 21"]
  const activeRegistrationHref = activeTab === "boys" ? "/register-boys-tryouts" : "/register-girls-tryouts"
  const activeGradYears = (form.gender === "Girls" || (!form.gender && activeTab === "girls"))
    ? GIRLS_GRAD_YEARS
    : BOYS_GRAD_YEARS

  function selectGender(gender: "Boys" | "Girls") {
    const validYears = gender === "Girls" ? GIRLS_GRAD_YEARS : BOYS_GRAD_YEARS
    setForm({
      ...form,
      gender,
      gradYear: validYears.includes(form.gradYear) ? form.gradYear : "",
    })
    setActiveTab(gender === "Boys" ? "boys" : "girls")
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-[500px] w-full text-center py-20 border border-white/5 bg-white/[0.02] rounded-2xl p-12">
          <div className="w-20 h-20 bg-[var(--btb-red)]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} className="text-[var(--btb-red)]" />
          </div>
          <h2 className="font-display text-4xl text-white uppercase mb-4">Submission Received</h2>
          <p className="text-white/70 leading-relaxed mb-10">
            Thank you for your interest in the BTB standard. Our coaching staff will review your information and reach out regarding upcoming evaluation dates for your age group.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 relative overflow-hidden">
      <SEO 
        title="2026 Tryouts & Evaluations | BTB Lacrosse"
        description="Compare 2026 BTB Lacrosse tryout registration paths for boys, girls, and BTB East travel programs, including BTB East July 13 and 16 at Seaford High School."
        path="/tryouts"
      />
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/[0.03]" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/[0.03]" />
        <div className="absolute top-[40%] left-0 w-full h-px bg-white/[0.03]" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_400px]">
          
          {/* Form Column */}
          <div className="min-w-0">
            <div className="mb-12">
              <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.9rem] sm:text-[1.15rem] tracking-[3px] sm:tracking-[5px] mb-6">
                <Shield size={14} />
                BTB_TRYOUTS // 2026_SEASON
              </div>
              <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85] text-white mb-6">
                Earn Your <br /> <span className="text-[var(--btb-red)]">Spot.</span>
              </h1>
              <p className="text-white/70 text-[1.15rem] leading-relaxed max-w-[620px] mb-8">
                Pick the right registration path first. Boys and girls tryouts are separate, and BTB East now reports to Seaford High School for July 13 & 16.
              </p>
              <div className="mb-8 inline-flex rounded-full border border-[var(--btb-red)]/40 px-4 py-2 text-[0.72rem] font-black uppercase tracking-[2px] text-white/70">
                Registration open · Updated {LAST_UPDATED}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-10" aria-label="2026 BTB tryout registration options">
                {TRYOUT_OPTIONS.map((option) => (
                  <a
                    key={option.title}
                    href={option.href}
                    className="group flex min-h-[190px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--btb-red)]/60 hover:bg-[var(--btb-red)]/[0.06]"
                  >
                    <div className="mb-3 text-[0.72rem] font-black uppercase tracking-[2.5px] text-[var(--btb-red)]">
                      {option.subtitle}
                    </div>
                    <h2 className="font-display text-[1.7rem] uppercase leading-none tracking-wide text-white">
                      {option.title}
                    </h2>
                    <p className="mt-3 text-[0.9rem] font-semibold leading-relaxed text-white/70">
                      {option.detail}
                    </p>
                    <div className="mt-3 text-[0.8rem] font-black uppercase tracking-[1.5px] text-white/45">
                      {option.dates}
                    </div>
                    {"scheduleLines" in option && option.scheduleLines ? (
                      <div className="mt-3 space-y-1 text-[0.72rem] font-bold uppercase tracking-[1px] text-white/65">
                        {option.scheduleLines.map((line) => (
                          <div key={line}>{line}</div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto flex items-center gap-2 pt-5 text-[0.82rem] font-black uppercase tracking-[2px] text-white">
                      Register <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </a>
                ))}
              </div>
              
              {/* Info Tabs */}
              <div className="mt-12 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex border-b border-white/5">
                  <button 
                    onClick={() => setActiveTab("boys")}
                    className={`flex-1 py-4 font-display text-lg uppercase tracking-wider transition-all ${activeTab === "boys" ? "bg-[var(--btb-red)] text-white" : "text-white/85 hover:text-white/78"}`}
                  >
                    Boys Tryouts
                  </button>
                  <button 
                    onClick={() => setActiveTab("girls")}
                    className={`flex-1 py-4 font-display text-lg uppercase tracking-wider transition-all ${activeTab === "girls" ? "bg-[var(--btb-red)] text-white" : "text-white/85 hover:text-white/78"}`}
                  >
                    Girls Tryouts
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <div className="text-[1.08rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] mb-4">Location</div>
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-white/70 mt-1" />
                        <div>
                          <div className="text-white font-bold uppercase tracking-wide">Seaford HS</div>
                          <div className="text-white/70 text-xs mt-1 leading-relaxed">1575 Seamans Neck Rd, <br />Seaford, NY 11783</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[1.08rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] mb-4">Dates & Times</div>
                      <div className="space-y-4">
                        {activeDates.map((date) => (
                          <div key={date} className="flex items-center gap-3 text-white">
                            <Calendar size={16} className="text-white/70" />
                            <span className="text-sm font-bold uppercase tracking-wide">{date}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 text-white/70">
                          <Activity size={14} />
                          <span className="text-[1.25rem] uppercase tracking-wider font-bold italic">Times to be assigned by grad year</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a
                    href={activeRegistrationHref}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--btb-red)] px-7 py-4 text-[0.95rem] font-black uppercase tracking-[2px] text-white transition-all hover:bg-[var(--btb-red-dark)] sm:w-auto"
                  >
                    Register {activeTab === "boys" ? "Boys" : "Girls"} <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-16 border-t border-white/10 pt-10">
              <div className="text-[1.08rem] font-black uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                Not Ready to Register?
              </div>
              <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.9] text-white mb-4">
                Send an <span className="text-[var(--btb-red)]">Inquiry.</span>
              </h2>
              <p className="text-white/65 text-[1.08rem] leading-relaxed max-w-[560px]">
                Use this if you need help choosing Boys, Girls, BTB East, or a grad-year placement before registering.
              </p>
            </div>

            <form name="tryout-interest" method="POST" data-netlify="true" onSubmit={handleSubmit} className="space-y-8 mt-8">
              <input type="hidden" name="form-name" value="tryout-interest" />
              <input type="hidden" name="requested_program" value={activeTab} />

              {/* Player Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
                  <span className="font-display text-lg uppercase tracking-widest">Player Profile</span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input 
                      type="text" 
                      required 
                      className={inputClass}
                      value={form.playerFirstName}
                      onChange={e => setForm({...form, playerFirstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input 
                      type="text" 
                      required 
                      className={inputClass}
                      value={form.playerLastName}
                      onChange={e => setForm({...form, playerLastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <div className="flex gap-2 h-12">
                      <button
                        type="button"
                        onClick={() => selectGender("Boys")}
                        className={`flex-1 rounded-lg font-display text-[1.18rem] uppercase tracking-widest transition-all border ${form.gender === "Boys" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/85 hover:border-white/30"}`}
                      >
                        Boys
                      </button>
                      <button
                        type="button"
                        onClick={() => selectGender("Girls")}
                        className={`flex-1 rounded-lg font-display text-[1.18rem] uppercase tracking-widest transition-all border ${form.gender === "Girls" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/85 hover:border-white/30"}`}
                      >
                        Girls
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--btb-red)] mt-2 uppercase tracking-tighter animate-pulse">
                      * Ensure selection is accurate to avoid processing errors.
                    </p>
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Grad Year *</label>
                    <select 
                      required 
                      className={selectClass}
                      value={form.gradYear}
                      onChange={e => setForm({...form, gradYear: e.target.value})}
                    >
                      <option value="" disabled>Year</option>
                      {activeGradYears.map(yr => <option key={yr} value={yr} className="bg-black">{yr}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 bottom-4 text-white/45 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Position</label>
                    <select 
                      className={selectClass}
                      value={form.position}
                      onChange={e => setForm({...form, position: e.target.value})}
                    >
                      <option value="" disabled>Position</option>
                      {POSITIONS.map(p => <option key={p} value={p} className="bg-black">{p}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 bottom-4 text-white/45 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Parent Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
                  <span className="font-display text-lg uppercase tracking-widest">Contact Information</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Parent Name *</label>
                    <input 
                      type="text" 
                      required 
                      className={inputClass}
                      value={form.parentName}
                      onChange={e => setForm({...form, parentName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input 
                      type="tel" 
                      required 
                      className={inputClass}
                      value={form.parentPhone}
                      onChange={e => setForm({...form, parentPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    className={inputClass}
                    value={form.parentEmail}
                    onChange={e => setForm({...form, parentEmail: e.target.value})}
                  />
                </div>
              </div>

              {/* Background Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)]" />
                  <span className="font-display text-lg uppercase tracking-widest">Playing History</span>
                </div>
                <div>
                  <label className={labelClass}>Current / Previous Club Team</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={form.currentClub}
                    onChange={e => setForm({...form, currentClub: e.target.value})}
                    placeholder="None / Town Only"
                  />
                </div>
                <div>
                  <label className={labelClass}>Experience / Honors</label>
                  <textarea 
                    rows={4} 
                    className={textareaClass}
                    value={form.experience}
                    onChange={e => setForm({...form, experience: e.target.value})}
                    placeholder="List Varsity experience, All-Star selections, etc."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-[var(--btb-red)] text-white text-[1.05rem] font-black uppercase tracking-[3px] rounded-lg hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50"
              >
                {submitting ? "PROCESSING_REQUEST..." : "SUBMIT_EVALUATION_INTEREST"}
              </button>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                <a
                  href="/register-boys-tryouts"
                  className="py-4 text-center bg-black border border-[var(--btb-red)] text-white text-[1.0rem] font-black uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red)] transition-all"
                >
                  Register Boys →
                </a>
                <a
                  href="/register-girls-tryouts"
                  className="py-4 text-center bg-black border border-[var(--btb-red)] text-white text-[1.0rem] font-black uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red)] transition-all"
                >
                  Register Girls →
                </a>
                <a
                  href="/register-boys-east-tryouts"
                  className="py-4 text-center bg-black border border-white/15 text-white text-[1.0rem] font-black uppercase tracking-[2px] rounded-lg hover:border-[var(--btb-red)] hover:bg-[var(--btb-red)] transition-all"
                >
                  Boys East →
                </a>
              </div>
            </form>
          </div>

          {/* Sidebar Column */}
          <aside className="lg:pt-[180px]">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--btb-red)]/5 -skew-x-[45deg] translate-x-12 -translate-y-12" />
                <Calendar className="text-[var(--btb-red)] mb-6" size={28} />
                <h3 className="font-display text-xl text-white uppercase tracking-wider mb-4">2026 Evaluation Cycle</h3>
                <p className="text-white/70 text-[1.1rem] leading-relaxed mb-6">
                  2026 tryout registration is open for Boys, Girls, and BTB East. Each evaluation includes a BTB pinnie, filmed tryout, and evaluation system.
                </p>
                <div className="flex items-center gap-3 text-[var(--btb-red)] font-black text-[1.08rem] uppercase tracking-[2px]">
                  <Activity size={12} className="animate-pulse" />
                  Status: Registration Open
                </div>
              </div>

              <div className="p-8 border border-white/5 rounded-2xl">
                <h3 className="font-display text-xl text-white uppercase tracking-wider mb-6">Why BTB?</h3>
                <ul className="space-y-4">
                  {[
                    "Elite National Schedule",
                    "2+ Coaches Per Team",
                    "Mandatory Film Study",
                    "Recruiting Path Guidance",
                    "Pro-Level Curriculum"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-[1.05rem] text-white/78">
                      <div className="w-1 h-1 rounded-full bg-[var(--btb-red)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
