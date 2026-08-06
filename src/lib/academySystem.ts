export type AcademySystemName = "Offense" | "Defense" | "Ride/Clear" | "Operations"

export interface AcademySystemPillar {
  title: string
  audience: string
  promise: string
  items: string[]
}

export interface AcademyPhaseSystem {
  name: AcademySystemName
  highSchool: string
  youth: string
}

export interface AcademyPhase {
  phase: string
  weeks: string
  identity: string
  focus: string
  systems: AcademyPhaseSystem[]
  homework: string
  milestone: string
}

export interface CoachCertificationLevel {
  level: string
  title: string
  phase: string
  requirement: string
  modules: string[]
  deliverable: string
  keyTopics: string[]
}

export interface StandardizedDrillCard {
  name: string
  phase: string
  system: AcademySystemName
  purpose: string
  setup: string
  execution: string[]
  coachingPoints: string[]
  progressions: string[]
  diagram: string
  videoReference: string
}

export interface PortalModule {
  title: string
  audience: string
  outcome: string
  items: string[]
}

export interface HomeworkAssignment {
  phase: string
  weeks: string
  theme: string
  watch: string[]
  train: string[]
  iqChallenge: string
}

export interface GameDayCard {
  pregame: { time: string; segment: string; detail: string }[]
  halftime: { problem: string; adjustment: string }[]
}

export const academySystemPillars: AcademySystemPillar[] = [
  {
    title: "Player IQ Academy",
    audience: "Players",
    promise: "Turns practice concepts into short lessons, at-home work, film habits, and phase-based development targets.",
    items: [
      "Phase-by-phase learning path",
      "Position and age-tier homework",
      "Film study and quiz checks",
      "Progress visible to coaches",
    ],
  },
  {
    title: "Coach Education Academy",
    audience: "Coaches",
    promise: "Standardizes what every coach teaches, how drills are explained, and when each concept enters the season.",
    items: [
      "Level 1-3 certification pathway",
      "Standardized drill cards",
      "Practice plan templates",
      "Game-day adjustment card",
    ],
  },
  {
    title: "Parent Education Portal",
    audience: "Families",
    promise: "Helps parents understand the BTB system, support the athlete, and reinforce the right behaviors from the sideline.",
    items: [
      "Director welcome and why",
      "Lacrosse 101 terminology",
      "Cheering guide",
      "Process over outcome education",
    ],
  },
]

export const academyPhaseMap: AcademyPhase[] = [
  {
    phase: "Foundation",
    weeks: "Months 1-2",
    identity: "Individual mastery, 1v1 reads, and core terminology.",
    focus: "Grip, stance, stick protection, controlled approaches, first outlets, and pressure habits.",
    systems: [
      { name: "Offense", highSchool: "Dodge reads and feeding under pressure", youth: "Lateral cradling, running form, and step-down shooting" },
      { name: "Defense", highSchool: "1v1 approach angles and first-slide language", youth: "Athletic stance, poke checks, feet first, and recovery" },
      { name: "Ride/Clear", highSchool: "2v1 trap box and goalie outlet scans", youth: "Immediate ball pressure and wide clearing lanes" },
    ],
    homework: "Watch Dodge Reads. Complete wall ball 50 right/50 left. Add drop-step footwork.",
    milestone: "Level 1 coach certification deadline.",
  },
  {
    phase: "Connection",
    weeks: "Months 3-5",
    identity: "Small-group concepts, 2-man games, slides, and unit communication.",
    focus: "Players connect individual technique to the teammate next to them.",
    systems: [
      { name: "Offense", highSchool: "Pick and roll, slips, pops, and invert connections", youth: "Give-and-go habits and passing after movement" },
      { name: "Defense", highSchool: "Adjacent slides, 3v2 recovery, and 4v3 rotation", youth: "Ball/help communication and basic recovery shape" },
      { name: "Ride/Clear", highSchool: "Zone pressure and 4v3 fast-break decisions", youth: "Nearest outlet coverage and middle-first fast breaks" },
    ],
    homework: "Watch Pick and Roll and Adjacent Slides. Draw a 4v3 break and bring it to practice.",
    milestone: "Mid-cycle player evaluation.",
  },
  {
    phase: "Expansion",
    weeks: "Months 6-8",
    identity: "Uneven situations, man-up/man-down, zone concepts, and aggressive riding.",
    focus: "Players learn how the system changes when the numbers or defensive look changes.",
    systems: [
      { name: "Offense", highSchool: "Motion picks, zone attack, and seam recognition", youth: "Restraining-line possession games and spacing" },
      { name: "Defense", highSchool: "Zone slides and man-down 5-man rotation", youth: "Ground balls into advantage offense and transition defense" },
      { name: "Ride/Clear", highSchool: "Aggressive traps and man-up clears", youth: "Sprint to space, identify numbers, and move the ball first" },
    ],
    homework: "Watch Zone Attack. Add skip-pass wall ball and ground-ball breakout reps.",
    milestone: "Level 2 certification applied through coach video analysis.",
  },
  {
    phase: "Execution",
    weeks: "Months 9-10",
    identity: "Full-field systems, situational management, and championship execution.",
    focus: "The teaching load drops and the system is run at full speed with game constraints.",
    systems: [
      { name: "Offense", highSchool: "Full motion sets, live reads, and scrimmage situations", youth: "Small-sided scrimmage play and field vision" },
      { name: "Defense", highSchool: "Full scheme hybrid execution and disguised looks", youth: "Goal-side positioning, simple slides, and team defense" },
      { name: "Ride/Clear", highSchool: "10-man ride and 7-man clear", youth: "Ride to win possession and goalie looks upfield immediately" },
    ],
    homework: "Watch 10-Man Ride and 7-Man Clear. Visualize your role before practice and games.",
    milestone: "End-of-season player evaluation and Level 3 practical assignment.",
  },
]

