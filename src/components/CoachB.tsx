import { useEffect, useRef, useState } from "react"
import { Send, X } from "lucide-react"

type Surface = "player_parent" | "coach"
type Message = { role: "user" | "assistant"; content: string }

interface CoachBProps {
  surface?: Surface
  endpoint?: string
}

const GREETING: Record<Surface, string> = {
  player_parent:
    "Hey, I'm Coach B! Ask me anything about BTB Lacrosse — programs, tryouts, what to expect at practice, all of it.",
  coach:
    "Coach B here. Need a drill, a practice block, or a quick X&O check? Ask away.",
}

function BearAvatar({ size = 44 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className="block"
    >
      <circle cx="18" cy="18" r="9" fill="#7a4a2b" />
      <circle cx="18" cy="18" r="4.5" fill="#1a1a1a" />
      <circle cx="46" cy="18" r="9" fill="#7a4a2b" />
      <circle cx="46" cy="18" r="4.5" fill="#1a1a1a" />
      <circle cx="32" cy="34" r="22" fill="#7a4a2b" />
      <ellipse cx="32" cy="42" rx="13" ry="11" fill="#e8c89a" />
      <ellipse cx="32" cy="40" rx="3" ry="2.2" fill="#1a1a1a" />
      <circle cx="24" cy="32" r="2.2" fill="#1a1a1a" />
      <circle cx="40" cy="32" r="2.2" fill="#1a1a1a" />
      <circle cx="23.3" cy="31.3" r="0.7" fill="#fff" />
      <circle cx="39.3" cy="31.3" r="0.7" fill="#fff" />
      <path
        d="M28 44 Q32 47 36 44"
        stroke="#1a1a1a"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="18" y="52" width="28" height="6" rx="1" fill="#D22630" />
      <text
        x="32"
        y="57"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="700"
        fill="#fff"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        BTB
      </text>
    </svg>
  )
}

export function CoachB({ surface = "player_parent", endpoint = "/.netlify/functions/coach-b" }: CoachBProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setError(null)
    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surface, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Coach B is taking a water break. Try again in a sec.")
        setMessages(next)
      } else {
        setMessages([...next, { role: "assistant", content: data.reply || "..." }])
      }
    } catch {
      setError("Couldn't reach Coach B. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Coach B chat"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[#D22630] px-4 py-2 pl-2 text-white shadow-lg shadow-black/30 transition hover:bg-[#a01e26] focus:outline-none focus:ring-2 focus:ring-[#D22630] focus:ring-offset-2"
        >
          <span className="rounded-full bg-white p-1">
            <BearAvatar size={36} />
          </span>
          <span className="pr-1 text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Bebas Neue, system-ui, sans-serif", letterSpacing: "0.08em" }}>
            Ask Coach B
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Coach B chat"
          className="fixed bottom-5 right-5 z-[60] flex h-[min(600px,calc(100vh-2.5rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between bg-[#D22630] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-1">
                <BearAvatar size={36} />
              </div>
              <div>
                <div className="text-base font-bold leading-tight" style={{ fontFamily: "Bebas Neue, system-ui, sans-serif", letterSpacing: "0.06em" }}>
                  COACH B
                </div>
                <div className="text-[11px] opacity-80">BTB Lacrosse · Always on</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-4">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm ring-1 ring-black/5">
                {GREETING[surface]}
              </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#D22630] px-3 py-2 text-sm text-white shadow-sm"
                      : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm ring-1 ring-black/5"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400" />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-black/10 bg-white p-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={surface === "coach" ? "Ask for a drill, plan, or X&O..." : "Ask Coach B anything..."}
                rows={1}
                className="max-h-32 flex-1 resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#D22630] focus:outline-none focus:ring-1 focus:ring-[#D22630]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D22630] text-white transition hover:bg-[#a01e26] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 px-1 text-[10px] text-neutral-400">
              Coach B can make mistakes. For exact dates and pricing, email info@bethebestli.com.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
