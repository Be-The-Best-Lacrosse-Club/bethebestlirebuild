import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  getAcademyCourses,
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
} from "@/lib/academyData"
import {
  ArrowLeft,
  LogOut,
  Lock,
  Check,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  GraduationCap,
  BookOpen,
  Brain,
  Target,
  Heart,
  Users,
  Swords,
  Crown,
  Play,
} from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import type { Gender } from "@/types"

const TOPIC_ICONS: Record<string, typeof BookOpen> = {
  Fundamentals: Target,
  "Lacrosse IQ": Brain,
  "Mental Game": Heart,
  Character: Award,
}

const TOPIC_COLORS: Record<string, string> = {
  Fundamentals: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Lacrosse IQ": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "Mental Game": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Character: "text-amber-400 bg-amber-500/10 border-amber-500/30",
}

const PILLAR_ICONS: Record<Pillar, typeof BookOpen> = {
  game: Swords,
  leadership: Crown,
  team: Users,
}

const PILLAR_COLORS: Record<Pillar, { gradient: string; text: string; bg: string; border: string }> = {
  game: { gradient: "from-blue-500 to-blue-700", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  leadership: { gradient: "from-amber-500 to-amber-700", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  team: { gradient: "from-emerald-500 to-emerald-700", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
}

const TIER_COLORS: Record<AgeTier, string> = {
  youth: "from-emerald-500 to-emerald-700",
  middle: "from-blue-500 to-blue-700",
  high: "from-[#D22630] to-[#8B0000]",
}

export function AcademyElearningPage({ gender }: { gender: Gender }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const courses = useMemo(() => getAcademyCourses(gender), [gender])
  const label = gender === "boys" ? "Boys" : "Girls"

  const [progress, setProgress] = useState(getAcademyProgress())
  const [activeCourse, setActiveCourse] = useState<AcademyCourse | null>(null)
  const [activePillar, setActivePillar] = useState<Pillar>("game")
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [questionsCorrect, setQuestionsCorrect] = useState(0)
  const [showLessonComplete, setShowLessonComplete] = useState(false)
  const [showCourseComplete, setShowCourseComplete] = useState(false)
  const [wallEntries, setWallEntries] = useState<WallOfFameEntry[]>([])
  const [wallName, setWallName] = useState("")
  const [nameSubmitted, setNameSubmitted] = useState(false)

  // On mount: sync progress from server + load wall of fame
  useEffect(() => {
    if (user?.id) {
      syncProgressFromServer(user.id).then((serverProgress) => {
        setProgress(serverProgress)
      })
    }
    getWallOfFame().then((entries) => setWallEntries(entries))
  }, [user?.id])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // Get lessons filtered by pillar
  const getLessonsByPillar = (course: AcademyCourse, pillar: Pillar): AcademyLesson[] => {
    return course.lessons.filter((l) => l.pillar === pillar)
  }

  // Check if a lesson is unlocked (sequential within its pillar, parallel across pillars)
  const isLessonUnlocked = (course: AcademyCourse, lessonIndex: number): boolean => {
    const lesson = course.lessons[lessonIndex]
    const pillarLessons = getLessonsByPillar(course, lesson.pillar)
    const pillarIndex = pillarLessons.findIndex((l) => l.id === lesson.id)
    if (pillarIndex === 0) return true
    const prevInPillar = pillarLessons[pillarIndex - 1]
    return progress[course.id]?.completedLessons.includes(prevInPillar.id) ?? false
  }

  // Check if a course is complete
  const isCourseComplete = (course: AcademyCourse): boolean => {
    const completed = progress[course.id]?.completedLessons ?? []
    return course.lessons.every((l) => completed.includes(l.id))
  }

  // Get course progress percentage
  const getCourseProgress = (course: AcademyCourse): number => {
    const completed = progress[course.id]?.completedLessons.length ?? 0
    return Math.round((completed / course.lessons.length) * 100)
  }

  // Open a lesson
  const openLesson = (lesson: AcademyLesson) => {
    setActiveLesson(lesson)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswerSubmitted(false)
    setQuestionsCorrect(0)
    setShowLessonComplete(false)
  }

  // Submit an answer
  const submitAnswer = () => {
    if (selectedAnswer === null || !activeLesson) return
    setAnswerSubmitted(true)
    const correct = activeLesson.questions[currentQuestionIndex].correctAnswer === selectedAnswer
    if (correct) {
      setQuestionsCorrect(questionsCorrect + 1)
    }
  }

  // Go to next question or complete lesson
  const nextQuestion = () => {
    if (!activeLesson || !activeCourse) return
    const isCorrect = activeLesson.questions[currentQuestionIndex].correctAnswer === selectedAnswer

    if (!isCorrect) {
      // Wrong answer — must retry the question
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
      return
    }

    // Correct — move to next question or finish lesson
    if (currentQuestionIndex < activeLesson.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setAnswerSubmitted(false)
    } else {
      // Lesson complete
      markLessonComplete(activeCourse.id, activeLesson.id, user?.id)
      const newProgress = getAcademyProgress()
      setProgress(newProgress)
      setShowLessonComplete(true)

      // Check if course is now complete
      const completedAll = activeCourse.lessons.every(
        (l) => newProgress[activeCourse.id]?.completedLessons.includes(l.id),
      )
      if (completedAll && !newProgress[activeCourse.id]?.completedAt) {
        markCourseComplete(activeCourse.id, user?.id)
        setTimeout(() => {
          setShowCourseComplete(true)
          setShowLessonComplete(false)
        }, 1500)
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
    if (!wallName.trim() || !activeCourse) return
    addToWallOfFame(wallName.trim(), gender, activeCourse.tier, activeCourse.id).then(() => {
      getWallOfFame().then((entries) => setWallEntries(entries))
    })
    setNameSubmitted(true)
  }

  // ─── COURSE DETAIL VIEW ────────────────────────────────────────────
  if (activeCourse && !activeLesson && !showCourseComplete) {
    const courseProgress = getCourseProgress(activeCourse)
    const pillarLessons = getLessonsByPillar(activeCourse, activePillar)

    // Per-pillar progress
    const getPillarProgress = (pillar: Pillar) => {
      const lessons = getLessonsByPillar(activeCourse, pillar)
      const completed = lessons.filter((l) => progress[activeCourse.id]?.completedLessons.includes(l.id)).length
      return lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0
    }

    return (
      <div className="min-h-screen bg-black text-white">
        <SEO title={`${activeCourse.tierLabel} Academy | BTB ${label}`} description={activeCourse.description} path={`/${gender}/academy`} />

        {/* Header */}
        <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => { setActiveCourse(null); setActivePillar("game") }}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={18} /> All Courses
            </button>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">{user?.name}</span>
              <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm flex items-center gap-1.5">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Course header */}
          <div className="mb-8">
            <div className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-4 bg-gradient-to-r ${TIER_COLORS[activeCourse.tier]} text-white`}>
              {activeCourse.tierLabel} · {activeCourse.ageRange}
            </div>
            <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
              {label} {activeCourse.tierLabel} Academy
            </h1>
            <p className="text-white/60 text-lg mb-2">{activeCourse.description}</p>
            <p className="text-white/40 text-sm mb-6">{activeCourse.gradYears}</p>

            {/* Overall progress bar */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/60">Overall Progress</span>
                <span className="text-sm font-bold">{courseProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${TIER_COLORS[activeCourse.tier]} transition-all duration-700`}
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <p className="text-white/40 text-xs mt-2">
                {progress[activeCourse.id]?.completedLessons.length ?? 0} of {activeCourse.lessons.length} lessons complete
              </p>
            </div>
          </div>

          {/* Pillar tabs */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {PILLAR_ORDER.map((pillar) => {
              const config = PILLAR_CONFIG[pillar]
              const colors = PILLAR_COLORS[pillar]
              const PillarIcon = PILLAR_ICONS[pillar]
              const pillarProg = getPillarProgress(pillar)
              const isActive = activePillar === pillar
              const pillarCount = getLessonsByPillar(activeCourse, pillar).length
              const pillarCompleted = getLessonsByPillar(activeCourse, pillar).filter(
                (l) => progress[activeCourse.id]?.completedLessons.includes(l.id)
              ).length

              return (
                <button
                  key={pillar}
                  onClick={() => setActivePillar(pillar)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? `${colors.bg} ${colors.border} border-2`
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PillarIcon size={18} className={isActive ? colors.text : "text-white/50"} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? colors.text : "text-white/50"}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    <span>{pillarCompleted}/{pillarCount}</span>
                    <span>{pillarProg}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                      style={{ width: `${pillarProg}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active pillar description */}
          <div className="mb-6">
            <p className="text-white/50 text-sm">{PILLAR_CONFIG[activePillar].description}</p>
          </div>

          {/* Pillar lessons list */}
          <div className="space-y-3">
            {pillarLessons.map((lesson, pillarIdx) => {
              const globalIdx = activeCourse.lessons.findIndex((l) => l.id === lesson.id)
              const unlocked = isLessonUnlocked(activeCourse, globalIdx)
              const completed = progress[activeCourse.id]?.completedLessons.includes(lesson.id) ?? false
              const colors = PILLAR_COLORS[activePillar]

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
                        <Lock size={18} className="text-white/30" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center font-bold ${colors.text}`}>
                        {pillarIdx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                    <p className="text-white/50 text-sm mt-0.5 flex items-center gap-2">
                      {lesson.videoUrl && <span className="inline-flex items-center gap-1 text-[#D22630]"><Play size={11} fill="currentColor" /> Video</span>}
                      {lesson.videoUrl && <span className="text-white/20">+</span>}
                      {lesson.questions.length} question{lesson.questions.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {unlocked && <ChevronRight size={20} className="text-white/30" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── LESSON VIEW ───────────────────────────────────────────────────
  if (activeLesson && activeCourse && !showLessonComplete && !showCourseComplete) {
    const currentQuestion = activeLesson.questions[currentQuestionIndex]
    const isCorrect = answerSubmitted && selectedAnswer === currentQuestion.correctAnswer
    const isWrong = answerSubmitted && selectedAnswer !== currentQuestion.correctAnswer
    const TopicIcon = TOPIC_ICONS[activeLesson.topic]

    return (
      <div className="min-h-screen bg-black text-white">
        <SEO title={`${activeLesson.title} | BTB ${label} Academy`} description={activeLesson.title} path={`/${gender}/academy`} />

        {/* Header */}
        <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={closeLesson}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft size={18} /> Back to Course
            </button>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
              Lesson {activeLesson.lessonNumber} of {activeCourse.lessons.length}
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Lesson header */}
          <div className="mb-8">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${TOPIC_COLORS[activeLesson.topic]} mb-4`}>
              <TopicIcon size={11} /> {activeLesson.topic}
            </span>
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
              {activeLesson.title}
            </h1>
          </div>

          {/* Video (if available) */}
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
                <p className="text-white/30 text-xs mt-2 text-center uppercase tracking-wider">Watch the video, then answer the questions below</p>
              </div>
            ) : null
          })()}

          {/* Reading content */}
          <div className="prose prose-invert max-w-none mb-12">
            {activeLesson.description.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-white/80 leading-relaxed mb-4 text-base">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Quiz section */}
          <div className="border-t border-white/10 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
                Question {currentQuestionIndex + 1} of {activeLesson.questions.length}
              </h2>
              <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                Must answer correctly to advance
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6 text-white">{currentQuestion.question}</h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx
                  const isCorrectAnswer = idx === currentQuestion.correctAnswer
                  const showCorrect = answerSubmitted && isCorrectAnswer
                  const showWrong = answerSubmitted && isSelected && !isCorrectAnswer

                  return (
                    <button
                      key={idx}
                      disabled={answerSubmitted}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3 ${
                        showCorrect
                          ? "bg-emerald-500/20 border-emerald-500/60 text-white"
                          : showWrong
                          ? "bg-red-500/20 border-red-500/60 text-white"
                          : isSelected
                          ? "bg-[#D22630]/20 border-[#D22630] text-white"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80"
                      } ${answerSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          showCorrect
                            ? "border-emerald-400 bg-emerald-400"
                            : showWrong
                            ? "border-red-400 bg-red-400"
                            : isSelected
                            ? "border-[#D22630] bg-[#D22630]"
                            : "border-white/30"
                        }`}
                      >
                        {showCorrect && <Check size={14} className="text-black" />}
                        {showWrong && <XCircle size={14} className="text-black" />}
                        {!answerSubmitted && isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-base">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              {answerSubmitted && (
                <div
                  className={`mt-6 p-4 rounded-lg border ${
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-bold mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        {isCorrect ? "Correct!" : "Incorrect — try again"}
                      </p>
                      <p className="text-white/70 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="mt-6">
                {!answerSubmitted ? (
                  <button
                    disabled={selectedAnswer === null}
                    onClick={submitAnswer}
                    className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-bold uppercase tracking-[1.5px] text-sm rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className={`w-full py-4 font-bold uppercase tracking-[1.5px] text-sm rounded-lg transition-colors text-white ${
                      isCorrect
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isCorrect
                      ? currentQuestionIndex < activeLesson.questions.length - 1
                        ? "Next Question"
                        : "Complete Lesson"
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

  // ─── LESSON COMPLETE OVERLAY ──────────────────────────────────────
  if (showLessonComplete && activeLesson && activeCourse) {
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
            onClick={() => {
              setActiveLesson(null)
              setShowLessonComplete(false)
            }}
            className="px-8 py-4 bg-[#D22630] hover:bg-[#B01F28] text-white font-bold uppercase tracking-[1.5px] text-sm rounded-lg transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  // ─── COURSE COMPLETE OVERLAY ──────────────────────────────────────
  if (showCourseComplete && activeCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-6">
            <Trophy size={56} className="text-black" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Course Complete
          </h1>
          <p className="text-white/70 text-lg mb-2">
            You finished the {activeCourse.tierLabel} {label} course
          </p>
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
                className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-white/10 disabled:text-white/30 text-white font-bold uppercase tracking-[1.5px] text-sm rounded-lg transition-colors"
              >
                Add to Wall of Fame
              </button>
              <button
                onClick={closeLesson}
                className="w-full py-3 text-white/50 hover:text-white text-sm font-semibold"
              >
                Skip
              </button>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-6">
                <p className="text-emerald-400 font-bold">Welcome to the Wall of Fame, {wallName}!</p>
              </div>
              <button
                onClick={closeLesson}
                className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] text-white font-bold uppercase tracking-[1.5px] text-sm rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── COURSES LIST (DEFAULT VIEW) ──────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title={`${label} Academy | BTB Lacrosse`} description={`BTB ${label} Academy — courses for every age group`} path={`/${gender}/academy`} />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/${gender}/players`)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={18} /> Player Hub
          </button>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm hidden sm:block">{user?.name}</span>
            <button onClick={handleLogout} className="text-white/50 hover:text-white text-sm flex items-center gap-1.5">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D22630]/10 border border-[#D22630]/30 mb-6">
            <GraduationCap size={32} className="text-[#D22630]" />
          </div>
          <h1 className="text-6xl font-bold mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
            BTB {label} Academy
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-6">
            Three pillars of development: learn the game, build leadership, and understand what makes teams win.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-white/40">
            <span className="flex items-center gap-1.5"><Swords size={14} className="text-blue-400" /> The Game</span>
            <span className="flex items-center gap-1.5"><Crown size={14} className="text-amber-400" /> Leadership</span>
            <span className="flex items-center gap-1.5"><Users size={14} className="text-emerald-400" /> Team</span>
          </div>
        </div>

        {/* Course tiles */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {courses.map((course) => {
            const courseProgress = getCourseProgress(course)
            const completed = isCourseComplete(course)

            return (
              <button
                key={course.id}
                onClick={() => setActiveCourse(course)}
                className="text-left bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
              >
                <div className={`h-32 bg-gradient-to-br ${TIER_COLORS[course.tier]} relative flex items-end p-5`}>
                  {completed && (
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center">
                      <Trophy size={18} className="text-black" />
                    </div>
                  )}
                  <div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{course.ageRange}</p>
                    <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
                      {course.tierLabel}
                    </h2>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">{course.description}</p>
                  <p className="text-white/40 text-xs mb-4">{course.gradYears}</p>

                  {/* Pillar mini-progress */}
                  <div className="space-y-2 mb-4">
                    {PILLAR_ORDER.map((pillar) => {
                      const PIcon = PILLAR_ICONS[pillar]
                      const pColors = PILLAR_COLORS[pillar]
                      const pLessons = course.lessons.filter((l) => l.pillar === pillar)
                      const pDone = pLessons.filter((l) => progress[course.id]?.completedLessons.includes(l.id)).length
                      const pProg = pLessons.length > 0 ? Math.round((pDone / pLessons.length) * 100) : 0
                      return (
                        <div key={pillar} className="flex items-center gap-2">
                          <PIcon size={12} className={pColors.text} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 w-20">{PILLAR_CONFIG[pillar].label}</span>
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${pColors.gradient} transition-all`} style={{ width: `${pProg}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-white/40 w-6 text-right">{pDone}/{pLessons.length}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-white/50">{course.lessons.length} Lessons</span>
                    <span className="text-white/80">{courseProgress}%</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Wall of Fame */}
        <div className="border-t border-white/10 pt-12">
          <div className="text-center mb-8">
            <Trophy size={32} className="text-yellow-400 inline-block mb-3" />
            <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
              Wall of Fame
            </h2>
            <p className="text-white/50 text-sm">Players who have completed BTB Academy courses</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {wallEntries.map((entry, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${TIER_COLORS[entry.tier]}`}>
                  <Trophy size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{entry.name}</p>
                  <p className="text-white/40 text-xs">{entry.tier === "youth" ? "Youth" : entry.tier === "middle" ? "Middle School" : "High School"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
