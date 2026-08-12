import { useEffect, useState } from "react"
import { SEO } from "@/components/shared/SEO"
import "./HomePage.css"

type PlayerSide = "boys" | "girls"
type FinderGoal = "team" | "skills" | "summer" | "recruiting"
type FinderStep = 1 | 2 | 3 | 4

const YEARS: Record<PlayerSide, string[]> = {
  boys: ["K–2", "2037", "2036", "2035", "2034", "2033", "2032", "2031", "2030", "2028"],
  girls: ["K–2", "2037", "2036", "2035", "2034", "2033", "2032", "2031"],
}

const TEAM_YEARS: Record<PlayerSide, string[]> = {
  boys: ["2037", "2036", "2035", "2034", "2033", "2032", "2031", "2030", "2028"],
  girls: ["2037", "2036", "2035", "2034", "2033", "2032", "2031"],
}

const GOALS: Array<{ value: FinderGoal; title: string; description: string }> = [
  { value: "team", title: "Join a team", description: "Find the right roster and coaching group." },
  { value: "skills", title: "Build skills", description: "Start with focused reps and fundamentals." },
  { value: "summer", title: "Get summer reps", description: "See the August mini-camp path." },
  { value: "recruiting", title: "Plan recruiting", description: "Build an honest, age-right roadmap." },
]

const DEVELOPMENT_STEPS = [
  { number: "01", title: "Train", description: "Small-group reps expose the details and make fundamentals automatic." },
  { number: "02", title: "Film", description: "Every athlete learns to see the game—not just watch a highlight reel." },
  { number: "03", title: "Feedback", description: "Clear, direct coaching gives each player one standard to attack next." },
  { number: "04", title: "Progress", description: "Skill work, decision-making, and accountability show up in competition." },
]

const PARENT_LINKS = [
  { title: "Season calendar", description: "Dates, tournament weekends, and team rhythm", href: "/parent-hub" },
  { title: "Fields + directions", description: "Practice locations and event-day details", href: "/parent-hub" },
  { title: "Weather + safety", description: "Current expectations and communication", href: "/parent-hub" },
  { title: "What to bring", description: "Simple checklists for practices and events", href: "/parent-hub" },
  { title: "Billing help", description: "Registration, payment, and account support", href: "/contact" },
  { title: "Straight answers", description: "Programs, placement, travel, and the BTB standard", href: "/contact" },
]

const HEADER_EVENTS = [
  {
    label: "Now open",
    title: "Futures Camp",
    details: "Aug 18–20 · 9–11 AM · Plainedge Park · 2034–2037",
    href: "/register-futures",
  },
  {
    label: "Girls",
    title: "Girls Mini Camp",
    details: "Aug 19–21 · Momentum Sports · 2031–2036",
    href: "/register-girls-mini-camp",
  },
  {
    label: "Boys",
    title: "3-Day Boys Mini Camp",
    details: "Aug 23, 24 & 26 · Momentum Sports · 2031–2036",
    href: "/register-boys-mini-camp",
  },
]