export const coachCertificationLevels: CoachCertificationLevel[] = [
  {
    level: "Level 1",
    title: "Foundations",
    phase: "Phase 1",
    requirement: "Required before stepping on the field.",
    modules: ["BTB Identity", "Offensive Foundation", "Defensive Foundation", "Transition Foundation"],
    deliverable: "10-question quiz and Week 1 practice plan.",
    keyTopics: ["1v1 defense", "Dodge reads", "Trap rides", "Goalie outlets"],
  },
  {
    level: "Level 2",
    title: "Teaching the Game",
    phase: "Phase 2",
    requirement: "Required before coaches install small-group concepts.",
    modules: ["Pick and Roll", "Adjacent Slides", "Zone Pressure", "4v3 Fast Breaks"],
    deliverable: "Two-minute video analysis assignment.",
    keyTopics: ["2-man game", "Hot slide", "Zone pressure", "Middle-first transition"],
  },
  {
    level: "Level 3",
    title: "System Ownership",
    phase: "Phases 3-4",
    requirement: "Required before coaches lead special situations and full-field systems.",
    modules: ["Zone Attack", "Man-Down Rotation", "10-Man Ride", "7-Man Clear"],
    deliverable: "Scout plan with three phase-specific prep drills.",
    keyTopics: ["Zone offense", "Man-up/man-down", "10-man ride", "7-man clear"],
  },
]

