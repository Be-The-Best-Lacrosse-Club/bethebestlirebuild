# BTB Website Overhaul — Implementation Plan
# Deploy target: April 28, 2026

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix all critical bugs, restructure homepage for Players/Parents/Coaches user journeys, upgrade Webflow-level interactions, fix navigation, deploy to production.

**Architecture:** All changes in existing React/Vite/Tailwind stack. New components follow existing patterns (useScrollAnimation hooks, BTB red/black theme, font-display uppercase). PRs branch off main. Build must pass before merge.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind + React Router v6 + shadcn/ui + useScrollAnimation hooks

**Working directory:** /tmp/bethebestlirebuild

---

## PHASE 1: CRITICAL BUG FIXES

---

### Task 1: Fix Header logo — "BTB OS" → "BTB Lacrosse"

**Objective:** Remove "OS" text from the public site header logo. "OS" is the internal ops tool name.

**Files:**
- Modify: `src/components/Header.tsx` (line 92–95)

**Change:**
Find this block:
```tsx
<div className={`font-display text-2xl tracking-tight uppercase transition-colors ${scrolled ? "text-black" : "text-white"}`}>
  BTB <span className={scrolled ? "text-black/40" : "text-white/40"}>OS</span>
</div>
```

Replace with:
```tsx
<div className={`font-display text-2xl tracking-tight uppercase transition-colors ${scrolled ? "text-black" : "text-white"}`}>
  Be The <span className="text-[var(--btb-red)]">Best</span>
</div>
```

**Verify:** `npm run build` passes. Header shows "Be The Best" not "BTB OS".

---

### Task 2: Create ContactPage + add /contact route

**Objective:** Build a simple contact page so 9+ broken /contact links work.

**Files:**
- Create: `src/pages/ContactPage.tsx`
- Modify: `src/App.tsx` (add route)

**ContactPage.tsx — complete code:**
```tsx
import { useEffect } from "react"
import { SEO } from "@/components/shared/SEO"
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { useWordSplit, useFadeUp } from "@/hooks/useScrollAnimation"
import type React from "react"

export function ContactPage() {
  const titleRef = useWordSplit(55)
  const cardRef = useFadeUp(0)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <SEO
        title="Contact | BTB Lacrosse"
        description="Get in touch with Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program."
        path="/contact"
      />
      <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6">
        <div className="max-w-[900px] mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              CONTACT_BTB
              <div className="w-8 h-px bg-[var(--btb-red)]" />
            </div>
            <h1
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85] text-white"
            >
              Get In <br /><span className="text-[var(--btb-red)]">Touch.</span>
            </h1>
          </div>

          <div ref={cardRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-white/10 border border-white/10 mb-12">

            {/* Email */}
            <a
              href="mailto:info@bethebestli.com"
              className="group relative p-12 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <Mail size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Email Us</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                For general inquiries, program questions, and tryout info.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                info@bethebestli.com
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Register */}
            <a
              href="https://bethebest.leagueapps.com/leagues"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-12 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <ArrowRight size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Register Now</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                Ready to join? Register for the 2026 season on LeagueApps.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Register on LeagueApps
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Location */}
            <div className="group relative p-12 bg-black hover:bg-neutral-900 transition-all duration-300">
              <MapPin size={28} className="text-[var(--btb-red)] mb-8" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Location</h3>
              <p className="text-white/40 text-[0.85rem] font-medium leading-relaxed">
                Long Island, New York<br />
                Training facilities across Nassau & Suffolk County
              </p>
            </div>

            {/* Interest Form */}
            <a
              href="/interest"
              className="group relative p-12 bg-black hover:bg-neutral-900 transition-all duration-300 cursor-pointer"
            >
              <Phone size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Interest Form</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                Not ready to register? Fill out an interest form and we'll reach out.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Submit Interest Form
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          <p className="text-center text-[0.72rem] text-white/20 uppercase tracking-[2px]">
            Be The Best Lacrosse Club · Long Island, NY · info@bethebestli.com
          </p>
        </div>
      </div>
    </>
  )
}
```