function finderResult(side: PlayerSide, year: string, goal: FinderGoal) {
  const sideLabel = side === "boys" ? "Boys" : "Girls"

  if (goal === "team") {
    if (year === "K–2") {
      return {
        eyebrow: "Best next step",
        title: "BTB Futures",
        description: "Build the foundation early with age-right teaching, real reps, and a clear path into the BTB standard.",
        href: "/futures",
        cta: "Explore BTB Futures",
      }
    }

    return {
      eyebrow: "Best next step",
      title: `${year} ${sideLabel} Program`,
      description: "Meet the program, understand the weekly standard, and see current roster opportunities.",
      href: `/${side}`,
      cta: `Explore ${sideLabel.toLowerCase()} lacrosse`,
    }
  }

  if (goal === "skills") {
    return {
      eyebrow: "Best next step",
      title: `${sideLabel} Development`,
      description: "Start with focused training, film-supported teaching, and direct feedback built for the player’s current stage.",
      href: `/${side}`,
      cta: `View ${sideLabel.toLowerCase()} development`,
    }
  }

  if (goal === "summer") {
    return {
      eyebrow: "Best next step",
      title: `${sideLabel} Mini Camp`,
      description: "Get purposeful August reps in a small group with sessions assigned by graduation year.",
      href: side === "girls" ? "/register-girls-mini-camp" : "/register-boys-mini-camp",
      cta: "Reserve a camp spot",
    }
  }

  return {
    eyebrow: "Best next step",
    title: "BTB Recruiting Support",
    description: "Build an honest, age-right plan around film, communication, exposure, and the player’s actual next step.",
    href: "/recruiting",
    cta: "Explore recruiting",
  }
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tickerPaused, setTickerPaused] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [finderStep, setFinderStep] = useState<FinderStep>(1)
  const [playerSide, setPlayerSide] = useState<PlayerSide | null>(null)
  const [playerYear, setPlayerYear] = useState("")
  const [finderGoal, setFinderGoal] = useState<FinderGoal | null>(null)
  const [teamSide, setTeamSide] = useState<PlayerSide>("boys")
  const [teamYear, setTeamYear] = useState("2035")

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const resetFinder = () => {
    setFinderStep(1)
    setPlayerSide(null)
    setPlayerYear("")
    setFinderGoal(null)
  }

  const selectPlayerSide = (side: PlayerSide) => {
    setPlayerSide(side)
    setPlayerYear("")
  }

  const nextFinderStep = () => {
    if (finderStep === 1 && playerSide) setFinderStep(2)
    if (finderStep === 2 && playerYear) setFinderStep(3)
    if (finderStep === 3 && finderGoal) setFinderStep(4)
  }

  const previousFinderStep = () => {
    if (finderStep === 2) setFinderStep(1)
    if (finderStep === 3) setFinderStep(2)
  }

  const result = playerSide && playerYear && finderGoal
    ? finderResult(playerSide, playerYear, finderGoal)
    : null

  const sideLabel = teamSide === "boys" ? "Boys" : "Girls"
  const teamPhoto = teamSide === "boys" ? "/images/benny on D.JPG" : "/images/demo/girls-action.jpg"

  return (
    <div className="btb-home">
      <SEO
        title="BTB Lacrosse Club | Development-First Lacrosse on Long Island"
        description="BTB Lacrosse develops Long Island boys and girls through weekly film, small-group training, honest feedback, and accountable coaching."
        path="/"
        ogImage="https://www.bethebestli.com/images/home/BTB_Helmet_Landing_2026.jpeg"
      />

      <a className="btb-home__skip" href="#main-content">Skip to content</a>

      <header className={`btb-home__header${headerScrolled ? " is-scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
        <section className="btb-home__events" aria-label="Current BTB camps open for registration">
          <div className="btb-home__events-inner">
            <div className="btb-home__events-viewport">
              <div className={`btb-home__events-track${tickerPaused ? " is-paused" : ""}`}>
                {HEADER_EVENTS.map((event) => (
                  <a
                    className="btb-home__event-item"
                    href={event.href}
                    key={event.href}
                    aria-label={`Register for ${event.title}: ${event.details}`}
                  >
                    <span className="btb-home__event-label">{event.label}</span>
                    <strong>{event.title}</strong>
                    <span className="btb-home__event-meta">{event.details}</span>
                    <span className="btb-home__event-register">Sign up <span aria-hidden="true">→</span></span>
                  </a>
                ))}
              </div>
            </div>
            <div className="btb-home__event-actions">
              <button
                className="btb-home__event-pause"
                type="button"
                aria-label={`${tickerPaused ? "Play" : "Pause"} current events`}
                aria-pressed={tickerPaused}
                onClick={() => setTickerPaused((paused) => !paused)}
              >
                <span aria-hidden="true">{tickerPaused ? "▶" : "Ⅱ"}</span>
              </button>
              <a className="btb-home__events-all" href="/camps">All camps <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        <div className="btb-home__header-nav">
          <div className="btb-home__shell btb-home__header-inner">
          <a className="btb-home__brand" href="#top" aria-label="BTB Lacrosse home" onClick={() => setMenuOpen(false)}>
            <img src="/images/btb-winged-b-logo-transparent.png" alt="" width="500" height="284" />
            <span>BTB <small>Lacrosse</small></span>
          </a>
          <div className="btb-home__mobile-actions">
            <a className="btb-home__mobile-join" href="/interest?source=header">Join BTB</a>
            <button
              className={`btb-home__menu-toggle${menuOpen ? " is-open" : ""}`}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="home-primary-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
            </button>
          </div>
          <nav
            id="home-primary-navigation"
            className={menuOpen ? "is-open" : ""}
            aria-label="Primary navigation"
          >
            <a href="#programs" onClick={() => setMenuOpen(false)}>Programs</a>
            <a href="#teams" onClick={() => setMenuOpen(false)}>Teams</a>
            <a href="#development" onClick={() => setMenuOpen(false)}>Development</a>
            <a href="#proof" onClick={() => setMenuOpen(false)}>Proof</a>
            <a href="#parents" onClick={() => setMenuOpen(false)}>Parent hub</a>
            <a className="btb-home__nav-cta" href="/interest?source=header" onClick={() => setMenuOpen(false)}>
              Join BTB <span aria-hidden="true">→</span>
            </a>
          </nav>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="btb-home__hero" id="top" aria-labelledby="home-hero-title">
          <h1 className="sr-only" id="home-hero-title">Be The Best Lacrosse Club — Built by Culture. Proven by Work.</h1>
          <div className="btb-home__campaign-art">
            <img
              className="btb-home__campaign-image"
              src="/images/home/BTB_Helmet_Landing_2026.jpeg"
              alt="Black and red BTB lacrosse helmets beneath a Be The Best Lacrosse Club banner."
              width="1024"
              height="768"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="btb-home__action-bar">
            <div className="btb-home__shell btb-home__action-inner">
              <div className="btb-home__promise">
                <p className="btb-home__micro-label">The BTB promise</p>
                <p>Every player is <strong>seen, coached, filmed, and known.</strong></p>
              </div>
              <div className="btb-home__actions">
                <a className="btb-home__button btb-home__button--red" href="#program-finder">Find the right program <span aria-hidden="true">→</span></a>
                <a className="btb-home__text-link btb-home__text-link--light" href="/players-wanted">View current openings <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>

          <div className="btb-home__proof-strip-wrap">
            <div className="btb-home__shell btb-home__proof-strip">
              <div><span>01</span><p><strong>Weekly film</strong>Every player. Every week.</p></div>
              <div><span>02</span><p><strong>Small groups</strong>Real reps. Direct feedback.</p></div>
              <div><span>03</span><p><strong>Character</strong>Accountability is coached.</p></div>
              <div><span>04</span><p><strong>Recruiting</strong>Honest, age-right guidance.</p></div>
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__section--white" id="programs">
          <div className="btb-home__shell btb-home__path-grid">
            <div className="btb-home__section-intro btb-home__sticky-intro">
              <p className="btb-home__section-kicker"><span>01</span> Find your path</p>
              <h2>One standard.<br /><em>The right entry point.</em></h2>
              <p>Tell us where your player is today. In three quick choices, we’ll point you toward the most useful next step—not every possible option.</p>
              <div className="btb-home__intro-note"><i /> No login. No pressure. Just a clearer path.</div>
            </div>

            <div id="program-finder" className="btb-home__finder-wrap">
              <div className="btb-home__finder-card">
                {finderStep < 4 ? (
                  <>
                    <div className="btb-home__finder-topline">
                      <span>{finderStep} of 3</span>
                      <div className="btb-home__finder-progress" aria-label={`Program finder step ${finderStep} of 3`}>
                        {[1, 2, 3].map((step) => <span key={step} className={step <= finderStep ? "is-active" : ""} />)}
                      </div>
                    </div>

                    <div className="btb-home__finder-stage" aria-live="polite">
                      {finderStep === 1 && (
                        <fieldset>
                          <legend>Which game does your player play?</legend>
                          <p className="btb-home__finder-help">We’ll use this to show the right teams, camps, and staff.</p>
                          <div className="btb-home__choice-grid btb-home__choice-grid--two">
                            {(["boys", "girls"] as PlayerSide[]).map((side, index) => (
                              <button
                                key={side}
                                type="button"
                                className={`btb-home__choice-card${playerSide === side ? " is-selected" : ""}`}
                                aria-pressed={playerSide === side}
                                onClick={() => selectPlayerSide(side)}
                              >
                                <span className="btb-home__choice-index">0{index + 1}</span>
                                <strong>{side === "boys" ? "Boys lacrosse" : "Girls lacrosse"}</strong>
                                <span>{side === "boys" ? "2037–2030 + 2028" : "2037–2031"}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}

                      {finderStep === 2 && playerSide && (
                        <fieldset>
                          <legend>What grade band or grad year?</legend>
                          <p className="btb-home__finder-help">Choose the closest fit. A coach can confirm placement.</p>
                          <div className="btb-home__year-grid">
                            {YEARS[playerSide].map((year) => (
                              <button
                                key={year}
                                type="button"
                                className={playerYear === year ? "is-selected" : ""}
                                aria-pressed={playerYear === year}
                                onClick={() => setPlayerYear(year)}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}

                      {finderStep === 3 && (
                        <fieldset>
                          <legend>What matters most right now?</legend>
                          <p className="btb-home__finder-help">There’s no wrong entry point—just the next right one.</p>
                          <div className="btb-home__goals-grid">
                            {GOALS.map((goal) => (
                              <button
                                key={goal.value}
                                type="button"
                                className={`btb-home__goal-choice${finderGoal === goal.value ? " is-selected" : ""}`}
                                aria-pressed={finderGoal === goal.value}
                                onClick={() => setFinderGoal(goal.value)}
                              >
                                <strong>{goal.title}</strong>
                                <span>{goal.description}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                    </div>

                    <div className="btb-home__finder-controls">
                      {finderStep > 1 ? <button className="btb-home__back-button" type="button" onClick={previousFinderStep}>← Back</button> : <span />}
                      <button
                        className="btb-home__finder-next"
                        type="button"
                        disabled={(finderStep === 1 && !playerSide) || (finderStep === 2 && !playerYear) || (finderStep === 3 && !finderGoal)}
                        onClick={nextFinderStep}
                      >
                        {finderStep === 3 ? "Show my path" : "Continue"} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </>
                ) : result && playerSide && finderGoal ? (
                  <div className="btb-home__finder-result" aria-live="polite">
                    <div className="btb-home__finder-topline"><span>Your match</span><span>Best next step</span></div>
                    <div className="btb-home__finder-result-body">
                      <span className="btb-home__micro-label">{result.eyebrow}</span>
                      <h3>{result.title}</h3>
                      <p>{result.description}</p>
                      <div className="btb-home__result-summary">
                        <span>{playerSide}</span><span>{playerYear}</span><span>{GOALS.find((goal) => goal.value === finderGoal)?.title}</span>
                      </div>
                      <div className="btb-home__result-actions">
                        <a className="btb-home__button btb-home__button--light" href={result.href}>{result.cta} <span aria-hidden="true">↗</span></a>
                        <a className="btb-home__text-link btb-home__text-link--light" href="/interest">Ask a BTB coach</a>
                      </div>
                      <button className="btb-home__reset-button" type="button" onClick={resetFinder}>Start over</button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__section--dark" id="development">
          <div className="btb-home__shell">
            <div className="btb-home__split-heading">
              <div>
                <p className="btb-home__section-kicker btb-home__section-kicker--light"><span>02</span> The development system</p>
                <h2>Development<br /><em>you can see.</em></h2>
              </div>
              <p>Every week has a purpose: focused reps, film that shows the details, direct feedback, and a clear next standard.</p>
            </div>

            <div className="btb-home__system-grid">
              <div className="btb-home__system-image">
                <img src="/images/home/BTB_Girls_Development_Team_2026.jpg" alt="BTB girls players and coaches together after tournament play" width="1024" height="768" loading="lazy" />
                <div className="btb-home__image-stamp"><span>One team</span><strong>One standard</strong></div>
              </div>
              <ol className="btb-home__system-steps">
                {DEVELOPMENT_STEPS.map((step, index) => (
                  <li key={step.number}>
                    <span>{step.number}</span>
                    <div><h3>{step.title}</h3><p>{step.description}</p></div>
                    <b aria-hidden="true">{index === DEVELOPMENT_STEPS.length - 1 ? "↗" : "→"}</b>
                  </li>
                ))}
              </ol>
            </div>

            <div className="btb-home__development-quote">
              <span aria-hidden="true">“</span>
              <blockquote>We don’t sell wins. We build players who earn them.</blockquote>
              <p>Development is the product.<br />Wins are the evidence.</p>
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__section--paper" id="proof">
          <div className="btb-home__shell">
            <div className="btb-home__split-heading btb-home__split-heading--dark">
              <div>
                <p className="btb-home__section-kicker"><span>03</span> Living proof</p>
                <h2>The work leaves<br /><em>a record.</em></h2>
              </div>
              <div className="btb-home__heading-action">
                <p>Results matter. So do the habits, people, and progress behind them.</p>
                <a className="btb-home__text-link" href="/boys/teams">Explore BTB teams <span aria-hidden="true">↗</span></a>
              </div>
            </div>

            <div className="btb-home__proof-grid">
              <article className="btb-home__proof-card btb-home__proof-card--photo">
                <img src="/images/champions/BTB_2035_Tornadoes_War_At_The_Shore_Champions.jpg" alt="BTB 2035 Tornadoes players and coaches celebrating a War at the Shore championship" width="1011" height="1280" loading="lazy" />
                <div className="btb-home__proof-photo-overlay"><span className="btb-home__tag">Historic highlight</span><p>2035 Tornadoes</p><h3>War at the Shore Champions</h3></div>
              </article>
              <article className="btb-home__proof-card btb-home__proof-card--red">
                <div className="btb-home__proof-icon" aria-hidden="true">▶</div>
                <div><span className="btb-home__tag btb-home__tag--dark">Development standard</span><h3>Film every player. Every week.</h3><p>Players learn to see the game, own the next correction, and speak a common lacrosse language.</p></div>
                <span className="btb-home__card-index">02</span>
              </article>
              <article className="btb-home__proof-card btb-home__proof-card--results">
                <span className="btb-home__tag btb-home__tag--outline">On the scoreboard</span>
                <p className="btb-home__result-season">Recent results</p>
                <h3>Summer FaceOff</h3>
                <ul><li><span>2035 Be The Best</span><strong>Champions</strong></li><li><span>2031 BTB</span><strong>Champions</strong></li></ul>
                <span className="btb-home__card-index">03</span>
              </article>
              <article className="btb-home__proof-card btb-home__proof-card--quote">
                <span className="btb-home__quote-mark" aria-hidden="true">“</span>
                <blockquote>They coach the kid, not just the player. The film sessions alone changed how my son sees the game.</blockquote>
                <p>BTB parent <span>·</span> Class of 2031</p>
                <span className="btb-home__card-index">04</span>
              </article>
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__section--white btb-home__teams" id="teams">
          <div className="btb-home__shell">
            <div className="btb-home__split-heading btb-home__split-heading--dark">
              <div>
                <p className="btb-home__section-kicker"><span>04</span> Teams</p>
                <h2>Find your year.<br /><em>Know your team.</em></h2>
              </div>
              <p>Start with a graduation year, then meet the program built around that stage of development.</p>
            </div>

            <div className="btb-home__team-filters" aria-label="Filter teams">
              <div className="btb-home__segmented-control">
                {(["boys", "girls"] as PlayerSide[]).map((side) => (
                  <button
                    key={side}
                    type="button"
                    className={teamSide === side ? "is-active" : ""}
                    aria-pressed={teamSide === side}
                    onClick={() => { setTeamSide(side); setTeamYear("2035") }}
                  >
                    {side}
                  </button>
                ))}
              </div>
              <div className="btb-home__year-filter" aria-label={`${sideLabel} graduation years`}>
                {TEAM_YEARS[teamSide].map((year) => (
                  <button key={year} type="button" className={teamYear === year ? "is-active" : ""} aria-pressed={teamYear === year} onClick={() => setTeamYear(year)}>{year}</button>
                ))}
              </div>
            </div>

            <article className="btb-home__team-feature">
              <div className="btb-home__team-photo">
                <img src={teamPhoto} alt={`BTB ${sideLabel.toLowerCase()} lacrosse players during competition`} loading="lazy" />
                <span>One team. One standard.</span>
              </div>
              <div className="btb-home__team-details">
                <span className="btb-home__status-pill"><i /> Select roster opportunities</span>
                <p className="btb-home__team-year">Class of {teamYear}</p>
                <h3>BTB {teamYear}<br />{sideLabel}</h3>
                <p className="btb-home__team-intro">A clear weekly rhythm, direct feedback, and a staff that knows every player beyond the stat line.</p>
                <dl>
                  <div><dt>Development</dt><dd>Weekly film + small groups</dd></div>
                  <div><dt>Home base</dt><dd>Long Island, New York</dd></div>
                  <div><dt>Competition</dt><dd>Northeast tournament schedule</dd></div>
                </dl>
                <div className="btb-home__team-actions">
                  <a className="btb-home__button btb-home__button--red" href={`/${teamSide}/teams`}>View {teamSide} teams <span aria-hidden="true">↗</span></a>
                  <a className="btb-home__text-link" href="/interest">Ask about this team</a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="btb-home__section btb-home__upcoming" id="upcoming">
          <div className="btb-home__shell">
            <div className="btb-home__upcoming-heading">
              <p className="btb-home__section-kicker btb-home__section-kicker--light"><span>05</span> Now + next</p>
              <h2>What’s coming up.</h2>
              <p>Clear dates, clear capacity, and one useful action.</p>
            </div>

            <div className="btb-home__event-grid">
              <article className="btb-home__event-card btb-home__event-card--featured">
                <div className="btb-home__event-topline"><span>Registration open</span><strong>$150</strong></div>
                <p className="btb-home__event-date">Aug <strong>19–21</strong> 2026</p>
                <h3>Girls 3-Day Mini Camp</h3>
                <p>Coach Dan Achatz + Matt Mauro. Sessions are assigned by grad year.</p>
                <ul><li>Momentum Sports · Deer Park</li><li>18 players per age group</li></ul>
                <a className="btb-home__event-link" href="/register-girls-mini-camp">Reserve a girls camp spot <span aria-hidden="true">↗</span></a>
              </article>
              <article className="btb-home__event-card">
                <div className="btb-home__event-topline"><span>Registration open</span><strong>$150</strong></div>
                <p className="btb-home__event-date">Aug <strong>23·24·26</strong> 2026</p>
                <h3>Boys 3-Day Mini Camp</h3>
                <p>Coach Dan Achatz + Braden Donnellan. Sessions are assigned by grad year.</p>
                <ul><li>Momentum Sports · Deer Park</li><li>18 players per age group</li></ul>
                <a className="btb-home__event-link" href="/register-boys-mini-camp">Reserve a boys camp spot <span aria-hidden="true">↗</span></a>
              </article>
              <article className="btb-home__event-card btb-home__event-card--dark">
                <div className="btb-home__event-topline"><span>Teams</span><strong>Open now</strong></div>
                <p className="btb-home__event-date btb-home__event-date--small">Select</p>
                <h3>Roster Opportunities</h3>
                <p>A small number of boys and girls roster spots are open for committed players ready to meet the BTB standard.</p>
                <ul><li>Multiple graduation years</li><li>Coach-routed next step</li></ul>
                <a className="btb-home__event-link" href="/players-wanted">View current openings <span aria-hidden="true">↗</span></a>
              </article>
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__section--paper" id="parents">
          <div className="btb-home__shell btb-home__parent-grid">
            <div className="btb-home__parent-heading">
              <p className="btb-home__section-kicker"><span>06</span> Parent hub</p>
              <h2>The details parents need—<em>without the hunt.</em></h2>
              <p>Clear expectations, current information, and a direct path to the right person.</p>
              <a className="btb-home__button btb-home__button--dark" href="/parent-hub">Open the parent hub <span aria-hidden="true">↗</span></a>
            </div>
            <div className="btb-home__utility-grid">
              {PARENT_LINKS.map((item, index) => (
                <a key={item.title} href={item.href} className="btb-home__utility-card">
                  <span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><b aria-hidden="true">↗</b>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="btb-home__section btb-home__closing">
          <div className="btb-home__closing-mark" aria-hidden="true">B</div>
          <div className="btb-home__shell btb-home__closing-inner">
            <p className="btb-home__section-kicker btb-home__section-kicker--light"><span>BTB</span> Your next step</p>
            <h2>Ready for a program<br />built around <em>your player?</em></h2>
            <div className="btb-home__closing-actions">
              <a className="btb-home__button btb-home__button--light" href="#program-finder">Find the right program <span aria-hidden="true">↑</span></a>
              <a className="btb-home__text-link btb-home__text-link--light" href="/interest">Ask a BTB coach <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="btb-home__footer">
        <div className="btb-home__shell btb-home__footer-top">
          <div className="btb-home__footer-brand">
            <img src="/images/home/BTB_Winged_B_Logo_2026.png" alt="Be The Best Lacrosse" width="800" height="434" />
            <p>A character-driven youth travel lacrosse program built on accountability, film study, and intentional coaching.</p>
            <span>Long Island, New York</span>
          </div>
          <div className="btb-home__footer-links">
            <div><h3>Programs</h3><a href="/boys">Boys lacrosse</a><a href="/girls">Girls lacrosse</a><a href="/futures">BTB Futures</a><a href="/camps">Camps + clinics</a></div>
            <div><h3>Join BTB</h3><a href="/players-wanted">Roster openings</a><a href="/interest">Interest form</a><a href="/recruiting">Recruiting</a><a href="/contact">Contact</a></div>
            <div><h3>Connect</h3><a href="https://www.instagram.com/bethebestli" target="_blank" rel="noreferrer">Instagram</a><a href="https://x.com/bethebestli" target="_blank" rel="noreferrer">X / Twitter</a><a href="mailto:info@bethebestli.com">info@bethebestli.com</a></div>
          </div>
        </div>
        <div className="btb-home__shell btb-home__footer-bottom"><p>© 2026 Be The Best Lacrosse Academy.</p><p>Our Culture Built Us. Our Hard Work Made Us.</p></div>
      </footer>
    </div>
  )
}
