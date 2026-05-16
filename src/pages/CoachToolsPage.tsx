/**
 * CoachToolsPage — public preview of BTB-OS coach tools at /coach-tools
 *
 * Shows what's inside the coach suite without requiring login.
 * Links to btb-os.netlify.app for the real tools.
 */

import { useEffect } from "react"
import { SEO } from "@/components/shared/SEO"
import {
  Clipboard,
  Film,
  BookOpen,
  Lightbulb,
  Target,
  Shield,
  Brain,
  Swords,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────

const tools = [
  {
    icon: Clipboard,
    title: "Practice Plan Generator",
    tag: "AI-Powered",
    tagColor: "bg-violet-100 text-violet-700",
    desc: "Enter your team, phase, duration, and focus areas. Gemini AI builds a complete timed practice plan — every segment has a purpose, coaching points, and personnel notes. One click prints a branded PDF ready for the sideline.",
    features: [
      "7 phase options (Foundation → Postseason)",
      "20 selectable focus areas",
      "Timed segments with coaching cues",
      "Print-ready branded PDF output",
      "Add / remove / swap segments manually",
    ],
    cta: "Open Practice Plan Generator",
    href: "https://btb-os.netlify.app/?module=practice-plan",
    accent: "border-violet-200 bg-violet-50/50",
    iconBg: "bg-violet-600",
  },
  {
    icon: Film,
    title: "Film Breakdown + Practice Priorities",
    tag: "AI Film Analysis",
    tagColor: "bg-blue-100 text-blue-700",
    desc: "Paste any YouTube game link. AI tags every play with phase, personnel, result, and teaching points. Turn the film into clear practice priorities for the next week.",
    features: [
      "Full game or clip breakdown",
      "Auto-tags plays: phase, result, teaching point",
      "Direct timestamp links to each play",
      "Practice priorities tied to film findings",
      "Google Sheets export for film archive",
    ],
    cta: "Open Film Breakdown",
    href: "https://btb-os.netlify.app/?module=film-breakdown",
    accent: "border-blue-200 bg-blue-50/50",
    iconBg: "bg-blue-600",
  },
]

const resourceCards = [
  {
    title: "Playbook Studio",
    desc: "Build, edit, and organize BTB playbook pages, installs, diagrams, and teaching resources.",
    href: "/playbook-studio.html",
    tag: "Studio",
    icon: BookOpen,
  },
  {
    title: "Film Breakdown",
    desc: "Paste a YouTube link and tag plays with timestamps, phases, coaching points, and teaching notes.",
    href: "/film-breakdown.html",
    tag: "Film",
    icon: Film,
  },
  {
    title: "Film Study Lab",
    desc: "Coaching video library organized by concept, teaching point, and player development need.",
    href: "/film-study-lab/",
    tag: "Videos",
    icon: Film,
  },
  {
    title: "Defensive System",
    desc: "Slides, riding, clearing, recovery rules, and defensive standards from the BTB manuals.",
    href: "/btb-boys-coaching-manual.html#s3",
    tag: "System",
    icon: Shield,
  },
  {
    title: "Offensive System",
    desc: "Spacing, motion, dodging decisions, off-ball movement, and install teaching points.",
    href: "/btb-boys-coaching-manual.html#s2",
    tag: "System",
    icon: Target,
  },
  {
    title: "Practice Plans",
    desc: "Boys and girls practice planning references tied to BTB phases and weekly standards.",
    href: "/btb-boys-coaching-manual.html#s9",
    tag: "Plans",
    icon: Clipboard,
  },
  {
    title: "Boys Coaching Manual",
    desc: "Complete boys program reference with standards, progressions, systems, and practice plans.",
    href: "/btb-boys-coaching-manual",
    tag: "Manual",
    icon: Clipboard,
  },
  {
    title: "Girls Coaching Manual",
    desc: "Complete girls program reference with age-appropriate progressions and coaching standards.",
    href: "/btb-girls-coaching-manual",
    tag: "Manual",
    icon: Clipboard,
  },
  {
    title: "Boys Motion Offense",
    desc: "Passing, fades, follow actions, cuts, picks, and full-system offensive film.",
    href: "/btb-boys-offense-playbook.html",
    tag: "Playbook",
    icon: Swords,
  },
  {
    title: "Boys Defensive Playbook",
    desc: "Slides, recovery, defending picks, cutters, man-down, and 3-3 zone principles.",
    href: "/btb-boys-defense-playbook.html",
    tag: "Playbook",
    icon: Shield,
  },
  {
    title: "Boys Transition & Special Teams",
    desc: "Rides, clears, substitutions, faceoffs, wing play, man-up, and man-down.",
    href: "/btb-boys-transition-playbook.html",
    tag: "Playbook",
    icon: Swords,
  },
  {
    title: "Girls Motion Offense",
    desc: "Women's D1 film, spacing, fades, cuts, clear-throughs, follow actions, and picks.",
    href: "/btb-girls-offense-playbook.html",
    tag: "Playbook",
    icon: Swords,
  },
  {
    title: "Coach AI Assistant",
    desc: "Ask for practice structure, game plans, film teaching points, and coaching ideas.",
    href: "/btb-coach-ai.html",
    tag: "AI",
    icon: Brain,
  },
  {
    title: "Positionless Guru",
    desc: "Teaching support for IQ, spacing, decision-making, and complete-player concepts.",
    href: "/btb-positionless-guru.html",
    tag: "IQ",
    icon: Brain,
  },
]

const planFlow = [
  { step: "01", label: "Pick your team + phase",    desc: "Foundation, Connection, Expansion, Execution, Preseason, In-Season, or Postseason." },
  { step: "02", label: "Select focus areas",        desc: "Dodging, slides, ground balls, fast break — up to 20 options. Mix and match." },
  { step: "03", label: "Set duration",              desc: "60, 75, 90, 105, or 120 minutes. AI fills every minute intentionally." },
  { step: "04", label: "Generate",                  desc: "Gemini builds the full plan with timed segments, teaching blocks, coaching cues, and personnel notes." },
  { step: "05", label: "Edit or print",             desc: "Swap segments, add/remove blocks, then print a branded PDF." },
]

// ─── Component ────────────────────────────────────────────────────────

export function CoachToolsPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="BTB Coach Tools | Practice Plans, Film Breakdown, Playbooks"
        description="BTB's coach suite — practice planning, film breakdown, playbooks, systems, and staff-only resources. Built for BTB coaches."
        path="/coach-tools"
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6 border-b border-white/[0.07] relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px]"
            style={{ background: "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(210,38,48,0.15) 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-[960px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#D22630]" />
            <span className="text-[0.62rem] font-bold uppercase tracking-[4px] text-white/30">BTB Coach Suite · Staff Only</span>
            <div className="h-px w-10 bg-[#D22630]" />
          </div>

          <h1
            className="font-display uppercase leading-[0.88] tracking-wide mb-8"
            style={{ fontSize: "clamp(3rem,8vw,6rem)" }}
          >
            Coach Tools.<br />
            <span className="text-[#D22630]">Built Different.</span>
          </h1>

          <p className="text-[0.92rem] text-white/40 max-w-[520px] leading-[1.9] mb-4">
            BTB coaches don't use generic drill apps or blank Google Docs for practice planning.
            The BTB coach suite is AI-powered, film-connected, and built around the same
            16-week curriculum that runs every team in the program.
          </p>
          <p className="text-[0.85rem] text-white/60 font-semibold mb-12">
            Playbook Studio · Practice Plans · Film Breakdown · Video Playbooks · Systems
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://btb-os.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[#B01F28] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(210,38,48,0.35)]"
            >
              Open BTB-OS <ExternalLink size={13} />
            </a>
            <a
              href="mailto:info@bethebestli.com"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/12 bg-white/5 text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:bg-white/10 transition-all"
            >
              Request Coach Access
            </a>
          </div>
        </div>
      </section>

      {/* ── CLICKABLE RESOURCE CARDS ─────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07] bg-neutral-950">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">Coach Resource Hub</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Playbooks. Systems.<br />Videos. Tools.
          </h2>
          <p className="text-[0.9rem] text-white/55 max-w-[560px] leading-relaxed mb-12">
            One coach-facing page for the resources staff need before practice, during install weeks, and after film review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resourceCards.map((card) => (
              <a
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-black p-6 transition-all hover:-translate-y-0.5 hover:border-[#D22630]/70 hover:bg-white/[0.03]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[#D22630] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:border-[#D22630]/40 group-hover:bg-[#D22630]/15">
                    <card.icon size={20} className="text-[#D22630]" />
                  </div>
                  <span className="rounded border border-white/[0.08] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[1.5px] text-white/45 group-hover:border-[#D22630]/40 group-hover:text-[#D22630]">
                    {card.tag}
                  </span>
                </div>
                <h3 className="font-display text-[1.35rem] uppercase tracking-wide text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-[0.86rem] leading-relaxed text-white/55 group-hover:text-white/75">
                  {card.desc}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[2px] text-[#D22630]">
                  Open Resource <ExternalLink size={12} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE TOOLS ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">The Suite</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-14">
            Core Tools.<br />One System.
          </h2>

          <div className="space-y-6">
            {tools.map((tool, i) => (
              <div key={tool.title} className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all group">
                <div className="p-7">
                  <div className="flex items-start gap-5 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${tool.iconBg} flex items-center justify-center shrink-0`}>
                      <tool.icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display text-[1.2rem] uppercase tracking-wide">{tool.title}</h3>
                        <span className={`text-[0.6rem] font-bold uppercase px-2.5 py-0.5 rounded-full ${tool.tagColor}`}>{tool.tag}</span>
                      </div>
                      <p className="text-[0.84rem] text-white/40 leading-relaxed">{tool.desc}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 ml-17">
                    <ul className="space-y-2">
                      {tool.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <CheckCircle2 size={13} className="text-[#D22630] shrink-0 mt-0.5" />
                          <span className="text-[0.78rem] text-white/50 leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-end justify-end">
                      <a
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-white/[0.05] border border-white/[0.1] text-white text-[0.72rem] font-bold uppercase tracking-[1.5px] rounded-xl hover:bg-[#D22630] hover:border-[#D22630] transition-all group-hover:border-white/[0.2]"
                      >
                        {tool.cta} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW PRACTICE PLAN WORKS ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">Practice Plan Generator</div>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-4">
            Input to PDF.<br /><span className="text-white/20">Five Steps.</span>
          </h2>
          <p className="text-[0.84rem] text-white/35 max-w-[500px] leading-relaxed mb-14">
            No more blank Google Docs. No more copying last season's plan and hoping it still makes sense. 
            The generator knows BTB's curriculum, your team's phase, and your focus areas — and builds a practice that actually matches all three.
          </p>

          <div className="space-y-0 border-t border-white/[0.07]">
            {planFlow.map((step) => (
              <div key={step.step} className="flex items-start gap-8 py-7 border-b border-white/[0.07] group">
                <div className="font-display text-[0.7rem] text-white/15 group-hover:text-[#D22630] transition-colors shrink-0 pt-0.5 w-6">{step.step}</div>
                <div>
                  <h4 className="font-display text-[1rem] uppercase tracking-wide text-white group-hover:text-[#D22630] transition-colors mb-1">{step.label}</h4>
                  <p className="text-[0.84rem] text-white/35 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILM → PRACTICE FLOW ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-neutral-950 border-b border-white/[0.07]">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-4">Film → Practice</div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] uppercase tracking-wide leading-[0.92] mb-6">
                Watch Film.<br />Build The Week.
              </h2>
              <p className="text-[0.84rem] text-white/35 leading-relaxed mb-6">
                The Film Breakdown tool doesn't just tag plays. After the AI analyzes your game film, 
                it turns the teaching points into practice priorities, install notes, and staff talking points
                tied to what actually happened in the game.
              </p>
              <p className="text-[0.78rem] text-white/25 leading-relaxed mb-8">
                Example: AI finds "12 plays where the slide arrived late." 
                The breakdown returns the clips, the correction, and the practice emphasis for the week.
              </p>
              <a
                href="https://btb-os.netlify.app/?module=film-breakdown"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[#B01F28] transition-all"
              >
                Open Film Breakdown <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-3">
              {[
                { icon: Film,      step: "Film Breakdown", desc: "Paste any YouTube game link — AI tags every play with phase, result, and teaching point." },
                { icon: Lightbulb, step: "Set Priorities",  desc: "Turn the recurring mistakes into a simple staff teaching plan for the week." },
                { icon: Clipboard, step: "Build the Plan",  desc: "Jump to Practice Plan Generator, add the emphasis, and print the plan." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-lg bg-[#D22630]/10 flex items-center justify-center shrink-0">
                    <item.icon size={15} className="text-[#D22630]" />
                  </div>
                  <div>
                    <h4 className="font-display text-[0.9rem] uppercase tracking-wide mb-1">{item.step}</h4>
                    <p className="text-[0.75rem] text-white/35 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESS ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[960px] mx-auto">
          <div className="relative border border-[#D22630]/25 rounded-2xl px-10 py-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[#D22630]/[0.04]" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D22630]/10 border border-[#D22630]/25 mb-8">
                <Lock size={24} className="text-[#D22630]" />
              </div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[4px] text-[#D22630] mb-6">Credentialed Coaches Only</div>
              <h2 className="font-display text-[clamp(2rem,5vw,3rem)] uppercase tracking-wide leading-[0.92] mb-6">
                BTB-OS Is Coach-Facing.<br />
                <span className="text-white/20">Not Public.</span>
              </h2>
              <p className="text-[0.88rem] text-white/35 max-w-[440px] mx-auto leading-relaxed mb-10">
                BTB-OS and the coach tools suite are for credentialed BTB coaches only.
                If you're on staff and need access, contact Dan directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://btb-os.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#D22630] text-white text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:bg-[#B01F28] transition-all"
                >
                  Open BTB-OS <ExternalLink size={13} />
                </a>
                <a
                  href="mailto:info@bethebestli.com"
                  className="inline-flex items-center justify-center gap-2 px-9 py-4 border border-white/15 text-white/50 text-[0.72rem] font-bold uppercase tracking-[2px] rounded hover:border-white/30 hover:text-white transition-all"
                >
                  Request Access
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
