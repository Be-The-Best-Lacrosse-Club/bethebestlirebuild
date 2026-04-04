import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { SEO } from "@/components/shared/SEO"
import { ArrowLeft, Lock } from "lucide-react"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get("redirect") || "/"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const user = login(email, password)
    if (user) {
      navigate(redirect, { replace: true })
    } else {
      setError("Invalid email or password. Try: player@btb.com or coach@btb.com")
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Login | BTB Lacrosse Club"
        description="Sign in to your BTB Lacrosse Club account to access the Players Hub, Coaches Hub, and Academy resources."
        path="/login"
      />
      <div className="w-full max-w-[400px]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.78rem] font-semibold uppercase tracking-[1.5px] mb-12">
          <ArrowLeft size={15} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[var(--btb-red)]/20 flex items-center justify-center">
            <Lock size={18} className="text-[var(--btb-red)]" />
          </div>
          <div>
            <div className="font-display text-2xl uppercase tracking-wide text-white">BTB <span className="text-[var(--btb-red)]">Login</span></div>
          </div>
        </div>

        <p className="text-[0.84rem] text-white/35 leading-relaxed mb-8">
          Sign in to access your Players Hub or Coaches Hub. Course progress, film study, and resources are all inside.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.65rem] font-bold uppercase tracking-[2px] text-white/30 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[0.88rem] placeholder:text-white/20 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-[0.65rem] font-bold uppercase tracking-[2px] text-white/30 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white text-[0.88rem] placeholder:text-white/20 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-[0.78rem] text-[var(--btb-red)] bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.07]">
          <p className="text-[0.72rem] text-white/20 mb-3 uppercase tracking-[1px] font-semibold">Demo Accounts</p>
          <div className="space-y-2 text-[0.75rem] text-white/30">
            <div><span className="text-white/50">Boys Player:</span> player@btb.com</div>
            <div><span className="text-white/50">Boys Coach:</span> coach@btb.com</div>
            <div><span className="text-white/50">Girls Player:</span> player-girls@btb.com</div>
            <div><span className="text-white/50">Girls Coach:</span> coach-girls@btb.com</div>
            <div className="text-white/15 italic">Any password works for demo</div>
          </div>
        </div>
      </div>
    </div>
  )
}
