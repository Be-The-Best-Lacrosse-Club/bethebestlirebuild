import { useState, useMemo } from "react"
import { useProgress } from "@/hooks/useProgress"
import { ArrowLeft, Check, ChevronRight, Play, BookOpen, HelpCircle, Dumbbell, FileText, Video } from "lucide-react"
import type { Course, CourseStep } from "@/types"

interface CourseViewProps {
  course: Course
  userId: string
  onBack: () => void
}

const stepIcons: Record<CourseStep["type"], typeof Play> = {
  film: Video,
  question: HelpCircle,
  drill: Dumbbell,
  reading: FileText,
}

export function CourseView({ course, userId, onBack }: CourseViewProps) {
  const { getProgress, markStepComplete, getCourseCompletion } = useProgress(userId)
  const progress = getProgress(course.id)
  const completedSet = useMemo(() => new Set(progress.completedSteps), [progress.completedSteps])

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    // Start on the first incomplete step, or step 0
    const firstIncomplete = course.steps.findIndex((s) => !completedSet.has(s.id))
    return firstIncomplete === -1 ? 0 : firstIncomplete
  })

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const step = course.steps[currentStepIndex]
  const isStepComplete = completedSet.has(step.id)
  const pct = getCourseCompletion(course.id, course.steps.length)
  const completedCount = progress.completedSteps.length

  const goToStep = (idx: number) => {
    setCurrentStepIndex(idx)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setSidebarOpen(false)
  }

  const handleMarkComplete = () => {
    markStepComplete(course.id, step.id)
    // Auto-advance to next incomplete step
    const nextIncomplete = course.steps.findIndex(
      (s, i) => i > currentStepIndex && !completedSet.has(s.id) && s.id !== step.id
    )
    if (nextIncomplete !== -1) {
      goToStep(nextIncomplete)
    }
  }

  const handleSubmitAnswer = () => {
    setAnswerSubmitted(true)
  }

  const handleMarkCompleteAndContinue = () => {
    handleMarkComplete()
  }

  const advanceToNext = () => {
    const nextIncomplete = course.steps.findIndex(
      (s, i) => i > currentStepIndex && !completedSet.has(s.id)
    )
    if (nextIncomplete !== -1) {
      goToStep(nextIncomplete)
    } else if (currentStepIndex < course.steps.length - 1) {
      goToStep(currentStepIndex + 1)
    }
  }

  const StepIcon = stepIcons[step.type]

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px] flex-shrink-0"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex-1 min-w-0 text-center">
            <span className="font-display text-[0.95rem] uppercase tracking-wide truncate block">
              {course.title}
            </span>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center gap-1.5 text-white/30 hover:text-white text-[0.7rem] font-bold uppercase tracking-[1.5px] flex-shrink-0"
          >
            <BookOpen size={14} /> Steps
          </button>

          <div className="hidden md:block flex-shrink-0 w-[80px]" />
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-white/[0.06]">
          <div
            className="h-full bg-[var(--btb-red)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex max-w-[1200px] mx-auto pt-[60px]">

        {/* Sidebar — desktop always, mobile toggle */}
        <aside
          className={`
            fixed md:sticky top-[60px] left-0 z-40 h-[calc(100vh-60px)]
            w-[280px] bg-neutral-950 border-r border-white/[0.07]
            overflow-y-auto flex-shrink-0
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="p-5">
            <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-white/20 mb-1">Progress</div>
            <div className="text-[0.88rem] text-white/50 mb-4">
              {completedCount} of {course.steps.length} complete
            </div>

            <div className="space-y-1">
              {course.steps.map((s, i) => {
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
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6rem] font-bold ${
                      done
                        ? "bg-[var(--btb-red)] text-white"
                        : active
                          ? "border-2 border-[var(--btb-red)] text-[var(--btb-red)]"
                          : "border border-white/15 text-white/25"
                    }`}>
                      {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[0.72rem] font-semibold truncate ${
                        active ? "text-white" : done ? "text-white/50" : "text-white/30"
                      }`}>
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

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-6 md:px-12 py-10">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
              <StepIcon size={15} className="text-[var(--btb-red)]" />
            </div>
            <span className="text-[0.6rem] font-bold uppercase tracking-[3px] text-white/20">
              Step {step.stepNumber} of {course.steps.length} &middot; {step.type}
            </span>
          </div>

          <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] uppercase tracking-wide leading-snug mb-8">
            {step.title}
          </h2>

          {/* Step content by type */}
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
              onMarkCompleteAndContinue={handleMarkCompleteAndContinue}
            />
          )}

          {step.type === "drill" && (
            <DrillContent step={step} isComplete={isStepComplete} onMarkComplete={handleMarkComplete} />
          )}

          {step.type === "reading" && (
            <ReadingContent step={step} isComplete={isStepComplete} onMarkComplete={handleMarkComplete} />
          )}

          {/* Next step button (when already complete) */}
          {isStepComplete && currentStepIndex < course.steps.length - 1 && (
            <div className="mt-8 pt-6 border-t border-white/[0.07]">
              <button
                onClick={advanceToNext}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:bg-[var(--btb-red)]/80 transition-colors"
              >
                Next Step <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* All complete */}
          {pct === 100 && (
            <div className="mt-10 p-6 rounded-xl border border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5 text-center">
              <div className="font-display text-[1.3rem] uppercase tracking-wide text-[var(--btb-red)] mb-2">
                Course Complete
              </div>
              <p className="text-[0.82rem] text-white/40">
                You have finished all {course.steps.length} steps. Nice work.
              </p>
              <button
                onClick={onBack}
                className="mt-5 px-6 py-2.5 border border-white/15 text-white/50 text-[0.7rem] font-bold uppercase tracking-[1.5px] rounded-lg hover:border-white/40 hover:text-white transition-all"
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

/* ───────── Step type sub-components ───────── */

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
      {/* Video placeholder */}
      <div className="aspect-video bg-neutral-900 rounded-xl border border-white/[0.07] flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
            <Play size={24} className="text-white/20 ml-1" />
          </div>
          <p className="text-[0.72rem] text-white/20 uppercase tracking-[1.5px] font-semibold">Film Coming Soon</p>
          {step.content.duration && (
            <p className="text-[0.62rem] text-white/10 mt-1">{step.content.duration} min</p>
          )}
        </div>
      </div>

      {step.content.description && (
        <p className="text-[0.88rem] text-white/40 leading-relaxed mb-8">
          {step.content.description}
        </p>
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
  onMarkCompleteAndContinue,
}: {
  step: CourseStep
  isComplete: boolean
  selectedOption: number | null
  answerSubmitted: boolean
  onSelectOption: (idx: number) => void
  onSubmit: () => void
  onMarkCompleteAndContinue: () => void
}) {
  const correctIdx = step.content.correctAnswer ?? 0
  const isCorrect = selectedOption === correctIdx

  return (
    <div>
      <p className="text-[1rem] text-white/70 leading-relaxed mb-8">
        {step.content.question}
      </p>

      <div className="space-y-3 mb-8">
        {step.content.options?.map((opt, i) => {
          let optClasses = "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18]"

          if (selectedOption === i && !answerSubmitted) {
            optClasses = "border-[var(--btb-red)] bg-[var(--btb-red)]/10"
          }

          if (answerSubmitted) {
            if (i === correctIdx) {
              optClasses = "border-green-500/50 bg-green-500/10"
            } else if (i === selectedOption && !isCorrect) {
              optClasses = "border-red-500/50 bg-red-500/10"
            }
          }

          return (
            <button
              key={i}
              onClick={() => !answerSubmitted && !isComplete && onSelectOption(i)}
              disabled={answerSubmitted || isComplete}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left ${optClasses} ${
                answerSubmitted || isComplete ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 text-[0.65rem] font-bold ${
                selectedOption === i
                  ? "border-[var(--btb-red)] text-[var(--btb-red)]"
                  : "border-white/15 text-white/25"
              }`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className={`text-[0.85rem] ${
                selectedOption === i ? "text-white/80" : "text-white/40"
              }`}>
                {opt}
              </span>
            </button>
          )
        })}
      </div>

      {/* Submit / feedback / continue */}
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
          <div className={`p-4 rounded-xl border mb-6 ${
            isCorrect
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}>
            <p className={`text-[0.85rem] font-semibold ${
              isCorrect ? "text-green-400" : "text-red-400"
            }`}>
              {isCorrect ? "Correct!" : "Not quite."}{" "}
              <span className="font-normal text-white/40">
                The answer is: {step.content.options?.[correctIdx]}
              </span>
            </p>
          </div>

          <button
            onClick={onMarkCompleteAndContinue}
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

function DrillContent({
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
      <div className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] mb-8">
        {step.content.duration && (
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={14} className="text-[var(--btb-red)]" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)]">
              {step.content.duration} minutes
            </span>
          </div>
        )}
        {step.content.description && (
          <p className="text-[0.88rem] text-white/40 leading-relaxed">
            {step.content.description}
          </p>
        )}
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

function ReadingContent({
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
      <div className="p-6 rounded-xl border border-white/[0.07] bg-white/[0.02] mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={14} className="text-[var(--btb-red)]" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[2px] text-[var(--btb-red)]">
            Reading
          </span>
        </div>
        {step.content.description && (
          <p className="text-[0.88rem] text-white/45 leading-[1.8]">
            {step.content.description}
          </p>
        )}
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
