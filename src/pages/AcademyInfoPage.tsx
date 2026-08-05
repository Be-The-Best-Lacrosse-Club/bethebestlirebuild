import { useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Film,
  GraduationCap,
  Lock,
  PlayCircle,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { SEO } from "@/components/shared/SEO"
import { academyPhaseMap, academySystemPillars } from "@/lib/academySystem"

type IconBlock = {
  icon: LucideIcon
  title: string
  body: string
}

const interestUrl =
  "/interest?category=Digital%20Academy&notes=Interested%20in%20BTB%20Online%20Academy%20access"

const nonMemberInterestUrl =
  "/interest?category=Digital%20Academy&notes=Interested%20in%20Public%20Video%20Academy%20access"

const stats = [
  { value: "16", label: "Week System" },
  { value: "3", label: "Academy Pillars" },
  { value: "2", label: "Separate Academies" },
  { value: "4", label: "Development Phases" },
]

const academyPaths = [
  {
    icon: Shield,
    eyebrow: "BTB Club Members",
    title: "Member Academy",
    body: "Rostered BTB players get the full club learning path: boys or girls curriculum, position school, film study, culture standards, quizzes, downloads, and progress tracking.",
    points: [
      "Connected to the BTB player hub",
      "Boys and girls content stays separated",
      "Includes BTB terminology, standards, and team education",
      "Built to reinforce what coaches teach on the field",
    ],
    cta: "Member Login",
    action: "login",
  },
  {
    icon: Users,
    eyebrow: "Non-Club Members",
    title: "Public Video Academy",
    body: "Players outside BTB can request a public learning path with general skill education, film concepts, player IQ, and video lessons. BTB terminology, team playbooks, team systems, downloads, culture standards, and team-related resources stay member-only.",
    points: [
      "Great for players who want to learn the game the right way",
      "Short lessons built for repeat study",
      "General video courses and film-study concepts",
      "Clear path into BTB tryouts, camps, and programs",
    ],
    cta: "Request Public Video Access",
    action: "public",
  },
]

const lessonFormat: IconBlock[] = [
  {
    icon: Video,
    title: "Watch",
    body: "Every lesson starts with a short teaching video or film example. Players see the concept before they are asked to execute it.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    body: "The coaching notes explain the why: footwork, spacing, decision-making, timing, communication, and the standard behind the rep.",
  },
  {
    icon: Dumbbell,
    title: "Train",
    body: "Each block ends with a simple player assignment they can use at home, on a field, or before their next workout.",
  },
  {
    icon: ClipboardCheck,
    title: "Prove It",
    body: "Players answer a short quiz or reflection so coaches know the lesson landed before the next piece unlocks.",
  },
]

const curriculum = [
  {
    title: "The Game",
    icon: Target,
    body: "Stickwork, dodging, defense, shooting, riding, clearing, transition, slides, spacing, and game IQ.",
  },
  {
    title: "Position School",
    icon: Zap,
    body: "Attack, midfield, defense, goalie, boys FOGO, and girls draw control taught with position-specific detail.",
  },
  {
    title: "Film Study",
    icon: Film,
    body: "Players learn what to watch, how to pause a clip, and how to turn film into a better next rep.",
  },
  {
    title: "Member Standards",
    icon: Trophy,
    body: "Rostered BTB members also get the club standards, terminology, team education, and culture work that support what coaches teach on the field.",
  },
  {
    title: "Development Tiers",
    icon: BadgeCheck,
    body: "Foundation, Development, Advanced, and Elite tracks give players the right lesson path for their stage.",
  },
  {
    title: "Recruiting IQ",
    icon: GraduationCap,
    body: "For older players: highlight film habits, communication, school fit, timelines, and how coaches evaluate.",
  },
]

const programTracks = [
  {
    label: "Boys Academy",
    accent: "text-blue-300",
    line: "Attack - Midfield - Defense - Goalie - FOGO",
    body: "Built around the boys game for rostered members, with public access limited to general video learning and film-study education.",
  },
  {
    label: "Girls Academy",
    accent: "text-pink-300",
    line: "Attack - Midfield - Defense - Goalie - Draw",
    body: "Built around the girls game for rostered members, with public access limited to general video learning and film-study education.",
  },
]

const sampleLessons = [
  "How to watch film without just watching the ball",
  "The first three reads every dodger must make",
  "Off-ball movement: timing, spacing, and purpose",
  "Ground ball habits that travel to every level",
  "Defensive approach, hips, and recovery footwork",
  "How to turn film notes into your next workout",
]

const faqs = [
  {
    q: "Is this only for BTB players?",
    a: "No. The Academy supports two paths: a member path for rostered BTB players and a public video path for non-club players who want structured lacrosse education. BTB terminology, team playbooks, team systems, downloads, culture standards, Wall of Fame, and team resources stay inside member access.",
  },
  {
    q: "Are boys and girls lessons mixed together?",
    a: "No. The Academy keeps boys and girls content separated when rules, positions, film, or development needs are different. Team-specific language remains member-only.",
  },
  {
    q: "How long are the lessons?",
    a: "Most lessons are built to be short enough for players to finish between practices: video, coaching points, a quick check for understanding, and field homework.",
  },
  {
    q: "What makes this different from YouTube drills?",
    a: "The Academy is organized into a structured learning path. Players are not hunting for random drills. They are learning the game in an order that makes sense.",
  },
]

const systemPillarIcons = [Target, ClipboardCheck, Users]

function ActionButton({ action, children }: { action: string; children: ReactNode }) {
  const navigate = useNavigate()

  if (action === "login") {
    return (
      <button
        onClick={() => navigate("/login")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#D22630] px-5 py-3 text-sm font-black uppercase text-white transition hover:bg-[#a01e26] sm:w-auto"
      >
        {children}
        <ArrowRight size={16} />
      </button>
    )
  }

  return (
    <a
      href={action === "public" ? nonMemberInterestUrl : interestUrl}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-black uppercase text-white transition hover:border-[#D22630]/60 hover:bg-[#D22630]/10 sm:w-auto"
    >
      {children}
      <ArrowRight size={16} />
    </a>
  )
}

export function AcademyInfoPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="BTB Online Academy | Mini Lessons for Club and Non-Club Players"
        description="BTB Online Academy delivers member Academy access for rostered players and public video learning for non-club players."
        path="/academy"
      />

      <section className="relative flex min-h-[86svh] items-end overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-8">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/academy/btb-academy-intro-poster-v2.jpg"
        >
          <source src="/assets/academy/btb-academy-intro-v6-dan-music.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/95 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />

        <div className="relative z-10 mx-auto w-full max-w-[1160px]">
          <div className="mb-5 inline-flex items-center gap-3 rounded-md border border-[#D22630]/40 bg-[#D22630]/10 px-4 py-2 text-xs font-black uppercase text-white">
            <Sparkles size={15} className="text-[#D22630]" />
            Member Academy and public video learning
          </div>

          <h1 className="font-display text-6xl uppercase leading-none text-white sm:text-7xl md:text-8xl lg:text-9xl">
            BTB Online
            <span className="block text-[#D22630]">Academy</span>
          </h1>

          <div className="mt-7 max-w-[680px] space-y-4">
            <p className="text-lg font-semibold leading-relaxed text-white md:text-xl">
              Mini lessons that teach players how to think, train, study film, and compete with a clearer plan.
            </p>
            <p className="text-base leading-relaxed text-white/75">
              This is not a random video library. Rostered members get the full BTB Academy. Non-club players can request public video learning with general skill, IQ, and film-study lessons only.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#D22630] px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-[#a01e26]"
            >
              Member Login <ArrowRight size={16} />
            </button>
            <a
              href={nonMemberInterestUrl}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-black/35 px-6 py-4 text-sm font-black uppercase text-white transition hover:border-white/45 hover:bg-white/10"
            >
              Public Video Access <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-[1160px] grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-black px-4 py-8 text-center">
              <div className="font-display text-5xl leading-none text-[#D22630]">{stat.value}</div>
              <div className="mt-2 text-xs font-black uppercase text-white/55">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 max-w-[760px]">
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">The Academy System</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              Players, coaches, and parents.
              <span className="block text-white/45">One connected development engine.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/70">
              The Academy is built as a full club operating system: player learning, coach education, and parent alignment all point back to the same development model.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {academySystemPillars.map((pillar, index) => {
              const Icon = systemPillarIcons[index] ?? Target
              return (
                <div key={pillar.title} className="rounded-lg border border-white/10 bg-[#070707] p-6">
                  <div className="mb-7 flex items-start justify-between gap-5">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[2px] text-[#D22630]">{pillar.audience}</div>
                      <h3 className="mt-2 font-display text-4xl uppercase leading-none text-white">{pillar.title}</h3>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#D22630]/10">
                      <Icon size={21} className="text-[#D22630]" />
                    </div>
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-white/70">{pillar.promise}</p>
                  <div className="grid gap-2">
                    {pillar.items.map((item) => (
                      <div key={item} className="flex gap-2 text-sm text-white/60">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#D22630]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 max-w-[720px]">
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">Two Access Paths</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              Built for our players.
              <span className="block text-white/45">Open to serious learners.</span>
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {academyPaths.map((path) => (
              <div key={path.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#D22630]/45 md:p-8">
                <div className="mb-7 flex items-start justify-between gap-5">
                  <div>
                    <div className="text-sm font-black uppercase text-[#D22630]">{path.eyebrow}</div>
                    <h3 className="mt-2 font-display text-4xl uppercase leading-none text-white">{path.title}</h3>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#D22630]/30 bg-[#D22630]/10">
                    <path.icon size={24} className="text-[#D22630]" />
                  </div>
                </div>
                <p className="mb-7 text-base leading-relaxed text-white/75">{path.body}</p>
                <div className="mb-8 grid gap-3">
                  {path.points.map((point) => (
                    <div key={point} className="flex gap-3 text-sm leading-relaxed text-white/70">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#D22630]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <ActionButton action={path.action}>{path.cta}</ActionButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 max-w-[760px]">
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">10-Month Progression</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              Four phases.
              <span className="block text-[#D22630]">No random development.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/70">
              Players move from fundamentals to connection, then special situations, then full-speed execution. Coaches and families know what the phase is supposed to produce.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {academyPhaseMap.map((phase, index) => (
              <div key={phase.phase} className="bg-black p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#D22630] font-display text-2xl leading-none text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="text-xs font-black uppercase tracking-[2px] text-white/35">{phase.weeks}</div>
                </div>
                <h3 className="font-display text-4xl uppercase leading-none text-white">{phase.phase}</h3>
                <p className="mt-4 text-sm font-bold leading-relaxed text-[#D22630]">{phase.identity}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{phase.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-3 text-sm font-black uppercase text-[#D22630]">Mini Lesson Model</div>
              <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
                Short enough to finish.
                <span className="block text-[#D22630]">Strong enough to matter.</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/70">
                Players do not need another hour-long lecture. They need clear teaching, a tight focus, and something they can take to the field the same day.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {lessonFormat.map((item) => (
                <div key={item.title} className="rounded-lg border border-white/10 bg-black p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#D22630]/10">
                    <item.icon size={20} className="text-[#D22630]" />
                  </div>
                  <h3 className="font-display text-3xl uppercase leading-none text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 max-w-[720px]">
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">Curriculum</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              Skill. IQ. Film.
              <span className="block text-white/45">All in one development path.</span>
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((item) => (
              <div key={item.title} className="bg-black p-6 transition hover:bg-[#101010]">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-white/[0.05]">
                  <item.icon size={20} className="text-[#D22630]" />
                </div>
                <h3 className="font-display text-3xl uppercase leading-none text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/65">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px]">
          <div className="grid gap-4 md:grid-cols-2">
            {programTracks.map((track) => (
              <div key={track.label} className="rounded-lg border border-white/10 bg-black p-7">
                <div className={`mb-3 text-sm font-black uppercase ${track.accent}`}>{track.line}</div>
                <h2 className="font-display text-5xl uppercase leading-none text-white">{track.label}</h2>
                <p className="mt-5 text-base leading-relaxed text-white/70">{track.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-[#D22630]/25 bg-[#D22630]/[0.06] p-5">
            <div className="flex gap-3">
              <Lock size={19} className="mt-0.5 shrink-0 text-[#D22630]" />
              <p className="text-sm leading-relaxed text-white/75">
                Public players receive general video lessons and learning academy access only. BTB terminology, team playbooks, team systems, downloads, culture standards, and team-related resources stay inside member access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-[1160px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">Sample Lessons</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              Every lesson has a job.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-white/70">
              The Academy is built to answer the questions players usually do not know how to ask. The result is better practice habits, better film habits, and a clearer plan between reps.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            {sampleLessons.map((lesson, index) => (
              <div key={lesson} className="flex items-center gap-4 border-b border-white/10 bg-[#070707] p-4 last:border-b-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#D22630] font-display text-xl leading-none text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase text-white/35">Mini Lesson</div>
                  <div className="mt-1 text-base font-bold text-white">{lesson}</div>
                </div>
                <PlayCircle size={22} className="ml-auto shrink-0 text-white/25" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-10 text-center">
            <div className="mb-3 text-sm font-black uppercase text-[#D22630]">Questions</div>
            <h2 className="font-display text-5xl uppercase leading-none text-white md:text-7xl">
              What families need to know.
            </h2>
          </div>

          <div className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-black">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6">
                <h3 className="font-display text-3xl uppercase leading-none text-white">{faq.q}</h3>
                <p className="mt-3 text-base leading-relaxed text-white/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1160px] text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-lg border border-[#D22630]/30 bg-[#D22630]/10">
            <BadgeCheck size={31} className="text-[#D22630]" />
          </div>
          <h2 className="font-display text-5xl uppercase leading-none text-white md:text-8xl">
            Our Culture Built Us.
            <span className="block text-[#D22630]">Our Hard Work Made Us.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[680px] text-base leading-relaxed text-white/70">
            The Online Academy turns that standard into a member learning system, with a public video path for non-club players who want general lacrosse education.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={nonMemberInterestUrl}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#D22630] px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-[#a01e26]"
            >
              Request Public Video Access <ArrowRight size={16} />
            </a>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-6 py-4 text-sm font-black uppercase text-white transition hover:border-white/45 hover:bg-white/10"
            >
              Member Login <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
