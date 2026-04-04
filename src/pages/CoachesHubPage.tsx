import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { drills, drillCategories, practicePlans } from "@/lib/coachData"
import {
  films,
  filmCategories,
  filmCategoryColors,
  filmCategoryBg,
  filmLevelColors,
  getRelatedFilms,
} from "@/lib/filmData"
import { SEO } from "@/components/shared/SEO"
import type { Drill, Gender, FilmEntry, FilmCategory, FilmLevel } from "@/types"
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
  PlayCircle,
  Search,
  X,
  Tag,
  ArrowRight,
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
  {
    id: "cert-internal",
    title: "BTB Internal Development Course",
    description: "Complete the BTB internal coaching development module covering philosophy, practice planning, and film study standards.",
  },
  {
    id: "cert-practice",
    title: "Practice Plan Submission",
    description: "Submit your first written practice plan using the BTB template for review and approval.",
  },
]

/* ------------------------------------------------------------------ */
/*  Film level badge helper                                            */
/* ------------------------------------------------------------------ */

function filmLevelColor(level: FilmLevel) {
  return filmLevelColors[level] || "text-white/40 border-white/20 bg-white/5"
}

/* ------------------------------------------------------------------ */
/*  Dashboard card data                                                */
/* ------------------------------------------------------------------ */

