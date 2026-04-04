import { useState, useEffect, type FormEvent } from "react"
import { toast } from "sonner"
import { Mail, Phone, MapPin, Send, ArrowRight, Users, ChevronDown } from "lucide-react"

type ContactForm = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type RegistrationForm = {
  playerFirstName: string
  playerLastName: string
  gradYear: string
  programInterest: string
  parentName: string
  parentEmail: string
  parentPhone: string
  hearAboutUs: string
  notes: string
}

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Boys Program",
  "Girls Program",
  "Academy",
  "Travel Teams",
  "Other",
]

const GRAD_YEARS = Array.from({ length: 11 }, (_, i) => String(2026 + i))

const PROGRAM_OPTIONS = [
  "Boys Travel",
  "Girls Travel",
  "Academy",
  "Summer Camp",
]

const HEAR_ABOUT_OPTIONS = [
  "Word of Mouth",
  "Social Media",
  "Google Search",
  "Lacrosse Event / Tournament",
  "Coach Referral",
  "Other",
]

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactPage() {
  const [activeTab, setActiveTab] = useState<"contact" | "register">("contact")

  // Contact form state
  const [contact, setContact] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [contactSubmitting, setContactSubmitting] = useState(false)

  // Registration form state
  const [reg, setReg] = useState<RegistrationForm>({
    playerFirstName: "",
    playerLastName: "",
    gradYear: "",
    programInterest: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    hearAboutUs: "",
    notes: "",
  })
  const [regSubmitting, setRegSubmitting] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Contact form submit
  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault()
    if (!contact.name || !contact.email || !contact.subject || !contact.message) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!validateEmail(contact.email)) {
      toast.error("Please enter a valid email address.")
      return
    }
    setContactSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...contact }),
      })
      toast.success("Message sent! We'll get back to you shortly.")
      setContact({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setContactSubmitting(false)
    }
  }

  // Registration form submit
  async function handleRegSubmit(e: FormEvent) {
    e.preventDefault()
    if (
      !reg.playerFirstName ||
      !reg.playerLastName ||
      !reg.gradYear ||
      !reg.programInterest ||
      !reg.parentName ||
      !reg.parentEmail ||
      !reg.parentPhone
    ) {
      toast.error("Please fill in all required fields.")
      return
    }
    if (!validateEmail(reg.parentEmail)) {
      toast.error("Please enter a valid email address.")
      return
    }
    setRegSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "registration-inquiry", ...reg }),
      })
      toast.success("Registration inquiry submitted! We'll be in touch soon.")
      setReg({
        playerFirstName: "",
        playerLastName: "",
        gradYear: "",
        programInterest: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        hearAboutUs: "",
        notes: "",
      })
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setRegSubmitting(false)
    }
  }

  const inputClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[0.85rem] placeholder:text-white/25 focus:outline-none focus:border-[#D22630]/60 focus:ring-1 focus:ring-[#D22630]/30 transition-colors"
  const selectClass =
    "w-full h-11 px-4 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[0.85rem] focus:outline-none focus:border-[#D22630]/60 focus:ring-1 focus:ring-[#D22630]/30 transition-colors appearance-none cursor-pointer"
  const labelClass = "block text-[0.7rem] font-semibold uppercase tracking-[1.5px] text-white/40 mb-2"
  const textareaClass =
    "w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-lg text-white text-[0.85rem] placeholder:text-white/25 focus:outline-none focus:border-[#D22630]/60 focus:ring-1 focus:ring-[#D22630]/30 transition-colors resize-none"

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.02) 80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] z-[2]"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(210,38,48,0.12) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-[900px] mx-auto pt-16 text-center">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-6">
            Get In Touch
          </div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] uppercase tracking-wide leading-[0.88] mb-6">
            Contact <span className="text-[#D22630]">BTB</span>
          </h1>
          <p className="text-[0.92rem] text-white/40 max-w-[500px] mx-auto leading-[1.8]">
            Have questions about our programs? Ready to take the next step? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="px-6 pb-28">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Forms column */}
            <div>
              {/* Tab switcher */}
              <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1.5 mb-10">
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[0.72rem] font-bold uppercase tracking-[1.5px] transition-all ${
                    activeTab === "contact"
                      ? "bg-[#D22630] text-white shadow-lg shadow-[#D22630]/20"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Mail size={14} />
                  Contact Us
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[0.72rem] font-bold uppercase tracking-[1.5px] transition-all ${
                    activeTab === "register"
                      ? "bg-[#D22630] text-white shadow-lg shadow-[#D22630]/20"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Users size={14} />
                  Registration Inquiry
                </button>
              </div>

              {/* Contact Form */}
              {activeTab === "contact" && (
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  onSubmit={handleContactSubmit}
                  className="space-y-6"
                >
                  <input type="hidden" name="form-name" value="contact" />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>
                        Name <span className="text-[#D22630]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Email <span className="text-[#D22630]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@email.com"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="(555) 555-5555"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="relative">
                      <label className={labelClass}>
                        Subject <span className="text-[#D22630]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="subject"
                          value={contact.subject}
                          onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                          className={selectClass}
                          required
                        >
                          <option value="" disabled>
                            Select a topic
                          </option>
                          {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-neutral-900">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Message <span className="text-[#D22630]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us what you're looking for..."
                      value={contact.message}
                      onChange={(e) => setContact({ ...contact, message: e.target.value })}
                      className={textareaClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[#b81f28] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {contactSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message <Send size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Registration Inquiry Form */}
              {activeTab === "register" && (
                <form
                  name="registration-inquiry"
                  method="POST"
                  data-netlify="true"
                  onSubmit={handleRegSubmit}
                  className="space-y-6"
                >
                  <input type="hidden" name="form-name" value="registration-inquiry" />

                  {/* Player Info */}
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-[2px] text-white mb-5 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D22630]" />
                      Player Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>
                          First Name <span className="text-[#D22630]">*</span>
                        </label>
                        <input
                          type="text"
                          name="playerFirstName"
                          placeholder="Player first name"
                          value={reg.playerFirstName}
                          onChange={(e) => setReg({ ...reg, playerFirstName: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Last Name <span className="text-[#D22630]">*</span>
                        </label>
                        <input
                          type="text"
                          name="playerLastName"
                          placeholder="Player last name"
                          value={reg.playerLastName}
                          onChange={(e) => setReg({ ...reg, playerLastName: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelClass}>
                        Graduation Year <span className="text-[#D22630]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="gradYear"
                          value={reg.gradYear}
                          onChange={(e) => setReg({ ...reg, gradYear: e.target.value })}
                          className={selectClass}
                          required
                        >
                          <option value="" disabled>
                            Select year
                          </option>
                          {GRAD_YEARS.map((yr) => (
                            <option key={yr} value={yr} className="bg-neutral-900">
                              {yr}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className={labelClass}>
                        Program Interest <span className="text-[#D22630]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="programInterest"
                          value={reg.programInterest}
                          onChange={(e) => setReg({ ...reg, programInterest: e.target.value })}
                          className={selectClass}
                          required
                        >
                          <option value="" disabled>
                            Select program
                          </option>
                          {PROGRAM_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-neutral-900">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="pt-2">
                    <h3 className="font-display text-lg uppercase tracking-[2px] text-white mb-5 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D22630]" />
                      Parent / Guardian Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className={labelClass}>
                          Parent / Guardian Name <span className="text-[#D22630]">*</span>
                        </label>
                        <input
                          type="text"
                          name="parentName"
                          placeholder="Full name"
                          value={reg.parentName}
                          onChange={(e) => setReg({ ...reg, parentName: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Phone <span className="text-[#D22630]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="parentPhone"
                          placeholder="(555) 555-5555"
                          value={reg.parentPhone}
                          onChange={(e) => setReg({ ...reg, parentPhone: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Email <span className="text-[#D22630]">*</span>
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        placeholder="parent@email.com"
                        value={reg.parentEmail}
                        onChange={(e) => setReg({ ...reg, parentEmail: e.target.value })}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* Additional */}
                  <div className="relative">
                    <label className={labelClass}>How did you hear about us?</label>
                    <div className="relative">
                      <select
                        name="hearAboutUs"
                        value={reg.hearAboutUs}
                        onChange={(e) => setReg({ ...reg, hearAboutUs: e.target.value })}
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Select one
                        </option>
                        {HEAR_ABOUT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-neutral-900">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Anything else you'd like us to know (positions played, previous teams, etc.)"
                      value={reg.notes}
                      onChange={(e) => setReg({ ...reg, notes: e.target.value })}
                      className={textareaClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regSubmitting}
                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[#b81f28] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {regSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Inquiry <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:pt-[72px]">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 space-y-8">
                <div>
                  <h3 className="font-display text-base uppercase tracking-[2px] text-white mb-6">
                    Club Info
                  </h3>

                  <div className="space-y-5">
                    <a
                      href="mailto:info@bethebestli.com"
                      className="flex items-start gap-3.5 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D22630]/20 transition-colors">
                        <Mail size={15} className="text-[#D22630]" />
                      </div>
                      <div>
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[1.5px] text-white/30 mb-1">
                          Email
                        </div>
                        <div className="text-[0.85rem] text-white/70 group-hover:text-white transition-colors">
                          info@bethebestli.com
                        </div>
                      </div>
                    </a>

                    <a href="tel:+16315551234" className="flex items-start gap-3.5 group">
                      <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D22630]/20 transition-colors">
                        <Phone size={15} className="text-[#D22630]" />
                      </div>
                      <div>
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[1.5px] text-white/30 mb-1">
                          Phone
                        </div>
                        <div className="text-[0.85rem] text-white/70 group-hover:text-white transition-colors">
                          (516) 659-6377
                        </div>
                      </div>
                    </a>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={15} className="text-[#D22630]" />
                      </div>
                      <div>
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[1.5px] text-white/30 mb-1">
                          Location
                        </div>
                        <div className="text-[0.85rem] text-white/70">Long Island, NY</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Social Links */}
                <div>
                  <h3 className="font-display text-base uppercase tracking-[2px] text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="flex gap-2.5">
                    {[
                      { label: "IG", href: "#" },
                      { label: "X", href: "#" },
                      { label: "YT", href: "#" },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        className="w-10 h-10 rounded-lg border border-white/[0.08] flex items-center justify-center text-[0.65rem] font-bold text-white/25 hover:bg-[#D22630] hover:border-[#D22630] hover:text-white transition-all"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Quick note */}
                <div className="bg-[#D22630]/5 border border-[#D22630]/10 rounded-xl p-5">
                  <p className="text-[0.78rem] text-white/50 leading-[1.7]">
                    <span className="text-[#D22630] font-semibold">Response time:</span> We typically reply within 24-48 hours during the season. For urgent matters, please call.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
