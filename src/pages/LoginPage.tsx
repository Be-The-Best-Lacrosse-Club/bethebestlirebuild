import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { SEO } from "@/components/shared/SEO"
import { ArrowLeft, Lock, Loader2, Mail, CheckCircle, UserPlus } from "lucide-react"
import type { Gender, User } from "@/types"
import { consumeAuthCallbackError, getPendingAuthAction } from "@/lib/auth"

type View = "login" | "signup" | "signup-sent" | "forgot" | "forgot-sent" | "set-password"

// Bot protection — honeypot field name and client-side rate limit
const HONEYPOT_FIELD = "website_url" // Invisible field bots fill, humans don't see
const RATE_LIMIT_KEY = "btb-signup-attempts"
const MAX_ATTEMPTS = 5
const RATE_WINDOW_MS = 60_000 // 1 minute

function checkRateLimit(): { allowed: boolean; resetIn: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    const now = Date.now()
    const attempts: number[] = raw ? JSON.parse(raw) : []
    // Keep only attempts from within the rate window
    const recent = attempts.filter((t) => now - t < RATE_WINDOW_MS)
    if (recent.length >= MAX_ATTEMPTS) {
      const oldest = Math.min(...recent)
      return { allowed: false, resetIn: Math.ceil((RATE_WINDOW_MS - (now - oldest)) / 1000) }
    }
    recent.push(now)
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent))
    return { allowed: true, resetIn: 0 }
  } catch {
    return { allowed: true, resetIn: 0 }
  }
}

