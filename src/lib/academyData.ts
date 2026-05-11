import type { Gender } from "@/types"
import type { FieldDiagramSpec } from "@/components/academy/FieldDiagram"

// ─── TYPES ────────────────────────────────────────────────────────────

export type AgeTier = "youth" | "middle" | "high"
export type Pillar = "game" | "leadership" | "team"

export type QuizQuestionKind = "knowledge" | "scenario"

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  kind?: QuizQuestionKind
  scenario?: string // extra context for scenario questions
}

export type Position = "all" | "attack" | "midfield" | "defense" | "goalie" | "fogo"

export interface AcademyLesson {
  id: string
  lessonNumber: number
  title: string
  topic: "Fundamentals" | "Lacrosse IQ" | "Mental Game" | "Character"
  pillar: Pillar
  position?: Position   // undefined = "all" (applies to every position)
  description: string
  videoUrl?: string
  diagrams?: FieldDiagramSpec[]
  keyTakeaways?: string[]
  questions: QuizQuestion[]
}

export interface AcademyCourse {
  id: string
  tier: AgeTier
  tierLabel: string
  ageRange: string
  gradYears: string
  description: string
  gender: Gender
  lessons: AcademyLesson[]
}

export interface WallOfFameEntry {
  name: string
  program: "boys" | "girls"
  tier: AgeTier
  courseId: string
  completedAt: string
}

// ─── PILLAR CONFIG ───────────────────────────────────────────────────

export const PILLAR_CONFIG: Record<Pillar, { label: string; description: string }> = {
  game: { label: "The Game", description: "Learn fundamentals, positions, strategy, and how to play at the next level." },
  leadership: { label: "Leadership", description: "Develop the habits, mindset, and character that set leaders apart." },
  team: { label: "Team", description: "Understand what makes teams win — trust, sacrifice, and competing together." },
}

export const PILLAR_ORDER: Pillar[] = ["game", "leadership", "team"]

export const POSITION_CONFIG: Record<Position, { label: string; short: string }> = {
  all:      { label: "All Positions", short: "All" },
  attack:   { label: "Attack",        short: "ATT" },
  midfield: { label: "Midfield",      short: "MID" },
  defense:  { label: "Defense",       short: "DEF" },
  goalie:   { label: "Goalie",        short: "GK" },
  fogo:     { label: "FOGO",           short: "FO" },
}

export const POSITION_ORDER: Position[] = ["all", "attack", "midfield", "defense", "goalie", "fogo"]

// ─── API ENDPOINTS ────────────────────────────────────────────────────

const PROGRESS_API = "/.netlify/functions/academy-progress"
const WOF_API      = "/.netlify/functions/academy-wof"

// ─── WALL OF FAME ─────────────────────────────────────────────────────
// Backed by Airtable via academy-wof function.
// Falls back to empty array if the API is unreachable.

export async function getWallOfFame(): Promise<WallOfFameEntry[]> {
  try {
    const res = await fetch(WOF_API)
    if (!res.ok) throw new Error("WOF fetch failed")
    const data = await res.json()
    return (data.entries || []) as WallOfFameEntry[]
  } catch {
    return []
  }
}

export async function addToWallOfFame(
  name: string,
  gender: Gender,
  tier: AgeTier,
  courseId: string,
): Promise<void> {
  try {
    await fetch(WOF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gender, tier, courseId }),
    })
  } catch {
    // Non-fatal — wall of fame write failure silently ignored
  }
}

// ─── PROGRESS TRACKING ────────────────────────────────────────────────
// Backed by Airtable via academy-progress function.
// Uses localStorage as a write-through cache so the UI stays instant:
//   - Writes go to cache first, then sync to Airtable in the background
//   - Reads come from cache; full sync from Airtable on initial load

const PROGRESS_CACHE_KEY = "btb-academy-progress-v2"

export interface AcademyProgress {
  [courseId: string]: {
    completedLessons: string[]
    completedAt?: string
  }
}

function readCache(): AcademyProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCache(progress: AcademyProgress): void {
  try {
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(progress))
  } catch { /* storage full — non-fatal */ }
}

// Sync all progress for a user from Airtable into local cache
export async function syncProgressFromServer(userId: string): Promise<AcademyProgress> {
  try {
    const res = await fetch(`${PROGRESS_API}?userId=${encodeURIComponent(userId)}`)
    if (!res.ok) throw new Error("Sync failed")
    const data = await res.json()
    const progressMap: AcademyProgress = data.progressMap || {}
    writeCache(progressMap)
    return progressMap
  } catch {
    // Network error — return whatever is cached
    return readCache()
  }
}

// Read progress from cache (call syncProgressFromServer on mount for freshness)
export function getAcademyProgress(): AcademyProgress {
  return readCache()
}

// Mark a lesson complete: update cache immediately, persist to Airtable async
export function markLessonComplete(courseId: string, lessonId: string, userId?: string, playerName?: string, playerEmail?: string): void {
  const progress = readCache()
  if (!progress[courseId]) progress[courseId] = { completedLessons: [] }
  if (!progress[courseId].completedLessons.includes(lessonId)) {
    progress[courseId].completedLessons.push(lessonId)
  }
  writeCache(progress)

  // Background sync to Airtable (fire-and-forget)
  if (userId) {
    fetch(PROGRESS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        courseId,
        completedLessons: progress[courseId].completedLessons,
        completedAt: progress[courseId].completedAt,
        ...(playerName  ? { playerName }  : {}),
        ...(playerEmail ? { playerEmail } : {}),
      }),
    }).catch(() => { /* non-fatal */ })
  }
}

// Mark a full course complete: update cache + Airtable
export function markCourseComplete(courseId: string, userId?: string): void {
  const progress = readCache()
  if (!progress[courseId]) progress[courseId] = { completedLessons: [] }
  const completedAt = new Date().toISOString().split("T")[0]
  progress[courseId].completedAt = completedAt
  writeCache(progress)

  if (userId) {
    fetch(PROGRESS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        courseId,
        completedLessons: progress[courseId].completedLessons,
        completedAt,
      }),
    }).catch(() => { /* non-fatal */ })
  }
}

// ─── COURSE DATA ──────────────────────────────────────────────────────

const TIERS: { tier: AgeTier; label: string; ageRange: string; gradYears: string }[] = [
  { tier: "youth", label: "Youth", ageRange: "Ages 8–10", gradYears: "Grad Years 2034–2036" },
  { tier: "middle", label: "Middle School", ageRange: "Ages 11–13", gradYears: "Grad Years 2031–2033" },
  { tier: "high", label: "High School", ageRange: "Ages 14–17", gradYears: "Grad Years 2027–2030" },
]

// ─── BOYS LESSONS ─────────────────────────────────────────────────────

