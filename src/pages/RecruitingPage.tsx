/**
 * RecruitingPage — public-facing recruiting hub at /recruiting
 *
 * Displays the 2026 BTB Showcase Calendar (35 events) by tier and gender.
 * Includes the BTB recruiting philosophy and a downloadable PDF version.
 */

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SEO } from "@/components/shared/SEO"
import {
  ArrowRight,
  Download,
  Calendar,
  Trophy,
  GraduationCap,
  MapPin,
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────

const stats = [
  { num: "35", label: "Events Tracked" },
  { num: "19", label: "Boys Events" },
  { num: "16", label: "Girls Events" },
  { num: "4",  label: "Exposure Tiers" },
]

interface TierMeta {
  id: 1 | 2 | 3 | 4
  label: string
  short: string
  desc: string
  accent: string
  border: string
  bar: string
}

const tiers: TierMeta[] = [
  {
    id: 1,
    label: "Tier 1 — Elite",
    short: "ELITE",
    desc: "Invite-only or top-end. National D1 coach turnout. Highest ceiling. Reserved for the top of your roster — uncommitted, high-major track players.",
    accent: "text-[var(--btb-red)]",
    border: "border-[var(--btb-red)]/30",
    bar: "bg-[var(--btb-red)]",
  },
  {
    id: 2,
    label: "Tier 2 — Strong D1 / Academic",
    short: "STRONG D1 / ACADEMIC",
    desc: "High-volume coach lists, academic D1/D3 recruiting, hybrid training-plus-exposure events. The workhorse tier for most committed prospects.",
    accent: "text-white",
    border: "border-white/30",
    bar: "bg-white",
  },
  {
    id: 3,
    label: "Tier 3 — Underclass Exposure",
    short: "UNDERCLASS EXPOSURE",
    desc: "2029s and 2030s only. Get on the radar early. Apply by January — these events sell out. Development still drives the decision; exposure is the bonus.",
    accent: "text-zinc-400",
    border: "border-zinc-500/30",
    bar: "bg-zinc-400",
  },
  {
    id: 4,
    label: "Tier 4 — Local / Regional / D3",
    short: "LOCAL / REGIONAL / D3",
    desc: "College ID camps and D3-specialist events. Smart pickups when a target school is on the camp list. Don't replace exposure events with these.",
    accent: "text-zinc-500",
    border: "border-zinc-600/30",
    bar: "bg-zinc-500",
  },
]

interface ShowcaseEvent {
  name: string
  format: string
  location: string
  gradYears: string
  date: string
  bestFor: string
  notes: string
  tier: 1 | 2 | 3 | 4
}

const boysEvents: ShowcaseEvent[] = [
  // Tier 1
  { tier: 1, name: "Adrenaline Black Card", format: "Invite-only / showcase", location: "Aliso Viejo, CA", gradYears: "2027, 2028, 2029", date: "Jul 2026 (TBA)", bestFor: "Top D1 uncommitted", notes: "Highest-ceiling West Coast event. Invite required." },
  { tier: 1, name: "Inside Lacrosse Invitational", format: "Invite-only / showcase", location: "Salisbury, MD", gradYears: "2027, 2028", date: "Jul 2026", bestFor: "Top 100 national prospects", notes: "Industry-recognized stamp. Apply via club director." },
  { tier: 1, name: "Nike Blue Chip 225", format: "Invite-only / showcase", location: "Bel Air, MD", gradYears: "2027, 2028", date: "Jun 2026", bestFor: "Top D1 prospects", notes: "Industry standard for elite-tier evaluation." },
  { tier: 1, name: "Maverik Showtime", format: "Showcase", location: "Long Island, NY", gradYears: "2027, 2028, 2029", date: "Jul 2026", bestFor: "High D1 exposure", notes: "Strong national coach turnout. Local advantage for BTB players." },
  { tier: 1, name: "Under Armour All-America Tryouts", format: "Tryout / showcase", location: "Multiple regional sites", gradYears: "2027", date: "Jun 2026", bestFor: "Senior class top recruits", notes: "Path to UA All-America Game (Jul 2026, Towson)." },
  // Tier 2
  { tier: 2, name: "Lacrosse Masters — High Academic D1/D3", format: "Prospect camp", location: "Loomis Chaffee, Windsor, CT", gradYears: "2027, 2028, 2029", date: "Jun 9–10, 2026", bestFor: "Ivy / NESCAC track", notes: "Amherst, Brown, Harvard, Penn, Dartmouth, Hopkins, Navy on staff." },
  { tier: 2, name: "Lacrosse Masters — High Academic DI Prospect", format: "Prospect camp", location: "St. George's School, Newport, RI", gradYears: "2027, 2028", date: "Jul 27–28, 2026", bestFor: "Top academic D1 schools", notes: "Brown, Harvard, Penn, Dartmouth, Hopkins, Navy, Notre Dame staff." },
  { tier: 2, name: "Best in Class — Boys 2028", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2028", date: "Jun 9–10, 2026", bestFor: "Hybrid skill dev + exposure", notes: "Application required. Coach recommendations help." },
  { tier: 2, name: "Best in Class — Boys 2029", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2029", date: "Jun 22–23, 2026", bestFor: "Hybrid skill dev + exposure", notes: "Application required." },
  { tier: 2, name: "Best in Class — Boys 2030", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2030", date: "Jun 22–23, 2026", bestFor: "Underclass hybrid model", notes: "Application required." },
  { tier: 2, name: "Prime Time Recruiting Showcase — UMass", format: "Showcase", location: "UMass Amherst, MA", gradYears: "2027, 2028, 2029", date: "Jun 12, 2026", bestFor: "Volume coach exposure", notes: "30–60+ college coaches. Goalie/FOGO sells out fast." },
  { tier: 2, name: "Prime Time Recruiting Showcase — Calvert Hall", format: "Showcase", location: "Towson, MD", gradYears: "2027, 2028, 2029", date: "Jun 12, 2026", bestFor: "Mid-Atlantic D1 exposure", notes: "Strong regional coach turnout." },
  { tier: 2, name: "Trilogy Recruiting Showcase", format: "Showcase + seminars", location: "Lebanon, OH", gradYears: "2026, 2027, 2028", date: "Summer 2026", bestFor: "Midwest exposure + recruiting education", notes: "Includes recruiting seminars led by NCAA directors." },
  // Tier 3
  { tier: 3, name: "Apex Freshmen Select", format: "Invite/application showcase", location: "TBA", gradYears: "2030", date: "Summer 2026", bestFor: "Early D1 visibility", notes: "Sold out 2025. Apply early. Grad years separated." },
  { tier: 3, name: "Apex Sophomore Select", format: "Invite/application showcase", location: "TBA", gradYears: "2029", date: "Summer 2026", bestFor: "Early D1 visibility", notes: "Sold out 2025. Apply early." },
  { tier: 3, name: "Rising Lacrosse Boys", format: "2-day train + showcase", location: "Northeast", gradYears: "2029, 2030, 2031", date: "Summer 2026", bestFor: "Development + early exposure", notes: "Day 1 training, Day 2 in front of coaches." },
  { tier: 3, name: "Top 205 — Long Island", format: "Invite showcase", location: "Long Island, NY", gradYears: "2029, 2030, 2031", date: "Summer 2026", bestFor: "LI / Northeast underclass exposure", notes: "Local-advantage event. Strong regional coach turnout." },
  // Tier 4
  { tier: 4, name: "Hofstra Pride Camp", format: "College ID camp", location: "Hempstead, NY", gradYears: "All", date: "Summer 2026", bestFor: "Hofstra-specific exposure", notes: "Local. Direct interaction with Hofstra staff." },
  { tier: 4, name: "Stony Brook Boys Lacrosse Camp", format: "College ID camp", location: "Stony Brook, NY", gradYears: "All", date: "Summer 2026", bestFor: "Stony Brook exposure", notes: "Local. CAA D1 program." },
]

const girlsEvents: ShowcaseEvent[] = [
  // Tier 1
  { tier: 1, name: "All-America Lacrosse — Burn Division", format: "Tournament / showcase", location: "TBA", gradYears: "2028", date: "Jul 24–26, 2026", bestFor: "Rising junior elite exposure", notes: "Hundreds of college coaches. Tier 1 destination event." },
  { tier: 1, name: "Capital Cup", format: "Tournament", location: "Annapolis, MD", gradYears: "2027, 2028, 2029", date: "Summer 2026", bestFor: "Top D1 exposure", notes: "Heavy D1 turnout. Annapolis circuit gold standard." },
  { tier: 1, name: "Champions Cup (IWLCA)", format: "Tournament", location: "Hampton, VA", gradYears: "2027, 2028, 2029", date: "Nov 2026", bestFor: "National D1 exposure", notes: "IWLCA-sanctioned. Premier fall event for committed clubs." },
  { tier: 1, name: "Nike Elite G8", format: "Tournament", location: "Multiple sites", gradYears: "2027, 2028, 2029", date: "Summer 2026", bestFor: "National-level club teams", notes: "Top 8 club teams per region. High-stakes evaluation." },
  // Tier 2
  { tier: 2, name: "Best in Class — Girls 2028", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2028", date: "Jun 17–18, 2026", bestFor: "Hybrid skill dev + recruiting", notes: "Application required. Coach recommendations help." },
  { tier: 2, name: "Best in Class — Girls 2029", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2029", date: "Jun 15–16, 2026", bestFor: "Hybrid skill dev + recruiting", notes: "Application required." },
  { tier: 2, name: "Best in Class — Girls 2030", format: "Training + recruiting (2-day)", location: "TBA", gradYears: "2030", date: "Jun 15–16, 2026", bestFor: "Underclass hybrid model", notes: "Application required." },
  { tier: 2, name: "Top Threat Tournaments — Summer Kickoff", format: "Tournament", location: "New Jersey", gradYears: "All", date: "Jun 5, 2026", bestFor: "East Coast circuit launch", notes: "Strong tournament infrastructure. NJ/NC/GA/FL circuit." },
  { tier: 2, name: "Rising Lacrosse Girls", format: "2-day train + showcase", location: "Northeast", gradYears: "2028, 2029, 2030", date: "Summer 2026", bestFor: "Development + recruiting", notes: "Day 1 training, Day 2 in front of recruiters." },
  // Tier 3
  { tier: 3, name: "Apex Freshmen Select (Girls)", format: "Invite/application showcase", location: "TBA", gradYears: "2030", date: "Summer 2026", bestFor: "Early D1 visibility", notes: "Sold out 2025. Mic'd-up coach interaction format." },
  { tier: 3, name: "Apex Sophomore Select (Girls)", format: "Invite/application showcase", location: "TBA", gradYears: "2029", date: "Summer 2026", bestFor: "Early D1 visibility", notes: "Sold out 2025. Apply early." },
  // Tier 4
  { tier: 4, name: "Hofstra Girls ID Camp", format: "College ID camp", location: "Hempstead, NY", gradYears: "All", date: "Summer 2026", bestFor: "Hofstra-specific exposure", notes: "Local. Direct staff interaction." },
  { tier: 4, name: "Stony Brook Girls ID Camp", format: "College ID camp", location: "Stony Brook, NY", gradYears: "All", date: "Summer 2026", bestFor: "Stony Brook exposure", notes: "Local. CAA D1 program." },
  { tier: 4, name: "Adelphi Girls ID Camp", format: "College ID camp", location: "Garden City, NY", gradYears: "All", date: "Summer 2026", bestFor: "Adelphi (D2) exposure", notes: "Local. Top D2 program in region." },
  { tier: 4, name: "LIU Girls ID Camp", format: "College ID camp", location: "Brookville, NY", gradYears: "All", date: "Summer 2026", bestFor: "LIU exposure", notes: "Local D1 program." },
  { tier: 4, name: "Prep School Girls Showcase (D3)", format: "Invite-only showcase", location: "TBA", gradYears: "2027, 2028", date: "May 31, 2026", bestFor: "D3-only target list", notes: "D3 ONLY event. Invite-only. 3 games." },
]

const buildSummerSteps = [
  { num: "01", title: "Start with grad year", body: "Filter to events open to your player's class." },
  { num: "02", title: "Pick a Tier 1 or 2 anchor", body: "Choose based on the divisions you're realistically targeting." },
  { num: "03", title: "Add 1–2 ID camps", body: "Target college ID camps for schools on your shortlist." },
  { num: "04", title: "Apply by January", body: "Invite-only events sell out. Late applications get waitlisted." },
  { num: "05", title: "Confirm coach RSVPs", body: "The flyer logo list is marketing. The RSVP list is the real number." },
]

const btbDeliverables = [
  "Mid-season evaluations with development goals tied directly to recruiting timelines",
  "Verified film cutdowns and HUDL highlight templates aligned to college coach expectations",
  "Coach-to-coach communication on behalf of select-tier players",
  "Tier-matched showcase recommendations per player — no generic lists",
]

const familyChecklist = [
  { title: "RSVP list, not flyer list", body: "Ask the event for the confirmed coach RSVP roster." },
  { title: "Field count", body: "Smaller field counts mean better evaluation." },
  { title: "Position-specific reps", body: "Goalies and FOGOs need events that guarantee touches." },
  { title: "Conflicts", body: "Don't double-book a Tier 1 event the same weekend as a major club tournament." },
]

// ─── Components ───────────────────────────────────────────────────────

function EventTable({ events, gender }: { events: ShowcaseEvent[]; gender: "boys" | "girls" }) {
  return (
    <div className="space-y-10">
      {tiers.map((tier) => {
        const tierEvents = events.filter((e) => e.tier === tier.id)
        if (tierEvents.length === 0) return null
        return (
          <div key={tier.id}>
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${tier.border}`}>
              <h3 className={`font-display text-2xl uppercase tracking-wide ${tier.accent}`}>
                {tier.label}
              </h3>
              <span className="text-[0.65rem] font-bold uppercase tracking-[2px] text-white/40">
                {tierEvents.length} {tierEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tierEvents.map((evt) => (
                <div
                  key={`${gender}-${evt.name}`}
                  className={`relative p-5 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${tier.border}`}
                >
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${tier.bar}`} />
                  <h4 className="font-display text-[1.05rem] uppercase tracking-wide text-white mb-1">
                    {evt.name}
                  </h4>
                  <p className="text-[0.7rem] text-white/40 mb-3">
                    {evt.format} · {evt.location}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-[0.72rem]">
                    <div>
                      <div className="text-[0.55rem] font-bold uppercase tracking-[2px] text-white/30 mb-0.5">Grad Years</div>
                      <div className="text-white/80 font-semibold">{evt.gradYears}</div>
                    </div>
                    <div>
                      <div className="text-[0.55rem] font-bold uppercase tracking-[2px] text-white/30 mb-0.5">Date</div>
                      <div className={`font-semibold ${tier.accent}`}>{evt.date}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-[0.55rem] font-bold uppercase tracking-[2px] text-white/30 mb-0.5">Best For</div>
                    <div className="text-[0.78rem] text-white/70">{evt.bestFor}</div>
                  </div>

                  <p className="text-[0.7rem] text-white/45 leading-relaxed border-t border-white/[0.06] pt-3">
                    {evt.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────

export function RecruitingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <SEO
        title="2026 Showcase Calendar — BTB Lacrosse Recruiting"
        description="The definitive 2026 showcase calendar for BTB Lacrosse families. 35 events tracked across 4 exposure tiers, tiered by actual coach attendance and fit for your player's grad year."
      />

      <div className="bg-black text-white">

        {/* ─── Hero ───────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 px-6 border-b border-white/[0.07] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--btb-red)]/[0.06] via-transparent to-transparent pointer-events-none" />

          <div className="max-w-[1100px] mx-auto relative">
            <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[var(--btb-red)] mb-5">
              Be The Best Lacrosse Club
            </div>
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] uppercase tracking-tight leading-[0.92] mb-6">
              Showcase
              <br />
              Calendar
              <span className="text-[var(--btb-red)]">.</span>
              <br />
              <span className="text-white/30">2026</span>
            </h1>

            <p className="text-[1.05rem] text-white/55 max-w-[640px] leading-relaxed mb-10">
              The definitive guide to college recruiting showcases, ID camps, and tournaments — built for BTB families and tiered by exposure level, grad year, and fit.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <a
                href="/btb-showcase-calendar-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.78rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors"
              >
                <Download size={15} /> Download PDF
              </a>
              <button
                onClick={() => navigate("/interest")}
                className="flex items-center gap-2 px-6 py-3 border border-white/15 text-white text-[0.78rem] font-bold uppercase tracking-[2px] rounded-lg hover:border-white/30 hover:bg-white/[0.03] transition-colors"
              >
                Talk to Your Coach <ArrowRight size={14} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/[0.07]">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-4xl md:text-5xl text-[var(--btb-red)] mb-1">{s.num}</div>
                  <div className="text-[0.6rem] font-bold uppercase tracking-[2px] text-white/40">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How to use this guide ──────────────────────────── */}
        <section className="py-20 px-6 border-b border-white/[0.07]">
          <div className="max-w-[1100px] mx-auto">
            <div className="mb-10">
              <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
                How to Use This Guide
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.95] mb-4">
                Cut Through<br />
                <span className="text-white/30">the Noise.</span>
              </h2>
              <p className="text-[0.95rem] text-white/55 max-w-[640px] leading-relaxed">
                Every showcase claims to deliver college exposure. Most don't. This calendar is built around actual coach attendance, recruiting weight, and fit for your player's grad year and trajectory.
              </p>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {tiers.map((tier) => (
                <div key={tier.id} className={`relative p-6 rounded-xl border bg-white/[0.02] ${tier.border}`}>
                  <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${tier.bar}`} />
                  <h3 className={`font-display text-xl uppercase tracking-wide mb-2 ${tier.accent}`}>
                    {tier.label}
                  </h3>
                  <p className="text-[0.82rem] text-white/55 leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>

            {/* Build your summer */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-8">
              <h3 className="font-display text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
                <Calendar size={20} className="text-[var(--btb-red)]" />
                How to Build Your Player's Summer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {buildSummerSteps.map((step) => (
                  <div key={step.num}>
                    <div className="text-[0.6rem] font-bold text-[var(--btb-red)] mb-2">{step.num}</div>
                    <div className="font-display text-base uppercase tracking-wide text-white mb-2 leading-tight">
                      {step.title}
                    </div>
                    <div className="text-[0.75rem] text-white/45 leading-relaxed">{step.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Boys ────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b border-white/[0.07]">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-white/[0.07]">
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">Boys</div>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.95]">
                  19 Boys Events
                </h2>
              </div>
              <Trophy size={32} className="text-white/15" />
            </div>
            <EventTable events={boysEvents} gender="boys" />
          </div>
        </section>

        {/* ─── Girls ───────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b border-white/[0.07]">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-white/[0.07]">
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">Girls</div>
                <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.95]">
                  16 Girls Events
                </h2>
              </div>
              <GraduationCap size={32} className="text-white/15" />
            </div>
            <EventTable events={girlsEvents} gender="girls" />
          </div>
        </section>

        {/* ─── BTB Recruiting Philosophy ──────────────────────── */}
        <section className="py-20 px-6 border-b border-white/[0.07]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-3">
              BTB Recruiting Philosophy
            </div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] uppercase tracking-tight leading-[0.95] mb-6 max-w-[820px]">
              Exposure Follows<br />Development —
              <br /><span className="text-white/30">Not the Other Way Around.</span>
            </h2>
            <p className="text-[1rem] text-white/55 max-w-[680px] leading-relaxed mb-12">
              The number one mistake families make is racing to showcases before the player is ready to be evaluated. Coaches don't remember kids who were "there" — they remember kids who stood out. Build the player first. The right showcase, at the right time, finishes the job.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What BTB does */}
              <div className="p-7 rounded-xl border border-[var(--btb-red)]/20 bg-[var(--btb-red)]/[0.04]">
                <div className="flex items-center gap-2 mb-5">
                  <Target size={18} className="text-[var(--btb-red)]" />
                  <h3 className="font-display text-lg uppercase tracking-wide text-white">What BTB Does</h3>
                </div>
                <ul className="space-y-3">
                  {btbDeliverables.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.83rem] text-white/65 leading-relaxed">
                      <CheckCircle2 size={16} className="shrink-0 text-[var(--btb-red)] mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What families should vet */}
              <div className="p-7 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <h3 className="font-display text-lg uppercase tracking-wide text-white">Vet Before Paying</h3>
                </div>
                <ul className="space-y-4">
                  {familyChecklist.map((item) => (
                    <li key={item.title} className="text-[0.82rem]">
                      <div className="font-bold text-white mb-0.5">{item.title}</div>
                      <div className="text-white/55 leading-relaxed">{item.body}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Next Step CTA ──────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-[900px] mx-auto text-center">
            <div className="text-[0.6rem] font-bold uppercase tracking-[3px] text-[var(--btb-red)] mb-4">
              Next Step
            </div>
            <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] uppercase tracking-tight leading-[0.95] mb-6">
              Want a Personalized<br />
              <span className="text-white/30">Showcase Plan?</span>
            </h2>
            <p className="text-[1rem] text-white/55 max-w-[600px] mx-auto leading-relaxed mb-10">
              BTB builds individualized summer plans tied to grad year, position, target divisions, and current development stage. Reach out to your team's head coach or club director to start.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="mailto:info@bethebestli.com"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--btb-red)] text-white text-[0.78rem] font-bold uppercase tracking-[2px] rounded-lg hover:bg-[var(--btb-red-dark)] transition-colors"
              >
                Email info@bethebestli.com
              </a>
              <a
                href="/btb-showcase-calendar-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border border-white/15 text-white text-[0.78rem] font-bold uppercase tracking-[2px] rounded-lg hover:border-white/30 hover:bg-white/[0.03] transition-colors"
              >
                <Download size={14} /> Download Calendar PDF
              </a>
            </div>

            <div className="mt-12 pt-10 border-t border-white/[0.07] flex items-center justify-center gap-2 text-[0.65rem] font-bold uppercase tracking-[2px] text-white/30">
              <MapPin size={11} /> bethebestli.com · Published April 2026
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