**App.tsx change — add import + route:**
Add import after line 41:
```tsx
import { ContactPage } from "@/pages/ContactPage"
```

Add route inside the PublicLayout Route group (after the recruiting route):
```tsx
<Route path="/contact" element={<ContactPage />} />
```

**Verify:** `npm run build` passes. Navigating to /contact shows the contact page.

---

### Task 3: Fix FeaturedCoaches — real image for Dan, placeholder images for others

**Objective:** Show Dan's real photo. For other coaches without photos, use a styled dark card with initials instead of the embarrassing "COACH_HEADSHOT" placeholder text.

**Files:**
- Modify: `src/components/FeaturedCoaches.tsx` (lines 61–100)

Replace the image div (lines 65–74) inside the coach card map with:
```tsx
{/* Image or Initials */}
<div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
  <div className="absolute top-4 left-4 z-20 text-[10px] font-mono text-white/40 group-hover:text-[var(--btb-red)] transition-colors">
    {coach.spec}
  </div>

  {/* Photo or fallback initials */}
  {coach.img ? (
    <img
      src={coach.img}
      alt={coach.name}
      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
      <span className="font-display text-[5rem] text-white/10 select-none">
        {coach.name.split(" ").map((n: string) => n[0]).join("")}
      </span>
    </div>
  )}

  {/* Bottom Info Overlay */}
  <div className="absolute bottom-6 left-6 right-6 z-20">
    <div className="font-display text-2xl uppercase tracking-wider text-white mb-1 group-hover:text-[var(--btb-red)] transition-colors">
      {coach.name}
    </div>
    <div className="text-[0.65rem] font-black text-white/40 uppercase tracking-[2px]">
      {coach.accolade}
    </div>
  </div>
</div>
```

Update the coach data to use Dan's real image path (already in public/assets):
```tsx
const featuredCoaches = [
  {
    name: "Dan Achatz",
    accolade: "Rutgers University",
    role: "Founder / SSDM Specialist",
    spec: "ACADEMY_DIR // 01",
    img: "/assets/dan.jpeg"   // ← real image
  },
  {
    name: "Sean Reynolds",
    accolade: "Plainedge Varsity HC",
    role: "Boys Program Director",
    spec: "PROGRAM_DIR // 02",
    img: null   // ← will show initials "SR"
  },
  {
    name: "Marisa D'Angelo",
    accolade: "Manhattanville First-Team",
    role: "Girls Futures Director",
    spec: "FUTURES_DIR // 03",
    img: null   // ← will show initials "MD"
  },
  {
    name: "Mike Guercio",
    accolade: "Foundation Specialist",
    role: "Boys Futures Director",
    spec: "FUTURES_DIR // 04",
    img: null   // ← will show initials "MG"
  }
]
```

**Verify:** Build passes. Dan shows real photo, others show stylized initials.

---

### Task 4: Fix FilmStudy cinematic banner — use real BTB action photo

**Objective:** Replace the random Unsplash stranger photo with a real BTB game photo from `/public/images/`.

**Files:**
- Modify: `src/components/FilmStudy.tsx` (line 51)

Find:
```tsx
<div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80')] bg-cover bg-center" />
```

Replace with:
```tsx
<div className="w-full h-full bg-[url('/images/242A5471.JPG')] bg-cover bg-center" />
```

**Verify:** Build passes. Film study section shows real lacrosse action photo.

---

### Task 5: Fix DevelopmentModel — dark background to match site

**Objective:** DevelopmentModel section uses `bg-neutral-50` (light grey), creating a jarring inconsistency in the all-dark homepage. Convert to dark theme.

**Files:**
- Modify: `src/components/DevelopmentModel.tsx`

