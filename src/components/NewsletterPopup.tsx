import { useCallback, useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { X, Mail, CheckCircle2 } from "lucide-react"

const STORAGE_KEY = "btb-newsletter-popup"
const POSTER_SRC = "/images/BTB_We_Built_One_Poster.webp"
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

  const handleClose = useCallback(() => {
    if (!submitted) writeState("dismissed")
    setOpen(false)
  }, [submitted])

  useEffect(() => {
    if (readState()) return
    const poster = new Image()
    poster.src = POSTER_SRC
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
  }, [open, handleClose])

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
      aria-describedby="btb-newsletter-description"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div
        data-lenis-prevent
        className="relative z-10 w-full max-w-[920px] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-black border border-white/10 rounded-2xl shadow-2xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          autoFocus
          className="absolute z-20 right-3 top-3 sm:right-4 sm:top-4 w-9 h-9 rounded-full flex items-center justify-center bg-black/75 border border-white/15 text-white/80 hover:text-white hover:bg-black transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="relative overflow-hidden bg-black border-b border-white/10 md:border-b-0 md:border-r">
            <img
              src={POSTER_SRC}
              alt="A red BTB B standing apart from a wall of established club names. We didn't chase a name. We built one."
              width={800}
              height={1251}
              className="w-full h-[min(38dvh,300px)] md:h-full md:min-h-[610px] object-cover object-[center_45%] md:object-contain"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent md:hidden"
            />
          </div>
          <div className="flex items-center p-5 pt-6 sm:p-8 md:p-10">
            <div className="w-full">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[var(--btb-red)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-[var(--btb-red)]" />
                  </div>
                  <h2 id="btb-newsletter-title" className="font-display text-3xl text-white uppercase mb-3">
                    You're In
                  </h2>
                  <p id="btb-newsletter-description" className="text-white/80 text-[1.18rem] leading-relaxed mb-8">
                    Welcome to the BTB list. Look out for news, events, and updates from the program.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.25rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[var(--btb-red)] font-mono text-[1.08rem] tracking-[5px] mb-5">
                    <Mail size={12} />
                    BTB_NEWSLETTER
                  </div>
                  <h2
                    id="btb-newsletter-title"
                    className="font-display text-[clamp(2rem,5vw,2.75rem)] uppercase leading-[0.9] text-white mb-3"
                  >
                    Built Different. <span className="text-[var(--btb-red)]">Stay Connected.</span>
                  </h2>
                  <p id="btb-newsletter-description" className="text-white/80 text-[1.15rem] leading-relaxed mb-7">
                    Join the BTB email list for club news, events, tryouts, and program updates straight to your inbox.
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
                        className="w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.15rem] placeholder:text-white/25 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
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
                        className="w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.15rem] placeholder:text-white/25 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
                      />
                    </div>
                    <div>
                      <div role="group" aria-label="Program interest" className="flex gap-2">
                        <button
                          type="button"
                          aria-pressed={gender === "Boys"}
                          onClick={() => setGender("Boys")}
                          className={`flex-1 h-12 rounded-lg text-[1.05rem] font-bold uppercase tracking-[1.5px] transition-all border ${gender === "Boys" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/70 hover:border-white/30"}`}
                        >
                          Boys
                        </button>
                        <button
                          type="button"
                          aria-pressed={gender === "Girls"}
                          onClick={() => setGender("Girls")}
                          className={`flex-1 h-12 rounded-lg text-[1.05rem] font-bold uppercase tracking-[1.5px] transition-all border ${gender === "Girls" ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" : "bg-white/[0.04] border-white/10 text-white/70 hover:border-white/30"}`}
                        >
                          Girls
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.25rem] font-bold uppercase tracking-[2px] rounded hover:bg-[var(--btb-red-dark)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Joining…" : "Join The List"}
                    </button>
                    <p className="text-[1.25rem] text-white/85 text-center pt-1">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
