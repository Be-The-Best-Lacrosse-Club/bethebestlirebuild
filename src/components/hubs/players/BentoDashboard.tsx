import { Brain, Target, Zap, Film, Swords, Download, Activity, Play, ChevronRight, GraduationCap, Check, BookOpen } from "lucide-react"

type AcademyLesson = {
  id: string
  title: string
  pillar: string
}

type AcademyCourse = {
  id: string
  tier: string
  tierLabel: string
  lessons: AcademyLesson[]
}

type BentoDashboardProps = {
  firstName: string
  streak: number
  overallPct: number
  completedLessons: number
  totalLessons?: number
  gradCoursesCount: number
  badgesCount: number
  setActiveTab: (tab: string) => void
  academyCourses: AcademyCourse[]
  getCourseProgress: (course: AcademyCourse) => number
  TIER_COLORS: Record<string, string>
  PILLAR_COLORS: Record<string, { bg: string; text: string }>
  academyProgress: Record<string, { completedLessons?: string[] }>
}

type RecentItem = {
  course: AcademyCourse
  lesson: AcademyLesson
}

export const BentoDashboard = ({ 
  firstName, 
  streak, 
  overallPct, 
  completedLessons, 
  gradCoursesCount, 
  badgesCount, 
  setActiveTab,
  academyCourses,
  getCourseProgress,
  TIER_COLORS,
  PILLAR_COLORS,
  academyProgress
}: BentoDashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in duration-700">
      
      {/* Welcome Card (Large) */}
      <div className="md:col-span-4 lg:col-span-4 bg-gradient-to-br from-[#0A0A0A] to-[#141414] border border-[#1F1F1F] rounded-3xl p-8 flex flex-col justify-between min-h-[200px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D22630]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#D22630]/10 transition-colors" />
        <div className="relative z-10">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-none mb-2"
            style={{ fontFamily: "'Anton', 'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
            Ready to <span className="text-[#D22630]">Attack,</span> <br />{firstName}?
          </h1>
          <div className="flex items-center gap-4 mt-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-[#D22630]/30 rounded-full backdrop-blur-md">
                <span className="text-xl">🔥</span>
                <span className="text-white font-bold text-sm tracking-tight">{streak} Day Streak</span>
             </div>
             <div className="text-[#888888] text-xs font-bold uppercase tracking-[2px]">Academy Level: Elite</div>
          </div>
        </div>
      </div>

      {/* Progress Circle / Stat (Square) */}
      <div className="md:col-span-2 lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-[#D22630]/50 transition-colors">
        <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" fill="transparent" stroke="#1F1F1F" strokeWidth="8" />
                <circle cx="64" cy="64" r="60" fill="transparent" stroke="#D22630" strokeWidth="8" 
                    strokeDasharray={377} 
                    strokeDashoffset={377 - (377 * overallPct / 100)} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold font-bebas">{overallPct}%</span>
            </div>
        </div>
        <p className="text-[#888888] text-lg font-bold uppercase tracking-[2px]">Overall IQ</p>
      </div>

      {/* Quick Actions (Wide) */}
      <div className="md:col-span-4 lg:col-span-3 grid grid-cols-3 gap-3">
        {[
          { label: "Film", icon: Film, tab: "film", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "IQ", icon: Brain, tab: "academy", color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Plays", icon: Swords, tab: "resources", color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Pos", icon: Target, tab: "academy", color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Sys", icon: Zap, tab: "courses", color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Files", icon: Download, tab: "downloads", color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map(({ label, icon: Icon, tab, color, bg }) => (
          <button
            key={label}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center justify-center gap-2 p-4 ${bg} border border-transparent rounded-2xl hover:border-white/20 hover:scale-[1.05] transition-all group`}
          >
            <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{label}</span>
          </button>
        ))}
      </div>

      {/* Stats Bento (2x2 inside a block) */}
      <div className="md:col-span-2 lg:col-span-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Lessons", value: completedLessons, icon: Activity, color: "text-blue-400" },
            { label: "Badges", value: badgesCount, icon: GraduationCap, color: "text-yellow-400" },
            { label: "Courses", value: gradCoursesCount, icon: BookOpen, color: "text-emerald-400" },
            { label: "Total Min", value: Math.round(completedLessons * 8), icon: Zap, color: "text-[#D22630]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} className={color} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">{label}</span>
              </div>
              <span className="text-2xl font-bold font-bebas">{value}</span>
            </div>
          ))}
      </div>

      {/* Continue Training (Long) */}
      <div className="md:col-span-3 lg:col-span-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-[#D22630]" />
            <h3 className="font-bold uppercase tracking-wider text-sm italic">Resume Mission</h3>
          </div>
          <button onClick={() => setActiveTab("academy")} className="text-[10px] font-bold uppercase text-[#888888] hover:text-white transition-colors">View All</button>
        </div>
        <div className="space-y-3">
          {academyCourses.slice(0, 3).map((course) => {
            const pct = getCourseProgress(course)
            return (
              <button
                key={course.id}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#141414] border border-transparent hover:border-[#D22630]/30 transition-all group text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TIER_COLORS[course.tier]} flex items-center justify-center shrink-0 shadow-lg shadow-black/50`}>
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate tracking-tight">{course.tierLabel} Academy</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-[#D22630] transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#888888]">{pct}%</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#888888] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity (Mobile Hidden / Tablet+ Show) */}
      <div className="md:col-span-3 lg:col-span-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 overflow-hidden relative">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={16} className="text-[#D22630]" />
          <h3 className="font-bold uppercase tracking-wider text-sm italic">Recent Intelligence</h3>
        </div>
        <div className="space-y-4">
          {completedLessons === 0 ? (
            <p className="text-[#888888] text-xs text-center py-10 italic">Awaiting field data...</p>
          ) : (
            academyCourses.flatMap((course) =>
              (academyProgress[course.id]?.completedLessons ?? []).map((lessonId) => {
                const lesson = course.lessons.find((l) => l.id === lessonId)
                return lesson ? { course, lesson } : null
              }).filter((item): item is RecentItem => Boolean(item))
            ).slice(-4).reverse().map((item, idx) => {
              const colors = PILLAR_COLORS[item.lesson.pillar] ?? { bg: "bg-[#D22630]", text: "text-[#D22630]" }
              return (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className={`w-2 h-10 rounded-full ${colors.bg} flex flex-col items-center justify-center shrink-0`}>
                     <div className={`w-1 h-4 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-[var(--btb-red)] transition-colors">{item.lesson.title}</p>
                    <p className="text-[#888888] text-[10px] uppercase font-bold tracking-widest">{item.course.tierLabel} Academy</p>
                  </div>
                  <Check size={14} className="text-[#00D26A] shrink-0" />
                </div>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}
