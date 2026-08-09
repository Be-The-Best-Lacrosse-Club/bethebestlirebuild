import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowRight, CheckCircle2, ClipboardList, Flame, Mail, Send, Users } from "lucide-react"
import { toast } from "sonner"
import { SEO } from "@/components/shared/SEO"

const openings = [
  {
    demand: "High demand",
    accent: "red",
    teams: [
      { year: "2037", program: "Boys", coach: "Coach Taylor" },
      { year: "2037", program: "Girls", coach: "Coach Dan" },
    ],
  },
  {
    demand: "Medium demand",
    accent: "white",
    teams: [
      { year: "2034", program: "Girls", coach: "Coach Dan" },
      { year: "2032", program: "Boys", coach: "Coach Taylor" },
    ],
  },
]

type PlayersWantedTab = "openings" | "evaluation"

interface EvaluationFormData {
  playerName: string
  age: string
  email: string
  phone: string
  gradYear: string
  gender: string
  teamInterested: string
  currentClub: string
  level: string
  reason: string
}

const emptyEvaluationForm: EvaluationFormData = {
  playerName: "",
  age: "",
  email: "",
  phone: "",
  gradYear: "",
  gender: "",
  teamInterested: "",
  currentClub: "",
  level: "",
  reason: "",
}

function tabFromHash(): PlayersWantedTab {
  return window.location.hash === "#request-evaluation" ? "evaluation" : "openings"
}