export function LoginPage({ audience, recovery = false }: { audience?: "coach" | "admin"; recovery?: boolean }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [program, setProgram] = useState<Gender>("boys")
  const [gradYear, setGradYear] = useState("")
  const [honeypot, setHoneypot] = useState("") // Bot trap
  const [error, setError] = useState(() => consumeAuthCallbackError())
  const [view, setView] = useState<View>(() => getPendingAuthAction() ? "set-password" : recovery ? "forgot" : "login")
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { user: signedInUser, login, signup, requestPasswordRecovery, completePendingPassword } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestedRedirect = params.get("redirect") || ""
  const redirect = /^\/(?!\/)/.test(requestedRedirect) && !/[\\\s]/.test(requestedRedirect) ? requestedRedirect : ""
  const destinationFor = (user: User) => redirect || (user.role === "owner" ? "/admin" : user.role === "coach" ? `/${user.gender}/coaches-hub` : `/${user.gender}/players`)
  const openHub = (user: User) => {
    const destination = destinationFor(user)
    if (destination.includes(".html")) window.location.assign(destination)
    else navigate(destination, { replace: true })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const user = await login(email, password)

      openHub(user)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      // Make common errors more user-friendly
      if (message.includes("invalid_grant") || message.includes("Invalid")) {
        setError("Email or password not recognized. Use Forgot / Reset Password below, or check your invitation email if this is your first visit.")
      } else if (message.includes("not_found") || message.includes("No user")) {
        setError("No account found with that email address.")
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await requestPasswordRecovery(email)
      setView("forgot-sent")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not send recovery email"
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      const user = await completePendingPassword(password)
      openHub(user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update the password.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Honeypot check — if filled, silently reject (bot trap)
    if (honeypot.trim() !== "") {
      // Pretend it succeeded so bots don't know they were caught
      setView("signup-sent")
      return
    }

    // Rate limit check
    const rate = checkRateLimit()
    if (!rate.allowed) {
      setError(`Too many attempts. Please wait ${rate.resetIn} seconds and try again.`)
      return
    }

    setSubmitting(true)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      setSubmitting(false)
      return
    }

    try {
      const result = await signup(email, password, fullName, program, gradYear || undefined)
      if (result.requiresConfirmation) {
        setView("signup-sent")
      } else {
        // Auto-logged in — redirect to player hub by default
        navigate(`/${program}/players`, { replace: true })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed"
      if (message.includes("already") || message.includes("exists") || message.includes("registered")) {
        setError("An account with that email already exists. Try signing in instead.")
      } else if (message.includes("Signups not allowed") || message.includes("not allowed")) {
        setError("Sign-ups are currently disabled. Contact your program director.")
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-black flex items-center justify-center px-6 py-12 border-t-4 border-[var(--btb-red)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Login | BTB Lacrosse Club"
        description="Sign in to your BTB Lacrosse Club account to access the Players Hub, Coaches Hub, and Academy resources."
        path="/login"
      />
      <div className="w-full max-w-[400px]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px] mb-12">
          <ArrowLeft size={15} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/20 flex items-center justify-center">
            {view === "forgot-sent" || view === "signup-sent" ? (
              <CheckCircle size={18} className="text-emerald-400" />
            ) : view === "forgot" ? (
              <Mail size={18} className="text-[var(--btb-red)]" />
            ) : view === "signup" ? (
              <UserPlus size={18} className="text-[var(--btb-red)]" />
            ) : (
              <Lock size={18} className="text-[var(--btb-red)]" />
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wide text-white">
              {view === "set-password" ? (
                <>Set New <span className="text-[var(--btb-red)]">Password</span></>
              ) : view === "forgot-sent" ? (
                <>Check Your <span className="text-emerald-400">Email</span></>
              ) : view === "signup-sent" ? (
                <>Almost <span className="text-emerald-400">There</span></>
              ) : view === "forgot" ? (
                <>Reset <span className="text-[var(--btb-red)]">Password</span></>
              ) : view === "signup" ? (
                <>Create <span className="text-[var(--btb-red)]">Account</span></>
              ) : (
                <>{audience === "admin" ? "Admin" : audience === "coach" ? "Coach" : "BTB"} <span className="text-[var(--btb-red)]">Login</span></>
              )}
            </h1>
          </div>
        </div>

        {/* LOGIN VIEW */}
        {view === "login" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              {audience === "admin" ? "For Dan and approved directors. Sign in for access to both programs, coaching resources, and website administration." : "Sign in with your own email and password. Coaches go straight to their program’s hub, playbooks, and resources."}
            </p>

            {signedInUser && (
              <button type="button" onClick={() => openHub(signedInUser)} className="w-full mb-6 rounded-lg border border-white/20 p-3 text-white">
                Continue as {signedInUser.name}
              </button>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="Password"
                />
              </div>

              {error && (
                <p className="text-[1.05rem] text-[var(--btb-red)] bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <label className="mt-4 flex items-center gap-2 text-white/80 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show password
            </label>
            <div className="mt-6 text-center">
              <button
                onClick={() => { setError(""); setPassword(""); setView("forgot") }}
                className="text-[1.0rem] text-white/85 hover:text-white/85 transition-colors"
              >
                Forgot / Reset Password
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.07] text-center">
              <p className="text-[1.05rem] text-white/70 leading-relaxed">
                First time here? Open your BTB invitation email and choose your password. Your TeamSnap or LeagueApps password may be different. Missing an invitation or locked out?
              </p>
              <a href="mailto:info@bethebestli.com?subject=Coach%20website%20access" className="inline-block mt-3 text-white underline">Get help with access</a>
              <div className="mt-4 flex justify-center gap-5 text-white/80 underline">
                <a href="/coach-login">Coach Login</a><a href="/admin-login">Admin Login</a>
              </div>
            </div>
          </>
        )}

        {/* PASSWORD RECOVERY / INVITE VIEW */}
        {view === "set-password" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              Choose the password you’ll use for your BTB account.
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">New Password</label>
                <input
                  id="new-password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="Enter it again"
                />
              </div>

              {error && (
                <p className="text-[1.05rem] text-[var(--btb-red)] bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  "Save Password & Sign In"
                )}
              </button>
            </form>
            <button type="button" onClick={() => { setError(""); setPassword(""); setConfirmPassword(""); setView("forgot") }} className="mt-6 w-full text-white underline">
              Link expired? Request a new reset link
            </button>
          </>
        )}

        {/* SIGNUP VIEW */}
        {view === "signup" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              Create your BTB account to access the Players Hub, Academy courses, and program resources.
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Honeypot — invisible to humans, bots fill it in and get blocked */}
              <div style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
                <label htmlFor={HONEYPOT_FIELD}>Website (leave blank)</label>
                <input
                  type="text"
                  id={HONEYPOT_FIELD}
                  name={HONEYPOT_FIELD}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="signup-name" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Full Name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="First Last"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Email</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="At least 8 characters"
                />
              </div>

              <fieldset>
                <legend className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Program</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={program === "boys"}
                    onClick={() => setProgram("boys")}
                    className={`py-3 rounded-lg text-[1.05rem] font-bold uppercase tracking-[1px] transition-colors ${
                      program === "boys"
                        ? "bg-[var(--btb-red)] text-white"
                        : "bg-white/[0.05] text-white/78 border border-white/[0.1] hover:bg-white/[0.08]"
                    }`}
                  >
                    Boys
                  </button>
                  <button
                    type="button"
                    aria-pressed={program === "girls"}
                    onClick={() => setProgram("girls")}
                    className={`py-3 rounded-lg text-[1.05rem] font-bold uppercase tracking-[1px] transition-colors ${
                      program === "girls"
                        ? "bg-[var(--btb-red)] text-white"
                        : "bg-white/[0.05] text-white/78 border border-white/[0.1] hover:bg-white/[0.08]"
                    }`}
                  >
                    Girls
                  </button>
                </div>
              </fieldset>

              <div>
                <label htmlFor="signup-grad-year" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Graduation Year (Optional)</label>
                <select
                  id="signup-grad-year"
                  name="graduation-year"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                >
                  <option value="">Select grad year</option>
                  {["2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035", "2036"].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-[1.05rem] text-[var(--btb-red)] bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setError(""); setView("login") }}
                className="text-[1.0rem] text-white/85 hover:text-white/85 transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        )}

        {/* SIGNUP — EMAIL CONFIRMATION SENT */}
        {view === "signup-sent" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              We sent a confirmation link to <span className="text-white/85">{email}</span>. Click the link in that email to verify your account, then come back here to sign in.
            </p>

            <button
              onClick={() => { setError(""); setView("login") }}
              className="w-full py-3.5 bg-white/[0.08] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-white/[0.12] transition-colors"
            >
              Back to Sign In
            </button>
          </>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === "forgot" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-[1.15rem] font-bold uppercase tracking-[2px] text-white/85 mb-2">Email</label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[1.15rem] placeholder:text-white/45 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <p className="text-[1.05rem] text-[var(--btb-red)] bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-lg px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setError(""); setView("login") }}
                className="text-[1.0rem] text-white/85 hover:text-white/85 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD — EMAIL SENT */}
        {view === "forgot-sent" && (
          <>
            <p className="text-[1.1rem] text-white/70 leading-relaxed mb-8">
              If an account exists for <span className="text-white/85">{email}</span>, you'll receive a password reset link shortly. Check your inbox and spam folder.
            </p>

            <button
              onClick={() => { setError(""); setView("login") }}
              className="w-full py-3.5 bg-white/[0.08] text-white text-[1.0rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-white/[0.12] transition-colors"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </main>
  )
}