**Changes:**
- Line 38: `bg-neutral-50` → `bg-black border-t border-white/5`
- Section header: add `light` is already passed, change to not light
- Phase cards (line 56): replace `border-neutral-200 bg-white` with `border-white/10 bg-neutral-950`
- Active card (i === 1): `border-[var(--btb-red)]/20 bg-white` → `border-[var(--btb-red)]/30 bg-[var(--btb-red)]/5`
- Phase number ghost text (line 62): `text-black/[0.04]` → `text-white/[0.04]`
- Phase label weeks (line 66): `text-[var(--btb-red)]` stays
- Phase name (line 67): `text-black` → `text-white`
- Phase title (line 71): `text-neutral-400` → `text-white/40`
- Bullet items (line 75): `text-neutral-500` → `text-white/40`
- Bullet dot (line 76): stays red
- Stats bar (line 85): `border-neutral-200 bg-white` → `border-white/10 bg-neutral-950`
- Stats divider (line 88): `border-r border-neutral-200` → `border-r border-white/10`
- Stats number (line 91): stays `text-[var(--btb-red)]`
- Stats label (line 92): `text-neutral-400` → `text-white/40`
- SectionHeader: remove `light` prop (or set dark mode), ensure text goes white

Also add ghost typography backdrop (like other dark sections):
Before the `<div className="max-w-[1000px] mx-auto">` add:
```tsx
{/* Ghost Typography */}
<div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
  <span className="font-display text-[22vw] leading-none text-white select-none">PROCESS</span>
</div>
```
And add `relative overflow-hidden` to the section element.

Also update the SectionHeader inside — check what `light` prop does in `src/components/shared/SectionHeader.tsx`. If `light` means "use dark text" (for light bg), remove that prop since we're now on dark bg. The section label and title should be white.

Full replacement for SectionHeader usage:
```tsx
<div className="max-w-[600px]">
  <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
    <div className="w-8 h-px bg-[var(--btb-red)]" />
    DEVELOPMENT_MODEL // 16-WEEK_CYCLE
  </div>
  <h2 className="font-display text-[clamp(2.8rem,8vw,5rem)] uppercase leading-[0.85] text-white">
    How We Actually<br /><span className="text-[var(--btb-red)]">Build Players.</span>
  </h2>
</div>
```

**Verify:** Build passes. DevelopmentModel section is dark and visually consistent.

---

## PHASE 2: HOMEPAGE STRUCTURE OVERHAUL

---

### Task 6: Build AudiencePaths component — "Choose Your Path"

**Objective:** Create a new section that gives players, parents, and coaches a clear "this is for you" moment. Webflow-style 3-panel reveal with hover expand and scroll-in animation.

**Files:**
- Create: `src/components/AudiencePaths.tsx`