export const standardizedDrillCards: StandardizedDrillCard[] = [
  {
    name: "Dodge Reads (Alley Isolation)",
    phase: "Phase 1 - Foundation",
    system: "Offense",
    purpose: "Teach ball carriers to read defender hips and win the matchup without forcing a feed.",
    setup: "Use one alley. Place a cone up top and a cone on the wing. Run 1 offensive player against 1 defender.",
    execution: [
      "Offense dodges hard toward the alley.",
      "If the defender opens hips or over-commits, roll back or attack topside.",
      "If the defender stays flat, attack the low side.",
      "If fully covered, step away and move the ball or re-attack.",
    ],
    coachingPoints: ["Eyes up", "Quiet stick", "Protect hands", "Win topside when available"],
    progressions: ["Add a live adjacent slide", "Add a feeder and cutter", "Score within five seconds"],
    diagram: "Half-field top-down. O vs X in the alley with a curved dodge path and a step-away arrow.",
    videoReference: "Academy module OFF_Phase1_DodgeReads",
  },
  {
    name: "Adjacent Slide (3v2)",
    phase: "Phase 2 - Connection",
    system: "Defense",
    purpose: "Connect the on-ball defender with the Hot slide and teach urgent recovery to the hole.",
    setup: "Half-field set with 3 offensive players and 2 defenders. Ball starts up top or on the wing.",
    execution: [
      "On-ball defender forces the dodge down the planned angle.",
      "Adjacent defender calls Hot early and slides to stop the ball.",
      "Beaten defender recovers inside to cover the most dangerous threat.",
      "Rotate on the pass and reset the shell.",
    ],
    coachingPoints: ["Call Hot early", "Slide on an angle", "Recover inside first", "No jogging after a slide"],
    progressions: ["Add a third defender", "Let offense pass live", "Finish with 4v3 rotation"],
    diagram: "Half-field top-down with a slide arrow to the ball and a recovery arrow back to the hole.",
    videoReference: "Academy module DEF_Phase2_AdjacentSlide",
  },
  {
    name: "4v3 Fast Break",
    phase: "Phase 2 - Connection",
    system: "Ride/Clear",
    purpose: "Teach middle-first decision-making in unsettled offense before the defense recovers.",
    setup: "Start at midfield or half field with 4 offensive players against 3 defenders and a goalie.",
    execution: [
      "Point player attacks the middle to force the first defensive decision.",
      "If defense slides, move it to the open player.",
      "If defense holds, shoot with balance.",
      "Offense looks for one more pass before the defense gets set.",
    ],
    coachingPoints: ["Middle first", "Head up early", "Move it before recovery", "Finish with balance"],
    progressions: ["Continue into 4v4 if saved", "Add a trailer", "Require one more pass before shot"],
    diagram: "Four Os in a diamond against three Xs in a triangle with pass lanes to wing and crease.",
    videoReference: "Academy module CLEAR_Phase2_4v3FastBreak",
  },
  {
    name: "2v1 Trap Box",
    phase: "Phase 1 - Foundation",
    system: "Ride/Clear",
    purpose: "Teach safe double teams using the sideline as an extra defender.",
    setup: "Mark a 10x10 yard box near the sideline with 1 clearer and 2 riders.",
    execution: [
      "Rider 1 angles the ball carrier toward the sideline.",
      "Rider 2 cuts off the escape angle.",
      "Both riders close the gate and take away hands.",
      "Force a turnover or a rushed pass without fouling.",
    ],
    coachingPoints: ["Angle approach", "Sideline is help", "Sticks high", "Second rider arrives under control"],
    progressions: ["Add an outlet", "Require a five-second trap", "Start from a live turnover"],
    diagram: "Sideline box with two Xs closing on one O and curved trap arrows.",
    videoReference: "Academy module RNC_Phase1_TrapBox",
  },
  {
    name: "Cone Lateral Cradle",
    phase: "Phase 1 - Foundation",
    system: "Offense",
    purpose: "Build youth ball protection while changing direction with the stick vertical.",
    setup: "Four cones in a short zig-zag lane. Every player has a ball.",
    execution: [
      "Cradle through the cones with two hands.",
      "Switch hands at the midway cone.",
      "Keep body between the ball and pressure side.",
      "Sprint out of the final cone.",
    ],
    coachingPoints: ["Vertical stick", "Protect with body", "Change speed", "Eyes up"],
    progressions: ["Add a shadow defender", "Add a poke-check partner", "Finish with a pass or shot"],
    diagram: "Cone lane with a curved carry path and hand-switch label at the middle cone.",
    videoReference: "Academy module YTH_Phase1_LateralCradle",
  },
  {
    name: "Sharks and Minnows Protection",
    phase: "Phase 1 - Foundation",
    system: "Offense",
    purpose: "Teach youth players to protect the ball under pressure in a competitive game.",
    setup: "Use a confined grid. Minnows carry balls across while sharks use controlled poke checks.",
    execution: [
      "Minnows cradle across the grid without dropping the ball.",
      "Sharks try to dislodge with controlled stick checks only.",
      "If a player drops, they reset and re-enter.",
      "Rotate sharks every round.",
    ],
    coachingPoints: ["Two hands", "Body between defender and stick", "No swinging checks", "Keep moving"],
    progressions: ["Shrink the grid", "Require weak-hand carries", "Add a pass to exit the grid"],
    diagram: "Rectangle grid with minnows crossing and sharks closing from inside lanes.",
    videoReference: "Academy module YTH_Phase1_ProtectionGame",
  },
]

