/**
 * PlayerHubPage — unified Academy Hub.
 *
 * Single entry point for all player learning:
 *   Tab 1: BTB Academy  — pillar courses (game / leadership / team) with quizzes
 *   Tab 2: My Courses   — grad-year film & drill courses
 *   Tab 3: Wall of Fame — players who completed a full Academy course
 *
 * Replaces the old split between /boys/players and /boys/academy.
 */

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useProgress } from "@/hooks/useProgress"
import { getCourses, getCoursesByGradYear } from "@/lib/courseData"
import { CourseView } from "@/components/hubs/players/CourseView"
import { SEO } from "@/components/shared/SEO"
import {
  getAcademyCourses,
  getAcademyCoursesWithPositions,
  getAcademyProgress,
  markLessonComplete,
  markCourseComplete,
  getWallOfFame,
  addToWallOfFame,
  syncProgressFromServer,
  PILLAR_CONFIG,
  PILLAR_ORDER,
  type AcademyCourse,
  type AcademyLesson,
  type WallOfFameEntry,
  type AgeTier,
  type Pillar,
  type AcademyProgress,
  type Position,
  POSITION_CONFIG,
  POSITION_ORDER,
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
} from "lucide-react"
import type { Gender, Course } from "@/types"

// ─── Constants ────────────────────────────────────────────────────────

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

type Tab = "academy" | "courses" | "wof"

// ─── Component ────────────────────────────────────────────────────────

