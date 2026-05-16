import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { X, Mail, CheckCircle2 } from "lucide-react"

const STORAGE_KEY = "btb-newsletter-popup"
const SHOW_DELAY_MS = 12000
const DISMISS_TTL_DAYS = 30
const SUBSCRIBED_TTL_DAYS = 365

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function readState(): { state: "dismissed" | "subscribed"; expires: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.expires !== "number" || parsed.expires < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeState(state: "dismissed" | "subscribed") {
  const days = state === "subscribed" ? SUBSCRIBED_TTL_DAYS : DISMISS_TTL_DAYS
  const expires = Date.now() + days * 24 * 60 * 60 * 1000
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, expires }))
  } catch {
    // ignore quota / privacy mode failures
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("")
  const [botField, setBotField] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (readState()) return
    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  function handleClose() {
    if (!submitted) writeState("dismissed")
    setOpen(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (botField) return
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.")
      return
    }
    setSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "newsletter",
          name,
          email,
          program_gender: gender,
          source: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      })
      writeState("subscribed")
      setSubmitted(true)
      toast.success("You're on the list. Check your inbox.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="btb-newsletter-title"
    >
      <button
        type="button"
        aria-label="Close newsletter"
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[480px] bg-black border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[var(--btb-red)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[var(--btb-red)]" />
            </div>
            <h2 className="font-display text-3xl text-white uppercase mb-3">You're In</h2>
            <p className="text-white/50 text-[0.9rem] leading-relaxed mb-8">
              Welcome to the BTB list. Look out for news, events, and updates from the program.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[0.7rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[var(--btb-red)] font-mono text-[0.6rem] tracking-[5px] mb-5">
              <Mail size={12} />
              BTB_NEWSLETTER
            </div>
            <h2
              id="btb-newsletter-title"
              className="font-display text-[clamp(2rem,5vw,2.75rem)] uppercase leading-[0.9] text-white mb-3"
            >
              Stay In The <span className="text-[var(--btb-red)]">Loop.</span>
            </h2>
            <p className="text-white/50 text-[0.88rem] leading-relaxed mb-7">
              Join the BTB email list for news, events, tryouts, and program updates straight to your inbox.
            </p>

            <form
              name="newsletter"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="form-name" value="newsletter" />
              <input type="hidden" name="program_gender" value={gender} />
              <p className="hidden">
                <label>
                  Don't fill this out:{" "}
                  <input
                    name="bot-field"
                    value={botField}
                    onChange={(e) => setBotField(e.target.value)}
                  />
                </label>
              </p>

              <div>
                <label htmlFor="btb-newsletter-name" className="sr-only">
                  Name
                </label>
                <input
                  id="btb-newsletter-name"
                  type="text"
                  name="name"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[0.88rem] placeholder:text-white/25 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="btb-newsletter-email" className="sr-only">
                  Email
                </label>
                <input
                  id="btb-newsletter-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[0.88rem] placeholder:text-white/25 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
                />
              </div>
              <div>
                <label className="sr-only">Gender</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("Boys")}
                    className={`flex-1 h-12 rounded-lg text-[0.78rem] font-bold uppercase tracking-[1.5px] transition-all border ${gender === "Boys" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/40 hover:border-white/30"}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("Girls")}
                    className={`flex-1 h-12 rounded-lg text-[0.78rem] font-bold uppercase tracking-[1.5px] transition-all border ${gender === "Girls" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/40 hover:border-white/30"}`}
                  >
                    Female
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[0.7rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Joining…" : "Join The List"}
              </button>
              <p className="text-[0.7rem] text-white/30 text-center pt-1">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