**Complete code:**
```tsx
import type React from "react"
import { ArrowRight, Shield, Users, GraduationCap } from "lucide-react"
import { useWordSplit, useStaggerReveal } from "@/hooks/useScrollAnimation"
import { useNavigate } from "react-router-dom"

const paths = [
  {
    audience: "Players",
    icon: Shield,
    eyebrow: "PATH_01 // FOR_ATHLETES",
    headline: "Train to Get Recruited.",
    description: "Film study. Position-specific coaching. 8:1 ratios. The BTB Academy gives you the tools college coaches are actually looking for.",
    links: [
      { label: "Boys Academy →", href: "/boys" },
      { label: "Girls Academy →", href: "/girls" },
    ],
    cta: { label: "See the Academy", href: "/academy-info" },
    color: "var(--btb-red)",
    bgHover: "hover:bg-[var(--btb-red)]",
  },
  {
    audience: "Parents",
    icon: Users,
    eyebrow: "PATH_02 // FOR_FAMILIES",
    headline: "The Right Club Makes the Difference.",
    description: "Written practice plans. Film accountability. Certified coaches. We don't just develop players — we give you full transparency into your athlete's progress.",
    links: [
      { label: "Tryouts 2026 →", href: "/tryouts" },
      { label: "Parent Portal →", href: "/parent-portal" },
    ],
    cta: { label: "Learn About BTB", href: "/interest" },
    color: "white",
    bgHover: "hover:bg-white",
  },
  {
    audience: "Coaches",
    icon: GraduationCap,
    eyebrow: "PATH_03 // FOR_STAFF",
    headline: "Built for Coaches Who Lead.",
    description: "Practice plan tools, film analysis AI, shared drill library, and a curriculum built for real player development. Tools only BTB coaches have access to.",
    links: [
      { label: "Coach Tools →", href: "https://btb-os.netlify.app" },
      { label: "Join Our Staff →", href: "/contact" },
    ],
    cta: { label: "See Coach Tools", href: "/coach-tools" },
    color: "var(--btb-red)",
    bgHover: "hover:bg-neutral-900",
  },
]

export function AudiencePaths() {
  const titleRef = useWordSplit(55)
  const cardsRef = useStaggerReveal(100)
  const navigate = useNavigate()

  return (
    <section className="bg-black text-white py-32 px-6 relative overflow-hidden border-t border-white/5">
      {/* Ghost */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.025]">
        <span className="font-display text-[20vw] leading-none text-white select-none">YOUR_PATH</span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8 pb-12 border-b border-white/10">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              SELECT_YOUR_PATH // BTB_ECOSYSTEM
            </div>
            <h2
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(2.8rem,8vw,5rem)] uppercase leading-[0.85] text-white"
            >
              Who Is BTB <br /><span className="text-[var(--btb-red)]">Built For?</span>
            </h2>
          </div>
          <p className="text-white/30 text-[0.88rem] leading-relaxed max-w-[340px] border-l border-white/10 pl-8">
            Whether you're a player chasing a college offer, a parent evaluating clubs, or a coach looking for better tools — BTB was built with you in mind.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10 border border-white/10"
        >
          {paths.map((p) => (
            <div
              key={p.audience}
              className={`stagger-child group relative p-10 bg-black ${p.bgHover} transition-all duration-500 flex flex-col min-h-[480px]`}
            >
              {/* Eyebrow */}
              <div className="text-[10px] font-mono text-white/20 group-hover:text-white/50 transition-colors mb-8">
                {p.eyebrow}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                <p.icon size={24} className="text-[var(--btb-red)]" strokeWidth={2} />
              </div>

              {/* Audience tag */}
              <div className="text-[0.6rem] font-black uppercase tracking-[4px] text-[var(--btb-red)] group-hover:text-white/60 transition-colors mb-3">
                For {p.audience}
              </div>

              {/* Headline */}
              <h3 className="font-display text-[1.6rem] uppercase tracking-wide text-white leading-tight mb-6 group-hover:translate-x-1 transition-transform">
                {p.headline}
              </h3>

              {/* Body */}
              <p className="text-[0.82rem] text-white/35 group-hover:text-white/70 leading-relaxed font-medium transition-colors flex-1 mb-8">
                {p.description}
              </p>

              {/* Sub links */}
              <div className="space-y-2 mb-8">
                {p.links.map((l) => (
                  <div key={l.label}>
                    {l.href.startsWith("http") ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.68rem] font-black uppercase tracking-[2px] text-white/30 group-hover:text-white/70 hover:!text-white transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <button
                        onClick={() => navigate(l.href)}
                        className="text-[0.68rem] font-black uppercase tracking-[2px] text-white/30 group-hover:text-white/70 hover:!text-white transition-colors"
                      >
                        {l.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(p.cta.href)}
                className="flex items-center gap-3 text-[0.72rem] font-black uppercase tracking-[2px] text-white/40 group-hover:text-white transition-colors border-t border-white/10 pt-6"
              >
                {p.cta.label}
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Verify:** Build passes. Homepage shows the 3-path section below the hero.

---

### Task 7: Reorder homepage sections + wire AudiencePaths

**Objective:** Remove ProofSection and rearrange to new optimal flow. Import AudiencePaths.

**Files:**
- Modify: `src/App.tsx`

**New LandingPage function:**
```tsx
import { AudiencePaths } from "@/components/AudiencePaths"

