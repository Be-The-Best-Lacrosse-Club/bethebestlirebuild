import { useEffect, useState, type FormEvent } from "react"
import { ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Copy, ExternalLink, Mail, Phone, ShieldCheck, Users, Video, X } from "lucide-react"
import { toast } from "sonner"
import { SEO } from "@/components/shared/SEO"

const FORM_NAME = "btb-2037-supernova-zoom-registration"
const ZOOM_URL = "https://us06web.zoom.us/j/84173521590"
const MEETING_ID = "841 7352 1590"

function encodeForm(form: HTMLFormElement) {
  const params = new URLSearchParams()
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") params.append(key, value)
  }

  return params.toString()
}

function phoneIsValid(phone: string) {
  return phone.replace(/\D/g, "").length >= 10
}

export function SupernovaZoomRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showLinkReminder, setShowLinkReminder] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!showLinkReminder) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowLinkReminder(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [showLinkReminder])

  async function copyZoomLink() {
    try {
      await navigator.clipboard.writeText(ZOOM_URL)
      setLinkCopied(true)
      toast.success("Zoom link copied. You're ready for tonight.")
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = ZOOM_URL
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      const copied = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (copied) {
        setLinkCopied(true)
        toast.success("Zoom link copied. You're ready for tonight.")
      } else {
        toast.error("Press and hold the Zoom link to copy it.")
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    if (String(formData.get("bot-field") || "").trim()) return

    const phone = String(formData.get("phone") || "")
    if (!phoneIsValid(phone)) {
      toast.error("Please enter a valid 10-digit mobile number.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(form),
      })

      if (!response.ok) throw new Error(`Form submission failed (${response.status})`)

      setSubmitted(true)
      setShowLinkReminder(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      toast.success("You're registered. Your Zoom link is ready.")
    } catch {
      toast.error("We couldn't save your registration. Please try again or call BTB directly.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    "mt-2 h-12 w-full rounded-lg border border-white/15 bg-white/[0.05] px-4 text-base font-medium normal-case tracking-normal text-white placeholder:text-white/35 transition-colors focus:border-[var(--btb-red)] focus:outline-none"
  const selectClass = `${inputClass} appearance-none text-white [color-scheme:dark]`
  const labelClass = "block text-sm font-black uppercase tracking-[1.5px] text-white/80"

  if (submitted) {
    return (
      <>
        <SEO
          title="You're Registered | 2037 Supernova Zoom"
          description="Registration confirmed for the BTB 2037 Girls Supernova Zoom meeting."
          path="/2037-supernova"
        />
        <section className="min-h-screen bg-black px-5 pb-20 pt-40 text-white sm:px-8">
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-red-950/20">
            <div className="h-1.5 bg-[var(--btb-red)]" />
            <div className="p-7 text-center sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--btb-red)]/15">
                <CheckCircle2 className="text-[var(--btb-red)]" size={42} aria-hidden="true" />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[4px] text-[var(--btb-red)]">Registration Confirmed</p>
              <h1 className="mt-3 font-display text-[clamp(3.2rem,12vw,5.8rem)] uppercase leading-[0.86]">
                You&apos;re In.<br />See You Tonight.
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-base font-medium leading-relaxed text-white/65 sm:text-lg">
                Save the link now. We&apos;re also sending it to the email address you registered with.
              </p>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.035] p-5 text-left sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="shrink-0 text-[var(--btb-red)]" size={20} aria-hidden="true" />
                    <div>
                      <div className="text-xs font-black uppercase tracking-[2px] text-white/40">Date</div>
                      <div className="mt-1 font-bold">Thursday, September 3</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="shrink-0 text-[var(--btb-red)]" size={20} aria-hidden="true" />
                    <div>
                      <div className="text-xs font-black uppercase tracking-[2px] text-white/40">Time</div>
                      <div className="mt-1 font-bold">8:00 PM Eastern</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 border-t border-white/10 pt-5 text-sm text-white/55">
                  Meeting ID: <span className="font-bold text-white">{MEETING_ID}</span>
                </div>
                <a
                  href={ZOOM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block break-all rounded-lg bg-black/45 px-4 py-3 text-xs font-bold text-white underline decoration-[var(--btb-red)] underline-offset-4 sm:text-sm"
                >
                  {ZOOM_URL}
                </a>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyZoomLink}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-[var(--btb-red)] px-6 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:bg-[var(--btb-red-dark)]"
                >
                  {linkCopied ? <Check size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}
                  {linkCopied ? "Link Copied" : "Copy Zoom Link"}
                </button>
                <a
                  href={ZOOM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/[0.06] px-6 text-sm font-black uppercase tracking-[2px] text-white transition-all hover:border-white/40 hover:bg-white/10"
                >
                  <Video size={19} aria-hidden="true" /> Join the Zoom <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>

              <p className="mt-8 text-sm leading-relaxed text-white/45">
                Know another family who may be interested? Send them this registration page:<br />
                <span className="font-semibold text-white/70">bethebestli.com/2037-supernova</span>
              </p>
            </div>
          </div>

          {showLinkReminder && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="zoom-link-reminder-title"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setShowLinkReminder(false)
              }}
            >
              <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0b] text-left shadow-2xl shadow-black">
                <div className="h-1.5 bg-[var(--btb-red)]" />
                <button
                  type="button"
                  onClick={() => setShowLinkReminder(false)}
                  className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close Zoom link reminder"
                >
                  <X size={20} aria-hidden="true" />
                </button>

                <div className="p-6 sm:p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--btb-red)]/15 text-[var(--btb-red)]">
                    <Copy size={26} aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-xs font-black uppercase tracking-[3px] text-[var(--btb-red)]">Registration Complete</p>
                  <h2 id="zoom-link-reminder-title" className="mt-2 pr-8 font-display text-4xl uppercase leading-none sm:text-5xl">
                    Copy the Zoom Link
                  </h2>
                  <p className="mt-4 text-base font-medium leading-relaxed text-white/65">
                    Save this link now so it&apos;s ready for tonight at 8:00 PM Eastern.
                  </p>

                  <a
                    href={ZOOM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 block break-all rounded-xl border border-white/10 bg-black px-4 py-4 text-xs font-bold leading-relaxed text-white underline decoration-[var(--btb-red)] underline-offset-4 sm:text-sm"
                  >
                    {ZOOM_URL}
                  </a>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyZoomLink}
                      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[var(--btb-red)] px-5 text-sm font-black uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--btb-red-dark)]"
                    >
                      {linkCopied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                      <span aria-live="polite">{linkCopied ? "Link Copied" : "Copy Zoom Link"}</span>
                    </button>
                    <a
                      href={ZOOM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-black uppercase tracking-[1.5px] text-white transition-colors hover:bg-white/10"
                    >
                      Join Zoom <ExternalLink size={17} aria-hidden="true" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLinkReminder(false)}
                    className="mt-5 w-full text-center text-xs font-black uppercase tracking-[2px] text-white/45 transition-colors hover:text-white"
                  >
                    Continue to Confirmation
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Register | 2037 Girls Supernova Zoom Meeting"
        description="Register for Coach Dan's 2037 Girls Supernova Zoom meeting on September 3 at 8:00 PM Eastern."
        path="/2037-supernova"
        ogImage="https://www.bethebestli.com/images/home/BTB_Girls_Development_Team_2026.jpg"
      />

      <section className="relative overflow-hidden bg-black px-5 pb-20 pt-40 text-white sm:px-8 lg:pb-28 lg:pt-44">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="/images/home/BTB_Girls_Development_Team_2026.jpg"
            alt=""
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/90 to-black" />
          <div className="absolute -left-24 top-48 h-80 w-80 rounded-full bg-[var(--btb-red)]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--btb-red)]/35 bg-[var(--btb-red)]/10 px-4 py-2 text-xs font-black uppercase tracking-[2px] text-[var(--btb-red)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--btb-red)]" aria-hidden="true" /> Tonight at 8:00 PM
            </div>

            <h1 className="mt-7 font-display text-[clamp(4.2rem,11vw,7.7rem)] uppercase leading-[0.78] tracking-[-0.02em]">
              2037 Girls<br /><span className="text-[var(--btb-red)]">Supernova.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-white/72 sm:text-xl">
              Join Coach Dan for a live team update and Q&amp;A for committed, uncommitted, and interested families.
            </p>

            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              <div className="flex items-center gap-4 py-4">
                <CalendarDays className="text-[var(--btb-red)]" size={22} aria-hidden="true" />
                <div>
                  <div className="text-xs font-black uppercase tracking-[2px] text-white/40">Date</div>
                  <div className="mt-1 font-bold">Thursday, September 3, 2026</div>
                </div>
              </div>
              <div className="flex items-center gap-4 py-4">
                <Clock3 className="text-[var(--btb-red)]" size={22} aria-hidden="true" />
                <div>
                  <div className="text-xs font-black uppercase tracking-[2px] text-white/40">Time</div>
                  <div className="mt-1 font-bold">8:00 PM Eastern</div>
                </div>
              </div>
              <div className="flex items-center gap-4 py-4">
                <Users className="text-[var(--btb-red)]" size={22} aria-hidden="true" />
                <div>
                  <div className="text-xs font-black uppercase tracking-[2px] text-white/40">Who Should Join</div>
                  <div className="mt-1 font-bold">Any family interested in 2037 Supernova</div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-relaxed text-white/60">
              <ShieldCheck className="mt-0.5 shrink-0 text-[var(--btb-red)]" size={20} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-black uppercase tracking-[1.5px] text-white">Zoom Meeting Link</p>
                <a
                  href={ZOOM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-xs font-bold text-white underline decoration-[var(--btb-red)] underline-offset-4 sm:text-sm"
                >
                  {ZOOM_URL}
                </a>
                <p className="mt-3">Please register below so Coach Dan knows you&apos;re joining, and share this page with other interested families.</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 shadow-2xl shadow-black">
            <div className="h-1.5 bg-[var(--btb-red)]" />
            <div className="p-6 sm:p-9 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[3px] text-[var(--btb-red)]">Reserve Your Spot</p>
              <h2 className="mt-2 font-display text-4xl uppercase leading-none sm:text-5xl">Register for Tonight</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/52 sm:text-base">
                All fields marked with an asterisk are required. Coach Dan will use this information to follow up with your family.
              </p>

              <form
                name={FORM_NAME}
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="mt-8 space-y-8"
              >
                <input type="hidden" name="form-name" value={FORM_NAME} />
                <input type="hidden" name="subject" value="2037 Girls Supernova Zoom Registration" />
                <input type="hidden" name="source" value="2037 Supernova Zoom Registration Page" />
                <input type="hidden" name="program_gender" value="Girls" />
                <input type="hidden" name="gradYear" value="2037" />
                <input type="hidden" name="meeting_date" value="September 3, 2026" />
                <input type="hidden" name="meeting_time" value="8:00 PM Eastern" />
                <p className="hidden">
                  <label>
                    Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
                  </label>
                </p>

                <fieldset>
                  <legend className="flex w-full items-center gap-3 border-b border-white/10 pb-3 font-display text-xl uppercase tracking-wider">
                    <Phone size={17} className="text-[var(--btb-red)]" aria-hidden="true" /> Parent / Guardian
                  </legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className={labelClass} htmlFor="supernova-parent-first-name">
                      First Name *
                      <input id="supernova-parent-first-name" name="parent_first_name" type="text" autoComplete="given-name" required className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-parent-last-name">
                      Last Name *
                      <input id="supernova-parent-last-name" name="parent_last_name" type="text" autoComplete="family-name" required className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-email">
                      Email *
                      <span className="relative block">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-white/30" size={17} aria-hidden="true" />
                        <input id="supernova-email" name="email" type="email" autoComplete="email" required className={`${inputClass} pl-11`} />
                      </span>
                    </label>
                    <label className={labelClass} htmlFor="supernova-phone">
                      Mobile Phone *
                      <span className="relative block">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-white/30" size={17} aria-hidden="true" />
                        <input id="supernova-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(516) 555-1234" className={`${inputClass} pl-11`} />
                      </span>
                    </label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="flex w-full items-center gap-3 border-b border-white/10 pb-3 font-display text-xl uppercase tracking-wider">
                    <Users size={17} className="text-[var(--btb-red)]" aria-hidden="true" /> Player Information
                  </legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className={labelClass} htmlFor="supernova-player-first-name">
                      Player First Name *
                      <input id="supernova-player-first-name" name="player_first_name" type="text" autoComplete="off" required className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-player-last-name">
                      Player Last Name *
                      <input id="supernova-player-last-name" name="player_last_name" type="text" autoComplete="off" required className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-school-town">
                      Town / School District *
                      <input id="supernova-school-town" name="school_town" type="text" required className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-current-club">
                      Current Club / Team *
                      <input id="supernova-current-club" name="currentClub" type="text" required placeholder="Enter None if new to lacrosse" className={inputClass} />
                    </label>
                    <label className={labelClass} htmlFor="supernova-position">
                      Primary Position
                      <select id="supernova-position" name="position" defaultValue="" className={selectClass}>
                        <option value="">Select one</option>
                        <option>Attack</option>
                        <option>Midfield</option>
                        <option>Defense</option>
                        <option>Goalie</option>
                        <option>New / Not sure yet</option>
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="supernova-experience">
                      Lacrosse Experience *
                      <select id="supernova-experience" name="experience" defaultValue="" required className={selectClass}>
                        <option value="" disabled>Select one</option>
                        <option>New player</option>
                        <option>Less than 1 year</option>
                        <option>1–2 years</option>
                        <option>3+ years</option>
                      </select>
                    </label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="flex w-full items-center gap-3 border-b border-white/10 pb-3 font-display text-xl uppercase tracking-wider">
                    <Video size={17} className="text-[var(--btb-red)]" aria-hidden="true" /> Interest &amp; Follow-Up
                  </legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className={labelClass} htmlFor="supernova-family-status">
                      Where Does Your Family Stand? *
                      <select id="supernova-family-status" name="family_status" defaultValue="" required className={selectClass}>
                        <option value="" disabled>Select one</option>
                        <option>Committed to 2037 Supernova</option>
                        <option>Invited and still deciding</option>
                        <option>Interested in joining the team</option>
                        <option>New to BTB and learning more</option>
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="supernova-attendance">
                      Will You Attend Live? *
                      <select id="supernova-attendance" name="attendance" defaultValue="" required className={selectClass}>
                        <option value="" disabled>Select one</option>
                        <option>Yes — I'll be on the Zoom</option>
                        <option>Maybe — send me the link</option>
                        <option>Can't attend — please contact me</option>
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="supernova-contact-method">
                      Preferred Contact Method *
                      <select id="supernova-contact-method" name="preferred_contact" defaultValue="" required className={selectClass}>
                        <option value="" disabled>Select one</option>
                        <option>Phone call</option>
                        <option>Text message</option>
                        <option>Email</option>
                      </select>
                    </label>
                    <label className={labelClass} htmlFor="supernova-call-time">
                      Best Time to Call *
                      <select id="supernova-call-time" name="best_time_to_call" defaultValue="" required className={selectClass}>
                        <option value="" disabled>Select one</option>
                        <option>Morning (8 AM–12 PM)</option>
                        <option>Afternoon (12–5 PM)</option>
                        <option>Evening (5–8 PM)</option>
                        <option>Anytime</option>
                      </select>
                    </label>
                    <label className={`${labelClass} sm:col-span-2`} htmlFor="supernova-how-heard">
                      How Did You Hear About This Meeting?
                      <select id="supernova-how-heard" name="how_heard" defaultValue="" className={selectClass}>
                        <option value="">Select one</option>
                        <option>BTB email</option>
                        <option>Current BTB family</option>
                        <option>Friend or teammate</option>
                        <option>Coach referral</option>
                        <option>Social media</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className={`${labelClass} sm:col-span-2`} htmlFor="supernova-notes">
                      Questions for Coach Dan
                      <textarea
                        id="supernova-notes"
                        name="notes"
                        rows={4}
                        placeholder="Anything you want Coach Dan to know before the meeting?"
                        className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-white/[0.05] px-4 py-3 text-base font-medium normal-case tracking-normal text-white placeholder:text-white/35 focus:border-[var(--btb-red)] focus:outline-none"
                      />
                    </label>
                  </div>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-relaxed text-white/60" htmlFor="supernova-contact-consent">
                  <input
                    id="supernova-contact-consent"
                    name="contact_consent"
                    value="Yes"
                    type="checkbox"
                    required
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--btb-red)]"
                  />
                  <span>
                    I agree that BTB may call, text, or email me about this meeting and related lacrosse opportunities. Message and data rates may apply. Reply STOP to opt out. See our{" "}
                    <a href="/sms-policy" className="font-bold text-white underline decoration-[var(--btb-red)] underline-offset-4">SMS policy</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-[var(--btb-red)] px-6 text-sm font-black uppercase tracking-[2px] text-white shadow-xl shadow-red-950/30 transition-all hover:bg-[var(--btb-red-dark)] disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? "Saving Registration..." : "Register & Get Zoom Link"}
                  {!submitting && <ArrowRight size={18} aria-hidden="true" />}
                </button>
                <p className="text-center text-xs leading-relaxed text-white/35">
                  Your information is sent securely to BTB Lacrosse Club and is not shown publicly.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