export const parentPortalModules: PortalModule[] = [
  {
    title: "Start Here",
    audience: "Parents",
    outcome: "Understand why BTB uses a 4-phase development system and how to support it.",
    items: ["Director welcome", "No filler drills promise", "4-phase overview", "Family expectations"],
  },
  {
    title: "Lacrosse 101",
    audience: "Parents",
    outcome: "Give families enough vocabulary to understand games without coaching from the sideline.",
    items: ["X", "Hot", "The Box", "Ride", "Clear"],
  },
  {
    title: "The BTB Way",
    audience: "Parents",
    outcome: "Align families around process over outcome and development over short-term wins.",
    items: ["Cheer for effort", "Respect the 24-hour rule", "Avoid sideline coaching", "Ask better car-ride questions"],
  },
]

export const playerHomeworkAssignments: HomeworkAssignment[] = [
  {
    phase: "Foundation",
    weeks: "Months 1-2",
    theme: "Individual mastery",
    watch: ["Offensive Foundation", "Defensive Foundation"],
    train: ["50 right / 50 left wall ball", "25 quick sticks each hand", "Drop-step footwork 10 reps each side"],
    iqChallenge: "Name the first read you make before dodging.",
  },
  {
    phase: "Connection",
    weeks: "Months 3-5",
    theme: "2-man games and slides",
    watch: ["Pick and Roll", "Adjacent Slides", "Off-Ball Flow"],
    train: ["Pass and cut wall ball", "Pump fake high and shoot low", "Draw a 4v3 fast break"],
    iqChallenge: "Draw the point man, the three defenders, and the one-more pass.",
  },
  {
    phase: "Expansion",
    weeks: "Months 6-8",
    theme: "Special situations",
    watch: ["Zone Attack", "Man-Down Rotation", "Play Through X"],
    train: ["Skip-pass wall ball", "Ground-ball breakout", "One-minute communication challenge"],
    iqChallenge: "Circle the seam in a zone before deciding where the pass goes.",
  },
  {
    phase: "Execution",
    weeks: "Months 9-10",
    theme: "Championship habits",
    watch: ["10-Man Ride", "7-Man Clear", "Dodge Draw Dump"],
    train: ["Visualization reps", "Game-speed wall ball", "Pressure free-position or shooting routine"],
    iqChallenge: "Explain your role if the goalie becomes active in the ride or clear.",
  },
]

export const videoLibraryFolders = [
  "01_OFFENSE",
  "02_DEFENSE",
  "03_RIDING_CLEARING",
  "04_COACH_EDUCATION",
  "05_PARENT_PORTAL",
]

export const gameDayCard: GameDayCard = {
  pregame: [
    { time: "T-20", segment: "Team stretch and circle", detail: "Dynamic movement. Message: Foundation first. Win ground balls." },
    { time: "T-15", segment: "Partner passing", detail: "Quiet-stick catches, step to target, no lazy reps." },
    { time: "T-10", segment: "Positional breakout", detail: "Offense runs dodge reads. Defense runs approach angles. Goalies run arc warmup." },
    { time: "T-5", segment: "Team connection", detail: "Run one 3v2 or West Gennies style connection drill with loud communication." },
    { time: "T-2", segment: "Final huddle", detail: "Starting lineup and one key focus, such as middle first on clears." },
  ],
  halftime: [
    { problem: "Offense is stagnant", adjustment: "Get back to dodge, draw, dump. Move the ball instead of hunting early shots." },
    { problem: "Getting beat inside", adjustment: "Check Hot slide timing and hole recovery before changing the whole defense." },
    { problem: "Failed clears", adjustment: "Run wide lanes. Goalie scans wing first. Do not carry into the middle scrum." },
    { problem: "Ride is loose", adjustment: "Angle the first approach, use the sideline, and keep sticks in passing lanes." },
  ],
}