function contactHref(program: string, year: string, coach: string) {
  const recipient = program === "Boys" ? "coachtbtb@gmail.com" : "info@bethebestli.com"
  const subject = `Players Wanted — ${year} ${program} — ${coach}`
  const body = `Hi ${coach},\n\nI'm interested in learning more about an opening for the BTB ${year} ${program} team.\n\nPlayer name:\nCurrent team/experience:\nPrimary position:\nParent/guardian phone:\n\nThank you.`
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function encode(data: Record<string, string>) {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function PlayersWantedPage() {
  const [activeTab, setActiveTab] = useState<PlayersWantedTab>(() => tabFromHash())
  const [formData, setFormData] = useState<EvaluationFormData>(emptyEvaluationForm)
  const [botField, setBotField] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const syncTabWithHash = () => setActiveTab(tabFromHash())
    window.addEventListener("hashchange", syncTabWithHash)

    if (tabFromHash() === "evaluation") {
      requestAnimationFrame(() => {
        document.getElementById("players-wanted-tabs")?.scrollIntoView({ block: "start" })
      })
    } else {
      window.scrollTo(0, 0)
    }

    return () => window.removeEventListener("hashchange", syncTabWithHash)
  }, [])

  useEffect(() => {
    if (submitted) successRef.current?.focus()
  }, [submitted])

  function selectTab(tab: PlayersWantedTab, scrollToTabs = false) {
    setActiveTab(tab)
    const hash = tab === "evaluation" ? "#request-evaluation" : "#openings"
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`)

    if (scrollToTabs) {
      requestAnimationFrame(() => {
        document.getElementById("players-wanted-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }

  function updateField(field: keyof EvaluationFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTab: PlayersWantedTab) {
    let nextTab: PlayersWantedTab | null = null
    if (event.key === "Home") nextTab = "openings"
    if (event.key === "End") nextTab = "evaluation"
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextTab = currentTab === "openings" ? "evaluation" : "openings"
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextTab = currentTab === "openings" ? "evaluation" : "openings"
    }

    if (!nextTab) return
    event.preventDefault()
    selectTab(nextTab)
    requestAnimationFrame(() => document.getElementById(`${nextTab}-tab`)?.focus())
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (botField) return

    if (Object.values(formData).some((value) => !value.trim())) {
      toast.error("Please complete every question before submitting.")
      return
    }
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.")
      return
    }

    const age = Number(formData.age)
    if (!Number.isInteger(age) || age < 5 || age > 19) {
      toast.error("Please enter a player age between 5 and 19.")
      return
    }

    const gradYear = Number(formData.gradYear)
    if (!Number.isInteger(gradYear) || gradYear < 2027 || gradYear > 2042) {
      toast.error("Please enter a valid four-digit graduation year.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "players-wanted-evaluation",
          ...formData,
          source: "players-wanted-page",
        }),
      })

      if (!response.ok) throw new Error(`Submission failed with status ${response.status}`)

      setSubmitted(true)
      toast.success("Evaluation request received.")
    } catch {
      toast.error("Something went wrong. Please try again or email info@bethebestli.com.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "mt-2 h-14 w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 text-base font-semibold text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--btb-red)]"
  const selectClass = `${inputClass} appearance-none bg-black`
  const labelClass = "block text-sm font-black uppercase tracking-[2px] text-white/75"

  return (
    <>
      <SEO
        title="Players Wanted | BTB Lacrosse"
        description="View current BTB roster opportunities or request a player evaluation for a boys or girls lacrosse team on Long Island."
        path="/players-wanted"
      />

      <main className="min-h-screen overflow-hidden bg-black pt-16 text-white">
        <section className="relative border-b border-white/10 px-5 py-20 md:px-8 md:py-28">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(210,38,48,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(210,38,48,.08)_1px,transparent_1px)] [background-size:90px_90px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--btb-red)]/20 blur-[120px]" />

          <div className="relative mx-auto max-w-[1120px]">
            <h1 className="max-w-[900px] font-display text-[clamp(4rem,11vw,9rem)] uppercase leading-[0.78] tracking-tight">
              Players<br /><span className="text-[var(--btb-red)]">Wanted.</span>
            </h1>
            <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-[650px] text-lg font-semibold leading-relaxed text-white/70 md:text-xl">
                A small number of roster opportunities are open for committed players ready to develop, compete, and meet the BTB standard.
              </p>
              <button
                type="button"
                onClick={() => selectTab("openings", true)}
                className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-[2.5px] text-white transition-colors hover:text-[var(--btb-red)]"
              >
                View openings <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section id="players-wanted-tabs" className="scroll-mt-16 border-b border-white/10 px-5 md:px-8">
          <div className="mx-auto grid max-w-[1120px] sm:grid-cols-2" role="tablist" aria-label="Players Wanted options">
            <button
              id="openings-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "openings"}
              aria-controls="openings-panel"
              tabIndex={activeTab === "openings" ? 0 : -1}
              onClick={() => selectTab("openings")}
              onKeyDown={(event) => handleTabKeyDown(event, "openings")}
              className={`flex min-h-20 items-center justify-between border-x border-white/10 px-5 text-left text-sm font-black uppercase tracking-[2.5px] transition-colors sm:px-8 ${
                activeTab === "openings"
                  ? "bg-[var(--btb-red)] text-white"
                  : "bg-black text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Current Openings <Users size={18} />
            </button>
            <button
              id="evaluation-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === "evaluation"}
              aria-controls="evaluation-panel"
              tabIndex={activeTab === "evaluation" ? 0 : -1}
              onClick={() => selectTab("evaluation")}
              onKeyDown={(event) => handleTabKeyDown(event, "evaluation")}
              className={`flex min-h-20 items-center justify-between border-x border-white/10 px-5 text-left text-sm font-black uppercase tracking-[2.5px] transition-colors sm:border-l-0 sm:px-8 ${
                activeTab === "evaluation"
                  ? "bg-[var(--btb-red)] text-white"
                  : "bg-black text-white/55 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Request an Evaluation <ClipboardList size={18} />
            </button>
          </div>
        </section>

        <section
          id="openings-panel"
          role="tabpanel"
          aria-labelledby="openings-tab"
          hidden={activeTab !== "openings"}
          className="px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-[1120px]">
            {openings.map((group, groupIndex) => (
              <div key={group.demand} className={groupIndex ? "mt-16 md:mt-20" : ""}>
                <div className="mb-5 flex items-center gap-3">
                  {groupIndex === 0 ? <Flame size={20} className="text-[var(--btb-red)]" /> : <Users size={20} className="text-white/55" />}
                  <h2 className={`font-display text-2xl uppercase tracking-wider ${group.accent === "red" ? "text-[var(--btb-red)]" : "text-white"}`}>
                    {group.demand}
                  </h2>
                </div>

                <div className="divide-y divide-white/10 border-y border-white/10">
                  {group.teams.map((team) => (
                    <article key={`${team.year}-${team.program}`} className="group grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center md:py-10">
                      <div className="flex items-center gap-6 md:gap-10">
                        <span className="font-display text-[clamp(3.4rem,8vw,6rem)] leading-none text-white transition-colors group-hover:text-[var(--btb-red)]">
                          {team.year}
                        </span>
                        <div>
                          <h3 className="font-display text-2xl uppercase tracking-wider md:text-3xl">{team.program} Lacrosse</h3>
                          <p className="mt-2 text-sm font-bold uppercase tracking-[2px] text-white/50">Contact {team.coach}</p>
                        </div>
                      </div>
                      <a
                        href={contactHref(team.program, team.year, team.coach)}
                        className="inline-flex min-h-12 items-center justify-center gap-3 bg-[var(--btb-red)] px-6 text-sm font-black uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black"
                      >
                        <Mail size={16} /> Reach out <ArrowRight size={15} />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-16 border-l-2 border-[var(--btb-red)] bg-white/[0.035] p-6 md:mt-20 md:p-8">
              <p className="max-w-[760px] text-base font-semibold leading-relaxed text-white/65">
                Don&apos;t see the right team listed? Request an evaluation and our staff will review the player&apos;s fit and follow up with next steps.
              </p>
              <button
                type="button"
                onClick={() => selectTab("evaluation", true)}
                className="mt-6 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[2px] text-[var(--btb-red)] transition-colors hover:text-white"
              >
                Request an evaluation <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="evaluation-panel"
          role="tabpanel"
          aria-labelledby="evaluation-tab"
          hidden={activeTab !== "evaluation"}
          className="px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-[900px]">
            {submitted ? (
              <div
                ref={successRef}
                role="status"
                aria-live="polite"
                tabIndex={-1}
                className="border-y border-white/10 py-16 text-center outline-none md:py-24"
              >
                <CheckCircle2 size={48} className="mx-auto text-[var(--btb-red)]" />
                <h2 className="mt-7 font-display text-[clamp(2.8rem,8vw,5rem)] uppercase leading-none">Request Received.</h2>
                <p className="mx-auto mt-6 max-w-[600px] text-lg font-semibold leading-relaxed text-white/65">
                  Thank you. BTB&apos;s coaching staff will review the player&apos;s information and follow up about evaluation timing and next steps.
                </p>
                <button
                  type="button"
                  onClick={() => selectTab("openings", true)}
                  className="mt-10 inline-flex min-h-14 items-center justify-center gap-3 bg-[var(--btb-red)] px-8 text-sm font-black uppercase tracking-[2px] text-white transition-colors hover:bg-white hover:text-black"
                >
                  View current openings <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1fr_0.8fr] md:items-end">
                  <h2 className="font-display text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.85]">
                    Tell Us About<br /><span className="text-[var(--btb-red)]">The Player.</span>
                  </h2>
                  <p className="text-base font-semibold leading-relaxed text-white/60 md:text-lg">
                    Complete the questionnaire below. A BTB coach will review the information and contact you about fit, availability, and evaluation options.
                  </p>
                </div>

                <form
                  name="players-wanted-evaluation"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="mt-10 space-y-10"
                >
                  <input type="hidden" name="form-name" value="players-wanted-evaluation" />
                  <input type="hidden" name="source" value="players-wanted-page" />
                  <p className="hidden">
                    <label>
                      Don&apos;t fill this out if you&apos;re human:
                      <input name="bot-field" value={botField} onChange={(event) => setBotField(event.target.value)} />
                    </label>
                  </p>

                  <fieldset className="space-y-6">
                    <legend className="mb-6 flex w-full items-center gap-3 border-b border-white/10 pb-4 font-display text-xl uppercase tracking-widest">
                      <span className="h-2 w-2 bg-[var(--btb-red)]" /> Player Information
                    </legend>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className={labelClass}>
                        Player Name *
                        <input
                          type="text"
                          name="playerName"
                          autoComplete="name"
                          required
                          className={inputClass}
                          value={formData.playerName}
                          onChange={(event) => updateField("playerName", event.target.value)}
                        />
                      </label>
                      <label className={labelClass}>
                        Player Age *
                        <input
                          type="number"
                          name="age"
                          min="5"
                          max="19"
                          inputMode="numeric"
                          required
                          className={inputClass}
                          value={formData.age}
                          onChange={(event) => updateField("age", event.target.value)}
                        />
                      </label>
                      <label className={labelClass}>
                        Graduation Year *
                        <input
                          type="number"
                          name="gradYear"
                          min="2027"
                          max="2042"
                          inputMode="numeric"
                          placeholder="Example: 2033"
                          required
                          className={inputClass}
                          value={formData.gradYear}
                          onChange={(event) => updateField("gradYear", event.target.value)}
                        />
                      </label>
                      <label className={labelClass}>
                        Gender / Program *
                        <select
                          name="gender"
                          required
                          className={selectClass}
                          value={formData.gender}
                          onChange={(event) => updateField("gender", event.target.value)}
                        >
                          <option value="">Select boys or girls</option>
                          <option value="Boys">Boys</option>
                          <option value="Girls">Girls</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-6">
                    <legend className="mb-6 flex w-full items-center gap-3 border-b border-white/10 pb-4 font-display text-xl uppercase tracking-widest">
                      <span className="h-2 w-2 bg-[var(--btb-red)]" /> Contact Information
                    </legend>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className={labelClass}>
                        Email *
                        <input
                          type="email"
                          name="email"
                          autoComplete="email"
                          required
                          className={inputClass}
                          value={formData.email}
                          onChange={(event) => updateField("email", event.target.value)}
                        />
                      </label>
                      <label className={labelClass}>
                        Phone Number *
                        <input
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          required
                          className={inputClass}
                          value={formData.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-6">
                    <legend className="mb-6 flex w-full items-center gap-3 border-b border-white/10 pb-4 font-display text-xl uppercase tracking-widest">
                      <span className="h-2 w-2 bg-[var(--btb-red)]" /> Lacrosse Background
                    </legend>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <label className={labelClass}>
                        Team Interested In *
                        <input
                          type="text"
                          name="teamInterested"
                          placeholder="Example: 2034 Girls"
                          required
                          className={inputClass}
                          value={formData.teamInterested}
                          onChange={(event) => updateField("teamInterested", event.target.value)}
                        />
                      </label>
                      <label className={labelClass}>
                        Current Level *
                        <select
                          name="level"
                          required
                          className={selectClass}
                          value={formData.level}
                          onChange={(event) => updateField("level", event.target.value)}
                        >
                          <option value="">Select AA, A, or B</option>
                          <option value="AA">AA</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </select>
                      </label>
                    </div>
                    <label className={labelClass}>
                      Current or Previous Club *
                      <input
                        type="text"
                        name="currentClub"
                        required
                        className={inputClass}
                        value={formData.currentClub}
                        onChange={(event) => updateField("currentClub", event.target.value)}
                      />
                    </label>
                    <label className={labelClass}>
                      Why Are You Looking to Join BTB? *
                      <textarea
                        name="reason"
                        rows={5}
                        required
                        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-base font-semibold leading-relaxed text-white outline-none transition-colors placeholder:text-white/30 focus:border-[var(--btb-red)]"
                        placeholder="Tell us what the player and family are looking for in a club program."
                        value={formData.reason}
                        onChange={(event) => updateField("reason", event.target.value)}
                      />
                    </label>
                  </fieldset>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[var(--btb-red)] px-8 text-sm font-black uppercase tracking-[2.5px] text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={16} /> {submitting ? "Submitting..." : "Submit Evaluation Request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
