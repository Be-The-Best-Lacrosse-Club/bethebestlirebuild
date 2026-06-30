import { Calendar, Award, FileText, Layout, GraduationCap, ChevronRight, Clock, Shield, Bell } from "lucide-react"

type FamilyUser = {
  name?: string
}

type ScheduleEvent = {
  isGame?: boolean
  startDate: string
  name?: string
  opponentName?: string
}

type FamilySchedule = {
  events?: ScheduleEvent[]
}

type FamilyBentoProps = {
  user?: FamilyUser | null
  schedule?: FamilySchedule | null
  scheduleLoading?: boolean
}

export const FamilyBento = ({ user, schedule, scheduleLoading }: FamilyBentoProps) => {
  const firstName = user?.name?.split(" ")[0] || "Parent"
  
  const upcomingEvents = schedule?.events?.slice(0, 3) || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-in fade-in duration-700">
      
      {/* Welcome Card */}
      <div className="md:col-span-4 lg:col-span-4 bg-gradient-to-br from-[#0A0A0A] to-[#141414] border border-[#1F1F1F] rounded-3xl p-8 flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D22630]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#D22630]/10 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-[#888888] font-bold uppercase tracking-[3px] text-[10px]">
             <Shield size={12} className="text-[#D22630]" />
             BTB Secure Family Portal
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-none mb-2 font-bebas tracking-wider">
            Command <span className="text-[#D22630]">Center</span>
          </h1>
          <p className="text-[#888888] font-montserrat text-sm max-w-md">
            Welcome back, {firstName}. Manage your player's schedule, recruiting path, and Academy progress from one unified dashboard.
          </p>
        </div>
      </div>

      {/* Quick Profile / Status */}
      <div className="md:col-span-2 lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-[#D22630]/50 transition-colors">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D22630] to-red-900 flex items-center justify-center mb-4 text-3xl font-bebas text-white shadow-xl shadow-red-900/20">
          {user?.name?.[0] || "P"}
        </div>
        <h2 className="text-xl font-bold font-bebas text-white uppercase tracking-widest">{user?.name}</h2>
        <p className="text-[#888888] text-[10px] font-bold uppercase tracking-[2px] mt-1">BTB Family Member</p>
      </div>

      {/* Schedule Bento (Long Vertical) */}
      <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#D22630]" />
            <h3 className="font-bold uppercase tracking-wider text-sm italic">Live Schedule</h3>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#00D26A] animate-pulse" />
        </div>

        <div className="flex-1 space-y-4">
          {scheduleLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
               <div className="w-6 h-6 border-2 border-[#D22630] border-t-transparent rounded-full animate-spin" />
               <span className="text-[10px] text-[#444444] font-bold uppercase">Syncing...</span>
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#141414] border border-transparent hover:border-white/10 transition-all group">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-bold text-[#D22630] uppercase tracking-widest">{event.isGame ? 'Game' : 'Practice'}</span>
                   <span className="text-[10px] text-[#888888] font-mono">{new Date(event.startDate).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric'})}</span>
                </div>
                <p className="text-white text-xs font-bold leading-tight group-hover:text-[var(--btb-red)] transition-colors">{event.name || event.opponentName || 'Team Event'}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[#444444]">
                   <Clock size={10} />
                   <span className="text-[10px] font-bold uppercase">{new Date(event.startDate).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#444444] text-xs italic text-center py-12">No upcoming events synced.</p>
          )}
        </div>

        <button className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white font-bold uppercase tracking-widest hover:bg-[#D22630] hover:border-[#D22630] transition-all">
          View Full Calendar
        </button>
      </div>

      {/* Main Hub Links (Grid inside Bento) */}
      <div className="md:col-span-4 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "Academy", icon: GraduationCap, href: "/academy", color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Recruiting", icon: Award, href: "/recruiting", color: "text-amber-400", bg: "bg-amber-500/10" },
          { title: "Payments", icon: FileText, href: "https://go.teamsnap.com", external: true, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { title: "Dashboard", icon: Layout, href: "/parent-hub", color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((link) => (
          <button
            key={link.title}
            className={`flex flex-col items-center justify-center gap-3 p-6 ${link.bg} border border-transparent rounded-3xl hover:border-white/20 hover:scale-[1.03] transition-all group`}
          >
            <link.icon size={24} className={`${link.color} group-hover:scale-110 transition-transform`} />
            <span className="text-white text-xs font-bold uppercase tracking-[2px]">{link.title}</span>
          </button>
        ))}
      </div>

      {/* Bottom Row - Support & Alerts */}
      <div className="md:col-span-2 lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
               <Bell size={18} />
            </div>
            <div>
               <h4 className="text-white text-xs font-bold uppercase tracking-wider">Alerts</h4>
               <p className="text-[#888888] text-[10px]">2 New Notifications</p>
            </div>
         </div>
         <ChevronRight size={16} className="text-[#444444] group-hover:text-white transition-colors" />
      </div>

      <div className="md:col-span-2 lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-3xl p-6 flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
               <Shield size={18} />
            </div>
            <div>
               <h4 className="text-white text-xs font-bold uppercase tracking-wider">Waivers</h4>
               <p className="text-[#888888] text-[10px]">All Clear</p>
            </div>
         </div>
         <ChevronRight size={16} className="text-[#444444] group-hover:text-white transition-colors" />
      </div>

    </div>
  )
}
