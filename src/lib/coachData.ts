import type { Drill, PracticePlan } from "@/types"

export const drillCategories = [
  "Wall Ball", "Footwork & Mechanics", "Attack", "Defense",
  "Midfield", "FOGO", "Goalie", "Riding & Clearing", "Team Concepts",
]

export const drills: Drill[] = [
  // Wall Ball
  { id: "wb-1", title: "Basic Catch & Throw", category: "Wall Ball", description: "Fundamental right/left hand catch and throw at 10 yards.", setup: "Player faces wall at 10 yards. No cradle between catch and throw.", execution: ["50 right hand", "50 left hand", "25 alternating", "25 quick-stick (no cradle)"], coachingPoints: ["Hands away from body", "Follow through to target", "Soft hands on catch"], difficulty: "beginner", duration: 10 },
  { id: "wb-2", title: "Cross-Hand Quick Stick", category: "Wall Ball", description: "Advanced quick-stick drill emphasizing off-hand release speed.", setup: "Player faces wall at 8 yards. Must release within 1 second of catch.", execution: ["20 right catch, left throw", "20 left catch, right throw", "20 alternating rapid-fire"], coachingPoints: ["Catch and release in one motion", "Wrist snap on release", "Stay on balls of feet"], difficulty: "intermediate", duration: 8 },
  { id: "wb-3", title: "Wall Ball Ladder", category: "Wall Ball", description: "Progressive wall ball with footwork ladder integration.", setup: "Ladder laid out 5 yards from wall. Player moves through ladder between throws.", execution: ["High knees through ladder → right hand throw", "Icky shuffle → left hand throw", "2-in-2-out → cross-hand throw", "3 rounds each"], coachingPoints: ["Don't slow down for the throw", "Eyes up on catch", "Footwork rhythm stays consistent"], difficulty: "advanced", duration: 12 },
  // Footwork & Mechanics
  { id: "fw-1", title: "Defensive Approach Steps", category: "Footwork & Mechanics", description: "Proper approach angle and breakdown steps to ball carrier.", setup: "Cones set 15 yards apart. Defender starts at cone A, dodger at cone B.", execution: ["Sprint to breakdown point", "Chop feet at 5 yards", "Drop step to force direction", "Recover and repeat x8"], coachingPoints: ["Hips low on breakdown", "Don't cross feet", "Hands up and active"], difficulty: "beginner", duration: 10 },
  { id: "fw-2", title: "Plant-and-Throw Mechanics", category: "Footwork & Mechanics", description: "Proper shooting footwork: plant, hip rotation, follow-through.", setup: "Line of balls at 12 yards from goal. Player approaches from top.", execution: ["3-step approach: plant outside foot", "Drive hip through rotation", "Release at ear level", "Follow through to target", "8 reps each side"], coachingPoints: ["Power comes from hips, not arms", "Plant foot points at target", "Snap wrist on release"], difficulty: "intermediate", duration: 12 },
  // Attack
  { id: "att-1", title: "Split Dodge to Shot", category: "Attack", description: "1v0 split dodge from X to shot on cage.", setup: "Ball starts at X behind goal. Player carries to GLE then splits.", execution: ["Carry from X", "Sell inside roll", "Split to outside", "Finish on pipe", "5 reps each side"], coachingPoints: ["Change speed before the split", "Protect stick on the split", "Pick your shot before you dodge"], difficulty: "beginner", duration: 10 },
  { id: "att-2", title: "Feeding from X Under Pressure", category: "Attack", description: "Feed from behind goal with a defender on hip.", setup: "Attacker at X, defender trailing. 2 cutters rotating through crease.", execution: ["Carry to GLE with defender", "Read cutter timing", "Hit the first open look", "If nothing, reset and re-drive"], coachingPoints: ["Patience over panic", "Feed to space, not to the player", "Eye fake before the feed"], difficulty: "advanced", duration: 15 },
  // Defense
  { id: "def-1", title: "Slide and Recover", category: "Defense", description: "Team slide drill with recovery to hot rotation.", setup: "Half-field 4v3. Ball starts up top.", execution: ["On-ball defender forces direction", "Adjacent slides on dodge", "Hot fills adjacent", "Ball is passed — all recover", "Run for 5 minutes"], coachingPoints: ["Slide with stick up", "Communication before sliding", "Recovery sprints, don't jog back"], difficulty: "intermediate", duration: 15 },
  // Midfield
  { id: "mid-1", title: "Transition 4v3 Break", category: "Midfield", description: "Fast break recognition and execution.", setup: "Start at midline. 4 attackers vs 3 defenders.", execution: ["Push pace — attack before defense sets", "Ball carrier reads first slide", "Move the ball quickly", "Finish in 10 seconds or reset"], coachingPoints: ["Speed kills — don't let defense get set", "Attack with purpose, not panic", "Trail man: find space, stay available"], difficulty: "intermediate", duration: 12 },
  // FOGO
  { id: "fogo-1", title: "Clamp and Exit", category: "FOGO", description: "Basic faceoff technique: clamp, rake, exit to space.", setup: "Two players at X. Coach simulates whistle.", execution: ["Clamp on whistle", "Rake to strong side", "Exit to sideline", "Secure and clear", "10 reps each"], coachingPoints: ["Low body position wins", "Quick hands on whistle", "Know your exit lane before whistle"], difficulty: "beginner", duration: 10 },
  // Goalie
  { id: "gk-1", title: "Arc Positioning Drill", category: "Goalie", description: "Arc movement tracking ball around the perimeter.", setup: "5 cones in arc around crease. Shooters at each position.", execution: ["Ball moves to cone 1 — goalie tracks", "Step to ball, hands set", "Ball moves to cone 2 — adjust arc", "Random shot from any cone", "3 rounds of all 5 positions"], coachingPoints: ["Lead with top hand", "Stay on balls of feet", "Reset to center of arc between shots"], difficulty: "beginner", duration: 12 },
  // Team Concepts
  { id: "tc-1", title: "Settled 6v6 Read Drill", category: "Team Concepts", description: "Full-field settled offense with defensive read emphasis.", setup: "Full 6v6 on half field. Ball starts at top.", execution: ["Run base offense for 30 seconds", "Defense communicates every switch", "Score or turnover = reset", "5 possessions per side"], coachingPoints: ["Talk on every movement", "Off-ball players: cut with purpose", "Reset rather than force a bad shot"], difficulty: "advanced", duration: 20 },
  { id: "att-dodge-reads-alley", title: "Dodge Reads (Alley Isolation)", category: "Attack", description: "Phase 1 offense drill teaching dodgers to read defender hips and win without forcing a feed.", setup: "Use one alley. Place a cone up top and a cone on the wing. Run 1 offensive player against 1 defender.", execution: ["Offense dodges hard toward the alley", "Read defender hips: roll back or attack topside if they over-commit", "Attack the low side if the defender stays flat", "If fully covered, step away and move it or re-attack"], coachingPoints: ["Eyes up", "Quiet stick", "Protect hands", "Win topside when available"], difficulty: "intermediate", duration: 12 },
  { id: "def-adjacent-slide-3v2", title: "Adjacent Slide (3v2)", category: "Defense", description: "Phase 2 defense drill connecting the on-ball defender, Hot slide, and recovery to the hole.", setup: "Half-field set with 3 offensive players and 2 defenders. Ball starts up top or on the wing.", execution: ["On-ball defender forces the dodge down the planned angle", "Adjacent defender calls Hot early and slides to stop the ball", "Beaten defender recovers inside to cover the most dangerous threat", "Rotate on the pass and reset the shell"], coachingPoints: ["Call Hot early", "Slide on an angle", "Recover inside first", "No jogging after a slide"], difficulty: "intermediate", duration: 15 },
  { id: "rnc-4v3-fast-break", title: "4v3 Fast Break", category: "Riding & Clearing", description: "Phase 2 transition drill teaching middle-first decision-making before the defense recovers.", setup: "Start at midfield or half field with 4 offensive players against 3 defenders and a goalie.", execution: ["Point player attacks the middle to force the first defensive decision", "If defense slides, move it to the open player", "If defense holds, shoot with balance", "Look for one more pass before the defense gets set"], coachingPoints: ["Middle first", "Head up early", "Move it before recovery", "Finish with balance"], difficulty: "intermediate", duration: 12 },
  { id: "rnc-2v1-trap-box", title: "2v1 Trap Box", category: "Riding & Clearing", description: "Phase 1 riding drill teaching safe double teams using the sideline as an extra defender.", setup: "Mark a 10x10 yard box near the sideline with 1 clearer and 2 riders.", execution: ["Rider 1 angles the ball carrier toward the sideline", "Rider 2 cuts off the escape angle", "Both riders close the gate and take away hands", "Force a turnover or rushed pass without fouling"], coachingPoints: ["Angle approach", "Sideline is help", "Sticks high", "Second rider arrives under control"], difficulty: "beginner", duration: 10 },
  { id: "fw-cone-lateral-cradle", title: "Cone Lateral Cradle", category: "Footwork & Mechanics", description: "Youth Phase 1 ball-protection drill for changing direction with a vertical stick.", setup: "Four cones in a short zig-zag lane. Every player has a ball.", execution: ["Cradle through the cones with two hands", "Switch hands at the midway cone", "Keep body between the ball and pressure side", "Sprint out of the final cone"], coachingPoints: ["Vertical stick", "Protect with body", "Change speed", "Eyes up"], difficulty: "beginner", duration: 10 },
  { id: "tc-sharks-minnows-protection", title: "Sharks and Minnows Protection", category: "Team Concepts", description: "Youth protection game for carrying under pressure in a confined space.", setup: "Use a confined grid. Minnows carry balls across while sharks use controlled poke checks.", execution: ["Minnows cradle across the grid without dropping the ball", "Sharks try to dislodge with controlled stick checks only", "If a player drops, they reset and re-enter", "Rotate sharks every round"], coachingPoints: ["Two hands", "Body between defender and stick", "No swinging checks", "Keep moving"], difficulty: "beginner", duration: 12 },
]

