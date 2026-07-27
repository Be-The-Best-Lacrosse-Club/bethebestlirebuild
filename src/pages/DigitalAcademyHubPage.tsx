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
  getPositionOrder,
  type AcademyCourse,
  type AcademyLesson,
  type WallOfFameEntry,
  type AgeTier,
  type Pillar,
  type AcademyProgress,
  type Position,
} from "@/lib/academyData"
import {
  academyPhaseMap,
  academySystemPillars,
  coachCertificationLevels,
  gameDayCard,
  parentPortalModules,
  playerHomeworkAssignments,
  standardizedDrillCards,
  videoLibraryFolders,
} from "@/lib/academySystem"
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
  CalendarDays,
  ClipboardList,
  Rocket,
  Dumbbell,
} from "lucide-react"
import type { Gender, Course } from "@/types"

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "academy" | "courses" | "film" | "resources" | "downloads" | "wof" | "launch"

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
  foundation:  "from-emerald-500 to-emerald-700",
  development: "from-blue-500 to-blue-700",
  advanced:    "from-violet-500 to-violet-700",
  elite:       "from-[#D22630] to-[#8B0000]",
}

const TIER_LABELS: Record<AgeTier, string> = {
  foundation: "Foundation",
  development: "Development",
  advanced: "Advanced",
  elite: "Elite",
}

