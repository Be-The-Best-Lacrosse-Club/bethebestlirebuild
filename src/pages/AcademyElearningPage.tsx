import { useState, useMemo, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useProgress } from "@/hooks/useProgress"
import {
  getAcademyModules,
  getWallOfFame,
  addToWallOfFame,
  type AcademyModule,
  type WallOfFameEntry,
} from "@/lib/academyData"
import {
  ArrowLeft,
  LogOut,
  Lock,
  Check,
  ChevronRight,
  Play,
  BookOpen,
  HelpCircle,
  FileText,
  Video,
  Trophy,
  Award,
  Star,
  GraduationCap,
} from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import type { Gender, CourseStep } from "@/types"

const stepIcons: Record<CourseStep["type"], typeof Play> = {
  film: Video,
  question: HelpCircle,
  drill: BookOpen,
  reading: FileText,
}

export function AcademyElearningPage({ gender }: { gender: Gender }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { getProgress, markStepComplete, getCourseCompletion } = useProgress(user?.id ?? "")

  const modules = useMemo(() => getAcademyModules(gender), [gender])

  const [activeModule, setActiveModule] = useState<AcademyModule | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [wallName, setWallName] = useState("")
  const [wallEntries, setWallEntries] = useState<WallOfFameEntry[]>([])
  const [nameSubmitted, setNameSubmitted] = useState(false)

  useEffect(() => {
    setWallEntries(getWallOfFame())
  }, [])

  const label = gender === "boys" ? "Boys" : "Girls"

  // Check if a module is unlocked (previous module 100% or first module)
  const isModuleUnlocked = useCallback(
    (moduleIndex: number) => {
      if (moduleIndex === 0) return true
      const prev = modules[moduleIndex - 1]
      return getCourseCompletion(prev.id, prev.steps.length) === 100
    },
    [modules, getCourseCompletion],
  )

  // Check if entire academy is complete
  const academyComplete = useMemo(() => {
    return modules.every((m) => getCourseCompletion(m.id, m.steps.length) === 100)
  }, [modules, getCourseCompletion])

  // Total progress
  const totalSteps = useMemo(() => modules.reduce((sum, m) => sum + m.steps.length, 0), [modules])
  const completedSteps = useMemo(
    () =>
      modules.reduce((sum, m) => {
        const p = getProgress(m.id)
        return sum + p.completedSteps.length
      }, 0),
    [modules, getProgress],
  )
  const overallPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // ─── Module view helpers ─────────────────────────────────────────

  const openModule = (mod: AcademyModule) => {
    const progress = getProgress(mod.id)
    const completedSet = new Set(progress.completedSteps)
    const firstIncomplete = mod.steps.findIndex((s) => !completedSet.has(s.id))
    setActiveModule(mod)
    setCurrentStepIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setSidebarOpen(false)
  }

  const goToStep = (idx: number) => {
    setCurrentStepIndex(idx)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setSidebarOpen(false)
  }

  const handleMarkComplete = () => {
    if (!activeModule) return
    const step = activeModule.steps[currentStepIndex]
    markStepComplete(activeModule.id, step.id)

    // Check if this was the last step in the last module
    const isLastModule = activeModule.id === modules[modules.length - 1].id
    const isLastStep = currentStepIndex === activeModule.steps.length - 1
    const moduleProgress = getProgress(activeModule.id)
    const willBeComplete = moduleProgress.completedSteps.length + 1 >= activeModule.steps.length

    if (isLastModule && isLastStep && willBeComplete) {
      // Slight delay so progress saves
      setTimeout(() => {
        setActiveModule(null)
        setShowCelebration(true)
      }, 300)
      return
    }

    // Auto-advance to next incomplete step
    const completedSet = new Set([...moduleProgress.completedSteps, step.id])
    const nextIncomplete = activeModule.steps.findIndex(
      (s, i) => i > currentStepIndex && !completedSet.has(s.id),
    )
    if (nextIncomplete !== -1) {
      goToStep(nextIncomplete)
    }
  }

  const handleSubmitAnswer = () => setAnswerSubmitted(true)

  const advanceToNext = () => {
    if (!activeModule) return
    const progress = getProgress(activeModule.id)
    const completedSet = new Set(progress.completedSteps)
    const next = activeModule.steps.findIndex(
      (s, i) => i > currentStepIndex && !completedSet.has(s.id),
    )
    if (next !== -1) {
      goToStep(next)
    } else if (currentStepIndex < activeModule.steps.length - 1) {
      goToStep(currentStepIndex + 1)
    }
  }

  const handleWallSubmit = () => {
    if (!wallName.trim()) return
    const updated = addToWallOfFame(wallName.trim(), gender)
    setWallEntries(updated)
    setNameSubmitted(true)
  }

  // ─── Celebration View ────────────────────────────────────────────

  if (showCelebration) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-[560px] w-full text-center">
          {/* Animated glow */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-[var(--btb-red)] rounded-full blur-[60px] opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto rounded-full bg-[var(--btb-red)]/20 border-2 border-[var(--btb-red)] flex items-center justify-center">
              <Trophy size={40} className="text-[var(--btb-red)]" />
            </div>
          </div>

          <div className="text-[0.65rem] font-bold uppercase tracking-[6px] text-[var(--btb-red)] mb-4">
            Academy Complete
          </div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase tracking-wide leading-[0.92] mb-6">
            You Earned It.
          </h1>
          <p className="text-[0.9rem] text-white/40 leading-relaxed mb-10 max-w-[420px] mx-auto">
            You completed all 6 modules of the BTB {label} Academy. Your name will be added
            to the BTB Wall of Fame — permanently.
          </p>

          {!nameSubmitted ? (
            <div className="space-y-4">
              <input
                type="text"
                value={wallName}
                onChange={(e) => setWallName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-5 py-4 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white text-[0.9rem] placeholder:text-white/20 focus:outline-none focus:border-[var(--btb-red)]/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleWallSubmit()}
              />
              <button
                onClick={handleWallSubmit}
                disabled={!wallName.trim()}
                className={`w-full px-6 py-4 rounded-xl text-[0.72rem] font-bold uppercase tracking-[2px] transition-all duration-200 ${
                  wallName.trim()
                    ? "bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red-dark)]"
                    : "bg-white/[0.05] text-white/15 cursor-not-allowed"
                }`}
              >
                Add My Name to the Wall of Fame
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-xl border border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5">
                <div className="flex items-center justify-center gap-2 text-[var(--btb-red)] mb-2">
                  <Check size={16} strokeWidth={3} />
                  <span className="text-[0.75rem] font-bold uppercase tracking-[2px]">Name Added</span>
                </div>
                <p className="text-[0.85rem] text-white/50">
                  <span className="text-white font-semibold">{wallName}</span> is now on the BTB Wall of Fame.
                </p>
              </div>
              <button
                onClick={() => setShowCelebration(false)}
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/15 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded-xl hover:border-white/40 hover:text-white transition-all"
              >
                Back to Academy Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Module Step View ────────────────────────────────────────────

  if (activeModule && user) {
    const progress = getProgress(activeModule.id)
    const completedSet = new Set(progress.completedSteps)
    const step = activeModule.steps[currentStepIndex]
    const isStepComplete = completedSet.has(step.id)
    const pct = getCourseCompletion(activeModule.id, activeModule.steps.length)
    const StepIcon = stepIcons[step.type]

    return (
      <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {/* Top bar */}
        <div className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.07]">
          <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <button
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px] flex-shrink-0"
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
            <div className="flex-1 min-w-0 text-center">
              <span className="text-[0.55rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)]">
                Module {activeModule.moduleNumber}
              </span>
              <span className="font-display text-[0.9rem] uppercase tracking-wide truncate block">
                {activeModule.title}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden flex items-center gap-1.5 text-white/30 hover:text-white text-[0.7rem] font-bold uppercase tracking-[1.5px] flex-shrink-0"
            >
              <BookOpen size={14} /> Steps
            </button>
            <div className="hidden md:block flex-shrink-0 w-[80px]" />
          </div>
          <div className="h-[3px] bg-white/[0.06]">
            <div className="h-full bg-[var(--btb-red)] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex max-w-[1200px] mx-auto pt-[68px]">
          {/* Sidebar */}
          <aside
            className={`fixed md:sticky top-[68px] left-0 z-40 h-[calc(100vh-68px)] w-[280px] bg-neutral-950 border-r border-white/[0.07] overflow-y-auto flex-shrink-0 transition-transform duration-300 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div className="p-5">
              <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-white/20 mb-1">Progress</div>
              <div className="text-[0.88rem] text-white/50 mb-4">
                {progress.completedSteps.length} of {activeModule.steps.length} complete
              </div>
              <div className="space-y-1">
                {activeModule.steps.map((s, i) => {
                  const done = completedSet.has(s.id)
                  const active = i === currentStepIndex
                  const Icon = stepIcons[s.type]
                  return (
                    <button
                      key={s.id}
                      onClick={() => goToStep(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        active
                          ? "bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/30"
                          : "border border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6rem] font-bold ${
                          done
                            ? "bg-[var(--btb-red)] text-white"
                            : active
                              ? "border-2 border-[var(--btb-red)] text-[var(--btb-red)]"
                              : "border border-white/15 text-white/25"
                        }`}
                      >
                        {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[0.72rem] font-semibold truncate ${
                            active ? "text-white" : done ? "text-white/50" : "text-white/30"
                          }`}
                        >
                          {s.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Icon size={9} className="text-white/15" />
                          <span className="text-[0.58rem] uppercase tracking-[1px] text-white/15">{s.type}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0 px-6 md:px-12 py-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
                <StepIcon size={15} className="text-[var(--btb-red)]" />
              </div>
              <span className="text-[0.6rem] font-bold uppercase tracking-[3px] text-white/20">
                Step {step.stepNumber} of {activeModule.steps.length} &middot; {step.type}
              </span>
            </div>

            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] uppercase tracking-wide leading-snug mb-8">
              {step.title}
            </h2>

            {/* Content renderers */}
            {step.type === "reading" && (
              <ReadingContent step={step} isComplete={isStepComplete} onMarkComplete={handleMarkComplete} />
            )}
            {step.type === "film" && (
              <FilmContent step={step} isComplete={isStepComplete} onMarkComplete={handleMarkComplete} />
            )}
            {step.type === "question" && (
              <QuestionContent
                step={step}
                isComplete={isStepComplete}
                selectedOption={selectedOption}
                answerSubmitted={answerSubmitted}
                onSelectOption={setSelectedOption}
                onSubmit={handleSubmitAnswer}
                onMarkComplete={handleMarkComplete}
              />
            )}
            {step.type === "drill" && (
              <ReadingContent step={step} isComplete={isStepComplete} onMarkComplete={handleMarkComplete} />
            )}

            {/* Next step */}
            {isStepComplete && currentStepIndex < activeModule.steps.length - 1 && (
              <div className="mt-8 pt-6 border-t border-white/[0.07]">
                <button
                  onClick={advanceToNext}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[var(--btb-red)]/80 transition-colors"
                >
                  Next Step <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Module complete */}
            {pct === 100 && (
              <div className="mt-10 p-6 rounded-xl border border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5 text-center">
                <div className="font-display text-[1.3rem] uppercase tracking-wide text-[var(--btb-red)] mb-2">
                  Module Complete
                </div>
                <p className="text-[0.82rem] text-white/40 mb-5">
                  You finished all {activeModule.steps.length} steps in Module {activeModule.moduleNumber}.
                </p>
                <button
                  onClick={() => setActiveModule(null)}
                  className="px-6 py-2.5 border border-white/15 text-white/50 text-[0.7rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:border-white/40 hover:text-white transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  // ─── Dashboard View ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Academy | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label.toLowerCase()} academy — interactive e-learning modules, lacrosse IQ development, and skills certification.`}
        path={`/${gender}/academy`}
      />
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-3">
          <button
            onClick={() => navigate(`/${gender}/players`)}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px]"
          >
            <ArrowLeft size={14} /> Players Hub
          </button>
          <span className="font-display text-[1.1rem] uppercase tracking-wide">
            BTB <span className="text-[var(--btb-red)]">{label}</span> Academy
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px]"
          >
            Logout <LogOut size={14} />
          </button>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-6 pt-28 pb-24">
        {/* Hero */}
        <div className="mb-6">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-3">
            BTB {label} Academy
          </div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Become a <span className="text-[var(--btb-red)]">Complete</span> Player.
          </h1>
          <p className="text-[0.88rem] text-white/35 max-w-[540px] leading-relaxed">
            6 modules. Character, leadership, lacrosse IQ, film study, and growth.
            Complete every module to earn your place on the BTB Wall of Fame.
          </p>
        </div>

        {/* Overall progress */}
        <div className="mb-14 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
                <GraduationCap size={16} className="text-[var(--btb-red)]" />
              </div>
              <div>
                <div className="text-[0.72rem] font-semibold text-white/60">Overall Progress</div>
                <div className="text-[0.6rem] text-white/25">
                  {completedSteps} of {totalSteps} steps complete
                </div>
              </div>
            </div>
            <span className="font-display text-[1.5rem] text-[var(--btb-red)]">{overallPct}%</span>
          </div>
          <div className="h-[6px] bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Module list */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
              <BookOpen size={16} className="text-[var(--btb-red)]" />
            </div>
            <h2 className="font-display text-[1.3rem] uppercase tracking-wide">Modules</h2>
          </div>

          <div className="space-y-4">
            {modules.map((mod, idx) => {
              const unlocked = isModuleUnlocked(idx)
              const modPct = getCourseCompletion(mod.id, mod.steps.length)
              const completed = modPct === 100
              const inProgress = modPct > 0 && modPct < 100

              return (
                <div
                  key={mod.id}
                  className={`relative p-6 rounded-xl border transition-all duration-300 ${
                    completed
                      ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                      : unlocked
                        ? "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    {/* Module number */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-display text-[1.1rem] ${
                        completed
                          ? "bg-[var(--btb-red)] text-white"
                          : unlocked
                            ? "bg-white/[0.06] text-white/40 border border-white/[0.07]"
                            : "bg-white/[0.03] text-white/15 border border-white/[0.04]"
                      }`}
                    >
                      {completed ? <Check size={20} strokeWidth={3} /> : unlocked ? mod.moduleNumber : <Lock size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[0.55rem] font-bold uppercase tracking-[2px] text-white/20">
                              {mod.weekRange}
                            </span>
                            {completed && (
                              <span className="text-[0.55rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)]">
                                Complete
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-[1.1rem] uppercase tracking-wide leading-snug">
                            {mod.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-[0.78rem] text-white/30 leading-relaxed mb-4 line-clamp-2">
                        {mod.subtitle}
                      </p>

                      {/* Progress bar */}
                      {unlocked && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[0.6rem] font-bold uppercase tracking-[1.5px] text-white/20">
                              {mod.steps.length} steps
                            </span>
                            <span className="text-[0.6rem] font-bold uppercase tracking-[1.5px] text-white/35">
                              {modPct}%
                            </span>
                          </div>
                          <div className="h-[4px] bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-500"
                              style={{ width: `${modPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {unlocked && (
                        <button
                          onClick={() => openModule(mod)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-[1.5px] transition-all duration-200 ${
                            inProgress
                              ? "bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red)]/80"
                              : completed
                                ? "border border-[var(--btb-red)]/30 text-[var(--btb-red)] hover:bg-[var(--btb-red)]/10"
                                : "border border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          <Play size={11} />
                          {completed ? "Review" : inProgress ? "Continue" : "Start"}
                        </button>
                      )}

                      {!unlocked && (
                        <div className="flex items-center gap-2 text-white/15 text-[0.7rem]">
                          <Lock size={12} />
                          <span>Complete Module {mod.moduleNumber - 1} to unlock</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Academy Complete CTA (if all done but hasn't celebrated yet) */}
        {academyComplete && !nameSubmitted && (
          <div className="mb-20 text-center">
            <button
              onClick={() => setShowCelebration(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--btb-red)] text-white text-[0.75rem] font-bold uppercase tracking-[2px] rounded-xl hover:bg-[var(--btb-red-dark)] transition-all duration-200"
            >
              <Trophy size={18} />
              Claim Your Spot on the Wall of Fame
            </button>
          </div>
        )}

        {/* Wall of Fame */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
              <Award size={16} className="text-[var(--btb-red)]" />
            </div>
            <div>
              <h2 className="font-display text-[1.3rem] uppercase tracking-wide">Wall of Fame</h2>
              <p className="text-[0.65rem] text-white/25 uppercase tracking-[1.5px]">
                Players who completed the BTB Academy
              </p>
            </div>
          </div>

          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl overflow-hidden">
            {wallEntries.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Star size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/20 text-[0.82rem]">Be the first to complete the academy.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {wallEntries.map((entry, i) => (
                  <div
                    key={`${entry.name}-${i}`}
                    className={`flex items-center gap-3 px-5 py-4 ${
                      i < wallEntries.length - (wallEntries.length % 3 === 0 ? 3 : wallEntries.length % 3)
                        ? "border-b border-white/[0.05]"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--btb-red)]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[0.55rem] font-bold text-[var(--btb-red)]">
                        {entry.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.78rem] text-white/60 font-semibold truncate">{entry.name}</div>
                      <div className="text-[0.58rem] text-white/20">
                        {entry.gender === "boys" ? "Boys" : "Girls"} &middot;{" "}
                        {new Date(entry.completedAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   Step content sub-components
   ════════════════════════════════════════════════════════════════════ */

function ReadingContent({
  step,
  isComplete,
  onMarkComplete,
}: {
  step: CourseStep
  isComplete: boolean
  onMarkComplete: () => void
}) {
  const paragraphs = (step.content.description ?? "").split("\n\n")

  return (
    <div>
      <div className="p-6 md:p-8 rounded-xl border border-white/[0.07] bg-white/[0.02] mb-8">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={14} className="text-[var(--btb-red)]" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)]">Reading</span>
        </div>
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[0.88rem] text-white/45 leading-[1.85]">
              {p}
            </p>
          ))}
        </div>
      </div>

      {!isComplete && (
        <button
          onClick={onMarkComplete}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[var(--btb-red)]/80 transition-colors"
        >
          <Check size={14} /> Mark Complete
        </button>
      )}
      {isComplete && (
        <div className="flex items-center gap-2 text-[var(--btb-red)] text-[0.75rem] font-bold uppercase tracking-[1.5px]">
          <Check size={14} /> Completed
        </div>
      )}
    </div>
  )
}

function FilmContent({
  step,
  isComplete,
  onMarkComplete,
}: {
  step: CourseStep
  isComplete: boolean
  onMarkComplete: () => void
}) {
  return (
    <div>
      <div className="aspect-video bg-neutral-900 rounded-xl border border-white/[0.07] flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
            <Play size={24} className="text-white/20 ml-1" />
          </div>
          <p className="text-[0.72rem] text-white/20 uppercase tracking-[1.5px] font-semibold">Video Coming Soon</p>
          {step.content.duration && (
            <p className="text-[0.62rem] text-white/10 mt-1">{step.content.duration} min</p>
          )}
        </div>
      </div>

      {step.content.description && (
        <p className="text-[0.88rem] text-white/40 leading-relaxed mb-8">{step.content.description}</p>
      )}

      {!isComplete && (
        <button
          onClick={onMarkComplete}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[var(--btb-red)]/80 transition-colors"
        >
          <Check size={14} /> Mark Complete
        </button>
      )}
      {isComplete && (
        <div className="flex items-center gap-2 text-[var(--btb-red)] text-[0.75rem] font-bold uppercase tracking-[1.5px]">
          <Check size={14} /> Completed
        </div>
      )}
    </div>
  )
}

function QuestionContent({
  step,
  isComplete,
  selectedOption,
  answerSubmitted,
  onSelectOption,
  onSubmit,
  onMarkComplete,
}: {
  step: CourseStep
  isComplete: boolean
  selectedOption: number | null
  answerSubmitted: boolean
  onSelectOption: (idx: number) => void
  onSubmit: () => void
  onMarkComplete: () => void
}) {
  const correctIdx = step.content.correctAnswer ?? 0
  const isCorrect = selectedOption === correctIdx

  return (
    <div>
      <p className="text-[1rem] text-white/70 leading-relaxed mb-8">{step.content.question}</p>

      <div className="space-y-3 mb-8">
        {step.content.options?.map((opt, i) => {
          let cls = "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18]"
          if (selectedOption === i && !answerSubmitted) cls = "border-[var(--btb-red)] bg-[var(--btb-red)]/10"
          if (answerSubmitted) {
            if (i === correctIdx) cls = "border-green-500/50 bg-green-500/10"
            else if (i === selectedOption && !isCorrect) cls = "border-red-500/50 bg-red-500/10"
          }

          return (
            <button
              key={i}
              onClick={() => !answerSubmitted && !isComplete && onSelectOption(i)}
              disabled={answerSubmitted || isComplete}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left ${cls} ${
                answerSubmitted || isComplete ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 text-[0.65rem] font-bold ${
                  selectedOption === i ? "border-[var(--btb-red)] text-[var(--btb-red)]" : "border-white/15 text-white/25"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <span className={`text-[0.85rem] ${selectedOption === i ? "text-white/80" : "text-white/40"}`}>{opt}</span>
            </button>
          )
        })}
      </div>

      {!answerSubmitted && !isComplete && (
        <button
          onClick={onSubmit}
          disabled={selectedOption === null}
          className={`px-6 py-3 text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg transition-all duration-200 ${
            selectedOption !== null
              ? "bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red)]/80"
              : "bg-white/[0.05] text-white/15 cursor-not-allowed"
          }`}
        >
          Submit Answer
        </button>
      )}

      {answerSubmitted && !isComplete && (
        <div>
          <div className={`p-4 rounded-xl border mb-6 ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <p className={`text-[0.85rem] font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
              {isCorrect ? "Correct!" : "Not quite."}{" "}
              <span className="font-normal text-white/40">The answer is: {step.content.options?.[correctIdx]}</span>
            </p>
          </div>
          <button
            onClick={onMarkComplete}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[var(--btb-red)]/80 transition-colors"
          >
            <Check size={14} /> Mark Complete &amp; Continue
          </button>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-2 text-[var(--btb-red)] text-[0.75rem] font-bold uppercase tracking-[1.5px]">
          <Check size={14} /> Completed
        </div>
      )}
    </div>
  )
}
