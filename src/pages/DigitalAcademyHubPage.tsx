/**
 * DigitalAcademyHubPage — Unified BTB Digital Academy Hub
 *
 * Merges boys/girls PlayerHubPage into a single gender-agnostic platform.
 * Tabs: Dashboard | Academy | Courses | Film Study | Downloads | Wall of Fame
 *
 * Design system from BTB Digital Academy concept:
 *   btb-black #000000 | btb-graphite #0A0A0A | btb-charcoal #141414
 *   btb-steel #1F1F1F | btb-iron #2A2A2A | btb-gray #444444 | btb-mute #888888
 *   btb-red #D22630 | btb-success #00D26A | btb-warning #FFB800
 *   font-display: Anton, Bebas Neue
 */

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useProgress } from "@/hooks/useProgress"
import { getCourses, getCoursesByGradYear } from "@/lib/courseData"
import { CourseView } from "@/components/hubs/players/CourseView"
import { SEO } from "@/components/shared/SEO"
import {
  getAcademyCoursesWithPositions,
  getAcademyProgress,
  markLessonComplete,
  markCourseComplete,
  getWallOfFame,
  addToWallOfFame,
  syncProgressFromServer,
  PILLAR_CONFIG,
  PILLAR_ORDER,
  POSITION_CONFIG,
  POSITION_ORDER,
  type AcademyCourse,
  type AcademyLesson,
  type WallOfFameEntry,
  type AgeTier,
  type Pillar,
  type AcademyProgress,
  type Position,
} from "@/lib/academyData"
import {
  ArrowLeft,
  LogOut,
  BookOpen,
  Play,
  Trophy,
  GraduationCap,
  ChevronRight,
  Lock,
  Check,
  CheckCircle2,
  XCircle,
  Swords,
  Crown,
  Users,
  Award,
  Brain,
  Target,
  Heart,
  Download,
  Film,
  LayoutDashboard,
  Zap,
  Activity,
  FileText,
} from "lucide-react"
import type { Gender, Course } from "@/types"

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "academy" | "courses" | "film" | "downloads" | "wof"

// ─── Constants ──────────────────────────────────────────────────────────────

const GENDER_STORAGE_KEY = "btb_academy_gender"

const PILLAR_ICONS: Record<Pillar, typeof BookOpen> = {
  game: Swords,
  leadership: Crown,
  team: Users,
}