function LandingPage() {
  return (
    <>
      <SEO
        title="BTB Lacrosse Club | Be The Best"
        description="Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program for boys and girls."
        path="/"
      />
      <Hero />
      <AudiencePaths />
      <TheStandard />
      <WhatYouGet />
      <DevelopmentModel />
      <CharacterLab />
      <FilmStudy />
      <DigitalAcademy />
      <EliteCircuit />
      <FeaturedCoaches />
      <Results />
      <CTASection />
    </>
  )
}
```

Remove the ProofSection import line and the CoachesHub import line.

**What changed:**
- Added: AudiencePaths (position 2)
- Moved: EliteCircuit to after DigitalAcademy (position 9 instead of 2)
- Removed: ProofSection (weak achievement data)
- Removed: CoachesHub (merged intent into FeaturedCoaches)

**Verify:** Build passes. Homepage renders in new order.

---

### Task 8: Upgrade FeaturedCoaches — merge coaching standards content

**Objective:** The standalone CoachesHub section is gone. Add 3 coaching standard highlights as a strip inside FeaturedCoaches so the section tells the full coach story.

**Files:**
- Modify: `src/components/FeaturedCoaches.tsx`

After the 4-coach grid and before the footer link, insert a 3-column standards strip:
```tsx
{/* Coaching Standards Strip */}
<div className="mt-0.5 grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10">
  {[
    { num: "30+", label: "Coaches on Staff", detail: "Every one background-checked, SafeSport certified, and US Lacrosse trained." },
    { num: "8:1", label: "Player-Coach Ratio", detail: "Real reps. Real corrections. Not a number in a line drill." },
    { num: "100%", label: "Written Practice Plans", detail: "Every BTB session is planned in advance with timed segments and coaching points." },
  ].map((s) => (
    <div key={s.label} className="group p-10 bg-black hover:bg-neutral-900 transition-all duration-300">
      <div className="font-display text-[3.5rem] text-[var(--btb-red)] leading-none mb-3">{s.num}</div>
      <div className="font-display text-lg uppercase tracking-wider text-white mb-3">{s.label}</div>
      <p className="text-[0.8rem] text-white/30 leading-relaxed">{s.detail}</p>
    </div>
  ))}
</div>
```

**Verify:** Build passes. FeaturedCoaches section now shows coaches + standards strip.

---

## PHASE 3: NAVIGATION OVERHAUL

---

### Task 9: Fix Header nav — restructure menus, add Recruiting + Contact

**Objective:** Fix the "Programs" dropdown (add boys/girls), add Recruiting link, add Contact link.

**Files:**
- Modify: `src/components/Header.tsx`

**Changes to nav link arrays (top of file):**

Replace `programLinks` with:
```tsx
const programLinks = [
  { label: "Boys Lacrosse", href: "/boys" },
  { label: "Girls Lacrosse", href: "/girls" },
  { label: "BTB Futures (K-2)", href: "/futures" },
  { label: "Camps & Clinics", href: "/camps" },
  { label: "Recruiting", href: "/recruiting" },
]
```

Keep `teamLinks` for the Teams dropdown (travel, coaches, rosters per gender).

After the Teams nav item, before the Tryouts button, add Recruiting and Contact:
```tsx
<button onClick={() => go("/contact")} className={navItemClass("/contact")}>
  Contact
</button>
```

In the mobile menu, add after the teams sections:
```tsx
<button onClick={() => go("/recruiting")} className="block w-full text-left text-xl font-bold uppercase text-black/60">
  Recruiting
</button>
<button onClick={() => go("/contact")} className="block w-full text-left text-xl font-bold uppercase text-black/60">
  Contact
