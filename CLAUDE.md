# CLAUDE.md — BTB Website (bethebestlirebuild)

## Stack
- **React 19** + TypeScript (strict) + Vite
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **React Router v6** — SPA routing
- **Netlify** — auto-deploys from GitHub `main` branch
- Domain: **bethebestli.com**

## Commands
- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check + Vite production build (MUST pass before pushing)
- `npm run preview` — Preview production build locally

## Project Structure
```
src/
  App.tsx              — Route tree + AuthProvider
  components/          — Reusable UI components
    ui/                — shadcn/ui primitives (don't modify these)
    Header.tsx         — Mega-nav with Boys/Girls dropdowns
    Footer.tsx         — 5-column footer
  pages/               — Route-level page components
    ProgramPage.tsx    — Shared boys/girls overview (parameterized by gender)
    PlayerHubPage.tsx  — Player dashboard + CourseView
    CoachesHubPage.tsx — Coach dashboard
    AcademyElearningPage.tsx — Academy e-learning
  lib/                 — Data and utilities
    programData.ts     — All program content (teams, descriptions)
    courseData.ts       — Player Hub courses and lessons
    coachData.ts       — Drills, practice plans, coach resources
  context/
    AuthContext.tsx     — Auth state (localStorage-based, demo accounts)
  hooks/
    useProgress.ts     — Progress tracking (localStorage-backed)
public/                — Static HTML pages (playbooks, manuals, tools)
netlify.toml           — Netlify config (redirects, headers, build)
```

## Architecture Rules
- **Gender parameterization:** Boys/Girls pages share components via `gender: "boys" | "girls"` prop — never duplicate a component for boys vs girls
- **Data in `src/lib/`:** Keep components presentational. Content, team data, course data → lib files
- **Use existing shadcn/ui components** from `src/components/ui/` before building custom ones
- **TypeScript:** No `any` types. Everything properly typed.
- **Tailwind only:** Use utility classes, not custom CSS files
- **Mobile-responsive:** Every component must work on phone, tablet, desktop
- **Accessibility:** Semantic HTML, proper ARIA attributes on interactive elements
- **New pages:** Add route in `src/App.tsx`, use `PublicLayout` or `HubLayout` wrapper
- **Protected routes:** Wrap with `ProtectedRoute` for login-gated content

## Auth System
- localStorage-based with demo accounts
- Demo logins: player@btb.com, coach@btb.com, player-girls@btb.com, coach-girls@btb.com
- Auth context in `src/context/AuthContext.tsx`

## Static HTML Pages (public/)
- Self-contained single-file HTML — served alongside the React SPA
- Playbooks, coaching manuals, AI tools — interactive single-file tools
- Password-gated pages: #BTBLAX26 (players), #BTBCOACH26 (coaches)
- Same BTB branding: red #D22630, Bebas Neue, Montserrat

## Deployment
- **Branch:** `main` is production (protected — requires PR + passing checks). Create feature branches off `main`.
- **Merging to `main`** triggers Netlify auto-deploy
- **Always `npm run build`** locally before pushing — TypeScript errors break deploys
- **netlify.toml:** SPA catch-all redirect `/* → /index.html` is critical
- **Never commit secrets** — use Netlify env vars for API keys

## Git Workflow
- Create feature branches off `main`
- Open PRs with clear titles via `gh pr create`
- Netlify creates deploy previews on PRs automatically
- Merge to `main` for production deploy (protected branch — requires PR)