const PILLAR_COLORS: Record<Pillar, { gradient: string; text: string; bg: string; border: string }> = {
  game:       { gradient: "from-blue-500 to-blue-700",    text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30" },
  leadership: { gradient: "from-amber-500 to-amber-700",  text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  team:       { gradient: "from-emerald-500 to-emerald-700", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
}

const TIER_COLORS: Record<AgeTier, string> = {
  youth:  "from-emerald-500 to-emerald-700",
  middle: "from-blue-500 to-blue-700",
  high:   "from-[#D22630] to-[#8B0000]",
}

const TOPIC_ICONS: Record<string, typeof BookOpen> = {
  Fundamentals: Target,
  "Lacrosse IQ": Brain,
  "Mental Game": Heart,
  Character: Award,
}

const TOPIC_COLORS: Record<string, string> = {
  Fundamentals:  "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Lacrosse IQ": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "Mental Game": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Character:     "text-amber-400 bg-amber-500/10 border-amber-500/30",
}

const FILM_POSITIONS = ["All", "Attack", "Midfield", "Defense", "Goalie", "FOGO"] as const
type FilmPosition = typeof FILM_POSITIONS[number]

const STATIC_DOWNLOADS = [
  { id: "d1", name: "BTB Offensive System Playbook", category: "Playbooks", size: "2.4 MB", ext: "PDF" },
  { id: "d2", name: "BTB Defensive Concepts Playbook", category: "Playbooks", size: "1.8 MB", ext: "PDF" },
  { id: "d3", name: "Ground Ball Drill Sheet", category: "Drill Sheets", size: "540 KB", ext: "PDF" },
  { id: "d4", name: "Wall Ball 30-Day Program", category: "Drill Sheets", size: "320 KB", ext: "PDF" },
  { id: "d5", name: "BTB Footwork Ladder Circuit", category: "Drill Sheets", size: "280 KB", ext: "PDF" },
  { id: "d6", name: "Mental Performance Journal", category: "Mental Game", size: "1.1 MB", ext: "PDF" },
  { id: "d7", name: "Pressure Performance Protocol", category: "Mental Game", size: "420 KB", ext: "PDF" },
  { id: "d8", name: "Recruiting Preparation Guide", category: "Recruiting", size: "890 KB", ext: "PDF" },
  { id: "d9", name: "College Lacrosse Email Templates", category: "Recruiting", size: "180 KB", ext: "PDF" },
  { id: "d10", name: "Highlight Film Checklist", category: "Recruiting", size: "210 KB", ext: "PDF" },
]

const DOWNLOAD_CATEGORIES = ["Playbooks", "Drill Sheets", "Mental Game", "Recruiting"] as const
type DownloadCategory = typeof DOWNLOAD_CATEGORIES[number]

const CATEGORY_COLORS: Record<DownloadCategory, string> = {
  Playbooks:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Drill Sheets": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Mental Game": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Recruiting:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function ProgressBar({ pct, colorClass = "bg-[#D22630]", height = "h-1.5" }: { pct: number; colorClass?: string; height?: string }) {
  return (
    <div className={`w-full ${height} bg-[#1F1F1F] rounded-full overflow-hidden`}>
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DigitalAcademyHubPage({ gender: genderProp }: { gender?: Gender }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { getCourseCompletion } = useProgress(user?.id ?? "")

  // ── Gender state ─────────────────────────────────────────────────────────
  const [gender, setGender] = useState<Gender>(() => {
    // If a gender is passed as a prop (route-level), always use it
    if (genderProp) return genderProp
    try {
      const stored = localStorage.getItem(GENDER_STORAGE_KEY)
      if (stored === "boys" || stored === "girls") return stored
    } catch { /* ignore */ }
    return (user?.gender ?? "boys") as Gender
  })

  const setAndStoreGender = (g: Gender) => {
    setGender(g)
    try { localStorage.setItem(GENDER_STORAGE_KEY, g) } catch { /* ignore */ }
  }

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  // ── Grad-year courses ─────────────────────────────────────────────────────
  const gradCourses = useMemo(() => {
    if (user?.gradYear) return getCoursesByGradYear(gender, user.gradYear)
    return getCourses(gender)
  }, [gender, user?.gradYear])
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  // ── Academy (pillar courses) ──────────────────────────────────────────────
  const academyCourses = useMemo(() => getAcademyCoursesWithPositions(gender), [gender])
  const [academyProgress, setAcademyProgress] = useState<AcademyProgress>(getAcademyProgress)
  const [activePillarCourse, setActivePillarCourse] = useState<AcademyCourse | null>(null)
  const [activePillar, setActivePillar] = useState<Pillar>("game")
  const [activePosition, setActivePosition] = useState<Position>("all")
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null)

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [questionsCorrect, setQuestionsCorrect] = useState(0)
  const [showLessonComplete, setShowLessonComplete] = useState(false)
  const [showCourseComplete, setShowCourseComplete] = useState(false)

  // ── Wall of Fame ──────────────────────────────────────────────────────────
  const [wallEntries, setWallEntries] = useState<WallOfFameEntry[]>([])
  const [wallName, setWallName] = useState("")
  const [nameSubmitted, setNameSubmitted] = useState(false)

  // ── Film Study ────────────────────────────────────────────────────────────
  const [filmPositionFilter, setFilmPositionFilter] = useState<FilmPosition>("All")

  // ── Downloads ─────────────────────────────────────────────────────────────
  const [downloadCategory, setDownloadCategory] = useState<DownloadCategory | "All">("All")

  // ── On mount: sync progress + load WoF ───────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      syncProgressFromServer(user.id).then(setAcademyProgress)
    }
    getWallOfFame().then(setWallEntries)
  }, [user?.id])

  // Reset gender when user changes
  useEffect(() => {
    if (user?.gender) {
      const stored = localStorage.getItem(GENDER_STORAGE_KEY)
      if (!stored) setGender(user.gender as Gender)
    }
  }, [user?.gender])

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  // ─── Academy helpers ──────────────────────────────────────────────────────

  const getLessonsByPillar = (course: AcademyCourse, pillar: Pillar): AcademyLesson[] =>
    course.lessons.filter((l) => l.pillar === pillar)

  const isLessonUnlocked = (course: AcademyCourse, lessonIndex: number): boolean => {
    const lesson = course.lessons[lessonIndex]
    const pillarLessons = getLessonsByPillar(course, lesson.pillar)
    const pillarIndex = pillarLessons.findIndex((l) => l.id === lesson.id)
    if (pillarIndex === 0) return true
    const prev = pillarLessons[pillarIndex - 1]
    return academyProgress[course.id]?.completedLessons.includes(prev.id) ?? false
  }

  const isCourseComplete = (course: AcademyCourse): boolean => {
    const completed = academyProgress[course.id]?.completedLessons ?? []
    return course.lessons.every((l) => completed.includes(l.id))
  }

  const getCourseProgress = (course: AcademyCourse): number => {
    const completed = academyProgress[course.id]?.completedLessons.length ?? 0
    return Math.round((completed / course.lessons.length) * 100)
  }

  const getPillarProgress = (course: AcademyCourse, pillar: Pillar): number => {
    const lessons = getLessonsByPillar(course, pillar)
    const done = lessons.filter((l) => academyProgress[course.id]?.completedLessons.includes(l.id)).length
    return lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0
  }

  const openLesson = (lesson: AcademyLesson) => {
    setActiveLesson(lesson)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setQuestionsCorrect(0)
    setShowLessonComplete(false)
  }

  const submitAnswer = () => {
    if (selectedAnswer === null || !activeLesson) return
    setAnswerSubmitted(true)
    if (activeLesson.questions[currentQuestionIndex].correctAnswer === selectedAnswer) {
      setQuestionsCorrect((q) => q + 1)
    }
  }

  const nextQuestion = () => {
    if (!activeLesson || !activePillarCourse) return
    const isCorrect = activeLesson.questions[currentQuestionIndex].correctAnswer === selectedAnswer
    if (!isCorrect) {
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
      return
    }
    if (currentQuestionIndex < activeLesson.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
    } else {
      markLessonComplete(activePillarCourse.id, activeLesson.id, user?.id, user?.name ?? undefined, user?.email ?? undefined)
      const newProgress = getAcademyProgress()
      setAcademyProgress(newProgress)
      setShowLessonComplete(true)
      const completedAll = activePillarCourse.lessons.every(
        (l) => newProgress[activePillarCourse.id]?.completedLessons.includes(l.id)
      )
      if (completedAll && !newProgress[activePillarCourse.id]?.completedAt) {
        markCourseComplete(activePillarCourse.id, user?.id)
        setTimeout(() => {
          setShowCourseComplete(true)
          setShowLessonComplete(false)
        }, 1200)
      }
    }
  }

  const closeLesson = () => {
    setActiveLesson(null)
    setShowLessonComplete(false)
    setShowCourseComplete(false)
    setNameSubmitted(false)
    setWallName("")
  }

  const submitWallEntry = () => {
    if (!wallName.trim() || !activePillarCourse) return
    addToWallOfFame(wallName.trim(), gender, activePillarCourse.tier, activePillarCourse.id).then(() => {
      getWallOfFame().then(setWallEntries)
    })
    setNameSubmitted(true)
  }

  // ─── Overall progress computation ─────────────────────────────────────────
  const totalLessons = academyCourses.reduce((s, c) => s + c.lessons.length, 0)
  const completedLessons = academyCourses.reduce((s, c) =>
    s + (academyProgress[c.id]?.completedLessons.length ?? 0), 0)
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Streak (simple: count distinct days in localStorage progress)
  const streak = useMemo(() => {
    try {
      const raw = localStorage.getItem("btb_streak_days")
      return raw ? parseInt(raw, 10) : 1
    } catch { return 1 }
  }, [])

  // Film clips derived from courseData film steps
  const filmClips = useMemo(() => {
    const clips: { id: string; title: string; description: string; videoUrl: string; duration: number; position: string }[] = []
    getCourses(gender).forEach((course) => {
      course.steps.forEach((step) => {
        if (step.type === "film" && step.content.videoUrl) {
          const pos = course.id.includes("skills") ? "All" : "All"
          clips.push({
            id: step.id,
            title: step.title,
            description: step.content.description ?? "",
            videoUrl: step.content.videoUrl,
            duration: step.content.duration ?? 15,
            position: pos,
          })
        }
      })
    })
    // deduplicate by videoUrl
    const seen = new Set<string>()
    return clips.filter((c) => {
      if (seen.has(c.videoUrl)) return false
      seen.add(c.videoUrl)
      return true
    })
  }, [gender])

  const filteredFilmClips = filmClips.filter(
    (c) => filmPositionFilter === "All" || c.position === filmPositionFilter
  )

  const filteredDownloads = STATIC_DOWNLOADS.filter(
    (d) => downloadCategory === "All" || d.category === downloadCategory
  )

  // ─── COURSE DETAIL VIEW (grad-year courses) ────────────────────────────
  if (activeCourse && user) {
    return (
      <CourseView
        course={activeCourse}
        userId={user.id}
        onBack={() => setActiveCourse(null)}
      />
    )
  }

  // ─── LESSON VIEW ──────────────────────────────────────────────────────────
  if (activeLesson && activePillarCourse && !showLessonComplete && !showCourseComplete) {
    const currentQuestion = activeLesson.questions[currentQuestionIndex]
    const isCorrect = answerSubmitted && selectedAnswer === currentQuestion.correctAnswer
    const isWrong   = answerSubmitted && selectedAnswer !== currentQuestion.correctAnswer
    const TopicIcon = TOPIC_ICONS[activeLesson.topic]

    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-[#1F1F1F] bg-black/90 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={closeLesson}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={16} /> Back to Course
            </button>
            <span className="text-[#888888] text-xs font-bold uppercase tracking-wider">
              Question {currentQuestionIndex + 1} / {activeLesson.questions.length}
            </span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${TOPIC_COLORS[activeLesson.topic]} mb-4`}>
            <TopicIcon size={11} /> {activeLesson.topic}
          </span>

          <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.03em" }}>
            {activeLesson.title}
          </h1>

          {activeLesson.videoUrl && (() => {
            const videoId = activeLesson.videoUrl?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
            return videoId ? (
              <div className="mb-10">
                <div className="relative w-full rounded-xl overflow-hidden border border-[#1F1F1F]" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-[#888888] text-xs mt-2 text-center uppercase tracking-wider">Watch the video, then answer below</p>
              </div>
            ) : null
          })()}

          <div className="mb-10">
            {activeLesson.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-white/75 leading-relaxed mb-4 text-base">{para}</p>
            ))}
          </div>

          <div className="border-t border-[#1F1F1F] pt-10">
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-white">{currentQuestion.question}</h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const sel     = selectedAnswer === idx
                  const correct = answerSubmitted && idx === currentQuestion.correctAnswer
                  const wrong   = answerSubmitted && sel && idx !== currentQuestion.correctAnswer
                  return (
                    <button
                      key={idx}
                      disabled={answerSubmitted}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${
                        correct ? "bg-emerald-500/20 border-emerald-500/60 text-white"
                        : wrong  ? "bg-red-500/20 border-red-500/60 text-white"
                        : sel    ? "bg-[#D22630]/20 border-[#D22630] text-white"
                        : "bg-[#141414] border-[#1F1F1F] hover:bg-[#1F1F1F] text-white/80"
                      } ${answerSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        correct ? "border-emerald-400 bg-emerald-400"
                        : wrong  ? "border-red-400 bg-red-400"
                        : sel    ? "border-[#D22630] bg-[#D22630]"
                        : "border-white/30"
                      }`}>
                        {correct && <Check size={14} className="text-black" />}
                        {wrong   && <XCircle size={14} className="text-black" />}
                        {!answerSubmitted && sel && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>

              {answerSubmitted && (
                <div className={`mt-6 p-4 rounded-lg border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect
                      ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                      : <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className={`font-bold mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        {isCorrect ? "Correct!" : "Incorrect — try again"}
                      </p>
                      <p className="text-white/70 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                {!answerSubmitted ? (
                  <button
                    disabled={selectedAnswer === null}
                    onClick={submitAnswer}
                    className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-[#1F1F1F] disabled:text-white/30 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className={`w-full py-4 font-bold uppercase tracking-widest text-sm rounded-lg transition-colors text-white ${
                      isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isCorrect
                      ? currentQuestionIndex < activeLesson.questions.length - 1 ? "Next Question" : "Complete Lesson"
                      : "Try Again"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── LESSON COMPLETE ───────────────────────────────────────────────────────
  if (showLessonComplete && activeLesson && activePillarCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-6">
            <Check size={48} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Lesson Complete
          </h1>
          <p className="text-white/60 text-lg mb-2">{activeLesson.title}</p>
          <p className="text-[#888888] text-sm mb-8">{questionsCorrect} of {activeLesson.questions.length} answered correctly</p>
          <button
            onClick={closeLesson}
            className="px-8 py-4 bg-[#D22630] hover:bg-[#B01F28] text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  // ─── COURSE COMPLETE ───────────────────────────────────────────────────────
  if (showCourseComplete && activePillarCourse) {
    const genderLabel = gender === "boys" ? "Boys" : "Girls"
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6">
            <Trophy size={56} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Course Complete
          </h1>
          <p className="text-white/70 text-lg mb-2">You finished the {activePillarCourse.tierLabel} {genderLabel} course</p>
          <p className="text-[#888888] text-sm mb-8">Add your name to the BTB Wall of Fame</p>
          {!nameSubmitted ? (
            <div className="space-y-4">
              <input
                type="text"
                value={wallName}
                onChange={(e) => setWallName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg text-white text-base focus:outline-none focus:border-[#D22630]"
              />
              <button
                onClick={submitWallEntry}
                disabled={!wallName.trim()}
                className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-[#1F1F1F] disabled:text-white/30 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
              >
                Add to Wall of Fame
              </button>
              <button onClick={closeLesson} className="w-full py-3 text-white/50 hover:text-white text-sm font-semibold">
                Skip
              </button>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-6">
                <p className="text-emerald-400 font-bold">Welcome to the Wall of Fame, {wallName}!</p>
              </div>
              <button onClick={closeLesson} className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── PILLAR COURSE DETAIL VIEW ─────────────────────────────────────────────
  if (activePillarCourse && !activeLesson) {
    const genderLabel = gender === "boys" ? "Boys" : "Girls"
    const courseProgress = getCourseProgress(activePillarCourse)
    const allPillarLessons = getLessonsByPillar(activePillarCourse, activePillar)
    const pillarLessons = activePosition === "all"
      ? allPillarLessons
      : allPillarLessons.filter((l) => !l.position || l.position === "all" || l.position === activePosition)

    return (
      <div className="min-h-screen bg-black text-white">
        <SEO title={`${activePillarCourse.tierLabel} Academy | BTB`} description={activePillarCourse.description} path="/boys/players" />
        <header className="border-b border-[#1F1F1F] bg-black/90 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setActivePillarCourse(null); setActivePillar("game") }}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={16} /> Academy
            </button>
            <span className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>
              BTB <span className="text-[#D22630]">Academy</span>
            </span>
            <button onClick={handleLogout} className="text-[#888888] hover:text-white text-sm flex items-center gap-1.5">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 bg-gradient-to-r ${TIER_COLORS[activePillarCourse.tier]} text-white`}>
            {activePillarCourse.tierLabel} · {activePillarCourse.ageRange}
          </div>
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
            {genderLabel} {activePillarCourse.tierLabel} Academy
          </h1>
          <p className="text-[#888888] text-lg mb-6">{activePillarCourse.description}</p>

          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#1F1F1F] mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">Overall Progress</span>
              <span className="text-sm font-bold">{courseProgress}%</span>
            </div>
            <ProgressBar pct={courseProgress} colorClass={`bg-gradient-to-r ${TIER_COLORS[activePillarCourse.tier]}`} />
            <p className="text-[#888888] text-xs mt-2">
              {academyProgress[activePillarCourse.id]?.completedLessons.length ?? 0} of {activePillarCourse.lessons.length} lessons complete
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {PILLAR_ORDER.map((pillar) => {
              const config   = PILLAR_CONFIG[pillar]
              const colors   = PILLAR_COLORS[pillar]
              const PIcon    = PILLAR_ICONS[pillar]
              const pProg    = getPillarProgress(activePillarCourse, pillar)
              const pLessons = getLessonsByPillar(activePillarCourse, pillar)
              const pDone    = pLessons.filter((l) => academyProgress[activePillarCourse.id]?.completedLessons.includes(l.id)).length
              const isActive = activePillar === pillar
              return (
                <button
                  key={pillar}
                  onClick={() => { setActivePillar(pillar); setActivePosition("all") }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isActive ? `${colors.bg} ${colors.border} border-2` : "bg-[#0A0A0A] border-[#1F1F1F] hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PIcon size={16} className={isActive ? colors.text : "text-[#888888]"} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? colors.text : "text-[#888888]"}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    <span>{pDone}/{pLessons.length}</span>
                    <span>{pProg}%</span>
                  </div>
                  <ProgressBar pct={pProg} colorClass={`bg-gradient-to-r ${colors.gradient}`} height="h-1" />
                </button>
              )
            })}
          </div>

          <p className="text-[#888888] text-sm mb-5">{PILLAR_CONFIG[activePillar].description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {POSITION_ORDER.map((pos) => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-3 py-1.5 rounded-full text-[0.68rem] font-bold uppercase tracking-[1px] transition-all ${
                  activePosition === pos
                    ? "bg-[#D22630] text-white"
                    : "border border-[#1F1F1F] text-[#888888] hover:text-white/70 hover:border-[#2A2A2A]"
                }`}
              >
                {POSITION_CONFIG[pos].label}
              </button>
            ))}
          </div>

          {pillarLessons.length === 0 && (
            <div className="py-12 text-center border border-[#1F1F1F] rounded-xl bg-[#0A0A0A]">
              <p className="text-[#888888] text-sm">No lessons for this position in this pillar yet.</p>
              <p className="text-white/20 text-xs mt-1">More position-specific content coming soon.</p>
            </div>
          )}

          <div className="space-y-3">
            {pillarLessons.map((lesson) => {
              const globalIdx = activePillarCourse.lessons.findIndex((l) => l.id === lesson.id)
              const unlocked  = isLessonUnlocked(activePillarCourse, globalIdx)
              const completed = academyProgress[activePillarCourse.id]?.completedLessons.includes(lesson.id) ?? false
              const colors    = PILLAR_COLORS[activePillar]
              const pillarIdx = pillarLessons.findIndex((l) => l.id === lesson.id)
              return (
                <button
                  key={lesson.id}
                  onClick={() => unlocked && openLesson(lesson)}
                  disabled={!unlocked}
                  className={`w-full text-left p-5 rounded-xl border transition-all flex items-center gap-4 ${
                    unlocked
                      ? "bg-[#0A0A0A] border-[#1F1F1F] hover:bg-[#141414] hover:border-[#2A2A2A] cursor-pointer"
                      : "bg-[#0A0A0A]/50 border-[#1F1F1F]/50 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="shrink-0">
                    {completed ? (
                      <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <Check size={20} className={colors.text} />
                      </div>
                    ) : !unlocked ? (
                      <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#1F1F1F] flex items-center justify-center">
                        <Lock size={16} className="text-[#888888]" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center font-bold ${colors.text}`}>
                        {pillarIdx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                    <p className="text-[#888888] text-sm mt-0.5">
                      {lesson.videoUrl && <span className="text-[#D22630] mr-2">▶ Video</span>}
                      {lesson.questions.length} question{lesson.questions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {unlocked && <ChevronRight size={18} className="text-[#888888] shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── TAB CONTENT helpers ──────────────────────────────────────────────────

  const firstName = user?.name?.split(" ")[0] ?? "Player"

  // ─── MAIN HUB VIEW ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        :root {
          --btb-black: #000000;
          --btb-graphite: #0A0A0A;
          --btb-charcoal: #141414;
          --btb-steel: #1F1F1F;
          --btb-iron: #2A2A2A;
          --btb-gray: #444444;
          --btb-mute: #888888;
          --btb-success: #00D26A;
          --btb-warning: #FFB800;
          --font-display: Anton, 'Bebas Neue', sans-serif;
        }
      `}</style>

      <SEO
        title="BTB Digital Academy | Player Hub"
        description="BTB Lacrosse digital academy — pillar courses, film study, and development tracking."
        path="/boys/players"
      />

      {/* ── Sticky Topbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-[#1F1F1F]">
        <div className="max-w-[1400px] mx-auto px-6 py-0 flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 bg-[#D22630] flex items-center justify-center font-bold text-white text-sm -skew-x-6 group-hover:scale-105 transition-transform"
              style={{ fontFamily: "'Anton', sans-serif" }}>B</div>
            <span className="font-bold uppercase tracking-wide text-sm text-white hidden sm:block"
              style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>
              BTB <span className="text-[#D22630]">Academy</span>
            </span>
          </button>

          {/* Nav Tabs — horizontal scrollable */}
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 justify-center">
            {([
              { id: "dashboard" as Tab, icon: LayoutDashboard, label: "Dashboard" },
              { id: "academy"   as Tab, icon: GraduationCap,   label: "Academy" },
              { id: "courses"   as Tab, icon: BookOpen,         label: "Courses" },
              { id: "film"      as Tab, icon: Film,             label: "Film Study" },
              { id: "downloads" as Tab, icon: Download,         label: "Downloads" },
              { id: "wof"       as Tab, icon: Trophy,           label: "Wall of Fame" },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-[0.8px] whitespace-nowrap transition-all ${
                  activeTab === id
                    ? "bg-[#D22630] text-white"
                    : "text-[#888888] hover:text-white hover:bg-[#141414]"
                }`}
              >
                <Icon size={13} />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Right: gender toggle + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-0.5 bg-[#141414] rounded-lg p-0.5 border border-[#1F1F1F]">
              {(["boys", "girls"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setAndStoreGender(g)}
                  className={`px-2.5 py-1 rounded text-[0.65rem] font-black uppercase tracking-[1px] transition-all ${
                    gender === g
                      ? "bg-[#D22630] text-white"
                      : "text-[#888888] hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D22630] to-red-700 flex items-center justify-center font-bold text-white text-xs border border-[#1F1F1F]">
              {user?.name?.[0] ?? "P"}
            </div>
            <button onClick={handleLogout} className="text-[#888888] hover:text-white transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Body ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* ── DASHBOARD TAB ──────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div>
            {/* Welcome bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold uppercase leading-none mb-1"
                  style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                  What's up, <span className="text-[#D22630]">{firstName}.</span>
                </h1>
                {user?.gradYear && (
                  <p className="text-[#888888] text-xs uppercase tracking-wider mt-1">Class of {user.gradYear}</p>
                )}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#1F1F1F] rounded-full">
                <span className="text-lg">🔥</span>
                <span className="text-white font-bold text-sm">{streak} Day Streak</span>
              </div>
            </div>

            {/* Progress card */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[#888888] text-[0.65rem] font-bold uppercase tracking-[2px] mb-1">Development Track · Overall Progress</p>
                  <p className="text-4xl font-bold" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>{overallPct}%</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D22630]/10 border border-[#D22630]/30 rounded-lg">
                  <Activity size={14} className="text-[#D22630]" />
                  <span className="text-[#D22630] text-xs font-bold uppercase">Active</span>
                </div>
              </div>
              <ProgressBar pct={overallPct} colorClass="bg-[#D22630]" height="h-2.5" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {[
                  { label: "Lessons Done", value: `${completedLessons}/${totalLessons}` },
                  { label: "Est. Time", value: `${Math.round(completedLessons * 8)} min` },
                  { label: "Courses", value: `${gradCourses.length}` },
                  { label: "Badges", value: `${academyCourses.filter(isCourseComplete).length}` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-white font-bold text-lg">{value}</p>
                    <p className="text-[#888888] text-[0.65rem] uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {[
                { label: "Player IQ",       icon: Brain,          tab: "academy"   as Tab, color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
                { label: "Position School", icon: Target,         tab: "academy"   as Tab, color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
                { label: "Systems",         icon: Zap,            tab: "courses"   as Tab, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
                { label: "Film Study",      icon: Film,           tab: "film"      as Tab, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "Downloads",       icon: Download,       tab: "downloads" as Tab, color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
              ].map(({ label, icon: Icon, tab, color, bg, border }) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(tab)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 ${bg} border ${border} rounded-xl hover:scale-[1.03] transition-all group`}
                >
                  <Icon size={24} className={`${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-white text-xs font-bold uppercase tracking-wide text-center">{label}</span>
                </button>
              ))}
            </div>

            {/* 2-col panel */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Continue Training */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Play size={16} className="text-[#D22630]" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Continue Training</h3>
                </div>
                <div className="space-y-4">
                  {academyCourses.slice(0, 3).map((course) => {
                    const pct = getCourseProgress(course)
                    return (
                      <button
                        key={course.id}
                        onClick={() => { setActivePillarCourse(course); setActivePillar("game") }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#141414] border border-[#1F1F1F] hover:border-[#2A2A2A] transition-all group text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TIER_COLORS[course.tier]} flex items-center justify-center shrink-0`}>
                          <GraduationCap size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">{course.tierLabel} Academy</p>
                          <ProgressBar pct={pct} colorClass="bg-[#D22630]" height="h-1 mt-1.5" />
                        </div>
                        <span className="text-[#888888] text-xs font-bold shrink-0">{pct}%</span>
                        <ChevronRight size={14} className="text-[#888888] group-hover:text-white transition-colors shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={16} className="text-[#D22630]" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {completedLessons === 0 ? (
                    <p className="text-[#888888] text-sm text-center py-6">No activity yet. Start a lesson to track your progress.</p>
                  ) : (
                    academyCourses.flatMap((course) =>
                      (academyProgress[course.id]?.completedLessons ?? []).map((lessonId) => {
                        const lesson = course.lessons.find((l) => l.id === lessonId)
                        return lesson ? { course, lesson } : null
                      }).filter(Boolean)
                    ).slice(-5).reverse().map((item, idx) => {
                      if (!item) return null
                      const colors = PILLAR_COLORS[item.lesson.pillar]
                      return (
                        <div key={idx} className="flex items-center gap-3 py-2">
                          <div className={`w-2 h-2 rounded-full ${colors.text.replace("text-", "bg-")} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{item.lesson.title}</p>
                            <p className="text-[#888888] text-xs">{item.course.tierLabel} Academy</p>
                          </div>
                          <Check size={14} className="text-[#00D26A] shrink-0" />
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACADEMY TAB ────────────────────────────────────────────────── */}
        {activeTab === "academy" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                BTB <span className="text-[#D22630]">Academy</span>
              </h2>
              <p className="text-[#888888] text-sm max-w-xl leading-relaxed">
                Three pillars of development — The Game, Leadership, and Team. Complete your age-tier course to earn a spot on the Wall of Fame.
              </p>
              <div className="flex items-center gap-6 mt-4 text-xs font-bold uppercase tracking-wider text-[#888888]">
                <span className="flex items-center gap-1.5"><Swords size={13} className="text-blue-400" /> The Game</span>
                <span className="flex items-center gap-1.5"><Crown size={13} className="text-amber-400" /> Leadership</span>
                <span className="flex items-center gap-1.5"><Users size={13} className="text-emerald-400" /> Team</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {academyCourses.map((course) => {
                const pct       = getCourseProgress(course)
                const completed = isCourseComplete(course)
                return (
                  <button
                    key={course.id}
                    onClick={() => { setActivePillarCourse(course); setActivePillar("game") }}
                    className="text-left bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl overflow-hidden hover:bg-[#141414] hover:border-[#2A2A2A] transition-all hover:scale-[1.01]"
                  >
                    <div className={`h-28 bg-gradient-to-br ${TIER_COLORS[course.tier]} relative flex items-end p-5`}>
                      {completed && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Trophy size={16} className="text-black" />
                        </div>
                      )}
                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{course.ageRange}</p>
                        <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>
                          {course.tierLabel}
                        </h2>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-[#888888] text-sm mb-3 leading-relaxed">{course.description}</p>
                      <p className="text-white/25 text-xs mb-4">{course.gradYears}</p>

                      <div className="space-y-2 mb-4">
                        {PILLAR_ORDER.map((pillar) => {
                          const pc = PILLAR_COLORS[pillar]
                          const PI = PILLAR_ICONS[pillar]
                          const pl = course.lessons.filter((l) => l.pillar === pillar)
                          const pd = pl.filter((l) => academyProgress[course.id]?.completedLessons.includes(l.id)).length
                          const pp = pl.length > 0 ? Math.round((pd / pl.length) * 100) : 0
                          return (
                            <div key={pillar} className="flex items-center gap-2">
                              <PI size={11} className={pc.text} />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] w-20">{PILLAR_CONFIG[pillar].label}</span>
                              <div className="flex-1 h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${pc.gradient}`} style={{ width: `${pp}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-[#888888] w-6 text-right">{pd}/{pl.length}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-[#888888]">{course.lessons.length} lessons</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-[#1F1F1F] rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${TIER_COLORS[course.tier]}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[0.72rem] font-bold text-[#888888]">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── COURSES TAB ────────────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                My <span className="text-[#D22630]">Courses</span>
              </h2>
              <p className="text-[#888888] text-sm max-w-xl leading-relaxed">
                Film study and skill progression courses for your grad year. Each course walks you through game film, drills, and key concepts.
              </p>
            </div>

            {gradCourses.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-xl p-10 text-center">
                <p className="text-[#888888] text-sm">No courses available yet. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gradCourses.map((course) => {
                  const pct       = getCourseCompletion(course.id, course.steps.length)
                  const started   = pct > 0
                  const completed = pct === 100
                  return (
                    <div
                      key={course.id}
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        completed
                          ? "border-[#D22630]/40 bg-[#D22630]/5"
                          : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#2A2A2A] hover:bg-[#141414]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-base uppercase tracking-wide leading-snug pr-4"
                          style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>
                          {course.title}
                        </h3>
                        {completed && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D22630]/20 flex items-center justify-center">
                            <Trophy size={13} className="text-[#D22630]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#888888] leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-[#888888]">Progress</span>
                          <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-white/60">{pct}%</span>
                        </div>
                        <ProgressBar pct={pct} colorClass="bg-[#D22630]" height="h-[5px]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#888888]">{course.steps.length} steps</span>
                        <button
                          onClick={() => setActiveCourse(course)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-[1.5px] transition-all ${
                            started
                              ? "bg-[#D22630] text-white hover:bg-[#B01F28]"
                              : "border border-[#1F1F1F] text-[#888888] hover:border-[#2A2A2A] hover:text-white"
                          }`}
                        >
                          <Play size={11} />
                          {completed ? "Review" : started ? "Continue" : "Start"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FILM STUDY TAB ─────────────────────────────────────────────── */}
        {activeTab === "film" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                Film <span className="text-[#D22630]">Study</span>
              </h2>
              <p className="text-[#888888] text-sm mb-5">
                Watch, analyze, and learn from game footage with guided coaching points.
              </p>
              {/* Position filter */}
              <div className="flex flex-wrap gap-2">
                {FILM_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setFilmPositionFilter(pos)}
                    className={`px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-[1px] transition-all ${
                      filmPositionFilter === pos
                        ? "bg-[#D22630] text-white"
                        : "border border-[#1F1F1F] text-[#888888] hover:text-white hover:border-[#2A2A2A]"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {filteredFilmClips.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-xl p-10 text-center">
                <Film size={32} className="text-[#888888] mx-auto mb-3" />
                <p className="text-[#888888] text-sm">No clips for this filter.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFilmClips.map((clip) => {
                  const videoId = clip.videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
                  const thumbUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    : null
                  return (
                    <a
                      key={clip.id}
                      href={clip.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl overflow-hidden hover:border-[#D22630]/50 transition-all hover:scale-[1.02]"
                    >
                      {/* 16:9 thumbnail */}
                      <div className="relative w-full bg-[#141414]" style={{ paddingBottom: "56.25%" }}>
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={clip.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Film size={32} className="text-[#888888]" />
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#D22630] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-white ml-1" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[0.6rem] font-bold text-white">
                          {clip.duration} min
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold text-sm mb-1 leading-snug">{clip.title}</h3>
                        <p className="text-[#888888] text-xs leading-relaxed line-clamp-2">{clip.description}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DOWNLOADS TAB ──────────────────────────────────────────────── */}
        {activeTab === "downloads" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                <span className="text-[#D22630]">Downloads</span>
              </h2>
              <p className="text-[#888888] text-sm mb-5">
                Playbooks, drill sheets, mental performance guides, and recruiting resources.
              </p>
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {(["All", ...DOWNLOAD_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDownloadCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-[1px] transition-all ${
                      downloadCategory === cat
                        ? "bg-[#D22630] text-white"
                        : "border border-[#1F1F1F] text-[#888888] hover:text-white hover:border-[#2A2A2A]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDownloads.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group flex items-center gap-4 p-5 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl hover:border-[#D22630]/40 hover:bg-[#141414] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#D22630]/10 border border-[#D22630]/20 flex items-center justify-center shrink-0 group-hover:bg-[#D22630]/20 transition-colors">
                    <FileText size={22} className="text-[#D22630]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-snug mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[0.58rem] font-bold uppercase tracking-wider border ${CATEGORY_COLORS[item.category as DownloadCategory]}`}>
                        {item.category}
                      </span>
                      <span className="text-[#888888] text-[0.65rem]">{item.size}</span>
                    </div>
                  </div>
                  <Download size={18} className="text-[#888888] group-hover:text-[#D22630] shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── WALL OF FAME TAB ───────────────────────────────────────────── */}
        {activeTab === "wof" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                Wall of <span className="text-[#D22630]">Fame</span>
              </h2>
              <p className="text-[#888888] text-sm max-w-xl leading-relaxed">
                Players who completed a full BTB Academy course. Finish your age-tier course to earn your spot.
              </p>
            </div>

            {wallEntries.length === 0 ? (
              <div className="border border-[#1F1F1F] bg-[#0A0A0A] rounded-xl p-12 text-center">
                <Trophy size={36} className="text-[#888888] mx-auto mb-4" />
                <p className="text-[#888888] text-sm">No entries yet. Be the first to complete a course.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wallEntries.map((entry, i) => (
                  <div key={i} className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-5 flex items-center gap-4 hover:border-[#2A2A2A] transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${TIER_COLORS[(entry.tier as AgeTier)] || TIER_COLORS.youth}`}>
                      <Trophy size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{entry.name}</p>
                      <p className="text-[#888888] text-xs mt-0.5">
                        {entry.tier === "youth" ? "Youth" : entry.tier === "middle" ? "Middle School" : "High School"}
                        {entry.completedAt && <span className="ml-2 text-white/20">{entry.completedAt}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
