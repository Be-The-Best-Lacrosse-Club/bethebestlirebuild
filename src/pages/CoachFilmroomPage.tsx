import { useEffect, useState } from "react"
import { getAuthToken } from "@/lib/auth"

const filmroomLogin = "https://filmroom-lacrosse-intel.bethebestli.chatgpt.site/btb/login"

/** Transfer the existing BTB session by HTTPS POST, never in a URL. */
export function CoachFilmroomPage() {
  const [error, setError] = useState("")
  useEffect(() => {
    let cancelled = false
    async function openFilmroom() {
      try {
        const token = await getAuthToken()
        if (cancelled) return
        if (!token) {
          window.location.replace("/coach-login?redirect=%2Fcoach-filmroom")
          return
        }
        const form = document.createElement("form")
        form.method = "POST"
        form.action = filmroomLogin
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = "token"
        input.value = token
        form.appendChild(input)
        document.body.appendChild(form)
        form.submit()
        form.remove()
      } catch {
        if (!cancelled) setError("We couldn’t open Filmroom. Please sign in again and retry.")
      }
    }
    void openFilmroom()
    return () => { cancelled = true }
  }, [])

  return (
    <main className="min-h-screen bg-black text-white border-t-4 border-[#D22630] flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-[#D22630] font-bold uppercase tracking-widest">Be The Best Lacrosse</p>
        <h1 className="font-display text-5xl mt-4 mb-5">Filmroom with Coach Dan</h1>
        <p role="status" className="text-white/80">{error || "Opening Filmroom with your BTB coach/admin account…"}</p>
        {error && <a className="inline-block mt-6 underline" href="/coach-login?redirect=%2Fcoach-filmroom">Return to BTB sign-in</a>}
      </div>
    </main>
  )
}
