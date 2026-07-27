import { useEffect, useState, useMemo, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { getAuthToken } from "@/lib/auth"
import { SEO } from "@/components/shared/SEO"
import { Inbox, RefreshCw, Filter, Search, ShieldX } from "lucide-react"

interface Submission {
  id: string
  Source?: string
  "Lead Name"?: string
  "Contact Email"?: string
  "Contact Phone"?: string
  Subject?: string
  Notes?: string
  "Submission Date"?: string
  "Site URL"?: string
  "Raw Payload"?: string
  Status?: string
  "Communication Status"?: string
}

const FORM_LABELS: Record<string, string> = {
  contact: "Contact",
  "interest-form": "Interest Form",
  newsletter: "Newsletter",
  "tryout-interest": "Tryout Interest",
  "btb-boys-tryout-registration": "Boys Tryout Reg",
  "btb-girls-tryout-registration": "Girls Tryout Reg",
  "btb-east-boys-tryout-registration": "East Boys Tryout Reg",
  "camp-registration": "Camp Reg",
  "positional-registration": "Positional Reg",
  "futures-registration": "Futures Reg",
  "futures-clinic-registration": "Futures Clinic Reg",
}

function formLabel(name?: string) {
  if (!name) return "Unknown"
  return FORM_LABELS[name] || name
}

function relativeTime(iso?: string) {
  if (!iso) return ""
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.round((now - then) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`
  return `${Math.round(diffSec / 86400)}d ago`
}

export function LeadsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const url = activeFilter === "all"
        ? "/.netlify/functions/leads-list?limit=100"
        : `/.netlify/functions/leads-list?limit=100&formName=${encodeURIComponent(activeFilter)}`
      const token = await getAuthToken()
      if (!token) throw new Error("Missing owner session")
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Failed (${res.status})`)
      setSubmissions(json.records || [])
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load")
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  useEffect(() => { void load() }, [load])

  const formCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((s) => {
      const name = s.Source || "unknown"
      counts[name] = (counts[name] || 0) + 1
    })
    return counts
  }, [submissions])

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions
    const q = search.toLowerCase()
    return submissions.filter((s) =>
      [s["Lead Name"], s["Contact Email"], s["Contact Phone"], s.Subject, s.Notes, s.Source]
        .some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [submissions, search])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/85 text-sm uppercase tracking-[2px]">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent("/leads")}`} replace />
  }

  if (user.role !== "owner") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-xl bg-[var(--btb-red)]/15 flex items-center justify-center mx-auto mb-6">
            <ShieldX size={26} className="text-[var(--btb-red)]" />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white mb-3">
            Owner <span className="text-[var(--btb-red)]">Only</span>
          </h1>
          <p className="text-white/55 leading-relaxed">
            The Leads dashboard is restricted to club ownership.
          </p>
        </div>
      </div>
    )
  }

  const filterPills = ["all", ...Object.keys(formCounts)]

  return (
    <>
      <SEO title="Leads | BTB" description="Website form submissions dashboard." path="/leads" />
      <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.95rem] tracking-[4px] mb-4">
              <Inbox size={14} />
              LEADS_INBOX
            </div>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.85] text-white">
                  Form <br /><span className="text-[var(--btb-red)]">Submissions.</span>
                </h1>
                <p className="text-white/55 text-[1.05rem] mt-3">
                  {submissions.length} record{submissions.length === 1 ? "" : "s"} · powered by Airtable + Brevo
                </p>
              </div>
              <button
                onClick={() => void load()}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white/85 text-[0.85rem] uppercase tracking-[2px] font-bold hover:bg-white/[0.08] disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search + filter pills */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, message, form..."
                className="w-full h-12 pl-12 pr-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.0rem] placeholder:text-white/35 focus:outline-none focus:border-[var(--btb-red)]/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-white/40 mr-1" />
              {filterPills.map((name) => {
                const count = name === "all" ? submissions.length : formCounts[name] || 0
                const active = activeFilter === name
                return (
                  <button
                    key={name}
                    onClick={() => setActiveFilter(name)}
                    className={`px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[1.5px] rounded-lg transition-all ${
                      active
                        ? "bg-[var(--btb-red)] text-white"
                        : "bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {name === "all" ? "All" : formLabel(name)} · {count}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-6 border border-[var(--btb-red)]/40 bg-[var(--btb-red)]/10 rounded-lg p-4 text-[0.95rem] text-white/85">
              <div className="font-bold uppercase tracking-[1.5px] text-[var(--btb-red)] mb-1 text-[0.75rem]">Couldn't load submissions</div>
              {err}
              <div className="mt-2 text-white/60 text-[0.85rem]">
                Confirm <code className="bg-white/10 px-1.5 py-0.5 rounded">AIRTABLE_FORMS_BASE_ID</code> and{" "}
                <code className="bg-white/10 px-1.5 py-0.5 rounded">AIRTABLE_FORMS_API_KEY</code> are set in Netlify env vars.
              </div>
            </div>
          )}

          {/* List */}
          {loading && submissions.length === 0 ? (
            <div className="text-white/40 text-[0.95rem]">Loading submissions...</div>
          ) : filtered.length === 0 && !err ? (
            <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-12 text-center">
              <Inbox size={32} className="text-white/30 mx-auto mb-4" />
              <p className="text-white/55">No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => {
                const isOpen = expanded === s.id
                let raw: Record<string, unknown> | null = null
                try { raw = s["Raw Payload"] ? JSON.parse(s["Raw Payload"]) : null } catch { /* Ignore malformed archived payloads. */ }
                return (
                  <div key={s.id} className="border border-white/8 bg-white/[0.02] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <span className="inline-block px-3 py-1 text-[0.7rem] font-black uppercase tracking-[1.5px] bg-[var(--btb-red)]/15 text-[var(--btb-red)] rounded">
                        {formLabel(s.Source)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{s["Lead Name"] || "—"}</div>
                        <div className="text-white/55 text-[0.85rem] truncate">{s["Contact Email"] || ""}{s["Contact Phone"] ? ` · ${s["Contact Phone"]}` : ""}</div>
                      </div>
                      {s.Status && (
                        <span className="text-[0.7rem] font-bold uppercase tracking-[1.5px] text-white/55 bg-white/[0.06] border border-white/10 rounded px-2 py-1 hidden md:inline-block">{s.Status}</span>
                      )}
                      <div className="text-white/40 text-[0.78rem] uppercase tracking-[1.5px] whitespace-nowrap">
                        {relativeTime(s["Submission Date"])}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 border-t border-white/5 text-[0.95rem] space-y-3">
                        {s.Subject && <div><span className="text-white/45 text-[0.75rem] uppercase tracking-[1.5px] block mb-1">Subject</span><div>{s.Subject}</div></div>}
                        {s.Notes && <div><span className="text-white/45 text-[0.75rem] uppercase tracking-[1.5px] block mb-1">Message</span><div className="whitespace-pre-wrap">{s.Notes}</div></div>}
                        {raw && (
                          <div>
                            <span className="text-white/45 text-[0.75rem] uppercase tracking-[1.5px] block mb-1">All fields</span>
                            <div className="font-mono text-[0.78rem] text-white/65 bg-black/40 rounded-lg p-3 overflow-auto">
                              {Object.entries(raw).map(([k, v]) => (
                                <div key={k}><span className="text-white/40">{k}:</span> {String(v)}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {s["Contact Email"] && (
                            <a
                              href={`mailto:${s["Contact Email"]}?subject=Re: ${encodeURIComponent(s.Subject || "Your inquiry to BTB Lacrosse")}`}
                              className="px-4 py-2 bg-[var(--btb-red)] text-white text-[0.78rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-[var(--btb-red-dark)]"
                            >
                              Reply
                            </a>
                          )}
                          {s["Contact Phone"] && (
                            <a
                              href={`tel:${s["Contact Phone"]}`}
                              className="px-4 py-2 bg-white/[0.06] border border-white/10 text-white text-[0.78rem] font-bold uppercase tracking-[1.5px] rounded hover:bg-white/[0.1]"
                            >
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
