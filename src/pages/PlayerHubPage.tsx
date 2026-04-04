import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useProgress } from "@/hooks/useProgress"
import { getCourses, getCoursesByGradYear } from "@/lib/courseData"
import { CourseView } from "@/components/hubs/players/CourseView"
import { SEO } from "@/components/shared/SEO"
import { ArrowLeft, LogOut, BookOpen, Play, Trophy, GraduationCap, ChevronRight } from "lucide-react"
import type { Gender, Course } from "@/types"

export function PlayerHubPage({ gender }: { gender: Gender }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { getCourseCompletion } = useProgress(user?.id ?? "")
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  const label = gender === "boys" ? "Boys" : "Girls"

  const courses = useMemo(() => {
    if (user?.gradYear) {
      return getCoursesByGradYear(gender, user.gradYear)
    }
    return getCourses(gender)
  }, [gender, user?.gradYear])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  // ----- Course detail view -----
  if (activeCourse && user) {
    return (
      <CourseView
        course={activeCourse}
        userId={user.id}
        onBack={() => setActiveCourse(null)}
      />
    )
  }

  // ----- Dashboard view -----
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title={`${label} Players Hub | BTB Lacrosse Club`}
        description={`BTB Lacrosse ${label.toLowerCase()} players hub — access courses, film study, and development tracking.`}
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
            BTB <span className="text-[var(--btb-red)]">{label}</span> Players Hub
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[0.72rem] font-semibold uppercase tracking-[1.5px]"
          >
            Logout <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-6 pt-28 pb-24">

        {/* Welcome */}
        <div className="mb-14">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-3">Players Hub</div>
          <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Welcome back, <span className="text-[var(--btb-red)]">{user?.name?.split(" ")[0] ?? "Player"}</span>
          </h1>
          <p className="text-[0.88rem] text-white/35 max-w-[520px] leading-relaxed">
            Your courses, film sessions, and progress — all in one place.
            {user?.gradYear && (
              <span className="ml-1 text-white/20">Class of {user.gradYear}</span>
            )}
          </p>
        </div>

        {/* Academy Banner */}
        <div
          onClick={() => navigate(`/${gender}/academy`)}
          className="mb-14 p-6 rounded-xl border border-[var(--btb-red)]/25 bg-[var(--btb-red)]/[0.04] cursor-pointer hover:border-[var(--btb-red)]/50 hover:bg-[var(--btb-red)]/[0.07] transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--btb-red)]/15 flex items-center justify-center">
                <GraduationCap size={20} className="text-[var(--btb-red)]" />
              </div>
              <div>
                <h3 className="font-display text-[1.05rem] uppercase tracking-wide">BTB Academy</h3>
                <p className="text-[0.72rem] text-white/30 mt-0.5">
                  Character, leadership, lacrosse IQ & film study — complete all 6 modules to earn your spot on the Wall of Fame
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-[var(--btb-red)] transition-colors flex-shrink-0" />
          </div>
        </div>

        {/* Course Grid */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
              <BookOpen size={16} className="text-[var(--btb-red)]" />
            </div>
            <h2 className="font-display text-[1.3rem] uppercase tracking-wide">Your Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl p-10 text-center">
              <p className="text-white/30 text-[0.88rem]">No courses available yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const pct = getCourseCompletion(course.id, course.steps.length)
                const started = pct > 0
                const completed = pct === 100

                return (
                  <div
                    key={course.id}
                    className={`group p-6 rounded-xl border transition-all duration-300 ${
                      completed
                        ? "border-[var(--btb-red)]/40 bg-[var(--btb-red)]/5"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-display text-[1.05rem] uppercase tracking-wide leading-snug pr-4">
                        {course.title}
                      </h3>
                      {completed && (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--btb-red)]/20 flex items-center justify-center">
                          <Trophy size={13} className="text-[var(--btb-red)]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[0.78rem] text-white/30 leading-relaxed mb-5 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-white/25">
                          Progress
                        </span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-white/40">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-[5px] bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[0.7rem] text-white/20">
                        {course.steps.length} steps
                      </span>
                      <button
                        onClick={() => setActiveCourse(course)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[0.7rem] font-bold uppercase tracking-[1.5px] transition-all duration-200 ${
                          started
                            ? "bg-[var(--btb-red)] text-white hover:bg-[var(--btb-red)]/80"
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

        {/* Completion Board */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[var(--btb-red)]/15 flex items-center justify-center">
              <Trophy size={16} className="text-[var(--btb-red)]" />
            </div>
            <h2 className="font-display text-[1.3rem] uppercase tracking-wide">Completion Board</h2>
          </div>

          <div className="border border-white/[0.07] bg-white/[0.02] rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_60px] md:grid-cols-[1fr_200px_80px] gap-4 px-6 py-3 border-b border-white/[0.07] bg-white/[0.02]">
              <span className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/25">Course</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/25 text-center">Progress</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/25 text-right">%</span>
            </div>

            {/* Table rows */}
            {courses.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/20 text-[0.8rem]">No courses to display</div>
            ) : (
              courses.map((course, i) => {
                const pct = getCourseCompletion(course.id, course.steps.length)
                return (
                  <div
                    key={course.id}
                    className={`grid grid-cols-[1fr_100px_60px] md:grid-cols-[1fr_200px_80px] gap-4 px-6 py-4 items-center ${
                      i < courses.length - 1 ? "border-b border-white/[0.05]" : ""
                    }`}
                  >
                    <span className="text-[0.82rem] text-white/60 truncate">{course.title}</span>
                    <div className="h-[4px] bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--btb-red)] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-[0.82rem] font-bold text-right ${
                      pct === 100 ? "text-[var(--btb-red)]" : "text-white/40"
                    }`}>
                      {pct}%
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