export function PlayerHubPage({ gender }: { gender: Gender }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { getCourseCompletion } = useProgress(user?.id ?? "")

  const label = gender === "boys" ? "Boys" : "Girls"

  // ── Tab state ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("academy")

  // ── Grad-year courses ───────────────────────────────────────────────
  const gradCourses = useMemo(() => {
    if (user?.gradYear) return getCoursesByGradYear(gender, user.gradYear)
    return getCourses(gender)
  }, [gender, user?.gradYear])
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  // ── Academy (pillar courses) ─────────────────────────────────────────
  const academyCourses = useMemo(() => getAcademyCoursesWithPositions(gender), [gender])
  const [academyProgress, setAcademyProgress] = useState<AcademyProgress>(getAcademyProgress())
  const [activePillarCourse, setActivePillarCourse] = useState<AcademyCourse | null>(null)
  const [activePillar, setActivePillar] = useState<Pillar>("game")
  const [activePosition, setActivePosition] = useState<Position>("all")
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null)

  // ── Quiz state ───────────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [questionsCorrect, setQuestionsCorrect] = useState(0)
  const [showLessonComplete, setShowLessonComplete] = useState(false)
  const [showCourseComplete, setShowCourseComplete] = useState(false)

  // ── Wall of Fame ─────────────────────────────────────────────────────
  const [wallEntries, setWallEntries] = useState<WallOfFameEntry[]>([])
  const [wallName, setWallName] = useState("")
  const [nameSubmitted, setNameSubmitted] = useState(false)

  // ── On mount: sync progress + load WoF ──────────────────────────────
  useEffect(() => {
    if (user?.id) {
      syncProgressFromServer(user.id).then(setAcademyProgress)
    }
    getWallOfFame().then(setWallEntries)
  }, [user?.id])

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  // ─── Academy helpers ─────────────────────────────────────────────────

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

  // ─── COURSE DETAIL VIEW (grad-year courses) ───────────────────────
  if (activeCourse && user) {
    return (
      <CourseView
        course={activeCourse}
        userId={user.id}
        onBack={() => setActiveCourse(null)}
      />
    )
  }

  // ─── LESSON VIEW ─────────────────────────────────────────────────
  if (activeLesson && activePillarCourse && !showLessonComplete && !showCourseComplete) {
    const currentQuestion = activeLesson.questions[currentQuestionIndex]
    const isCorrect = answerSubmitted && selectedAnswer === currentQuestion.correctAnswer
    const isWrong   = answerSubmitted && selectedAnswer !== currentQuestion.correctAnswer
    const TopicIcon = TOPIC_ICONS[activeLesson.topic]

    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={closeLesson}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={16} /> Back to Course
            </button>
            <span className="text-white/30 text-xs font-bold uppercase tracking-wider">
              Question {currentQuestionIndex + 1} / {activeLesson.questions.length}
            </span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Topic badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${TOPIC_COLORS[activeLesson.topic]} mb-4`}>
            <TopicIcon size={11} /> {activeLesson.topic}
          </span>

          <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
            {activeLesson.title}
          </h1>

          {/* Video */}
          {activeLesson.videoUrl && (() => {
            const videoId = activeLesson.videoUrl?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
            return videoId ? (
              <div className="mb-10">
                <div className="relative w-full rounded-xl overflow-hidden border border-white/10" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-white/30 text-xs mt-2 text-center uppercase tracking-wider">Watch the video, then answer below</p>
              </div>
            ) : null
          })()}

          {/* Reading content */}
          <div className="mb-10">
            {activeLesson.description.split("\n\n").map((para, i) => (
              <p key={i} className="text-white/75 leading-relaxed mb-4 text-base">{para}</p>
            ))}
          </div>

          {/* Quiz */}
          <div className="border-t border-white/10 pt-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-white">{currentQuestion.question}</h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const sel      = selectedAnswer === idx
                  const correct  = answerSubmitted && idx === currentQuestion.correctAnswer
                  const wrong    = answerSubmitted && sel && idx !== currentQuestion.correctAnswer
                  return (
                    <button
                      key={idx}
                      disabled={answerSubmitted}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${
                        correct ? "bg-emerald-500/20 border-emerald-500/60 text-white"
                        : wrong  ? "bg-red-500/20 border-red-500/60 text-white"
                        : sel    ? "bg-[#D22630]/20 border-[#D22630] text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
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

              {/* Feedback */}
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
                    className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-white/10 disabled:text-white/30 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
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

  // ─── LESSON COMPLETE ────────────────────────────────────────────────
  if (showLessonComplete && activeLesson && activePillarCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-6">
            <Check size={48} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Lesson Complete
          </h1>
          <p className="text-white/60 text-lg mb-2">{activeLesson.title}</p>
          <p className="text-white/40 text-sm mb-8">{questionsCorrect} of {activeLesson.questions.length} answered correctly</p>
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

  // ─── COURSE COMPLETE ────────────────────────────────────────────────
  if (showCourseComplete && activePillarCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6">
            <Trophy size={56} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Course Complete
          </h1>
          <p className="text-white/70 text-lg mb-2">You finished the {activePillarCourse.tierLabel} {label} course</p>
          <p className="text-white/40 text-sm mb-8">Add your name to the BTB Wall of Fame</p>
          {!nameSubmitted ? (
            <div className="space-y-4">
              <input
                type="text"
                value={wallName}
                onChange={(e) => setWallName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:outline-none focus:border-[#D22630]"
              />
              <button
                onClick={submitWallEntry}
                disabled={!wallName.trim()}
                className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-white/10 disabled:text-white/30 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
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

  // ─── PILLAR COURSE DETAIL VIEW ───────────────────────────────────────
  if (activePillarCourse && !activeLesson) {
    const courseProgress = getCourseProgress(activePillarCourse)
    const allPillarLessons = getLessonsByPillar(activePillarCourse, activePillar)
    const pillarLessons = activePosition === "all"
      ? allPillarLessons
      : allPillarLessons.filter((l) => !l.position || l.position === "all" || l.position === activePosition)

    return (
      <div className="min-h-screen bg-black text-white">
        <SEO title={`${activePillarCourse.tierLabel} Academy | BTB ${label}`} description={activePillarCourse.description} path={`/${gender}/players`} />
        <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setActivePillarCourse(null); setActivePillar("game") }}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={16} /> Academy
            </button>
            <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm flex items-center gap-1.5">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Course header */}
          <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 bg-gradient-to-r ${TIER_COLORS[activePillarCourse.tier]} text-white`}>
            {activePillarCourse.tierLabel} · {activePillarCourse.ageRange}
          </div>
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
            {label} {activePillarCourse.tierLabel} Academy
          </h1>
          <p className="text-white/50 text-lg mb-6">{activePillarCourse.description}</p>

          {/* Overall progress */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Overall Progress</span>
              <span className="text-sm font-bold">{courseProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${TIER_COLORS[activePillarCourse.tier]} transition-all duration-700`} style={{ width: `${courseProgress}%` }} />
            </div>
            <p className="text-white/30 text-xs mt-2">
              {academyProgress[activePillarCourse.id]?.completedLessons.length ?? 0} of {activePillarCourse.lessons.length} lessons complete
            </p>
          </div>

          {/* Pillar tabs */}
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
                    isActive ? `${colors.bg} ${colors.border} border-2` : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PIcon size={16} className={isActive ? colors.text : "text-white/40"} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? colors.text : "text-white/40"}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">
                    <span>{pDone}/{pLessons.length}</span>
                    <span>{pProg}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`} style={{ width: `${pProg}%` }} />
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-white/40 text-sm mb-5">{PILLAR_CONFIG[activePillar].description}</p>

          {/* Position filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {POSITION_ORDER.map((pos) => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-3 py-1.5 rounded-full text-[0.68rem] font-bold uppercase tracking-[1px] transition-all ${
                  activePosition === pos
                    ? "bg-[#D22630] text-white"
                    : "border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25"
                }`}
              >
                {POSITION_CONFIG[pos].label}
              </button>
            ))}
          </div>

          {pillarLessons.length === 0 && (
            <div className="py-12 text-center border border-white/[0.06] rounded-xl bg-white/[0.02]">
              <p className="text-white/30 text-sm">No lessons for this position in this pillar yet.</p>
              <p className="text-white/20 text-xs mt-1">More position-specific content coming soon.</p>
            </div>
          )}

          {/* Lessons */}
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
                      ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                      : "bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="shrink-0">
                    {completed ? (
                      <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                        <Check size={20} className={colors.text} />
                      </div>
                    ) : !unlocked ? (
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Lock size={16} className="text-white/20" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center font-bold ${colors.text}`}>
                        {pillarIdx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                    <p className="text-white/40 text-sm mt-0.5">
                      {lesson.videoUrl && <span className="text-[#D22630] mr-2">▶ Video</span>}
                      {lesson.questions.length} question{lesson.questions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {unlocked && <ChevronRight size={18} className="text-white/20 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN HUB VIEW ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Players Hub | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label.toLowerCase()} academy — courses, film study, and development tracking.`}
        path={`/${gender}/players`}
      />

      {/* Fixed Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-3">
          <button
            onClick={() => navigate(`/${gender}`)}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px]"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="font-display text-[1.1rem] uppercase tracking-wide">
            BTB <span className="text-[#D22630]">{label}</span> Academy
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px]"
          >
            Logout <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 pt-24 pb-24">

        {/* Welcome */}
        <div className="mb-10">
          <div className="text-[0.62rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-3">Player Academy</div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-wide leading-[0.92] mb-3">
            Welcome back, <span className="text-[#D22630]">{user?.name?.split(" ")[0] ?? "Player"}</span>
          </h1>
          <p className="text-[0.85rem] text-white/35 max-w-[480px] leading-relaxed">
            Your full development hub — pillar courses, film study, and progress tracking all in one place.
            {user?.gradYear && <span className="ml-2 text-white/20">Class of {user.gradYear}</span>}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
          {[
            { id: "academy" as Tab, icon: GraduationCap, label: "BTB Academy" },
            { id: "courses"  as Tab, icon: BookOpen,      label: "My Courses" },
            { id: "wof"      as Tab, icon: Trophy,         label: "Wall of Fame" },
          ].map(({ id, icon: Icon, label: tabLabel }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.75rem] font-bold uppercase tracking-[1px] transition-all ${
                activeTab === id
                  ? "bg-[#D22630] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={14} />
              {tabLabel}
            </button>
          ))}
        </div>

        {/* ── TAB: BTB Academy ────────────────────────────────────────── */}
        {activeTab === "academy" && (
          <div>
            <div className="mb-8">
              <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                Three pillars of development — The Game, Leadership, and Team. Complete your age-tier course to earn a spot on the Wall of Fame.
              </p>
              <div className="flex items-center gap-6 mt-4 text-xs font-bold uppercase tracking-wider text-white/30">
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
                    className="text-left bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.14] transition-all hover:scale-[1.01]"
                  >
                    {/* Header band */}
                    <div className={`h-28 bg-gradient-to-br ${TIER_COLORS[course.tier]} relative flex items-end p-5`}>
                      {completed && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Trophy size={16} className="text-black" />
                        </div>
                      )}
                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">{course.ageRange}</p>
                        <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                          {course.tierLabel}
                        </h2>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-white/50 text-sm mb-3 leading-relaxed">{course.description}</p>
                      <p className="text-white/25 text-xs mb-4">{course.gradYears}</p>

                      {/* Per-pillar mini-progress */}
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
                              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-20">{PILLAR_CONFIG[pillar].label}</span>
                              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${pc.gradient}`} style={{ width: `${pp}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-white/30 w-6 text-right">{pd}/{pl.length}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-white/30">{course.lessons.length} lessons</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${TIER_COLORS[course.tier]}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[0.72rem] font-bold text-white/50">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TAB: My Courses ─────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div>
            <div className="mb-8">
              <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                Film study and skill progression courses for your grad year. Each course walks you through game film, drills, and key concepts with check-ins.
              </p>
            </div>

            {gradCourses.length === 0 ? (
              <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-10 text-center">
                <p className="text-white/30 text-[0.88rem]">No courses available yet. Check back soon.</p>
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
                      className={`group p-6 rounded-xl border transition-all duration-300 ${
                        completed
                          ? "border-[#D22630]/40 bg-[#D22630]/5"
                          : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-display text-[1rem] uppercase tracking-wide leading-snug pr-4">{course.title}</h3>
                        {completed && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#D22630]/20 flex items-center justify-center">
                            <Trophy size={13} className="text-[#D22630]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[0.78rem] text-white/30 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-white/20">Progress</span>
                          <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-white/40">{pct}%</span>
                        </div>
                        <div className="h-[5px] bg-white/[0.08] rounded-full overflow-hidden">
                          <div className="h-full bg-[#D22630] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.7rem] text-white/20">{course.steps.length} steps</span>
                        <button
                          onClick={() => setActiveCourse(course)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-[1.5px] transition-all ${
                            started
                              ? "bg-[#D22630] text-white hover:bg-[#B01F28]"
                              : "border border-white/15 text-white/50 hover:border-white/40 hover:text-white"
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

        {/* ── TAB: Wall of Fame ───────────────────────────────────────── */}
        {activeTab === "wof" && (
          <div>
            <div className="mb-8">
              <p className="text-white/40 text-sm max-w-xl leading-relaxed">
                Players who completed a full BTB Academy course. Finish your age-tier course to earn your spot.
              </p>
            </div>

            {wallEntries.length === 0 ? (
              <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-12 text-center">
                <Trophy size={36} className="text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">No entries yet. Be the first to complete a course.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {wallEntries.map((entry, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${TIER_COLORS[entry.tier as AgeTier] || TIER_COLORS.youth}`}>
                      <Trophy size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{entry.name}</p>
                      <p className="text-white/30 text-xs mt-0.5">
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