export const practicePlans: PracticePlan[] = [
  {
    id: "pp-foundation-hs-90",
    title: "Foundation Phase - High School 90",
    phase: "Foundation",
    ageGroup: "High School",
    duration: 90,
    description: "Phase 1 high school practice focused on individual skill, 1v1 competitiveness, and installing shared terminology.",
    segments: [
      { time: "0-10 min", activity: "Dynamic + Partner Passing", detail: "High knees, butt kicks, open gate, right/left passing, quick sticks. Cue: snap the wrist, target to target." },
      { time: "10-30 min", activity: "Indy Skills", detail: "Offense runs Dodge Reads in the alley. Defense runs 1v1 Approach with drop-step and force-alley cues." },
      { time: "30-45 min", activity: "Connection Intro", detail: "Defense runs 2v1 Trap Box. Offense runs 2v1 ground balls in the alley. Emphasize sideline help and scoop-through habits." },
      { time: "45-60 min", activity: "Transition", detail: "Continuous 4v3 fast breaks. Point man attacks middle first. Offense looks for one more pass before the defense recovers." },
      { time: "60-75 min", activity: "Ride/Clear", detail: "Goalie save, scan, outlet to wing. Middies run wide lanes. Attack drops into ride shape immediately on turnover." },
      { time: "75-85 min", activity: "Competition", detail: "Half-field 6v6. Constraint: one completed pass before shooting. Coach starts with ground ball or spot feed." },
      { time: "85-90 min", activity: "Culture Review", detail: "Review Foundation word of the week and shout out one player who executed the 1v1 approach standard." },
    ],
  },
  {
    id: "pp-foundation-youth-75",
    title: "Foundation Phase - Youth 75",
    phase: "Foundation",
    ageGroup: "Youth",
    duration: 75,
    description: "Phase 1 youth practice built around fundamentals through movement, high reps, and low standing around.",
    segments: [
      { time: "0-10 min", activity: "Line Drills", detail: "Full-field movement with ball in stick. Whistle means change direction or speed. Cue: two hands, protect the ball." },
      { time: "10-25 min", activity: "Skill Station 1", detail: "Cone Lateral Cradle through four cones. Switch hands at midpoint. Cue: vertical stick, body between defender and ball." },
      { time: "25-40 min", activity: "Skill Station 2", detail: "Poke Check and Recovery with partners. No swinging. Cue: feet first, stick second." },
      { time: "40-55 min", activity: "Small Game", detail: "2v1 ground balls. Win the scoop, make one pass, shoot. Cue: scoop through, do not rake." },
      { time: "55-70 min", activity: "Fun Competition", detail: "Sharks and Minnows with controlled checks. Focus on ball protection under pressure." },
      { time: "70-75 min", activity: "Team Huddle", detail: "Ask what the group learned today. Target answer: protecting the ball." },
    ],
  },
  {
    id: "pp-foundation",
    title: "Foundation Phase Template",
    phase: "Foundation",
    ageGroup: "All",
    duration: 75,
    description: "Months 1-2 practice plan focused on fundamentals and habit building.",
    segments: [
      { time: "0–10 min", activity: "Dynamic Warmup", detail: "Position-specific activation. Goalies to cage, field players through footwork ladder." },
      { time: "10–25 min", activity: "Wall Ball & Stick Skills", detail: "Structured wall ball sequence: right, left, cross-hand, quick-stick. Coach walks the line correcting." },
      { time: "25–40 min", activity: "Skill Block: Footwork", detail: "Approach steps, plant-and-throw, change of direction. Isolated reps with coaching points after each set." },
      { time: "40–55 min", activity: "Small-Sided Application", detail: "2v1 and 3v2 scenarios. Apply footwork and stick skills in live reads." },
      { time: "55–65 min", activity: "Team Concept Introduction", detail: "Walk-through of base ride or base clear. No live play — teaching pace." },
      { time: "65–75 min", activity: "Film Preview & Wrap", detail: "3-minute film clip. Preview next session focus. Coaching point of the day." },
    ],
  },
  {
    id: "pp-connection",
    title: "Connection Phase Template",
    phase: "Connection",
    ageGroup: "All",
    duration: 75,
    description: "Months 3-5 practice plan focused on applying skills in game-like contexts.",
    segments: [
      { time: "0–10 min", activity: "Dynamic Warmup", detail: "Increased pace. Partner passing on the move. Goalies: reaction saves warm-up." },
      { time: "10–25 min", activity: "Position-Specific Skill Block", detail: "Attackmen: dodge and feed. Middies: transition reads. Defenders: slide timing. Goalies: arc work." },
      { time: "25–45 min", activity: "2-Man Game & Reads", detail: "Pick-and-roll, dodge-and-dish. Live 2v2 with reads off film from prior week." },
      { time: "45–60 min", activity: "Small-Group Competition", detail: "3v3 or 4v4 with constraints (must move ball within 4 passes, shot clock)." },
      { time: "60–70 min", activity: "Team Concepts: Rides & Clears", detail: "Live ride/clear drill. Emphasize communication and spacing." },
      { time: "70–75 min", activity: "Film & Coaching Points", detail: "Review 2 clips from today's practice. Identify 1 thing to improve before next session." },
    ],
  },
  {
    id: "pp-expansion",
    title: "Expansion Phase Template",
    phase: "Expansion",
    ageGroup: "All",
    duration: 75,
    description: "Months 6-8 practice plan focused on game-speed competition and pressure.",
    segments: [
      { time: "0–8 min", activity: "Dynamic Warmup", detail: "Game-speed activation. Competitive relay or timed footwork challenge." },
      { time: "8–20 min", activity: "Positional Refinement", detail: "Targeted skill work on areas identified from film. Individual focus areas." },
      { time: "20–40 min", activity: "Live Game Scenarios", detail: "4v4 and 5v5 with game situations: man-up, man-down, clearing under pressure, fast breaks." },
      { time: "40–55 min", activity: "Full-Speed Scrimmage", detail: "6v6 half-field. Coach stops play for teaching moments. Emphasize execution under pressure." },
      { time: "55–65 min", activity: "Self-Scouting", detail: "Players watch 3 clips of themselves from today and grade their own performance." },
      { time: "65–75 min", activity: "Opponent Scouting Intro", detail: "Brief opponent film breakdown. Identify 2 tendencies to exploit in upcoming games." },
    ],
  },
  {
    id: "pp-execution",
    title: "Execution Phase Template",
    phase: "Execution",
    ageGroup: "All",
    duration: 75,
    description: "Months 9–10 practice plan focused on performance evaluation and next-level prep.",
    segments: [
      { time: "0–8 min", activity: "Dynamic Warmup", detail: "Pre-game style warm-up. Players lead. Coaches observe readiness." },
      { time: "8–25 min", activity: "Standards Assessment", detail: "Timed skills test: wall ball accuracy, ground balls, shooting percentage. Record scores." },
      { time: "25–45 min", activity: "Game Simulation", detail: "Full 6v6 scrimmage scored and evaluated. Coaches chart individual performance." },
      { time: "45–55 min", activity: "Film Review: Highlight Reel", detail: "Players review best clips from the cycle for recruiting highlight film selection." },
      { time: "55–65 min", activity: "Goal Setting", detail: "Individual meetings. Review progress, set targets for next 10-month program." },
      { time: "65–75 min", activity: "Cycle Wrap-Up", detail: "Team discussion. Recognize growth. Preview next phase." },
    ],
  },
]

export function getDrillsByCategory(category: string): Drill[] {
  return drills.filter((d) => d.category === category)
}

export function getDrillById(id: string): Drill | undefined {
  return drills.find((d) => d.id === id)
}

export function getPlanByPhase(phase: string): PracticePlan | undefined {
  return practicePlans.find((p) => p.phase === phase)
}