const dashboardCards = [
  { id: "drills", icon: BookOpen, title: "Drill Library", description: "50+ drills across 8 categories with full coaching breakdowns." },
  { id: "film", icon: Video, title: "Film Resources", description: "Game film, scouting reports, and teaching clips." },
  { id: "plans", icon: ClipboardList, title: "Practice Plans", description: "Seasonal phase templates with timed segment breakdowns." },
  { id: "certification", icon: Award, title: "Certification", description: "Track your coaching certification requirements and progress." },
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
  Foundation: "Weeks 1-4",
  Connection: "Weeks 5-8",
  Expansion: "Weeks 9-12",
  Execution: "Weeks 13-16",
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

  // Film library state
  const [filmCategory, setFilmCategory] = useState<"All" | FilmCategory>("All")
  const [filmLevel, setFilmLevel] = useState<"All" | FilmLevel>("All")
  const [filmSearch, setFilmSearch] = useState("")
  const [selectedFilm, setSelectedFilm] = useState<FilmEntry | null>(null)

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

  // Section refs for smooth scroll
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const navHeight = 64
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 24
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // Filtered drills
  const filteredDrills =
    activeCategory === "All" ? drills : drills.filter((d) => d.category === activeCategory)

  // Filtered films
  const filteredFilms = useMemo(() => {
    let result = films
    if (filmCategory !== "All") {
      result = result.filter((f) => f.category === filmCategory)
    }
    if (filmLevel !== "All") {
      result = result.filter((f) => f.level === filmLevel)
    }
    if (filmSearch.trim()) {
      const q = filmSearch.toLowerCase()
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [filmCategory, filmLevel, filmSearch])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const genderLabel = gender === "boys" ? "Boys" : "Girls"

  const toggleCert = (id: string) => {
    setCertCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = certificationItems.filter((c) => certCompleted[c.id]).length

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
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[0.78rem] font-semibold uppercase tracking-[1.5px]"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="font-display text-lg uppercase tracking-wide">
            BTB {genderLabel} <span className="text-[var(--btb-red)]">Coaches Hub</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-white/[0.1] text-white/40 hover:text-white hover:border-white/30 transition-colors text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* ── Welcome Section ── */}
      <section className="pt-28 pb-16 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
            Coaches Hub
          </div>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase tracking-wide leading-[0.88] mb-4">
            Welcome Back,
            <br />
            <span className="text-[var(--btb-red)]">{user?.name || "Coach"}</span>
          </h1>
          <p className="text-[0.88rem] text-white/35 max-w-[480px] leading-[1.8]">
            Your drills, film, practice plans, and certification progress — all in one place. Everything you
            need to prepare, coach, and develop.
          </p>
        </div>
      </section>

      {/* ── Dashboard Cards ── */}
      <section className="py-12 px-6 border-b border-white/[0.07]">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-[0.75rem] text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">
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
            <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
              Drill Library
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
              Eight Categories.
              <br />
              One Shared Playbook.
            </h2>
            <p className="text-[0.84rem] text-white/35 max-w-[420px] leading-relaxed">
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
                className={`px-4 py-2 rounded-full text-[0.72rem] font-semibold uppercase tracking-[1px] transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[var(--btb-red)] text-white"
                    : "border border-white/[0.1] text-white/40 hover:text-white/60 hover:border-white/20"
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
                        <span className="text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border bg-white/[0.02]  text-[var(--btb-red)] border-[var(--btb-red)]/20">
                          {drill.category}
                        </span>
                        <span
                          className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border ${difficultyColor(
                            drill.difficulty
                          )}`}
                        >
                          {drill.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1 text-[0.72rem] text-white/30">
                          <Clock size={12} /> {drill.duration} min
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-white/35 leading-relaxed">{drill.description}</p>
                    </div>
                    <div className="shrink-0 text-white/20 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-0 border-t border-white/[0.06] mt-0">
                      <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Setup */}
                        <div>
                          <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Setup
                          </div>
                          <p className="text-[0.8rem] text-white/40 leading-relaxed">{drill.setup}</p>
                        </div>

                        {/* Execution */}
                        <div>
                          <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Execution
                          </div>
                          <ol className="space-y-1.5">
                            {drill.execution.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-[0.8rem] text-white/40 leading-relaxed">
                                <span className="text-white/15 font-display text-[0.7rem] shrink-0 w-5">
                                  {String(i + 1).padStart(2, "0")}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Coaching Points */}
                        <div>
                          <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                            Coaching Points
                          </div>
                          <ul className="space-y-1.5">
                            {drill.coachingPoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-2 text-[0.8rem] text-white/40 leading-relaxed">
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
              <div className="text-center py-16 text-white/20 text-[0.84rem]">
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
        className="py-20 px-6 bg-neutral-950 border-b border-white/[0.07]"
      >
        <div className="max-w-[1000px] mx-auto">

          {/* ── Film Detail View ── */}
          {selectedFilm ? (
            <div>
              {/* Back button */}
              <button
                onClick={() => setSelectedFilm(null)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[0.78rem] font-semibold uppercase tracking-[1.5px] mb-8"
              >
                <ArrowLeft size={15} /> Back to Library
              </button>

              {/* Video placeholder */}
              <div className={`relative w-full aspect-video rounded-xl ${filmCategoryBg[selectedFilm.category]} flex items-center justify-center mb-8 border border-white/[0.06]`}>
                <div className="text-center">
                  <PlayCircle size={64} strokeWidth={1} className="text-white/25 mx-auto mb-3" />
                  <div className="text-[0.78rem] font-semibold uppercase tracking-[2px] text-white/30">
                    Video Coming Soon
                  </div>
                </div>
              </div>

              {/* Film info */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border ${filmCategoryColors[selectedFilm.category]}`}>
                    {selectedFilm.category}
                  </span>
                  <span className={`text-[0.6rem] font-bold uppercase tracking-[1.5px] px-2.5 py-0.5 rounded-full border ${filmLevelColor(selectedFilm.level)}`}>
                    {selectedFilm.level}
                  </span>
                  <span className="flex items-center gap-1 text-[0.72rem] text-white/30">
                    <Clock size={12} /> {selectedFilm.duration}
                  </span>
                </div>
                <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.2rem)] uppercase tracking-wide leading-[0.95] text-white mb-3">
                  {selectedFilm.title}
                </h2>
                <p className="text-[0.88rem] text-white/40 max-w-[600px] leading-[1.8] mb-1">
                  {selectedFilm.subcategory}
                </p>
                <p className="text-[0.84rem] text-white/35 max-w-[600px] leading-relaxed">
                  {selectedFilm.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-12">
                {selectedFilm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[1px] px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40"
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>

              {/* Related Films */}
              {getRelatedFilms(selectedFilm).length > 0 && (
                <div>
                  <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-5">
                    Related Films
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getRelatedFilms(selectedFilm).map((related) => (
                      <button
                        key={related.id}
                        onClick={() => {
                          setSelectedFilm(related)
                          window.scrollTo({ top: (sectionRefs.current["film"]?.getBoundingClientRect().top ?? 0) + window.scrollY - 88, behavior: "smooth" })
                        }}
                        className="group text-left rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] transition-all duration-200 overflow-hidden"
                      >
                        <div className={`aspect-video ${filmCategoryBg[related.category]} flex items-center justify-center`}>
                          <PlayCircle size={28} strokeWidth={1.2} className="text-white/20 group-hover:text-white/40 transition-colors" />
                        </div>
                        <div className="p-4">
                          <h5 className="font-display text-[0.82rem] uppercase tracking-wide text-white mb-1 line-clamp-2">
                            {related.title}
                          </h5>
                          <span className="text-[0.68rem] text-white/25">{related.duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Film Library View ── */
            <div>
              {/* Header */}
              <div className="mb-10">
                <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
                  Film Resources
                </div>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
                  Game Film.
                  <br />
                  Teaching Clips.
                </h2>
                <p className="text-[0.84rem] text-white/35 max-w-[440px] leading-relaxed">
                  {films.length} film resources across {filmCategories.length} categories. Filter by topic, level, or search by keyword.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Search films by title, description, or tags..."
                  value={filmSearch}
                  onChange={(e) => setFilmSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-[0.84rem] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.05] transition-all"
                />
                {filmSearch && (
                  <button
                    onClick={() => setFilmSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category filter pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(["All", ...filmCategories] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilmCategory(cat as "All" | FilmCategory)
                      setSelectedFilm(null)
                    }}
                    className={`px-4 py-2 rounded-full text-[0.72rem] font-semibold uppercase tracking-[1px] transition-all duration-200 ${
                      filmCategory === cat
                        ? "bg-[var(--btb-red)] text-white"
                        : "border border-white/[0.1] text-white/40 hover:text-white/60 hover:border-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Level filter pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilmLevel(level as "All" | FilmLevel)}
                    className={`px-3 py-1.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-[1px] transition-all duration-200 ${
                      filmLevel === level
                        ? "bg-white/[0.12] text-white border border-white/[0.2]"
                        : "border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15"
                    }`}
                  >
                    {level === "All" ? "All Levels" : level}
                  </button>
                ))}
              </div>

              {/* Film result count */}
              {(filmCategory !== "All" || filmLevel !== "All" || filmSearch) && (
                <div className="text-[0.75rem] text-white/25 mb-6">
                  Showing {filteredFilms.length} of {films.length} films
                </div>
              )}

              {/* Film card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFilms.map((film) => (
                  <button
                    key={film.id}
                    onClick={() => {
                      setSelectedFilm(film)
                      window.scrollTo({ top: (sectionRefs.current["film"]?.getBoundingClientRect().top ?? 0) + window.scrollY - 88, behavior: "smooth" })
                    }}
                    className="group text-left rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-[var(--btb-red)]/30 hover:shadow-lg hover:shadow-[var(--btb-red)]/[0.04] transition-all duration-200 overflow-hidden"
                  >
                    {/* Thumbnail placeholder */}
                    <div className={`relative aspect-video ${filmCategoryBg[film.category]} flex items-center justify-center`}>
                      <PlayCircle size={36} strokeWidth={1.2} className="text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all duration-200" />
                      {/* Duration badge */}
                      <span className="absolute bottom-2 right-2 text-[0.62rem] font-bold px-2 py-0.5 rounded bg-black/60 text-white/70 backdrop-blur-sm">
                        {film.duration}
                      </span>
                    </div>

                    {/* Card content */}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`text-[0.55rem] font-bold uppercase tracking-[1.5px] px-2 py-0.5 rounded-full border ${filmCategoryColors[film.category]}`}>
                          {film.category}
                        </span>
                        <span className={`text-[0.55rem] font-bold uppercase tracking-[1.5px] px-2 py-0.5 rounded-full border ${filmLevelColor(film.level)}`}>
                          {film.level}
                        </span>
                      </div>
                      <h4 className="font-display text-[0.88rem] uppercase tracking-wide text-white mb-2 line-clamp-2 group-hover:text-[var(--btb-red)] transition-colors">
                        {film.title}
                      </h4>
                      <p className="text-[0.74rem] text-white/30 leading-relaxed line-clamp-2">
                        {film.description}
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-[0.68rem] text-white/20 group-hover:text-[var(--btb-red)]/60 transition-colors">
                        Watch <ArrowRight size={12} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredFilms.length === 0 && (
                <div className="text-center py-16 text-white/20 text-[0.84rem]">
                  No films found matching your filters.
                </div>
              )}
            </div>
          )}
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
            <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
              Practice Plans
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-3">
              Four Phases.
              <br />
              One System.
            </h2>
            <p className="text-[0.84rem] text-white/35 max-w-[440px] leading-relaxed">
              Every practice follows a submitted written plan. Each phase builds on the last across the
              16-week development cycle.
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
                      <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-1">
                        {phaseWeeks[plan.phase] || ""}
                      </div>
                      <h4 className="font-display text-[1.1rem] uppercase tracking-wide text-white mb-2">
                        {plan.phase}
                      </h4>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-1 text-[0.72rem] text-white/30">
                          <Clock size={12} /> {plan.duration} min
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-white/35 leading-relaxed">{plan.description}</p>
                    </div>
                    <div className="shrink-0 text-white/20 mt-1">
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
                            <div className="shrink-0 text-[0.68rem] font-bold text-[var(--btb-red)] uppercase tracking-[1px] w-24 pt-0.5">
                              {seg.time}
                            </div>
                            <div className="w-px self-stretch bg-white/[0.08]" />
                            <div>
                              <div className="font-display text-[0.88rem] uppercase tracking-wide text-white mb-1">
                                {seg.activity}
                              </div>
                              <p className="text-[0.78rem] text-white/35 leading-relaxed">{seg.detail}</p>
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
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-4">
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
                <div className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/25 mb-1">
                  Progress
                </div>
                <div className="font-display text-2xl text-white">
                  {completedCount}
                  <span className="text-white/20">/{certificationItems.length}</span>
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
                      <Circle size={22} className="text-white/15 hover:text-white/30" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[0.6rem] font-bold text-white/15 font-display">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4
                        className={`font-display text-[0.95rem] uppercase tracking-wide transition-colors ${
                          done ? "text-white/40 line-through" : "text-white"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {done ? (
                        <span className="text-[0.58rem] font-bold uppercase tracking-[2px] text-emerald-400/60 border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-0.5 rounded-full">
                          Complete
                        </span>
                      ) : (
                        <span className="text-[0.58rem] font-bold uppercase tracking-[2px] text-amber-400/50 border border-amber-400/15 bg-amber-400/5 px-2.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[0.78rem] text-white/30 leading-relaxed">{item.description}</p>
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
    </div>
  )
}