const getTierLabel = (tier: string) => {
  if (tier in TIER_LABELS) return TIER_LABELS[tier as AgeTier]
  if (tier === "youth") return "Foundation"
  if (tier === "middle") return "Development"
  if (tier === "high") return "Elite"
  return "Academy"
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

type FilmPosition = "All" | "Attack" | "Midfield" | "Defense" | "Goalie" | "FOGO" | "Draw"

const getFilmPositions = (gender: Gender): FilmPosition[] =>
  gender === "girls"
    ? ["All", "Attack", "Midfield", "Defense", "Goalie", "Draw"]
    : ["All", "Attack", "Midfield", "Defense", "Goalie", "FOGO"]

const DOWNLOAD_CATEGORIES = ["Playbooks", "Drill Sheets", "Mental Game", "Recruiting"] as const
type DownloadCategory = typeof DOWNLOAD_CATEGORIES[number]

type AcademyDownload = {
  id: string
  name: string
  category: DownloadCategory
  gender: Gender | "all"
  size: string
  ext: string
  href: string
}

const STATIC_DOWNLOADS: AcademyDownload[] = [
  // Playbooks
  { id: "pb-boys-offense", name: "Boys Motion Offense Playbook", category: "Playbooks", gender: "boys", size: "Interactive", ext: "HTML", href: "/btb-boys-offense-playbook.html" },
  { id: "pb-boys-defense", name: "Boys Defensive Playbook", category: "Playbooks", gender: "boys", size: "Interactive", ext: "HTML", href: "/btb-boys-defense-playbook.html" },
  { id: "pb-boys-transition", name: "Boys Transition & Special Teams", category: "Playbooks", gender: "boys", size: "Interactive", ext: "HTML", href: "/btb-boys-transition-playbook.html" },
  { id: "pb-girls-offense", name: "Girls Motion Offense Playbook", category: "Playbooks", gender: "girls", size: "Interactive", ext: "HTML", href: "/btb-girls-offense-playbook.html" },
  { id: "pb-girls-defense", name: "Girls Defensive Playbook", category: "Playbooks", gender: "girls", size: "Interactive", ext: "HTML", href: "/btb-girls-defense-playbook.html" },
  { id: "pb-girls-transition", name: "Girls Transition & Special Teams", category: "Playbooks", gender: "girls", size: "Interactive", ext: "HTML", href: "/btb-girls-transition-playbook.html" },
  { id: "pb-positionless", name: "Positionless Guru Study Guide", category: "Playbooks", gender: "all", size: "Interactive", ext: "HTML", href: "/btb-positionless-guru.html" },
  // Drill Sheets — gender-neutral
  { id: "d3", name: "Ground Ball Drill Sheet",        category: "Drill Sheets",  gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#ground-ball" },
  { id: "d4", name: "Wall Ball 30-Day Program",       category: "Drill Sheets",  gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#wall-ball" },
  { id: "d5", name: "BTB Footwork Ladder Circuit",    category: "Drill Sheets",  gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#footwork" },
  // Mental Game — gender-neutral
  { id: "d6", name: "Mental Performance Journal",     category: "Mental Game",   gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#mental-journal" },
  { id: "d7", name: "Pressure Performance Protocol",  category: "Mental Game",   gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#pressure" },
  // Recruiting — gender-neutral
  { id: "d8", name: "Recruiting Preparation Guide",   category: "Recruiting",    gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#recruiting" },
  { id: "d9", name: "College Lacrosse Email Templates", category: "Recruiting",  gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#emails" },
  { id: "d10", name: "Highlight Film Checklist",      category: "Recruiting",    gender: "all",   size: "Print",  ext: "HTML", href: "/academy-downloads/BTB_Academy_Training_Packets.html#highlight" },
]

const CATEGORY_COLORS: Record<DownloadCategory, string> = {
  Playbooks:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Drill Sheets": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Mental Game": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Recruiting:   "bg-amber-500/10 text-amber-400 border-amber-500/30",
}

const PLAYER_RESOURCES = [
  {
    title: "Boys Motion Offense",
    program: "Boys Program",
    gender: "boys" as const,
    desc: "Passing, fades, follow actions, cuts, picks, and full-system offensive film.",
    href: "/btb-boys-offense-playbook.html",
    icon: Swords,
  },
  {
    title: "Boys Defensive Playbook",
    program: "Boys Program",
    gender: "boys" as const,
    desc: "Slides, recovery, defending picks, cutters, man-down, and 3-3 zone principles.",
    href: "/btb-boys-defense-playbook.html",
    icon: Target,
  },
  {
    title: "Boys Transition & Special Teams",
    program: "Boys Program",
    gender: "boys" as const,
    desc: "Rides, clears, substitutions, faceoffs, wing play, man-up, and man-down.",
    href: "/btb-boys-transition-playbook.html",
    icon: Zap,
  },
  {
    title: "Girls Motion Offense",
    program: "Girls Program",
    gender: "girls" as const,
    desc: "Women's D1 film, spacing, fades, cuts, clear-throughs, follow actions, and picks.",
    href: "/btb-girls-offense-playbook.html",
    icon: Swords,
  },
  {
    title: "Girls Defensive Playbook",
    program: "Girls Program",
    gender: "girls" as const,
    desc: "Defensive footwork, draw defense, slides, man-to-man, and zone principles.",
    href: "/btb-girls-defense-playbook.html",
    icon: Target,
  },
  {
    title: "Girls Transition & Special Teams",
    program: "Girls Program",
    gender: "girls" as const,
    desc: "Rides, clears, draw plays, 8-meter shooting, man-up, and man-down situations.",
    href: "/btb-girls-transition-playbook.html",
    icon: Zap,
  },
  {
    title: "Positionless Guru",
    program: "All Players",
    gender: "all" as const,
    desc: "Spacing, reads, off-ball movement, ball movement, and finishing IQ.",
    href: "/btb-positionless-guru.html",
    icon: Brain,
  },
]

const LAUNCH_PHASES = [
  {
    phase: "Platform Foundation",
    dates: "July 18-24",
    status: "In Progress",
    body: "Separate boys and girls hubs, four BTB development tiers, lesson progress, quizzes, Wall of Fame, and working resource access.",
  },
  {
    phase: "Curriculum Completion",
    dates: "July 25-August 7",
    status: "Next",
    body: "Finish the mini lesson sequence for Skill, IQ, Physical preparation, and Character with boys/girls-specific position schools.",
  },
  {
    phase: "Member + Public Access",
    dates: "August 8-16",
    status: "Next",
    body: "Finalize rostered member accounts, non-member access flow, pricing language, coach visibility, and launch support.",
  },
  {
    phase: "QA + Family Rollout",
    dates: "August 17-31",
    status: "Target",
    body: "Mobile testing, coach review, parent communication, launch checklist, and final content cleanup before end-of-August release.",
  },
]

const LAUNCH_CHECKLIST = [
  { label: "Boys and girls Academy routes", status: "Live", detail: "Separate player hubs and public Academy entry points are active." },
  { label: "Four-tier BTB curriculum map", status: "Live", detail: "Foundation, Development, Advanced, and Elite tracks are now reflected in the hub." },
  { label: "Position school separation", status: "Live", detail: "Boys FOGO and girls Draw are treated as different position tracks." },
  { label: "Download/resource packets", status: "Live", detail: "Playbooks and printable training packets now open from the Downloads tab." },
  { label: "Final video/content audit", status: "Build", detail: "Next sprint: review every lesson video, quiz, and field assignment." },
  { label: "Accounts and launch roster", status: "Build", detail: "Next sprint: prepare member access and the non-member request flow." },
]

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
  const { getProgress, getCourseCompletion } = useProgress(user?.id ?? "")

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
    if (genderProp && g !== genderProp) {
      try { localStorage.setItem(GENDER_STORAGE_KEY, g) } catch { /* ignore */ }
      navigate(`/${g}/players`)
      return
    }
    setGender(g)
    try { localStorage.setItem(GENDER_STORAGE_KEY, g) } catch { /* ignore */ }
  }

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  // ── Grad-year courses ─────────────────────────────────────────────────────
  const gradYear = user?.gradYear
  const gradCourses = useMemo(() => {
    if (gradYear) return getCoursesByGradYear(gender, gradYear)
    return getCourses(gender)
  }, [gender, gradYear])
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

  const isPublicAcademyUser = user?.academyAccess === "public"
  const canViewLaunchPlan = !isPublicAcademyUser && (user?.role === "owner" || user?.role === "coach")
  const positionOrder = useMemo(() => getPositionOrder(gender), [gender])
  const filmPositions = useMemo(() => getFilmPositions(gender), [gender])

  // ── On mount: sync progress + load WoF ───────────────────────────────────
  useEffect(() => {
    if (user?.id) {
      syncProgressFromServer(user.id).then(setAcademyProgress)
    }
    getWallOfFame().then(setWallEntries)
  }, [user?.id])

  // Reset gender when user changes
  useEffect(() => {
    if (genderProp) {
      setGender(genderProp)
      return
    }
    if (user?.gender) {
      const stored = localStorage.getItem(GENDER_STORAGE_KEY)
      if (!stored) setGender(user.gender as Gender)
    }
  }, [genderProp, user?.gender])

  useEffect(() => {
    if (!positionOrder.includes(activePosition)) setActivePosition("all")
    if (!filmPositions.includes(filmPositionFilter)) setFilmPositionFilter("All")
    if (activeTab === "launch" && !canViewLaunchPlan) setActiveTab("dashboard")
    if (isPublicAcademyUser && ["academy", "resources", "downloads", "wof", "launch"].includes(activeTab)) {
      setActiveTab("dashboard")
    }
  }, [activePosition, activeTab, canViewLaunchPlan, filmPositionFilter, filmPositions, isPublicAcademyUser, positionOrder])

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
  const publicCoursePct = gradCourses.length > 0
    ? Math.round(gradCourses.reduce((sum, course) => sum + getCourseCompletion(course.id, course.steps.length), 0) / gradCourses.length)
    : 0
  const publicCompletedCourses = gradCourses.filter((course) => getCourseCompletion(course.id, course.steps.length) === 100).length
  const publicLearningSteps = gradCourses.reduce((sum, course) => sum + course.steps.length, 0)
  const publicFilmLessons = gradCourses.reduce((sum, course) => sum + course.steps.filter((step) => step.type === "film").length, 0)
  const publicCompletedSteps = gradCourses.flatMap((course) =>
    getProgress(course.id).completedSteps.map((stepId) => {
      const step = course.steps.find((s) => s.id === stepId)
      return step ? { course, step } : null
    }).filter(Boolean)
  )
  const dashboardPct = isPublicAcademyUser ? publicCoursePct : overallPct
  const navTabs = isPublicAcademyUser
    ? [
        { id: "dashboard" as Tab, icon: LayoutDashboard, label: "Dashboard" },
        { id: "courses" as Tab, icon: BookOpen, label: "Learning" },
        { id: "film" as Tab, icon: Film, label: "Video" },
      ]
    : [
        { id: "dashboard" as Tab, icon: LayoutDashboard, label: "Dashboard" },
        { id: "academy" as Tab, icon: GraduationCap, label: "Academy" },
        { id: "courses" as Tab, icon: BookOpen, label: "Courses" },
        { id: "film" as Tab, icon: Film, label: "Film Study" },
        { id: "resources" as Tab, icon: Swords, label: "Playbooks" },
        { id: "downloads" as Tab, icon: Download, label: "Downloads" },
        { id: "wof" as Tab, icon: Trophy, label: "Wall of Fame" },
        ...(canViewLaunchPlan ? [{ id: "launch" as Tab, icon: ClipboardList, label: "System" }] : []),
      ]
  const dashboardStats = isPublicAcademyUser
    ? [
        { label: "Courses Done", value: `${publicCompletedCourses}/${gradCourses.length}` },
        { label: "Steps", value: `${publicLearningSteps}` },
        { label: "Film Lessons", value: `${publicFilmLessons}` },
        { label: "Access", value: "Public" },
      ]
    : [
        { label: "Lessons Done", value: `${completedLessons}/${totalLessons}` },
        { label: "Est. Time", value: `${Math.round(completedLessons * 8)} min` },
        { label: "Courses", value: `${gradCourses.length}` },
        { label: "Badges", value: `${academyCourses.filter(isCourseComplete).length}` },
      ]
  const quickActions = isPublicAcademyUser
    ? [
        { label: "Video Lessons", icon: Play, tab: "courses" as Tab, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        { label: "Learning Path", icon: BookOpen, tab: "courses" as Tab, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Film Study", icon: Film, tab: "film" as Tab, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      ]
    : [
        { label: "Player IQ", icon: Brain, tab: "academy" as Tab, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Position School", icon: Target, tab: "academy" as Tab, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Systems", icon: Zap, tab: "courses" as Tab, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        { label: "Film Study", icon: Film, tab: "film" as Tab, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { label: "Playbooks", icon: Swords, tab: "resources" as Tab, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        { label: "Downloads", icon: Download, tab: "downloads" as Tab, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
      ]

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
    (d) => (d.gender === "all" || d.gender === gender) &&
           (downloadCategory === "All" || d.category === downloadCategory)
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
  if (!isPublicAcademyUser && activeLesson && activePillarCourse && !showLessonComplete && !showCourseComplete) {
    const currentQuestion = activeLesson.questions[currentQuestionIndex]
    const isCorrect = answerSubmitted && selectedAnswer === currentQuestion.correctAnswer
    const TopicIcon = TOPIC_ICONS[activeLesson.topic]

    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-[#1F1F1F] bg-black/90 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={closeLesson}
              className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-sm font-semibold"
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
                    className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-[#1F1F1F] disabled:text-white/85 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
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
  if (!isPublicAcademyUser && showLessonComplete && activeLesson && activePillarCourse) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mb-6">
            <Check size={48} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            Lesson Complete
          </h1>
          <p className="text-white/85 text-lg mb-2">{activeLesson.title}</p>
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
  if (!isPublicAcademyUser && showCourseComplete && activePillarCourse) {
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
                className="w-full py-4 bg-[#D22630] hover:bg-[#B01F28] disabled:bg-[#1F1F1F] disabled:text-white/85 text-white font-bold uppercase tracking-widest text-sm rounded-lg transition-colors"
              >
                Add to Wall of Fame
              </button>
              <button onClick={closeLesson} className="w-full py-3 text-white/78 hover:text-white text-sm font-semibold">
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
  if (!isPublicAcademyUser && activePillarCourse && !activeLesson) {
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
              className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-sm font-semibold"
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
            {positionOrder.map((pos) => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-3 py-1.5 rounded-full text-[1.2rem] font-bold uppercase tracking-[1px] transition-all ${
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
              <p className="text-white/45 text-xs mt-1">More position-specific content coming soon.</p>
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
        <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-5">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="group flex h-10 items-center gap-2"
            aria-label="BTB home"
          >
            <div className="flex h-9 w-9 -skew-x-6 items-center justify-center bg-[#D22630] text-sm font-bold text-white transition-transform group-hover:scale-105"
              style={{ fontFamily: "'Anton', sans-serif" }}>B</div>
            <span className="hidden text-sm font-bold uppercase tracking-wide text-white sm:block"
              style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>
              BTB <span className="text-[#D22630]">Academy</span>
            </span>
          </button>

          {/* Nav Tabs */}
          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="Academy sections"
              className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-1 scrollbar-hide"
            >
              {navTabs.map(({ id, icon: Icon, label }) => {
                const isActive = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={label}
                    title={label}
                    onClick={() => setActiveTab(id)}
                    className={`flex h-9 min-w-9 items-center justify-center gap-2 rounded-[6px] px-2.5 text-[11px] font-black uppercase tracking-[0.08em] whitespace-nowrap transition-colors md:px-3 ${
                      isActive
                        ? "bg-[#D22630] text-white [box-shadow:0_0_0_1px_rgba(210,38,48,0.35)]"
                        : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2} />
                    <span className="hidden lg:inline">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: gender toggle + logout */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 items-center gap-1 rounded-md border border-[#1F1F1F] bg-[#0A0A0A] p-1">
              {(["boys", "girls"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setAndStoreGender(g)}
                  className={`h-7 rounded-[5px] px-2 text-[10px] font-black uppercase tracking-[0.08em] transition-colors ${
                    gender === g
                      ? "bg-[#D22630] text-white"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">{g === "boys" ? "B" : "G"}</span>
                  <span className="hidden sm:inline">{g}</span>
                </button>
              ))}
            </div>
            <div className="hidden h-9 w-9 items-center justify-center rounded-md border border-[#1F1F1F] bg-[#141414] text-xs font-bold text-white sm:flex">
              {user?.name?.[0] ?? "P"}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-9 w-9 items-center justify-center rounded-md border border-[#1F1F1F] text-white/45 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white md:flex"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={15} />
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
                  <p className="text-[#888888] text-[1.15rem] font-bold uppercase tracking-[2px] mb-1">
                    {isPublicAcademyUser ? "Public Video Learning · Overall Progress" : "Development Track · Overall Progress"}
                  </p>
                  <p className="text-4xl font-bold" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif" }}>{dashboardPct}%</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D22630]/10 border border-[#D22630]/30 rounded-lg">
                  <Activity size={14} className="text-[#D22630]" />
                  <span className="text-[#D22630] text-xs font-bold uppercase">Active</span>
                </div>
              </div>
              <ProgressBar pct={dashboardPct} colorClass="bg-[#D22630]" height="h-2.5" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                {dashboardStats.map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-white font-bold text-lg">{value}</p>
                    <p className="text-[#888888] text-[1.15rem] uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {isPublicAcademyUser && (
              <div className="mb-6 rounded-2xl border border-[#D22630]/30 bg-[#D22630]/[0.08] p-5">
                <div className="flex gap-4">
                  <Lock size={18} className="mt-0.5 shrink-0 text-[#D22630]" />
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[2px] text-white">Public Learning Academy</p>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
                      This account includes general video lessons, film study, and player education. BTB terminology, team playbooks, team systems, downloads, Wall of Fame, and internal team resources are member-only.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {canViewLaunchPlan && (
              <button
                onClick={() => setActiveTab("launch")}
                className="mb-6 w-full rounded-2xl border border-[#D22630]/30 bg-[#D22630]/[0.08] p-5 text-left transition hover:border-[#D22630]/60 hover:bg-[#D22630]/[0.12]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D22630]">
                      <Rocket size={21} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[1.1rem] font-black uppercase tracking-[2px] text-[#D22630]">Academy System</p>
                      <h3 className="mt-1 text-xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                        4 phases, 3 pillars, one shared language
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                        Open the internal build map for curriculum, coach certification, drill cards, parent education, homework, and rollout.
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 text-[1.15rem] font-black uppercase tracking-[2px] text-white">
                    Open System <ChevronRight size={15} />
                  </div>
                </div>
              </button>
            )}

            {/* Quick grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {quickActions.map(({ label, icon: Icon, tab, color, bg, border }) => (
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
	                  {isPublicAcademyUser
	                    ? gradCourses.slice(0, 3).map((course) => {
	                        const pct = getCourseCompletion(course.id, course.steps.length)
	                        return (
	                          <button
	                            key={course.id}
	                            onClick={() => setActiveCourse(course)}
	                            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#141414] border border-[#1F1F1F] hover:border-[#2A2A2A] transition-all group text-left"
	                          >
	                            <div className="w-10 h-10 rounded-lg bg-[#D22630] flex items-center justify-center shrink-0">
	                              <Play size={16} className="text-white" />
	                            </div>
	                            <div className="flex-1 min-w-0">
	                              <p className="text-white text-sm font-bold truncate">{course.title}</p>
	                              <ProgressBar pct={pct} colorClass="bg-[#D22630]" height="h-1 mt-1.5" />
	                            </div>
	                            <span className="text-[#888888] text-xs font-bold shrink-0">{pct}%</span>
	                            <ChevronRight size={14} className="text-[#888888] group-hover:text-white transition-colors shrink-0" />
	                          </button>
	                        )
	                      })
	                    : academyCourses.slice(0, 3).map((course) => {
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
	                  {isPublicAcademyUser ? (
	                    publicCompletedSteps.length === 0 ? (
	                      <p className="text-[#888888] text-sm text-center py-6">No activity yet. Start a video lesson to track your progress.</p>
	                    ) : (
	                      publicCompletedSteps.slice(-5).reverse().map((item, idx) => {
	                        if (!item) return null
	                        return (
	                          <div key={`${item.course.id}-${item.step.id}-${idx}`} className="flex items-center gap-3 py-2">
	                            <div className="w-2 h-2 rounded-full bg-[#D22630] shrink-0" />
	                            <div className="flex-1 min-w-0">
	                              <p className="text-white text-sm font-semibold truncate">{item.step.title}</p>
	                              <p className="text-[#888888] text-xs">{item.course.title}</p>
	                            </div>
	                            <Check size={14} className="text-[#00D26A] shrink-0" />
	                          </div>
	                        )
	                      })
	                    )
	                  ) : completedLessons === 0 ? (
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
        {!isPublicAcademyUser && activeTab === "academy" && (
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
                        <span className="text-[1.25rem] text-[#888888]">{course.lessons.length} lessons</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-[#1F1F1F] rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${TIER_COLORS[course.tier]}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[1.0rem] font-bold text-[#888888]">{pct}%</span>
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
                          <span className="text-[1.15rem] font-bold uppercase tracking-[1.5px] text-[#888888]">Progress</span>
                          <span className="text-[1.15rem] font-bold uppercase tracking-[1.5px] text-white/85">{pct}%</span>
                        </div>
                        <ProgressBar pct={pct} colorClass="bg-[#D22630]" height="h-[5px]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#888888]">{course.steps.length} steps</span>
                        <button
                          onClick={() => setActiveCourse(course)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[1.25rem] font-bold uppercase tracking-[1.5px] transition-all ${
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
                {filmPositions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setFilmPositionFilter(pos)}
                    className={`px-4 py-1.5 rounded-full text-[1.25rem] font-bold uppercase tracking-[1px] transition-all ${
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
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[1.08rem] font-bold text-white">
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

        {/* ── PLAYBOOK RESOURCES TAB ─────────────────────────────────────── */}
        {!isPublicAcademyUser && activeTab === "resources" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold uppercase mb-2"
                style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                Video <span className="text-[#D22630]">Playbooks</span>
              </h2>
              <p className="text-[#888888] text-sm max-w-xl leading-relaxed">
                BTB systems and IQ resources for players to study between practices. These are the same concepts coaches use to teach the program.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {PLAYER_RESOURCES.filter((r) => r.gender === gender || r.gender === "all").map((resource) => (
                <a
                  key={resource.title}
                  href={resource.href}
                  className="group block bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 hover:border-[#D22630]/50 hover:bg-[#141414] transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-[#D22630]/10 border border-[#D22630]/20 flex items-center justify-center group-hover:bg-[#D22630] transition-colors">
                      <resource.icon size={20} className="text-[#D22630] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[1.08rem] font-black uppercase tracking-[1.5px] text-[#888888] border border-[#1F1F1F] rounded-full px-3 py-1">
                      {resource.program}
                    </span>
                  </div>
                  <h3 className="text-white font-bold uppercase text-xl mb-3"
                    style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                    {resource.title}
                  </h3>
                  <p className="text-[#888888] text-sm leading-relaxed mb-8">{resource.desc}</p>
                  <div className="inline-flex items-center gap-2 text-[#D22630] text-[1.25rem] font-black uppercase tracking-[2px] group-hover:translate-x-1 transition-transform">
                    Open Resource <ChevronRight size={13} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── DOWNLOADS TAB ──────────────────────────────────────────────── */}
        {!isPublicAcademyUser && activeTab === "downloads" && (
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
                    className={`px-4 py-1.5 rounded-full text-[1.25rem] font-bold uppercase tracking-[1px] transition-all ${
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
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl hover:border-[#D22630]/40 hover:bg-[#141414] transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#D22630]/10 border border-[#D22630]/20 flex items-center justify-center shrink-0 group-hover:bg-[#D22630]/20 transition-colors">
                    <FileText size={22} className="text-[#D22630]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-snug mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[1.05rem] font-bold uppercase tracking-wider border ${CATEGORY_COLORS[item.category as DownloadCategory]}`}>
                        {item.category}
                      </span>
                      <span className="text-[#888888] text-[1.15rem]">{item.size}</span>
                      <span className="text-white/30 text-[1.15rem]">{item.ext}</span>
                    </div>
                  </div>
                  <Download size={18} className="text-[#888888] group-hover:text-[#D22630] shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── SYSTEM TAB ───────────────────────────────────────────────── */}
        {activeTab === "launch" && canViewLaunchPlan && (
          <div>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D22630]/30 bg-[#D22630]/10 px-3 py-1 text-[1.05rem] font-black uppercase tracking-[2px] text-[#D22630]">
                  <ClipboardList size={13} />
                  Academy Operating System
                </div>
                <h2 className="text-4xl font-bold uppercase leading-none md:text-5xl"
                  style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                  BTB Development System
                  <span className="block text-[#D22630]">16 Weeks · 3 Pillars</span>
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#888888]">
                  Internal source of truth for the online Academy: player learning, coach certification, parent education, drill cards, homework, video folders, and rollout.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-3 text-center">
                {[
                  { label: "Phases", value: academyPhaseMap.length },
                  { label: "Certs", value: coachCertificationLevels.length },
                  { label: "Drills", value: standardizedDrillCards.length },
                  { label: "Lessons", value: totalLessons },
                ].map((item) => (
                  <div key={item.label} className="min-w-[86px] rounded-xl bg-[#141414] px-4 py-3">
                    <div className="font-display text-3xl text-white">{item.value}</div>
                    <div className="text-[1.05rem] font-black uppercase tracking-[1.5px] text-[#888888]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {academySystemPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                  <p className="text-[1.05rem] font-black uppercase tracking-[2px] text-[#D22630]">{pillar.audience}</p>
                  <h3 className="mt-2 text-2xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#888888]">{pillar.promise}</p>
                  <div className="mt-5 space-y-2">
                    {pillar.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-white/65">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#D22630]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
              <div className="mb-5 flex items-center gap-2">
                <CalendarDays size={17} className="text-[#D22630]" />
                <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">4-Phase Master Curriculum</h3>
              </div>
              <div className="grid gap-3 xl:grid-cols-4">
                {academyPhaseMap.map((phase, index) => (
                  <div key={phase.phase} className="rounded-xl border border-[#1F1F1F] bg-black p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D22630] font-display text-2xl text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[1.0rem] font-black uppercase tracking-[1px] text-white/55">
                        {phase.weeks}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                      {phase.phase}
                    </h4>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-[#D22630]">{phase.identity}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#888888]">{phase.focus}</p>
                    <div className="mt-5 space-y-3">
                      {phase.systems.map((system) => (
                        <div key={`${phase.phase}-${system.name}`} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="mb-1 text-[1.0rem] font-black uppercase tracking-[1.5px] text-white">{system.name}</div>
                          <p className="text-xs leading-relaxed text-white/55"><span className="text-white/85">HS:</span> {system.highSchool}</p>
                          <p className="mt-1 text-xs leading-relaxed text-white/55"><span className="text-white/85">Youth:</span> {system.youth}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Award size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Coach Certification Pathway</h3>
                </div>
                <div className="space-y-3">
                  {coachCertificationLevels.map((level) => (
                    <div key={level.level} className="rounded-xl border border-[#1F1F1F] bg-black p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[1.05rem] font-black uppercase tracking-[2px] text-[#D22630]">{level.level} · {level.phase}</p>
                          <h4 className="mt-1 text-xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                            {level.title}
                          </h4>
                        </div>
                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[1.0rem] font-black uppercase tracking-[1px] text-amber-400">
                          {level.deliverable}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#888888]">{level.requirement}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {level.keyTopics.map((topic) => (
                          <span key={topic} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[1.0rem] font-bold uppercase tracking-[1px] text-white/60">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Standardized Drill Cards</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {standardizedDrillCards.map((drill) => (
                    <div key={drill.name} className="rounded-xl border border-[#1F1F1F] bg-black p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#D22630]/15 px-2.5 py-1 text-[1.0rem] font-black uppercase tracking-[1px] text-[#D22630]">{drill.phase}</span>
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[1.0rem] font-black uppercase tracking-[1px] text-white/55">{drill.system}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{drill.name}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#888888]">{drill.purpose}</p>
                      <div className="mt-4 text-xs leading-relaxed text-white/55">
                        <span className="font-bold text-white/85">Diagram:</span> {drill.diagram}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Users size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Parent Portal Modules</h3>
                </div>
                <div className="space-y-3">
                  {parentPortalModules.map((module) => (
                    <div key={module.title} className="rounded-xl border border-[#1F1F1F] bg-black p-4">
                      <p className="text-[1.0rem] font-black uppercase tracking-[1.5px] text-[#D22630]">{module.audience}</p>
                      <h4 className="mt-1 text-lg font-bold text-white">{module.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#888888]">{module.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Dumbbell size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Player Homework</h3>
                </div>
                <div className="space-y-3">
                  {playerHomeworkAssignments.map((assignment) => (
                    <div key={assignment.phase} className="rounded-xl border border-[#1F1F1F] bg-black p-4">
                      <div className="mb-1 text-[1.0rem] font-black uppercase tracking-[1.5px] text-[#D22630]">{assignment.weeks}</div>
                      <h4 className="text-lg font-bold text-white">{assignment.phase}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#888888]">{assignment.theme}</p>
                      <p className="mt-3 text-xs leading-relaxed text-white/55"><span className="text-white/85">Challenge:</span> {assignment.iqChallenge}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardList size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Game Day Card</h3>
                </div>
                <div className="space-y-3">
                  {gameDayCard.halftime.map((item) => (
                    <div key={item.problem} className="rounded-xl border border-[#1F1F1F] bg-black p-4">
                      <p className="text-sm font-bold text-white">{item.problem}</p>
                      <p className="mt-2 text-xs leading-relaxed text-[#888888]">{item.adjustment}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-[#1F1F1F] bg-black p-4">
                  <p className="mb-3 text-[1.0rem] font-black uppercase tracking-[1.5px] text-[#D22630]">Video Library Folders</p>
                  <div className="flex flex-wrap gap-2">
                    {videoLibraryFolders.map((folder) => (
                      <span key={folder} className="rounded-full bg-white/[0.06] px-3 py-1 text-[1.0rem] font-bold uppercase tracking-[1px] text-white/55">
                        {folder}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-6 flex items-center gap-2">
                  <CalendarDays size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Launch Phases</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {LAUNCH_PHASES.map((phase) => (
                    <div key={phase.phase} className="rounded-xl border border-[#1F1F1F] bg-black p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[1.05rem] font-black uppercase tracking-[2px] text-[#888888]">{phase.dates}</p>
                          <h4 className="mt-1 text-xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                            {phase.phase}
                          </h4>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[1.0rem] font-black uppercase tracking-[1px] ${
                          phase.status === "In Progress"
                            ? "bg-[#D22630]/15 text-[#D22630]"
                            : phase.status === "Target"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/[0.06] text-white/55"
                        }`}>
                          {phase.status}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#888888]">{phase.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="mb-6 flex items-center gap-2">
                  <ClipboardList size={17} className="text-[#D22630]" />
                  <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">Readiness Checklist</h3>
                </div>
                <div className="space-y-3">
                  {LAUNCH_CHECKLIST.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#1F1F1F] bg-black p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[1.0rem] font-black uppercase tracking-[1px] ${
                          item.status === "Live"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#888888]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
              <div className="mb-5 flex items-center gap-2">
                <GraduationCap size={17} className="text-[#D22630]" />
                <h3 className="text-sm font-bold uppercase tracking-[2px] text-white">{gender === "boys" ? "Boys" : "Girls"} Curriculum Map</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {academyCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => { setActivePillarCourse(course); setActivePillar("game") }}
                    className="rounded-xl border border-[#1F1F1F] bg-black p-5 text-left transition hover:border-[#D22630]/45 hover:bg-[#141414]"
                  >
                    <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${TIER_COLORS[course.tier]}`} />
                    <p className="text-[1.05rem] font-black uppercase tracking-[2px] text-[#888888]">{course.gradYears}</p>
                    <h4 className="mt-1 text-2xl font-bold uppercase text-white" style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
                      {course.tierLabel}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-[#888888]">{course.description}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-[1.05rem] font-black uppercase tracking-[2px] text-[#D22630]">
                      Review Lessons <ChevronRight size={13} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── WALL OF FAME TAB ───────────────────────────────────────────── */}
        {!isPublicAcademyUser && activeTab === "wof" && (
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${TIER_COLORS[(entry.tier as AgeTier)] || TIER_COLORS.foundation}`}>
                      <Trophy size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold truncate">{entry.name}</p>
                      <p className="text-[#888888] text-xs mt-0.5">
                        {getTierLabel(entry.tier)}
                        {entry.completedAt && <span className="ml-2 text-white/45">{entry.completedAt}</span>}
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