</button>
```

**Verify:** Build passes. Nav shows Contact link. Programs dropdown includes Boys/Girls/Futures/Camps/Recruiting.

---

### Task 10: Update Footer — fix broken /contact link, add Recruiting

**Objective:** Footer already has /contact which now works. Also add Recruiting link.

**Files:**
- Modify: `src/components/Footer.tsx`

In the BTB column (last column), after the Coach Tools link, ensure this order:
```tsx
<a href="/recruiting" onClick={link("/recruiting")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Recruiting</a>
<a href="/academy-info" onClick={link("/academy-info")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Academy</a>
<a href="/coach-tools" onClick={link("/coach-tools")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Coach Tools</a>
<a href="/interest" onClick={link("/interest")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Interest Form</a>
<a href="/contact" onClick={link("/contact")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Contact</a>
<a href="/login" onClick={link("/login")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">Login</a>
<a href="/sms-policy" onClick={link("/sms-policy")} className="block text-[0.78rem] text-white/25 py-1.5 hover:text-white transition-colors">SMS Policy</a>
```

**Verify:** Build passes.

---

## PHASE 4: WEBFLOW POLISH

---

### Task 11: Add scroll-triggered animated section divider between key sections

**Objective:** Add a horizontal marquee "spec ticker" between EliteCircuit and FeaturedCoaches — the kind Webflow sites use. Currently this live inside ProofSection which we removed. Add it as a standalone divider component.

**Files:**
- Create: `src/components/SpecTicker.tsx`
- Modify: `src/App.tsx` to insert between EliteCircuit and FeaturedCoaches

**SpecTicker.tsx:**
```tsx
interface SpecTickerProps {
  items?: string[]
}

export function SpecTicker({ items = [
  "BTB_ELITE_ACADEMY",
  "8:1_COACH_RATIO",
  "PRO_LEVEL_FILM",
  "16_WEEK_CURRICULUM",
  "LONG_ISLAND_NY",
  "30+_COACHES",
]}: SpecTickerProps) {
  const doubled = [...items, ...items]

  return (
    <div className="bg-black border-y border-white/5 py-6 overflow-hidden whitespace-nowrap">
      <div className="flex gap-12 animate-scroll-fast">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 shrink-0">
            {doubled.map((item, j) => (
              <span key={j} className={`font-display text-2xl uppercase tracking-[8px] ${
                j % 2 === 0 ? "text-white/10" : "text-[var(--btb-red)]"
              }`}>
                {j % 2 === 0 ? item : "//"}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

In App.tsx, add `import { SpecTicker } from "@/components/SpecTicker"` and insert `<SpecTicker />` between EliteCircuit and FeaturedCoaches.

**Verify:** Build passes. Scrolling ticker appears between tournament section and coaches section.

---

### Task 12: Upgrade CharacterLab — add Webflow-style left-panel sticky scroll hint

**Objective:** Add a sticky "active indicator" line that tracks which pillar is active — visual polish that looks Webflow-native.

**Files:**
- Modify: `src/components/CharacterLab.tsx`

In the sidebar nav buttons (line 74-90), add an animated left-edge indicator:
```tsx
<button
  key={p.id}
  onClick={() => setActivePillar(p)}
  className={`w-full flex items-center justify-between p-6 transition-all duration-300 group border relative overflow-hidden ${
    activePillar.id === p.id
    ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white"
    : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05] hover:border-white/10"
  }`}
>
  {/* Active sweep animation */}
  {activePillar.id === p.id && (
    <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
  )}
  <div className="flex items-center gap-4 relative z-10">
    <p.icon size={20} className={activePillar.id === p.id ? "text-white" : "text-[var(--btb-red)]"} />
    <span className="font-display text-xl uppercase tracking-widest">{p.title}</span>
  </div>
  {activePillar.id === p.id ? (
    <div className="w-2 h-2 rounded-full bg-white animate-ping relative z-10" />
  ) : (
    <div className="w-1.5 h-1.5 rounded-full bg-white/10 relative z-10" />
  )}
</button>
```

Also add a number counter next to each pillar subtitle in the content panel:
```tsx
<div className="flex items-center gap-4 mb-4">
  <div className="font-display text-[4rem] text-white/5 leading-none select-none">
    0{pillars.indexOf(activePillar) + 1}
  </div>
  <div className="text-[var(--btb-red)] font-mono text-[0.7rem] font-bold uppercase tracking-[3px]">
    {activePillar.subtitle}
  </div>
</div>
```

**Verify:** Build passes. Active pillar shows ping dot and ghost number.

---

### Task 13: Enhance CTASection — fix /contact route + add momentum

**Objective:** The CTA section's "Contact Us" button routes to /contact which now works. Also add a motion-charged design element to give the section more visual weight.

**Files:**
- Modify: `src/components/CTASection.tsx`

The navigate("/contact") calls are now valid after Task 2. No code change needed there.

Add urgency line above the headline, inside the black card:
```tsx
{/* Season urgency badge */}
<div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--btb-red)]/10 border border-[var(--btb-red)]/20 rounded-full mb-8">
  <span className="w-1.5 h-1.5 rounded-full bg-[var(--btb-red)] animate-pulse" />
  <span className="text-[0.65rem] font-black uppercase tracking-[3px] text-[var(--btb-red)]">
    2026 Season — Evaluations Now Open
  </span>
</div>
```

Insert this before the `<h2>` tag inside the card content div.

**Verify:** Build passes. CTA card shows urgency badge + contact route works.

---

## PHASE 5: BUILD, TEST, DEPLOY

---

### Task 14: Final build check + create PR

**Objective:** Run full TypeScript build, fix any type errors, create PR targeting main.

**Steps:**

Step 1: Ensure on a feature branch
```bash
cd /tmp/bethebestlirebuild
git checkout main && git pull origin main
git checkout -b feature/website-overhaul-2026
```

Step 2: Build
```bash
npm run build
```
Expected: 0 TypeScript errors, successful Vite build.

Step 3: Fix any errors — common issues:
- Import of removed ProofSection/CoachesHub in App.tsx — remove those import lines
- Type errors on coach img field: add `img: string | null` to the type
- Any missing useNavigate imports in new components

Step 4: Commit all changes
```bash
git add -A
git commit -m "feat: website overhaul — fix bugs, restructure homepage, audience paths, nav fix, contact page"
```

Step 5: Create PR
```bash
git push origin feature/website-overhaul-2026
gh pr create --title "feat: website overhaul — homepage restructure + critical bug fixes" --body "
## What this PR does
- Fix header logo (BTB OS → Be The Best)
- Add /contact page (fixes 9+ broken links across site)
- Fix FeaturedCoaches images (Dan real photo, others styled initials)
- Fix FilmStudy section (BTB action photo replaces Unsplash stranger)
- DevelopmentModel dark theme (consistent with site)
- NEW AudiencePaths section (Players / Parents / Coaches)
- New homepage order (EliteCircuit moved after academy sections)
- Removed ProofSection (replaced by AudiencePaths)
- Removed standalone CoachesHub (merged into FeaturedCoaches)
- SpecTicker between EliteCircuit and Coaches sections
- CharacterLab Webflow polish (ping dot, ghost number)
- CTASection urgency badge + contact link fixed
- Nav: Programs dropdown includes Boys/Girls/Futures/Camps/Recruiting
- Nav: Contact link added
- Footer: Recruiting link added
"
```

Step 6: After CI passes, merge
```bash
gh pr merge --squash
```

**Verify:** Deploy to bethebestli.com. Visit site and check:
- [ ] Header says "Be The Best" not "BTB OS"
- [ ] /contact page loads
- [ ] CTASection "Contact Us" goes to /contact
- [ ] Homepage order: Hero → AudiencePaths → TheStandard → WhatYouGet → DevelopmentModel...
- [ ] DevelopmentModel is dark, not grey
- [ ] FeaturedCoaches shows Dan's real photo
- [ ] FilmStudy shows BTB action photo
- [ ] SpecTicker visible between EliteCircuit and coaches
- [ ] Nav Programs dropdown has Boys/Girls listed
- [ ] Nav Contact link present