const BOYS_YOUTH_LESSONS: AcademyLesson[] = [
  {
    id: "boys-youth-l1",
    videoUrl: "https://www.youtube.com/watch?v=DFYpbgqY9vw",
    lessonNumber: 1,
    title: "Welcome to Lacrosse",
    topic: "Fundamentals",
    pillar: "game",
    description: `Lacrosse is the fastest game on two feet, and it's been called the "Creator's Game" because of its Native American origins. The sport combines elements of soccer, hockey, and basketball into one fast-paced game.\n\nYou play with a stick called a "crosse" that has a head and a pocket. You use it to catch, carry, and throw a small rubber ball. The goal is simple: put the ball in the other team's net.\n\nIn boys lacrosse, you wear a helmet, gloves, and pads because the game is physical. You can check sticks and bodies (when you're old enough). Each team has 10 players on the field — 3 attackmen, 3 midfielders, 3 defensemen, and 1 goalie.\n\nThe game is played in 4 quarters. The team with the most goals at the end wins. You can score from anywhere on the field, but most goals come from up close to the net.\n\nLacrosse rewards effort. The kids who hustle, who chase ground balls, and who work hard in practice are the ones who get better fastest. Skill takes time — but effort is a choice you make every day.`,
    questions: [
      {
      question: "How many players from each team are on the field?",
      options: [
        "10",
        "9",
        "8",
        "11",
      ],
      correctAnswer: 0,
      explanation: "10 players: 3 attack, 3 midfield, 3 defense, 1 goalie.",
    },
      {
      question: "What is the lacrosse stick called?",
      options: [
        "A pole",
        "A crosse",
        "A racket",
        "A shaft",
      ],
      correctAnswer: 1,
      explanation: "The stick is a 'crosse' — that's where the sport gets its name.",
    },
      {
      question: "Which group of players run both offense and defense?",
      options: [
        "Goalies",
        "Attackmen",
        "Midfielders",
        "Defensemen",
      ],
      correctAnswer: 2,
      explanation: "Midfielders cover the whole field. Attack stays low, defense stays back.",
    },
      {
      question: "How long does a typical youth lacrosse game last?",
      options: [
        "1 quarter",
        "3 quarters",
        "2 quarters",
        "4 quarters",
      ],
      correctAnswer: 3,
      explanation: "Lacrosse is played in 4 quarters. Highest score at the end wins.",
    },
      {
      question: "It's tryouts. Coach is watching from the sideline. Two players are equally skilled. What separates one from the other in the coach's notebook?",
      options: [
        "Hustles to every ground ball",
        "Talks the most",
        "Shoots the hardest",
        "Newer stick and gear",
      ],
      correctAnswer: 0,
      explanation: "Effort is a choice anyone can make — and it's what coaches notice first when skill is tied.",
      kind: "scenario",
      scenario: "Tryout day. Coach has 30 spots and 45 kids. He's watching how players move when they don't have the ball as much as when they do.",
    },
    ],
    keyTakeaways: [
      "Lacrosse is the fastest game on two feet — called the Creator's Game (Native American origins).",
      "Boys field 10: 3 attack, 3 midfield, 3 defense, 1 goalie. 4 quarters, most goals wins.",
      "You play with a crosse — a stick with a head and pocket for catching, carrying, throwing.",
      "Skill takes years. Effort is the choice you make every day — and it's what coaches notice first.",
    ],
    diagrams: [
      {
        title: "Boys Lacrosse — Where Everyone Plays",
        view: "men-full",
        caption: "Three attackmen (red circles) stay on the offensive end. Three middies (yellow) run the whole field. Three defensemen (blue squares) and the goalie (green) stay back to defend.",
        players: [
          {
            x: 30,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 50,
            y: 88,
            role: "attack",
            label: "A"
          },
          {
            x: 70,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 30,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 50,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 70,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 30,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 70,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 18,
            role: "goalie",
            label: "G"
          },
        ],
        legend: [
          {
            label: "Attack",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Midfield",
            color: "#EAB308",
            shape: "circle"
          },
          {
            label: "Defense",
            color: "#2563EB",
            shape: "square"
          },
          {
            label: "Goalie",
            color: "#10B981",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-youth-l2",
    videoUrl: "https://www.youtube.com/watch?v=ovd8u9ETUBk",
    lessonNumber: 2,
    title: "How to Hold and Cradle Your Stick",
    topic: "Fundamentals",
    pillar: "game",
    description: `Cradling is how you keep the ball in your stick while you run. If you can't cradle, the ball falls out — it's that simple. This is the foundation of every lacrosse skill.\n\nHOW TO CRADLE — STEP BY STEP\n\n1. Grip the Stick\nTop hand near the head of the stick, bottom hand near the butt end. Top hand grips firmly — it does most of the work. Bottom hand grips loosely — it's just a guide.\n\n2. The Motion\nThe cradle is a small wrist roll — like turning a doorknob back and forth. Don't swing your whole arm. Keep the motion tight and controlled. The ball stays in the pocket because of centripetal force (the spinning motion keeps it pressed to the side).\n\n3. Stick Protection Position\nWhen running, keep your top hand near your ear and the stick close to your body. This is called "stick protection position." It makes it much harder for defenders to throw checks and knock the ball out.\n\n4. Switching Hands\nTo switch: loosen your bottom hand, move the stick across your body, slide your bottom hand up, release your top hand and regrip. Your old bottom hand becomes your new top hand. Start learning this early! The more comfortable you are in both hands, the better player you'll be.\n\n5. Cradling While Running\nAs you get faster, the cradle has to get tighter. Don't let the stick bounce around. Smooth, controlled, close to your body. Practice running at full speed while cradling — it should feel natural.\n\nCOACHING POINTS\n- Practice cradling everywhere — walking around the house, watching TV, in the backyard\n- If you cradle too fast, the ball pops out. If you cradle too slow, it falls out. Find the rhythm.\n- The best players in the world cradle without thinking about it. That only comes from reps.`,
    questions: [
      {
      question: "Which hand controls the cradle?",
      options: [
        "Neither — it's all elbow",
        "Top hand — near the head of the stick",
        "Bottom hand — it grips harder",
        "Both hands work equally",
      ],
      correctAnswer: 1,
      explanation: "Top hand near the head does the cradling. Bottom hand is a loose guide.",
    },
      {
      question: "What kind of motion is a cradle?",
      options: [
        "A full arm swing forward",
        "A snapping shoulder rotation",
        "A wrist roll like turning a doorknob",
        "A bouncing stick movement",
      ],
      correctAnswer: 2,
      explanation: "Cradling is small wrist motion. Big arm motion drops the ball.",
    },
      {
      question: "What is 'stick protection position'?",
      options: [
        "Stick parallel to the ground sideways",
        "Stick across your chest, head down",
        "Stick low and away from your body",
        "Top hand near ear, stick close to body",
      ],
      correctAnswer: 3,
      explanation: "Top hand near your ear with the stick tight to your body makes it hard to check.",
    },
      {
      question: "Where should you practice cradling?",
      options: [
        "Anywhere — backyard, driveway, around the house",
        "Only on a lacrosse field",
        "Only at scheduled practices",
        "Only with a coach watching",
      ],
      correctAnswer: 0,
      explanation: "Reps build muscle memory. The best cradlers practice constantly, not just at practice.",
    },
      {
      question: "You're running up the wing on a fast break. A defender closes in from your stick side. What do you do with your stick?",
      options: [
        "Switch to your weak hand mid-stride",
        "Bring top hand to your ear, body between you and the D",
        "Hold the stick parallel to the ground",
        "Drop it lower for a quicker shot",
      ],
      correctAnswer: 1,
      explanation: "Stick protection — top hand near ear, body shielding — keeps the ball away from the defender's check.",
      kind: "scenario",
      scenario: "3rd quarter, you've got a step on the defender on your right. He's closing fast. The shot is 5 yards away.",
    },
    ],
    keyTakeaways: [
      "Top hand near the head, bottom near the butt-end. Top hand does the work; bottom guides.",
      "Cradle = small wrist roll, like turning a doorknob. Centripetal force keeps the ball in.",
      "Stick protection: top hand near your ear, body shielding the stick from the defender.",
      "Practice cradling everywhere — walking around the house counts. Reps until it's automatic.",
    ],
    diagrams: [
      {
        title: "Stick Protection While Cradling",
        view: "men-half-offensive",
        caption: "Top hand near your ear, body between defender and stick. Wrist-rolls keep the ball in — small, controlled motion. Don't swing your whole arm.",
        players: [
          {
            x: 50,
            y: 55,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 38,
            y: 60,
            role: "defender",
            label: "D"
          },
        ],
        labels: [
          {
            x: 60,
            y: 48,
            text: "Stick high, near ear",
            size: "xs"
          },
          {
            x: 50,
            y: 75,
            text: "Body shields stick",
            size: "xs"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-youth-l3",
    videoUrl: "https://www.youtube.com/watch?v=qtwKIxyOdGk",
    lessonNumber: 3,
    title: "Catching and Throwing",
    topic: "Fundamentals",
    pillar: "game",
    description: `Catching and throwing — also called "passing and receiving" — is the most important skill in lacrosse. If you can catch and throw, you can play. If you can't, the game gets very hard very fast.\n\nHOW TO THROW — STEP BY STEP\n\n1. Grip and Position\nTop hand near the head, bottom hand near the butt end. Bring the stick back behind your ear.\n\n2. Step Toward Your Target\nStep with your opposite foot (right-handed throw = step with left foot). This is the same as throwing a baseball.\n\n3. Snap and Follow Through\nPoint your top hand toward your target. Snap your wrist as you release — the stick does the work, not your arm. Follow through so the stick finishes pointing at your target.\n\nHOW TO CATCH — STEP BY STEP\n\n1. Give a Soft Target\nHold your stick out with the pocket facing the passer. This tells your teammate exactly where to throw.\n\n2. Absorb the Ball\nAs the ball arrives, "give" with your stick — pull it slightly back and down. This cushions the catch. If you keep the stick stiff (called "stabbing"), the ball bounces right out.\n\n3. Catch and Cradle\nThe second you catch, start cradling. It should be one fluid motion — catch, cradle, go.\n\nWALL BALL — THE SECRET TO EVERYTHING\nFind a wall. Throw the ball against it. Catch it as it comes back. Repeat. Do it with both hands.\n- Start with 25 per hand per day\n- Work up to 50, then 100\n- The pros do thousands\n- This is the single best thing you can do to improve your stick skills\n\nCOACHING POINTS\n- Soft hands, not stiff hands — absorb the ball on every catch\n- Always practice both hands, even if your off-hand feels terrible\n- Wall ball every single day. No excuses. This is how you get better.`,
    questions: [
      {
      question: "When you throw with your right hand on top, which foot steps forward?",
      options: [
        "Both feet jump together",
        "Right foot",
        "Left foot",
        "Either foot",
      ],
      correctAnswer: 2,
      explanation: "Step with the opposite foot — same as throwing a baseball.",
    },
      {
      question: "What does 'absorbing the ball' mean when catching?",
      options: [
        "Hold the stick rigid as ball arrives",
        "Stab the stick at the ball quickly",
        "Catch with the back of the head",
        "Pull stick back slightly to cushion the catch",
      ],
      correctAnswer: 3,
      explanation: "Soft hands give as the ball arrives — that's what keeps it in the pocket.",
    },
      {
      question: "What is wall ball?",
      options: [
        "Throwing and catching against a wall solo",
        "A shooting drill without a target",
        "A drill only goalies use",
        "A team game with two goalies",
      ],
      correctAnswer: 0,
      explanation: "Wall ball is the gold-standard solo drill — throw, catch, repeat. Both hands.",
    },
      {
      question: "What's the minimum daily wall-ball reps to start improving fast?",
      options: [
        "Whenever you feel like it",
        "25 per hand",
        "Only on practice days",
        "10 per hand",
      ],
      correctAnswer: 1,
      explanation: "Start at 25 per hand and build to 100. The pros do thousands. Daily reps = fast progress.",
    },
      {
      question: "Your friend is 8 yards away calling for a pass. You're running. Your stick is in your right hand. They're on your left. What do you do?",
      options: [
        "Stop and turn before throwing",
        "Throw it across your body righty",
        "Switch to lefty, then throw with both hands",
        "Yell and keep running yourself",
      ],
      correctAnswer: 2,
      explanation: "Pass with the hand on the same side as your target. Switching hands fast is why we practice both sides every day.",
      kind: "scenario",
      scenario: "Mid-game. Defender is on your right shoulder. Open teammate is breaking toward the goal on your left, 8 yards away.",
    },
    ],
    keyTakeaways: [
      "Throw: step with the opposite foot, snap the wrist, follow through pointing at the target.",
      "Catch: give a soft target with your stick, then 'absorb' — pull stick back as ball arrives.",
      "Wall ball is the single best stick-skill drill. Both hands. Daily.",
      "Stiff hands = drops. Soft hands = clean catches. Cushion the ball every time.",
    ],
  },
  {
    id: "boys-youth-l4",
    videoUrl: "https://www.youtube.com/watch?v=qtwKIxyOdGk",
    lessonNumber: 4,
    title: "Being a Great Teammate",
    topic: "Character",
    pillar: "team",
    description: `Lacrosse is a team sport. You can't win alone, no matter how good you are. The best players in the world are also the best teammates — and that's not a coincidence.\n\nBeing a great teammate means three things:\n\nFirst, encourage others. When a teammate scores, celebrate with them. When they mess up, pick them up. Don't make fun of anyone for missing a pass or having a bad day. Everyone has bad days — it's how teammates respond that matters.\n\nSecond, listen to your coaches. When the coach talks, you stop talking. You look at them. You listen. Coaches are trying to help you get better, and the kids who listen are the kids who improve. Eye rolls, side conversations, and complaints make you a worse teammate AND a worse player.\n\nThird, hustle for everyone. When you sprint to a ground ball, you're not just helping yourself — you're helping your team. When you back up a shot, you're saving your goalie a goal. When you run hard in transition, you're making it easier for your midfielder to make the next play.\n\nAt BTB, we say "the standard is the standard." That means everyone is expected to bring their best every day. Not because someone is watching, but because your teammates deserve it.`,
    questions: [
      {
      question: "A teammate drops an easy pass. What do you do?",
      options: [
        "Refuse to pass to them again",
        "Tell the coach to bench them",
        "Yell at them to focus",
        "Say 'shake it off, get the next one'",
      ],
      correctAnswer: 3,
      explanation: "Pick teammates up after mistakes. Trust gets built when teammates know you have their back.",
    },
      {
      question: "When the coach is giving instructions, what does a great teammate do?",
      options: [
        "Look at the coach, listen, no side talk",
        "Wait for the part that matters most",
        "Keep stretching to stay loose",
        "Repeat what coach said to a friend",
      ],
      correctAnswer: 0,
      explanation: "Eyes up, mouth shut. Side conversations cost you info AND respect.",
    },
      {
      question: "Why does hustle matter when you don't have the ball?",
      options: [
        "Coaches just like to see you tired",
        "It backs up shots and makes the team better",
        "It makes the other team angry",
        "It doesn't really — only ball-side counts",
      ],
      correctAnswer: 1,
      explanation: "Off-ball hustle wins ground balls, backs up shots, and creates second chances.",
    },
      {
      question: "What does 'the standard is the standard' mean at BTB?",
      options: [
        "The best player sets the bar",
        "Only games count, practice is optional",
        "Everyone is expected to bring their best, every day",
        "Coaches grade you on a curve",
      ],
      correctAnswer: 2,
      explanation: "Standards apply to everyone equally. No one gets a pass.",
    },
      {
      question: "Practice is dragging. It's hot. The drill is repetitive. Half the kids are walking between reps. What do you do?",
      options: [
        "Take a knee until coach yells",
        "Walk too — match the energy",
        "Ask coach to end practice early",
        "Sprint between reps and pick up balls",
      ],
      correctAnswer: 3,
      explanation: "Energy is contagious. One player setting the standard pulls the whole group with them.",
      kind: "scenario",
      scenario: "Tuesday practice in late August. 90°. You've done the same shooting drill four times. Coach is on the other side of the field.",
    },
    ],
    keyTakeaways: [
      "Encourage teammates after mistakes. Everyone has bad days — your reaction matters.",
      "When the coach talks, you stop talking. Eyes up, mouth shut. That's respect AND learning.",
      "Hustle helps the team even when you don't have the ball — back up shots, chase ground balls.",
      "The standard is the standard. Everyone is expected to bring their best every day.",
    ],
  },
  {
    id: "boys-youth-l5",
    lessonNumber: 5,
    title: "Where to Be on the Field",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Lacrosse field awareness — also called "lacrosse IQ" — is knowing where to be on the field. It's the difference between players who run around chasing the ball and players who actually help their team.\n\nThe field has zones. There's the offensive end (where you score), the defensive end (where the other team tries to score), and midfield. Each zone has rules about where you should be and what you should do.\n\nWhen your team has the ball, you should "spread out." Don't all run to the ball. Spread the defense by getting wide and giving your teammate with the ball options to pass to. If you're bunched up, the defense can guard everyone with fewer players.\n\nWhen the other team has the ball, you should "compress." Get tighter, help each other, and don't let the offense have easy passes. Communicate — yell to your teammates so everyone knows who they're guarding.\n\nThe simplest rule for young players: if you're not sure where to be, get to where you can help. If a teammate has the ball, get open for a pass. If a teammate is being pressured, run to help. If a teammate misses a shot, run to back it up. There's almost always something useful to do.`,
    questions: [
      {
      question: "Your team has the ball. Where should off-ball players go?",
      options: [
        "Spread out — give passing options",
        "Stand still and wait for a pass",
        "All run to the ball carrier",
        "Run to the goal in a clump",
      ],
      correctAnswer: 0,
      explanation: "Spread out so the defense has to cover the whole field, not just one spot.",
    },
      {
      question: "The other team has the ball. What does YOUR team do?",
      options: [
        "Spread out wide",
        "Compress and tighten up to help each other",
        "Run back to your own goal only",
        "Stand on the sideline",
      ],
      correctAnswer: 1,
      explanation: "On defense, compress — be close enough to help, far enough to cover your man.",
    },
      {
      question: "What is 'lacrosse IQ'?",
      options: [
        "How tall and strong you are",
        "How fast you run",
        "Knowing where to be and what to do",
        "How hard your shot is",
      ],
      correctAnswer: 2,
      explanation: "IQ is awareness — anticipating plays, finding open space, helping when needed.",
    },
      {
      question: "If you genuinely don't know where to be, what's the best move?",
      options: [
        "Stand on the sideline until coach calls",
        "Stay where you started no matter what",
        "Run to the goal regardless of the play",
        "Find a spot where you can help — backup, slide, get open",
      ],
      correctAnswer: 3,
      explanation: "When in doubt, get to where you can help. Movement with purpose beats freezing.",
    },
      {
      question: "Your teammate is dodging from behind the goal. Defense is collapsing on him. You're at the top of the offensive zone with no defender on you. What do you do?",
      options: [
        "Cut hard to the goal expecting a pass",
        "Yell for the ball but don't move",
        "Run back to defense",
        "Stand still — don't move",
      ],
      correctAnswer: 0,
      explanation: "When the defense collapses, the off-ball man is open. Cut to the goal — your teammate sees you.",
      kind: "scenario",
      scenario: "You're on offense at the top of the zone. Your teammate dodges from X. All three slides commit to him. You're suddenly unguarded.",
    },
    ],
    keyTakeaways: [
      "When YOUR team has the ball: spread out so the defense can't cover everyone.",
      "When the OTHER team has the ball: compress, get tight, communicate.",
      "If you don't know where to be, find a spot where you can help — back up a shot, get open, slide.",
      "Lacrosse IQ = knowing where to be BEFORE the play needs you there.",
    ],
    diagrams: [
      {
        title: "Spread Out on Offense",
        view: "men-half-offensive",
        caption: "Stay 5+ yards apart. If you bunch up, the defense covers everyone with fewer players. Spacing creates passing lanes and dodging room.",
        zones: [
          {
            shape: "rect",
            x: 12,
            y: 30,
            w: 76,
            h: 35,
            color: "#FACC15",
            label: "Stay 5+ yds apart"
          },
        ],
        players: [
          {
            x: 18,
            y: 40,
            role: "offense",
            label: "1"
          },
          {
            x: 50,
            y: 32,
            role: "offense",
            label: "2"
          },
          {
            x: 82,
            y: 40,
            role: "offense",
            label: "3"
          },
          {
            x: 35,
            y: 60,
            role: "offense",
            label: "4"
          },
          {
            x: 65,
            y: 60,
            role: "offense",
            label: "5"
          },
          {
            x: 50,
            y: 88,
            role: "offense",
            label: "X",
            ball: true
          },
        ],
        legend: [
          {
            label: "Offense",
            color: "#D22630",
            shape: "circle"
          },
        ]
      },
    ],
    videoUrl: "https://www.youtube.com/watch?v=4LHsrseSKak",
  },
  {
    id: "boys-youth-l6",
    videoUrl: "https://www.youtube.com/watch?v=eI7WKifE8aI",
    lessonNumber: 6,
    title: "The BTB Standard",
    topic: "Mental Game",
    pillar: "leadership",
    description: `The BTB Standard is what makes our program different. It's not about being the most talented kid — it's about being the kind of player coaches and teammates want around.\n\nThe Standard has three parts:\n\nEffort — You bring 100% every time you step on the field. Not 80% because you're tired. Not 60% because it's hot. 100%. If you're going to be on the field, you owe it to your teammates to give your best.\n\nAttitude — You show up ready to learn. You don't roll your eyes. You don't argue with coaches. You don't blame teammates. When something goes wrong, you say "my fault, I'll get the next one." When something goes right, you congratulate the teammates who helped.\n\nPreparation — You take care of your gear. You practice on your own time. You watch lacrosse on TV when you can. You ask questions when you don't understand. You're always trying to learn more.\n\nIf you do these three things, you'll improve faster than the kids who don't. That's a guarantee. Skill takes time, but the Standard is something you choose every day. And the kids who choose it become the players coaches remember forever.`,
    questions: [
      {
      question: "What are the three parts of the BTB Standard?",
      options: [
        "Goals, assists, ground balls",
        "Effort, attitude, preparation",
        "Helmet, gloves, stick",
        "Speed, strength, skill",
      ],
      correctAnswer: 1,
      explanation: "Effort + attitude + preparation — three choices anyone can make.",
    },
      {
      question: "How much effort does the BTB Standard require on the field?",
      options: [
        "80% to save energy for games",
        "Match what your teammates give",
        "100% every time — no excuses",
        "Whatever your coach asks for",
      ],
      correctAnswer: 2,
      explanation: "100% is the deal. Anything less, you owe your teammates an explanation.",
    },
      {
      question: "You make a bad pass that turns into a goal against you. What's the right response?",
      options: [
        "Argue with the ref",
        "Blame the receiver",
        "Walk off the field",
        "'My fault, I'll get the next one'",
      ],
      correctAnswer: 3,
      explanation: "Own it, reset, compete on the next play. That's BTB attitude.",
    },
      {
      question: "What's an example of preparation?",
      options: [
        "Wall ball on your own time, gear in order, watching games",
        "Doing only what the coach assigns",
        "Showing up exactly on time",
        "Buying new cleats every season",
      ],
      correctAnswer: 0,
      explanation: "Preparation is the work you do when nobody's making you.",
    },
      {
      question: "Saturday morning. Game at 9. You wake up at 7 — alarm didn't go off as planned. What does a BTB-Standard player do FIRST?",
      options: [
        "Skip warmups and go straight to the bench",
        "Check gear, eat, hydrate, mentally prep — get to game ready",
        "Check social media to wake up",
        "Text the coach you'll be late",
      ],
      correctAnswer: 1,
      explanation: "Preparation isn't just the day before. Game-day routine matters: gear check, hydrate, mental prep.",
      kind: "scenario",
      scenario: "Game day. You woke up later than planned but still have 90 minutes. The team is meeting at 8:15 for warmups.",
    },
    ],
    keyTakeaways: [
      "BTB Standard = Effort + Attitude + Preparation.",
      "Effort: 100% every time. Not 80% because you're tired. 100%.",
      "Attitude: own mistakes ('my fault, next one'), no eye-rolls, no blame.",
      "Preparation: care for gear, practice on your own, watch lacrosse, ask questions.",
    ],
  },
  {
    id: "boys-youth-l7",
    videoUrl: "https://www.youtube.com/watch?v=4KXp28yNO5Q",
    lessonNumber: 7,
    title: "Leading by Example",
    topic: "Character",
    pillar: "leadership",
    description: `You don't have to be the best player on your team to be a leader. You don't have to be the loudest kid on the field. Leadership at your age is simple: do the right thing when nobody is making you.\n\nLeading by example means showing up and doing the work. You're the kid who sprints when the coach says "jog." You're the kid who picks up the balls without being asked. You're the kid who stays after practice to get extra reps on the wall.\n\nHere's a secret most kids don't learn until they're older: people watch what you DO, not what you SAY. If you tell your teammates to hustle but you walk between drills, nobody listens. If you sprint every rep and never complain, your teammates start doing the same thing — without you saying a word.\n\nThe best leaders also show up on the bad days. When it's raining, when it's cold, when you're tired — those are the days that matter most. Anyone can lead when things are easy. Real leaders bring the same energy when everything is working against them.\n\nAt BTB, we believe leadership starts young. You don't have to wait until you're a captain or a senior. Start right now. Be the kid who does more than what's expected, every single day. That's what leading by example means.`,
    questions: [
      {
      question: "Do you have to be the best player on the team to lead?",
      options: [
        "Only if you're a captain",
        "Only the oldest kids can lead",
        "No — leadership is action, not skill",
        "Yes, only stars lead",
      ],
      correctAnswer: 2,
      explanation: "Leadership is a choice anyone makes. Action over status.",
    },
      {
      question: "What matters more — what you say or what you do?",
      options: [
        "Only what the coach says",
        "What you say — words motivate",
        "Both equal — they're tied together",
        "What you do — people watch actions",
      ],
      correctAnswer: 3,
      explanation: "Tell teammates to hustle while you walk and nobody listens. Sprint without a word and they follow.",
    },
      {
      question: "When does leadership matter most?",
      options: [
        "On bad days — rain, cold, tired",
        "When practice is easy",
        "When the team is winning",
        "Only at championship games",
      ],
      correctAnswer: 0,
      explanation: "Anyone can lead when things are easy. Real leaders bring it when conditions are bad.",
    },
      {
      question: "What's one specific 'lead by example' action you can do tomorrow?",
      options: [
        "Wear team colors off the field",
        "Sprint between drills and pick up balls",
        "Show up exactly on time",
        "Tell teammates to hustle",
      ],
      correctAnswer: 1,
      explanation: "Sprint and pick up balls — visible effort that pulls others up.",
    },
      {
      question: "First practice of the season. Half the team is jogging the warmup laps. The captain isn't there yet. What do you do?",
      options: [
        "Match the team's pace — fit in",
        "Ask the coach what speed to go",
        "Run faster — the rest will catch up to your example",
        "Wait for the captain to set the pace",
      ],
      correctAnswer: 2,
      explanation: "Leadership is showing up first and setting the tempo. You don't need a title to set the standard.",
      kind: "scenario",
      scenario: "Day 1 of fall ball. Coach said 'two laps to warm up'. Most kids are jogging. The captain is in the bathroom.",
    },
    ],
    keyTakeaways: [
      "Leadership doesn't require being the best player or wearing a 'C'.",
      "Lead by example: sprint when others jog, pick up balls, stay after for extra reps.",
      "Real leaders show up the same on bad days — rain, cold, tired — as on good days.",
      "People watch what you DO, not what you SAY. Actions set the standard.",
    ],
  },
  {
    id: "boys-youth-l8",
    videoUrl: "https://www.youtube.com/watch?v=rbL9yXyCXtQ",
    lessonNumber: 8,
    title: "Respecting the Game",
    topic: "Character",
    pillar: "leadership",
    description: `Lacrosse has been around for hundreds of years. Native Americans played it long before any of us were born, and it will be here long after we're gone. When you play lacrosse, you're part of something bigger than yourself — and that deserves respect.\n\nRespecting the game starts with how you treat your opponents. They're not your enemies — they're the people who make you better. Without competition, you never improve. Shake hands before the game. Shake hands after the game. Whether you win or lose, show the other team respect.\n\nRespecting the game means accepting the refs' calls. Refs make mistakes — that's part of sports. Arguing, whining, or throwing your stick doesn't change the call. It just makes you look bad and hurts your team. Play through it and compete on the next play.\n\nRespecting the game means taking care of your equipment. Your stick, your helmet, your pads — they're the tools of your sport. Don't throw them. Don't leave them in the rain. Take care of them the way a carpenter takes care of their tools.\n\nRespecting the game means giving it your full attention. When you're on the field, be on the field. Don't goof off during drills. Don't have side conversations when the coach is talking. The time you spend on the field is short — make every minute count.\n\nPlayers who respect the game earn respect from coaches, teammates, opponents, and parents. It's one of the best habits you can build at your age.`,
    questions: [
      {
      question: "How should you treat opponents?",
      options: [
        "Like enemies — beat them down",
        "Only if they're nice first",
        "Ignore them between whistles",
        "With respect — they push you to improve",
      ],
      correctAnswer: 3,
      explanation: "Without good opponents, you don't grow. Respect is what real competitors give.",
    },
      {
      question: "Ref makes a bad call against your team. Best response?",
      options: [
        "Accept it, compete on the next play",
        "Argue calmly until he sees it",
        "Throw your stick to show frustration",
        "Yell loud enough that he reverses it",
      ],
      correctAnswer: 0,
      explanation: "Refs miss calls. Arguing hurts your focus. Next-play mentality is what wins.",
    },
      {
      question: "You leave your stick out in the rain overnight. What does that say about you?",
      options: [
        "Sticks don't get damaged that easily",
        "You don't respect your tools or the game",
        "It's the parents' job to handle that",
        "Nothing — it's just a stick",
      ],
      correctAnswer: 1,
      explanation: "Your gear is the tools of your sport. Respecting it shows you respect the game.",
    },
      {
      question: "What does 'respecting the game' actually cover?",
      options: [
        "Just winning with class",
        "Wearing the team uniform proudly",
        "Opponents, refs, gear, and practice time",
        "Saying the right things to coaches",
      ],
      correctAnswer: 2,
      explanation: "Respect is total — for everyone and everything connected to the sport.",
    },
      {
      question: "Final whistle. You lost 8-7 on a goal you think was offside. Ref didn't call it. The other team is celebrating. What do you do?",
      options: [
        "Walk off without shaking hands",
        "Confront the ref about the call",
        "Stand and stare at the celebration",
        "Line up and shake hands cleanly",
      ],
      correctAnswer: 3,
      explanation: "Win or lose, you line up and shake hands. That's how you show the game respect — and the game pays you back over time.",
      kind: "scenario",
      scenario: "Tough loss. Final goal looked offside but wasn't called. The handshake line is forming. Your teammates are watching how you react.",
    },
    ],
    keyTakeaways: [
      "Opponents make you better — shake hands before and after every game.",
      "Refs miss calls. Arguing wastes energy and hurts your team. Compete on the next play.",
      "Take care of your gear — sticks, helmets, pads aren't toys.",
      "Be fully present at practice. Phones away, focus up. Time on the field is short.",
    ],
  },
  {
    id: "boys-youth-l9",
    videoUrl: "https://www.youtube.com/watch?v=2v4vfqctG88",
    lessonNumber: 9,
    title: "Why Teams Win",
    topic: "Mental Game",
    pillar: "team",
    description: `Here's something that might surprise you: the best team doesn't always have the best players. Sometimes the team with less talent wins because they play better TOGETHER.\n\nThink about it like this. If you have five amazing players who all want to score and none of them pass, they might lose to a team of average players who move the ball, play defense together, and fight for every ground ball as a group.\n\nTeams win because every player does their job. The attackman finishes the shot. The midfielder runs hard in transition. The defenseman slides on time. The goalie communicates. When everyone does their piece — not trying to do someone else's job — the team works.\n\nTeams win because they trust each other. When you trust your teammate to be in the right spot, you make the pass without hesitating. When you trust your slide will come, you play your man tight. Trust makes everyone braver and faster.\n\nTeams win because they pick each other up. When a teammate drops a ball, you don't groan — you clap and say "next one." When someone misses a shot, you back it up. When someone gets beat on defense, you slide. Every mistake is a chance for the TEAM to respond.\n\nNo one remembers the kid who scored the most goals on a losing team. Everyone remembers the team that fought together and won something nobody expected them to win. That's the power of playing as a team.`,
    questions: [
      {
      question: "Does the most talented team always win?",
      options: [
        "No — teamwork beats talent often",
        "Only if the talent is older",
        "Only in the playoffs",
        "Yes — talent wins championships",
      ],
      correctAnswer: 0,
      explanation: "Teams that move the ball, slide on time, and trust each other beat more talented teams regularly.",
    },
      {
      question: "What does 'doing your job' on a team mean?",
      options: [
        "Trying to score every play you can",
        "Playing your position, trusting teammates",
        "Switching positions when bored",
        "Doing the coach's job better than him",
      ],
      correctAnswer: 1,
      explanation: "Every position depends on the others. When everyone does their part, it works.",
    },
      {
      question: "How does trust get built between teammates?",
      options: [
        "By talking about it in team meetings",
        "By hanging out off the field",
        "Through reps — reliable effort over time",
        "Through senior leadership only",
      ],
      correctAnswer: 2,
      explanation: "Trust is the residue of repetition. Show up, do your job, build the bank.",
    },
      {
      question: "Teammate misses a wide-open shot. The team's reaction?",
      options: [
        "Yell for the next play",
        "Tell coach to bench him",
        "Groan and shake heads at him",
        "Clap, say 'next one' — pick him up",
      ],
      correctAnswer: 3,
      explanation: "How a team responds to mistakes is a team's identity. Pick teammates up — always.",
    },
      {
      question: "Down 4-0 in the second quarter. The other team is bigger and faster. Two of your teammates are starting to drop their heads. What's the team-first move?",
      options: [
        "Sprint to the next ground ball harder than ever",
        "Tell teammates to stop trying so hard",
        "Ask coach to call timeout to vent",
        "Drop your head too — match the energy",
      ],
      correctAnswer: 0,
      explanation: "Energy is a choice. One player setting the tempo can flip a team. Compete on the next play, score doesn't matter.",
      kind: "scenario",
      scenario: "12 minutes in. You're down 4-0. The other team has bigger, older kids. Two of your teammates are starting to drag.",
    },
    ],
    keyTakeaways: [
      "The most talented team doesn't always win — the team that plays together does.",
      "Doing your job means trusting teammates to do theirs. Don't try to play 3 positions.",
      "Trust is built rep by rep. Every right pass and on-time slide adds to the bank.",
      "Pick teammates up after mistakes — it's how teams respond to errors that decides games.",
    ],
  },
  {
    id: "boys-youth-l10",
    lessonNumber: 10,
    title: "Competing Together",
    topic: "Mental Game",
    pillar: "team",
    description: `Every team faces hard moments. You'll play games in the rain. You'll lose to teams you thought you'd beat. You'll have practices where nothing goes right. What matters isn't whether hard things happen — it's how your team responds.\n\nCompeting together means nobody gives up. If you're down 5-0 in the first half, you don't stop trying. You fight just as hard on the last ground ball as the first. Why? Because your teammates are watching. If you quit, it tells them it's OK to quit too. If you keep competing, it lifts everyone up.\n\nCompeting together means celebrating each other's wins. When your teammate scores, you celebrate like YOU scored. When your goalie makes a big save, the whole team reacts. When your defenseman causes a turnover, everyone lets them know it mattered. Energy is contagious — and the team that celebrates together plays harder together.\n\nCompeting together means handling losses like a group. After a tough loss, you don't point fingers. You don't blame one person. You say "we'll get better" and you mean it. The best teams learn from losses and come back stronger at the next practice.\n\nHere's the truth about competing: it's supposed to be hard. If it were easy, everyone would do it. The teams that embrace the hard stuff — the cold games, the tough opponents, the long practices — those are the teams that build something special. And you'll remember competing with those teammates for the rest of your life.`,
    questions: [
      {
      question: "Down 5-0 in the first half. What's the right mindset?",
      options: [
        "Blame the goalie for letting them in",
        "Compete on every play — score doesn't change effort",
        "Walk through plays quietly",
        "Conserve energy for the next game",
      ],
      correctAnswer: 1,
      explanation: "Effort is independent of the scoreboard. Your teammates are watching your response.",
    },
      {
      question: "Teammate scores a beautiful goal. Best team reaction?",
      options: [
        "Save the celebration for the end of the game",
        "Standard nod and run back",
        "Celebrate like YOU scored — energy spreads",
        "Wait to see if it counts first",
      ],
      correctAnswer: 2,
      explanation: "Celebrating loudly together feeds momentum. Quiet teams play tight.",
    },
      {
      question: "After a tough loss, what does the team do?",
      options: [
        "Skip the next practice to recover",
        "Pretend it didn't happen",
        "Find someone to blame",
        "Own it together — 'we'll fix it' — and mean it",
      ],
      correctAnswer: 3,
      explanation: "Tough losses are growth moments — if the team owns them together.",
    },
      {
      question: "What's the difference between competing and winning?",
      options: [
        "Competing means giving full effort regardless of score",
        "Competing only matters in the playoffs",
        "Competing is what coaches say when you lose",
        "Same thing",
      ],
      correctAnswer: 0,
      explanation: "You can compete and lose. You can't grow without competing. Competing is the choice — winning is the byproduct.",
    },
      {
      question: "It's pouring rain, you're tied, 30 seconds left. Your team has to clear the ball under heavy ride pressure. The crowd is loud. What do you focus on?",
      options: [
        "The crowd noise to get hyped",
        "Your job: my outlet target, my spacing, my next pass",
        "Whether the rain is letting up",
        "The scoreboard ticking down",
      ],
      correctAnswer: 1,
      explanation: "Pressure narrows focus. Big moments demand small thinking — do your job, the next 5 seconds, then the next 5.",
      kind: "scenario",
      scenario: "Tied 6-6, 30 seconds left, rain pouring, your team has the ball at your own goal line. Goalie just made a save. The other team is riding aggressively.",
    },
    ],
    keyTakeaways: [
      "Hard moments are inevitable — what matters is how the team responds.",
      "When down big, don't quit. Your effort affects every teammate watching.",
      "Celebrate teammates' wins like they're yours. Energy is contagious.",
      "After tough losses: 'we'll get better' — and mean it. No finger-pointing.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
]

const BOYS_MIDDLE_LESSONS: AcademyLesson[] = [
  {
    id: "boys-middle-l1",
    lessonNumber: 1,
    title: "Positions and Their Roles",
    topic: "Fundamentals",
    pillar: "game",
    description: `By middle school, you should understand what every position on the field does. This knowledge makes you a smarter player no matter where you play, because lacrosse is a team game where every position depends on every other.\n\nAttackmen play in front of the opposing goal and almost never cross midfield. Their job is to score and feed (pass to set up goals). Good attackmen have great stick skills, can dodge from X (behind the goal), and read defenses. They live in the offensive end.\n\nMidfielders play the whole field — offense and defense. They're the most athletic players on the team because they run constantly. A good middie can dodge, shoot, defend, and play transition. There are usually 6 midfielders on a team who rotate in shifts of 3.\n\nDefensemen play in front of their own goal. They use long sticks (called "long poles") to disrupt the offense. They throw checks, force turnovers, and clear the ball up to the offense. Good defensemen are physical, smart, and great communicators.\n\nGoalies are the last line of defense. They wear extra padding and use a stick with a much bigger head. They have to be brave (the ball is hard and comes fast), have great hand-eye coordination, and be loud — they're in charge of the defense and direct the slide packages.\n\nUnderstanding what every position does helps you play yours better. When you know what your defenseman is supposed to do, you can help them. When you know what your goalie sees, you can position yourself correctly.`,
    questions: [
      {
      question: "Which position runs both offense and defense?",
      options: [
        "Attackman",
        "Goalie",
        "Midfielder",
        "Long-pole defenseman",
      ],
      correctAnswer: 2,
      explanation: "Midfielders cover the whole field. They sub off in shifts.",
    },
      {
      question: "Where does an attackman primarily play?",
      options: [
        "All over the field",
        "Wherever there's an open lane",
        "Behind their own goal mostly",
        "Around the opposing goal — rarely cross midfield",
      ],
      correctAnswer: 3,
      explanation: "Attackmen stay in the offensive end. They don't usually cross midfield.",
    },
      {
      question: "Why must goalies be loud communicators?",
      options: [
        "They direct the defense and call slides",
        "Refs require it for clears",
        "The fans need to hear them",
        "It intimidates the offense",
      ],
      correctAnswer: 0,
      explanation: "Goalies see the whole field. They run defensive communication.",
    },
      {
      question: "What is an LSM (long-stick midfielder)?",
      options: [
        "An attackman with a longer stick",
        "A midfielder using a long defensive stick",
        "A goalie's backup",
        "A faceoff specialist",
      ],
      correctAnswer: 1,
      explanation: "LSMs play midfield with a long pole — disruption + clearing.",
    },
      {
      question: "Coach moves you from middie to attack mid-season. You've never played attack. What's your first move?",
      options: [
        "Argue — you're better at midfield",
        "Quit the team",
        "Watch attackmen on film, learn the spots and dodges",
        "Refuse to dodge in games until comfortable",
      ],
      correctAnswer: 2,
      explanation: "Position changes are growth opportunities. Film + reps. The kids who adapt earn more roles.",
      kind: "scenario",
      scenario: "Mid-season your coach pulls you aside: he needs an attackman. You've played midfield your whole life.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=UGRkkLFv-Vw",
    keyTakeaways: [
      "Attack stays on offense (3 players). Midfield runs both ways (3). Defense stays back (3). Goalie (1).",
      "Long sticks (defensemen + LSM) check, force turnovers, clear ball.",
      "Midfielders are the most athletic — sub off in shifts to stay fresh.",
      "Goalies direct the defense — they're the loudest player on the field.",
    ],
    diagrams: [
      {
        title: "Men's Field — All 10 Positions",
        view: "men-full",
        caption: "Three attackmen below midfield. Three midfielders cover the whole field. Three defensemen + goalie stay back. Long-poles can ride into the offensive end on certain plays.",
        players: [
          {
            x: 30,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 50,
            y: 88,
            role: "attack",
            label: "A"
          },
          {
            x: 70,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 30,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 50,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 70,
            y: 60,
            role: "midfield",
            label: "M"
          },
          {
            x: 30,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 70,
            y: 40,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 18,
            role: "goalie",
            label: "G"
          },
        ],
        legend: [
          {
            label: "Attack",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Midfield",
            color: "#EAB308",
            shape: "circle"
          },
          {
            label: "Defense (long pole)",
            color: "#2563EB",
            shape: "square"
          },
          {
            label: "Goalie",
            color: "#10B981",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-middle-l2",
    videoUrl: "https://www.youtube.com/watch?v=ovd8u9ETUBk",
    lessonNumber: 2,
    title: "Dodging Fundamentals",
    topic: "Fundamentals",
    pillar: "game",
    description: `A dodge is how you beat your defender to create space — for a shot, a pass, or a chance to drive to the goal. Every offensive player needs to dodge. There are three main types you should master.\n\nThe Split Dodge is the most common. You run at your defender hard, plant one foot, and explode the opposite direction while switching your stick from one hand to the other. The key is selling the first direction with your body — your defender has to believe you're going right before you cut left. Speed and a quick hand switch make it work.\n\nThe Roll Dodge is for when a defender plays you tight. You drive into the defender, plant your inside foot, and roll backwards (away from them) protecting your stick. As you roll, you keep your stick high and wrap around your body. When you finish the roll, you should be facing the goal with the defender behind you. This is how you beat aggressive defenders.\n\nThe Face Dodge is a quick fake without changing hands. You bring your stick across your face like you're going to switch hands, but you don't — you keep the same hand. The defender reaches for the fake and you blow by. This is fastest because you don't lose any speed.\n\nThe most important thing about dodging isn't the move itself — it's the change of speed. You have to go from slow to fast in one step. If you dodge at one speed, the defender will recover. If you dodge with an explosive change of pace, you create separation.`,
    questions: [
      {
      question: "What's the most important element of any dodge?",
      options: [
        "Switching hands as fast as possible",
        "How loud you yell during it",
        "How fancy the move looks",
        "Change of speed — slow to fast in one step",
      ],
      correctAnswer: 3,
      explanation: "Change of pace creates separation. A flashy dodge at one speed doesn't work.",
    },
      {
      question: "In a split dodge you switch hands. In a face dodge you...",
      options: [
        "Keep the same hand but fake the switch",
        "Spin all the way around",
        "Switch hands twice",
        "Drop the stick mid-dodge",
      ],
      correctAnswer: 0,
      explanation: "Face dodge fakes the switch — fastest because you don't lose any speed.",
    },
      {
      question: "When is a roll dodge most useful?",
      options: [
        "Wide open field, no defender",
        "Against a defender playing you very tight",
        "Only against goalies stepping out",
        "When you're tired and slow",
      ],
      correctAnswer: 1,
      explanation: "Roll dodges work when defenders are right on you — protect stick, roll past.",
    },
      {
      question: "What's the mistake most middle-schoolers make when dodging?",
      options: [
        "Calling for the ball mid-dodge",
        "Bringing the stick too high",
        "Running at one speed the whole time",
        "Switching hands too fast",
      ],
      correctAnswer: 2,
      explanation: "One-speed dodges let the defender recover. Explosive change of pace is the key.",
    },
      {
      question: "Defender is tight on your right hip, mirroring your every step. You can't get separation. What dodge?",
      options: [
        "Face dodge — fake the switch and blow by",
        "Split dodge — switch hands and go opposite",
        "Slow down and pass it back",
        "Roll dodge — plant, roll backwards, protect stick",
      ],
      correctAnswer: 3,
      explanation: "Tight, mirroring defender = roll dodge. Plant the inside foot, roll away, stick protected.",
      kind: "scenario",
      scenario: "1v1 from up top. Defender is glued to your right hip. Every move you make, he mirrors. You need to create space NOW.",
    },
    ],
    keyTakeaways: [
      "Three core dodges: split, roll, face. Each beats a different defender posture.",
      "Split dodge: switch hands, change direction. The change of pace is what beats them.",
      "Roll dodge: against tight defenders — plant inside foot, roll backwards, protect stick.",
      "Face dodge: fake the switch but keep the same hand — fastest because no speed loss.",
    ],
    diagrams: [
      {
        title: "Split Dodge — Path",
        view: "men-half-offensive",
        caption: "Attack right at the defender's chest, plant inside foot, switch hands, explode the opposite direction. The change of pace creates separation.",
        players: [
          {
            x: 50,
            y: 35,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 50,
            y: 48,
            role: "defender",
            label: "D"
          },
          {
            x: 30,
            y: 65,
            role: "offense",
            label: "2"
          },
          {
            x: 70,
            y: 65,
            role: "offense",
            label: "3"
          },
        ],
        arrows: [
          {
            from: {
              x: 50,
              y: 35
            },
            to: {
              x: 50,
              y: 50
            },
            kind: "run",
            label: "1. Attack"
          },
          {
            from: {
              x: 50,
              y: 50
            },
            to: {
              x: 30,
              y: 70
            },
            kind: "run",
            curve: -8,
            label: "2. Split & go"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-middle-l3",
    videoUrl: "https://www.youtube.com/watch?v=VxGmfQUvX_k",
    lessonNumber: 3,
    title: "Defensive Footwork and Positioning",
    topic: "Fundamentals",
    pillar: "game",
      position: "defense",
    description: `Good defense in lacrosse starts with footwork. Most young defenders try to swing their stick at the ball — that's a mistake. The best defenders move their feet, stay in position, and force the offense into bad spots.\n\nDEFENSIVE FUNDAMENTALS\n\n1. Breakdown Position\nKnees bent, weight on the balls of your feet, hips low, stick out in front. This is your defensive stance. From here you can move in any direction instantly. Standing tall means you're already beat.\n\n2. Footwork: Slide-Step, Never Cross\nWhen the offense moves, you shuffle. Slide left, slide right — always keeping your hips square to the ball carrier. NEVER cross your feet. Crossing = losing balance = getting beat.\n\n3. The Approach\nWhen closing out on a ball carrier, don't run straight at him. Take an angle that forces him to one side. Take away the middle of the field and push him toward the sideline or toward your help.\n\n4. Stick Checks\nUse quick "poke checks" — a short jab toward the hands or stick head. These are more effective than wild, swinging checks. The goal isn't to take the ball away every time. The goal is to disrupt, force a bad decision, and slow the dodger down so your slide can arrive.\n\nDEFENSIVE COMMUNICATION\nDefense is a talking game. Every defender needs these calls:\n- "I got ball!" — I'm on the ball carrier\n- "I got two!" or "I'm hot!" — I'm the first slide\n- "I got three!" — I'm the second slide\n- "Check!" — The ball carrier picked up his stick to pass — tighten up\n- "Fire! Fire!" — Slide NOW\n\nTHE CARDINAL RULE\nStay between your man and the goal. If you're between your man and the goal, you've already won most of the battle. If he gets past you, your team is scrambling.\n\nCOACHING POINTS\n- Defense is 80% footwork, 20% stick work\n- Poke checks > wild swings. Controlled, quick, directed.\n- The player who communicates on defense is worth more than the player who just checks hard`,
    questions: [
      {
      question: "What's the cardinal rule of defense?",
      options: [
        "Stay between your man and the goal",
        "Stand tall to look bigger",
        "Run to the ball carrier first",
        "Always check hard",
      ],
      correctAnswer: 0,
      explanation: "Body position between man and goal is the foundation.",
    },
      {
      question: "Defensive footwork basic rule:",
      options: [
        "Cross feet for max speed",
        "Slide-step, never cross feet",
        "Stand flat-footed for balance",
        "Jump backwards to keep cushion",
      ],
      correctAnswer: 1,
      explanation: "Crossing feet = losing balance = getting beat.",
    },
      {
      question: "Goal of a poke check?",
      options: [
        "Get the ref to throw a flag",
        "Knock the helmet off",
        "Disrupt and slow the dodger down",
        "Take the ball away every time",
      ],
      correctAnswer: 2,
      explanation: "Poke checks force bad decisions and buy slide time. They rarely win the ball.",
    },
      {
      question: "How should you approach a ball carrier?",
      options: [
        "Run straight at him full speed",
        "Stand still and wait for him to come",
        "Reach with your stick before approaching",
        "Take an angle that pushes him to the sideline",
      ],
      correctAnswer: 3,
      explanation: "Angle takes away the middle and pushes him into help.",
    },
      {
      question: "Attackman driving from your right wing. He's heading toward the middle of the field. You're guarding him. What do you do?",
      options: [
        "Slide-step to cut off his middle path, force him sideline",
        "Reach with your stick to slow him",
        "Run past him to the goalie's position",
        "Drop your stick down and brace for contact",
      ],
      correctAnswer: 0,
      explanation: "Cut off the middle. Force him to the sideline where help is — and where the angle to score gets bad.",
      kind: "scenario",
      scenario: "Right wing dodge from up top. The attackman is faster than you and trying to get to the middle for an inside roll.",
    },
    ],
    keyTakeaways: [
      "Defense is 80% footwork, 20% stick work. Move feet, not stick.",
      "Slide-step (never cross feet) — keep hips square to the ball carrier.",
      "Stay between man and goal — that's the cardinal rule.",
      "Poke checks > wild swings. Disrupt and force bad decisions, don't always go for the ball.",
    ],
    diagrams: [
      {
        title: "Defensive Stance + Approach Angle",
        view: "men-half-defensive",
        caption: "Stay between man and goal. Force the dodger to the sideline (away from the middle). Slide-step — never cross your feet. Push him into your help.",
        players: [
          {
            x: 60,
            y: 50,
            role: "offense",
            label: "O",
            ball: true,
            highlight: true
          },
          {
            x: 60,
            y: 60,
            role: "defender",
            label: "D"
          },
          {
            x: 50,
            y: 80,
            role: "goalie",
            label: "G"
          },
        ],
        zones: [
          {
            shape: "rect",
            x: 35,
            y: 60,
            w: 30,
            h: 22,
            color: "#D22630",
            label: "Take away middle"
          },
        ],
        arrows: [
          {
            from: {
              x: 60,
              y: 50
            },
            to: {
              x: 80,
              y: 70
            },
            kind: "run",
            curve: 5,
            label: "Push to sideline"
          },
        ],
        legend: [
          {
            label: "Offense",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-middle-l4",
    lessonNumber: 4,
    title: "Reading the Field — Lacrosse IQ",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Reading the field means understanding what's happening BEFORE it happens. The best lacrosse players don't react — they anticipate. This is what separates good middle schoolers from great ones.\n\nWhen you have the ball, scan the field. Where are your teammates? Where is open space? Where is the defense weakest? You should know all this before you make your move, not after. The best players see the whole field at once.\n\nWhen you don't have the ball, watch the player with the ball and the defenders. Anticipate where the ball is going next. If a teammate is being doubled, get open for an outlet pass. If the defense is sliding to your teammate, expect that you might be left open — be ready to receive.\n\nOn defense, watch the ball carrier's body language. Are they going to dodge? Are they passing? Where are their eyes looking? A player's eyes usually tell you where they're going to throw. If you can read that, you can intercept passes.\n\nLacrosse IQ comes from two things: experience (the more you play, the more patterns you recognize) and film study (watching games and analyzing what good players do). Start watching college and pro lacrosse on YouTube. Pause when something interesting happens and ask: why did they do that? Where was the open space? What did the defense do wrong?\n\nThe best way to improve your IQ at this age is just to watch the game with curiosity. Don't just watch the ball — watch the players without the ball. That's where you learn the most.`,
    questions: [
      {
      question: "What separates good players from great ones in IQ?",
      options: [
        "Greats have nicer gear",
        "Greats anticipate, not just react",
        "Greats are taller and stronger",
        "Greats run faster",
      ],
      correctAnswer: 1,
      explanation: "Anticipation — seeing the play before it happens — is the IQ marker.",
    },
      {
      question: "Watching film, what should you focus on?",
      options: [
        "Just the goalie's saves",
        "The scoreboard and time",
        "Off-ball movement — that's the lesson",
        "Just the ball at all times",
      ],
      correctAnswer: 2,
      explanation: "Off-ball movement teaches positioning, anticipation, team play.",
    },
      {
      question: "On defense, what tells you where the ball carrier will pass?",
      options: [
        "How they hold their stick",
        "Their feet and stride",
        "Their helmet number",
        "Their eyes — they look where they're throwing",
      ],
      correctAnswer: 3,
      explanation: "Eyes telegraph passes. Reading them = interceptions.",
    },
      {
      question: "When you have the ball, what should you do BEFORE you make your move?",
      options: [
        "Scan: teammates, space, weak defender",
        "Wait until coach calls a play",
        "Run as fast as possible",
        "Yell for a pick",
      ],
      correctAnswer: 0,
      explanation: "Great players scan first, commit second. That's how openings are seen.",
    },
      {
      question: "You catch the ball topside. As you turn, you see the crease defender step toward you — clearly preparing to slide. What do you do?",
      options: [
        "Shoot from where you are",
        "Pass to the crease attackman the slider just left",
        "Pass back to where you got the ball",
        "Dodge harder, ignore the slide",
      ],
      correctAnswer: 1,
      explanation: "Slide left a man open. Pass to him — that's a layup. Forcing the dodge into the slide is a turnover.",
      kind: "scenario",
      scenario: "You catch a feed up top. As you load to dodge, you see the crease defender's hips turn toward you — he's about to slide.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=4LHsrseSKak",
    keyTakeaways: [
      "Lacrosse IQ = anticipating, not just reacting.",
      "With ball: scan teammates, open space, weakest defender BEFORE you commit.",
      "Off-ball: watch ball carrier + defenders, get to where the ball is going next.",
      "Eyes telegraph passes. Read where the ball carrier is looking.",
    ],
    diagrams: [
      {
        title: "Reading the Slide",
        view: "men-half-offensive",
        caption: "Before committing, find the slide. If the slider leaves their man, pass to that player — they're now open. If no slide comes, dodge hard and finish.",
        players: [
          {
            x: 25,
            y: 60,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 50,
            y: 75,
            role: "offense",
            label: "2"
          },
          {
            x: 75,
            y: 60,
            role: "offense",
            label: "3"
          },
          {
            x: 28,
            y: 65,
            role: "defender",
            label: "Da"
          },
          {
            x: 52,
            y: 80,
            role: "defender",
            label: "Db"
          },
          {
            x: 73,
            y: 65,
            role: "defender",
            label: "Dc"
          },
        ],
        arrows: [
          {
            from: {
              x: 25,
              y: 60
            },
            to: {
              x: 35,
              y: 75
            },
            kind: "run",
            curve: -3,
            label: "1. Dodge"
          },
          {
            from: {
              x: 52,
              y: 80
            },
            to: {
              x: 38,
              y: 75
            },
            kind: "run",
            label: "2. Slide leaves"
          },
          {
            from: {
              x: 25,
              y: 60
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "pass",
            curve: -3,
            label: "3. Skip to 2"
          },
        ],
        legend: [
          {
            label: "Offense",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-middle-l5",
    lessonNumber: 5,
    title: "Mental Toughness Under Pressure",
    topic: "Mental Game",
    pillar: "team",
    description: `Mental toughness is what keeps you playing your best when things get hard. Every player has good games. The toughest players have good games AND bad games — and they fight just as hard in both.\n\nHere's what mental toughness actually looks like in middle school lacrosse:\n\nWhen you make a mistake, you reset. You don't dwell on it. You don't drop your head. You don't look at the bench like "sorry coach." You take a breath, refocus, and play the next play. The hardest thing in sports is letting go of a mistake fast. Mentally tough players let it go in seconds.\n\nWhen the ref makes a bad call, you don't argue. You don't whine. You play harder on the next play. Refs make mistakes — it's part of the game. Players who complain about refs lose focus and play worse. Players who shake it off and compete are the ones who win.\n\nWhen you're tired, you push through. The fourth quarter is when games are won. Most players slow down when they're tired. The mentally tough player speeds up — because they know everyone else is slowing down. That's your edge.\n\nWhen you're losing, you don't quit. Down 6-0? You compete on every ground ball like it's 0-0. You play defense like every save matters. Mentally tough players don't care about the score — they care about the next play. You can't change the score, but you can change how hard you play right now.\n\nMental toughness is a muscle. The more you practice it in small moments — finishing one extra rep, running one more sprint, staying focused after a bad play — the stronger it gets.`,
    questions: [
      {
      question: "After a mistake, what's the tough-player move?",
      options: [
        "Argue with the ref about the play",
        "Find a teammate to blame",
        "Reset fast — focus on the next play",
        "Drop your head until the next sub",
      ],
      correctAnswer: 2,
      explanation: "Mentally tough players let go of mistakes in seconds.",
    },
      {
      question: "When does mental toughness actually get tested?",
      options: [
        "Only at championship games",
        "When everything is going well",
        "When you're winning easy",
        "When tired, losing, or frustrated",
      ],
      correctAnswer: 3,
      explanation: "Toughness is built and shown in adversity.",
    },
      {
      question: "Down 7-1 in the third. What's the right mindset?",
      options: [
        "Compete on every play — score doesn't change effort",
        "Try to score 6 yourself to catch up",
        "Take it easy to avoid injury",
        "Conserve energy for next game",
      ],
      correctAnswer: 0,
      explanation: "Effort is independent of the scoreboard.",
    },
      {
      question: "Why do tough players get FASTER in the 4th quarter?",
      options: [
        "The whistle motivates them",
        "Most opponents are slowing down — that's the edge",
        "They're in better shape than everyone",
        "Coaches force them to sprint",
      ],
      correctAnswer: 1,
      explanation: "If you're holding pace while opponents slow, you've gained relative speed. That's the gap.",
    },
      {
      question: "Bad call costs you a goal. Crowd is yelling at the ref. Your teammates are arguing. 30 seconds later, the ball is loose at midfield. What do you do?",
      options: [
        "Yell at the ref about the bad call",
        "Stand and wait for someone else to get it",
        "Sprint to the ground ball — next play",
        "Walk over to argue with coach",
      ],
      correctAnswer: 2,
      explanation: "Tough players play through bad calls. Sprint to the ball — that's how you flip momentum.",
      kind: "scenario",
      scenario: "Late 3rd quarter. Bad call wiped out your team's goal. The crowd is angry, your teammates are arguing. Then: ground ball at midfield.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    keyTakeaways: [
      "Mistakes are inevitable. Tough players reset in seconds — don't dwell.",
      "When tired, push HARDER — everyone else is slowing down. That's your edge.",
      "Don't argue with refs. It costs focus and rarely changes the call.",
      "Score doesn't dictate effort. Compete play to play, not based on the scoreboard.",
    ],
  },
  {
    id: "boys-middle-l6",
    lessonNumber: 6,
    title: "Becoming a Leader on Your Team",
    topic: "Character",
    pillar: "leadership",
    description: `Leadership in middle school lacrosse doesn't mean wearing a "C" on your jersey. It doesn't mean being the loudest kid in the huddle. Real leadership is about how you act when nobody is paying attention.\n\nThe biggest myth about leadership is that you have to be the best player. You don't. Some of the best leaders on great teams are bench players who bring incredible energy at practice every day. Leadership is a choice — anyone can do it if they choose to.\n\nHere's what middle school leadership looks like:\n\nYou show up early. You stay late. You're the one who picks up balls without being told. You sprint hard in conditioning even though no one is watching the back of the line. You set the standard with your actions.\n\nYou pick up teammates. When a teammate makes a mistake, you're the first one to say "shake it off, I got you." When a teammate scores, you're the first to celebrate with them. When practice is grinding and everyone is tired, you're the one who picks up the energy.\n\nYou don't talk behind anyone's back. Real leaders don't gossip about teammates, complain about coaches to their friends, or make excuses. If you have a problem, you talk directly to the person and try to fix it. Leaders build trust — and trust is built by being honest and reliable.\n\nYou take coaching well. Leaders don't argue with feedback. They say "got it, coach" and apply it on the next rep. When teammates see you take coaching, they learn to do the same.\n\nIf you do these things, your coaches will notice. Your teammates will notice. And one day, when there's a hard moment in a game and the team needs someone to step up, everyone will look at you — because you've already been leading the whole time.`,
    questions: [
      {
      question: "Do you need to be a starter to be a leader?",
      options: [
        "Only if you wear a captain's C",
        "Only seniors lead",
        "Yes — only starters lead",
        "No — leadership is a choice anyone can make",
      ],
      correctAnswer: 3,
      explanation: "Effort and example don't require status.",
    },
      {
      question: "Real leaders handle teammate problems by...",
      options: [
        "Going directly to the person to fix it",
        "Telling other teammates first",
        "Talking behind their backs",
        "Letting it stay unresolved",
      ],
      correctAnswer: 0,
      explanation: "Direct, honest communication builds trust. Gossip destroys it.",
    },
      {
      question: "Biggest leadership tell at practice?",
      options: [
        "Being friends with the coach",
        "Setting the standard with action — first, focused",
        "Being the loudest in huddle",
        "Wearing the best gear",
      ],
      correctAnswer: 1,
      explanation: "Actions are visible. Words alone don't lead.",
    },
      {
      question: "Coach gives you tough feedback in front of the team. Best response?",
      options: [
        "Roll your eyes and take it later",
        "Defend yourself with explanations",
        "'Got it, coach' — apply it on the next rep",
        "Argue calmly until coach agrees",
      ],
      correctAnswer: 2,
      explanation: "Taking coaching well shows the team how to handle it. Big leadership signal.",
    },
      {
      question: "You're a sophomore. A senior teammate is loafing through warm-ups. Captain isn't on the field yet. What's the leadership move?",
      options: [
        "Tell the coach about the senior",
        "Wait for the captain to handle it",
        "Match the senior's energy — fit in",
        "Sprint and stay ready — your example pulls others",
      ],
      correctAnswer: 3,
      explanation: "Leadership doesn't wait for permission. Set the standard with your effort — others follow.",
      kind: "scenario",
      scenario: "Saturday warm-ups. Senior teammate is jogging at 50%. Captain is in the bathroom. Coach is at the other end of the field.",
    },
    ],
    keyTakeaways: [
      "You don't need a 'C' to lead. Leadership is action, not status.",
      "Show up early, stay late, pick up balls — set the standard with your behavior.",
      "Pick teammates up after mistakes. Be the first voice they hear.",
      "Take coaching well. Saying 'got it' and applying feedback fast is contagious.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
  },
  {
    id: "boys-middle-l7",
    lessonNumber: 7,
    title: "Finding Your Voice",
    topic: "Character",
    pillar: "leadership",
    description: `By middle school, lacrosse becomes a talking game. The teams that communicate win. The teams that stay silent lose. Finding your voice on the field is one of the most important things you can do at this age.\n\nWHAT TO SAY AND WHEN\n\nOn Defense:\n- "I got ball!" — You're guarding the ball carrier\n- "I'm hot!" or "I got two!" — You're the first slide\n- "I got three!" — You're the second slide\n- "Help left!" / "Help right!" — You're one pass away and ready to slide from that direction\n- "Fire! Fire!" — Slide NOW, the ball carrier is driving\n- "Check!" — The ball carrier is looking to pass, tighten up\n\nOn Offense:\n- "I'm open!" — You're free for a pass\n- "Switch!" — Trade assignments or positions\n- "Time!" — You have time, don't rush the play\n- "Shot!" — Telling everyone you're about to shoot so they can crash for the rebound\n\nIn Transition:\n- "Break!" — We have a numbers advantage, push it\n- "Slow it down!" — We don't have numbers, settle into offense\n- "Back!" — Get back on defense\n\nThe hardest part about finding your voice is that it feels awkward at first. You might feel weird yelling on the field if you've never done it. Here's the truth: nobody judges you for communicating. Your coaches WANT you to talk. Your teammates NEED you to talk.\n\nStart small. Pick one call per practice — just "Ball!" when you're sliding on defense. Once that feels natural, add another. Then another. Before long, you'll be one of the loudest players on the field.\n\nCOACHING POINTS\n- Talking when you're tired is the real test — if you can communicate tired, you can communicate any time\n- Verbal leadership is just as important as physical leadership\n- The best communicators make everyone around them better`,
    questions: [
      {
      question: "Good on-field communication sounds like:",
      options: [
        "Specific calls — 'I got ball', 'Slide', 'Cutter'",
        "Whispered to nearest teammate",
        "Random shouting",
        "Only after coach yells first",
      ],
      correctAnswer: 0,
      explanation: "Specific, timely info that helps teammates make decisions.",
    },
      {
      question: "On defense, what does 'I'm hot' mean?",
      options: [
        "I want a sub",
        "I'm the first slide",
        "I'm covering the ball",
        "I'm shooting next",
      ],
      correctAnswer: 1,
      explanation: "'I'm hot' or 'I got two' = I'm the first slide.",
    },
      {
      question: "When should an offensive player yell 'Shot!'",
      options: [
        "Whenever they touch the ball",
        "After the ball goes in",
        "Before the shot, so teammates crash for rebound",
        "Only on missed shots",
      ],
      correctAnswer: 2,
      explanation: "Calling shot lets teammates crash the crease for the backup.",
    },
      {
      question: "If communicating feels awkward at first, what's the move?",
      options: [
        "Only talk in games, not practice",
        "Wait for a captain to start",
        "Skip it — wait until you're older",
        "Pick one call and practice it until it's natural",
      ],
      correctAnswer: 3,
      explanation: "Start small. One call at a time builds the habit.",
    },
      {
      question: "Late in the game. You're on D. Your man cuts behind the goal. The defenseman next to you is now responsible — but he's looking the wrong way. What do you yell?",
      options: [
        "'Switch! Your man, behind!'",
        "'Coach! Sub!'",
        "Just stay quiet — let him figure it out",
        "'I got him' even though you don't",
      ],
      correctAnswer: 0,
      explanation: "Specific, urgent call. Teammate gets the info he needs RIGHT NOW. Silence = goal.",
      kind: "scenario",
      scenario: "Late 4th quarter. Your man cuts behind the goal — you can't follow because of the slide rules. The next defenseman is responsible but staring at the ball.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=XLpXy_AOCfg",
    keyTakeaways: [
      "Lacrosse is a talking game. Quiet teams lose.",
      "Defense calls: 'I got ball', 'I'm hot' (1st slide), 'I got two' (2nd slide), 'Fire!'",
      "Offense calls: 'I'm open', 'Switch', 'Time', 'Shot' (so teammates crash for rebound).",
      "Talking when tired is the real test. If you can talk tired, you can talk anytime.",
    ],
  },
  {
    id: "boys-middle-l8",
    lessonNumber: 8,
    title: "Owning Your Role",
    topic: "Character",
    pillar: "leadership",
    description: `Not every player on a team is the star scorer. Not every player starts. But every player has a role — and the teams that win are the ones where every kid OWNS their role completely.\n\nMaybe you're the defensive midfielder who disrupts the other team's transition. Maybe you're the short-stick defensive middie who takes the faceoffs. Maybe you're the second-line midfielder who brings energy off the bench every time you sub in. Whatever your role is, commit to it fully.\n\nOwning your role means two things. First, understand what your coaches need from you. If you're a defenseman, your job isn't to score — it's to shut down the other team's best attackman. If you're a backup goalie, your job in practice is to make the starters better by competing in every drill. Ask your coach: "What do you need from me?" That question alone shows maturity.\n\nSecond, maximize your role. Don't just accept it — dominate it. If you're a role player, be the BEST role player. If you only get 5 minutes of playing time, make those 5 minutes the hardest 5 minutes the other team sees. If you're on the sideline, be the loudest voice cheering your teammates on.\n\nHere's what coaches notice: the kid who does his job without complaining, without needing credit, without looking at the bench after every play. That kid earns more responsibility over time. The kid who complains about his role, refuses to do the little things, or sulks when he doesn't start? That kid stays where he is.\n\nGreat teams need every player to buy in. Not everyone can score 5 goals. But everyone can do their job at 100%.`,
    questions: [
      {
      question: "If you're not a starter, what's the right approach?",
      options: [
        "Ask to switch teams",
        "Own your role and maximize it",
        "Stop trying as hard",
        "Complain until you start",
      ],
      correctAnswer: 1,
      explanation: "Maximize what you're given. That's how you earn more.",
    },
      {
      question: "Best question to ask your coach?",
      options: [
        "'When can I leave practice?'",
        "'Can I play a different position?'",
        "'What do you need from me?'",
        "'Why am I not starting?'",
      ],
      correctAnswer: 2,
      explanation: "Asking what the team needs shows maturity and earns trust.",
    },
      {
      question: "What do coaches notice about role players?",
      options: [
        "Only the ones who score",
        "Only the tallest kids",
        "The ones who complain loudly",
        "The ones who do their job fully without needing credit",
      ],
      correctAnswer: 3,
      explanation: "Coaches reward players who commit to their role fully.",
    },
      {
      question: "What does a 'best role player' look like in practice?",
      options: [
        "Goes harder than starters, makes them better",
        "Same speed as starters in every drill",
        "Coasts because their reps don't matter",
        "Only competes when scouts are there",
      ],
      correctAnswer: 0,
      explanation: "Bench players who push starters in practice make the whole team better.",
    },
      {
      question: "You only play 5 minutes a game. Coach has rotations set. What's the move?",
      options: [
        "Sulk on the bench until your shift",
        "Make those 5 minutes the hardest 5 minutes the other team sees",
        "Stop trying as hard in practice",
        "Ask to play a different position",
      ],
      correctAnswer: 1,
      explanation: "5 minutes of full-throttle effort earns more minutes. Sulking earns less. Coaches see the difference.",
      kind: "scenario",
      scenario: "Mid-season. You've gotten 5-6 minutes a game while teammates start. The matchup tonight is winnable. Coach rotates you in.",
    },
    ],
    keyTakeaways: [
      "Every player has a role. Owning it fully is what coaches reward.",
      "Ask coach: 'What do you need from me?' — best question you can ask.",
      "Maximize your role. Best role player > complaining starter.",
      "Coaches notice the kid who does his job without complaining. That kid earns more over time.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
  },
  {
    id: "boys-middle-l9",
    lessonNumber: 9,
    title: "Trust on the Field",
    topic: "Mental Game",
    pillar: "team",
    description: `Trust is the foundation of every great team. When you trust your teammates, you play faster, harder, and smarter. When you don't trust them, you hesitate, try to do everything yourself, and the team falls apart.\n\nWhat does trust look like on a lacrosse field?\n\nOn offense, trust means making the extra pass. When you see a teammate cutting to the goal, you throw the ball because you trust them to catch it and finish. If you don't trust them, you hold the ball and try to score yourself. One way makes the team better. The other makes you a ball hog.\n\nOn defense, trust means sliding hard. When you slide to help a teammate who got beat, you're leaving your own man open. You do it because you trust the next defender to rotate and fill your spot. If everyone trusts the system, the slides work perfectly. If one person hesitates because they don't trust the rotation, the whole defense breaks.\n\nTrust is built in practice — not in games. Every rep where you make the right pass and your teammate catches it builds trust. Every rep where the slide comes on time builds trust. Every practice where everyone shows up on time, works hard, and does their job builds trust. Trust is just repetition plus reliability.\n\nThe opposite of trust is trying to do everything yourself. We've all seen the kid who dodges every time he gets the ball because he doesn't trust anyone else to score. That player might score a few goals, but his team will never be great. The best players make everyone around them better — and that starts with trusting your teammates.`,
    questions: [
      {
      question: "How is trust between teammates built?",
      options: [
        "Through the captain's leadership alone",
        "Through team meetings",
        "Through reps — reliable effort over time",
        "Through hanging out off the field",
      ],
      correctAnswer: 2,
      explanation: "Trust is the residue of repetition.",
    },
      {
      question: "Trust on offense looks like:",
      options: [
        "Dodging every time you touch the ball",
        "Holding the ball to control tempo",
        "Passing only to the best player",
        "Making the extra pass to the open man",
      ],
      correctAnswer: 3,
      explanation: "Trusting teammates means sharing the ball — even if you could shoot.",
    },
      {
      question: "What happens when a defense doesn't trust each other?",
      options: [
        "Players hesitate on slides, defense breaks",
        "It doesn't really affect performance",
        "They become more aggressive",
        "Goalie has to make more saves",
      ],
      correctAnswer: 0,
      explanation: "Hesitation on slides = open shots = goals against.",
    },
      {
      question: "Sign that a team has high trust?",
      options: [
        "Loud captain in every huddle",
        "Ball moves fast — extra passes for better shots",
        "Coach yells less in games",
        "Wearing matching cleats",
      ],
      correctAnswer: 1,
      explanation: "Quick ball movement = trust. Players believe the next guy will catch and shoot.",
    },
      {
      question: "You're 1 vs 1, top of the zone. You see your crease attackman wide open inside. You also have a tight shot at the cage from where you are. The trust move?",
      options: [
        "Take your shot — you have it",
        "Pass it back to the midfielder behind you",
        "Skip it inside to the wide-open crease attackman",
        "Hold the ball and wait for clarity",
      ],
      correctAnswer: 2,
      explanation: "Wide-open inside > tight outside shot every time. Make the trust pass — your team gets a layup.",
      kind: "scenario",
      scenario: "Top of the zone, 1v1. You're a decent shooter from there. But your crease attackman has slipped his man and is wide open.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=7uDxcG8BXZ8",
    keyTakeaways: [
      "Trust = playing fast and hard because you believe teammates will do their job.",
      "On offense: trust = making the extra pass. Without trust, players try to do it all alone.",
      "On defense: trust = sliding aggressively. Without trust, slides come late and break down.",
      "Trust is built in practice — every right pass, every on-time slide adds to the bank.",
    ],
  },
  {
    id: "boys-middle-l10",
    lessonNumber: 10,
    title: "Winning and Losing Together",
    topic: "Mental Game",
    pillar: "team",
    description: `Great teams handle wins and losses the same way — as a group. No one player wins a game, and no one player loses one. The sooner you understand this, the better teammate you'll be.\n\nWhen you win, celebrate together. Don't let one kid take all the credit. The goal scorer needed the assist. The assist needed the ground ball. The ground ball needed the ride. Every goal is the result of multiple players doing their jobs. Make sure everyone feels like they contributed — because they did.\n\nWhen you lose, own it together. This is harder. After a tough loss, it's tempting to say "if he didn't miss that shot" or "if the goalie saved that one." Stop. The game was decided by hundreds of plays, not just one. Your team lost together — maybe the defense got beat in transition, maybe the offense turned it over in the 3rd quarter, maybe the rides weren't aggressive enough. Everybody contributed to the loss, so everybody owns it.\n\nThe worst thing a team can do after a loss is blame one person. That destroys trust faster than anything. When one kid becomes the scapegoat, the whole team stops taking risks because nobody wants to be "that guy" next time. Fear of blame makes teams play tight and cautious — the opposite of what you want.\n\nThe best thing a team can do after a loss is be honest, stay positive, and work harder at the next practice. Say "we'll fix it" and then actually fix it. That's how good teams become great teams — they don't run from tough moments, they grow through them.`,
    questions: [
      {
      question: "After a tough loss, who should take the blame?",
      options: [
        "The kid who missed the last shot",
        "The coach for not adjusting",
        "The goalie if shots got in",
        "Nobody alone — the team owns it together",
      ],
      correctAnswer: 3,
      explanation: "Games are decided by hundreds of plays. Blaming one person destroys trust.",
    },
      {
      question: "Why is blaming one teammate after a loss so harmful?",
      options: [
        "It makes the team afraid to take risks",
        "Only matters if it happens repeatedly",
        "Coaches don't notice",
        "It's not really that bad",
      ],
      correctAnswer: 0,
      explanation: "Fear of being the scapegoat makes teams play tight and cautious.",
    },
      {
      question: "Best response to a tough loss?",
      options: [
        "Argue about which call cost the game",
        "Be honest, stay positive, work harder next practice",
        "Pretend it didn't happen",
        "Quit the team",
      ],
      correctAnswer: 1,
      explanation: "Own it, learn, fix it. That's how teams grow.",
    },
      {
      question: "After a big win, the ideal team response is:",
      options: [
        "Tell the losing team what they did wrong",
        "Post highlights immediately",
        "Spread credit — every goal needed an assist needed a GB",
        "The top scorer takes the credit",
      ],
      correctAnswer: 2,
      explanation: "Wins are collective. Make sure everyone feels they contributed — because they did.",
    },
      {
      question: "Right after a tough overtime loss, your starting goalie is in tears. Two teammates are blaming the defense out loud. What do you do?",
      options: [
        "Walk to the parking lot quickly",
        "Agree with the teammates blaming defense",
        "Yell at everyone to stop",
        "Go to the goalie — 'we win as a team, lose as a team'",
      ],
      correctAnswer: 3,
      explanation: "Pick up your goalie. Shut down the blame. The team's identity is set in moments like these.",
      kind: "scenario",
      scenario: "Overtime loss, 9-8. Your goalie is in tears — they think the last goal was their fault. Two teammates nearby are blaming the defense out loud.",
    },
    ],
    keyTakeaways: [
      "Wins and losses are team outcomes — no individual wins or loses one.",
      "After wins: spread credit. The shot needed the assist needed the ground ball.",
      "After losses: own it together. Don't blame one player — that destroys trust.",
      "Best response to a tough loss: 'we'll fix it' — and actually fix it next practice.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
]

const BOYS_HIGH_LESSONS: AcademyLesson[] = [
  {
    id: "boys-high-l1",
    videoUrl: "https://www.youtube.com/watch?v=GCceU3eGBrc",
    lessonNumber: 1,
    title: "Advanced Offensive Sets",
    topic: "Lacrosse IQ",
    pillar: "game",
      position: "attack",
    description: `By high school, you need to understand offensive systems — not just how to score on your own, but how your team creates scoring chances together through sets, motion, and ball reversal.\n\nOFFENSIVE SETS\n\n1. 2-2-2 Formation\nTwo attackmen up top, two midfielders on the wings, two attackmen low (one at each side of the crease/GLE). This is a balanced formation that gives you scoring threats from every angle.\n\n2. 1-4-1 Formation\nOne player at the top (called "the point"), four spread across the middle, one behind the goal at X. This set stretches the defense horizontally and creates isolation dodge opportunities.\n\n3. 3-3 Formation\nThree attackmen across the top, three forming the bottom arc. This is the classic look — good for ball movement and off-ball picks.\n\nKEY CONCEPTS\n\nMotion: Off-ball players are constantly moving — cutting, screening, repositioning. Good motion is hard to defend because the defense can never settle. The keys are timing and spacing (5+ yards apart so defenses can't double-team).\n\nBall Reversal: Moving the ball from one side of the field to the other. Defenses are designed to slide toward the ball. When you reverse quickly (topside to X, X to the other wing), the defense has to scramble — that's when openings appear.\n\nPick the Picker: A concept where the player who just set a pick immediately gets a pick set for them. The defense is still recovering from the first action when the second one hits. This is a staple of elite offenses.\n\nReading Slides: Don't dodge into help. Before you commit to a dodge, look for the slide. If you see it coming early, pass to the player the slider left. If you don't see help, dodge hard and finish. Patience creates better shots than forced 1v1 dodges.\n\nCOACHING POINTS\n- Watch film of college offenses running 2-2-2 and 1-4-1 — pause and study the off-ball movement\n- The best offenses don't need highlight-reel dodges — they move the ball and find the open man\n- "Throw it forward, look inside" — move the ball up the field, then find the player cutting to the crease`,
    questions: [
      {
      question: "What's the strength of a 1-4-1 set?",
      options: [
        "Stretches the defense horizontally for isolation dodges",
        "Heavy crease pressure",
        "Best for ride formations",
        "Allows three dodgers at once",
      ],
      correctAnswer: 0,
      explanation: "1-4-1 spreads the D side-to-side, opening lanes for the point or X attackman.",
    },
      {
      question: "What is 'ball reversal' and why does it work?",
      options: [
        "Re-dodging same matchup — wears down D",
        "Moving ball side-to-side fast — defense scrambles",
        "Throwing back to the goalie to reset",
        "Carrying ball back to your own goal — kills clock",
      ],
      correctAnswer: 1,
      explanation: "Defenses slide toward the ball. Reverse fast and they're scrambling — that's when openings appear.",
    },
      {
      question: "What is 'pick-the-picker'?",
      options: [
        "A faceoff move",
        "Picking the best player on offense",
        "After setting a pick, immediately get a pick set for you",
        "Picking the ball carrier first",
      ],
      correctAnswer: 2,
      explanation: "Defense recovers from action 1 just as action 2 hits. Staple of elite offenses.",
    },
      {
      question: "Patient dodging means...",
      options: [
        "Letting your defender catch up",
        "Dodging slowly",
        "Waiting for the crease to clear",
        "Reading slide first, attacking second",
      ],
      correctAnswer: 3,
      explanation: "If you see the slide early, pass to the open man. If no slide, finish.",
    },
      {
      question: "You're at the point in a 1-4-1. Coach calls for a 2-man game with the right wing. The defense is playing aggressive — slides come from the crease. What do you do?",
      options: [
        "Use the pick, look for the slide, hit the crease attackman the slider left",
        "Reset and call a different play",
        "Skip the pick, shoot from up top",
        "Force the dodge — beat your D 1v1",
      ],
      correctAnswer: 0,
      explanation: "If the crease defender slides, the crease attackman is open. The 2-man game's whole purpose is to force that decision.",
      kind: "scenario",
      scenario: "1-4-1 set. You're at the point. Right wing comes up to set you a pick. Their crease defender has been the slide all game.",
    },
    ],
    keyTakeaways: [
      "2-2-2: balanced — every spot is a scoring threat. Best for ball reversal + pick-the-picker.",
      "1-4-1: stretches D horizontally. Point and X dodgers get isolation lanes.",
      "3-3: classic — heavy on motion and off-ball picks.",
      "Read the slide BEFORE you commit. Patient dodge > forced dodge into help.",
    ],
    diagrams: [
      {
        title: "1-4-1 Offensive Set",
        view: "men-half-offensive",
        caption: "One up top (point), four spread across the middle, one at X. Stretches the defense horizontally. The point dodge or X dodge creates isolation looks.",
        players: [
          {
            x: 50,
            y: 25,
            role: "offense",
            label: "P"
          },
          {
            x: 18,
            y: 55,
            role: "offense",
            label: "W"
          },
          {
            x: 38,
            y: 55,
            role: "offense",
            label: "C"
          },
          {
            x: 62,
            y: 55,
            role: "offense",
            label: "C"
          },
          {
            x: 82,
            y: 55,
            role: "offense",
            label: "W"
          },
          {
            x: 50,
            y: 92,
            role: "offense",
            label: "X",
            ball: true,
            highlight: true
          },
        ],
        arrows: [
          {
            from: {
              x: 50,
              y: 92
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "run",
            label: "X dodges"
          },
          {
            from: {
              x: 38,
              y: 55
            },
            to: {
              x: 48,
              y: 70
            },
            kind: "run",
            curve: -4,
            label: "Crease cut"
          },
        ],
        legend: [
          {
            label: "Point / Wing / Crease / X",
            color: "#D22630",
            shape: "circle"
          },
        ]
      },
    ],
  },
  {
    id: "boys-high-l2",
    videoUrl: "https://www.youtube.com/watch?v=rbL9yXyCXtQ",
    lessonNumber: 2,
    title: "Slide Packages and Team Defense",
    topic: "Lacrosse IQ",
    pillar: "game",
      position: "defense",
    description: `Team defense at the high school level requires every player to understand the slide package — the system your team uses to help each other when an offensive player beats his man. If you don't know the slide package, you're a liability.\n\nSLIDE SYSTEMS\n\n1. Adjacent Slide\nWhen the on-ball defender gets beat, the player adjacent (next to him) slides to stop the dodger. The next defender "fills" — rotating to cover the player the slider left. Everyone moves together like a chain reaction. This is the most common system.\n\n2. Crease Slide\nThe slide comes from a defender near the crease — whoever is guarding the offensive player closest to the goal. This slide arrives earlier (the crease defender is closest to the dodger) but leaves the most dangerous area open, requiring perfect rotations.\n\n3. Recovery\nAfter the slide stops the ball, everyone has to recover. The slider gets back to his man, the fill gets back to his man, and the defense resets. The whole sequence — slide, stop, fill, recover — should take 2-3 seconds.\n\nCOMMUNICATION\nSlides don't work without talking. Your goalie is the quarterback:\n- "Fire!" — Slide NOW\n- "Hold!" — Stay on your man, don't slide yet\n- "Two!" — I'm the second slide if we need it\n- "Crank!" — Check sticks, the ball carrier is winding up to shoot\n- "Clear!" — We have the ball, push it out\n\nThe biggest mistake: hesitating. If you're the slider, GO. Don't wait to see if the on-ball defender recovers. Late slides are worse than no slides — the defense is out of position AND the ball carrier has a head of steam.\n\nSSDM DEFENSE\nShort-Stick Defensive Middie — the midfielder who plays lockdown defense on the other team's best offensive middie. This player has to be able to guard in space, communicate slides, and play team defense at an elite level. Some of the best SSDM defenders in college are the smartest players on the field, not the biggest.\n\nCOACHING POINTS\n- Practice slides in 3v2, 4v3, and 5v4 situations\n- Every player — including attackmen — should know the slide package for rides and transition\n- Film study: watch how the defense rotates after the initial slide. That recovery is where most breakdowns happen`,
    questions: [
      {
      question: "Adjacent slide comes from:",
      options: [
        "The two-pass-away defender",
        "The defender on the player next to the dodger",
        "The crease defender",
        "The goalie stepping out",
      ],
      correctAnswer: 1,
      explanation: "Adjacent = next to. The defender adjacent to the dodger slides first.",
    },
      {
      question: "When is a crease slide ('sandwich') used?",
      options: [
        "When EMO is in effect",
        "When dodge comes from X behind",
        "When dodge comes from up top",
        "When the crease is empty",
      ],
      correctAnswer: 2,
      explanation: "Up-top dodge → crease defender slides first because he has the shortest path.",
    },
      {
      question: "What's the most important defensive call?",
      options: [
        "'Sub'",
        "'Ball'",
        "'Check'",
        "'I'm hot' — I'm the slide",
      ],
      correctAnswer: 3,
      explanation: "Without 'I'm hot', the slide is unclear — that's a goal.",
    },
      {
      question: "After a slide, what does the slider do?",
      options: [
        "Rotate to the player who just got left open",
        "Stay on the ball-carrier",
        "Drop into the crease",
        "Run back to original position",
      ],
      correctAnswer: 0,
      explanation: "Slider's old man is covered by rotation. Slider helps the next threat.",
    },
      {
      question: "Your team runs adjacent slides. Their offense calls a play that has the X attackman dodging hard up the middle. The crease attackman pops to the wing. Who slides?",
      options: [
        "Adjacent defender slides — crease stays home",
        "Crease defender slides — adjacent fills",
        "Goalie steps out",
        "Top defender drops",
      ],
      correctAnswer: 1,
      explanation: "X dodge through the middle = crease slide. The X dodger gets to the crease before adjacents can rotate.",
      kind: "scenario",
      scenario: "X attackman is dodging hard, splitting two defenders, headed for the middle of the field. The crease attackman pops out to a wing.",
    },
    ],
    keyTakeaways: [
      "Adjacent slide: from the player next to the dodger. Crease defender stays home.",
      "Crease slide (sandwich): crease defender is first slide; adjacent rotates to fill crease.",
      "Slides MUST be communicated. 'I'm hot' (1st), 'I'm two' (2nd) — always.",
      "After a slide, recover and rotate. Standing still = open shot.",
    ],
    diagrams: [
      {
        title: "Adjacent Slide Package",
        view: "men-half-defensive",
        caption: "Slide from the defender next to the dodger. Two-pass-away defender rotates to fill. The crease defender stays home — keeps the inside covered.",
        players: [
          {
            x: 25,
            y: 55,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 70,
            y: 55,
            role: "offense",
            label: "2"
          },
          {
            x: 50,
            y: 70,
            role: "offense",
            label: "3"
          },
          {
            x: 30,
            y: 75,
            role: "offense",
            label: "4"
          },
          {
            x: 28,
            y: 60,
            role: "defender",
            label: "Da"
          },
          {
            x: 67,
            y: 60,
            role: "defender",
            label: "Db"
          },
          {
            x: 50,
            y: 75,
            role: "defender",
            label: "Dc"
          },
          {
            x: 35,
            y: 78,
            role: "defender",
            label: "Dd"
          },
        ],
        arrows: [
          {
            from: {
              x: 25,
              y: 55
            },
            to: {
              x: 50,
              y: 78
            },
            kind: "run",
            curve: -10,
            label: "Dodge"
          },
          {
            from: {
              x: 50,
              y: 75
            },
            to: {
              x: 38,
              y: 70
            },
            kind: "run",
            label: "Slide (Dc)"
          },
          {
            from: {
              x: 35,
              y: 78
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "run",
            curve: 5,
            label: "Fill (Dd)"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "boys-high-l3",
    lessonNumber: 3,
    title: "How to Watch Film",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Film study is the biggest separator at the high school level. The players who watch film correctly improve dramatically faster than those who don't. But most players don't know HOW to watch film — they just stare at it.\n\nHere's how to watch film with purpose:\n\nFirst, watch with a question in mind. Don't just watch — watch FOR something. Examples: "How does my defender position himself when I dodge?" "Where are the slides coming from?" "What does my team do well in transition?" Having a question keeps you focused.\n\nSecond, watch off-ball. Most players watch the ball. The ball doesn't teach you anything — you already know what happens with the ball. What teaches you is what happens AWAY from the ball. Watch the slides developing. Watch the cuts. Watch how good players move when they don't have it.\n\nThird, pause and rewind. Don't watch film in real time only. When something happens, pause it. Look at every player on the field. Where was the open space? Why did the defender go where he did? What would you have done differently? Rewind and watch again.\n\nFourth, watch yourself critically. When you're watching your own film, don't look for highlights. Look for mistakes. Where did you turn the ball over? What did you miss? Where could you have cut better? Brutal self-honesty is how you fix problems.\n\nFifth, take notes. Write down 3 things you noticed and 3 things you want to work on. Bring those notes to the next practice. Film study without action is just watching TV.\n\nThe best players in college and the pros watch film daily. If you start now, by the time you're a senior, you'll be miles ahead of every player who relies only on practice.`,
    questions: [
      {
      question: "Best way to learn from film:",
      options: [
        "Watch with the sound up loud",
        "Watch all the action at full speed",
        "Pick one focus per viewing (slides, cuts, etc.)",
        "Only watch the highlight goals",
      ],
      correctAnswer: 2,
      explanation: "Multi-tasking diffuses learning. One focus = real lessons.",
    },
      {
      question: "What does 'pause and predict' mean?",
      options: [
        "Stop and start randomly",
        "Stop watching when bored",
        "Pause to text friends about the play",
        "Pause clip, guess next move, then check",
      ],
      correctAnswer: 3,
      explanation: "Active prediction trains anticipation — the IQ skill that matters most.",
    },
      {
      question: "Watching your own film, what's the value?",
      options: [
        "See what you actually look like vs. what it felt like",
        "Just to enjoy the experience",
        "Compare to pro highlight reels",
        "See the goals you scored",
      ],
      correctAnswer: 0,
      explanation: "You always feel different than you look. Tape doesn't lie — that's the value.",
    },
      {
      question: "How often should you watch your own game film?",
      options: [
        "Once a season",
        "Weekly during the season",
        "After playoffs only",
        "Only when coach forces it",
      ],
      correctAnswer: 1,
      explanation: "Weekly review = weekly improvement. The kids who do this pull away.",
    },
      {
      question: "You watch your last game and notice you drift right after a turnover — every time. You then watch this happen 6 times across 4 games. What do you do at the next practice?",
      options: [
        "Mention it to coach so he knows",
        "Watch more film instead of practicing",
        "Drill the recovery — practice tracking back left after turnovers",
        "Forget it — bad habits will fix themselves",
      ],
      correctAnswer: 2,
      explanation: "Film identifies the pattern. Practice fixes it. Without targeted reps, the habit stays.",
      kind: "scenario",
      scenario: "You watched film of your last 4 games. After every turnover, you drift to the right side of the field — leaving your defensive responsibility uncovered.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=4LHsrseSKak",
    keyTakeaways: [
      "Watch ONE thing per viewing: defensive slides, off-ball cuts, faceoff hand fights — pick.",
      "Pause and predict: stop the clip, guess the next move, then watch and check.",
      "Watch your OWN film weekly. See what you actually look like, not what it felt like.",
      "Take notes. 'I drift left after losing my matchup' is a real coaching note you give yourself.",
    ],
  },
  {
    id: "boys-high-l4",
    lessonNumber: 4,
    title: "The College Recruiting Process",
    topic: "Mental Game",
    pillar: "game",
    description: `If you want to play college lacrosse, you need to understand the recruiting process. Many players miss out not because they aren't talented — but because they didn't know how the process works. Here's what you need to know.\n\nRecruiting starts EARLY now. Coaches identify prospects in 8th and 9th grade. By 10th grade, top prospects are getting verbal offers. By 11th grade, most Division I rosters are largely set. This means you need to be on coaches' radar by your sophomore year if you're aiming for D1.\n\nGrades matter — A LOT. Most colleges won't even consider a player who can't get in academically. Your GPA and test scores open doors that lacrosse alone can't. Aim for the highest grades you can. The better your grades, the more options you have.\n\nYou have to do your own outreach. Don't wait for coaches to find you. Email college coaches starting freshman year — introduce yourself, share your highlight tape, list your tournaments. Be professional, polite, and brief. Most coaches won't reply but they ARE reading.\n\nGet to college camps and showcase tournaments. This is where coaches actually see you play. Pick events where the schools you want to attend will be coaching or scouting. Camps at colleges are especially valuable because the coach gets to see you up close.\n\nUse a recruiting profile (Sportsforce, NCSA, or BTB's own profile) so coaches can find your stats, video, grades, and contact info in one place.\n\nMost importantly: don't fixate on D1. There are 200+ great college lacrosse programs across D1, D2, D3, and NAIA. Many D3 programs have better player development, smaller class sizes, and just as competitive lacrosse. Find the right FIT, not just the highest division.`,
    questions: [
      {
      question: "What's the #1 piece of recruiting communication coaches want?",
      options: [
        "A long letter about your background",
        "A phone call from a parent",
        "Social media DMs",
        "A short email with a film link, GPA, contact info",
      ],
      correctAnswer: 3,
      explanation: "Coaches scan emails fast. Short + film + grades + phone.",
    },
      {
      question: "What matters more for most college rosters?",
      options: [
        "A strong, recent highlight film",
        "Number of camps attended",
        "Most tournament games played",
        "Brand of stick used",
      ],
      correctAnswer: 0,
      explanation: "Coaches don't see every tournament. They see your film. Make it strong.",
    },
      {
      question: "When should serious recruiting outreach start?",
      options: [
        "After verbal commits dry up",
        "Sophomore year, ramp through junior",
        "Senior year",
        "Eighth grade",
      ],
      correctAnswer: 1,
      explanation: "Sophomore = build film + reach out. Junior = visits + decisions.",
    },
      {
      question: "Why do grades matter for athletic recruiting?",
      options: [
        "Only Ivy League cares about grades",
        "Grades are tiebreakers only",
        "Coaches need your GPA to even make an offer (admissions matter)",
        "They don't — only film matters",
      ],
      correctAnswer: 2,
      explanation: "If admissions won't accept you, the coach can't offer. Grades open doors.",
    },
      {
      question: "It's October of sophomore year. You have a decent film from summer. Coach at a target program emails back: 'thanks, keep us posted.' What's your move?",
      options: [
        "Call the coach every week to push",
        "Wait — they'll reach out when ready",
        "Email them daily until they commit",
        "Send them a new clip every 4-6 weeks with one new skill or game",
      ],
      correctAnswer: 3,
      explanation: "'Keep us posted' = they want updates. Periodic, specific, additive — not spam, not silence.",
      kind: "scenario",
      scenario: "October, sophomore year. You emailed your top program with a film link. Coach replied: 'thanks for sending — keep us posted on your progress.'",
    },
    ],
    keyTakeaways: [
      "Film highlights matter more than tournament 'exposure'. Make a strong reel by sophomore year.",
      "Email coaches directly — short, specific, with a 2-3 minute reel link, GPA, and contact.",
      "Show interest BEFORE coaches show interest in you. They have hundreds of options.",
      "Grades open and close more doors than you think — academic fit > athletic fit at most levels.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dvSS1qWmD1s",
  },
  {
    id: "boys-high-l5",
    lessonNumber: 5,
    title: "Elite Mental Game",
    topic: "Mental Game",
    pillar: "leadership",
    description: `By high school, mental game becomes one of the biggest differences between good and great players. Physical talent gets you to the team. Mental game determines how far you go.\n\nHere are the mental skills the best high school players develop:\n\nVisualization. Before games, the best players visualize themselves succeeding. They picture making the dodge, hitting the shot, making the play. This isn't woo-woo nonsense — it's a science. Visualization actually programs your nervous system to execute when the moment comes. Spend 5 minutes the night before a game visualizing yourself playing your best.\n\nThe 5-second reset. When something bad happens — a turnover, a missed shot, a bad call — give yourself 5 seconds to feel the frustration. Then physically reset (breath, touch your stick, refocus your eyes) and go play the next play. The 5-second rule works because emotions only last seconds if you don't feed them. Players who hold onto frustration for whole quarters destroy their own performance.\n\nProcess over outcome. Outcome thinking ("I have to score") creates pressure. Process thinking ("I'm going to attack hard and trust my training") creates flow. Focus on what you can control — your effort, your reads, your execution. The score takes care of itself.\n\nGratitude for the opportunity. Sounds soft, but it works. The best players remember that getting to play this game is a privilege. When you appreciate the chance to compete, the pressure goes down and the joy goes up. Tense players play tight. Loose players play free. Gratitude keeps you loose.\n\nMental skills are like physical skills — they have to be practiced. Most players never train them. The ones who do separate themselves quickly.`,
    questions: [
      {
      question: "Pre-game routine should be:",
      options: [
        "Repeatable — same cues that bring you to game state",
        "Whatever the team captain does",
        "Skipped — saves energy",
        "Different every game for variety",
      ],
      correctAnswer: 0,
      explanation: "Repeatable routines = consistent mental state. Pros all have one.",
    },
      {
      question: "Best in-game self-talk after a mistake?",
      options: [
        "'Why did I do that?'",
        "'Next play — I got the next one'",
        "'My team is going to be mad'",
        "'I'm not playing well today'",
      ],
      correctAnswer: 1,
      explanation: "Forward-looking self-talk resets focus. Backward-looking traps you.",
    },
      {
      question: "What does sport-psych research say about visualization?",
      options: [
        "It only works in the off-season",
        "It's superstition with no real effect",
        "It measurably improves execution under pressure",
        "It only works for goalies",
      ],
      correctAnswer: 2,
      explanation: "Visualization rehearses the neural pattern. Execution improves measurably.",
    },
      {
      question: "Composure is best understood as:",
      options: [
        "Something only veterans have",
        "Luck",
        "A personality trait you're born with",
        "A trainable skill — built through practice",
      ],
      correctAnswer: 3,
      explanation: "Composure is a habit. Train it deliberately, like stick skills.",
    },
      {
      question: "State final, 4th quarter, tied. You miss two shots in a row. You're getting tight. What's the single best thing to do RIGHT NOW?",
      options: [
        "Reset routine: deep breath, cue word ('next'), commit to the next play",
        "Get angry to fire yourself up",
        "Pass off scoring duty completely",
        "Try to score even harder",
      ],
      correctAnswer: 0,
      explanation: "Pre-built reset routine kicks in under pressure. That's what training is for. Anger and overthinking both narrow performance.",
      kind: "scenario",
      scenario: "State final. 4th quarter. Tied. You missed two shots in a row — both shots you usually make. You feel yourself tightening up.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    keyTakeaways: [
      "Pre-game routine = repeatable cues that bring you to the right state. Find yours.",
      "Self-talk: 'next play' beats 'why did I do that' every time.",
      "Visualization works — 5 minutes pre-game seeing yourself execute.",
      "Composure is a skill, not a personality trait. It's trainable.",
    ],
  },
  {
    id: "boys-high-l6",
    lessonNumber: 6,
    title: "Captaincy and Senior Leadership",
    topic: "Character",
    pillar: "leadership",
    description: `Senior leadership is the most important thing on any high school team. The best teams aren't always the most talented — they're the ones with seniors who set the standard for everyone else. If you want to be a captain, here's what real captaincy looks like.\n\nA captain is the bridge between coaches and players. When the coach has a message, the captain reinforces it in the locker room. When players have concerns, the captain brings them to the coach respectfully. You speak both languages.\n\nA captain holds people accountable — even friends. This is the hardest part. When your best friend is going half-speed in practice, you have to say something. Not in a mean way. Not by yelling. But honestly: "Hey, I need you locked in. We need you." Real captains care more about the team than about being liked.\n\nA captain runs the locker room. The energy in your locker room is your responsibility. If players are quiet and tight before games, you change that. If players are too loose and unfocused, you change that too. The captain sets the temperature.\n\nA captain takes losses harder than wins. After a loss, captains don't blame coaches, refs, or teammates. They take responsibility, talk about what went wrong, and lead the response in the next practice. Wins are easy. Losses are when leadership shows.\n\nA captain develops younger players. Every team has freshmen and sophomores looking up to the seniors. Spend time with them. Teach them. Encourage them. Make them feel like they belong. The captains who do this leave the program better than they found it — and that's the highest form of leadership.\n\nNot every senior will be a captain. But every senior should lead. The senior class sets the culture for the whole program. Take that responsibility seriously, and your team will be one nobody forgets.`,
    questions: [
      {
      question: "What's a captain's primary job?",
      options: [
        "Score the most points",
        "Serve the team — be the bridge to coach",
        "Run team meetings unilaterally",
        "Make game-time strategic calls",
      ],
      correctAnswer: 1,
      explanation: "Captaincy = service. Bridge between coach and players, not boss.",
    },
      {
      question: "How does a real captain handle a slacking friend?",
      options: [
        "Call them out publicly to embarrass them",
        "Ignore it — friendship comes first",
        "Talk to them honestly, in private — care more about team than being liked",
        "Tell on them to coach",
      ],
      correctAnswer: 2,
      explanation: "Honest, private, direct. Caring more about team than popularity is the captain test.",
    },
      {
      question: "Senior leadership in tough moments looks like:",
      options: [
        "Making big speeches",
        "Loudest voice in the huddle",
        "Yelling to motivate",
        "Steady — calm when teammates are emotional",
      ],
      correctAnswer: 3,
      explanation: "When emotions rise, a captain's job is to lower them. Steadiness wins.",
    },
      {
      question: "First job for a new captain?",
      options: [
        "Set the standard with your own behavior — example before voice",
        "Plan team-building events",
        "Speak in every huddle",
        "Pick the team's pre-game music",
      ],
      correctAnswer: 0,
      explanation: "Lead by example before voice. Words without action don't carry.",
    },
      {
      question: "You're the captain. A senior teammate disagrees publicly with the coach during a film session. The room goes quiet. What do you do?",
      options: [
        "Side with the senior — solidarity",
        "Pull the senior aside privately later: 'I hear you. Not the place. Let me talk to coach.'",
        "Stay silent — let the coach handle it",
        "Defend the coach loudly in the room",
      ],
      correctAnswer: 1,
      explanation: "Captains de-escalate publicly, advocate privately. Public confrontation makes both sides dig in.",
      kind: "scenario",
      scenario: "Film session. A senior teammate publicly pushes back on coach's strategy in front of the team. Room gets quiet. You're the captain.",
    },
    ],
    keyTakeaways: [
      "Captaincy = serving the team, not running it. Captains speak with the coach FOR teammates, not against them.",
      "Hard conversations with friends: 'I love you, AND your effort is hurting us.' Both true.",
      "A captain's first job is the standard. Lead by example before you lead by voice.",
      "Captains stay calm when teammates are emotional. Steady > loud.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
  },
  {
    id: "boys-high-l7",
    lessonNumber: 7,
    title: "Leading Without a Title",
    topic: "Character",
    pillar: "leadership",
    description: `Most teams have 2-3 captains. But the best teams have leadership throughout the entire roster. You don't need a "C" on your jersey to lead. In fact, some of the most impactful leaders on championship teams were never named captain.\n\nLeading without a title means setting the standard every day — at practice, in the weight room, in the film room. You're the junior who's first to every drill. You're the sophomore who stays after to work on his off-hand. You're the underclassman who knows the plays cold because you studied them on your own.\n\nIt also means holding people accountable when it's uncomfortable. When your friend is going 70% in a drill, leading without a title means pulling him aside and saying "I need more from you." Not loudly. Not in front of everyone. Just directly and honestly. Most people avoid these conversations. Leaders have them.\n\nLeading without a title means doing the unglamorous work. Picking up cones. Setting up the field. Carrying the ball bag. Making sure freshmen feel welcome. These small acts build culture more than any speech. The seniors and captains notice — and they trust you more because of it.\n\nHere's the reality: coaches don't name captains based on one moment. They watch all season. They notice who leads in October, not just in May. If you want to be a captain someday, start leading right now — title or not. By the time the vote happens, everyone will already know you're a leader.`,
    questions: [
      {
      question: "Leadership without a title comes from:",
      options: [
        "Being friends with the captain",
        "Demanding respect from teammates",
        "A standard others want to match",
        "Going to the coach about issues",
      ],
      correctAnswer: 2,
      explanation: "Leadership is gravitational. Your standard pulls others up.",
    },
      {
      question: "How do you influence older teammates without authority?",
      options: [
        "Tell them what to do",
        "Complain to coach about them",
        "Wait until you're a captain",
        "Hold yourself to a higher standard than them",
      ],
      correctAnswer: 3,
      explanation: "Older teammates respond to action, not lecture. Be the bar.",
    },
      {
      question: "Visible leadership behavior?",
      options: [
        "First on the field, last to leave — every day",
        "Speaking up in every team meeting",
        "Posting team content on social",
        "Wearing the team's gear off the field",
      ],
      correctAnswer: 0,
      explanation: "Show up first, leave last. Visible. Compounds.",
    },
      {
      question: "Influence vs. title — which matters more?",
      options: [
        "Title for games, influence for practice",
        "Influence — built through reps and reliability",
        "Title — captains get the final word",
        "Both equal",
      ],
      correctAnswer: 1,
      explanation: "Titles are temporary. Influence built through trust is real authority.",
    },
      {
      question: "You're a junior. The team is captained by two seniors who don't push the standard hard. Practice intensity has dropped. What's your move?",
      options: [
        "Tell the coach about the captains",
        "Match the captains' pace — don't disrupt",
        "Set the standard yourself — sprint, push, compete every drill",
        "Wait until you're a captain next year",
      ],
      correctAnswer: 2,
      explanation: "Don't wait for permission to lead. Set the bar. Others rise — including the captains, who often need the example.",
      kind: "scenario",
      scenario: "You're a junior. Two senior captains have set a casual practice tone. Intensity is dropping. Coach hasn't said anything yet.",
    },
    ],
    keyTakeaways: [
      "You don't need a 'C' to lead — you need a standard others want to match.",
      "Pull older teammates up by holding YOURSELF to the higher standard, not by lecturing.",
      "Show up first, leave last. Visible commitment compounds.",
      "Your influence > your title. Build it through reps, not announcements.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
  },
  {
    id: "boys-high-l8",
    lessonNumber: 8,
    title: "Team Chemistry",
    topic: "Mental Game",
    pillar: "team",
    description: `Team chemistry is the difference between a group of talented individuals and a championship team. It's the invisible force that makes teammates play harder for each other, communicate without thinking, and refuse to let each other down.\n\nChemistry doesn't happen by accident. It's built intentionally through shared experiences — hard practices where everyone pushes through together, team dinners where guys get to know each other off the field, bus rides to tournaments where inside jokes start, and tough losses where nobody points fingers.\n\nThe best teams have a simple trait: they genuinely like each other. Not just tolerate — actually enjoy being around each other. That doesn't mean everyone is best friends. It means everyone respects each other and wants to compete for each other. When you like your teammates, you sprint harder on defense because you don't want to let them down. You make the extra effort on a ride because you know they'd do the same for you.\n\nBuilding chemistry takes vulnerability. You have to be willing to be honest in the film room. You have to admit when you messed up. You have to accept coaching from a teammate without getting defensive. Teams where everyone protects their ego never develop real chemistry.\n\nAs an upperclassman, you can build chemistry by including everyone. The freshmen sitting alone at lunch? Invite them over. The quiet kid who doesn't say much? Find out what he's about. The more connected your team is as people, the more connected you'll be on the field. Chemistry can't be coached — but it can be cultivated.`,
    questions: [
      {
      question: "Chemistry is best defined as:",
      options: [
        "Posting together on social media",
        "Spending time together off the field",
        "Liking your teammates personally",
        "Predictable trust under pressure",
      ],
      correctAnswer: 3,
      explanation: "Chemistry shows up in tight games — does the team trust each other? That's the test.",
    },
      {
      question: "How does chemistry actually get built?",
      options: [
        "Shared hard work — conditioning, drills, film",
        "Winning a few games together",
        "Captain leadership alone",
        "Pizza parties and team dinners",
      ],
      correctAnswer: 0,
      explanation: "Bonds forge under shared difficulty, not shared comfort.",
    },
      {
      question: "First red flag of bad team chemistry?",
      options: [
        "Coaches yell more than usual",
        "Side conversations and cliques during team time",
        "The team isn't winning",
        "Players make jokes during huddles",
      ],
      correctAnswer: 1,
      explanation: "Cliques and side conversations show the team isn't really together. Coaches catch it fast.",
    },
      {
      question: "How can a regular player help chemistry without being captain?",
      options: [
        "Organize bigger off-field events",
        "Post team unity content online",
        "Invite, include, share — be the connector for new or quieter teammates",
        "Stay in your lane — let captains handle it",
      ],
      correctAnswer: 2,
      explanation: "Connectors build chemistry. Make sure no teammate feels invisible.",
    },
      {
      question: "A new transfer joins the team mid-season. He's quiet at lunch, sits alone in the locker room. The team has tight cliques. What do you do?",
      options: [
        "Invite him only if the captains say to",
        "Let him find his way — that's how teams work",
        "Let coaches handle integration",
        "Sit with him, introduce him, include him in the warm-up group",
      ],
      correctAnswer: 3,
      explanation: "One person can flip a transfer's experience. That's chemistry built — and you remembering it later, when the team needs it.",
      kind: "scenario",
      scenario: "Mid-season transfer. He's a strong player but quiet. Eats lunch alone. Sits separate in the locker room. Cliques are tight.",
    },
    ],
    keyTakeaways: [
      "Chemistry isn't friendship. It's predictable trust under pressure.",
      "Built in shared hard work — preseason conditioning, tough drills, film together.",
      "The first sign of bad chemistry: side conversations and cliques during team time.",
      "Coaches build chemistry intentionally. Players can build it too — invite, include, share.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=UI-ZteQ8JGU",
  },
  {
    id: "boys-high-l9",
    lessonNumber: 9,
    title: "Sacrifice for the Team",
    topic: "Mental Game",
    pillar: "team",
    description: `At the high school level, the best teams are built on sacrifice. Sacrifice means putting what the team needs ahead of what you want — and doing it without complaining.\n\nSacrifice shows up in real moments:\n\nYou're an attackman who averages 3 goals a game. The coach asks you to play midfield because the team needs your athleticism in transition. You don't argue. You learn the position and give it everything because the team needs you there.\n\nYou're a senior who's earned the starting spot at close defense. The coach wants to rotate a sophomore in during the second half to develop him. You mentor the kid, teach him the slide package, and cheer him on — even though it costs you minutes.\n\nYour legs are dead in the fourth quarter of a playoff game. Your body wants to jog. But the team needs one more stop, one more clear, one more sprint in transition. You push through the pain because your teammates are counting on you.\n\nSacrifice isn't dramatic. It's not a speech. It's the daily choice to put the team above yourself. It's riding the bus to an away game you know you won't play much in, but bringing energy from the sideline. It's doing the extra conditioning rep because the coach said "team" reps, and you won't let your teammates down.\n\nThe greatest players in any sport — the ones people remember — aren't remembered for stats. They're remembered for what they gave up for the team. And the funny thing is: the players who sacrifice the most often end up getting more back. Coaches trust them. Teammates love them. And they win.`,
    questions: [
      {
      question: "What does sacrifice mean for a team?",
      options: [
        "Giving up something you want for what the team needs",
        "Giving up the season for school",
        "Letting one player carry the team",
        "Skipping practice when tired",
      ],
      correctAnswer: 0,
      explanation: "Sacrifice is putting team need above personal want.",
    },
      {
      question: "Common in-game sacrifices?",
      options: [
        "Asking for more rest",
        "Skipping the contested shot to make the better pass",
        "Avoiding ground balls to save energy",
        "Skipping warm-ups",
      ],
      correctAnswer: 1,
      explanation: "Pass when teammate has the better shot. That's the daily sacrifice.",
    },
      {
      question: "Sacrifice works when:",
      options: [
        "Captains choose who sacrifices what",
        "One person gives the most every time",
        "Everyone gives something — distribution is even",
        "Coaches enforce it strictly",
      ],
      correctAnswer: 2,
      explanation: "Even distribution = sustainable. One martyr team isn't sustainable.",
    },
      {
      question: "Why do sacrificing teams beat more talented ones?",
      options: [
        "Refs reward it",
        "It's a coincidence",
        "They get lucky",
        "Cumulative effect — every play has more team value",
      ],
      correctAnswer: 3,
      explanation: "Better passes, better slides, better backups — small choices compound.",
    },
      {
      question: "You're the leading scorer. New play has the ball going through your hands but you're the screener, not the shooter. Coach asks you to commit to it. What do you do?",
      options: [
        "Commit fully — set the best screens of your career",
        "Push back — you should be the shooter",
        "Ask for a different role",
        "Set screens half-heartedly",
      ],
      correctAnswer: 0,
      explanation: "Top scorers who screen hard make EVERYONE more dangerous. Defenses can't predict who's the threat. That's elite team play.",
      kind: "scenario",
      scenario: "You're the team's leading scorer. New offensive set has you as the screener — not the finisher. Coach pulls you aside to ask if you'll commit to the role.",
    },
    ],
    keyTakeaways: [
      "Sacrifice = giving up something you want for something the team needs.",
      "Common sacrifices: shots, position, minutes, ego after a bad call.",
      "If sacrifice feels even, both sides give up something — that's what makes it work.",
      "The team that out-sacrifices the other team usually wins.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
  {
    id: "boys-high-l10",
    lessonNumber: 10,
    title: "The Legacy You Leave",
    topic: "Mental Game",
    pillar: "team",
    description: `Every team eventually becomes a memory. The seniors graduate. The roster turns over. The only thing that survives is the culture you built — and that culture becomes the legacy you leave behind.\n\nLegacy isn't about your stats. Nobody remembers how many goals you scored in 10 years. They remember how you made people feel. They remember whether you were the kind of teammate who lifted others up or tore them down. They remember the culture you created.\n\nThe best legacy you can leave is a team that's better AFTER you leave. That means you didn't just play hard — you taught the younger players how to play hard. You didn't just show up on time — you taught the underclassmen why showing up early matters. You passed down the standard.\n\nThink about the seniors who were on your team when you were a freshman. What did they teach you? How did they make you feel? Did they make you feel welcome or excluded? Did they push you to be better or ignore you? Whatever you answer — that's their legacy. Now ask yourself: what will YOUR freshmen say about you in three years?\n\nEvery practice is a chance to build your legacy. Every interaction with a younger player. Every time you pick someone up after a mistake. Every time you set the tone in conditioning. Every time you hold yourself to the standard when it would be easier to coast.\n\nWhen you're done playing, you won't remember the score of that Tuesday practice. But you'll remember the guys you competed with. You'll remember what it felt like to be part of something bigger than yourself. And the younger players who watched you will carry forward what you showed them. That's legacy — and it's the most important thing you'll build in your entire lacrosse career.`,
    questions: [
      {
      question: "What do teammates remember about you 10 years later?",
      options: [
        "Goals scored that season",
        "How you treated people, the standard you set",
        "Which tournaments you played",
        "Stats from the playoff run",
      ],
      correctAnswer: 1,
      explanation: "Stats fade. Behavior toward teammates and the standard you held — that's legacy.",
    },
      {
      question: "How do you 'build the program' as a senior?",
      options: [
        "Score the most points to set records",
        "Win the most games possible",
        "Mentor underclassmen — leave it better than you found it",
        "Recruit transfers in",
      ],
      correctAnswer: 2,
      explanation: "Programs are passed down. Your senior year is about what you leave.",
    },
      {
      question: "What's the senior-year mindset shift?",
      options: [
        "Take more shots — last chance to score",
        "Quiet down and let underclassmen lead",
        "Focus on personal stats for college",
        "From taking to giving — invest in those who follow",
      ],
      correctAnswer: 3,
      explanation: "Final year is about what you give back. Investing in younger players IS the legacy.",
    },
      {
      question: "Best 'legacy' move you can make this season?",
      options: [
        "Adopt one freshman — answer questions, model the standard, include him",
        "Captain the team",
        "Win MVP",
        "Score 50 goals",
      ],
      correctAnswer: 0,
      explanation: "One mentored freshman becomes a senior who mentors more. Multiplier effect — that's program building.",
    },
      {
      question: "Last home game. Pre-game. A freshman is sitting alone, looking nervous. The team is in cliques. You're a senior captain. What do you do?",
      options: [
        "Send a teammate over to handle it",
        "Sit next to him: 'first big game? I was you 4 years ago. Here's what helped.'",
        "Ignore him — it's your special day",
        "Tell him to stop being nervous",
      ],
      correctAnswer: 1,
      explanation: "Legacy moments are built in choices like this. He'll remember senior night for the rest of his life — make sure it's because someone showed up.",
      kind: "scenario",
      scenario: "Senior night. Pre-game locker room. A freshman who barely plays is sitting alone, clearly nervous. The team's in cliques. You're a senior captain.",
    },
    ],
    keyTakeaways: [
      "Legacy is what teammates remember about you 10 years from now.",
      "Stats fade. The kid who picked up freshmen, set the standard, played through pain — they remember.",
      "Build the program: leave it better than you found it. Mentor the underclassmen.",
      "Final season is your last chance to give. Spend it generously.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dCVlRFWOjgE",
  },
]

// ─── GIRLS LESSONS ────────────────────────────────────────────────────

const GIRLS_YOUTH_LESSONS: AcademyLesson[] = [
  {
    id: "girls-youth-l1",
    videoUrl: "https://www.youtube.com/watch?v=QrH4dilJi3c",
    lessonNumber: 1,
    title: "Welcome to Girls Lacrosse",
    topic: "Fundamentals",
    pillar: "game",
    description: `Girls lacrosse is one of the fastest-growing sports in the world. It's a beautiful, fast-paced game that combines speed, skill, and smart decision-making. While it shares roots with boys lacrosse, the girls game has its own rules, style, and feel.\n\nGirls lacrosse is a non-contact sport (compared to boys). You don't wear pads or a helmet — just goggles, a mouthguard, and your stick. Stick checking is allowed but it's controlled and limited. The emphasis is on skill, footwork, positioning, and clean play. Players who try to play physically usually get fouls called against them.\n\nThe field is bigger than boys lacrosse, and there are 12 players per team — 11 field players plus a goalie. Positions are attack, midfield, defense, and goalie. The ball is the same size and shape as boys lacrosse, and the goal is the same — score by getting the ball into the opposing net.\n\nThe game is played in two halves with a clock. Goals can be scored from anywhere on the field, but most happen close to the net.\n\nWhat makes girls lacrosse special is the speed of the decisions. Because you can't bash people around, the game is about reading the field, timing your cuts, and using smart footwork to get open. The best players are the ones who think the fastest — not necessarily the strongest.\n\nWelcome to the game. There's no better sport to learn how to compete, communicate, and grow as both an athlete and a person.`,
    questions: [
      {
      question: "How many players are on the field per team in girls lacrosse?",
      options: [
        "10",
        "13",
        "12",
        "11",
      ],
      correctAnswer: 2,
      explanation: "Girls field 12 players, including the goalie.",
    },
      {
      question: "How does a girls game start (and restart after goals)?",
      options: [
        "Faceoff at midfield",
        "Throw-in by the ref",
        "Goalie pass",
        "Draw at the center circle",
      ],
      correctAnswer: 3,
      explanation: "Draws are unique to girls lacrosse — sticks pinch ball, ref releases, players fight for it.",
    },
      {
      question: "Body checking in girls lacrosse is...",
      options: [
        "Not allowed at any level",
        "Allowed in playoffs only",
        "Allowed for high schoolers only",
        "Allowed once per quarter",
      ],
      correctAnswer: 0,
      explanation: "No body checking. Game emphasizes skill, speed, and positioning.",
    },
      {
      question: "What does the 8m arc around the goal protect?",
      options: [
        "The goalie's space",
        "The shooter's space — defenders can't block shot path",
        "Faceoff positioning",
        "Crease size",
      ],
      correctAnswer: 1,
      explanation: "Inside 8m, defenders must be marking up — no standing in shot lanes.",
    },
      {
      question: "Tryouts. Coach is watching how players move when they DON'T have the ball. What does she likely value most?",
      options: [
        "Loudest player on the field",
        "Most goals scored",
        "Hustles to every ground ball, supports teammates",
        "Newest stick gear",
      ],
      correctAnswer: 2,
      explanation: "Hustle, communication, and team support stand out most when skill levels are similar.",
      kind: "scenario",
      scenario: "Tryouts. Coach has 28 spots and 40 girls. She's watching off-ball movement, hustle, and communication.",
    },
    ],
    keyTakeaways: [
      "Girls lacrosse fields 12 players: 4 attackers, 3 midfielders, 4 defenders, 1 goalie.",
      "No body checking. Stick checks must be controlled — no swinging at the head/body.",
      "Game starts with a draw at the center circle, not a faceoff like boys.",
      "The 8m arc and 12m fan around each goal protect the shooter — fouls = free position.",
    ],
    diagrams: [
      {
        title: "Girls Lacrosse — Where Everyone Plays",
        view: "women-full",
        caption: "Twelve players per side: 4 attack, 3 mid, 4 defense, 1 goalie. The arcs around each goal define shooting space — defenders can't stand in the path of a shot.",
        players: [
          {
            x: 25,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 50,
            y: 78,
            role: "attack",
            label: "A"
          },
          {
            x: 75,
            y: 80,
            role: "attack",
            label: "A"
          },
          {
            x: 50,
            y: 70,
            role: "attack",
            label: "A"
          },
          {
            x: 30,
            y: 55,
            role: "midfield",
            label: "M"
          },
          {
            x: 50,
            y: 55,
            role: "midfield",
            label: "M"
          },
          {
            x: 70,
            y: 55,
            role: "midfield",
            label: "M"
          },
          {
            x: 25,
            y: 30,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 32,
            role: "defense",
            label: "D"
          },
          {
            x: 75,
            y: 30,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 22,
            role: "defense",
            label: "D"
          },
          {
            x: 50,
            y: 15,
            role: "goalie",
            label: "G"
          },
        ],
        legend: [
          {
            label: "Attack",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Midfield",
            color: "#EAB308",
            shape: "circle"
          },
          {
            label: "Defense",
            color: "#2563EB",
            shape: "square"
          },
          {
            label: "Goalie",
            color: "#10B981",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-youth-l2",
    videoUrl: "https://www.youtube.com/watch?v=a4fWOtC8C7Q",
    lessonNumber: 2,
    title: "Cradling and Stick Control",
    topic: "Fundamentals",
    pillar: "game",
    description: `Cradling is how you keep the ball in your stick while you move. In girls lacrosse, the pockets are shallower than the boys game — which means your cradling technique has to be smooth and controlled.\n\nHOW TO CRADLE — STEP BY STEP\n\n1. Grip the Stick Correctly\nYour top hand (closest to the head) grips firmly. Your bottom hand (near the butt end) grips loosely — it's a guide, not a clamp. Think relaxed hands. Tight grip = stiff cradle = dropped ball.\n\n2. Start the Motion\nThe cradle is a small, smooth wrist roll — like turning a key in a lock. Your top hand does most of the work. Don't swing your whole arm. The motion should be small enough that someone watching from far away barely notices it.\n\n3. Stick Protection Position\nAs you run, keep your top hand near your ear. This is called "stick protection position." It keeps the ball away from defenders and makes it much harder to check.\n\n4. Shielding\nWhen a defender is nearby, cradle on the side of your body AWAY from them. Defender on your right? Cradle left. This is called "shielding" — using your body as a wall between the defender and your stick.\n\n5. Switching Hands\nTo switch hands: loosen your bottom hand, move the stick across your body (like a knight sheathing a sword), slide your bottom hand up to meet your top hand, release your top hand and regrip. Your new top hand takes over cradling. Start learning this early — the more comfortable you are with both hands, the better.\n\nCOACHING POINTS\n- Practice cradling everywhere — walking around the house, watching TV, in the backyard\n- Start with your dominant hand, but work on your off-hand every day\n- The best players cradle without thinking about it — that only comes from reps`,
    questions: [
      {
      question: "Which hand controls a girls cradle?",
      options: [
        "Both equally",
        "Bottom hand — tighter grip",
        "Whichever feels best that day",
        "Top hand — near the head",
      ],
      correctAnswer: 3,
      explanation: "Top hand near the head does the work. Bottom hand is a loose guide.",
    },
      {
      question: "Why is the girls cradle tighter than the boys cradle?",
      options: [
        "Pockets are shallower — ball pops out easier",
        "Refs require it",
        "Field is smaller",
        "Sticks are shorter",
      ],
      correctAnswer: 0,
      explanation: "Shallow pockets demand tighter, more controlled cradles.",
    },
      {
      question: "Stick protection position?",
      options: [
        "Stick low and to the side",
        "Top hand near ear, body between stick and defender",
        "Stick across your forehead",
        "Stick parallel to the ground",
      ],
      correctAnswer: 1,
      explanation: "Top hand near ear with body shielding the stick = hard to check.",
    },
      {
      question: "Where should you practice cradling?",
      options: [
        "Only with a coach watching",
        "Only on a regulation field",
        "Anywhere — backyard, walking around the house",
        "Only at practice",
      ],
      correctAnswer: 2,
      explanation: "Reps build muscle memory. Cradle constantly, both hands, until automatic.",
    },
      {
      question: "You're driving toward the 8m. A defender is on your left side, stick up, looking to check. What do you do?",
      options: [
        "Pass it back without looking",
        "Hold the stick straight up overhead",
        "Drop your stick lower for protection",
        "Switch hands to keep the stick away from her check",
      ],
      correctAnswer: 3,
      explanation: "Switch hands to keep your body between defender and stick. That's why we practice both hands every day.",
      kind: "scenario",
      scenario: "You're driving toward the 8m arc. Your stick is in your right hand. The defender is on your left side, stick up, looking to check.",
    },
    ],
    keyTakeaways: [
      "Top hand near head, bottom near butt-end. Top hand controls; bottom guides.",
      "Girls sticks have shallower pockets — cradling has to be tighter and more controlled.",
      "Stick protection: top hand near ear, body shielding. Defenders can't body check, but they CAN stick check — stay protected.",
      "Practice cradling everywhere. Reps until it's automatic in both hands.",
    ],
    diagrams: [
      {
        title: "Stick Protection — Both Hands",
        view: "women-half-offensive",
        caption: "Top hand near ear, body between defender and stick. Cradle is tight wrist motion (smaller than boys' because pockets are shallower). Defenders can stick-check, so protect at all times.",
        players: [
          {
            x: 50,
            y: 55,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 38,
            y: 60,
            role: "defender",
            label: "D"
          },
        ],
        labels: [
          {
            x: 60,
            y: 48,
            text: "Stick high, near ear",
            size: "xs"
          },
          {
            x: 50,
            y: 75,
            text: "Body shields stick",
            size: "xs"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-youth-l3",
    videoUrl: "https://www.youtube.com/watch?v=4iOD3TjV6D8",
    lessonNumber: 3,
    title: "Passing and Catching",
    topic: "Fundamentals",
    pillar: "game",
    description: `Passing and catching — also called "throwing and receiving" — is the most important skill in girls lacrosse. If you can pass and catch, you can play. If you can't, the game gets very hard.\n\nHOW TO THROW — STEP BY STEP\n\n1. Grip and Position\nTop hand near the head of the stick, bottom hand near the butt end. Bring the stick back behind your ear with both hands.\n\n2. Step and Throw\nStep toward your target with your opposite foot (if your top hand is your right, step with your left). Point your top hand toward your target and snap your wrist as you release. Follow through — your stick should finish pointing at your target.\n\n3. Off-Hand Throwing\nOnce you're comfortable throwing with your dominant hand, start practicing with your other hand. Do the same steps. It will feel awkward at first — that's normal. The players who can throw with both hands are twice as dangerous.\n\nHOW TO CATCH — STEP BY STEP\n\n1. Give a Target\nHold your stick out with the pocket facing the passer. This is called "showing your target" or "giving a soft target." Your teammate should be able to see where to throw.\n\n2. Absorb the Ball\nAs the ball arrives, "give" with your stick by pulling it slightly back. This cushions the catch. If you keep your stick stiff, the ball bounces out.\n\n3. Transition to Cradle\nThe second you catch, start cradling immediately. Catch and cradle is one motion, not two.\n\nCOACHING POINTS\n- Wall ball is the #1 way to improve. Throw against a wall, catch it, repeat. Start with 25 per hand per day. Work up to 50.\n- "Soft hands" means absorbing the ball — don't stab at it\n- Always practice both hands — even if one side feels terrible at first`,
    questions: [
      {
      question: "Throwing right-handed, which foot steps forward?",
      options: [
        "Left foot",
        "Right foot",
        "Both feet jump together",
        "Either foot",
      ],
      correctAnswer: 0,
      explanation: "Step with the opposite foot — same as throwing a baseball.",
    },
      {
      question: "What does 'absorbing the ball' mean?",
      options: [
        "Hold the stick rigid as ball arrives",
        "Pull stick back slightly to cushion the catch",
        "Catch with the back of the head",
        "Stab the stick at the ball quickly",
      ],
      correctAnswer: 1,
      explanation: "Soft hands give as the ball arrives — that's what keeps it in the pocket.",
    },
      {
      question: "What is wall ball?",
      options: [
        "A faceoff variation",
        "A team game with two goalies",
        "Throwing and catching against a wall solo",
        "A drill only goalies use",
      ],
      correctAnswer: 2,
      explanation: "Wall ball is the gold-standard solo drill. Both hands. Daily.",
    },
      {
      question: "Best way to start improving stick skills fast?",
      options: [
        "10 wall ball reps per week",
        "Only with a coach",
        "Only at team practice",
        "25 reps per hand daily, build to 100",
      ],
      correctAnswer: 3,
      explanation: "25 per hand daily, build to 100. The pros do thousands. Daily reps = fast progress.",
    },
      {
      question: "Teammate is breaking toward goal. You have ball in right hand. She's running to your left side. Pass options?",
      options: [
        "Switch to left hand and throw, OR step left and lead her",
        "Wait for her to come to your right",
        "Hand it off — don't pass",
        "Throw across your body righty",
      ],
      correctAnswer: 0,
      explanation: "Switch hands or step toward her side. Cross-body throws are easy interceptions for defenders.",
      kind: "scenario",
      scenario: "Mid-game. Defender is on your right shoulder. Teammate is breaking to your left toward the goal.",
    },
    ],
    keyTakeaways: [
      "Throw: step opposite foot, snap wrist, follow through pointing at target.",
      "Catch: soft target, then 'absorb' — pull stick back as ball arrives.",
      "Wall ball is the best stick-skill drill. Both hands. Daily.",
      "Stiff hands = drops. Soft hands = clean catches. Cushion every catch.",
    ],
  },
  {
    id: "girls-youth-l4",
    videoUrl: "https://www.youtube.com/watch?v=7deaRXF70Q8",
    lessonNumber: 4,
    title: "Being a Great Teammate",
    topic: "Character",
    pillar: "team",
    description: `Lacrosse is a team sport, and the best teams aren't built on talent alone — they're built on great teammates. Being a great teammate is a skill, just like cradling or shooting. You can practice it every day.\n\nGreat teammates encourage each other. When a teammate makes a great play, you celebrate with her. When she makes a mistake, you pick her up. You never make fun of anyone for missing a pass or having a bad day. Everyone has bad days — and how you respond to a teammate's mistake says everything about you.\n\nGreat teammates listen to coaches. When the coach is talking, you stop talking. You look at her. You take in what she's saying. You don't roll your eyes. You don't whisper to your friend. You don't argue. You listen, say "got it," and try to apply what she said.\n\nGreat teammates hustle for everyone. Sprinting after a ground ball isn't just for you — it helps the team. Backing up a shot isn't glamorous, but it might save a goal. Running hard in transition makes the next play easier for your teammates. Hustle is the most contagious thing in sports. When one player hustles, others follow.\n\nGreat teammates celebrate each other. When a teammate scores, you sprint to celebrate with her — even if you wish it was you. When a teammate has a great game, you tell her. When a teammate is having a hard time, you pull her aside and check in.\n\nThe best teams BTB has ever had weren't always the most talented. They were the ones where everyone genuinely cared about each other. That bond doesn't happen by accident. It happens because every player chooses to be a great teammate every day.`,
    questions: [
      {
      question: "Teammate drops a wide-open pass. What's the best response?",
      options: [
        "Tell coach she should be benched",
        "Say 'shake it off, get the next one'",
        "Get angry at her",
        "Refuse to pass to her again",
      ],
      correctAnswer: 1,
      explanation: "Pick teammates up after mistakes. Trust gets built when teammates know you have their back.",
    },
      {
      question: "When the coach is giving instructions, what does a great teammate do?",
      options: [
        "Repeat what coach said quietly",
        "Keep stretching to stay loose",
        "Look at the coach, listen, no side talk",
        "Wait for the part that matters",
      ],
      correctAnswer: 2,
      explanation: "Eyes up, mouth shut. Side conversations cost info AND respect.",
    },
      {
      question: "Why does hustle matter when you don't have the ball?",
      options: [
        "Coaches just like to see you tired",
        "It doesn't really — only ball-side counts",
        "It makes the other team angry",
        "Off-ball hustle backs up shots and creates extra possessions",
      ],
      correctAnswer: 3,
      explanation: "Off-ball hustle wins ground balls, backs up shots, creates second chances.",
    },
      {
      question: "What does 'the standard is the standard' mean at BTB?",
      options: [
        "Everyone is expected to bring their best, every day",
        "Only games count, practice is optional",
        "The best player sets the bar",
        "Coaches grade you on a curve",
      ],
      correctAnswer: 0,
      explanation: "Standards apply to everyone equally. No one gets a pass.",
    },
      {
      question: "Practice is dragging. It's hot. The drill is repetitive. Half the team is walking between reps. What do you do?",
      options: [
        "Walk too — match the energy",
        "Sprint between reps and pick up balls — set the standard",
        "Ask coach to end practice early",
        "Take a knee until coach yells",
      ],
      correctAnswer: 1,
      explanation: "Energy is contagious. One player setting the standard pulls the whole group with her.",
      kind: "scenario",
      scenario: "Tuesday practice in late August. 90°. Same shooting drill four times. Coach is on the other side of the field.",
    },
    ],
    keyTakeaways: [
      "Pick teammates up after mistakes. Everyone has bad days — your reaction matters.",
      "When the coach talks, you stop talking. Eyes up, mouth shut. That's respect AND learning.",
      "Hustle helps the team even when you don't have the ball — back up shots, chase ground balls.",
      "The standard is the standard. Everyone is expected to bring their best every day.",
    ],
  },
  {
    id: "girls-youth-l5",
    videoUrl: "https://www.youtube.com/watch?v=pgJzzpjrdFA",
    lessonNumber: 5,
    title: "Where to Be on the Field",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `The lacrosse field can feel confusing at first, but understanding where to be is what separates players who chase the ball from players who actually help their team.\n\nBASIC FIELD AWARENESS\n\n1. Spread Out on Offense\nWhen your team has the ball, don't all run to the ball carrier. Spread out! Get wide. This forces the defense to cover more ground and gives your teammate with the ball options to pass to. If you're all bunched up, one defender can guard two players.\n\n2. Compress on Defense\nWhen the other team has the ball, get tighter together. Help each other. Communicate — "I've got ball!" "Help right!" "Help left!" Every call gives your teammates information.\n\n3. Understand Shooting Space\nIn girls lacrosse, there's a critical rule: the area in front of the goal is called "shooting space." You cannot run through it or stand in it unless you have the ball or are marking someone. This rule protects the goalie and keeps the area safe. Understanding shooting space is key to not getting whistled for fouls.\n\n4. The Simple Rule\nIf you're not sure where to be: get to where you can help. Teammate has the ball? Get open for a pass. Teammate is being pressured? Move to give her an outlet. Shot goes off? Crash for the rebound. There's always something useful to do.\n\nCOACHING POINTS\n- On offense: spacing is everything. Stay 5+ yards apart from teammates\n- On defense: communicate CONSTANTLY. "Ball!" "Help!" "Crash!"\n- Know the shooting space rule — it's unique to girls lacrosse and gets called a lot`,
    questions: [
      {
      question: "Your team has the ball. Where should off-ball players go?",
      options: [
        "Run to the goal in a clump",
        "All run to the ball carrier",
        "Spread out — give passing options",
        "Stand still and wait for a pass",
      ],
      correctAnswer: 2,
      explanation: "Spread out so the defense has to cover the whole field, not just one spot.",
    },
      {
      question: "The other team has the ball. What does YOUR team do?",
      options: [
        "Run back to your own goal only",
        "Stand on the sideline",
        "Spread out wide",
        "Compress and tighten up to help each other",
      ],
      correctAnswer: 3,
      explanation: "On defense, compress — close enough to help, far enough to cover your mark.",
    },
      {
      question: "What is 'lacrosse IQ'?",
      options: [
        "Knowing where to be and what to do",
        "How fast you run",
        "How hard your shot is",
        "How tall and strong you are",
      ],
      correctAnswer: 0,
      explanation: "IQ is awareness — anticipating, finding open space, helping when needed.",
    },
      {
      question: "Don't know where to be — what do you do?",
      options: [
        "Stay where you started",
        "Find a spot where you can help — backup, slide, get open",
        "Run to the goal regardless of the play",
        "Stand on the sideline",
      ],
      correctAnswer: 1,
      explanation: "When in doubt, get to where you can help. Movement with purpose beats freezing.",
    },
      {
      question: "Your teammate is dodging from behind the goal. The defense is collapsing on her. You're at the top of the offensive zone with no defender on you. Best move?",
      options: [
        "Run back to defense",
        "Yell for the ball but don't move",
        "Cut hard to the goal expecting a pass",
        "Stand still — don't move",
      ],
      correctAnswer: 2,
      explanation: "When the defense collapses, the off-ball player is open. Cut to the goal — your teammate sees you.",
      kind: "scenario",
      scenario: "You're on offense at the top of the zone. Your teammate dodges from behind the cage. All defenders collapse on her. You're suddenly unguarded.",
    },
    ],
    keyTakeaways: [
      "When YOUR team has the ball: spread out so the defense can't cover everyone.",
      "When the OTHER team has the ball: compress, get tight, communicate.",
      "If you don't know where to be, find a spot to help — back up a shot, get open, slide.",
      "Lacrosse IQ = knowing where to be BEFORE the play needs you there.",
    ],
    diagrams: [
      {
        title: "Spread Out on Offense",
        view: "women-half-offensive",
        caption: "Stay 5+ yards apart. If you bunch up, the defense covers everyone with fewer players. Spacing creates passing lanes and dodging room.",
        zones: [
          {
            shape: "rect",
            x: 12,
            y: 30,
            w: 76,
            h: 35,
            color: "#FACC15",
            label: "Stay 5+ yds apart"
          },
        ],
        players: [
          {
            x: 18,
            y: 40,
            role: "offense",
            label: "1"
          },
          {
            x: 50,
            y: 32,
            role: "offense",
            label: "2"
          },
          {
            x: 82,
            y: 40,
            role: "offense",
            label: "3"
          },
          {
            x: 35,
            y: 60,
            role: "offense",
            label: "4"
          },
          {
            x: 65,
            y: 60,
            role: "offense",
            label: "5"
          },
          {
            x: 50,
            y: 88,
            role: "offense",
            label: "X",
            ball: true
          },
        ],
        legend: [
          {
            label: "Offense",
            color: "#D22630",
            shape: "circle"
          },
        ]
      },
    ],
  },
  {
    id: "girls-youth-l6",
    videoUrl: "https://www.youtube.com/watch?v=QrH4dilJi3c",
    lessonNumber: 6,
    title: "The BTB Standard",
    topic: "Mental Game",
    pillar: "leadership",
    description: `The BTB Standard is what makes our program different. It's not about being the most talented — it's about being the kind of player coaches and teammates want around.\n\nThe Standard has three parts:\n\nEffort — You bring 100% every time you step on the field. Not 80% because you're tired. Not 60% because it's hot. 100%. If you're going to be on the field, you owe it to your teammates to give your best.\n\nAttitude — You show up ready to learn. You don't roll your eyes. You don't argue with coaches. You don't blame teammates. When something goes wrong, you say "my fault, I'll get the next one." When something goes right, you celebrate the teammates who helped you.\n\nPreparation — You take care of your gear. You practice on your own time. You watch lacrosse on TV when you can. You ask questions when you don't understand. You're always trying to learn more.\n\nIf you do these three things, you'll improve faster than the players who don't. That's a guarantee. Skill takes time, but the Standard is something you choose every single day. And the players who choose it become the ones coaches remember forever.\n\nAt BTB, we say "the standard is the standard." That means everyone is held to it equally — best player on the team or last player off the bench. You don't get a pass on effort because you scored three goals last game. The standard doesn't bend.`,
    questions: [
      {
      question: "What are the three parts of the BTB Standard?",
      options: [
        "Helmet, gloves, stick",
        "Speed, strength, skill",
        "Goals, assists, ground balls",
        "Effort, attitude, preparation",
      ],
      correctAnswer: 3,
      explanation: "Effort + attitude + preparation — three choices anyone can make.",
    },
      {
      question: "How much effort does the BTB Standard require?",
      options: [
        "100% every time — no excuses",
        "Whatever your coach asks for",
        "80% to save energy for games",
        "Match what your teammates give",
      ],
      correctAnswer: 0,
      explanation: "100% is the deal. Anything less, you owe your teammates an explanation.",
    },
      {
      question: "You make a bad pass that becomes a goal against. Right response?",
      options: [
        "Blame the receiver",
        "'My fault, I'll get the next one'",
        "Argue with the ref",
        "Walk off the field",
      ],
      correctAnswer: 1,
      explanation: "Own it, reset, compete on the next play. That's BTB attitude.",
    },
      {
      question: "What's an example of preparation?",
      options: [
        "Showing up exactly on time",
        "Buying new cleats every season",
        "Wall ball on your own time, gear in order, watching games",
        "Doing only what the coach assigns",
      ],
      correctAnswer: 2,
      explanation: "Preparation is the work you do when nobody's making you.",
    },
      {
      question: "Saturday morning. Game at 9. You wake up at 7 — alarm didn't go off as planned. What does a BTB-Standard player do FIRST?",
      options: [
        "Skip warmups and go straight to the bench",
        "Text the coach you'll be late",
        "Check social media to wake up",
        "Check gear, eat, hydrate, mentally prep — get to game ready",
      ],
      correctAnswer: 3,
      explanation: "Preparation isn't just the day before. Game-day routine matters: gear check, hydrate, mental prep.",
      kind: "scenario",
      scenario: "Game day. You woke up later than planned but still have 90 minutes. The team is meeting at 8:15 for warmups.",
    },
    ],
    keyTakeaways: [
      "BTB Standard = Effort + Attitude + Preparation.",
      "Effort: 100% every time. Not 80% because you're tired. 100%.",
      "Attitude: own mistakes ('my fault, next one'), no eye-rolls, no blame.",
      "Preparation: care for gear, practice on your own, watch lacrosse, ask questions.",
    ],
  },
  {
    id: "girls-youth-l7",
    videoUrl: "https://www.youtube.com/watch?v=RwMQvpad-XE",
    lessonNumber: 7,
    title: "Leading by Example",
    topic: "Character",
    pillar: "leadership",
    description: `You don't have to be the fastest or the most skilled player to be a leader. Leadership at your age is about one thing: doing the right thing when nobody is making you.\n\nLeading by example means being the player who sprints when others jog. You're the one who picks up the cones without being asked. You're the one who keeps working on your off-hand after practice ends. These small things might seem like they don't matter — but everyone notices.\n\nHere's a secret: people pay more attention to what you DO than what you SAY. If you tell your teammates to work harder but then you walk through a drill, nobody listens. If you go full speed on every rep, your teammates start doing the same — even without you saying a word.\n\nLeaders also show up on the tough days. When it's raining and cold and you'd rather be inside — that's when leadership matters most. Anyone can show up when the sun is shining. Real leaders bring the same energy every single day.\n\nAt BTB, we believe leadership isn't about age or talent. It starts right now. Be the player who does more than what's expected. Be the one who lifts others up after a mistake instead of looking away. That's what it means to lead by example.`,
    questions: [
      {
      question: "Do you have to be the best player on the team to lead?",
      options: [
        "No — leadership is action, not skill",
        "Only if you're a captain",
        "Only the oldest kids can lead",
        "Yes, only stars lead",
      ],
      correctAnswer: 0,
      explanation: "Leadership is a choice anyone makes. Action over status.",
    },
      {
      question: "What matters more — what you say or what you do?",
      options: [
        "What you say — words motivate",
        "What you do — people watch actions",
        "Only what the coach says",
        "Both equal — they're tied together",
      ],
      correctAnswer: 1,
      explanation: "Tell teammates to hustle while you walk and nobody listens. Sprint without a word and they follow.",
    },
      {
      question: "When does leadership matter most?",
      options: [
        "When practice is easy",
        "Only at championship games",
        "On bad days — rain, cold, tired",
        "When the team is winning",
      ],
      correctAnswer: 2,
      explanation: "Anyone can lead when things are easy. Real leaders bring it when conditions are bad.",
    },
      {
      question: "What's one specific 'lead by example' action you can do tomorrow?",
      options: [
        "Tell teammates to hustle",
        "Wear team colors off the field",
        "Show up exactly on time",
        "Sprint between drills and pick up balls",
      ],
      correctAnswer: 3,
      explanation: "Sprint and pick up balls — visible effort that pulls others up.",
    },
      {
      question: "First practice of the season. Half the team is jogging the warmup. The captain isn't there yet. What do you do?",
      options: [
        "Run faster — others catch up to your example",
        "Ask the coach what speed to go",
        "Match the team's pace — fit in",
        "Wait for the captain to set the pace",
      ],
      correctAnswer: 0,
      explanation: "Leadership is showing up first and setting the tempo. You don't need a title to set the standard.",
      kind: "scenario",
      scenario: "Day 1 of fall ball. Coach said 'two laps to warm up'. Most kids are jogging. The captain is in the bathroom.",
    },
    ],
    keyTakeaways: [
      "Leadership doesn't require being the best player or wearing a 'C'.",
      "Lead by example: sprint when others jog, pick up balls, stay after for extra reps.",
      "Real leaders show up the same on bad days — rain, cold, tired — as on good days.",
      "People watch what you DO, not what you SAY. Actions set the standard.",
    ],
  },
  {
    id: "girls-youth-l8",
    videoUrl: "https://www.youtube.com/watch?v=3f3EEGr6WZk",
    lessonNumber: 8,
    title: "Respecting the Game",
    topic: "Character",
    pillar: "leadership",
    description: `Girls lacrosse is one of the fastest-growing sports in the country — and it has a history that goes back hundreds of years. When you step on the field, you're part of something special. That deserves respect.\n\nRespecting the game starts with how you treat your opponents. They're not enemies — they're the competition that pushes you to get better. Shake hands before and after every game. Win with class. Lose with dignity. How you handle yourself says more about your character than the final score.\n\nRespecting the game means accepting refs' calls — even bad ones. Refs are human. They'll miss calls. Arguing doesn't change the call, but it DOES distract you from the next play. The best response to a bad call is to play harder on the next whistle.\n\nRespecting the game means taking care of your equipment. Your stick, your goggles, your cleats — treat them well. They're the tools of your sport.\n\nRespecting the game means being fully present at practice. When you're on the field, be ON the field. No side conversations during drills. No eye-rolling when the coach corrects you. Give the game your full attention because the time you spend playing is short — make every minute count.\n\nPlayers who respect the game earn respect from coaches, teammates, opponents, and families watching. It's one of the most important habits you'll ever build.`,
    questions: [
      {
      question: "How should you treat opponents?",
      options: [
        "Like enemies — beat them down",
        "With respect — they push you to improve",
        "Only if they're nice first",
        "Ignore them between whistles",
      ],
      correctAnswer: 1,
      explanation: "Without good opponents, you don't grow. Respect is what real competitors give.",
    },
      {
      question: "Ref makes a bad call against your team. Best response?",
      options: [
        "Argue calmly until she sees it",
        "Yell loud enough that she reverses it",
        "Accept it, compete on the next play",
        "Throw your stick to show frustration",
      ],
      correctAnswer: 2,
      explanation: "Refs miss calls. Arguing hurts your focus. Next-play mentality is what wins.",
    },
      {
      question: "You leave your stick out in the rain overnight. What does that say?",
      options: [
        "It's the parents' job to handle that",
        "Nothing — it's just a stick",
        "Sticks don't get damaged that easily",
        "You don't respect your tools or the game",
      ],
      correctAnswer: 3,
      explanation: "Your gear is the tools of your sport. Respecting it shows you respect the game.",
    },
      {
      question: "What does 'respecting the game' actually cover?",
      options: [
        "Opponents, refs, gear, and practice time",
        "Saying the right things to coaches",
        "Just winning with class",
        "Wearing the team uniform proudly",
      ],
      correctAnswer: 0,
      explanation: "Respect is total — for everyone and everything connected to the sport.",
    },
      {
      question: "Final whistle. You lost on a goal you think was offside. Ref didn't call it. The other team is celebrating. What do you do?",
      options: [
        "Confront the ref about the call",
        "Line up and shake hands cleanly",
        "Stand and stare at the celebration",
        "Walk off without shaking hands",
      ],
      correctAnswer: 1,
      explanation: "Win or lose, you line up and shake hands. That's how you show the game respect — and the game pays you back over time.",
      kind: "scenario",
      scenario: "Tough loss. Final goal looked offside but wasn't called. The handshake line is forming. Your teammates are watching how you react.",
    },
    ],
    keyTakeaways: [
      "Opponents make you better — shake hands before and after every game.",
      "Refs miss calls. Arguing wastes energy and hurts your team. Compete on the next play.",
      "Take care of your gear — sticks, goggles, mouth guards aren't toys.",
      "Be fully present at practice. Phones away, focus up. Time on the field is short.",
    ],
  },
  {
    id: "girls-youth-l9",
    videoUrl: "https://www.youtube.com/watch?v=2v4vfqctG88",
    lessonNumber: 9,
    title: "Why Teams Win",
    topic: "Mental Game",
    pillar: "team",
    description: `Here's something important: the team with the most talented players doesn't always win. Sometimes a team with average skills but amazing teamwork beats a team of all-stars who don't play together.\n\nWhy? Because lacrosse is a team sport. You can't win alone. Your attack needs your midfield to bring the ball up. Your midfield needs your defense to stop the other team. Your defense needs your goalie. Your goalie needs everyone. When every player does their job well, the team works.\n\nTeams win because they trust each other. When you trust your teammate to be in the right spot, you pass without hesitating. When you trust your defense to slide, you play your girl tight. Trust makes everyone play faster and smarter.\n\nTeams win because they support each other. When a teammate drops a ball, you don't groan — you say "next one!" When someone misses a shot, you back it up. When someone gets beat, the team responds. Every mistake is a chance for the TEAM to step up together.\n\nTeams win because they care about each other. When you genuinely care about your teammates, you work harder. You don't want to let them down. You sprint back on defense because your goalie is counting on you. You make the extra effort because you know your teammates would do the same.\n\nBe the kind of teammate who makes the team better just by being there. That matters more than any individual skill.`,
    questions: [
      {
      question: "Does the most talented team always win?",
      options: [
        "Only if the talent is older",
        "Yes — talent wins championships",
        "No — teamwork beats talent often",
        "Only in the playoffs",
      ],
      correctAnswer: 2,
      explanation: "Teams that move the ball, slide on time, and trust each other beat more talented teams regularly.",
    },
      {
      question: "What does 'doing your job' on a team mean?",
      options: [
        "Doing the coach's job better than her",
        "Trying to score every play you can",
        "Switching positions when bored",
        "Playing your position, trusting teammates",
      ],
      correctAnswer: 3,
      explanation: "Every position depends on the others. When everyone does their part, it works.",
    },
      {
      question: "How does trust between teammates get built?",
      options: [
        "Through reps — reliable effort over time",
        "Through team meetings",
        "Through senior leadership only",
        "Through hanging out off the field",
      ],
      correctAnswer: 0,
      explanation: "Trust is the residue of repetition. Show up, do your job, build the bank.",
    },
      {
      question: "Teammate misses a wide-open shot. The team's reaction?",
      options: [
        "Tell coach to bench her",
        "Clap, say 'next one' — pick her up",
        "Groan and shake heads",
        "Yell for the next play",
      ],
      correctAnswer: 1,
      explanation: "How a team responds to mistakes is its identity. Pick teammates up — always.",
    },
      {
      question: "Down 4-0 in the second quarter. The other team is bigger and faster. Two of your teammates are starting to drop their heads. What's the team-first move?",
      options: [
        "Drop your head too — match the energy",
        "Ask coach to call timeout",
        "Sprint to the next ground ball harder than ever",
        "Tell teammates to stop trying so hard",
      ],
      correctAnswer: 2,
      explanation: "Energy is a choice. One player setting the tempo can flip a team. Compete on the next play.",
      kind: "scenario",
      scenario: "12 minutes in. You're down 4-0. The other team has bigger, older girls. Two teammates are starting to drag.",
    },
    ],
    keyTakeaways: [
      "The most talented team doesn't always win — the team that plays together does.",
      "Doing your job means trusting teammates to do theirs. Don't try to play 3 positions.",
      "Trust is built rep by rep. Every right pass and on-time slide adds to the bank.",
      "Pick teammates up after mistakes — it's how teams respond to errors that decides games.",
    ],
  },
  {
    id: "girls-youth-l10",
    lessonNumber: 10,
    title: "Competing Together",
    topic: "Mental Game",
    pillar: "team",
    description: `Every team faces hard moments. Rain games. Losing streaks. Tough practices. What makes a team special isn't avoiding those moments — it's how you get through them together.\n\nCompeting together means nobody quits. If you're down by a lot, you still play hard on every ground ball. Why? Because your teammates are watching. If you keep fighting, it tells them "we're still in this." If you give up, it tells them it's OK to stop trying. Your effort is contagious — make it positive.\n\nCompeting together means celebrating each other. When a teammate scores, you react like YOU scored. When your goalie makes a save, the whole team gets loud. When your defender causes a turnover, everyone lets her know it mattered. Energy lifts teams — and celebrating together builds that energy.\n\nCompeting together means handling losses as a group. After a tough game, don't point fingers. Don't blame one person. Say "we'll get better" and prove it at the next practice. The best teams don't break when they lose — they learn and come back stronger.\n\nHere's what makes competing together powerful: when you're older, you won't remember the scores. You'll remember your teammates. You'll remember fighting through a cold, windy game and laughing about it on the bus ride home. You'll remember the team that refused to quit. Those memories last forever.`,
    questions: [
      {
      question: "Down 5-0 in the first half. What's the right mindset?",
      options: [
        "Conserve energy for the next game",
        "Blame the goalie for letting them in",
        "Walk through plays quietly",
        "Compete on every play — score doesn't change effort",
      ],
      correctAnswer: 3,
      explanation: "Effort is independent of the scoreboard. Your teammates are watching.",
    },
      {
      question: "Teammate scores a beautiful goal. Best team reaction?",
      options: [
        "Celebrate like YOU scored — energy spreads",
        "Save celebration for the end of the game",
        "Standard nod and run back",
        "Wait to see if it counts first",
      ],
      correctAnswer: 0,
      explanation: "Celebrating loudly together feeds momentum. Quiet teams play tight.",
    },
      {
      question: "After a tough loss, what does the team do?",
      options: [
        "Pretend it didn't happen",
        "Own it together — 'we'll fix it' — and mean it",
        "Skip the next practice to recover",
        "Find someone to blame",
      ],
      correctAnswer: 1,
      explanation: "Tough losses are growth moments — if the team owns them together.",
    },
      {
      question: "What's the difference between competing and winning?",
      options: [
        "Competing only matters in the playoffs",
        "Same thing",
        "Competing means giving full effort regardless of score",
        "Competing is what coaches say when you lose",
      ],
      correctAnswer: 2,
      explanation: "You can compete and lose. You can't grow without competing. Competing is the choice — winning is the byproduct.",
    },
      {
      question: "It's pouring rain, you're tied, 30 seconds left. Your team has to clear the ball under heavy ride pressure. The crowd is loud. What do you focus on?",
      options: [
        "The crowd noise to get hyped",
        "The scoreboard ticking down",
        "Whether the rain is letting up",
        "Your job: my outlet target, my spacing, my next pass",
      ],
      correctAnswer: 3,
      explanation: "Pressure narrows focus. Big moments demand small thinking — do your job, the next 5 seconds, then the next 5.",
      kind: "scenario",
      scenario: "Tied 6-6, 30 seconds left, rain pouring, your team has the ball at your own goal. Goalie just made a save. The other team is riding aggressively.",
    },
    ],
    keyTakeaways: [
      "Hard moments are inevitable — what matters is how the team responds.",
      "When down big, don't quit. Your effort affects every teammate watching.",
      "Celebrate teammates' wins like they're yours. Energy is contagious.",
      "After tough losses: 'we'll get better' — and mean it. No finger-pointing.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
]

const GIRLS_MIDDLE_LESSONS: AcademyLesson[] = [
  {
    id: "girls-middle-l1",
    lessonNumber: 1,
    title: "Positions and Their Roles",
    topic: "Fundamentals",
    pillar: "game",
    description: `By middle school, every player should understand what each position does. This helps you play your own position better and helps you anticipate what teammates will do.\n\nAttack plays in front of the opposing goal. Their job is to score and create scoring chances for teammates. Good attackers have great stick skills, can dodge from any angle, and read defenses to find the open player. They live in the offensive end of the field.\n\nMidfielders play the entire field — both ends. They're the most well-rounded athletes on the team. A great midfielder can score, defend, and play in transition. They run constantly. Most teams play with multiple midfield lines that rotate to keep players fresh.\n\nDefenders play in front of their own goal. Their main job is to stop the other team from scoring by using positioning, footwork, and stick checks. Good defenders are smart, communicative, and know how to force attackers into bad spots. They also start the transition by clearing the ball up to the offense.\n\nThe goalie is the last line of defense. She wears extra protection and uses a stick with a much bigger head. Goalies need to be brave (the ball is hard and fast), have great hand-eye coordination, and most importantly — they need to be loud. The goalie sees the whole field and directs the defense.\n\nUnderstanding what every position does makes you smarter on the field. When you know what your defender's job is, you can help her. When you know what your goalie sees, you can position yourself to support.`,
    questions: [
      {
      question: "How many attackers does girls lacrosse field?",
      options: [
        "4",
        "6",
        "3",
        "5",
      ],
      correctAnswer: 0,
      explanation: "Four attackers: First Home, Second Home, Third Home, two Attack Wings.",
    },
      {
      question: "Which midfielder usually takes the draw?",
      options: [
        "Right wing",
        "Center — strongest draw taker",
        "Left wing",
        "Whoever wants to",
      ],
      correctAnswer: 1,
      explanation: "Center is the primary draw taker — usually the strongest in that battle.",
    },
      {
      question: "What is 'Cover Point'?",
      options: [
        "A forward who covers the goal",
        "A midfielder",
        "A defender who marks the opposing 1st Home",
        "Another name for the goalie",
      ],
      correctAnswer: 2,
      explanation: "Cover Point covers the opposing 1st Home — usually the most dangerous attacker.",
    },
      {
      question: "What's the role of an Attack Wing?",
      options: [
        "Take faceoffs",
        "Score from outside the 8m only",
        "Stay in the goalie's crease",
        "Provide width on offense + transition",
      ],
      correctAnswer: 3,
      explanation: "Attack wings stretch the offense wide and run hard in transition both ways.",
    },
      {
      question: "Coach moves you from defense wing to second home (an attacker) for the next game. You've never played offense. First move?",
      options: [
        "Watch second-home film, learn cuts, ask experienced attackers what they need",
        "Quit the team",
        "Refuse to dodge in the game",
        "Argue — defense is your spot",
      ],
      correctAnswer: 0,
      explanation: "Position changes are growth opportunities. Film + reps + asking. Adaptable players earn more roles.",
      kind: "scenario",
      scenario: "Coach pulls you aside Friday: she needs you at second home for Saturday's game. You've played defense wing your whole life.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=UGRkkLFv-Vw",
    keyTakeaways: [
      "12 positions: 4 attackers, 3 midfielders, 4 defenders, 1 goalie.",
      "First Home (point), Second Home, Third Home, Attack Wing — distinct attacker roles.",
      "Defense: Point, Cover Point, Third Home, Defensive Wing — each with positioning rules.",
      "Midfielders run both ways and take the draw. Centers are usually the strongest draw takers.",
    ],
    diagrams: [
      {
        title: "Girls Field — All 12 Positions",
        view: "women-full",
        caption: "Four attackers (red): First Home (top), Second/Third Home, Attack Wings. Three middies (yellow). Four defenders (blue): Point, Cover Point, Third Home, Defense Wing. Goalie (green) inside the crease.",
        players: [
          {
            x: 25,
            y: 80,
            role: "attack",
            label: "AW"
          },
          {
            x: 50,
            y: 78,
            role: "attack",
            label: "1H"
          },
          {
            x: 75,
            y: 80,
            role: "attack",
            label: "AW"
          },
          {
            x: 50,
            y: 70,
            role: "attack",
            label: "2H"
          },
          {
            x: 30,
            y: 55,
            role: "midfield",
            label: "M"
          },
          {
            x: 50,
            y: 55,
            role: "midfield",
            label: "C"
          },
          {
            x: 70,
            y: 55,
            role: "midfield",
            label: "M"
          },
          {
            x: 25,
            y: 30,
            role: "defense",
            label: "DW"
          },
          {
            x: 50,
            y: 32,
            role: "defense",
            label: "P"
          },
          {
            x: 75,
            y: 30,
            role: "defense",
            label: "DW"
          },
          {
            x: 50,
            y: 22,
            role: "defense",
            label: "CP"
          },
          {
            x: 50,
            y: 15,
            role: "goalie",
            label: "G"
          },
        ],
        legend: [
          {
            label: "Attack",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Midfield (Center=draw taker)",
            color: "#EAB308",
            shape: "circle"
          },
          {
            label: "Defense",
            color: "#2563EB",
            shape: "square"
          },
          {
            label: "Goalie",
            color: "#10B981",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-middle-l2",
    videoUrl: "https://www.youtube.com/watch?v=7deaRXF70Q8",
    lessonNumber: 2,
    title: "Dodging in the Girls Game",
    topic: "Fundamentals",
    pillar: "game",
    description: `A dodge is how you beat your defender one-on-one to create space for a shot or a pass. At the middle school level, you need to master three main dodges and understand when to use each one.\n\nDODGE BREAKDOWN\n\n1. The Face Dodge\nDrive at your defender, bring your stick across your face like you're going to switch hands — but DON'T switch. The defender reaches for the fake and you blow past on the same side. This is the fastest dodge because you don't lose any speed.\n\n2. The Roll Dodge\nDrive into your defender, plant your inside foot, and roll backwards away from them — protecting your stick the whole time. As you come out of the roll, you should be facing the goal with the defender behind you. Use this when a defender is playing you tight and physical.\n\n3. The Rocker Dodge\nA hesitation move. You start to drive one direction, "rock" back (shift your weight backward as if changing direction), then explode forward past the defender. The rocker works because the defender reacts to your change of direction and gets caught flat-footed.\n\n4. The Crease Dodge\nUsed specifically around the crease (goal area). Receive the ball on one side of the crease, fake to that side, then sweep across the crease to the other side for a shot. This requires good footwork and stick protection.\n\nTHE KEY TO EVERY DODGE\nChange of speed. You MUST go from slow to fast in one explosive step. A dodge at one speed is useless — the defender just runs with you. The explosion is what creates separation.\n\nCOACHING POINTS\n- Sell the first move with your body, not just your stick\n- Attack the "top foot" of the defender — force her to turn her hips\n- Practice each dodge 10 times per hand at every practice`,
    questions: [
      {
      question: "Most important element of any dodge?",
      options: [
        "How fancy the move is",
        "Change of speed — slow to fast in one step",
        "Switching hands fast",
        "How loud you yell",
      ],
      correctAnswer: 1,
      explanation: "Change of pace creates separation. A flashy dodge at one speed doesn't work.",
    },
      {
      question: "Inside the 8m, what should dodgers be aware of?",
      options: [
        "Time and room rules",
        "Crease violation",
        "Shooting space — drawing the D into your shot path = free position",
        "Drawing position",
      ],
      correctAnswer: 2,
      explanation: "Inside the 8m, defender in your shooting lane = foul. You can earn free positions by reading this.",
    },
      {
      question: "Roll dodge is best against:",
      options: [
        "A wide-open defender",
        "Only goalies",
        "An older defender",
        "A defender right on your hip mirroring you",
      ],
      correctAnswer: 3,
      explanation: "Roll dodges work when defenders are tight on you. Plant, roll, protect stick.",
    },
      {
      question: "Face dodge differs from split dodge how?",
      options: [
        "Fakes the switch but keeps same hand",
        "Switches hands twice",
        "Only used at midfield",
        "Doesn't change direction",
      ],
      correctAnswer: 0,
      explanation: "Face dodge fakes the switch — fastest because no speed loss.",
    },
      {
      question: "Tight defender on your right hip, mirroring every move. You can't get separation. What dodge?",
      options: [
        "Split dodge — switch hands and go opposite",
        "Roll dodge — plant, roll backwards, protect stick",
        "Slow down and pass it back",
        "Face dodge — fake switch, blow by",
      ],
      correctAnswer: 1,
      explanation: "Tight, mirroring defender = roll dodge. Plant inside foot, roll away, stick protected.",
      kind: "scenario",
      scenario: "1v1 at the top of the 8m. Defender is glued to your right hip. Every move you make, she mirrors.",
    },
    ],
    keyTakeaways: [
      "Three core dodges: split, roll, face. Each beats a different defender posture.",
      "In girls — be aware of shooting space. Don't dodge into a defender if it puts her in your shot path inside the 8m.",
      "Change of pace > flashy move. Slow → fast in one step is what creates separation.",
      "Use the 8m and 12m as reference points. Defenders can't legally crowd inside there.",
    ],
    diagrams: [
      {
        title: "Split Dodge into the 8m",
        view: "women-half-offensive",
        caption: "Attack toward the 8m, plant inside foot, switch hands, explode opposite direction. Inside the 8m, watch shooting space — you can earn a free position by drawing a defender into your shot path.",
        players: [
          {
            x: 50,
            y: 50,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 50,
            y: 60,
            role: "defender",
            label: "D"
          },
          {
            x: 25,
            y: 65,
            role: "offense",
            label: "2"
          },
          {
            x: 75,
            y: 65,
            role: "offense",
            label: "3"
          },
        ],
        arrows: [
          {
            from: {
              x: 50,
              y: 50
            },
            to: {
              x: 50,
              y: 62
            },
            kind: "run",
            label: "1. Attack"
          },
          {
            from: {
              x: 50,
              y: 62
            },
            to: {
              x: 35,
              y: 75
            },
            kind: "run",
            curve: -8,
            label: "2. Split"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-middle-l3",
    videoUrl: "https://www.youtube.com/watch?v=3f3EEGr6WZk",
    lessonNumber: 3,
    title: "Defensive Footwork",
    topic: "Fundamentals",
    pillar: "game",
      position: "defense",
    description: `Good defense in girls lacrosse starts with your feet, not your stick. The best defenders move their feet, stay in position, and force the ball carrier into bad spots.\n\nDEFENSIVE FUNDAMENTALS\n\n1. Breakdown Position\nKnees bent, weight on the balls of your feet, hips low, stick out in a "check-ready" position. This is your defensive stance. Standing upright is the worst thing a defender can do — you lose all reaction time.\n\n2. Footwork: Shuffle, Don't Cross\nWhen the attacker moves, you slide-step. Never cross your feet. Slide left, slide right, always keeping your hips square to the ball carrier. Crossing your feet means losing balance and getting beat.\n\n3. Approach Angle\nWhen closing out on a ball carrier, approach at an angle that forces her to one side. Don't run straight at her — she'll dodge around you. Take away one side and force her to the other.\n\n4. Stick Positioning\nKeep your stick in a "check-ready" position — up and active, ready for a controlled check on the stick side. In girls lacrosse, checks must be controlled and directed at the stick, not the body. Wild swings get flagged.\n\nDEFENSIVE COMMUNICATION — THE VOCABULARY\nEvery defender needs to know these calls:\n- "Ball!" — I'm defending the ball carrier\n- "Help!" or "Help right/left!" — I'm one slide away, ready to help\n- "Ball up top!" — Ball is at the top of the 12-meter\n- "Ball low!" — Ball is at X (behind the goal)\n- "Crash!" — Immediate help needed, slide NOW\n\nCOACHING POINTS\n- If you can communicate when you're tired, you can communicate any time\n- Stay between your player and the goal — that's the #1 rule of defense\n- Defense is 80% positioning, 20% stick checks`,
    questions: [
      {
      question: "Cardinal rule of girls defense?",
      options: [
        "Run to ball first",
        "Always check hard",
        "Stay between attacker and goal",
        "Stand tall to look bigger",
      ],
      correctAnswer: 2,
      explanation: "Body position between attacker and goal is the foundation.",
    },
      {
      question: "Inside the 8m, what's required of defenders?",
      options: [
        "Stick up at all times",
        "Must double-team the ball",
        "Goalie call only",
        "Must be marking up — no standing in shot lanes",
      ],
      correctAnswer: 3,
      explanation: "Standing in a shot lane = shooting space foul = free position for offense.",
    },
      {
      question: "What is shooting space?",
      options: [
        "Path between attacker and goal that defenders can't block",
        "Space inside the crease",
        "Where the goalie can stand",
        "Distance from sideline to goal",
      ],
      correctAnswer: 0,
      explanation: "Defenders can't stand in the shooter's lane to the goal inside 8m.",
    },
      {
      question: "Stick check rules in girls?",
      options: [
        "Only on the way to the ball",
        "Controlled checks; no checking the head/face/body",
        "Only the goalie can check",
        "Anything goes — full swings allowed",
      ],
      correctAnswer: 1,
      explanation: "Controlled checks. Anything down through the head/body = foul.",
    },
      {
      question: "Attacker drives toward the 8m on your right. She's faster than you. How do you defend?",
      options: [
        "Reach in with your stick to slow her",
        "Stand still and wait",
        "Slide-step, force her wide — bad shot angle",
        "Drop into the crease",
      ],
      correctAnswer: 2,
      explanation: "Force her wide. The wider she goes, the worse the shot angle gets — and the more time your help has to arrive.",
      kind: "scenario",
      scenario: "Right-side dodge. Attacker is faster than you. She's heading toward the 8m looking to drive.",
    },
    ],
    keyTakeaways: [
      "Defense is footwork first. Move feet, not stick.",
      "Inside the 8m, you MUST be marking up (covering an attacker). No standing in shot lanes — that's shooting space.",
      "Stick checks must be controlled — checking down through the head/face = foul.",
      "Stay between attacker and goal. Force her wide where shot angles get bad.",
    ],
    diagrams: [
      {
        title: "Inside-8m Defense — Shooting Space Awareness",
        view: "women-half-defensive",
        caption: "Inside 8m, every defender must be marking an attacker. The yellow zone is 'shooting space' — defenders can't stand in the path between an attacker and the goal.",
        zones: [
          {
            shape: "rect",
            x: 35,
            y: 65,
            w: 30,
            h: 17,
            color: "#FACC15",
            label: "DANGER ZONE"
          },
        ],
        players: [
          {
            x: 50,
            y: 70,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 47,
            y: 78,
            role: "defender",
            label: "Da"
          },
          {
            x: 60,
            y: 75,
            role: "defender",
            label: "Db"
          },
          {
            x: 40,
            y: 78,
            role: "defender",
            label: "Dc"
          },
        ],
        arrows: [
          {
            from: {
              x: 50,
              y: 70
            },
            to: {
              x: 50,
              y: 82
            },
            kind: "shot",
            label: "Shot lane"
          },
        ],
        legend: [
          {
            label: "Attacker",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-middle-l4",
    lessonNumber: 4,
    title: "Reading the Field — Lacrosse IQ",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Lacrosse IQ — your ability to read the field — is what separates good players from great ones. Great players don't just react to what's happening. They anticipate what's about to happen.\n\nWhen you have the ball, you should already know where every teammate and every defender is BEFORE you make your move. Scan the field as you receive the ball. Where are your teammates? Where is open space? Where is the defense weak? The best players see the whole field at once.\n\nWhen you don't have the ball, watch the player with the ball AND the defenders around her. Anticipate where the next play will go. If a teammate is being doubled, get open for an outlet pass. If the defense is sliding, expect that you might be left open — be ready.\n\nOn defense, watch the offensive player's eyes. Eyes usually telegraph where the ball is going to be passed. If you can read eyes, you can intercept passes. Body position, stick position, and shoulder angle all give clues too.\n\nLacrosse IQ comes from two things: experience (the more you play, the more patterns you recognize) and film study (watching games and analyzing what good players do). Start watching college lacrosse on YouTube — Maryland, Northwestern, North Carolina, Boston College, Syracuse all have great game film online.\n\nWatch with curiosity. Pause when something interesting happens. Why did she cut there? Why did the defender slide? Where was the open space? This kind of active watching builds your IQ faster than just playing alone.`,
    questions: [
      {
      question: "What's the IQ marker that separates good players from great?",
      options: [
        "Greats run faster",
        "Greats are taller",
        "Greats have nicer sticks",
        "Greats anticipate, not just react",
      ],
      correctAnswer: 3,
      explanation: "Anticipation — seeing the play before it happens — is the IQ marker.",
    },
      {
      question: "Watching film, what should you focus on?",
      options: [
        "Off-ball movement — that's the lesson",
        "Just the goalie's saves",
        "Just the ball at all times",
        "The scoreboard",
      ],
      correctAnswer: 0,
      explanation: "Off-ball movement teaches positioning, anticipation, team play.",
    },
      {
      question: "On defense, what tells you where the attacker will pass?",
      options: [
        "Their hair color",
        "Their eyes — they look where they're throwing",
        "How they hold their stick",
        "Their feet and stride",
      ],
      correctAnswer: 1,
      explanation: "Eyes telegraph passes. Reading them = interceptions.",
    },
      {
      question: "When shooting, what should you look at last?",
      options: [
        "The crowd",
        "Your own stick",
        "The goalie's stick position",
        "The defender's stick",
      ],
      correctAnswer: 2,
      explanation: "Goalie's stick position tells you the open corner. Read before you shoot.",
    },
      {
      question: "You catch a feed at the top of the 8m. As you turn, you see the crease defender step toward you — clearly preparing to slide. What do you do?",
      options: [
        "Shoot from where you are",
        "Dodge harder, ignore the slide",
        "Pass back to where you got the ball",
        "Pass to the crease attacker the slider just left",
      ],
      correctAnswer: 3,
      explanation: "Slide left a player open. Pass to her — that's a layup. Forcing the dodge into the slide is a turnover.",
      kind: "scenario",
      scenario: "You catch a feed top of the 8m. As you turn to shoot, you see the crease defender's hips turn toward you — she's about to slide.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=4LHsrseSKak",
    keyTakeaways: [
      "Lacrosse IQ = anticipating, not just reacting.",
      "Read the goalie before you shoot — her stick position tells you the open corner.",
      "Read defender hips. Where their hips face is where they're committing.",
      "Watch off-ball cuts and re-defines on film — that's where elite IQ is built.",
    ],
    diagrams: [
      {
        title: "Reading the Goalie — Shot Selection",
        view: "women-half-offensive",
        caption: "Goalie's stick position telegraphs her cover. Stick up = top corners are tight, low corners open. Stick low = opposite. Read in your last two strides before shooting.",
        players: [
          {
            x: 50,
            y: 65,
            role: "offense",
            label: "S",
            ball: true,
            highlight: true
          },
          {
            x: 50,
            y: 82,
            role: "goalie",
            label: "G"
          },
        ],
        arrows: [
          {
            from: {
              x: 50,
              y: 65
            },
            to: {
              x: 35,
              y: 82
            },
            kind: "shot",
            label: "Low corner"
          },
          {
            from: {
              x: 50,
              y: 65
            },
            to: {
              x: 65,
              y: 82
            },
            kind: "shot",
            label: "Low corner"
          },
        ],
        labels: [
          {
            x: 50,
            y: 76,
            text: "Read goalie stick",
            size: "xs"
          },
        ],
        legend: [
          {
            label: "Shooter",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Goalie",
            color: "#10B981",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-middle-l5",
    lessonNumber: 5,
    title: "Mental Toughness Under Pressure",
    topic: "Mental Game",
    pillar: "team",
    description: `Mental toughness is what keeps you playing your best when things get hard. Every player has good games. The mentally tough players have good games AND bad games — and they fight just as hard in both.\n\nHere's what mental toughness looks like in middle school lacrosse:\n\nWhen you make a mistake, you reset. You don't dwell on it. You don't drop your head. You don't look at the bench like "sorry coach." You take a breath, refocus, and play the next play. The hardest thing in sports is letting go of a mistake fast. The best players let go in seconds.\n\nWhen the ref makes a bad call, you don't argue. You don't whine. You play harder on the next play. Refs make mistakes — it's part of the game. Players who complain lose focus. Players who shake it off and compete are the ones who win.\n\nWhen you're tired, you push through. The end of games is when winners separate from losers. Most players slow down when they're tired. The mentally tough player speeds up — because she knows everyone else is slowing down. That's your edge.\n\nWhen you're losing, you don't quit. Down 6-0? Compete on every ground ball like it's 0-0. Play defense like every save matters. Mentally tough players don't care about the score — they care about the next play. You can't change the score, but you can change how hard you play right now.\n\nMental toughness is a muscle. The more you practice it in small moments — finishing one extra rep, running one more sprint, staying focused after a bad play — the stronger it gets. Train it like any other skill.`,
    questions: [
      {
      question: "After a mistake, what's the tough-player move?",
      options: [
        "Reset fast — focus on next play",
        "Argue with the ref",
        "Find a teammate to blame",
        "Drop your head until next sub",
      ],
      correctAnswer: 0,
      explanation: "Mentally tough players let go of mistakes in seconds.",
    },
      {
      question: "When does mental toughness actually get tested?",
      options: [
        "When you're winning easy",
        "When tired, losing, or frustrated",
        "When everything is going well",
        "Only at championship games",
      ],
      correctAnswer: 1,
      explanation: "Toughness is built and shown in adversity.",
    },
      {
      question: "Down 7-1 in the third. Right mindset?",
      options: [
        "Conserve energy for next game",
        "Try to score 6 yourself",
        "Compete on every play — score doesn't change effort",
        "Take it easy to avoid injury",
      ],
      correctAnswer: 2,
      explanation: "Effort is independent of the scoreboard.",
    },
      {
      question: "Why do tough players get FASTER in the 4th quarter?",
      options: [
        "Better conditioning than everyone",
        "The whistle motivates them",
        "Coaches force them to sprint",
        "Most opponents slow down — that's the edge",
      ],
      correctAnswer: 3,
      explanation: "Holding pace while opponents slow = relative speed gain. That's the gap.",
    },
      {
      question: "Bad call wipes out your goal. Crowd is yelling. Teammates are arguing. 30 seconds later: ground ball at midfield. What do you do?",
      options: [
        "Sprint to the ground ball — next play",
        "Stand and wait for someone else to get it",
        "Walk over to argue with coach",
        "Yell at the ref about the bad call",
      ],
      correctAnswer: 0,
      explanation: "Tough players play through bad calls. Sprint to the ball — that's how you flip momentum.",
      kind: "scenario",
      scenario: "Late 3rd. Bad call wiped out your team's goal. Crowd's angry, teammates arguing. Ground ball loose at midfield.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    keyTakeaways: [
      "Mistakes are inevitable. Tough players reset in seconds — don't dwell.",
      "When tired, push HARDER — everyone else is slowing down. That's your edge.",
      "Don't argue with refs. It costs focus and rarely changes the call.",
      "Score doesn't dictate effort. Compete play to play, not based on the scoreboard.",
    ],
  },
  {
    id: "girls-middle-l6",
    lessonNumber: 6,
    title: "Becoming a Leader",
    topic: "Character",
    pillar: "leadership",
    description: `Leadership in middle school lacrosse isn't about wearing a captain's armband. It's not about being the loudest in the huddle. Real leadership is how you act when no one is paying attention.\n\nThe biggest myth about leadership is that you have to be the best player. You don't. Some of the best leaders on great teams are bench players who bring incredible energy at every practice. Leadership is a choice anyone can make.\n\nHere's what middle school leadership looks like:\n\nYou show up early. You stay late. You're the one who picks up balls without being told. You sprint hard in conditioning even when no one is watching the back of the line. You set the standard with your actions, not your words.\n\nYou pick up teammates. When a teammate makes a mistake, you're the first to say "shake it off, I got you." When she scores, you're the first to celebrate. When practice is grinding and everyone is tired, you're the one who picks up the energy.\n\nYou don't talk behind anyone's back. Real leaders don't gossip about teammates, complain about coaches, or make excuses. If you have a problem, you talk directly to the person. Leaders build trust — and trust is built through honesty.\n\nYou take coaching well. Leaders don't argue with feedback. They say "got it, coach" and apply it on the next rep. When teammates see you take coaching, they learn to do the same.\n\nDo these things and your coaches will notice. Your teammates will notice. And one day when there's a hard moment in a game and the team needs someone to step up, everyone will look at you — because you've already been leading the whole time.`,
    questions: [
      {
      question: "Do you need to be a starter to be a leader?",
      options: [
        "Only if you wear a captain's C",
        "No — leadership is a choice anyone makes",
        "Only seniors lead",
        "Yes — only starters lead",
      ],
      correctAnswer: 1,
      explanation: "Effort and example don't require status.",
    },
      {
      question: "Real leaders handle teammate problems by...",
      options: [
        "Talking behind their backs",
        "Telling other teammates first",
        "Going directly to the person to fix it",
        "Letting it stay unresolved",
      ],
      correctAnswer: 2,
      explanation: "Direct, honest communication builds trust. Gossip destroys it.",
    },
      {
      question: "Biggest leadership tell at practice?",
      options: [
        "Wearing the best gear",
        "Being friends with the coach",
        "Being loudest in the huddle",
        "Setting the standard with action — first, focused",
      ],
      correctAnswer: 3,
      explanation: "Actions are visible. Words alone don't lead.",
    },
      {
      question: "Coach gives you tough feedback in front of the team. Best response?",
      options: [
        "'Got it, coach' — apply it on the next rep",
        "Argue calmly until coach agrees",
        "Roll your eyes and take it later",
        "Defend yourself with explanations",
      ],
      correctAnswer: 0,
      explanation: "Taking coaching well shows the team how to handle it. Big leadership signal.",
    },
      {
      question: "You're a sophomore. A senior teammate is loafing through warm-ups. Captain isn't on the field yet. What's the move?",
      options: [
        "Match the senior's energy — fit in",
        "Sprint and stay ready — your example pulls others",
        "Wait for the captain to handle it",
        "Tell coach about the senior",
      ],
      correctAnswer: 1,
      explanation: "Leadership doesn't wait for permission. Set the standard with effort — others follow.",
      kind: "scenario",
      scenario: "Saturday warm-ups. Senior is jogging at 50%. Captain in the bathroom. Coach at other end of field.",
    },
    ],
    keyTakeaways: [
      "You don't need a 'C' to lead. Leadership is action, not status.",
      "Show up early, stay late, pick up balls — set the standard with behavior.",
      "Pick teammates up after mistakes. Be the first voice they hear.",
      "Take coaching well. Saying 'got it' and applying feedback fast is contagious.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
  },
  {
    id: "girls-middle-l7",
    lessonNumber: 7,
    title: "Finding Your Voice",
    topic: "Character",
    pillar: "leadership",
    description: `By middle school, lacrosse becomes a talking game. The teams that communicate win. The teams that stay silent lose. Finding your voice on the field is one of the most important things you can do right now.\n\nWHAT TO SAY AND WHEN\n\nOn Defense:\n- "Ball!" — You're defending the ball carrier\n- "Help!" or "Help right!" / "Help left!" — You're one slide away and ready from that side\n- "Ball up top!" — Telling teammates where the ball is (top of the 12-meter)\n- "Ball low!" — Ball is at X (behind the goal)\n- "Crash!" — Immediate help needed, slide NOW\n- "Recover!" — The threat is over, get back to your player\n\nOn Offense:\n- "I'm open!" — You're free for a pass\n- "Switch!" — Trade assignments\n- "Release!" — You're cutting and want the ball\n\nOn Draws:\n- "Mine!" — You're going for the ball\n- "Crash!" — Wings: go get it\n\nThe hardest part is that it feels awkward at first. You might feel self-conscious yelling on the field. Here's what's true: nobody judges you for communicating. Your coaches WANT you to talk. Your teammates NEED you to talk. The only person who thinks it's weird is you — and that feeling goes away fast.\n\nStart small. Pick one thing to call out at every practice — just "Ball!" when you're sliding. Once that's natural, add another call. Then another. Before long you'll be one of the loudest players on the field.\n\nCOACHING POINTS\n- Talking when you're tired is the real test — if you can communicate tired, you can communicate any time\n- Communication goes beyond play calls: "Nice cut!" "Great save!" "Shake it off, you got it!"\n- The girl who communicates well makes everyone around her better`,
    questions: [
      {
      question: "Good on-field communication sounds like:",
      options: [
        "Random shouting",
        "Only after coach yells first",
        "Specific calls — 'I got ball', 'Slide', 'Cutter'",
        "Whispered to nearest teammate",
      ],
      correctAnswer: 2,
      explanation: "Specific, timely info that helps teammates make decisions.",
    },
      {
      question: "On defense, what does 'I'm hot' mean?",
      options: [
        "I'm covering the ball",
        "I want a sub",
        "I'm shooting next",
        "I'm the first slide",
      ],
      correctAnswer: 3,
      explanation: "'I'm hot' = I'm the first slide.",
    },
      {
      question: "When should an offensive player yell 'Shot!'?",
      options: [
        "Before the shot, so teammates crash for rebound",
        "Whenever they touch the ball",
        "Only on missed shots",
        "After the ball goes in",
      ],
      correctAnswer: 0,
      explanation: "Calling shot lets teammates crash the crease for the backup.",
    },
      {
      question: "If communicating feels awkward at first, what's the move?",
      options: [
        "Wait for a captain to start",
        "Pick one call and practice until natural",
        "Only talk in games",
        "Skip it — wait until older",
      ],
      correctAnswer: 1,
      explanation: "Start small. One call at a time builds the habit.",
    },
      {
      question: "Late game. You're on D. Your mark cuts behind the goal. The defender next to you is now responsible — but she's looking the wrong way. What do you yell?",
      options: [
        "'I got her' even though you don't",
        "Stay quiet — let her figure it out",
        "'Switch! Your mark, behind!'",
        "'Coach! Sub!'",
      ],
      correctAnswer: 2,
      explanation: "Specific, urgent call. Teammate gets info she needs RIGHT NOW. Silence = goal.",
      kind: "scenario",
      scenario: "Late 4th. Your mark cuts behind the goal — out of your zone. The next defender is responsible but staring at the ball.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=XLpXy_AOCfg",
    keyTakeaways: [
      "Lacrosse is a talking game. Quiet teams lose.",
      "Defense calls: 'I got ball', 'I'm hot' (1st slide), 'I got two', 'Mark up!' (8m).",
      "Offense calls: 'I'm open', 'Cutter!', 'Time', 'Shot' (so teammates crash for rebound).",
      "Talking when tired is the real test. If you can talk tired, you can talk anytime.",
    ],
  },
  {
    id: "girls-middle-l8",
    lessonNumber: 8,
    title: "Owning Your Role",
    topic: "Character",
    pillar: "leadership",
    description: `Not every player is the leading scorer. Not every player starts. But every player has a role — and the teams that win are the ones where every girl OWNS her role completely.\n\nMaybe you're the defender who shuts down the other team's best player. Maybe you're the midfielder who wins draw controls. Maybe you're the sub who brings fresh energy every time you check in. Whatever your role, commit to it fully.\n\nOwning your role means two things. First, understand what your coaches need from you. If you're on defense, your job is to stop the ball — not to score. If you're a backup, your job is to push the starters in practice. Ask your coach: "What do you need from me?" That question shows maturity beyond your years.\n\nSecond, maximize your role. Don't just accept it — dominate it. If you get 5 minutes of playing time, make those 5 minutes count. If you're on the sideline, be the loudest cheerleader. If you're the role player, be the BEST role player on the team.\n\nWhat coaches notice: the player who does her job without complaining, without needing credit, without sulking. That girl earns more trust and more responsibility over time. The girl who complains about playing time, refuses the small jobs, or pouts when she doesn't start? She stays where she is.\n\nGreat teams need everyone bought in. Not everyone can score 5 goals. But everyone can do their job at 100%.`,
    questions: [
      {
      question: "If you're not a starter, what's the right approach?",
      options: [
        "Ask to switch teams",
        "Stop trying as hard",
        "Complain until you start",
        "Own your role and maximize it",
      ],
      correctAnswer: 3,
      explanation: "Maximize what you're given. That's how you earn more.",
    },
      {
      question: "Best question to ask your coach?",
      options: [
        "'What do you need from me?'",
        "'Why am I not starting?'",
        "'When can I leave practice?'",
        "'Can I play a different position?'",
      ],
      correctAnswer: 0,
      explanation: "Asking what the team needs shows maturity and earns trust.",
    },
      {
      question: "What do coaches notice about role players?",
      options: [
        "Only the ones who score",
        "The ones who do their job fully without needing credit",
        "The ones who complain loudly",
        "Only the tallest kids",
      ],
      correctAnswer: 1,
      explanation: "Coaches reward players who commit to their role fully.",
    },
      {
      question: "What does a 'best role player' look like in practice?",
      options: [
        "Same speed as starters in every drill",
        "Only competes when scouts are there",
        "Goes harder than starters, makes them better",
        "Coasts because reps don't matter",
      ],
      correctAnswer: 2,
      explanation: "Bench players who push starters in practice make the whole team better.",
    },
      {
      question: "You only play 5 minutes a game. Coach has rotations set. What's the move?",
      options: [
        "Stop trying as hard in practice",
        "Ask to play a different position",
        "Sulk on the bench until your shift",
        "Make those 5 minutes the hardest 5 minutes the other team sees",
      ],
      correctAnswer: 3,
      explanation: "5 minutes of full-throttle effort earns more minutes. Sulking earns less. Coaches see the difference.",
      kind: "scenario",
      scenario: "Mid-season. You've gotten 5-6 minutes a game while teammates start. Tonight's matchup is winnable. Coach rotates you in.",
    },
    ],
    keyTakeaways: [
      "Every player has a role. Owning it fully is what coaches reward.",
      "Ask coach: 'What do you need from me?' — best question you can ask.",
      "Maximize your role. Best role player > complaining starter.",
      "Coaches notice the kid who does her job without complaining. That kid earns more over time.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
  },
  {
    id: "girls-middle-l9",
    lessonNumber: 9,
    title: "Trust on the Field",
    topic: "Mental Game",
    pillar: "team",
    description: `Trust is the foundation of every great team. When you trust your teammates, you play faster, smarter, and harder. When you don't, you hesitate, try to do everything alone, and the team breaks down.\n\nWhat does trust look like on a girls lacrosse field?\n\nOn offense, trust means making the extra pass. When you see a teammate cutting, you throw the ball because you TRUST her to catch and finish. If you don't trust her, you dodge again and try to score yourself. One way builds the team. The other makes you a ball hog.\n\nOn defense, trust means sliding when you need to. You leave your own player open because you trust the next defender to rotate and cover. If everyone trusts the system, the slides work. If anyone hesitates, the whole defense falls apart.\n\nOn draws, trust means everyone executing their role. The center needs her wings to crash correctly. The wings need the center to control the ball. When everyone trusts the plan, draws become consistent.\n\nTrust is built in practice, not games. Every rep where you pass and your teammate catches it builds trust. Every slide that arrives on time builds trust. Every practice where everyone shows up and works hard builds trust. It's repetition plus reliability.\n\nThe opposite of trust is trying to do everything yourself. The girl who dodges every possession because she doesn't trust anyone might score some goals — but her team will never reach its potential. The best players make everyone around them better.`,
    questions: [
      {
      question: "How is trust between teammates built?",
      options: [
        "Through reps — reliable effort over time",
        "Through hanging out off the field",
        "Through team meetings",
        "Through the captain's leadership alone",
      ],
      correctAnswer: 0,
      explanation: "Trust is the residue of repetition.",
    },
      {
      question: "Trust on offense looks like:",
      options: [
        "Passing only to the best player",
        "Making the extra pass to the open mark",
        "Dodging every time you touch the ball",
        "Holding ball to control tempo",
      ],
      correctAnswer: 1,
      explanation: "Trusting teammates means sharing the ball — even if you could shoot.",
    },
      {
      question: "What happens when a defense doesn't trust each other?",
      options: [
        "It doesn't really affect performance",
        "Goalie has to make more saves",
        "Players hesitate on slides, defense breaks",
        "They become more aggressive",
      ],
      correctAnswer: 2,
      explanation: "Hesitation on slides = open shots = goals against.",
    },
      {
      question: "Sign that a team has high trust?",
      options: [
        "Loud captain in every huddle",
        "Coach yells less in games",
        "Wearing matching cleats",
        "Ball moves fast — extra passes for better shots",
      ],
      correctAnswer: 3,
      explanation: "Quick ball movement = trust. Players believe the next teammate will catch and shoot.",
    },
      {
      question: "1v1 at the top of the 8m. You see your second home wide open inside. You also have a tight shot. The trust move?",
      options: [
        "Skip pass inside to the wide-open second home",
        "Hold the ball and wait",
        "Take your shot — you have it",
        "Pass back to the midfielder behind you",
      ],
      correctAnswer: 0,
      explanation: "Wide-open inside > tight outside shot every time. Make the trust pass — your team gets a layup.",
      kind: "scenario",
      scenario: "Top of 8m, 1v1. You're a decent shooter from there. But your second home has slipped her mark and is wide open inside.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=7uDxcG8BXZ8",
    keyTakeaways: [
      "Trust = playing fast and hard because you believe teammates will do their job.",
      "On offense: trust = making the extra pass. Without trust, players try to do it all alone.",
      "On defense: trust = sliding aggressively. Without trust, slides come late and break down.",
      "Trust is built in practice — every right pass, every on-time slide adds to the bank.",
    ],
  },
  {
    id: "girls-middle-l10",
    lessonNumber: 10,
    title: "Winning and Losing Together",
    topic: "Mental Game",
    pillar: "team",
    description: `Great teams handle wins and losses the same way — as a group. No one player wins a game, and no one player loses one. Understanding this makes you a better teammate.\n\nWhen you win, celebrate together. The goal scorer needed the assist. The assist needed the draw control. The draw control needed the wings. Every goal is the result of multiple players doing their jobs. Make sure everyone feels like they contributed — because they did.\n\nWhen you lose, own it together. This is the hard part. After a tough loss, it's tempting to think "if she didn't miss that shot" or "if the goalie saved that one." Stop. A game is decided by hundreds of plays, not just one. The team won together or lost together — period.\n\nThe worst thing a team can do is blame one person. That destroys trust instantly. When one player becomes the scapegoat, everyone else stops taking risks because nobody wants to be blamed next. Fear makes teams play tight and timid.\n\nThe best response to a loss is simple: be honest about what went wrong, stay positive about what you're going to fix, and come back to practice ready to work. Say "we'll be better" and then actually put in the effort to be better. That's how good teams become great teams.\n\nHow a team handles adversity together defines who they are. The teams that grow through tough moments are the ones that build something nobody can take away from them.`,
    questions: [
      {
      question: "After a tough loss, who should take the blame?",
      options: [
        "The kid who missed the last shot",
        "Nobody alone — the team owns it together",
        "The goalie if shots got in",
        "The coach for not adjusting",
      ],
      correctAnswer: 1,
      explanation: "Games are decided by hundreds of plays. Blaming one person destroys trust.",
    },
      {
      question: "Why is blaming one teammate after a loss harmful?",
      options: [
        "It's not really that bad",
        "Only matters if it happens repeatedly",
        "It makes the team afraid to take risks",
        "Coaches don't notice",
      ],
      correctAnswer: 2,
      explanation: "Fear of being the scapegoat makes teams play tight and cautious.",
    },
      {
      question: "Best response to a tough loss?",
      options: [
        "Argue about which call cost the game",
        "Quit the team",
        "Pretend it didn't happen",
        "Be honest, stay positive, work harder next practice",
      ],
      correctAnswer: 3,
      explanation: "Own it, learn, fix it. That's how teams grow.",
    },
      {
      question: "After a big win, the ideal team response is:",
      options: [
        "Spread credit — every goal needed an assist",
        "The top scorer takes the credit",
        "Tell the losing team what they did wrong",
        "Post highlights immediately",
      ],
      correctAnswer: 0,
      explanation: "Wins are collective. Make sure everyone feels they contributed — because they did.",
    },
      {
      question: "Right after an OT loss, your starting goalie is in tears. Two teammates are blaming the defense out loud. What do you do?",
      options: [
        "Agree with the teammates blaming defense",
        "Go to the goalie — 'we win as a team, lose as a team'",
        "Walk to parking lot quickly",
        "Yell at everyone to stop",
      ],
      correctAnswer: 1,
      explanation: "Pick up your goalie. Shut down the blame. The team's identity is set in moments like these.",
      kind: "scenario",
      scenario: "OT loss, 9-8. Your goalie is in tears — she thinks the last goal was her fault. Teammates nearby are blaming the defense out loud.",
    },
    ],
    keyTakeaways: [
      "Wins and losses are team outcomes — no individual wins or loses one.",
      "After wins: spread credit. The shot needed the assist needed the ground ball.",
      "After losses: own it together. Don't blame one player — that destroys trust.",
      "Best response to a tough loss: 'we'll fix it' — and actually fix it next practice.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
]

const GIRLS_HIGH_LESSONS: AcademyLesson[] = [
  {
    id: "girls-high-l1",
    videoUrl: "https://www.youtube.com/watch?v=IEt5iXnMtsw",
    lessonNumber: 1,
    title: "Advanced Offensive Concepts",
    topic: "Lacrosse IQ",
    pillar: "game",
      position: "attack",
    description: `By high school, you should understand offensive systems — not just how to score on your own, but how the team creates scoring chances together. Great high school offenses run sets, motion concepts, and ball reversals to manipulate defenses.\n\nA "set" is an organized offensive formation. The most common in girls lacrosse are the 3-3 (three players up high, three down low) and the 1-3-2 (one player up top, three across the middle, two down low). Each set creates different angles and dodging opportunities.\n\n"Motion offense" means players are constantly moving — cutting, screening, repositioning — to create openings. Good motion offenses are hard to defend because the defense can never settle. The keys are timing (cuts have to happen at the right moment) and spacing (players have to stay 5+ yards apart so defenses can't double team easily).\n\n"Ball reversal" is moving the ball from one side of the field to the other quickly. Defenses are designed to slide and help where the ball is. When you reverse the ball quickly, the defense has to scramble to get in new position — and that's when openings appear.\n\nHere's the most important advanced concept: don't dodge into help. Look for the slide before you commit. If you see help coming, pass the ball to your open teammate. If you don't see help, dodge hard and finish. Patient ball movement creates better looks than forced 1v1 dodges.\n\nThe best high school offenses have players who know their roles. The best dodgers initiate. The best shooters position for shots. The best passers create assists. Know what you're best at and play to it.`,
    questions: [
      {
      question: "What's the strength of a 1-3-2 set?",
      options: [
        "Allows three dodgers at once",
        "Best for ride formations",
        "Stretches the D, creates cutting lanes from wings/low",
        "Heavy crease pressure all game",
      ],
      correctAnswer: 2,
      explanation: "1-3-2 spreads the D and gives wings/low players room to cut.",
    },
      {
      question: "What is 'ball reversal' and why does it work?",
      options: [
        "Carrying ball back to your own goal",
        "Throwing back to the goalie to reset",
        "Re-dodging same matchup",
        "Moving ball side-to-side fast — D scrambles",
      ],
      correctAnswer: 3,
      explanation: "Defenses slide toward the ball. Reverse fast = scrambling = openings.",
    },
      {
      question: "What is 'pick-the-picker'?",
      options: [
        "After setting a pick, immediately get a pick set for you",
        "Picking the ball carrier first",
        "A draw move",
        "Picking the best player",
      ],
      correctAnswer: 0,
      explanation: "Defense recovers from action 1 just as action 2 hits. Staple of elite offenses.",
    },
      {
      question: "Patient dodging means...",
      options: [
        "Dodging slowly",
        "Reading slide first, attacking second",
        "Letting your defender catch up",
        "Waiting for the crease to clear",
      ],
      correctAnswer: 1,
      explanation: "If you see the slide early, pass to the open mark. If no slide, finish.",
    },
      {
      question: "1-3-2 set, you're at the high point. Coach calls a 2-man with the right wing. The crease defender has been the slide all game. What do you do?",
      options: [
        "Skip the pick, shoot from up top",
        "Reset and call a different play",
        "Use the pick, look for slide, hit the crease attacker the slider just left",
        "Force the dodge — beat your D 1v1",
      ],
      correctAnswer: 2,
      explanation: "If the crease defender slides, the crease attacker is open. The 2-man's whole purpose is forcing that decision.",
      kind: "scenario",
      scenario: "1-3-2 set. You're at the high point. Right wing comes up to set you a pick. Their crease defender has been the slide all game.",
    },
    ],
    keyTakeaways: [
      "Common settled sets: 3-2-1, 1-3-2 (around the 12m fan), and high-2 / low-2.",
      "Off-ball cuts are the heart of girls offense — back doors, fades, picks at the 8m.",
      "Read the slide BEFORE you commit. The girls game punishes forced dodges into help.",
      "Defenses must mark up inside 8m. Use motion to create shooting-space fouls.",
    ],
    diagrams: [
      {
        title: "1-3-2 Settled Set",
        view: "women-half-offensive",
        caption: "One up high (12m fan), three across the 8m midline, two low (behind goal at GLE). Stretches the defense and creates lanes for cutters from the wings or low.",
        players: [
          {
            x: 50,
            y: 30,
            role: "offense",
            label: "P"
          },
          {
            x: 25,
            y: 55,
            role: "offense",
            label: "W"
          },
          {
            x: 50,
            y: 55,
            role: "offense",
            label: "C"
          },
          {
            x: 75,
            y: 55,
            role: "offense",
            label: "W"
          },
          {
            x: 35,
            y: 88,
            role: "offense",
            label: "L"
          },
          {
            x: 65,
            y: 88,
            role: "offense",
            label: "L",
            ball: true,
            highlight: true
          },
        ],
        arrows: [
          {
            from: {
              x: 65,
              y: 88
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "run",
            label: "Drive topside"
          },
          {
            from: {
              x: 50,
              y: 55
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "run",
            label: "Crease cut"
          },
        ],
        legend: [
          {
            label: "Point / Wing / Crease / Low",
            color: "#D22630",
            shape: "circle"
          },
        ]
      },
    ],
  },
  {
    id: "girls-high-l2",
    videoUrl: "https://www.youtube.com/watch?v=2v4vfqctG88",
    lessonNumber: 2,
    title: "Team Defense and Slide Packages",
    topic: "Lacrosse IQ",
    pillar: "game",
      position: "defense",
    description: `Team defense at the high school level requires every player to understand the slide package — your team's system for helping each other when a ball carrier beats her defender.\n\nSLIDE SYSTEMS\n\n1. Adjacent Slide\nWhen the on-ball defender gets beat, the defender closest to her (adjacent) slides to stop the ball carrier. The next defender rotates to fill the gap left by the slider. Everyone shifts together like a chain reaction. This is the most common system.\n\n2. Crease Slide\nThe slide comes from a defender near the crease — usually whoever is guarding the player closest to the goal. This slide arrives faster but is harder to teach because it requires perfect communication and rotations.\n\n3. Recovery After the Slide\nThe slider's job isn't just to stop the dodge — it's to recover back to her player once the threat is neutralized. Slide, stop the ball, recover. The whole defense has to rotate during this sequence and then reset.\n\nCOMMUNICATION IS NON-NEGOTIABLE\nYour goalie calls the slides. Your defenders point and communicate constantly:\n- "Ball!" — I have the ball carrier\n- "Help right!" / "Help left!" — I'm one pass away, ready to slide from this side\n- "Crash!" — Slide NOW, we need immediate help\n- "Recover!" — Get back to your player, the threat is over\n\nSilent defenses lose. If your team doesn't talk, your slides will be late, your rotations will break down, and you'll give up easy goals.\n\nTHE BIGGEST MISTAKE\nHesitating on the slide. If you're the slider, GO. Don't wait to see if the on-ball defender recovers — by then it's too late. Slide hard, slide early, trust your teammates to fill behind you. A late slide is worse than no slide at all.\n\nCOACHING POINTS\n- Every player on the field should know the slide package — not just defenders\n- Practice slides in 3v2, 4v3, and 5v4 situations before going 6v6\n- Film study: watch where the slides come from and how the defense recovers`,
    questions: [
      {
      question: "Adjacent slide comes from:",
      options: [
        "The crease defender",
        "The two-pass-away defender",
        "The goalie stepping out",
        "The defender on the player next to the dodger",
      ],
      correctAnswer: 3,
      explanation: "Adjacent = next to. The defender adjacent to the dodger slides first.",
    },
      {
      question: "When is a crease/sandwich slide used?",
      options: [
        "When dodge comes from up top through middle",
        "When the crease is empty",
        "Only on free positions",
        "When dodge comes from behind cage",
      ],
      correctAnswer: 0,
      explanation: "Up-top middle dodge → crease defender slides because she has the shortest path.",
    },
      {
      question: "Most important defensive call?",
      options: [
        "'Ball'",
        "'I'm hot' — I'm the slide",
        "'Check'",
        "'Sub'",
      ],
      correctAnswer: 1,
      explanation: "Without 'I'm hot', the slide is unclear — that's a goal.",
    },
      {
      question: "After a slide, what does the slider do?",
      options: [
        "Stay on the ball-carrier",
        "Run back to original position",
        "Rotate to the player who just got left open",
        "Drop into the crease",
      ],
      correctAnswer: 2,
      explanation: "Slider's old mark gets covered by rotation. Slider helps the next threat.",
    },
      {
      question: "Their offense calls a play: their first home dodges hard up the middle. The crease attacker pops to a wing. Who slides?",
      options: [
        "Adjacent defender — crease stays home",
        "Top defender drops",
        "Goalie steps out",
        "Crease defender — adjacent fills",
      ],
      correctAnswer: 3,
      explanation: "Through-the-middle dodge = crease slide. The dodger gets to the crease before adjacents can rotate.",
      kind: "scenario",
      scenario: "First home is dodging hard, splitting two defenders, headed for the middle. Crease attacker pops out to a wing.",
    },
    ],
    keyTakeaways: [
      "Adjacent slide: from the player next to the dodger. Crease defender stays home.",
      "Crease (sandwich) slide: crease defender first; adjacent rotates to fill crease.",
      "Inside the 8m, ALL defenders must be marking up — slides have to happen WITHOUT abandoning shooting space.",
      "After a slide, recover and rotate. Standing still = open shot.",
    ],
    diagrams: [
      {
        title: "Adjacent Slide — Women's Field",
        view: "women-half-defensive",
        caption: "Defender adjacent to dodger slides first. Two-pass-away defender rotates to fill. Crease stays home — covers inside. Slides must respect 8m shooting-space rules.",
        players: [
          {
            x: 25,
            y: 55,
            role: "offense",
            label: "1",
            ball: true,
            highlight: true
          },
          {
            x: 70,
            y: 55,
            role: "offense",
            label: "2"
          },
          {
            x: 50,
            y: 70,
            role: "offense",
            label: "3"
          },
          {
            x: 30,
            y: 75,
            role: "offense",
            label: "4"
          },
          {
            x: 28,
            y: 60,
            role: "defender",
            label: "Da"
          },
          {
            x: 67,
            y: 60,
            role: "defender",
            label: "Db"
          },
          {
            x: 50,
            y: 75,
            role: "defender",
            label: "Dc"
          },
          {
            x: 35,
            y: 78,
            role: "defender",
            label: "Dd"
          },
        ],
        arrows: [
          {
            from: {
              x: 25,
              y: 55
            },
            to: {
              x: 50,
              y: 78
            },
            kind: "run",
            curve: -10,
            label: "Dodge"
          },
          {
            from: {
              x: 50,
              y: 75
            },
            to: {
              x: 38,
              y: 70
            },
            kind: "run",
            label: "Slide (Dc)"
          },
          {
            from: {
              x: 35,
              y: 78
            },
            to: {
              x: 50,
              y: 75
            },
            kind: "run",
            curve: 5,
            label: "Fill (Dd)"
          },
        ],
        legend: [
          {
            label: "Offense (with ball)",
            color: "#D22630",
            shape: "circle"
          },
          {
            label: "Defender",
            color: "#2563EB",
            shape: "square"
          },
        ]
      },
    ],
  },
  {
    id: "girls-high-l3",
    videoUrl: "https://www.youtube.com/watch?v=dxvAw7zudVg",
    lessonNumber: 3,
    title: "How to Watch Film",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Film study is the biggest separator at the high school level. The players who watch film correctly improve dramatically faster than those who don't. But most players don't know HOW to watch film — they just stare at it.\n\nHere's how to watch film with purpose:\n\nFirst, watch with a question in mind. Don't just watch — watch FOR something. Examples: "How does my defender position herself when I dodge?" "Where are the slides coming from?" "What does my team do well in transition?" Having a question keeps you focused.\n\nSecond, watch off-ball. Most players watch the ball. The ball doesn't teach you anything — you already know what happens with the ball. What teaches you is what happens AWAY from the ball. Watch the slides developing. Watch the cuts. Watch how good players move when they don't have it.\n\nThird, pause and rewind. Don't watch in real time only. When something happens, pause it. Look at every player on the field. Where was the open space? Why did the defender go where she did? What would you have done differently?\n\nFourth, watch yourself critically. When you're watching your own film, don't look for highlights. Look for mistakes. Where did you turn the ball over? What did you miss? Where could you have cut better? Brutal self-honesty is how you fix problems.\n\nFifth, take notes. Write down 3 things you noticed and 3 things you want to work on. Bring those notes to the next practice. Film study without action is just watching TV.\n\nThe best players in college and the pros watch film daily. If you start now, by the time you're a senior, you'll be miles ahead of every player who relies only on practice.`,
    questions: [
      {
      question: "Best way to learn from film:",
      options: [
        "Pick one focus per viewing",
        "Watch all the action at full speed",
        "Only watch the highlight goals",
        "Watch with the sound up loud",
      ],
      correctAnswer: 0,
      explanation: "Multi-tasking diffuses learning. One focus = real lessons.",
    },
      {
      question: "What does 'pause and predict' mean?",
      options: [
        "Pause to text friends",
        "Pause clip, guess next move, then check",
        "Stop and start randomly",
        "Stop watching when bored",
      ],
      correctAnswer: 1,
      explanation: "Active prediction trains anticipation — the IQ skill that matters most.",
    },
      {
      question: "Watching your own film, what's the value?",
      options: [
        "Compare to pro highlight reels",
        "Just to enjoy",
        "See what you actually look like vs. what it felt like",
        "See your goals",
      ],
      correctAnswer: 2,
      explanation: "You always feel different than you look. Tape doesn't lie.",
    },
      {
      question: "How often should you watch your own game film?",
      options: [
        "Only when coach forces it",
        "After playoffs only",
        "Once a season",
        "Weekly during the season",
      ],
      correctAnswer: 3,
      explanation: "Weekly review = weekly improvement. Players who do this pull away.",
    },
      {
      question: "You watch your last game and notice you drift right after a turnover — every time. You watch this happen 6 times across 4 games. What do you do at the next practice?",
      options: [
        "Drill the recovery — practice tracking back left after turnovers",
        "Watch more film instead of practicing",
        "Mention it to coach so she knows",
        "Forget it — bad habits will fix themselves",
      ],
      correctAnswer: 0,
      explanation: "Film identifies the pattern. Practice fixes it. Without targeted reps, the habit stays.",
      kind: "scenario",
      scenario: "You watched film of your last 4 games. After every turnover, you drift to the right side — leaving your defensive responsibility uncovered.",
    },
    ],
    keyTakeaways: [
      "Watch ONE thing per viewing: defensive slides, off-ball cuts, draw battles — pick.",
      "Pause and predict: stop the clip, guess the next move, then watch and check.",
      "Watch your OWN film weekly. See what you actually look like, not what it felt like.",
      "Take notes. 'I drift left after losing my mark' is a real coaching note you give yourself.",
    ],
  },
  {
    id: "girls-high-l4",
    lessonNumber: 4,
    title: "The College Recruiting Process",
    topic: "Mental Game",
    pillar: "game",
    description: `If you want to play college lacrosse, you need to understand the recruiting process. Many players miss out not because they aren't talented — but because they didn't know how the process works. Here's what you need to know.\n\nRecruiting in girls lacrosse starts EARLY. Coaches identify prospects in 8th and 9th grade. By 10th grade, top prospects are getting verbal offers. By 11th grade, most Division I rosters are largely set. This means you need to be on coaches' radar by your sophomore year if you're aiming for D1.\n\nGrades matter — A LOT. Most colleges won't even consider a player who can't get in academically. Your GPA and test scores open doors that lacrosse alone can't. Aim for the highest grades you can. The better your grades, the more options you have.\n\nYou have to do your own outreach. Don't wait for coaches to find you. Email college coaches starting freshman year — introduce yourself, share your highlight tape, list your tournaments. Be professional, polite, and brief. Most coaches won't reply but they ARE reading.\n\nGet to college camps and showcase tournaments. This is where coaches actually see you play. Pick events where the schools you want to attend will be coaching or scouting. Camps at colleges are especially valuable because the coach sees you up close.\n\nUse a recruiting profile (Sportsforce, NCSA, or BTB's own profile) so coaches can find your stats, video, grades, and contact info in one place.\n\nMost importantly: don't fixate on D1. There are 200+ great college lacrosse programs across D1, D2, D3, and NAIA. Many D3 programs offer better player development, smaller class sizes, and equally competitive lacrosse. Find the right FIT, not just the highest division. The best college experience is one where you'll play significant minutes, get great coaching, and earn a degree that opens doors after lacrosse.`,
    questions: [
      {
      question: "What's the #1 piece of recruiting communication coaches want?",
      options: [
        "A long letter about your background",
        "A short email with a film link, GPA, contact info",
        "A phone call from a parent",
        "Social media DMs",
      ],
      correctAnswer: 1,
      explanation: "Coaches scan emails fast. Short + film + grades + phone.",
    },
      {
      question: "What matters more for most college rosters?",
      options: [
        "Number of camps attended",
        "Brand of stick used",
        "A strong, recent highlight film",
        "Most tournament games played",
      ],
      correctAnswer: 2,
      explanation: "Coaches don't see every tournament. They see your film. Make it strong.",
    },
      {
      question: "When should serious recruiting outreach start?",
      options: [
        "After verbal commits dry up",
        "Eighth grade",
        "Senior year",
        "Sophomore year, ramp through junior",
      ],
      correctAnswer: 3,
      explanation: "Sophomore = build film + reach out. Junior = visits + decisions.",
    },
      {
      question: "Why do grades matter for athletic recruiting?",
      options: [
        "Coaches need your GPA to even make an offer (admissions matter)",
        "Grades are tiebreakers only",
        "They don't — only film matters",
        "Only Ivies care about grades",
      ],
      correctAnswer: 0,
      explanation: "If admissions won't accept you, the coach can't offer. Grades open doors.",
    },
      {
      question: "October of sophomore year. You sent your film. Coach replied: 'thanks, keep us posted.' What's your move?",
      options: [
        "Wait — they'll reach out when ready",
        "Send them a new clip every 4-6 weeks with one new skill or game",
        "Email them daily until they commit",
        "Call the coach every week to push",
      ],
      correctAnswer: 1,
      explanation: "'Keep us posted' = they want updates. Periodic, specific, additive — not spam, not silence.",
      kind: "scenario",
      scenario: "October, sophomore year. You emailed your top program with a film link. Coach replied: 'thanks for sending — keep us posted on your progress.'",
    },
    ],
    keyTakeaways: [
      "Film highlights matter more than tournament 'exposure'. Make a strong reel by sophomore year.",
      "Email coaches directly — short, specific, with a 2-3 minute reel link, GPA, and contact.",
      "Show interest BEFORE coaches show interest in you. They have hundreds of options.",
      "Grades open and close more doors than you think — academic fit > athletic fit at most levels.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dvSS1qWmD1s",
  },
  {
    id: "girls-high-l5",
    lessonNumber: 5,
    title: "Elite Mental Game",
    topic: "Mental Game",
    pillar: "leadership",
    description: `By high school, mental game becomes one of the biggest differences between good and great players. Physical talent gets you to the team. Mental game determines how far you go.\n\nHere are the mental skills the best high school players develop:\n\nVisualization. Before games, the best players visualize themselves succeeding. They picture making the dodge, hitting the shot, making the play. This isn't woo-woo — it's science. Visualization actually programs your nervous system to execute when the moment comes. Spend 5 minutes the night before a game visualizing yourself playing your best.\n\nThe 5-second reset. When something bad happens — a turnover, a missed shot, a bad call — give yourself 5 seconds to feel the frustration. Then physically reset (breath, touch your stick, refocus your eyes) and play the next play. The 5-second rule works because emotions only last seconds if you don't feed them.\n\nProcess over outcome. Outcome thinking ("I have to score") creates pressure. Process thinking ("I'm going to attack hard and trust my training") creates flow. Focus on what you can control — your effort, your reads, your execution. The score takes care of itself.\n\nConfidence through preparation. The most confident players aren't the most talented — they're the most prepared. They know they've put in the work. They've taken the reps. They've watched the film. Confidence isn't something you fake — it's something you earn through preparation.\n\nGratitude for the opportunity. Sounds soft, but it works. The best players remember that getting to play this game is a privilege. When you appreciate the chance to compete, the pressure goes down and the joy goes up. Tense players play tight. Loose players play free. Gratitude keeps you loose.\n\nMental skills are like physical skills — they have to be practiced. Most players never train them. The ones who do separate themselves quickly.`,
    questions: [
      {
      question: "Pre-game routine should be:",
      options: [
        "Whatever the captain does",
        "Different every game for variety",
        "Repeatable — same cues that bring you to game state",
        "Skipped — saves energy",
      ],
      correctAnswer: 2,
      explanation: "Repeatable routines = consistent mental state. Pros all have one.",
    },
      {
      question: "Best in-game self-talk after a mistake?",
      options: [
        "'My team is going to be mad'",
        "'Why did I do that?'",
        "'I'm not playing well today'",
        "'Next play — I got the next one'",
      ],
      correctAnswer: 3,
      explanation: "Forward-looking self-talk resets focus. Backward-looking traps you.",
    },
      {
      question: "What does sport-psych research say about visualization?",
      options: [
        "It measurably improves execution under pressure",
        "Only works in the off-season",
        "Superstition with no real effect",
        "Only works for goalies",
      ],
      correctAnswer: 0,
      explanation: "Visualization rehearses the neural pattern. Execution improves measurably.",
    },
      {
      question: "Composure is best understood as:",
      options: [
        "A personality trait you're born with",
        "A trainable skill — built through practice",
        "Luck",
        "Something only veterans have",
      ],
      correctAnswer: 1,
      explanation: "Composure is a habit. Train it deliberately, like stick skills.",
    },
      {
      question: "State final, 4th quarter, tied. You miss two shots in a row. You're getting tight. What's the single best thing to do RIGHT NOW?",
      options: [
        "Pass off scoring duty completely",
        "Get angry to fire yourself up",
        "Reset routine: deep breath, cue word ('next'), commit to next play",
        "Try to score even harder",
      ],
      correctAnswer: 2,
      explanation: "Pre-built reset routine kicks in under pressure. Anger and overthinking both narrow performance.",
      kind: "scenario",
      scenario: "State final. 4th quarter. Tied. You missed two shots in a row — both shots you usually make. You feel yourself tightening up.",
    },
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    keyTakeaways: [
      "Pre-game routine = repeatable cues that bring you to the right state. Find yours.",
      "Self-talk: 'next play' beats 'why did I do that' every time.",
      "Visualization works — 5 minutes pre-game seeing yourself execute.",
      "Composure is a skill, not a personality trait. It's trainable.",
    ],
  },
  {
    id: "girls-high-l6",
    lessonNumber: 6,
    title: "Captaincy and Senior Leadership",
    topic: "Character",
    pillar: "leadership",
    description: `Senior leadership is the most important thing on any high school team. The best teams aren't always the most talented — they're the ones with seniors who set the standard for everyone else. If you want to be a captain, here's what real captaincy looks like.\n\nA captain is the bridge between coaches and players. When the coach has a message, the captain reinforces it. When players have concerns, the captain brings them to the coach respectfully. You speak both languages.\n\nA captain holds people accountable — even friends. This is the hardest part. When your best friend is going half-speed, you have to say something. Not in a mean way. Not by yelling. But honestly: "Hey, I need you locked in. We need you." Real captains care more about the team than about being liked.\n\nA captain runs the locker room. The energy in your locker room is your responsibility. If players are quiet and tight before games, you change that. If players are too loose and unfocused, you change that too. The captain sets the temperature.\n\nA captain takes losses harder than wins. After a loss, captains don't blame coaches, refs, or teammates. They take responsibility, talk about what went wrong, and lead the response in the next practice. Wins are easy. Losses are when leadership shows.\n\nA captain develops younger players. Every team has freshmen and sophomores looking up to the seniors. Spend time with them. Teach them. Encourage them. Make them feel like they belong. The captains who do this leave the program better than they found it — and that's the highest form of leadership.\n\nNot every senior will be a captain. But every senior should lead. The senior class sets the culture for the whole program. Take that responsibility seriously, and your team will be one nobody forgets.`,
    questions: [
      {
      question: "What's a captain's primary job?",
      options: [
        "Run team meetings unilaterally",
        "Make game-time strategic calls",
        "Score the most points",
        "Serve the team — be the bridge to coach",
      ],
      correctAnswer: 3,
      explanation: "Captaincy = service. Bridge between coach and players, not boss.",
    },
      {
      question: "How does a real captain handle a slacking friend?",
      options: [
        "Talk privately, honestly — care more about team than being liked",
        "Call her out publicly to embarrass her",
        "Ignore it — friendship comes first",
        "Tell on her to coach",
      ],
      correctAnswer: 0,
      explanation: "Honest, private, direct. Caring more about team than popularity is the captain test.",
    },
      {
      question: "Senior leadership in tough moments looks like:",
      options: [
        "Yelling to motivate",
        "Steady — calm when teammates are emotional",
        "Making big speeches",
        "Loudest voice in the huddle",
      ],
      correctAnswer: 1,
      explanation: "When emotions rise, a captain's job is to lower them. Steadiness wins.",
    },
      {
      question: "First job for a new captain?",
      options: [
        "Speak in every huddle",
        "Plan team-building events",
        "Set the standard with your own behavior — example before voice",
        "Pick the team's pre-game music",
      ],
      correctAnswer: 2,
      explanation: "Lead by example before voice. Words without action don't carry.",
    },
      {
      question: "You're the captain. A senior teammate disagrees publicly with the coach during a film session. Room goes quiet. What do you do?",
      options: [
        "Side with the senior — solidarity",
        "Defend the coach loudly in the room",
        "Stay silent — let the coach handle it",
        "Pull the senior aside privately later: 'I hear you. Not the place. Let me talk to coach.'",
      ],
      correctAnswer: 3,
      explanation: "Captains de-escalate publicly, advocate privately. Public confrontation makes both sides dig in.",
      kind: "scenario",
      scenario: "Film session. A senior teammate publicly pushes back on coach's strategy in front of the team. Room gets quiet. You're the captain.",
    },
    ],
    keyTakeaways: [
      "Captaincy = serving the team, not running it. Captains speak with coach FOR teammates, not against them.",
      "Hard conversations with friends: 'I love you, AND your effort is hurting us.' Both true.",
      "A captain's first job is the standard. Lead by example before you lead by voice.",
      "Captains stay calm when teammates are emotional. Steady > loud.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
  },
  {
    id: "girls-high-l7",
    lessonNumber: 7,
    title: "Leading Without a Title",
    topic: "Character",
    pillar: "leadership",
    description: `Most teams name 2-3 captains. But the best teams have leadership running through the entire roster. You don't need a "C" on your jersey to lead — and some of the most impactful leaders on championship teams were never named captain.\n\nLeading without a title means setting the standard daily — at practice, in the weight room, in the film room. You're the junior who's first to every drill. You're the sophomore who stays after to work on her draw controls. You're the underclassman who knows the plays because she studied them on her own time.\n\nIt also means holding people accountable. When your friend is half-speed in a drill, you pull her aside and say "I need more from you." Not publicly. Not harshly. Just honestly. Most people avoid these conversations. Leaders have them.\n\nLeading without a title means doing the unglamorous work. Picking up cones. Setting up goals. Carrying the ball bag. Making sure freshmen feel welcome. These acts build culture more than any speech. The seniors notice — and they trust you for it.\n\nCoaches don't pick captains based on one moment. They watch the whole season. They notice who leads in September, not just in May. If you want to be a captain someday, start leading right now. By the time the decision comes, everyone will already know.`,
    questions: [
      {
      question: "Leadership without a title comes from:",
      options: [
        "A standard others want to match",
        "Demanding respect from teammates",
        "Going to the coach about issues",
        "Being friends with the captain",
      ],
      correctAnswer: 0,
      explanation: "Leadership is gravitational. Your standard pulls others up.",
    },
      {
      question: "How do you influence older teammates without authority?",
      options: [
        "Wait until you're a captain",
        "Hold yourself to a higher standard than them",
        "Tell them what to do",
        "Complain to coach about them",
      ],
      correctAnswer: 1,
      explanation: "Older teammates respond to action, not lecture. Be the bar.",
    },
      {
      question: "Visible leadership behavior?",
      options: [
        "Posting team content on social",
        "Wearing the team's gear off the field",
        "First on the field, last to leave — every day",
        "Speaking up in every team meeting",
      ],
      correctAnswer: 2,
      explanation: "Show up first, leave last. Visible. Compounds.",
    },
      {
      question: "Influence vs. title — which matters more?",
      options: [
        "Both equal",
        "Title — captains get the final word",
        "Title for games, influence for practice",
        "Influence — built through reps and reliability",
      ],
      correctAnswer: 3,
      explanation: "Titles are temporary. Influence built through trust is real authority.",
    },
      {
      question: "You're a junior. The team is captained by two seniors who don't push the standard hard. Practice intensity has dropped. What's your move?",
      options: [
        "Set the standard yourself — sprint, push, compete every drill",
        "Match the captains' pace — don't disrupt",
        "Tell coach about the captains",
        "Wait until you're a captain next year",
      ],
      correctAnswer: 0,
      explanation: "Don't wait for permission. Set the bar. Others rise — including the captains, who often need the example.",
      kind: "scenario",
      scenario: "You're a junior. Two senior captains have set a casual practice tone. Intensity is dropping. Coach hasn't said anything yet.",
    },
    ],
    keyTakeaways: [
      "You don't need a 'C' to lead — you need a standard others want to match.",
      "Pull older teammates up by holding YOURSELF to the higher standard, not by lecturing.",
      "Show up first, leave last. Visible commitment compounds.",
      "Your influence > your title. Build it through reps, not announcements.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
  },
  {
    id: "girls-high-l8",
    lessonNumber: 8,
    title: "Team Chemistry",
    topic: "Mental Game",
    pillar: "team",
    description: `Team chemistry is the invisible force that turns a roster into a real team. It's what makes teammates play harder for each other, communicate without thinking, and refuse to let each other down.\n\nChemistry doesn't happen by accident. It's built through shared experiences — grueling preseason workouts, team pasta dinners, long tournament weekends, and tough losses handled with grace. Every hard thing you go through together strengthens the bond.\n\nThe best teams have one simple trait: they genuinely care about each other. Not just on the field — as people. When you care about your teammates, you sprint back on defense because you don't want to let them down. You make the extra effort because you know she'd do the same for you.\n\nBuilding chemistry requires vulnerability. Being honest in the film room. Admitting when you messed up. Accepting coaching from a teammate without getting defensive. Teams where everyone protects their ego never develop real chemistry.\n\nAs an upperclassman, you build chemistry by including everyone. The freshman eating alone? Invite her over. The quiet girl who works hard but never speaks up? Tell her you notice. The more connected your team is as people, the better you'll play together on the field.\n\nGirls lacrosse teams that have real chemistry are special. The connection, the energy, the way you move as one unit — it's something you'll remember long after your playing days are over.`,
    questions: [
      {
      question: "Chemistry is best defined as:",
      options: [
        "Posting together on social",
        "Predictable trust under pressure",
        "Spending time together off the field",
        "Liking your teammates personally",
      ],
      correctAnswer: 1,
      explanation: "Chemistry shows up in tight games — does the team trust each other?",
    },
      {
      question: "How does chemistry actually get built?",
      options: [
        "Pizza parties and team dinners",
        "Captain leadership alone",
        "Shared hard work — conditioning, drills, film",
        "Winning a few games together",
      ],
      correctAnswer: 2,
      explanation: "Bonds forge under shared difficulty, not shared comfort.",
    },
      {
      question: "First red flag of bad team chemistry?",
      options: [
        "Players make jokes during huddles",
        "The team isn't winning",
        "Coaches yell more than usual",
        "Side conversations and cliques during team time",
      ],
      correctAnswer: 3,
      explanation: "Cliques and side conversations show the team isn't really together.",
    },
      {
      question: "How can a regular player help chemistry without being captain?",
      options: [
        "Invite, include, share — be the connector for new or quieter teammates",
        "Organize bigger off-field events",
        "Stay in your lane — let captains handle it",
        "Post team unity content online",
      ],
      correctAnswer: 0,
      explanation: "Connectors build chemistry. Make sure no teammate feels invisible.",
    },
      {
      question: "A new transfer joins the team mid-season. She's quiet at lunch, sits alone in the locker room. The team has tight cliques. What do you do?",
      options: [
        "Let her find her way",
        "Sit with her, introduce her, include her in the warm-up group",
        "Invite her only if the captains say to",
        "Let coaches handle integration",
      ],
      correctAnswer: 1,
      explanation: "One person can flip a transfer's experience. That's chemistry built — and you remembering it later, when the team needs it.",
      kind: "scenario",
      scenario: "Mid-season transfer. She's strong but quiet. Eats lunch alone. Sits separate in the locker room. Cliques are tight.",
    },
    ],
    keyTakeaways: [
      "Chemistry isn't friendship. It's predictable trust under pressure.",
      "Built in shared hard work — preseason conditioning, tough drills, film together.",
      "First sign of bad chemistry: side conversations and cliques during team time.",
      "Coaches build chemistry intentionally. Players can build it too — invite, include, share.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=UI-ZteQ8JGU",
  },
  {
    id: "girls-high-l9",
    lessonNumber: 9,
    title: "Sacrifice for the Team",
    topic: "Mental Game",
    pillar: "team",
    description: `At the high school level, the best teams are built on sacrifice — putting what the team needs above what you want, without complaining.\n\nSacrifice shows up in real moments:\n\nYou're an attacker who averages 3 goals a game. The coach asks you to play midfield because the team needs your speed in transition. You don't argue. You learn the new position and give it everything.\n\nYou're a senior who earned the starting spot. The coach rotates a sophomore in to develop her for next year. You mentor her, teach her the system, and cheer her on — even though it costs you minutes.\n\nYour legs are dead in the second half of a playoff game. Your body wants to jog. But the team needs one more stop, one more clear, one more sprint. You push through because your teammates are counting on you.\n\nSacrifice isn't dramatic speeches. It's daily choices. It's riding the bus to a game you might not play much in but bringing energy from the sideline. It's doing extra conditioning because the coach said team reps. It's passing up the shot because your teammate has a better look.\n\nThe players who sacrifice the most often get the most back. Coaches trust them. Teammates love playing with them. And they win — because they've built something bigger than themselves.`,
    questions: [
      {
      question: "What does sacrifice mean for a team?",
      options: [
        "Letting one player carry the team",
        "Skipping practice when tired",
        "Giving up something you want for what the team needs",
        "Giving up the season for school",
      ],
      correctAnswer: 2,
      explanation: "Sacrifice is putting team need above personal want.",
    },
      {
      question: "Common in-game sacrifices?",
      options: [
        "Skipping warm-ups",
        "Asking for more rest",
        "Avoiding ground balls to save energy",
        "Skipping the contested shot to make the better pass",
      ],
      correctAnswer: 3,
      explanation: "Pass when teammate has the better shot. Daily sacrifice.",
    },
      {
      question: "Sacrifice works when:",
      options: [
        "Everyone gives something — distribution is even",
        "Captains choose who sacrifices what",
        "Coaches enforce it strictly",
        "One person gives the most every time",
      ],
      correctAnswer: 0,
      explanation: "Even distribution = sustainable. One martyr team isn't sustainable.",
    },
      {
      question: "Why do sacrificing teams beat more talented ones?",
      options: [
        "Refs reward it",
        "Cumulative effect — every play has more team value",
        "Coincidence",
        "They get lucky",
      ],
      correctAnswer: 1,
      explanation: "Better passes, slides, backups — small choices compound.",
    },
      {
      question: "You're the leading scorer. New play has the ball going through your hands but you're the screener, not the shooter. Coach asks you to commit to it. What do you do?",
      options: [
        "Set screens half-heartedly",
        "Ask for a different role",
        "Commit fully — set the best screens of your career",
        "Push back — you should be the shooter",
      ],
      correctAnswer: 2,
      explanation: "Top scorers who screen hard make EVERYONE more dangerous. Defenses can't predict the threat. Elite team play.",
      kind: "scenario",
      scenario: "You're the team's leading scorer. New offensive set has you as the screener — not the finisher. Coach asks you to commit to it.",
    },
    ],
    keyTakeaways: [
      "Sacrifice = giving up something you want for something the team needs.",
      "Common sacrifices: shots, position, minutes, ego after a bad call.",
      "If sacrifice feels even, both sides give up something — that's what makes it work.",
      "The team that out-sacrifices the other team usually wins.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
  },
  {
    id: "girls-high-l10",
    lessonNumber: 10,
    title: "The Legacy You Leave",
    topic: "Mental Game",
    pillar: "team",
    description: `Every team eventually becomes a memory. Seniors graduate. Rosters turn over. The only thing that survives is the culture you built — and that's your legacy.\n\nLegacy isn't your stats. In 10 years, nobody will remember how many goals you scored. They'll remember how you made people feel. They'll remember whether you were the teammate who lifted others up or tore them down. They'll remember the standard you set.\n\nThe best legacy is a team that's better AFTER you leave. That means you didn't just play hard — you taught younger players how to play hard. You didn't just show up on time — you showed underclassmen why being early matters. You passed down the culture.\n\nThink about the seniors who were there when you were a freshman. What did they teach you? How did they make you feel? Did they welcome you or freeze you out? Did they push you or ignore you? That's their legacy. Now ask: what will YOUR freshmen say about you in three years?\n\nEvery practice is a chance to build your legacy. Every time you pick someone up after a mistake. Every time you set the tone in conditioning. Every interaction with a younger player.\n\nWhen you're done playing, you'll remember your teammates more than any score. You'll remember what it felt like to be part of something bigger than yourself. And the younger players who watched you will carry forward what you showed them. That's legacy — the most important thing you'll build in your entire lacrosse career.`,
    questions: [
      {
      question: "What do teammates remember about you 10 years later?",
      options: [
        "Which tournaments you played",
        "Stats from the playoff run",
        "Goals scored that season",
        "How you treated people, the standard you set",
      ],
      correctAnswer: 3,
      explanation: "Stats fade. Behavior toward teammates and the standard you held — that's legacy.",
    },
      {
      question: "How do you 'build the program' as a senior?",
      options: [
        "Mentor underclassmen — leave it better than you found it",
        "Recruit transfers in",
        "Score the most points to set records",
        "Win the most games possible",
      ],
      correctAnswer: 0,
      explanation: "Programs are passed down. Your senior year is about what you leave.",
    },
      {
      question: "What's the senior-year mindset shift?",
      options: [
        "Focus on personal stats for college",
        "From taking to giving — invest in those who follow",
        "Quiet down and let underclassmen lead",
        "Take more shots — last chance to score",
      ],
      correctAnswer: 1,
      explanation: "Final year is about what you give back. Investing in younger players IS the legacy.",
    },
      {
      question: "Best 'legacy' move you can make this season?",
      options: [
        "Win MVP",
        "Score 50 goals",
        "Adopt one freshman — answer questions, model the standard, include her",
        "Captain the team",
      ],
      correctAnswer: 2,
      explanation: "One mentored freshman becomes a senior who mentors more. Multiplier effect — that's program building.",
    },
      {
      question: "Last home game. Pre-game. A freshman is sitting alone, looking nervous. The team is in cliques. You're a senior captain. What do you do?",
      options: [
        "Ignore her — it's your special day",
        "Send a teammate over to handle it",
        "Tell her to stop being nervous",
        "Sit next to her: 'first big game? I was you 4 years ago. Here's what helped.'",
      ],
      correctAnswer: 3,
      explanation: "Legacy moments are built in choices like this. She'll remember senior night for the rest of her life — make sure it's because someone showed up.",
      kind: "scenario",
      scenario: "Senior night. Pre-game locker room. A freshman who barely plays is sitting alone, clearly nervous. Team's in cliques. You're a senior captain.",
    },
    ],
    keyTakeaways: [
      "Legacy is what teammates remember about you 10 years from now.",
      "Stats fade. The kid who picked up freshmen, set the standard, played through pain — they remember.",
      "Build the program: leave it better than you found it. Mentor the underclassmen.",
      "Final season is your last chance to give. Spend it generously.",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dCVlRFWOjgE",
  },
]

// ─── COURSE BUILDERS ──────────────────────────────────────────────────

export function getAcademyCourses(gender: Gender): AcademyCourse[] {
  const lessonsByTier: Record<AgeTier, AcademyLesson[]> =
    gender === "boys"
      ? { youth: BOYS_YOUTH_LESSONS, middle: BOYS_MIDDLE_LESSONS, high: BOYS_HIGH_LESSONS }
      : { youth: GIRLS_YOUTH_LESSONS, middle: GIRLS_MIDDLE_LESSONS, high: GIRLS_HIGH_LESSONS }

  return TIERS.map((t) => ({
    id: `${gender}-${t.tier}`,
    tier: t.tier,
    tierLabel: t.label,
    ageRange: t.ageRange,
    gradYears: t.gradYears,
    description: getCourseDescription(t.tier),
    gender,
    lessons: lessonsByTier[t.tier],
  }))
}

function getCourseDescription(tier: AgeTier): string {
  switch (tier) {
    case "youth":
      return "Build the foundation. Learn fundamentals, teamwork, and the BTB Standard."
    case "middle":
      return "Level up. Master positions, dodging, defense, and lacrosse IQ."
    case "high":
      return "Compete at the highest level. Advanced systems, film study, and college prep."
  }
}

// ─── POSITION-SPECIFIC BONUS LESSONS ──────────────────────────────────
// These inject into all tiers. Position-tagged so players can filter to
// exactly the content relevant to them.

export const GOALIE_LESSONS: AcademyLesson[] = [
  {
    id: "pos-goalie-l1",
    videoUrl: "https://www.youtube.com/watch?v=q1UVaJsLehw",
    lessonNumber: 101,
    title: "The Goalie Mindset",
    topic: "Mental Game",
    pillar: "leadership",
    position: "goalie",
    description: `The goalie position is the hardest in lacrosse — and it produces some of the strongest leaders on any team. You are the only player on the field who sees everything in front of you. That view comes with responsibility.

Every save is forgotten in thirty seconds. Every goal allowed lives in your head for the rest of the game unless you train yourself to let it go. The 5-second rule is mandatory for goalies: feel the frustration, reset physically (tap your stick to the post, take a breath, reset your stance), and refocus. The next shot is the only one that matters.

The best goalies are the best communicators. You direct traffic. When the ball is on the wing and your slide is developing, you have to call it clearly before it happens: "Slide left, rotate right." Your defenders are relying on you to be their eyes. If you go quiet, your defense goes blind.

Goalies also set the emotional temperature of the team. When you stay calm under pressure, your defense stays calm. When you get rattled, everyone feels it. This isn't pressure — it's power. You control the energy of ten players just by how you carry yourself between shots.

At BTB, we develop goalies who lead from the crease. That means studying film, knowing offensive tendencies, directing defense, and bouncing back from goals like they never happened. The physical saves get you on the field. The mental game keeps you there.`,
    questions: [
      {
        question: "What is the 5-second rule for goalies?",
        options: ["Score within 5 seconds of a save", "Feel frustration for 5 seconds, then physically reset and refocus", "Clear the ball in 5 seconds", "Take 5 steps before throwing"],
        correctAnswer: 1,
        explanation: "The 5-second reset prevents one goal from turning into three. Feel it, reset, move on.",
      },
      {
        question: "Why is communication so critical for goalies?",
        options: ["It's not — just make saves", "Goalies direct the entire defense and are the only one who sees the whole field", "To motivate teammates", "Only matters in college"],
        correctAnswer: 1,
        explanation: "The goalie sees everything. Calling slides, rotations, and clears keeps the defense organized.",
      },
      {
        question: "How does a goalie's emotional state affect the team?",
        options: ["It doesn't", "A calm goalie keeps the defense calm — a rattled goalie rattles everyone", "Only affects the goalie", "Only matters in close games"],
        correctAnswer: 1,
        explanation: "Goalies set the emotional temperature. Leadership from the crease is as important as saves.",
      },
    ],
  },
  {
    id: "pos-goalie-l2",
    videoUrl: "https://www.youtube.com/watch?v=15BSKp0cvgg",
    lessonNumber: 102,
    title: "Arc Positioning and Angles",
    topic: "Fundamentals",
    pillar: "game",
    position: "goalie",
    description: `Goalie positioning is angle math. The further you come off your line toward the ball, the smaller the shooter's target. This is called cutting down the angle — and it's the most important technical concept in goalkeeping.

The arc is the curved path along the front of your crease. As the ball moves, you move along the arc to stay centered between the ball and the center of the cage. If the ball is at the top center, you're at the top of your arc. If the ball moves to the right wing, you shift right along your arc. You never stand flat-footed in the center of the cage — that gives the shooter the whole net.

Step and lead with your top hand. When a shot comes, your first movement is a step toward the ball with the foot on that side. Your top hand leads the save — it's the first thing you present to the shooter. Keep your hands in front of your body, not behind you. Hands behind your body turn your body into the wall, not your stick.

For dodges from behind the cage: stay in front of your line, track the ball with your feet, and don't commit until the shooter commits. Most goals on the back side happen because the goalie moves too early. Be patient, let the attacker show you where they're going, then react.

Every practice session, spend 10 minutes on arc movement with no shots — just tracking. Walk the arc as the ball moves around the perimeter. Burn the footwork into muscle memory so it's automatic under pressure.`,
    questions: [
      {
        question: "What does 'cutting down the angle' mean?",
        options: ["Moving to the side of the cage", "Stepping toward the ball to reduce the shooter's target", "Staying in the center", "Crouching down"],
        correctAnswer: 1,
        explanation: "Moving toward the shooter reduces the visible net. The further out you step (within reason), the smaller the target.",
      },
      {
        question: "Which body part leads a save?",
        options: ["Your feet", "Your shoulder", "Your top hand", "Your chest"],
        correctAnswer: 2,
        explanation: "Lead with your top hand — it's the first thing presented to the shooter and controls the save.",
      },
      {
        question: "On a dodge from behind the cage, when should a goalie commit?",
        options: ["Immediately when they see the attacker", "Before the attacker moves", "After the attacker commits to a direction", "Never move"],
        correctAnswer: 2,
        explanation: "Moving too early gives the attacker a free lane. Be patient — react after they commit.",
      },
    ],
  },
]

export const ATTACK_LESSONS: AcademyLesson[] = [
  {
    id: "pos-attack-l1",
    videoUrl: "https://www.youtube.com/watch?v=ovd8u9ETUBk",
    lessonNumber: 103,
    title: "Dodging with Purpose",
    topic: "Fundamentals",
    pillar: "game",
    position: "attack",
    description: `A dodge isn't just moving with the ball — it's a decision. Every dodge should have a purpose: get to the cage, create a slide, or force a switch you can exploit. Dodging without a read is just running around.

The split dodge is your foundation. It works because you're changing your hands and direction at the same moment, forcing the defender to react to two threats simultaneously. The key is timing: sell the inside move first (shoulder dip, stutter step), then split away. If you split without selling the fake, a good defender won't bite and you've wasted your dodge.

The roll dodge is your answer when the defender plays your hands. Come at the defender, feel contact on your body or stick, then roll away using your body as a barrier between your stick and their check. The roll creates legal protection — your body shields the ball. Plant hard, roll tight to the defender (not wide), and accelerate out of the roll.

The face dodge is underused at the youth level. When a defender pokes or checks, let the ball go wide and bring it back as their stick misses. It's a small movement that creates a massive window — if you do it right, you gain two full steps.

The read that matters most: where is the slide coming from? Before you dodge, identify your adjacent defender. If they're watching you, your dodge draws a slide and you need to be ready to move the ball immediately. If they're turned away, you may have a lane all the way to the cage. Dodge into a read, not into a wall.`,
    questions: [
      {
        question: "What makes a split dodge effective?",
        options: ["Pure speed", "Selling the inside move first, then splitting away", "Using only your dominant hand", "Dodging at the defender's feet"],
        correctAnswer: 1,
        explanation: "The fake before the split forces the defender to react to two threats. Without the sell, a good defender won't bite.",
      },
      {
        question: "What is the key mechanic of a roll dodge?",
        options: ["Roll away from the defender wide", "Roll tight to the defender using your body as a barrier", "Switch hands mid-roll", "Only used from behind the cage"],
        correctAnswer: 1,
        explanation: "Rolling tight uses your body as legal protection. Rolling wide gives the defender a chance to recover.",
      },
      {
        question: "Before every dodge, what should an attacker identify?",
        options: ["Who the goalie is", "Where the slide is coming from", "The score", "How far they are from the cage"],
        correctAnswer: 1,
        explanation: "Identifying the slide before the dodge determines whether you finish or immediately distribute the ball.",
      },
    ],
  },
  {
    id: "pos-attack-l2",
    videoUrl: "https://www.youtube.com/watch?v=4KXp28yNO5Q",
    lessonNumber: 104,
    title: "Feeding and Playing Behind",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "attack",
    description: `Playing behind the goal is an art form. The X position (directly behind the cage) is one of the most valuable spots on the field — from X, you can see the entire offense and defense simultaneously. Great attackmen spend time behind the cage reading the whole picture, not just looking for their own dodge.

The key rule feeding from behind: feed to space, not to the player. Your cutter doesn't catch where they are — they catch where they're going. Lead them toward the cage, into the crease, or to a spot where they can catch and shoot in one motion. A feed that requires your cutter to stop, adjust, and reset is a turnover waiting to happen.

The two most dangerous feeds from X: the wrap feed (swing the ball from one side of the cage to the other as your teammate cuts through the crease from the opposite direction) and the skip feed (pick up a cutter on the far side of the field when the defense has overloaded to your side). Develop comfort delivering both.

Patience at X is a skill. You don't need to force something every time you receive the ball behind. Reset, let your cutters set up their defenders, identify who has the worst matchup, and then initiate. A great X attackman is like a point guard — they make everyone else better.

The behind-the-cage dodge: the most valuable is the sweep dodge to GLE (goal line extended). Carry from X, sweep toward GLE, either finish on the near pipe or draw the slide and feed the crease. This is a dangerous move because defenders can't body-check from behind — they can only play your stick, and a protected stick at full speed is nearly unstoppable.`,
    questions: [
      {
        question: "When feeding from behind the goal, where should you aim the pass?",
        options: ["To where the cutter is", "To where the cutter is going", "At the defender", "Always to the crease"],
        correctAnswer: 1,
        explanation: "Feed to space — lead the cutter toward the cage so they can catch and shoot in one motion.",
      },
      {
        question: "What makes the X position so valuable?",
        options: ["It's closest to the goal", "You can see the entire offense and defense simultaneously", "Defenders can't slide from there", "The goalie can't see you"],
        correctAnswer: 1,
        explanation: "X provides a full-field view — making it the best place to read and distribute the ball.",
      },
      {
        question: "What is the key to being patient at X?",
        options: ["Always dodge immediately", "Let cutters set up their defenders before initiating", "Only use skip feeds", "Wait for the coach to call a play"],
        correctAnswer: 1,
        explanation: "Patience at X lets the offense develop. Rush it and you force bad decisions under pressure.",
      },
    ],
  },
]

export const DEFENSE_LESSONS: AcademyLesson[] = [
  {
    id: "pos-defense-l1",
    videoUrl: "https://www.youtube.com/watch?v=VxGmfQUvX_k",
    lessonNumber: 105,
    title: "On-Ball Defense Fundamentals",
    topic: "Fundamentals",
    pillar: "game",
    position: "defense",
    description: `On-ball defense is not just about stopping the guy with the ball — it's about forcing him to make a decision you're already ready for. Great on-ball defenders don't react. They dictate.

Your stance is everything. Feet shoulder-width apart, slight bend in the knees, weight on the balls of your feet. Never stand flat-footed — a flat-footed defender is dead. Your hips should be lower than the attacker's, your stick active but controlled. Wild stick movement wastes energy and puts you off-balance.

Force direction. Before the dodge happens, decide where you want the attacker to go — usually toward your help (toward the slide). If the slide is on the left, force right. Body angle and foot placement communicate this to the attacker before they've decided. Make the easy path feel closed and the forced path feel possible. Then when they take the forced path — you and your slide are both ready.

The check: less is more. Stick checks should be short and sharp — a full swing takes you off-balance and opens a lane. A quick poke, slap, or lift is enough to disrupt a catch or interrupt a dodge. Check with your top hand, recover immediately. If you miss a check, get your feet back under you before attempting another.

Body positioning on a dodge: when the attacker commits to a split, you need to drop your lead foot back and cut off their lane. Don't lunge — drop step. Lunging leaves you flat and easy to beat. The drop step keeps your body between the attacker and the cage. If you get beat, chase on the inside lane and trust your slide.`,
    questions: [
      {
        question: "What does 'force direction' mean in on-ball defense?",
        options: ["Always push the attacker to the sideline", "Use your body angle to dictate where the attacker goes — usually toward your help", "Run at the attacker as fast as possible", "Check as hard as you can"],
        correctAnswer: 1,
        explanation: "Forcing direction means you and your slide are both set before the dodge happens. You control the read.",
      },
      {
        question: "What is the correct response to a split dodge?",
        options: ["Lunge at the attacker", "Drop step to cut off the lane while staying on your feet", "Swing your stick hard", "Call for help immediately"],
        correctAnswer: 1,
        explanation: "A drop step keeps you balanced. Lunging leaves you flat and easy to blow by.",
      },
      {
        question: "How should stick checks be executed?",
        options: ["Full arm swings for maximum power", "Short, sharp pokes or lifts — recover immediately after", "Never check, just play the body", "Check constantly to tire the attacker"],
        correctAnswer: 1,
        explanation: "Wild checks put you off balance. Short checks disrupt without sacrificing positioning.",
      },
    ],
  },
  {
    id: "pos-defense-l2",
    videoUrl: "https://www.youtube.com/watch?v=rbL9yXyCXtQ",
    lessonNumber: 106,
    title: "Slides, Rotations, and Communication",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "defense",
    description: `Sliding is a team skill. When it works, it's because every defender on the field anticipated the moment, communicated early, and moved before the play developed. When it breaks down, it's usually because of silence.

The two primary slide packages: adjacent and crease. Adjacent slides come from the defender closest to the ball — they crash on the dodge and leave their man. Crease slides come from the crease defender (or a middie dropping), who crashes while adjacent defenders rotate to fill. The slide package your team runs depends on your personnel and your opponent's tendencies — but every player needs to know both.

Communication sequence: The on-ball defender calls "Help!" the second they feel beat. The sliding defender calls "Slide!" before they move. The hot (the player covering the open man left by the slide) calls "I'm hot!" so everyone knows the rotation is set. Three calls, one clean slide. If any of them are missing, the rotation breaks.

The second slide — the "hot" — is where most slide packages die. Everyone knows to slide on the dodge. Almost no one is ready to be the second slide if the ball is moved to the hot. Study film and understand: when the ball is moved to your hot, are you ready to slide again? Do you know who becomes the new hot? This chain of rotations is what separates disciplined defenses from ones that give up easy goals.

Clearing after a save: the goalie's call starts the clear. "Ball! Ball! Ball!" means the goalie has it. Your job is to create a clear lane by moving away from the ball and letting the distribution develop. Bunching up around the goalie is the number one cause of botched clears — spread out and give the goalie options.`,
    questions: [
      {
        question: "What are the three communication calls in a clean slide?",
        options: ["Ready, Set, Go", "Help! / Slide! / I'm hot!", "Ball, Ball, Ball", "Switch, Rotate, Fill"],
        correctAnswer: 1,
        explanation: "Three specific calls chain the slide together. Missing any one of them breaks the rotation.",
      },
      {
        question: "Where do most slide packages break down?",
        options: ["On the initial slide", "On the second slide — when the ball moves to the hot", "At the start of the possession", "During clears"],
        correctAnswer: 1,
        explanation: "Everyone knows to slide on the dodge. Few are ready to be the second slide when the ball moves to the hot.",
      },
      {
        question: "What is the correct positioning for defenders during a clear?",
        options: ["Stay close to the goalie to help", "Spread out to give the goalie clear lanes and options", "All go to the same side", "Wait for the goalie to call your name"],
        correctAnswer: 1,
        explanation: "Spreading out creates clear passing lanes. Bunching is the number one cause of turnover clears.",
      },
    ],
  },
]

export const MIDFIELD_LESSONS: AcademyLesson[] = [
  {
    id: "pos-midfield-l1",
    videoUrl: "https://www.youtube.com/watch?v=BsilXuJ6Hrk",
    lessonNumber: 107,
    title: "The Midfielder's Two-Way Responsibility",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "midfield",
    description: `The midfield is the engine of any lacrosse team — and the most physically and mentally demanding position on the field. You have to be able to play offense and defense on the same possession, sometimes within ten seconds of each other. No other position in lacrosse demands that.

The most important habit for a midfielder: get back. When the ball turns over on offense, your first thought is "where is my man?" and your second thought is "how fast can I get there?" Defensive middies who don't get back after an offensive possession leave your team in a man-down situation every time. This is the number one thing coaches look for in a midfielder — does he get back?

On offense, the midfielder's primary job is moving the ball and creating transitions. You're the connector between attack and defense. When you carry the ball past midline, you need to read the situation immediately: is there a lane? Is the attack ready? Is your adjacent striker open? The best midfielders don't force dodges — they play at the pace the defense gives them.

The fast break is where middies win games. When you intercept or win a ground ball in the defensive end, your first look is always upfield. Attack has a step? Throw it immediately. The defense can't recover to a ball that's already past midfield. Hesitating on a fast break is one of the most costly mistakes a midfielder can make.

Physical conditioning is non-negotiable. If you're the kind of midfielder who needs a sub every two minutes, you're limiting your team's options. Work on your conditioning with purpose: sprint intervals, not long slow runs. Your game is thirty yards at full speed, a 10-second break, then thirty yards at full speed again. Train like that.`,
    questions: [
      {
        question: "What is the most important habit for a midfielder after a turnover?",
        options: ["Sprint to the ball", "Immediately locate your man and get back on defense", "Yell at the attacker who lost the ball", "Wait to see if the team gets it back"],
        correctAnswer: 1,
        explanation: "A midfielder who doesn't get back leaves the team in a man-down situation every time.",
      },
      {
        question: "On a fast break, when should you throw the ball to an open attacker?",
        options: ["After you cross midfield", "Immediately if the attacker has a step — don't hesitate", "Only if the coach signals", "After surveying the field for 3 seconds"],
        correctAnswer: 1,
        explanation: "Hesitating on a fast break lets the defense recover. Move the ball immediately when the opportunity is there.",
      },
      {
        question: "What type of conditioning best prepares a midfielder?",
        options: ["Long slow distance runs", "Sprint intervals that mirror game situations — 30 yards hard, brief rest, repeat", "Only practice drills", "Weight training only"],
        correctAnswer: 1,
        explanation: "Midfield is sprint-based. Train with sprint intervals, not long slow runs.",
      },
    ],
  },
]

// ─── INJECT POSITION LESSONS INTO COURSES ────────────────────────────
// Override getAcademyCourses to merge position-specific bonus lessons

// ─── MIDFIELD BONUS LESSONS (appended to MIDFIELD_LESSONS) ───────────

const MIDFIELD_LESSONS_EXTRA: AcademyLesson[] = [
  {
    id: "pos-midfield-l2",
    videoUrl: "https://www.youtube.com/watch?v=mQi0UQz_8ls",
    lessonNumber: 108,
    title: "Reading the Ride and Clear",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "midfield",
    description: `The ride and clear is where midfield IQ separates good players from great ones. Every time possession changes, you're either riding (trying to force a turnover as the defense clears) or clearing (trying to move the ball safely to your offense). You'll be in both roles multiple times every game.

RIDING: The midfielder's job on a ride is to apply pressure on the clearing defenders while not getting beat for an easy outlet. Pick your man — usually the defender who is one pass away from the goalie — and apply controlled pressure. Don't over-commit to the point where you get spun around and they've got a 4v3 going the other way. Ride with your stick active, cutting off the passing lane, and forcing the ball toward the sideline.

The most valuable thing a middie can do on a ride: make the clearing team use their time. Every second you make them burn is a second your offense doesn't have to defend. A well-organized ride that runs out the shot clock — even if you don't cause a turnover — is a win.

CLEARING: When your team has the ball and is clearing, your job is to get open. Get width — run toward your sideline and create a clear passing lane away from the defense. Don't crowd the goalie or your defensemen. The goalie needs options: one defender going up each sideline, one midfielder filling the middle corridor, and one attacker breaking toward midfield to give the longest outlet.

The cardinal mistake midfielders make on clears: running toward the ball instead of away from it. Instinct says go help — instinct is wrong. Running toward the ball brings your defender with you and eliminates the space. Run away, create space, give your teammate a lane.

Timing on the clear: when your defenseman has the ball and is being pressured, your signal to break is when his feet stop moving. A defender standing still is about to make a pass — that's when you sprint to your lane and give a target.`,
    questions: [
      {
        question: "What is a midfielder's primary job when riding?",
        options: [
          "Sprint to the goalie and check his stick",
          "Apply controlled pressure on a clearing defender while cutting off the passing lane",
          "Wait at midfield for the clear",
          "Pressure every defender at once",
        ],
        correctAnswer: 1,
        explanation: "Controlled pressure on one clearing lane — forcing the ball toward the sideline without over-committing.",
      },
      {
        question: "On a clear, why should midfielders run AWAY from the ball?",
        options: [
          "To rest",
          "Running toward the ball brings a defender with you and eliminates space",
          "The coach tells you to",
          "It's not true — run to the ball",
        ],
        correctAnswer: 1,
        explanation: "Creating space is the job. Running toward the ball collapses lanes. Run away, create the outlet.",
      },
      {
        question: "When is the right moment for a midfielder to sprint to his clearing lane?",
        options: [
          "Immediately after the goalie makes a save",
          "When the defenseman's feet stop moving — he's about to make a pass",
          "When the coach calls for it",
          "At the start of the possession",
        ],
        correctAnswer: 1,
        explanation: "A defender standing still is about to pass. That's your signal to break to your lane and give a target.",
      },
    ],
  },
  {
    id: "pos-midfield-l3",
    videoUrl: "https://www.youtube.com/watch?v=zEtzK0HGeao",
    lessonNumber: 109,
    title: "Wing Play and Transition Offense",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "midfield",
    description: `Wing play is the most undercoached skill in lacrosse. Most players think of the wings as just a spot to run through on transition — but elite midfielders use the wings to control tempo, create angles, and set up the entire offensive system.

THE WING AS AN OUTLET: When your defense has the ball in your defensive end, the wings are the safest clearing outlets. A midfielder running hard at the wing sideline gives the clearing defenseman a passing target that is away from the ride pressure. As soon as you receive the pass on the wing, you have two decisions: push pace if you have a numbers advantage, or hold the ball and let the offense set up if you don't.

TRANSITION READS FROM THE WING: As you carry the ball up the wing in transition, you're reading three things simultaneously. First: is the goalie outlet pass open for a fast break? Second: is your adjacent attacker open for a quick pass inside? Third: are you getting pressure, and do you need to reset? The answer to the first question determines everything that follows. If there's a break — push it. If there isn't — slow down and set up.

THE WING IN SETTLED OFFENSE: Too many middies disappear once the ball reaches the attackmen in settled offense. Don't. As a midfielder in settled offense, you have two jobs: crashing on shots (get to the crease, be there for the rebound) and maintaining defensive balance (if you go to the crease, someone has to be ready to get back if the ball turns over). Every time the ball goes to the wing in settled offense, the closest midfielder should be moving — either cutting or positioning to crash.

CHANGING THE POINT OF ATTACK: One of the most valuable things a wing midfielder can do is skip the ball to the opposite wing. Defenses collapse toward the ball — a skip pass from one wing to the other shifts the entire defense and creates an open look before the defense can recover. If you're on the wing and the far side looks open — don't hesitate.`,
    questions: [
      {
        question: "What are a midfielder's two jobs in settled offense?",
        options: [
          "Dodge and shoot",
          "Crash on shots for rebounds AND maintain defensive balance if the ball turns over",
          "Stand at the midline and watch",
          "Feed the attack only",
        ],
        correctAnswer: 1,
        explanation: "Crashing creates second-chance opportunities. Maintaining balance prevents fast breaks the other way.",
      },
      {
        question: "Why is a skip pass from one wing to the other so valuable?",
        options: [
          "It's a long pass that impresses scouts",
          "It shifts the entire defense and creates an open look before the defense can recover",
          "It avoids the defense entirely",
          "Only works in man-up situations",
        ],
        correctAnswer: 1,
        explanation: "Defenses collapse toward the ball. A skip pass outpaces the defensive rotation and creates open shots.",
      },
      {
        question: "On transition from the wing, what is the FIRST thing you read?",
        options: [
          "Is there a defensive player near you",
          "Is the goalie outlet or fast break opportunity available",
          "What the coach wants",
          "Where the ball is going next",
        ],
        correctAnswer: 1,
        explanation: "The fast break question comes first — if the break is on, push pace immediately. Everything else follows.",
      },
    ],
  },
  {
    id: "pos-midfield-l4",
    videoUrl: "https://www.youtube.com/watch?v=BsilXuJ6Hrk",
    lessonNumber: 110,
    title: "Defensive Responsibilities Off-Ball",
    topic: "Fundamentals",
    pillar: "game",
    position: "midfield",
    description: `Off-ball defense is where midfield games are won and lost. When you're not on the ball — which is most of the time — your positioning, communication, and anticipation determine whether your team gives up goals or forces turnovers.

POSITIONING OFF-BALL: As a midfielder defending off-ball, you want to be in a position where you can see both your man AND the ball at the same time. This is called "playing the triangle" — you, your man, and the ball form a triangle, and you position yourself inside that triangle, closer to the goal, with your head on a swivel. If you turn your back to the ball to face your man, you lose track of the entire game. If you face only the ball, your man runs free.

SLIDE READINESS: In most defensive systems, the on-ball midfielder is the primary slide for an adjacent dodger. Before the dodge happens, you need to know: "If the ball carrier beats my teammate, am I ready to go?" This means you're actively watching the ball carrier's speed and direction, not standing flat on your heels. You're on the balls of your feet, hips low, ready to crash the moment your teammate calls "Help!"

SWITCHING AND COMMUNICATION: When two offensive players set a pick, midfielders have to communicate immediately. "Switch!" means you trade defensive assignments. "Fight through!" means your teammate is going to push through the pick and stay with his man. These two calls have to happen before the pick is set — if you're calling them after, you're already late. The defender who goes through the pick first makes the call.

BALL WATCHING: The most common off-ball defensive mistake is ball watching — you get so focused on watching the ball that your man runs to an open spot and you don't notice until it's too late. Discipline yourself to split your attention: two glances at the ball for every one check on your man. Watch his hips, not his hands — hips tell you where a player is actually going.`,
    questions: [
      {
        question: "What does 'playing the triangle' mean for off-ball defenders?",
        options: [
          "Standing in a triangle formation with teammates",
          "Positioning between your man and the ball so you can see both simultaneously",
          "Guarding three players at once",
          "A zone defense concept",
        ],
        correctAnswer: 1,
        explanation: "The triangle is you, your man, and the ball. Stay inside it so you can see both without turning your back on either.",
      },
      {
        question: "When should a pick-switch or fight-through call be made?",
        options: [
          "After the pick is set",
          "Before the pick is set — if you're calling it after, you're already late",
          "Only if the coach signals",
          "Never — figure it out as it happens",
        ],
        correctAnswer: 1,
        explanation: "Communication has to happen before the screen. Post-pick calls are reactive and usually too late.",
      },
      {
        question: "What body part should you watch to know where an offensive player is going?",
        options: [
          "Their hands",
          "Their eyes",
          "Their hips — hips tell you the true direction",
          "Their stick head",
        ],
        correctAnswer: 2,
        explanation: "Hips don't lie. Hands and eyes can fake — where the hips go is where the player is going.",
      },
    ],
  },
  {
    id: "pos-midfield-l5",
    videoUrl: "https://www.youtube.com/watch?v=qtwKIxyOdGk",
    lessonNumber: 111,
    title: "The Complete Midfielder",
    topic: "Mental Game",
    pillar: "leadership",
    position: "midfield",
    description: `The great midfielders in lacrosse share one characteristic: they don't hide. When their team is tired, they're still running. When there's a 50/50 ground ball at midfield with a minute left, they're going for it. When the offense stalls, they're the ones who make a move to break it open. They don't wait for the game to come to them.

This is the standard for a complete midfielder: every shift counts. You don't ease into a shift. You don't coast when your team has a comfortable lead. Every time you're on the field, you play at the pace that sets the tone for everyone around you. Your energy is contagious — and so is your lack of energy.

GROUND BALLS ARE YOUR GAME. The midfield battle is decided at midfield, and midfield battles are decided on the ground. If you're not winning your share of ground balls, you're not doing your job. This requires more than athleticism — it requires mental commitment. You have to be willing to go to the ground, take contact, and come up with the ball in situations where the outcome is uncertain. Players who hesitate on ground balls lose them. Players who commit — fully, without flinching — win them.

BE THE CONNECTOR. The best middies aren't necessarily the best athletes on the field. They're the ones who make the team work better as a unit. They communicate on every defensive rotation. They release the ball quickly in transition to keep the pace. They crash on shots to give their attack second chances. They get back on defense to protect their goalie. They do the work that doesn't show up in the stat sheet but shows up in the final score.

SELF-SCOUTING: After every game, ask yourself three questions. Did I get back on defense every possession? Did I win my share of ground balls? Did I keep my pace up for the full game? If you can honestly answer yes to all three, you had a good game — regardless of whether you scored.`,
    questions: [
      {
        question: "What sets great midfielders apart from good ones?",
        options: [
          "Speed and size",
          "They don't hide — they compete on every shift, every ground ball, every defensive rep",
          "They score the most goals",
          "They have the best dodges",
        ],
        correctAnswer: 1,
        explanation: "Great midfielders are consistent. They compete on every play, set the tone with their energy, and do the unsexy work.",
      },
      {
        question: "Why do players who hesitate on ground balls lose them?",
        options: [
          "They're slower",
          "Full commitment wins ground balls — hesitation creates doubt and the opponent fills the space",
          "Ground balls are random",
          "Smaller players can't win ground balls",
        ],
        correctAnswer: 1,
        explanation: "Ground balls go to the player who commits fully. Hesitation costs you the split-second that decides possession.",
      },
      {
        question: "What are the three self-scout questions a midfielder should ask after every game?",
        options: [
          "How many goals, assists, and ground balls did I get?",
          "Did I get back on defense? Did I win ground balls? Did I keep my pace the full game?",
          "Did I play well? Did the coach notice me? Did we win?",
          "Did I dodge well? Did I shoot on goal? Did I communicate?",
        ],
        correctAnswer: 1,
        explanation: "These three questions cover the three core responsibilities of a midfielder — they reveal your real contribution regardless of stats.",
      },
    ],
  },
]

// ─── FOGO LESSONS (Draw Specialist — Girls) ─────────────────────

export const FOGO_LESSONS: AcademyLesson[] = [
  {
    id: "pos-fogo-l1",
    videoUrl: "https://www.youtube.com/watch?v=u9eYaW06iv0",
    lessonNumber: 112,
    title: "What Is the Draw and Why It Controls the Game",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "fogo",
    description: `The draw is the most underrated position in girls lacrosse. Every possession starts here. Every goal scored or prevented begins with who wins the draw — and the team that controls possession controls the game.

In girls lacrosse, the draw happens at the center of the field between two players. Each draw specialist holds the ball between the two sticks at waist height, and on the whistle, both players draw their sticks up and back, trying to direct the ball toward their teammates. Winning the draw doesn't just mean touching the ball first — it means controlling where it goes.

The math is simple. At the high school level, games have 20-30 draws. If your team wins 65% of them, that's 4-6 extra possessions. At a game where each possession has a low scoring percentage, those extra possessions are often the exact margin of victory. A dominant draw specialist is worth more to her team than most people realize — and recruiting coaches absolutely know this.

The draw specialist role requires a rare combination: quick hands, explosive upward wrist snap, body positioning, and spatial intelligence. You are not just reacting — you are reading your opponent's body, anticipating her tendencies, and directing the ball to your teammate who is already in position.

This is one of the few positions in sports where one player can completely change a game's outcome through a single specialized skill. If you're a draw specialist, own it. Master the technique, develop your counters, study your opponents, and build the mental toughness to compete 20+ times in a single game without carrying a loss into the next one.`,
    questions: [
      {
        question: "When does a draw occur in girls lacrosse?",
        options: [
          "Only at the start of the game",
          "At the start of each half and after every goal",
          "Once per quarter",
          "Only after penalties",
        ],
        correctAnswer: 1,
        explanation: "Draws happen at the start of each half and after every goal — meaning a draw specialist can compete 20-30+ times in a single game.",
      },
      {
        question: "What makes the draw specialist position so strategically important?",
        options: [
          "It looks impressive to college coaches",
          "Winning draws directly controls possession — the team with more possessions creates more scoring opportunities",
          "It only matters in close games",
          "Draw specialists score the most goals",
        ],
        correctAnswer: 1,
        explanation: "Possession = opportunity. Winning 65% of 30 draws is 4-6 extra possessions — that margin often decides games.",
      },
      {
        question: "What does winning the draw actually mean — beyond just touching the ball first?",
        options: [
          "Getting your stick on the ball before the opponent",
          "Directing the ball to a positioned teammate who can secure possession",
          "Knocking the ball away from the opponent",
          "Getting the ball out of the circle fastest",
        ],
        correctAnswer: 1,
        explanation: "Winning the draw means controlling where the ball goes — directing it to a teammate already in position. Touching it first but sending it to the opponent is not a win.",
      },
    ],
  },
  {
    id: "pos-fogo-l2",
    videoUrl: "https://www.youtube.com/watch?v=r7jVWC4HeY0",
    lessonNumber: 113,
    title: "Draw Mechanics — Setup, Snap, and Control",
    topic: "Fundamentals",
    pillar: "game",
    position: "fogo",
    description: `Every draw starts with correct mechanics. Before you develop counters or advanced reads, the foundation has to be clean — because a technical mistake on the setup costs you the draw before the whistle even blows.

SETUP POSITION
Feet shoulder-width apart, knees slightly bent, weight balanced and ready to move. Your dominant foot should be slightly back. Hold the stick at waist height with the ball sitting in the pocket between both sticks. Your grip: top hand firm, bottom hand relaxed as a guide. Eyes locked on the ball and aware of where your teammate is positioned.

THE SNAP
On the whistle, your wrists snap upward and outward in one explosive motion. The power comes from the wrists — not the arms, not the shoulders. Think of snapping a towel. The faster and more precise your wrist snap, the more control you have over where the ball goes. Drive the head of your stick up and slightly toward your dominant wing to direct the ball there.

BODY POSITION AND CONTACT
In girls lacrosse, incidental body contact is allowed during the draw. Use your body to create space. Step slightly into your opponent as you snap — not a shove, but a controlled body positioning that gives you an extra inch of separation and directs the ball where you want it. Low body position gives you leverage — if you're standing upright, your opponent who stays low has more control.

THE DIRECT DRAW vs. THE WING DRAW
You have two primary options on every draw: direct (snap straight up and toward your dominant side for a wing teammate) or wing (flick outward to the 8-meter arc where your wing player is positioned). Know before the whistle which you're executing. Committed draws beat reactive ones every time.

REP COUNT MATTERS
Draw mechanics become muscle memory only through repetition. With a partner: 10 setup reps, 10 slow-motion snaps tracking the ball direction, 10 full-speed reps. Daily practice, not just at team practice. The draw specialists who dominate at the college level all have thousands of solo reps built in before they ever step in the circle with an opponent.`,
    questions: [
      {
        question: "Where does the power in the draw snap come from?",
        options: [
          "Arm strength and shoulder rotation",
          "An explosive wrist snap — not the arms or shoulders",
          "Full body momentum",
          "The grip strength of the bottom hand",
        ],
        correctAnswer: 1,
        explanation: "The wrist snap is the engine of the draw. Arm movement is too slow and less precise — a fast, explosive wrist snap gives you the speed and directional control you need.",
      },
      {
        question: "What is the difference between a direct draw and a wing draw?",
        options: [
          "One is legal and one is a foul",
          "Direct snaps up toward your dominant-side wing; wing flicks outward to a player positioned at the 8-meter arc",
          "One is used when winning, one when losing",
          "They are the same thing with different names",
        ],
        correctAnswer: 1,
        explanation: "Direct and wing draws are different directional intentions — and committing to one before the whistle produces a more precise, controlled outcome than deciding after.",
      },
      {
        question: "Why does body position matter in the draw circle?",
        options: [
          "It makes you look more athletic",
          "Low body position gives leverage — and legal body contact can be used to create separation and direct the ball",
          "It only matters for taller players",
          "Body position has no effect in draws",
        ],
        correctAnswer: 1,
        explanation: "A lower, balanced position gives you leverage over an upright opponent. Combined with controlled body contact, this is how elite draw specialists create space and direct the ball.",
      },
    ],
  },
  {
    id: "pos-fogo-l3",
    videoUrl: "https://www.youtube.com/watch?v=qkC3QUMjGBc",
    lessonNumber: 114,
    title: "Draw Counters and Reading Your Opponent",
    topic: "Lacrosse IQ",
    pillar: "game",
    position: "fogo",
    description: `Once your base mechanics are solid, the next level of draw mastery is reading and countering your opponent. Every draw specialist you face has tendencies — a preferred direction she snaps to, a setup tell, a timing pattern. Your job is to identify those tendencies and counter them before she executes.

SCOUTING IN THE CIRCLE
The first two draws in a game are data. Watch her setup foot. Watch where her bottom hand grips. Watch the angle of her stick head before the whistle. Most draw specialists have a dominant direction — they prefer snapping left or right. Watch her first draw carefully even if you lose it: that information is more valuable than the one possession.

THE COUNTER SNAP
When you've identified your opponent's preferred direction, the counter snap uses that against her. As she snaps in her dominant direction, you anticipate and redirect — your wrist snap goes above hers and opposite, disrupting her control and directing the ball to your wing instead. Timing is everything: you're not reacting to her, you're reading her setup and acting simultaneously.

THE PUSH DRAW
Instead of snapping up, the push draw drives the ball forward toward the opponent's side — catching draw specialists who expect the upward snap. It's a change-of-pace move that works when your opponent is so locked into countering your snap that she's overcommitted upward. Used sparingly, it's extremely effective.

THE LONG DRAW
A long draw directs the ball far up the field to a midfielder running in transition. This requires your wing players to be in specific positions — it's a set play you execute as a team, not a solo decision. When your team has scouted that the opponent's defense is slow to transition, the long draw can turn a draw directly into a fast break.

PRE-GAME PREPARATION
Before every game: watch film if available. What direction does their draw specialist prefer? Does she have a tell in her setup? Does she change technique after she loses a draw? The best draw specialists in the country are students of the game. They win draws in the film room before they step into the circle.`,
    questions: [
      {
        question: "What should you do during the first two draws of a game, even if you lose them?",
        options: [
          "Try harder on the next draw",
          "Gather data — watch her setup foot, grip, stick angle, and preferred snap direction",
          "Call a timeout immediately",
          "Switch to a different draw technique",
        ],
        correctAnswer: 1,
        explanation: "The first two draws are scouting opportunities. That information — her dominant direction and setup tells — is often worth more than the possessions.",
      },
      {
        question: "What is the push draw and when does it work best?",
        options: [
          "A draw that uses more arm strength",
          "Driving the ball forward instead of up — most effective against opponents who are overcommitted to countering the upward snap",
          "A draw that goes directly to the goalie",
          "A draw used only in overtime",
        ],
        correctAnswer: 1,
        explanation: "The push draw is a change-of-pace. When an opponent is anticipating and countering your snap upward, going forward catches her out of position. Used sparingly, it's highly effective.",
      },
      {
        question: "What makes the long draw a team play rather than a solo decision?",
        options: [
          "It requires approval from the coach",
          "It requires your midfielders to already be in transition position — it's a set play executed together, not an individual choice",
          "Only the fastest player can execute it",
          "It's only legal in the second half",
        ],
        correctAnswer: 1,
        explanation: "A long draw sends the ball far upfield into transition. Without your midfielders already running and positioned, the ball goes to no one. It's a coordinated team action.",
      },
    ],
  },
  {
    id: "pos-fogo-l4",
    videoUrl: "https://www.youtube.com/watch?v=psBgWXV2mVs",
    lessonNumber: 115,
    title: "The Draw Specialist Mindset",
    topic: "Mental Game",
    pillar: "leadership",
    position: "fogo",
    description: `The draw specialist is one of the most mentally demanding roles in girls lacrosse. You compete one-on-one, in front of both teams, after every goal and at the start of every period. Every result — win or loss — is visible to everyone on the field. There is nowhere to hide.

This visibility is a gift, not a burden. The draw specialists who thrive at the highest levels are the ones who learn to compete in that pressure rather than contract under it.

THE RESET ROUTINE
Every elite draw specialist develops a reset routine after a lost draw. Not a superstition — a physical anchor. For some it's a specific breath before stepping back into the circle. For others it's a short phrase they say to themselves. Whatever the form, the function is always the same: it signals to your nervous system that the last draw is finished and the next one starts clean. Without a reset, your brain carries the last loss forward — and compound losses are how draw specialists fall apart in the fourth quarter when games are on the line.

COMPETING WHEN YOU'RE LOSING THE DRAW BATTLE
Every draw specialist faces games where the opponent has her number. She's reading your tendencies, your counters aren't landing, you're losing possession after possession. What separates the great ones is what they do in those moments. They slow down. They go back to fundamentals — setup, snap, body position. They try one new direction and commit fully. They stay in the battle when it's uncomfortable. Draw battles are won and lost over the course of a game, not a single possession.

YOUR ROLE BETWEEN DRAWS
Draw specialists who are not in the circle should be the most active observers on the sideline. Watch every draw you're not in. What is her pattern right now? Did she adjust from the last one? What is her wing setup telling you about her intended direction? The preparation you do watching from the sideline is often what wins you the draw you take next.

OWNING THE POSITION
The draw is one of the most impactful single-player roles in the sport. Own it. Study it. Practice it daily. The players who dominate draws at the college level didn't get there by only doing draws at team practice — they built their skill through thousands of independent reps, film study, and the competitive mentality to step into the circle with something to prove every single time.`,
    questions: [
      {
        question: "What is the purpose of a draw specialist's reset routine after losing a draw?",
        options: [
          "To appear calm to the referee",
          "To signal to your nervous system that the last draw is over and the next one starts clean",
          "To slow the game down",
          "To communicate with teammates",
        ],
        correctAnswer: 1,
        explanation: "A reset routine prevents one lost draw from bleeding into the next. Compound losses — where one loss affects the next — are how draw specialists unravel in pressure moments.",
      },
      {
        question: "When you are losing the draw battle in a game, what is the right response?",
        options: [
          "Panic and change everything at once",
          "Slow down, return to fundamentals, commit fully to one new direction, and stay in the battle",
          "Ask to be substituted",
          "Try harder with the same technique",
        ],
        correctAnswer: 1,
        explanation: "Draw battles are won over the course of a game. The response to losing is controlled — slow down, reset to fundamentals, make one adjustment, and compete.",
      },
      {
        question: "What should a draw specialist do while on the sideline between draws?",
        options: [
          "Rest and recover",
          "Study the opponent's draw specialist — watch for pattern changes and wing positioning tells",
          "Talk to teammates about other things",
          "Prepare physically for the next draw",
        ],
        correctAnswer: 1,
        explanation: "Sideline observation is part of the job. Watching the opponent's tendencies between your draws gives you the read you need to win the next one.",
      },
    ],
  },
]
const BOYS_POSITION_LESSONS: AcademyLesson[] = [
  ...GOALIE_LESSONS,
  ...ATTACK_LESSONS,
  ...DEFENSE_LESSONS,
  ...MIDFIELD_LESSONS,
  ...MIDFIELD_LESSONS_EXTRA,
  ...FOGO_LESSONS,
]

// Girls position lessons: same structure, gender-appropriate videos
const GIRLS_POSITION_LESSONS: AcademyLesson[] = [
  // Goalie
  {
    ...GOALIE_LESSONS[0],
    id: "pos-goalie-girls-l1",
    videoUrl: "https://www.youtube.com/watch?v=wORmAJzdBMI",  // Women's Lacrosse Goalie Training
  },
  {
    ...GOALIE_LESSONS[1],
    id: "pos-goalie-girls-l2",
    videoUrl: "https://www.youtube.com/watch?v=pgJzzpjrdFA",  // Ropes Video Shooting Space - Girls
  },
  // Attack
  {
    ...ATTACK_LESSONS[0],
    id: "pos-attack-girls-l1",
    videoUrl: "https://www.youtube.com/watch?v=7deaRXF70Q8",  // Top 3 Dodge Moves Girls
  },
  {
    ...ATTACK_LESSONS[1],
    id: "pos-attack-girls-l2",
    videoUrl: "https://www.youtube.com/watch?v=RwMQvpad-XE",  // Taylor Cummings Cutting
  },
  // Defense
  {
    ...DEFENSE_LESSONS[0],
    id: "pos-defense-girls-l1",
    videoUrl: "https://www.youtube.com/watch?v=3f3EEGr6WZk",  // Women's Lacrosse Defensive Footwork
  },
  {
    ...DEFENSE_LESSONS[1],
    id: "pos-defense-girls-l2",
    videoUrl: "https://www.youtube.com/watch?v=2v4vfqctG88",  // Intro to Team Defense Adjacent Slides
  },
  // Midfield
  {
    ...MIDFIELD_LESSONS[0],
    id: "pos-midfield-girls-l1",
    videoUrl: "https://www.youtube.com/watch?v=IEt5iXnMtsw",  // NORTH 2-3-1 Motion
  },
  {
    ...MIDFIELD_LESSONS[1],
    id: "pos-midfield-girls-l2",
    videoUrl: "https://www.youtube.com/watch?v=dxvAw7zudVg",  // Charlotte North Shooting Drill
  },
  ...(MIDFIELD_LESSONS_EXTRA.map((l, i) => ({
    ...l,
    id: `pos-midfield-girls-extra-l${i + 1}`,
  }))),
  // FOGO → Draw for girls
  ...FOGO_LESSONS.map((l, i) => ({
    ...l,
    id: `pos-draw-girls-l${i + 1}`,
  })),
]

export function getAcademyCoursesWithPositions(gender: Gender): AcademyCourse[] {
  const base = getAcademyCourses(gender)
  const positionLessons = gender === "boys" ? BOYS_POSITION_LESSONS : GIRLS_POSITION_LESSONS
  // Add position-specific lessons to each course (they show under position filter)
  return base.map((course) => ({
    ...course,
    lessons: [...course.lessons, ...positionLessons],
  }))
}
