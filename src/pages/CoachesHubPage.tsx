import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { getAuthToken } from "@/lib/auth"
import { drills, drillCategories, practicePlans } from "@/lib/coachData"
import { fetchCoachPayment, type CoachPaymentResponse } from "@/lib/paymentData"
import { coachCertificationLevels } from "@/lib/academySystem"
import {
  COACH_MODULES,
  getCoachProgress,
  markCoachLessonComplete,
} from "@/lib/coachLearningData"
import { SEO } from "@/components/shared/SEO"
import type { Drill, Gender } from "@/types"
import {
  ArrowLeft,
  LogOut,
  BookOpen,
  Video,
  ClipboardList,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  ArrowRight,
  DollarSign,
  Users,
  GraduationCap,
  TrendingUp,
  Brain,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CoachesHubPageProps {
  gender: Gender
}

interface CertItem {
  id: string
  title: string
  description: string
  externalUrl?: string
}

/* ------------------------------------------------------------------ */
/*  Certification data                                                 */
/* ------------------------------------------------------------------ */

const btbCertificationItems: CertItem[] = coachCertificationLevels.map((level) => ({
  id: `cert-btb-${level.level.toLowerCase().replace(/\s+/g, "-")}`,
  title: `BTB ${level.level}: ${level.title}`,
  description: `${level.requirement} Required modules: ${level.modules.join(", ")}. Deliverable: ${level.deliverable}`,
}))

const certificationItems: CertItem[] = [
  {
    id: "cert-uslax",
    title: "US Lacrosse Coaching Certification",
    description: "Complete Level 1 (or higher) coaching certification through US Lacrosse.",
    externalUrl: "https://www.uslacrosse.org/coaches/coaching-education",
  },
  {
    id: "cert-safesport",
    title: "SafeSport Training",
    description: "Complete the U.S. Center for SafeSport core training course. Must be renewed annually.",
    externalUrl: "https://safesport.org/training",
  },
  {
    id: "cert-background",
    title: "Background Check",
    description: "Submit and clear the required background check through BTB's approved provider.",
  },
  ...btbCertificationItems,
  {
    id: "cert-practice",
    title: "Phase 1 Practice Plan Submission",
    description: "Submit a written Week 1 practice plan using only Foundation phase drills before your first session.",
  },
]

/* ------------------------------------------------------------------ */
/*  Dashboard card data                                                */
/* ------------------------------------------------------------------ */

const dashboardCards = [
  { id: "drills", icon: BookOpen, title: "Drill Library", description: "50+ drills across 8 categories with full coaching breakdowns." },
  { id: "film", icon: Video, title: "Film Resources", description: "Game film, scouting reports, and teaching clips." },
  { id: "plans", icon: ClipboardList, title: "Practice Plans", description: "Seasonal phase templates with timed segment breakdowns." },
  { id: "learning", icon: Brain, title: "Coach Learning", description: "4 modules covering BTB philosophy, practice design, film study, and player development." },
  { id: "certification", icon: Award, title: "Certification", description: "Track your coaching certification requirements and progress." },
  { id: "mypay", icon: DollarSign, title: "My Pay", description: "View your season contract, payment schedule, and payment status." },
  { id: "playerprogress", icon: GraduationCap, title: "Player Progress", description: "See which players completed academy modules across every age tier." },
]

/* ------------------------------------------------------------------ */
/*  Difficulty badge helper                                            */
/* ------------------------------------------------------------------ */

function difficultyColor(d: Drill["difficulty"]) {
  switch (d) {
    case "beginner":
      return "text-emerald-400/60 border-emerald-400/20 bg-emerald-400/5"
    case "intermediate":
      return "text-amber-400/60 border-amber-400/20 bg-amber-400/5"
    case "advanced":
      return "text-[var(--btb-red)] border-[var(--btb-red)]/20 bg-[var(--btb-red)]/5"
  }
}

/* ------------------------------------------------------------------ */
/*  Phase metadata                                                     */
/* ------------------------------------------------------------------ */

const phaseWeeks: Record<string, string> = {
  Foundation: "Months 1-2",
  Connection: "Months 3-5",
  Expansion: "Months 6-8",
  Execution: "Months 9-10",
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function CoachesHubPage({ gender }: CoachesHubPageProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Drill filter
  const [activeCategory, setActiveCategory] = useState("All")
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null)

  // Practice plan expand
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  // Film library state (replaced by iframe)


  // Certification state (persisted in localStorage)
  const [certCompleted, setCertCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`btb-cert-${user?.id || "anon"}`)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  // Persist cert state
  useEffect(() => {
    localStorage.setItem(`btb-cert-${user?.id || "anon"}`, JSON.stringify(certCompleted))
  }, [certCompleted, user?.id])

  // Learning module state
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [lessonView, setLessonView] = useState<"reading" | "quiz">("reading")
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [, setCoachProgressTick] = useState(0)

  const refreshCoachProgress = () => setCoachProgressTick((t) => t + 1)
  const coachProgress = getCoachProgress()

  // Section refs for smooth scroll
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const navHeight = 64
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 24
      window.scrollTo({ top, behavior: "smooth" })
    }
    if (id === "playerprogress") loadPlayerProgress()
    if (id === "learning") { setActiveModuleId(null); setActiveLessonId(null) }
  }

  // Filtered drills
  const filteredDrills =
    activeCategory === "All" ? drills : drills.filter((d) => d.category === activeCategory)



  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const genderLabel = gender === "boys" ? "Boys" : "Girls"

  const toggleCert = (id: string) => {
    setCertCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = certificationItems.filter((c) => certCompleted[c.id]).length

  // Payment data — fetched live from BTB-OS API
  const [paymentData, setPaymentData] = useState<CoachPaymentResponse | null>(null)

  useEffect(() => {
    if (!user?.email) return
    async function loadPaymentData() {
      const token = await getAuthToken()
      if (!token || !user?.email) return
      const data = await fetchCoachPayment(user.email, token)
      if (data) setPaymentData(data)
    }
    void loadPaymentData()
  }, [user?.email])

  // Player Progress state — names come from Airtable directly (stored on first lesson complete)
  interface PlayerCourse { courseId: string; lessonsCompleted: number; totalLessons: number; pct: number; completedAt: string | null }
  interface PlayerRow { userId: string; playerName: string | null; playerEmail: string | null; courses: PlayerCourse[]; totalPct: number; lastActive: string | null }
  const [playerProgress, setPlayerProgress] = useState<PlayerRow[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressLoaded, setProgressLoaded] = useState(false)

  const loadPlayerProgress = async () => {
    if (progressLoaded) return
    setProgressLoading(true)
    try {
      const token = await getAuthToken()
      if (!token) {
        setProgressLoading(false)
        return
      }
      const r = await fetch(`/.netlify/functions/academy-coach-dashboard?gender=${gender}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await r.json()
      setPlayerProgress(data.players || [])
      setProgressLoaded(true)
    } catch {
      // swallow
    } finally {
      setProgressLoading(false)
    }
  }

  const label = gender === "boys" ? "Boys" : "Girls"

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Coaches Hub | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label.toLowerCase()} coaches hub — drills, practice plans, film library, and certification tracking.`}
        path={`/${gender}/coaches-hub`}
      />
      {/* ── Fixed Nav ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px]"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="font-display text-lg uppercase tracking-wide">
            BTB {genderLabel} <span className="text-[var(--btb-red)]">Coaches Hub</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-white/[0.1] text-white/70 hover:text-white hover:border-white/30 transition-colors text-[1.0rem] font-bold uppercase tracking-[1.5px] rounded"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* ── Welcome Section ── */}
      <section className="pt-28 pb-16 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            Coaches Hub
          </div>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase tracking-wide leading-[0.88] mb-4">
            Welcome Back,
            <br />
            <span className="text-[var(--btb-red)]">{user?.name || "Coach"}</span>
          </h1>
          <p className="text-[1.15rem] text-white/35 max-w-[480px] leading-[1.8]">
            Your drills, film, practice plans, and certification progress — all in one place. Everything you
            need to prepare, coach, and develop.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-white underline">
            <a href="/coach-tools.html">Coaching Library & Downloads</a>
            <a href="/forgot-password">Reset Password</a>
            {user?.role === "owner" && <a href="/admin">Admin Hub</a>}
            {(user?.role === "owner" || (user?.programs?.length ?? 0) > 1) && (
              <a href={`/${gender === "boys" ? "girls" : "boys"}/coaches-hub`}>Switch to {gender === "boys" ? "Girls" : "Boys"}</a>
            )}
          </div>
        </div>
      </section>

      {/* ── Dashboard Cards ── */}
      <section className="py-12 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {dashboardCards.map((card) => (
              <button
                key={card.id}
                onClick={() => scrollTo(card.id)}
                className="group text-left p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.05] group-hover:bg-[var(--btb-red)]/15 flex items-center justify-center mb-4 transition-colors">
                  <card.icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-white/35 group-hover:text-[var(--btb-red)] transition-colors"
                  />
                </div>
                <h3 className="font-display text-[1rem] uppercase tracking-wide text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-[1.0rem] text-white/85 leading-relaxed group-hover:text-white/45 transition-colors">
                  {card.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  DRILL LIBRARY                                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="drills"
        ref={(el) => { sectionRefs.current["drills"] = el }}
        className="py-20 px-6 border-b border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
              Drill Library
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
              Eight Categories.
              <br />
              One Shared Playbook.
            </h2>
            <p className="text-[1.1rem] text-white/35 max-w-[420px] leading-relaxed">
              Every drill has a purpose, setup, execution steps, and coaching points. Consistent across all
              sessions and all coaches.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {["All", ...drillCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setExpandedDrill(null)
                }}
                className={`px-4 py-2 rounded-full text-[1.0rem] font-semibold uppercase tracking-[1px] transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[var(--btb-red)] text-white"
                    : "border border-white/[0.1] text-white/70 hover:text-white/85 hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Drill cards */}
          <div className="space-y-3">
            {filteredDrills.map((drill) => {
              const isExpanded = expandedDrill === drill.id
              return (
                <div
                  key={drill.id}
                  className={`rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? "border-[var(--btb-red)]/30 bg-[var(--btb-red)]/[0.03]"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Drill header (always visible) */}
                  <button
                    onClick={() => setExpandedDrill(isExpanded ? null : drill.id)}
                    className="w-full text-left p-6 flex items-start gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-display text-[1rem] uppercase tracking-wide text-white">
                          {drill.title}
                        </h4>
                        <span className="text-[1.08rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border bg-white/[0.02]  text-[var(--btb-red)] border-[var(--btb-red)]/20">
                          {drill.category}
                        </span>
                        <span
                          className={`text-[1.08rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border ${difficultyColor(
                            drill.difficulty
                          )}`}
                        >
                          {drill.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1 text-[1.0rem] text-white/85">
                          <Clock size={12} /> {drill.duration} min
                        </span>
                      </div>
                      <p className="text-[1.05rem] text-white/35 leading-relaxed">{drill.description}</p>
                    </div>
                    <div className="shrink-0 text-white/45 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-0 border-t border-white/[0.06] mt-0">
                      <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Setup */}
                        <div>
                          <div className="text-[1.08rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Setup
                          </div>
                          <p className="text-[1.05rem] text-white/70 leading-relaxed">{drill.setup}</p>
                        </div>

                        {/* Execution */}
                        <div>
                          <div className="text-[1.08rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Execution
                          </div>
                          <ol className="space-y-1.5">
                            {drill.execution.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-[1.05rem] text-white/70 leading-relaxed">
                                <span className="text-white/15 font-display text-[1.25rem] shrink-0 w-5">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Coaching Points */}
                        <div>
                          <div className="text-[1.08rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Coaching Points
                          </div>
                          <ul className="space-y-1.5">
                            {drill.coachingPoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-2 text-[1.05rem] text-white/70 leading-relaxed">
                                <span className="text-[var(--btb-red)] mt-1.5 shrink-0">
                                  <Circle size={5} fill="currentColor" />
                                </span>
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredDrills.length === 0 && (
              <div className="text-center py-16 text-white/45 text-[1.1rem]">
                No drills found in this category.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  FILM RESOURCES                                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="film"
        ref={(el) => { sectionRefs.current["film"] = el }}
        className="bg-neutral-950 border-b border-white/[0.07]"
      >
        <div className="w-full h-[800px]">
          <iframe
            src="https://btb-film-lab.netlify.app/iq/"
            className="w-full h-full border-none"
            title="BTB Lacrosse IQ Library"
            allowFullScreen
          />
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  PRACTICE PLAN TEMPLATES                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="plans"
        ref={(el) => { sectionRefs.current["plans"] = el }}
        className="py-20 px-6 border-b border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-10">
            <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
              Practice Plans
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
              Four Phases.
              <br />
              One System.
            </h2>
            <p className="text-[1.1rem] text-white/35 max-w-[440px] leading-relaxed">
              Every practice follows a submitted written plan. Each phase builds on the last across the
              10-month development program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practicePlans.map((plan) => {
              const isExpanded = expandedPlan === plan.id
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border transition-all duration-200 ${
                    isExpanded
                      ? "border-[var(--btb-red)]/30 bg-[var(--btb-red)]/[0.03] md:col-span-2"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                >
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="w-full text-left p-7 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="text-[1.08rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">
                        {phaseWeeks[plan.phase] || ""} {plan.ageGroup !== "All" ? `// ${plan.ageGroup}` : ""}
                      </div>
                      <h4 className="font-display text-[1.1rem] uppercase tracking-wide text-white mb-2">
                        {plan.title}
                      </h4>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-[1.0rem] text-white/85">
                          <Clock size={12} /> {plan.duration} min
                        </span>
                      </div>
                      <p className="text-[1.05rem] text-white/35 leading-relaxed">{plan.description}</p>
                    </div>
                    <div className="shrink-0 text-white/45 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-7 pb-7 pt-0 border-t border-white/[0.06]">
                      <div className="pt-5 space-y-2">
                        {plan.segments.map((seg, i) => (
                          <div
                            key={i}
                            className="flex gap-5 items-start p-4 rounded-lg border border-white/[0.05] bg-white/[0.02]"
                          >
                            <div className="shrink-0 text-[1.2rem] font-bold text-[var(--btb-red)] uppercase tracking-[1px] w-24 pt-0.5">
                              {seg.time}
                            </div>
                            <div className="w-px self-stretch bg-white/[0.08]" />
                            <div>
                              <div className="font-display text-[1.15rem] uppercase tracking-wide text-white mb-1">
                                {seg.activity}
                              </div>
                              <p className="text-[1.05rem] text-white/35 leading-relaxed">{seg.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  COACH LEARNING MODULES                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="learning"
        ref={(el) => { sectionRefs.current["learning"] = el }}
        className="py-20 px-6 bg-neutral-950 border-b border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">

          {/* ── Lesson Detail View ── */}
          {activeModuleId && activeLessonId ? (() => {
            const mod = COACH_MODULES.find(m => m.id === activeModuleId)
            const lesson = mod?.lessons.find(l => l.id === activeLessonId)
            if (!mod || !lesson) return null
            const lessonIdx = mod.lessons.findIndex(l => l.id === activeLessonId)
            const nextLesson = mod.lessons[lessonIdx + 1] ?? null
            const isComplete = (coachProgress.completedLessons[mod.id] ?? []).includes(lesson.id)
            const allCorrect = lesson.questions.every((q, i) => quizAnswers[i] === q.correctAnswer)

            return (
              <div>
                {/* Back nav */}
                <button
                  onClick={() => { setActiveLessonId(null); setLessonView("reading"); setQuizAnswers({}); setQuizSubmitted(false) }}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px] mb-8"
                >
                  <ArrowLeft size={15} /> Back to {mod.title}
                </button>

                {/* Lesson header */}
                <div className="mb-8">
                  <div className="text-[1.08rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-3">
                    {mod.title} · Lesson {lessonIdx + 1} of {mod.lessons.length}
                  </div>
                  <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] uppercase tracking-wide leading-[0.92] mb-4">
                    {lesson.title}
                  </h2>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1.5 text-[1.15rem] font-bold uppercase tracking-[2px] text-emerald-400/70 border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Complete
                    </span>
                  )}
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 mb-8 bg-white/[0.03] p-1 rounded-xl border border-white/[0.07] w-fit">
                  <button
                    onClick={() => setLessonView("reading")}
                    className={`px-5 py-2 rounded-lg text-[1.0rem] font-bold uppercase tracking-[1.5px] transition-all ${
                      lessonView === "reading" ? "bg-white text-black" : "text-white/70 hover:text-white/70"
                    }`}
                  >
                    Reading
                  </button>
                  <button
                    onClick={() => setLessonView("quiz")}
                    className={`px-5 py-2 rounded-lg text-[1.0rem] font-bold uppercase tracking-[1.5px] transition-all ${
                      lessonView === "quiz" ? "bg-white text-black" : "text-white/70 hover:text-white/70"
                    }`}
                  >
                    Quiz ({lesson.questions.length}Q)
                  </button>
                </div>

                {/* Reading view */}
                {lessonView === "reading" && (
                  <div className="max-w-[720px]">
                    {lesson.description.split("\n\n").map((para, i) => (
                      <p key={i} className="text-[1.2rem] text-white/85 leading-[1.9] mb-5">
                        {para.trim()}
                      </p>
                    ))}
                    <button
                      onClick={() => { setLessonView("quiz"); setQuizAnswers({}); setQuizSubmitted(false) }}
                      className="mt-4 flex items-center gap-3 px-6 py-3 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[2px] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Take the Quiz <ArrowRight size={15} />
                    </button>
                  </div>
                )}

                {/* Quiz view */}
                {lessonView === "quiz" && (
                  <div className="max-w-[720px] space-y-8">
                    {lesson.questions.map((q, qi) => (
                      <div key={qi} className="p-6 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                        <p className="text-[1.15rem] font-semibold text-white mb-4 leading-relaxed">
                          <span className="text-[var(--btb-red)] font-display mr-2">{qi + 1}.</span>
                          {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const selected = quizAnswers[qi] === opt
                            const correct = opt === q.correctAnswer
                            let cls = "border-white/[0.08] bg-white/[0.02] text-white/78 hover:border-white/20 hover:text-white/70"
                            if (quizSubmitted) {
                              if (correct) cls = "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                              else if (selected && !correct) cls = "border-red-400/40 bg-red-400/10 text-red-300"
                              else cls = "border-white/[0.05] bg-white/[0.01] text-white/25"
                            } else if (selected) {
                              cls = "border-[var(--btb-red)]/50 bg-[var(--btb-red)]/10 text-white"
                            }
                            return (
                              <button
                                key={opt}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: opt }))}
                                className={`w-full text-left px-4 py-3 rounded-lg border text-[1.08rem] leading-relaxed transition-all duration-150 ${cls} disabled:cursor-default`}
                              >
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className={`mt-4 p-4 rounded-lg border text-[1.05rem] leading-relaxed ${
                            quizAnswers[qi] === q.correctAnswer
                              ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300/80"
                              : "border-amber-400/20 bg-amber-400/5 text-amber-300/80"
                          }`}>
                            <span className="font-bold mr-1">{quizAnswers[qi] === q.correctAnswer ? "Correct." : "Incorrect."}</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Submit / result */}
                    {!quizSubmitted ? (
                      <button
                        disabled={Object.keys(quizAnswers).length < lesson.questions.length}
                        onClick={() => {
                          setQuizSubmitted(true)
                          if (lesson.questions.every((q, i) => quizAnswers[i] === q.correctAnswer)) {
                            markCoachLessonComplete(mod.id, lesson.id)
                            refreshCoachProgress()
                          }
                        }}
                        className="w-full py-3 bg-[var(--btb-red)] text-white text-[1.05rem] font-bold uppercase tracking-[2px] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className={`p-6 rounded-xl border text-center ${
                        allCorrect
                          ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                          : "border-amber-400/20 bg-amber-400/[0.04]"
                      }`}>
                        {allCorrect ? (
                          <>
                            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-3" />
                            <p className="font-display text-lg uppercase tracking-wide text-white mb-1">
                              Lesson Complete
                            </p>
                            <p className="text-[1.05rem] text-white/70">
                              All answers correct. This lesson is marked complete.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-display text-lg uppercase tracking-wide text-white mb-1">
                              Review and Retry
                            </p>
                            <p className="text-[1.05rem] text-white/70 mb-4">
                              Review the explanations above, then re-read the lesson and try again.
                            </p>
                            <button
                              onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }}
                              className="px-5 py-2 border border-white/20 text-white/78 hover:text-white text-[1.0rem] font-bold uppercase tracking-[1.5px] rounded-lg transition-colors"
                            >
                              Retry Quiz
                            </button>
                          </>
                        )}
                        {nextLesson && allCorrect && (
                          <button
                            onClick={() => {
                              setActiveLessonId(nextLesson.id)
                              setLessonView("reading")
                              setQuizAnswers({})
                              setQuizSubmitted(false)
                              window.scrollTo({ top: (sectionRefs.current["learning"]?.getBoundingClientRect().top ?? 0) + window.scrollY - 88, behavior: "smooth" })
                            }}
                            className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 bg-white text-black text-[1.0rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:opacity-90 transition-opacity"
                          >
                            Next Lesson <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })() : activeModuleId ? (() => {
            /* ── Module Lesson List View ── */
            const mod = COACH_MODULES.find(m => m.id === activeModuleId)
            if (!mod) return null
            const completed = coachProgress.completedLessons[mod.id] ?? []

            return (
              <div>
                <button
                  onClick={() => setActiveModuleId(null)}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[1.05rem] font-semibold uppercase tracking-[1.5px] mb-8"
                >
                  <ArrowLeft size={15} /> All Modules
                </button>

                <div className="mb-10">
                  <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-3">
                    {completed.length} of {mod.lessons.length} lessons complete
                  </div>
                  <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] uppercase tracking-wide leading-[0.92] mb-3">
                    {mod.icon} {mod.title}
                  </h2>
                  <p className="text-[1.1rem] text-white/35 max-w-[540px] leading-relaxed">
                    {mod.description}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-6 max-w-[400px]">
                    <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-500"
                        style={{ width: `${mod.lessons.length > 0 ? (completed.length / mod.lessons.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {mod.lessons.map((lesson, i) => {
                    const done = completed.includes(lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setActiveLessonId(lesson.id)
                          setLessonView("reading")
                          setQuizAnswers({})
                          setQuizSubmitted(false)
                          window.scrollTo({ top: (sectionRefs.current["learning"]?.getBoundingClientRect().top ?? 0) + window.scrollY - 88, behavior: "smooth" })
                        }}
                        className={`group w-full text-left p-6 rounded-xl border transition-all duration-200 ${
                          done
                            ? "border-emerald-400/15 bg-emerald-400/[0.02] hover:border-emerald-400/25"
                            : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[1.25rem] font-display mt-0.5 ${
                            done ? "bg-emerald-400/20 text-emerald-400" : "bg-white/[0.06] text-white/85"
                          }`}>
                            {done ? <CheckCircle2 size={16} /> : String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-display text-[1.28rem] uppercase tracking-wide text-white">
                                {lesson.title}
                              </h4>
                              {done && (
                                <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-emerald-400/60 border border-emerald-400/15 px-2 py-0.5 rounded-full">
                                  Complete
                                </span>
                              )}
                            </div>
                            <p className="text-[1.05rem] text-white/85 leading-relaxed">
                              {lesson.questions.length} quiz question{lesson.questions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <ArrowRight size={16} className="shrink-0 text-white/45 group-hover:text-white/78 mt-1 transition-colors" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })() : (
            /* ── Module Grid View ── */
            <div>
              <div className="mb-10">
                <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
                  Coach Education
                </div>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
                  4 Modules.
                  <br />
                  Real Coaching Content.
                </h2>
                <p className="text-[1.1rem] text-white/35 max-w-[440px] leading-relaxed">
                  Philosophy, practice planning, film study, and player development — the complete BTB coaching education curriculum.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COACH_MODULES.map((mod) => {
                  const completed = (coachProgress.completedLessons[mod.id] ?? []).length
                  const total = mod.lessons.length
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveModuleId(mod.id)
                        setActiveLessonId(null)
                        window.scrollTo({ top: (sectionRefs.current["learning"]?.getBoundingClientRect().top ?? 0) + window.scrollY - 88, behavior: "smooth" })
                      }}
                      className="group text-left p-7 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <span className="text-3xl">{mod.icon}</span>
                        {pct === 100 ? (
                          <span className="text-[1.08rem] font-bold uppercase tracking-[2px] text-emerald-400/70 border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 rounded-full">
                            Complete
                          </span>
                        ) : pct > 0 ? (
                          <span className="text-[1.08rem] font-bold uppercase tracking-[2px] text-amber-400/60 border border-amber-400/15 bg-amber-400/5 px-2.5 py-1 rounded-full">
                            In Progress
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-display text-[1.1rem] uppercase tracking-wide text-white mb-2">
                        {mod.title}
                      </h3>
                      <p className="text-[1.05rem] text-white/35 leading-relaxed mb-5">
                        {mod.description}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[1.2rem] text-white/25 font-semibold uppercase tracking-[1px]">
                          {completed}/{total} lessons
                        </span>
                        <span className="text-[1.2rem] text-white/25 font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.07] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-[var(--btb-red)]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  CERTIFICATION COURSE                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="certification"
        ref={(el) => { sectionRefs.current["certification"] = el }}
        className="py-20 px-6 bg-neutral-950"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
                Certification
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92]">
                Every Coach.
                <br />
                Every Requirement.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[1.08rem] font-bold uppercase tracking-[2px] text-white/25 mb-1">
                  Progress
                </div>
                <div className="font-display text-2xl text-white">
                  {completedCount}
                  <span className="text-white/45">/{certificationItems.length}</span>
                </div>
              </div>
              {/* Progress ring */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="var(--btb-red)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(completedCount / certificationItems.length) * 125.66} 125.66`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {certificationItems.map((item, i) => {
              const done = !!certCompleted[item.id]
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-6 rounded-xl border transition-all duration-200 ${
                    done
                      ? "border-emerald-400/15 bg-emerald-400/[0.03]"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleCert(item.id)}
                    className="shrink-0 mt-0.5 transition-colors"
                  >
                    {done ? (
                      <CheckCircle2 size={22} className="text-emerald-400/70" />
                    ) : (
                      <Circle size={22} className="text-white/15 hover:text-white/85" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[1.08rem] font-bold text-white/15 font-display">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4
                        className={`font-display text-[1.25rem] uppercase tracking-wide transition-colors ${
                          done ? "text-white/70 line-through" : "text-white"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {done ? (
                        <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-emerald-400/60 border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-0.5 rounded-full">
                          Complete
                        </span>
                      ) : (
                        <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-amber-400/50 border border-amber-400/15 bg-amber-400/5 px-2.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[1.05rem] text-white/85 leading-relaxed">{item.description}</p>
                  </div>

                  {/* External link */}
                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-0.5 text-white/15 hover:text-[var(--btb-red)] transition-colors"
                      title="Open external resource"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  MY PAY                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="mypay"
        ref={(el) => { sectionRefs.current["mypay"] = el }}
        className="py-20 px-6 border-t border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="mb-10">
            <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
              My Pay
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92]">
              Season Contract
              <br />
              <span className="text-white/45">&amp; Payments</span>
            </h2>
          </div>

          {paymentData?.found && paymentData.coach && paymentData.installments ? (() => {
            const coach = paymentData.coach
            const installments = paymentData.installments
            const paidCount = installments.filter((i) => i.status === "paid").length
            const paidTotal = installments.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0)
            const remaining = coach.seasonContract - paidTotal
            const nextInst = installments.find((i) => i.status === "scheduled" || i.status === "upcoming")

            return (
            <div className="space-y-6">
              {/* Coach info + contract summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="text-[1.08rem] font-bold uppercase tracking-[2px] text-white/25 mb-2">
                    Season Contract
                  </div>
                  <div className="font-display text-[2.2rem] text-white leading-none">
                    ${coach.seasonContract.toLocaleString()}
                  </div>
                  <div className="text-[1.0rem] text-white/85 mt-2">
                    {paymentData.season} &middot; {coach.title}
                  </div>
                  {coach.teamAssignment && (
                    <div className="text-[1.25rem] text-white/45 mt-1">{coach.teamAssignment}</div>
                  )}
                </div>

                <div className="p-6 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.03]">
                  <div className="text-[1.08rem] font-bold uppercase tracking-[2px] text-emerald-400/50 mb-2">
                    Paid
                  </div>
                  <div className="font-display text-[2.2rem] text-emerald-400 leading-none">
                    ${paidTotal.toLocaleString()}
                  </div>
                  <div className="text-[1.0rem] text-white/85 mt-2">
                    {paidCount} of {installments.length} payments
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="text-[1.08rem] font-bold uppercase tracking-[2px] text-white/25 mb-2">
                    Remaining
                  </div>
                  <div className="font-display text-[2.2rem] text-white leading-none">
                    ${remaining.toLocaleString()}
                  </div>
                  {nextInst && (
                    <div className="text-[1.0rem] text-white/85 mt-2">
                      Next: {new Date(nextInst.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[1.0rem] font-semibold text-white/78">{paymentData.season} Progress</span>
                  <span className="text-[1.0rem] text-white/85">
                    ${paidTotal.toLocaleString()} of ${coach.seasonContract.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-700"
                    style={{ width: `${coach.seasonContract > 0 ? (paidTotal / coach.seasonContract) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Payment schedule */}
              <div className="space-y-3">
                {installments.map((inst, i) => {
                  const isPaid = inst.status === "paid"
                  const isScheduled = inst.status === "scheduled"
                  const d = new Date(inst.date)
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                        isPaid
                          ? "border-emerald-400/15 bg-emerald-400/[0.03]"
                          : isScheduled
                            ? "border-amber-400/15 bg-amber-400/[0.03]"
                            : "border-white/[0.07] bg-white/[0.02]"
                      }`}
                    >
                      {/* Date block */}
                      <div className="text-center w-14 shrink-0">
                        <div className="text-[1.0rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)]">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </div>
                        <div className="font-display text-2xl text-white leading-tight">
                          {d.getDate()}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[1.1rem] font-semibold text-white">{inst.label}</span>
                          {isPaid ? (
                            <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-emerald-400/60 border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-0.5 rounded-full">
                              Paid
                            </span>
                          ) : isScheduled ? (
                            <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-amber-400/60 border border-amber-400/15 bg-amber-400/5 px-2.5 py-0.5 rounded-full">
                              Scheduled
                            </span>
                          ) : (
                            <span className="text-[1.05rem] font-bold uppercase tracking-[2px] text-white/25 border border-white/10 bg-white/[0.02] px-2.5 py-0.5 rounded-full">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <div className="text-[1.0rem] text-white/25 mt-1">
                          {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <div className={`font-display text-xl ${isPaid ? "text-emerald-400" : "text-white"}`}>
                          ${inst.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )
          })() : (
            <div className="p-10 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
              <DollarSign size={32} className="mx-auto text-white/15 mb-4" />
              <p className="text-[1.1rem] text-white/70 mb-1">No payment record found</p>
              <p className="text-[1.0rem] text-white/45">
                Contact BTB operations if you believe this is an error.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  PLAYER PROGRESS DASHBOARD                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section
        id="playerprogress"
        ref={(el) => { sectionRefs.current["playerprogress"] = el }}
        className="py-20 px-6 border-t border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="text-[1.15rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
                Player Progress
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-2">
                Academy<br /><span className="text-white/45">Completion</span>
              </h2>
              <p className="text-[1.08rem] text-white/35 max-w-[420px] leading-relaxed">
                Live view of every player's academy progress — pulled from Airtable in real time.
              </p>
            </div>
            <button
              onClick={loadPlayerProgress}
              disabled={progressLoading}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/[0.1] text-white/78 hover:text-white hover:border-white/30 transition-colors text-[1.0rem] font-bold uppercase tracking-[1.5px] rounded-lg disabled:opacity-40"
            >
              <TrendingUp size={14} />
              {progressLoading ? "Loading..." : progressLoaded ? "Refresh" : "Load Progress"}
            </button>
          </div>

          {!progressLoaded && !progressLoading && (
            <div className="p-12 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
              <GraduationCap size={32} className="mx-auto text-white/35 mb-4" />
              <p className="text-white/85 text-[1.1rem]">Click "Load Progress" to fetch live player data from Airtable.</p>
            </div>
          )}

          {progressLoading && (
            <div className="p-12 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
              <p className="text-white/85 text-[1.1rem] animate-pulse">Fetching player progress...</p>
            </div>
          )}

          {progressLoaded && playerProgress.length === 0 && (
            <div className="p-12 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
              <Users size={32} className="mx-auto text-white/35 mb-4" />
              <p className="text-white/85 text-[1.1rem]">No player progress recorded yet for {genderLabel} academy.</p>
              <p className="text-white/45 text-[1.0rem] mt-1">Progress appears here as players complete lessons.</p>
            </div>
          )}

          {progressLoaded && playerProgress.length > 0 && (
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_80px] gap-4 px-5 py-2 text-[1.08rem] font-bold uppercase tracking-[2px] text-white/25">
                <span>Player</span>
                <span className="text-center">Courses</span>
                <span className="text-right">Overall</span>
              </div>

              {playerProgress.map((player) => {
                const displayName = player.playerName || `${player.userId.slice(0, 12)}…`
                const displayEmail = player.playerEmail || null
                return (
                <div key={player.userId} className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                  {/* Player summary row */}
                  <div className="grid grid-cols-[1fr_120px_80px] gap-4 px-5 py-4 items-center">
                    <div>
                      <p className="text-[1.08rem] font-semibold text-white truncate">{displayName}</p>
                      <p className="text-[1.2rem] text-white/25 mt-0.5">
                        {displayEmail && <span className="mr-2 text-white/45">{displayEmail}</span>}
                        {player.courses.length} course{player.courses.length !== 1 ? "s" : ""} started
                        {player.lastActive && <span className="ml-2">· Last: {player.lastActive}</span>}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {player.courses.map((c) => (
                        <div key={c.courseId} className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/85 w-16 truncate">{c.courseId.replace(`${gender}-`, "")}</span>
                          <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                c.pct === 100 ? "bg-emerald-500" : "bg-[var(--btb-red)]"
                              }`}
                              style={{ width: `${c.pct}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-white/85 w-8 text-right">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className={`font-display text-xl ${player.totalPct === 100 ? "text-emerald-400" : "text-white"}`}>
                        {player.totalPct}%
                      </span>
                    </div>
                  </div>
                </div>
              )
              })}

              <p className="text-[1.2rem] text-white/45 text-center pt-4">
                {playerProgress.length} player{playerProgress.length !== 1 ? "s" : ""} with recorded progress · Open Airtable for full detail
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
