import type { Gender } from "@/types"

// ─── TYPES ────────────────────────────────────────────────────────────

export type AgeTier = "youth" | "middle" | "high"
export type Pillar = "game" | "leadership" | "team"

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface AcademyLesson {
  id: string
  lessonNumber: number
  title: string
  topic: "Fundamentals" | "Lacrosse IQ" | "Mental Game" | "Character"
  pillar: Pillar
  description: string
  videoUrl?: string
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
  gender: "boys" | "girls"
  tier: AgeTier
  completedAt: string
}

// ─── PILLAR CONFIG ───────────────────────────────────────────────────

export const PILLAR_CONFIG: Record<Pillar, { label: string; description: string }> = {
  game: { label: "The Game", description: "Learn fundamentals, positions, strategy, and how to play at the next level." },
  leadership: { label: "Leadership", description: "Develop the habits, mindset, and character that set leaders apart." },
  team: { label: "Team", description: "Understand what makes teams win — trust, sacrifice, and competing together." },
}

export const PILLAR_ORDER: Pillar[] = ["game", "leadership", "team"]

// ─── WALL OF FAME ─────────────────────────────────────────────────────

const WOF_KEY = "btb-wall-of-fame"

const SEED_WALL: WallOfFameEntry[] = [
  { name: "Jake Morrison", gender: "boys", tier: "middle", completedAt: "2026-02-22" },
  { name: "Sophia Marino", gender: "girls", tier: "youth", completedAt: "2026-03-03" },
  { name: "Liam O'Brien", gender: "boys", tier: "high", completedAt: "2026-03-10" },
  { name: "Ava Rodriguez", gender: "girls", tier: "middle", completedAt: "2026-03-14" },
]

export function getWallOfFame(): WallOfFameEntry[] {
  try {
    const raw = localStorage.getItem(WOF_KEY)
    if (raw) return JSON.parse(raw)
    localStorage.setItem(WOF_KEY, JSON.stringify(SEED_WALL))
    return SEED_WALL
  } catch {
    return SEED_WALL
  }
}

export function addToWallOfFame(name: string, gender: Gender, tier: AgeTier): WallOfFameEntry[] {
  const entries = getWallOfFame()
  const entry: WallOfFameEntry = {
    name,
    gender,
    tier,
    completedAt: new Date().toISOString().split("T")[0],
  }
  const updated = [...entries, entry]
  localStorage.setItem(WOF_KEY, JSON.stringify(updated))
  return updated
}

// ─── PROGRESS TRACKING ────────────────────────────────────────────────

const PROGRESS_KEY = "btb-academy-progress"

interface AcademyProgress {
  [courseId: string]: {
    completedLessons: string[]
    completedAt?: string
  }
}

export function getAcademyProgress(): AcademyProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function markLessonComplete(courseId: string, lessonId: string): void {
  const progress = getAcademyProgress()
  if (!progress[courseId]) {
    progress[courseId] = { completedLessons: [] }
  }
  if (!progress[courseId].completedLessons.includes(lessonId)) {
    progress[courseId].completedLessons.push(lessonId)
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function markCourseComplete(courseId: string): void {
  const progress = getAcademyProgress()
  if (!progress[courseId]) {
    progress[courseId] = { completedLessons: [] }
  }
  progress[courseId].completedAt = new Date().toISOString().split("T")[0]
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
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
    videoUrl: "https://www.youtube.com/watch?v=qXhkg0wEKDY",
    lessonNumber: 1,
    title: "Welcome to Lacrosse",
    topic: "Fundamentals",
    pillar: "game",
    description: `Lacrosse is the fastest game on two feet, and it's been called the "Creator's Game" because of its Native American origins. The sport combines elements of soccer, hockey, and basketball into one fast-paced game.\n\nYou play with a stick called a "crosse" that has a head and a pocket. You use it to catch, carry, and throw a small rubber ball. The goal is simple: put the ball in the other team's net.\n\nIn boys lacrosse, you wear a helmet, gloves, and pads because the game is physical. You can check sticks and bodies (when you're old enough). Each team has 10 players on the field — 3 attackmen, 3 midfielders, 3 defensemen, and 1 goalie.\n\nThe game is played in 4 quarters. The team with the most goals at the end wins. You can score from anywhere on the field, but most goals come from up close to the net.\n\nLacrosse rewards effort. The kids who hustle, who chase ground balls, and who work hard in practice are the ones who get better fastest. Skill takes time — but effort is a choice you make every day.`,
    questions: [
      {
        question: "How many players are on the field per team in boys lacrosse?",
        options: ["8", "9", "10", "11"],
        correctAnswer: 2,
        explanation: "10 players: 3 attack, 3 midfield, 3 defense, and 1 goalie.",
      },
      {
        question: "What is the lacrosse stick called?",
        options: ["A racket", "A crosse", "A bat", "A staff"],
        correctAnswer: 1,
        explanation: "The lacrosse stick is called a crosse — that's where the sport gets its name.",
      },
      {
        question: "What's the most important thing for a young player to bring to practice every day?",
        options: ["A brand new stick", "Effort", "The fastest shot", "Height"],
        correctAnswer: 1,
        explanation: "Effort is something you can control every day. Skills come with time, but effort is a choice.",
      },
    ],
  },
  {
    id: "boys-youth-l2",
    videoUrl: "https://www.youtube.com/watch?v=a4fWOtC8C7Q",
    lessonNumber: 2,
    title: "How to Hold and Cradle Your Stick",
    topic: "Fundamentals",
    pillar: "game",
    description: `Cradling is how you keep the ball in your stick while you run. If you don't cradle, the ball falls out — it's that simple. Good cradling is the foundation of every lacrosse skill.\n\nStart with your top hand near the head of the stick and your bottom hand near the bottom (called the "butt end"). Your top hand does most of the work. Your bottom hand is just a guide.\n\nThe motion is a small wrist roll — like turning a doorknob back and forth. Don't swing your arm. Keep the stick close to your body and your top hand near your ear when you're protecting the ball.\n\nWhen you cradle, the ball stays pressed against the side of the pocket because of centripetal force (a fancy word for what happens when you spin something in a circle — it stays put). If you cradle too fast or too slow, the ball will pop out.\n\nPractice cradling everywhere — walking around your house, watching TV, in the backyard. The more reps you get, the more natural it feels. The best players in the world cradle without thinking about it. That's the goal.`,
    questions: [
      {
        question: "Which hand does most of the work when you cradle?",
        options: ["Bottom hand", "Top hand", "Both equally", "Neither — it's all wrist"],
        correctAnswer: 1,
        explanation: "Your top hand near the head of the stick controls the cradle. The bottom hand is a guide.",
      },
      {
        question: "What does cradling do?",
        options: [
          "Makes you run faster",
          "Keeps the ball in your stick while you move",
          "Helps you shoot harder",
          "Makes the stick lighter",
        ],
        correctAnswer: 1,
        explanation: "Cradling keeps the ball in the pocket through wrist motion as you run.",
      },
      {
        question: "Where should you practice cradling?",
        options: [
          "Only at practice",
          "Only on a lacrosse field",
          "Everywhere — even watching TV",
          "Only with a coach watching",
        ],
        correctAnswer: 2,
        explanation: "The more reps the better. Cradle constantly until it feels natural.",
      },
    ],
  },
  {
    id: "boys-youth-l3",
    videoUrl: "https://www.youtube.com/watch?v=4iOD3TjV6D8",
    lessonNumber: 3,
    title: "Catching and Throwing",
    topic: "Fundamentals",
    pillar: "game",
    description: `Catching and throwing — also called "passing and receiving" — is the most important skill in lacrosse. If you can catch and throw, you can play. If you can't, the game gets very hard very fast.\n\nWhen you throw, point your top hand toward your target. The motion is like throwing a baseball — but the stick does the work, not your arm. Step toward your target with your opposite foot, snap your wrist, and follow through. The ball should come out smoothly.\n\nWhen you catch, give the ball a "soft target" — hold your stick out in front of you, head up, with the pocket facing the passer. As the ball gets close, "give" with your stick by pulling it slightly back and down. This absorbs the speed of the ball so it doesn't bounce out.\n\nThe biggest mistake young players make is stabbing at the ball — keeping their stick stiff and trying to grab the ball out of the air. That doesn't work. You need soft hands.\n\nPractice "wall ball" every day. Find a wall, throw the ball against it, and catch it as it comes back. Do it with both hands. Start with 50 a day. Work up to 100. The pros do thousands. Wall ball is the secret to everything.`,
    questions: [
      {
        question: "What's the most important thing when catching?",
        options: [
          "Stab at the ball quickly",
          "Give a soft target and absorb the ball",
          "Close your eyes",
          "Keep your stick low",
        ],
        correctAnswer: 1,
        explanation: "Soft hands absorb the ball. Stabbing causes drops.",
      },
      {
        question: "What is wall ball?",
        options: [
          "A team game",
          "Throwing the ball against a wall and catching it",
          "A type of stick",
          "A goalie drill only",
        ],
        correctAnswer: 1,
        explanation: "Wall ball is solo practice — throw and catch against a wall to build stick skills fast.",
      },
      {
        question: "When you throw, which foot should step forward?",
        options: ["Same foot as your top hand", "Opposite foot from your top hand", "Either foot", "Both feet"],
        correctAnswer: 1,
        explanation: "Step with your opposite foot — same as throwing a baseball.",
      },
    ],
  },
  {
    id: "boys-youth-l4",
    videoUrl: "https://www.youtube.com/watch?v=UI-ZteQ8JGU",
    lessonNumber: 4,
    title: "Being a Great Teammate",
    topic: "Character",
    pillar: "team",
    description: `Lacrosse is a team sport. You can't win alone, no matter how good you are. The best players in the world are also the best teammates — and that's not a coincidence.\n\nBeing a great teammate means three things:\n\nFirst, encourage others. When a teammate scores, celebrate with them. When they mess up, pick them up. Don't make fun of anyone for missing a pass or having a bad day. Everyone has bad days — it's how teammates respond that matters.\n\nSecond, listen to your coaches. When the coach talks, you stop talking. You look at them. You listen. Coaches are trying to help you get better, and the kids who listen are the kids who improve. Eye rolls, side conversations, and complaints make you a worse teammate AND a worse player.\n\nThird, hustle for everyone. When you sprint to a ground ball, you're not just helping yourself — you're helping your team. When you back up a shot, you're saving your goalie a goal. When you run hard in transition, you're making it easier for your midfielder to make the next play.\n\nAt BTB, we say "the standard is the standard." That means everyone is expected to bring their best every day. Not because someone is watching, but because your teammates deserve it.`,
    questions: [
      {
        question: "What should you do when a teammate makes a mistake?",
        options: ["Yell at them", "Ignore them", "Pick them up and encourage them", "Tell the coach"],
        correctAnswer: 2,
        explanation: "Great teammates lift each other up. Everyone has bad days.",
      },
      {
        question: "When the coach is talking, what should you do?",
        options: [
          "Talk to your friends",
          "Look at your stick",
          "Stop talking, look at them, and listen",
          "Walk around",
        ],
        correctAnswer: 2,
        explanation: "Listening to coaches is how you get better. It also shows respect.",
      },
      {
        question: "Why does hustle matter even when you're not the one with the ball?",
        options: [
          "It doesn't",
          "It makes the team better and helps everyone",
          "Only the goalie matters",
          "Coaches don't notice",
        ],
        correctAnswer: 1,
        explanation: "Hustle helps your team win — backing up shots, chasing ground balls, running in transition all matter.",
      },
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
        question: "When your team has the ball, you should...",
        options: [
          "All run to the ball",
          "Spread out and give passing options",
          "Stand still",
          "Run to the goal",
        ],
        correctAnswer: 1,
        explanation: "Spreading out forces the defense to cover more ground and creates openings.",
      },
      {
        question: "What does 'lacrosse IQ' mean?",
        options: [
          "How fast you run",
          "How hard you shoot",
          "Knowing where to be and what to do on the field",
          "How tall you are",
        ],
        correctAnswer: 2,
        explanation: "Lacrosse IQ is field awareness — making smart decisions, not just being athletic.",
      },
      {
        question: "If you're not sure where to be, what should you do?",
        options: [
          "Stand still",
          "Run to where you can help your team",
          "Walk off the field",
          "Yell at the coach",
        ],
        correctAnswer: 1,
        explanation: "When in doubt, get to a spot where you can help — back up a shot, get open, or help on defense.",
      },
    ],
  },
  {
    id: "boys-youth-l6",
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
    lessonNumber: 6,
    title: "The BTB Standard",
    topic: "Mental Game",
    pillar: "leadership",
    description: `The BTB Standard is what makes our program different. It's not about being the most talented kid — it's about being the kind of player coaches and teammates want around.\n\nThe Standard has three parts:\n\nEffort — You bring 100% every time you step on the field. Not 80% because you're tired. Not 60% because it's hot. 100%. If you're going to be on the field, you owe it to your teammates to give your best.\n\nAttitude — You show up ready to learn. You don't roll your eyes. You don't argue with coaches. You don't blame teammates. When something goes wrong, you say "my fault, I'll get the next one." When something goes right, you congratulate the teammates who helped.\n\nPreparation — You take care of your gear. You practice on your own time. You watch lacrosse on TV when you can. You ask questions when you don't understand. You're always trying to learn more.\n\nIf you do these three things, you'll improve faster than the kids who don't. That's a guarantee. Skill takes time, but the Standard is something you choose every day. And the kids who choose it become the players coaches remember forever.`,
    questions: [
      {
        question: "What are the three parts of the BTB Standard?",
        options: [
          "Speed, strength, skill",
          "Effort, attitude, preparation",
          "Goals, assists, ground balls",
          "Helmets, gloves, sticks",
        ],
        correctAnswer: 1,
        explanation: "Effort, attitude, and preparation are the three pieces of the BTB Standard.",
      },
      {
        question: "How much effort should you give when you're on the field?",
        options: ["50%", "75%", "Whatever feels right", "100%"],
        correctAnswer: 3,
        explanation: "Always 100%. You owe it to your teammates.",
      },
      {
        question: "What should you say when you make a mistake?",
        options: [
          "Blame a teammate",
          "Make excuses",
          "'My fault, I'll get the next one'",
          "Walk off the field",
        ],
        correctAnswer: 2,
        explanation: "Owning your mistakes and moving forward is part of having the right attitude.",
      },
    ],
  },
  {
    id: "boys-youth-l7",
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    lessonNumber: 7,
    title: "Leading by Example",
    topic: "Character",
    pillar: "leadership",
    description: `You don't have to be the best player on your team to be a leader. You don't have to be the loudest kid on the field. Leadership at your age is simple: do the right thing when nobody is making you.\n\nLeading by example means showing up and doing the work. You're the kid who sprints when the coach says "jog." You're the kid who picks up the balls without being asked. You're the kid who stays after practice to get extra reps on the wall.\n\nHere's a secret most kids don't learn until they're older: people watch what you DO, not what you SAY. If you tell your teammates to hustle but you walk between drills, nobody listens. If you sprint every rep and never complain, your teammates start doing the same thing — without you saying a word.\n\nThe best leaders also show up on the bad days. When it's raining, when it's cold, when you're tired — those are the days that matter most. Anyone can lead when things are easy. Real leaders bring the same energy when everything is working against them.\n\nAt BTB, we believe leadership starts young. You don't have to wait until you're a captain or a senior. Start right now. Be the kid who does more than what's expected, every single day. That's what leading by example means.`,
    questions: [
      {
        question: "Do you have to be the best player to be a leader?",
        options: ["Yes, always", "No — leadership is about actions, not skill level", "Only if you're the oldest", "Only in important games"],
        correctAnswer: 1,
        explanation: "Leadership is a choice anyone can make through their actions.",
      },
      {
        question: "What matters more — what you say or what you do?",
        options: ["What you say", "What you do — people watch your actions", "Neither", "Only what the coach says"],
        correctAnswer: 1,
        explanation: "Actions speak louder than words. Lead by doing, not talking.",
      },
      {
        question: "When is the most important time to lead?",
        options: ["When everything is going well", "When it's easy", "On the bad days — rain, cold, tired", "Only at games"],
        correctAnswer: 2,
        explanation: "Real leaders show up the same way on the hard days as the good ones.",
      },
    ],
  },
  {
    id: "boys-youth-l8",
    videoUrl: "https://www.youtube.com/watch?v=dCVlRFWOjgE",
    lessonNumber: 8,
    title: "Respecting the Game",
    topic: "Character",
    pillar: "leadership",
    description: `Lacrosse has been around for hundreds of years. Native Americans played it long before any of us were born, and it will be here long after we're gone. When you play lacrosse, you're part of something bigger than yourself — and that deserves respect.\n\nRespecting the game starts with how you treat your opponents. They're not your enemies — they're the people who make you better. Without competition, you never improve. Shake hands before the game. Shake hands after the game. Whether you win or lose, show the other team respect.\n\nRespecting the game means accepting the refs' calls. Refs make mistakes — that's part of sports. Arguing, whining, or throwing your stick doesn't change the call. It just makes you look bad and hurts your team. Play through it and compete on the next play.\n\nRespecting the game means taking care of your equipment. Your stick, your helmet, your pads — they're the tools of your sport. Don't throw them. Don't leave them in the rain. Take care of them the way a carpenter takes care of their tools.\n\nRespecting the game means giving it your full attention. When you're on the field, be on the field. Don't goof off during drills. Don't have side conversations when the coach is talking. The time you spend on the field is short — make every minute count.\n\nPlayers who respect the game earn respect from coaches, teammates, opponents, and parents. It's one of the best habits you can build at your age.`,
    questions: [
      {
        question: "How should you treat your opponents?",
        options: ["Like enemies", "With respect — they make you better", "Ignore them", "Yell at them"],
        correctAnswer: 1,
        explanation: "Opponents are competitors who push you to improve. They deserve respect.",
      },
      {
        question: "When a ref makes a bad call, what should you do?",
        options: ["Argue loudly", "Throw your stick", "Accept it and compete on the next play", "Quit playing"],
        correctAnswer: 2,
        explanation: "Refs make mistakes. Competing through bad calls is part of sports.",
      },
      {
        question: "What does 'respecting the game' mean?",
        options: ["Just winning", "Treating opponents, refs, equipment, and practice time with respect", "Playing only when you feel like it", "Only caring about goals"],
        correctAnswer: 1,
        explanation: "Respecting the game covers how you treat everything connected to the sport.",
      },
    ],
  },
  {
    id: "boys-youth-l9",
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
    lessonNumber: 9,
    title: "Why Teams Win",
    topic: "Mental Game",
    pillar: "team",
    description: `Here's something that might surprise you: the best team doesn't always have the best players. Sometimes the team with less talent wins because they play better TOGETHER.\n\nThink about it like this. If you have five amazing players who all want to score and none of them pass, they might lose to a team of average players who move the ball, play defense together, and fight for every ground ball as a group.\n\nTeams win because every player does their job. The attackman finishes the shot. The midfielder runs hard in transition. The defenseman slides on time. The goalie communicates. When everyone does their piece — not trying to do someone else's job — the team works.\n\nTeams win because they trust each other. When you trust your teammate to be in the right spot, you make the pass without hesitating. When you trust your slide will come, you play your man tight. Trust makes everyone braver and faster.\n\nTeams win because they pick each other up. When a teammate drops a ball, you don't groan — you clap and say "next one." When someone misses a shot, you back it up. When someone gets beat on defense, you slide. Every mistake is a chance for the TEAM to respond.\n\nNo one remembers the kid who scored the most goals on a losing team. Everyone remembers the team that fought together and won something nobody expected them to win. That's the power of playing as a team.`,
    questions: [
      {
        question: "Does the team with the most talent always win?",
        options: ["Yes, always", "No — teams that play together can beat more talented teams", "Only in playoffs", "Talent is all that matters"],
        correctAnswer: 1,
        explanation: "Teamwork and trust can beat raw talent when players play for each other.",
      },
      {
        question: "What does 'doing your job' mean on a team?",
        options: ["Trying to score every play", "Playing your position well and trusting teammates to play theirs", "Doing whatever you want", "Only playing when you feel like it"],
        correctAnswer: 1,
        explanation: "Every position matters. When everyone does their part, the team succeeds.",
      },
      {
        question: "What should you do when a teammate makes a mistake?",
        options: ["Get mad at them", "Ignore it", "Pick them up — clap, encourage, and respond as a team", "Tell the coach to bench them"],
        correctAnswer: 2,
        explanation: "Great teams respond to mistakes together. Every error is a chance for the team to step up.",
      },
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
        question: "If your team is losing badly, what should you do?",
        options: ["Give up — it's over", "Keep competing on every play because your teammates are watching", "Blame someone", "Walk off the field"],
        correctAnswer: 1,
        explanation: "Your effort affects your teammates. Competing hard even when losing lifts the whole team.",
      },
      {
        question: "When a teammate scores, how should the team react?",
        options: ["Don't react", "Celebrate like YOU scored — energy is contagious", "Ignore it", "Only if it's a big goal"],
        correctAnswer: 1,
        explanation: "Celebrating together builds energy and makes the team play harder.",
      },
      {
        question: "After a tough loss, the team should...",
        options: ["Blame the worst player", "Point fingers", "Say 'we'll get better' and mean it — learn and move forward", "Stop practicing"],
        correctAnswer: 2,
        explanation: "Teams handle losses as a group. No blame, just growth.",
      },
    ],
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
        question: "Which position plays both offense and defense?",
        options: ["Attackman", "Midfielder", "Defenseman", "Goalie"],
        correctAnswer: 1,
        explanation: "Midfielders run the whole field and play both ends.",
      },
      {
        question: "Where do attackmen typically play?",
        options: [
          "All over the field",
          "Behind their own goal",
          "Around the opposing goal — they don't cross midfield much",
          "Only on defense",
        ],
        correctAnswer: 2,
        explanation: "Attackmen stay in the offensive end and rarely cross midfield.",
      },
      {
        question: "Why is communication especially important for goalies?",
        options: [
          "It's not",
          "They direct the defense and call out slides",
          "Refs need to hear them",
          "Fans want to hear them",
        ],
        correctAnswer: 1,
        explanation: "Goalies see the whole field and direct the defense — they have to be loud.",
      },
    ],
  },
  {
    id: "boys-middle-l2",
    lessonNumber: 2,
    title: "Dodging Fundamentals",
    topic: "Fundamentals",
    pillar: "game",
    description: `A dodge is how you beat your defender to create space — for a shot, a pass, or a chance to drive to the goal. Every offensive player needs to dodge. There are three main types you should master.\n\nThe Split Dodge is the most common. You run at your defender hard, plant one foot, and explode the opposite direction while switching your stick from one hand to the other. The key is selling the first direction with your body — your defender has to believe you're going right before you cut left. Speed and a quick hand switch make it work.\n\nThe Roll Dodge is for when a defender plays you tight. You drive into the defender, plant your inside foot, and roll backwards (away from them) protecting your stick. As you roll, you keep your stick high and wrap around your body. When you finish the roll, you should be facing the goal with the defender behind you. This is how you beat aggressive defenders.\n\nThe Face Dodge is a quick fake without changing hands. You bring your stick across your face like you're going to switch hands, but you don't — you keep the same hand. The defender reaches for the fake and you blow by. This is fastest because you don't lose any speed.\n\nThe most important thing about dodging isn't the move itself — it's the change of speed. You have to go from slow to fast in one step. If you dodge at one speed, the defender will recover. If you dodge with an explosive change of pace, you create separation.`,
    questions: [
      {
        question: "What's the most important element of any dodge?",
        options: [
          "How fancy the move is",
          "Change of speed — going from slow to fast quickly",
          "Yelling loudly",
          "Closing your eyes",
        ],
        correctAnswer: 1,
        explanation: "Change of pace creates separation. A flashy dodge at one speed doesn't work.",
      },
      {
        question: "In a Split Dodge, you switch hands. In a Face Dodge, you...",
        options: [
          "Switch hands twice",
          "Throw the ball",
          "Fake the switch but keep the same hand",
          "Drop your stick",
        ],
        correctAnswer: 2,
        explanation: "The Face Dodge fakes a hand switch — that's why it's fastest.",
      },
      {
        question: "What is a Roll Dodge best used against?",
        options: [
          "An empty field",
          "A defender playing you very tight",
          "Goalies only",
          "Your own teammates",
        ],
        correctAnswer: 1,
        explanation: "Roll dodges work when a defender is right on you — you protect your stick and roll past them.",
      },
    ],
  },
  {
    id: "boys-middle-l3",
    lessonNumber: 3,
    title: "Defensive Footwork and Positioning",
    topic: "Fundamentals",
    pillar: "game",
    description: `Good defense in lacrosse starts with footwork. Most young defenders try to swing their stick at the ball — that's a mistake. The best defenders move their feet, stay in front of the ball carrier, and force the offense into bad spots.\n\nThe basic defensive stance is called "breakdown" position. Knees bent, weight on the balls of your feet, hips low, stick out in front of you. From this stance you can move quickly in any direction. Standing tall is the worst thing a defender can do — you lose all your reaction time.\n\nWhen the offense moves, you shuffle. Don't cross your feet. Slide-step in the direction they're going, keeping your hips square to them. If they cut left, you slide left. If they cut right, you slide right. Crossing your feet means you fall behind, lose balance, and get beat.\n\nUse your stick to disrupt — not to hit hard. Quick "poke checks" (a short jab toward their hands or stick) are more effective than wild swings. The goal isn't to take the ball away. The goal is to make them uncomfortable, force them to one direction, and slow them down so your slide can come.\n\nMost importantly: stay between your man and the goal. That's the cardinal rule of defense. If you're between your man and the goal, you've already won most of the battle. If you let them get past you, your team is in trouble.`,
    questions: [
      {
        question: "What's the cardinal rule of defense?",
        options: [
          "Always check hard",
          "Stay between your man and the goal",
          "Run to the ball",
          "Stand tall",
        ],
        correctAnswer: 1,
        explanation: "Body position between your man and the goal is the foundation of defense.",
      },
      {
        question: "What kind of footwork should defenders use?",
        options: [
          "Crossing feet for speed",
          "Standing flat-footed",
          "Slide-stepping without crossing feet",
          "Jumping",
        ],
        correctAnswer: 2,
        explanation: "Slide-step, never cross your feet — crossing leads to losing balance and getting beat.",
      },
      {
        question: "What's the goal of poke checks?",
        options: [
          "Hurt the other player",
          "Make them uncomfortable and force them to slow down",
          "Take the ball away every time",
          "Get a flag thrown",
        ],
        correctAnswer: 1,
        explanation: "Poke checks disrupt and slow the offense down — they don't usually take the ball.",
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
        question: "What's the difference between a good player and a great one in terms of IQ?",
        options: [
          "Great players are bigger",
          "Great players anticipate — they don't just react",
          "Great players run faster",
          "Great players have newer sticks",
        ],
        correctAnswer: 1,
        explanation: "Anticipation is the hallmark of high IQ. Reacting is too late.",
      },
      {
        question: "When watching lacrosse film, what should you focus on?",
        options: [
          "Only the ball",
          "Only the goalie",
          "Players without the ball — that's where you learn the most",
          "The fans",
        ],
        correctAnswer: 2,
        explanation: "Watching off-ball movement teaches you positioning, anticipation, and team play.",
      },
      {
        question: "On defense, what gives away where an offensive player will pass?",
        options: ["Their feet", "Their eyes", "Their stick color", "Their helmet"],
        correctAnswer: 1,
        explanation: "Eyes usually telegraph the pass. Reading eyes is a key defensive skill.",
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
        question: "What should you do when you make a mistake in a game?",
        options: [
          "Argue with the ref",
          "Drop your head and feel sorry for yourself",
          "Reset quickly and focus on the next play",
          "Yell at a teammate",
        ],
        correctAnswer: 2,
        explanation: "Mentally tough players let go of mistakes fast and focus on what's next.",
      },
      {
        question: "When does mental toughness matter most?",
        options: [
          "When you're winning easy",
          "When everything is going well",
          "When things are hard — when tired, losing, or frustrated",
          "Only at practice",
        ],
        correctAnswer: 2,
        explanation: "Toughness is tested in adversity — that's when it matters.",
      },
      {
        question: "If you're losing badly, what should your mindset be?",
        options: [
          "Give up — the game is over",
          "Compete on every play — score doesn't change effort",
          "Blame your teammates",
          "Take it easy and save energy",
        ],
        correctAnswer: 1,
        explanation: "Tough players focus on the next play, not the scoreboard.",
      },
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
        question: "Do you have to be the best player to be a leader?",
        options: ["Yes", "Only if you're a captain", "No — leadership is a choice anyone can make", "Only seniors"],
        correctAnswer: 2,
        explanation: "Leadership is about effort and example, not skill level.",
      },
      {
        question: "Real leaders handle problems with teammates by...",
        options: [
          "Talking behind their back",
          "Telling other teammates",
          "Going directly to the person and trying to fix it",
          "Quitting the team",
        ],
        correctAnswer: 2,
        explanation: "Direct, honest communication builds trust. Gossip destroys it.",
      },
      {
        question: "What's the biggest sign of leadership at practice?",
        options: [
          "Talking the most",
          "Setting the standard with your actions — early, focused, hustling",
          "Wearing the best gear",
          "Being the coach's favorite",
        ],
        correctAnswer: 1,
        explanation: "Actions speak louder than words. Lead by example every day.",
      },
    ],
  },
  {
    id: "boys-middle-l7",
    lessonNumber: 7,
    title: "Finding Your Voice",
    topic: "Character",
    pillar: "leadership",
    description: `By middle school, lacrosse becomes a talking game. The teams that communicate win. The teams that stay silent lose. Finding your voice on the field is one of the most important things you can do at this age.\n\nCommunication isn't about yelling random things. It's about saying the right thing at the right time. On defense: "I got ball!" "Cutter left!" "Slide, slide, slide!" On offense: "I'm open!" "Switch!" On the ride: "Stay home!" Every call gives your teammates information they need to make better decisions.\n\nThe hardest part about finding your voice is that it feels awkward at first. You might feel weird yelling on the field if you've never done it before. Here's the truth: nobody judges you for communicating. Your coaches WANT you to talk. Your teammates NEED you to talk. The only person who cares that it feels weird is you.\n\nStart small. Pick one thing to communicate every practice — just call "ball" when you're sliding on defense. Once that feels natural, add another call. Then another. Before long, you'll be one of the loudest players on the field and you won't even think about it.\n\nThe best communicators on a lacrosse field don't just call out plays. They also pick teammates up with their words: "Good effort!" "Shake it off!" "Let's go, next one!" This is verbal leadership, and it's just as important as physical leadership. The kid who communicates well makes everyone around them better.`,
    questions: [
      {
        question: "What does good on-field communication sound like?",
        options: ["Yelling random things", "Specific calls — 'I got ball!' 'Cutter left!' 'Slide!'", "Staying silent", "Talking to the ref"],
        correctAnswer: 1,
        explanation: "Communication is specific, timely info that helps teammates make better decisions.",
      },
      {
        question: "If talking on the field feels awkward, what should you do?",
        options: ["Never talk", "Wait until you're older", "Start small — pick one call and practice it until it's natural", "Only talk in games"],
        correctAnswer: 2,
        explanation: "Everyone starts somewhere. Pick one call, practice it, then build from there.",
      },
      {
        question: "Why does communication help a team win?",
        options: ["It doesn't", "It gives teammates information to make better decisions", "Only goalies need to talk", "Coaches prefer quiet teams"],
        correctAnswer: 1,
        explanation: "Every call helps the team. Defense, offense, transition — communication fuels it all.",
      },
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
        question: "What should you do if you're not a starter?",
        options: ["Complain", "Own your role and maximize it — bring energy, compete in practice, cheer loud", "Stop trying", "Ask to switch teams"],
        correctAnswer: 1,
        explanation: "Every role matters. Maximize what you're given and earn more over time.",
      },
      {
        question: "What's a great question to ask your coach?",
        options: ["Why am I not starting?", "Can I play attack?", "'What do you need from me?'", "When can I go home?"],
        correctAnswer: 2,
        explanation: "Asking what the team needs from you shows maturity and earns trust.",
      },
      {
        question: "What do coaches notice about role players?",
        options: ["Nothing", "The ones who do their job without complaining and give 100%", "Only the scorers", "The tallest kids"],
        correctAnswer: 1,
        explanation: "Coaches reward the players who commit to their role fully, without needing credit.",
      },
    ],
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
        question: "How is trust built on a team?",
        options: ["It just happens", "Through repetition in practice — showing up, working hard, being reliable", "By talking about it", "Only during games"],
        correctAnswer: 1,
        explanation: "Trust is built through consistent effort in practice, day after day.",
      },
      {
        question: "What does trust look like on offense?",
        options: ["Dodging every time", "Making the extra pass because you trust your teammates to finish", "Never passing", "Only passing to the best player"],
        correctAnswer: 1,
        explanation: "Trusting teammates means sharing the ball and making everyone better.",
      },
      {
        question: "What happens when a defense doesn't trust each other?",
        options: ["They play great", "Players hesitate on slides and the defense breaks down", "It doesn't matter", "They score more goals"],
        correctAnswer: 1,
        explanation: "Hesitation kills defense. Trust makes slides fast and rotations clean.",
      },
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
        question: "After a loss, who should take the blame?",
        options: ["The goalie", "The kid who missed the last shot", "Nobody individually — the team owns it together", "The coach"],
        correctAnswer: 2,
        explanation: "Games are decided by hundreds of plays. Blaming one person destroys trust.",
      },
      {
        question: "Why is blaming one person after a loss so harmful?",
        options: ["It's not", "It makes the whole team afraid to take risks", "It motivates people", "Only if it happens a lot"],
        correctAnswer: 1,
        explanation: "Fear of blame makes teams play tight and cautious. Nobody takes risks.",
      },
      {
        question: "What's the best response to a tough loss?",
        options: ["Quit", "Fight with each other", "Be honest about what went wrong, stay positive, and work harder next practice", "Pretend it didn't happen"],
        correctAnswer: 2,
        explanation: "Own it, learn from it, fix it at the next practice. That's how teams grow.",
      },
    ],
  },
]

const BOYS_HIGH_LESSONS: AcademyLesson[] = [
  {
    id: "boys-high-l1",
    lessonNumber: 1,
    title: "Advanced Offensive Sets",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `By high school, you need to understand offensive systems — not just how to score on your own, but how your team creates scoring chances together. The best high school offenses run sets, motion concepts, and ball reversals to manipulate defenses.\n\nA "set" is an organized offensive formation. The most common are 2-2-2 (two attackmen up top, two midfielders, two attackmen low), 1-4-1 (one player at the top, four spread across the middle, one behind the goal), and 3-3 (three attackmen, three midfielders forming two lines). Each set has different strengths.\n\n"Motion" means the off-ball players are constantly moving — cutting, screening, repositioning — to create openings. Good motion offenses are hard to defend because the defense can never settle. The keys are timing (cuts have to happen at the right moment) and spacing (players have to stay 5+ yards apart so defenses can't double team easily).\n\n"Ball reversal" means moving the ball from one side of the field to the other. Defenses are designed to slide to where the ball is. When you reverse the ball quickly (sky to X, X to the other side), the defense has to scramble. That's when openings appear.\n\nThe best advice for advanced offense: don't dodge into help. Look for the slide before you commit. If you see the slide coming, pass to the open player. If you don't see help, dodge hard and finish. Patient ball movement creates better looks than forced 1v1 dodges.`,
    questions: [
      {
        question: "What is a 2-2-2 offensive set?",
        options: [
          "Two players in three lines",
          "Two attack up top, two midfielders, two attack low",
          "A drill name",
          "A defensive set",
        ],
        correctAnswer: 1,
        explanation: "2-2-2 is two players at each level — top, middle, and behind the goal.",
      },
      {
        question: "What does 'reversing the ball' do to a defense?",
        options: [
          "Confuses the offense",
          "Makes the defense scramble to slide the other way",
          "Nothing",
          "Causes a penalty",
        ],
        correctAnswer: 1,
        explanation: "Quick ball reversal forces the defense to chase, creating openings.",
      },
      {
        question: "When dodging, what should you look for first?",
        options: [
          "Empty net",
          "The slide — if you see it coming, pass to the open player",
          "The fans",
          "Your shoes",
        ],
        correctAnswer: 1,
        explanation: "Reading slides is the difference between a great dodge and a bad turnover.",
      },
    ],
  },
  {
    id: "boys-high-l2",
    lessonNumber: 2,
    title: "Slide Packages and Team Defense",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Team defense at the high school level requires every player to understand the slide package — the system your team uses to help each other when an offensive player beats their man. If you don't know the slide package, you're a liability.\n\nThe most common slide package is "adjacent" sliding. When the on-ball defender gets beat, the player adjacent (next to them) slides over to stop the dodger. The next player has to "fill" — rotate to cover the player the slider left. Everyone moves together. It's like a chain reaction.\n\nThe second common system is "crease" sliding (also called "second slide from the crease"). The slide comes from a player near the crease — usually whoever is guarding the offensive player closest to the goal. This is harder to teach but works well against great dodgers because the slide arrives early.\n\nNo matter the system, communication is everything. Your goalie should be calling slides loudly. Your defensemen should be pointing and yelling. If you don't talk, your defense breaks down. Silent defenses lose.\n\nThe biggest mistake high school defenders make is hesitating. If you're the slider, GO. Don't wait to see if your teammate can recover — by then it's too late. Slide hard, slide early, and trust your teammates to fill behind you. Late slides are worse than no slides at all.\n\nUnderstanding the slide package isn't just for defensemen. Every player on the field should know what their team does, because midfielders play defense too — and even attackmen need to know it for transition defense and rides.`,
    questions: [
      {
        question: "In an adjacent slide package, who slides when the on-ball defender gets beat?",
        options: [
          "The goalie",
          "The defender right next to (adjacent to) the on-ball defender",
          "The farthest defender",
          "Nobody — they recover on their own",
        ],
        correctAnswer: 1,
        explanation: "Adjacent slides come from the player right next to the on-ball defender.",
      },
      {
        question: "Should attackmen learn the team's slide package?",
        options: [
          "No, only defensemen",
          "Yes — they need it for rides and transition",
          "Only goalies",
          "Only captains",
        ],
        correctAnswer: 1,
        explanation: "Every position should know team defense — it matters for rides, transition, and team awareness.",
      },
      {
        question: "What's worse than no slide?",
        options: [
          "A perfect slide",
          "A late slide — by then it's too late",
          "An early slide",
          "No slide at all",
        ],
        correctAnswer: 1,
        explanation: "Late slides leave the defender out of position and let the offense pass to the open man easily.",
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
        question: "What's the best way to watch film?",
        options: [
          "In real time without stopping",
          "With a question in mind, pausing and rewinding to study details",
          "Only watching highlights",
          "On mute",
        ],
        correctAnswer: 1,
        explanation: "Active film study with focused questions is what makes you better.",
      },
      {
        question: "When watching your own film, what should you look for?",
        options: [
          "Only your highlights",
          "Mistakes and things to fix",
          "Your hairstyle",
          "How loud the crowd was",
        ],
        correctAnswer: 1,
        explanation: "Critical self-review is how film study leads to improvement.",
      },
      {
        question: "Why should you watch off-ball more than the ball?",
        options: [
          "It's more exciting",
          "Off-ball movement teaches you positioning, slides, and team concepts",
          "Coaches make you",
          "It's not — watch the ball",
        ],
        correctAnswer: 1,
        explanation: "The ball is obvious. Off-ball is where the lessons are hidden.",
      },
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
        question: "When should you start the recruiting process?",
        options: [
          "Senior year",
          "Junior year",
          "Freshman/sophomore year — earlier than most realize",
          "After college",
        ],
        correctAnswer: 2,
        explanation: "Top D1 programs identify prospects in 8th-9th grade — start early.",
      },
      {
        question: "How important are grades in college recruiting?",
        options: [
          "Not important",
          "Slightly important",
          "Very important — they open or close doors",
          "Only for D3",
        ],
        correctAnswer: 2,
        explanation: "Grades determine what schools will even consider you, regardless of lacrosse skill.",
      },
      {
        question: "What's the right approach to D1 vs D3?",
        options: [
          "D1 is always better",
          "Find the best fit, not just the highest division",
          "Only consider D1",
          "Only consider D3",
        ],
        correctAnswer: 1,
        explanation: "Fit matters more than division. Many D3 programs are excellent.",
      },
    ],
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
        question: "What's the '5-second reset'?",
        options: [
          "A type of shot",
          "Giving yourself 5 seconds to feel frustration, then physically resetting and refocusing",
          "A defensive drill",
          "A penalty timer",
        ],
        correctAnswer: 1,
        explanation: "The 5-second reset prevents emotions from destroying your next play.",
      },
      {
        question: "What does 'process over outcome' mean?",
        options: [
          "Focusing on the score",
          "Focusing on what you can control — effort, reads, execution",
          "Letting the coach decide everything",
          "Thinking about winning",
        ],
        correctAnswer: 1,
        explanation: "Process focus creates flow. Outcome focus creates pressure.",
      },
      {
        question: "Does visualization actually help athletic performance?",
        options: [
          "No — it's just woo-woo",
          "Yes — it programs the nervous system for execution",
          "Only in basketball",
          "Only for goalies",
        ],
        correctAnswer: 1,
        explanation: "Visualization is backed by sports science — the brain rehearses what the body will do.",
      },
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
        question: "What's a captain's role between coaches and players?",
        options: [
          "Take sides",
          "Be a bridge — reinforce coach messages and bring player concerns up respectfully",
          "Stay silent",
          "Replace the coach",
        ],
        correctAnswer: 1,
        explanation: "Captains translate between coaches and players, creating trust on both sides.",
      },
      {
        question: "How does a real captain handle a friend who's slacking?",
        options: [
          "Ignore it",
          "Yell at them publicly",
          "Talk to them directly and honestly — caring more about the team than being liked",
          "Tell on them",
        ],
        correctAnswer: 2,
        explanation: "Direct, honest accountability is how captains earn respect — even from friends.",
      },
      {
        question: "When do captains' leadership skills matter most?",
        options: [
          "When winning easy",
          "After losses — taking responsibility and leading the response",
          "Only at practice",
          "Never",
        ],
        correctAnswer: 1,
        explanation: "Anyone can lead when you're winning. Real leaders show up when things are hard.",
      },
    ],
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
        question: "Do you need to be named captain to lead?",
        options: ["Yes, you need the title", "No — leadership is about actions, not titles", "Only seniors lead", "Coaches assign leadership"],
        correctAnswer: 1,
        explanation: "The best teams have leaders at every level. Titles are earned by leading first.",
      },
      {
        question: "How do coaches decide who to name captain?",
        options: ["Best player gets it", "Random selection", "They watch who leads all season — in October, not just May", "Popularity vote only"],
        correctAnswer: 2,
        explanation: "Captaincy is earned through consistent leadership over the whole season.",
      },
      {
        question: "What's the most impactful type of 'leading without a title'?",
        options: ["Making speeches", "Doing the unglamorous work and holding people accountable", "Scoring the most goals", "Being the loudest"],
        correctAnswer: 1,
        explanation: "Culture is built through small acts — picking up cones, welcoming freshmen, having honest conversations.",
      },
    ],
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
        question: "How is team chemistry built?",
        options: ["It just happens naturally", "Intentionally — through shared hard experiences, honesty, and connection off the field", "Only by winning", "Coaches create it"],
        correctAnswer: 1,
        explanation: "Chemistry is built through shared experiences and genuine connection — not luck.",
      },
      {
        question: "What role does vulnerability play in team chemistry?",
        options: ["None — vulnerability is weakness", "It's essential — admitting mistakes and accepting feedback builds trust", "Only coaches need to be vulnerable", "It's overrated"],
        correctAnswer: 1,
        explanation: "Ego kills chemistry. Vulnerability — owning mistakes, taking coaching — builds real trust.",
      },
      {
        question: "How can upperclassmen help build chemistry?",
        options: ["Only hang out with other seniors", "Include everyone — freshmen, quiet kids, new players", "Let the coach handle it", "Focus only on the best players"],
        correctAnswer: 1,
        explanation: "Connection off the field translates to chemistry on the field. Include everyone.",
      },
    ],
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
        question: "A coach asks you to switch positions for the team's benefit. What's the right response?",
        options: ["Refuse — you earned your spot", "Complain to your parents", "Accept it and give the new role everything you have", "Quit the team"],
        correctAnswer: 2,
        explanation: "Sacrifice for the team is what winners do. The team's needs come first.",
      },
      {
        question: "What does daily sacrifice look like on a team?",
        options: ["Big dramatic moments", "Quiet choices — extra reps, bringing energy from the sideline, mentoring younger players", "It doesn't exist", "Only captains sacrifice"],
        correctAnswer: 1,
        explanation: "Sacrifice is daily, unglamorous, and often unnoticed — but it builds championships.",
      },
      {
        question: "Why do players who sacrifice often end up getting MORE from the sport?",
        options: ["They don't", "Coaches trust them, teammates love them, and they win more", "They get lucky", "Only in the movies"],
        correctAnswer: 1,
        explanation: "Sacrifice earns trust and respect. These players become the heart of winning teams.",
      },
    ],
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
        question: "What is a player's legacy?",
        options: ["Their stats", "The culture and standard they leave behind for the next group", "Their highlight reel", "How many wins they had"],
        correctAnswer: 1,
        explanation: "Legacy is the culture you created and the players you developed — not stats.",
      },
      {
        question: "How do you build a lasting legacy?",
        options: ["Score the most goals", "Teach younger players the standard, lift others up, build culture every day", "Win a championship", "Get recruited"],
        correctAnswer: 1,
        explanation: "Legacy is built daily — through mentorship, effort, and passing down the standard.",
      },
      {
        question: "Why should you care about what freshmen think of you?",
        options: ["You shouldn't", "Because they will carry forward whatever you showed them — your culture lives through them", "Only if they're talented", "Freshmen don't matter"],
        correctAnswer: 1,
        explanation: "The younger players are watching everything. What you model becomes the program's future.",
      },
    ],
  },
]

// ─── GIRLS LESSONS ────────────────────────────────────────────────────

const GIRLS_YOUTH_LESSONS: AcademyLesson[] = [
  {
    id: "girls-youth-l1",
    lessonNumber: 1,
    title: "Welcome to Girls Lacrosse",
    topic: "Fundamentals",
    pillar: "game",
    description: `Girls lacrosse is one of the fastest-growing sports in the world. It's a beautiful, fast-paced game that combines speed, skill, and smart decision-making. While it shares roots with boys lacrosse, the girls game has its own rules, style, and feel.\n\nGirls lacrosse is a non-contact sport (compared to boys). You don't wear pads or a helmet — just goggles, a mouthguard, and your stick. Stick checking is allowed but it's controlled and limited. The emphasis is on skill, footwork, positioning, and clean play. Players who try to play physically usually get fouls called against them.\n\nThe field is bigger than boys lacrosse, and there are 12 players per team — 11 field players plus a goalie. Positions are attack, midfield, defense, and goalie. The ball is the same size and shape as boys lacrosse, and the goal is the same — score by getting the ball into the opposing net.\n\nThe game is played in two halves with a clock. Goals can be scored from anywhere on the field, but most happen close to the net.\n\nWhat makes girls lacrosse special is the speed of the decisions. Because you can't bash people around, the game is about reading the field, timing your cuts, and using smart footwork to get open. The best players are the ones who think the fastest — not necessarily the strongest.\n\nWelcome to the game. There's no better sport to learn how to compete, communicate, and grow as both an athlete and a person.`,
    questions: [
      {
        question: "How many players are on the field per team in girls lacrosse?",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        explanation: "12 players per team — 11 field players plus a goalie.",
      },
      {
        question: "What protective equipment do girls lacrosse players wear?",
        options: [
          "Helmets and pads like boys",
          "Goggles, mouthguard, and a stick — that's it for field players",
          "Just gloves",
          "Full body armor",
        ],
        correctAnswer: 1,
        explanation: "Girls lacrosse is non-contact — goggles and a mouthguard are the main protection.",
      },
      {
        question: "What's the most important quality in girls lacrosse players?",
        options: [
          "Being the strongest",
          "Being the tallest",
          "Thinking and reacting fast — smart decision-making",
          "Having the newest stick",
        ],
        correctAnswer: 2,
        explanation: "Speed of decision-making is what separates the best players.",
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
    description: `Cradling in girls lacrosse is a little different than the boys game. The pockets are shallower (rules require it), so cradling has to be smoother and more controlled to keep the ball in the stick.\n\nStart with a relaxed grip. Tight hands lead to stiff cradles, and stiff cradles lose the ball. Your top hand near the head of the stick does most of the work. Your bottom hand near the butt-end of the stick is mostly a guide.\n\nThe motion is a small, smooth wrist roll — almost like turning a key in a lock. Don't whip the stick around. Don't swing your arm. The cradle should be small enough that someone watching from a distance might not even notice it.\n\nKeep your stick close to your body. As you run, your top hand should be near your ear (called "stick protection position"). This keeps the ball away from defenders' sticks and makes it harder to check.\n\nWhen you're running fast, cradle on the side of your body away from the closest defender. If a defender is on your right, cradle with the stick on your left. This is called "shielding" — using your body to protect the stick.\n\nPractice cradling everywhere. Walking around your house. While brushing your teeth. While watching TV. The more reps you get with no pressure, the more natural it feels in a game when there IS pressure. The best players cradle without thinking about it.`,
    questions: [
      {
        question: "What's different about girls lacrosse cradling vs boys?",
        options: [
          "It's the same",
          "Pockets are shallower so cradling has to be smoother",
          "Girls cradle with one hand",
          "Girls don't cradle",
        ],
        correctAnswer: 1,
        explanation: "Shallower pockets mean smoother, more controlled cradles to keep the ball in.",
      },
      {
        question: "Where should your top hand be when running with the ball?",
        options: ["Near your knee", "Behind your back", "Near your ear — stick protection position", "On the head"],
        correctAnswer: 2,
        explanation: "Top hand near the ear protects the stick from defenders.",
      },
      {
        question: "What is 'shielding'?",
        options: [
          "A type of pass",
          "Using your body to protect the stick from defenders",
          "Wearing extra pads",
          "A penalty",
        ],
        correctAnswer: 1,
        explanation: "Shielding means cradling on the side away from the defender, using your body as protection.",
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
    description: `Passing and catching is the heart of girls lacrosse. The teams that move the ball the best are almost always the teams that win. Strong stick skills open every other part of your game.\n\nWhen you pass, point your top hand toward your target. The motion is like throwing a baseball — step with your opposite foot, snap your wrist, and follow through. Your bottom hand stays loose. The stick does the work.\n\nGirls lacrosse has very specific passing fundamentals. Because the pockets are shallower, you need a smooth release. A jerky throw will cause the ball to come out wrong. Practice slow and controlled before you practice fast.\n\nWhen you catch, give your teammate a "soft target." Hold your stick up and out in front of you with the pocket facing them. As the ball arrives, "give" with the stick by pulling it slightly back. Soft hands absorb the ball. Hard hands cause drops.\n\nDon't reach for the ball with your stick — let your feet do the work. If the ball is going to be off-target, move your body to get behind it. Catching is about positioning as much as it is about hands.\n\nWall ball is the secret. Find a wall. Throw the ball against it 100 times a day with your strong hand and 50 times a day with your weak hand. Within a month, your stick skills will improve more than you can imagine. Every great player you've ever seen built their skills on a wall.`,
    questions: [
      {
        question: "When throwing, which foot should you step with?",
        options: ["Same foot as your top hand", "Opposite foot from your top hand", "Either foot", "Both"],
        correctAnswer: 1,
        explanation: "Step with your opposite foot — same as throwing a baseball.",
      },
      {
        question: "What does 'soft hands' mean in catching?",
        options: [
          "Wearing gloves",
          "Letting the stick give back as the ball arrives, absorbing it",
          "Catching with one hand",
          "Closing your eyes",
        ],
        correctAnswer: 1,
        explanation: "Soft hands absorb the ball through 'give' — preventing bounces and drops.",
      },
      {
        question: "How can you build stick skills the fastest?",
        options: [
          "Only at team practice",
          "Wall ball — daily reps against a wall",
          "Stretching",
          "Watching games on TV",
        ],
        correctAnswer: 1,
        explanation: "Wall ball is the #1 way to build stick skills. Every great player does it.",
      },
    ],
  },
  {
    id: "girls-youth-l4",
    videoUrl: "https://www.youtube.com/watch?v=UI-ZteQ8JGU",
    lessonNumber: 4,
    title: "Being a Great Teammate",
    topic: "Character",
    pillar: "team",
    description: `Lacrosse is a team sport, and the best teams aren't built on talent alone — they're built on great teammates. Being a great teammate is a skill, just like cradling or shooting. You can practice it every day.\n\nGreat teammates encourage each other. When a teammate makes a great play, you celebrate with her. When she makes a mistake, you pick her up. You never make fun of anyone for missing a pass or having a bad day. Everyone has bad days — and how you respond to a teammate's mistake says everything about you.\n\nGreat teammates listen to coaches. When the coach is talking, you stop talking. You look at her. You take in what she's saying. You don't roll your eyes. You don't whisper to your friend. You don't argue. You listen, say "got it," and try to apply what she said.\n\nGreat teammates hustle for everyone. Sprinting after a ground ball isn't just for you — it helps the team. Backing up a shot isn't glamorous, but it might save a goal. Running hard in transition makes the next play easier for your teammates. Hustle is the most contagious thing in sports. When one player hustles, others follow.\n\nGreat teammates celebrate each other. When a teammate scores, you sprint to celebrate with her — even if you wish it was you. When a teammate has a great game, you tell her. When a teammate is having a hard time, you pull her aside and check in.\n\nThe best teams BTB has ever had weren't always the most talented. They were the ones where everyone genuinely cared about each other. That bond doesn't happen by accident. It happens because every player chooses to be a great teammate every day.`,
    questions: [
      {
        question: "What should you do when a teammate makes a mistake?",
        options: [
          "Make fun of her",
          "Get angry",
          "Pick her up and encourage her — it could be you next time",
          "Tell the coach",
        ],
        correctAnswer: 2,
        explanation: "Great teammates lift each other up. Everyone has bad days.",
      },
      {
        question: "What's the right response when a coach is correcting you?",
        options: [
          "Argue with her",
          "Roll your eyes",
          "Say 'got it' and try to apply it",
          "Walk away",
        ],
        correctAnswer: 2,
        explanation: "Coachability is one of the most important traits in any athlete.",
      },
      {
        question: "Why does hustle matter so much?",
        options: [
          "It doesn't",
          "It's contagious — when one player hustles, others follow",
          "It only matters in the playoffs",
          "Coaches don't notice",
        ],
        correctAnswer: 1,
        explanation: "Hustle spreads through a team and lifts everyone's effort.",
      },
    ],
  },
  {
    id: "girls-youth-l5",
    videoUrl: "https://www.youtube.com/watch?v=pgJzzpjrdFA",
    lessonNumber: 5,
    title: "Where to Be on the Field",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Girls lacrosse is a fast game where smart players who know where to be are more valuable than fast players who don't. Field awareness is a skill you can develop early — and it pays off for the rest of your career.\n\nWhen your team has the ball, you need to spread out and create space. If everyone runs to the ball, defenders can guard everyone with fewer players. By spreading out, you force defenders to cover more ground and create openings.\n\nThink of the field like a clock with the goal at 12. Your team should have players at 8, 12, and 4 — spread across the field. This gives your teammate with the ball options to pass to in different directions.\n\nWhen the other team has the ball, you should compress and help. Get tight to your assignment. Talk to your teammates. Help if a defender needs you. Defense is about working together — communication is everything.\n\nWatch the ball and watch your assignment. The ball is going to move quickly, and so will your assignment. If you only watch one or the other, you'll get burned. Good players see both at the same time.\n\nWhen in doubt, hustle to where you can help. If a teammate is double-teamed, get open for an outlet pass. If a teammate is shooting, back up the shot. If a teammate is dodging, give her space and create a passing lane. There's almost always something useful you can do — find it.`,
    questions: [
      {
        question: "When your team has the ball, you should...",
        options: [
          "All run to the ball",
          "Spread out to create passing options",
          "Stand still",
          "Run to the goalie",
        ],
        correctAnswer: 1,
        explanation: "Spreading out forces defenders to cover more ground and creates space.",
      },
      {
        question: "What's the key to playing good defense?",
        options: [
          "Being the fastest",
          "Communication and teamwork",
          "Hitting hard",
          "Standing still",
        ],
        correctAnswer: 1,
        explanation: "Defense is a team effort — communication is the foundation.",
      },
      {
        question: "If you're not sure where to be, what should you do?",
        options: [
          "Stand still",
          "Hustle to where you can help your team — back up shots, get open, help on D",
          "Walk off",
          "Yell at the coach",
        ],
        correctAnswer: 1,
        explanation: "When in doubt, get to a spot where you can help your team.",
      },
    ],
  },
  {
    id: "girls-youth-l6",
    videoUrl: "https://www.youtube.com/watch?v=l-gQLqv9f4o",
    lessonNumber: 6,
    title: "The BTB Standard",
    topic: "Mental Game",
    pillar: "leadership",
    description: `The BTB Standard is what makes our program different. It's not about being the most talented — it's about being the kind of player coaches and teammates want around.\n\nThe Standard has three parts:\n\nEffort — You bring 100% every time you step on the field. Not 80% because you're tired. Not 60% because it's hot. 100%. If you're going to be on the field, you owe it to your teammates to give your best.\n\nAttitude — You show up ready to learn. You don't roll your eyes. You don't argue with coaches. You don't blame teammates. When something goes wrong, you say "my fault, I'll get the next one." When something goes right, you celebrate the teammates who helped you.\n\nPreparation — You take care of your gear. You practice on your own time. You watch lacrosse on TV when you can. You ask questions when you don't understand. You're always trying to learn more.\n\nIf you do these three things, you'll improve faster than the players who don't. That's a guarantee. Skill takes time, but the Standard is something you choose every single day. And the players who choose it become the ones coaches remember forever.\n\nAt BTB, we say "the standard is the standard." That means everyone is held to it equally — best player on the team or last player off the bench. You don't get a pass on effort because you scored three goals last game. The standard doesn't bend.`,
    questions: [
      {
        question: "What are the three parts of the BTB Standard?",
        options: [
          "Speed, strength, skill",
          "Effort, attitude, preparation",
          "Goals, assists, ground balls",
          "Goggles, stick, gloves",
        ],
        correctAnswer: 1,
        explanation: "Effort, attitude, and preparation are the three pieces of the BTB Standard.",
      },
      {
        question: "How much effort should you bring on the field?",
        options: ["50%", "75%", "Whatever feels right", "100% — you owe it to your teammates"],
        correctAnswer: 3,
        explanation: "Always 100%. Effort is the price of admission.",
      },
      {
        question: "What does it mean that 'the standard is the standard'?",
        options: [
          "Different rules for different players",
          "Everyone is held to it equally — no exceptions for star players",
          "Standards change based on the day",
          "The coach decides who follows it",
        ],
        correctAnswer: 1,
        explanation: "The standard applies to everyone equally — that's what makes it fair and powerful.",
      },
    ],
  },
  {
    id: "girls-youth-l7",
    videoUrl: "https://www.youtube.com/watch?v=l5-EwrhsMzY",
    lessonNumber: 7,
    title: "Leading by Example",
    topic: "Character",
    pillar: "leadership",
    description: `You don't have to be the fastest or the most skilled player to be a leader. Leadership at your age is about one thing: doing the right thing when nobody is making you.\n\nLeading by example means being the player who sprints when others jog. You're the one who picks up the cones without being asked. You're the one who keeps working on your off-hand after practice ends. These small things might seem like they don't matter — but everyone notices.\n\nHere's a secret: people pay more attention to what you DO than what you SAY. If you tell your teammates to work harder but then you walk through a drill, nobody listens. If you go full speed on every rep, your teammates start doing the same — even without you saying a word.\n\nLeaders also show up on the tough days. When it's raining and cold and you'd rather be inside — that's when leadership matters most. Anyone can show up when the sun is shining. Real leaders bring the same energy every single day.\n\nAt BTB, we believe leadership isn't about age or talent. It starts right now. Be the player who does more than what's expected. Be the one who lifts others up after a mistake instead of looking away. That's what it means to lead by example.`,
    questions: [
      {
        question: "Do you have to be the best player to be a leader?",
        options: ["Yes, always", "No — leadership is about actions, not skill level", "Only if you're the oldest", "Only at games"],
        correctAnswer: 1,
        explanation: "Leadership is a choice anyone can make. It's about effort and example.",
      },
      {
        question: "What matters more — what you say or what you do?",
        options: ["What you say", "What you do — people watch your actions", "Neither", "Only what the coach says"],
        correctAnswer: 1,
        explanation: "Actions speak louder than words. Lead with your effort.",
      },
      {
        question: "When is the most important time to lead by example?",
        options: ["When everything is going well", "When it's easy", "On the tough days — rain, cold, tired", "Only in big games"],
        correctAnswer: 2,
        explanation: "Real leaders bring the same energy every day, especially when it's hard.",
      },
    ],
  },
  {
    id: "girls-youth-l8",
    videoUrl: "https://www.youtube.com/watch?v=dCVlRFWOjgE",
    lessonNumber: 8,
    title: "Respecting the Game",
    topic: "Character",
    pillar: "leadership",
    description: `Girls lacrosse is one of the fastest-growing sports in the country — and it has a history that goes back hundreds of years. When you step on the field, you're part of something special. That deserves respect.\n\nRespecting the game starts with how you treat your opponents. They're not enemies — they're the competition that pushes you to get better. Shake hands before and after every game. Win with class. Lose with dignity. How you handle yourself says more about your character than the final score.\n\nRespecting the game means accepting refs' calls — even bad ones. Refs are human. They'll miss calls. Arguing doesn't change the call, but it DOES distract you from the next play. The best response to a bad call is to play harder on the next whistle.\n\nRespecting the game means taking care of your equipment. Your stick, your goggles, your cleats — treat them well. They're the tools of your sport.\n\nRespecting the game means being fully present at practice. When you're on the field, be ON the field. No side conversations during drills. No eye-rolling when the coach corrects you. Give the game your full attention because the time you spend playing is short — make every minute count.\n\nPlayers who respect the game earn respect from coaches, teammates, opponents, and families watching. It's one of the most important habits you'll ever build.`,
    questions: [
      {
        question: "How should you treat your opponents?",
        options: ["Like enemies", "With respect — they push you to get better", "Ignore them", "Try to intimidate them"],
        correctAnswer: 1,
        explanation: "Opponents are competitors who make you better. Respect them.",
      },
      {
        question: "When a ref makes a bad call, what should you do?",
        options: ["Argue loudly", "Throw your stick", "Accept it and play harder on the next play", "Tell your parents to complain"],
        correctAnswer: 2,
        explanation: "Arguing changes nothing. Competing on the next play changes the game.",
      },
      {
        question: "What does 'respecting the game' mean?",
        options: ["Just winning", "Treating opponents, refs, equipment, and practice with respect", "Playing only when it's fun", "Only caring about goals"],
        correctAnswer: 1,
        explanation: "Respect covers everything — how you treat the sport and everyone connected to it.",
      },
    ],
  },
  {
    id: "girls-youth-l9",
    videoUrl: "https://www.youtube.com/watch?v=S02D9QzDe4s",
    lessonNumber: 9,
    title: "Why Teams Win",
    topic: "Mental Game",
    pillar: "team",
    description: `Here's something important: the team with the most talented players doesn't always win. Sometimes a team with average skills but amazing teamwork beats a team of all-stars who don't play together.\n\nWhy? Because lacrosse is a team sport. You can't win alone. Your attack needs your midfield to bring the ball up. Your midfield needs your defense to stop the other team. Your defense needs your goalie. Your goalie needs everyone. When every player does their job well, the team works.\n\nTeams win because they trust each other. When you trust your teammate to be in the right spot, you pass without hesitating. When you trust your defense to slide, you play your girl tight. Trust makes everyone play faster and smarter.\n\nTeams win because they support each other. When a teammate drops a ball, you don't groan — you say "next one!" When someone misses a shot, you back it up. When someone gets beat, the team responds. Every mistake is a chance for the TEAM to step up together.\n\nTeams win because they care about each other. When you genuinely care about your teammates, you work harder. You don't want to let them down. You sprint back on defense because your goalie is counting on you. You make the extra effort because you know your teammates would do the same.\n\nBe the kind of teammate who makes the team better just by being there. That matters more than any individual skill.`,
    questions: [
      {
        question: "Does the most talented team always win?",
        options: ["Yes, always", "No — teams that play together can beat more talented teams", "Only in big games", "Talent is everything"],
        correctAnswer: 1,
        explanation: "Teamwork and trust can overcome talent differences.",
      },
      {
        question: "What should you do when a teammate makes a mistake?",
        options: ["Get mad at them", "Ignore it", "Support them — say 'next one!' and help the team respond", "Tell the coach to bench them"],
        correctAnswer: 2,
        explanation: "Great teams respond to mistakes together. Every error is a chance to support each other.",
      },
      {
        question: "Why do players who care about their teammates play harder?",
        options: ["They don't", "They don't want to let their teammates down — effort comes from caring", "Caring doesn't affect playing", "Only coaches motivate effort"],
        correctAnswer: 1,
        explanation: "When you care about your teammates, you give more effort because they're counting on you.",
      },
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
        question: "When your team is losing, what should you do?",
        options: ["Give up", "Keep competing — your effort tells teammates 'we're still in this'", "Blame someone", "Stop trying"],
        correctAnswer: 1,
        explanation: "Effort is contagious. Competing hard even when losing lifts the whole team.",
      },
      {
        question: "Why is celebrating teammates important?",
        options: ["It's not", "It builds energy that makes the whole team play harder", "Only celebrate goals", "It distracts from the game"],
        correctAnswer: 1,
        explanation: "Celebrating together builds the energy that fuels great team play.",
      },
      {
        question: "After a loss, the team should...",
        options: ["Blame the worst player", "Point fingers", "Own it together, learn, and come back stronger", "Stop practicing"],
        correctAnswer: 2,
        explanation: "Teams handle losses as a group — no blame, just growth.",
      },
    ],
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
        question: "Which position runs the entire field?",
        options: ["Attack", "Midfield", "Defense", "Goalie"],
        correctAnswer: 1,
        explanation: "Midfielders play both ends and run the full field.",
      },
      {
        question: "Where do attackers spend most of their time?",
        options: [
          "All over the field",
          "In their own end",
          "Around the opposing goal",
          "Only on defense",
        ],
        correctAnswer: 2,
        explanation: "Attackers stay in the offensive end where they can score.",
      },
      {
        question: "What's one of the most important traits of a goalie?",
        options: [
          "Being short",
          "Being loud — directing the defense",
          "Running the fastest",
          "Being silent",
        ],
        correctAnswer: 1,
        explanation: "Goalies have to communicate constantly — they see the whole field.",
      },
    ],
  },
  {
    id: "girls-middle-l2",
    lessonNumber: 2,
    title: "Dodging in the Girls Game",
    topic: "Fundamentals",
    pillar: "game",
    description: `Dodging in girls lacrosse is about footwork, change of direction, and timing — not power. The best dodgers in girls lacrosse aren't the strongest players. They're the smartest and quickest with their feet.\n\nThe Split Dodge is the most common dodge. You drive at the defender hard, plant one foot, and explode the opposite direction while quickly changing your hand position on the stick. The key is selling the first direction with your body — your head, shoulders, and feet all need to commit to the fake. If your defender doesn't believe you're going right, you can't beat her by going left.\n\nThe Roll Dodge is for tight defenders. You drive into the defender, plant your inside foot, and roll backwards (away from her) while keeping your stick high and protected. As you roll, you're spinning past her. When you finish the roll, you should be facing the goal with the defender behind you.\n\nThe Face Dodge is a quick fake without changing hands. You bring your stick across your face like you're going to switch hands but you don't — you keep the same hand. The defender reaches for the fake and you blast by. This is the fastest dodge because you don't lose any speed.\n\nMost important rule of dodging: change of speed is what creates separation. Don't dodge at one constant speed. Go from slow to explosive in one step. Defenders react to speed. If you change pace suddenly, they fall behind. If you dodge at the same speed the whole time, they recover.\n\nPractice dodges with no defender first. Get the footwork right. Then add a teammate as a passive defender. Then add a real defender. Build it up.`,
    questions: [
      {
        question: "What's the most important element of any dodge?",
        options: [
          "How fast your stick switches",
          "Change of speed — slow to explosive",
          "Being the strongest",
          "Wearing the right shoes",
        ],
        correctAnswer: 1,
        explanation: "Change of pace creates separation. A flashy dodge at one speed doesn't beat anyone.",
      },
      {
        question: "Which dodge is fastest because you don't switch hands?",
        options: ["Split Dodge", "Roll Dodge", "Face Dodge", "Behind-the-back Dodge"],
        correctAnswer: 2,
        explanation: "The Face Dodge fakes a hand switch without committing — that's why it's fastest.",
      },
      {
        question: "When should you use a Roll Dodge?",
        options: [
          "Against a defender who's far away",
          "Against a defender playing you very tight",
          "Only on offense",
          "Never",
        ],
        correctAnswer: 1,
        explanation: "Roll dodges work when a defender is right on you — you protect your stick and roll past.",
      },
    ],
  },
  {
    id: "girls-middle-l3",
    lessonNumber: 3,
    title: "Defensive Footwork",
    topic: "Fundamentals",
    pillar: "game",
    description: `Good defense in girls lacrosse is built on footwork. Most young defenders try to use their stick to stop the offense — that's a mistake. The best defenders move their feet, stay in front of the ball carrier, and force her into bad positions.\n\nThe basic defensive stance is called "breakdown" position. Knees bent, weight on the balls of your feet, hips low, stick out in front of you. From this stance you can move quickly in any direction. Standing tall is the worst thing a defender can do.\n\nWhen the offense moves, you slide-step. Don't cross your feet. If she goes left, you slide left. If she goes right, you slide right. Crossing your feet means losing your balance and getting beat.\n\nUse your stick to disrupt — not to hit hard. In girls lacrosse, you can do controlled checks with the stick when the rules allow it, but the goal isn't to swing wildly. The goal is to make the offensive player uncomfortable, force her to one direction, and slow her down. Your stick should disrupt, not destroy.\n\nMost importantly: stay between your assignment and the goal. That's the cardinal rule of defense. If you're between her and the goal, you've already won most of the battle. If you let her get past you, your team is in trouble. Every step she gets toward the goal is bad. Every step you push her away from the goal is good.\n\nCommunication is the secret weapon of defense. Talk to your teammates constantly. Call out picks. Call out cutters. Call for help. The best defenses look like they read each other's minds — but really they're just communicating constantly.`,
    questions: [
      {
        question: "What's the cardinal rule of defense?",
        options: [
          "Always swing your stick",
          "Stay between your assignment and the goal",
          "Run to the ball",
          "Stand tall",
        ],
        correctAnswer: 1,
        explanation: "Body position between your assignment and the goal is the foundation.",
      },
      {
        question: "What kind of footwork should defenders use?",
        options: [
          "Crossing feet for speed",
          "Standing flat-footed",
          "Slide-stepping without crossing feet",
          "Jumping",
        ],
        correctAnswer: 2,
        explanation: "Slide-step, never cross — crossing leads to falling behind.",
      },
      {
        question: "What's the secret weapon of great defenses?",
        options: [
          "Being the tallest",
          "Communication — talking constantly",
          "Silence",
          "Standing still",
        ],
        correctAnswer: 1,
        explanation: "Constant communication is what holds team defenses together.",
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
        question: "What separates good players from great ones in terms of IQ?",
        options: [
          "Great players are bigger",
          "Great players anticipate — they don't just react",
          "Great players run faster",
          "Great players have newer sticks",
        ],
        correctAnswer: 1,
        explanation: "Anticipation is the hallmark of high lacrosse IQ.",
      },
      {
        question: "When watching film, what should you watch besides the ball?",
        options: [
          "The fans",
          "The off-ball movement — cuts, slides, positioning",
          "The scoreboard",
          "Nothing else",
        ],
        correctAnswer: 1,
        explanation: "Off-ball movement teaches you positioning, anticipation, and team play.",
      },
      {
        question: "On defense, what gives away where an offensive player will pass?",
        options: ["Their stick color", "Their feet only", "Their eyes", "Their helmet"],
        correctAnswer: 2,
        explanation: "Eyes usually telegraph the pass — reading eyes is a key defensive skill.",
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
        question: "What should you do after making a mistake in a game?",
        options: [
          "Argue with the ref",
          "Drop your head and give up",
          "Reset quickly and focus on the next play",
          "Yell at a teammate",
        ],
        correctAnswer: 2,
        explanation: "Quick reset is the foundation of mental toughness.",
      },
      {
        question: "When does mental toughness matter most?",
        options: [
          "When winning easy",
          "When everything is going well",
          "When things are hard — when tired, losing, or frustrated",
          "Only at practice",
        ],
        correctAnswer: 2,
        explanation: "Toughness shows up in adversity.",
      },
      {
        question: "What's the right mindset when losing badly?",
        options: [
          "Give up — it's over",
          "Compete on every play — score doesn't change effort",
          "Blame teammates",
          "Take it easy",
        ],
        correctAnswer: 1,
        explanation: "Tough players focus on the next play, never the scoreboard.",
      },
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
        question: "Do you have to be the best player to be a leader?",
        options: ["Yes", "Only if you're a captain", "No — leadership is a choice anyone can make", "Only seniors"],
        correctAnswer: 2,
        explanation: "Leadership is about effort and example, not skill level.",
      },
      {
        question: "How do real leaders handle problems with teammates?",
        options: [
          "Talk behind their back",
          "Tell other teammates",
          "Talk directly to the person and try to fix it",
          "Quit the team",
        ],
        correctAnswer: 2,
        explanation: "Direct, honest communication builds trust. Gossip destroys it.",
      },
      {
        question: "What's the biggest sign of leadership at practice?",
        options: [
          "Talking the most",
          "Setting the standard with your actions — early, focused, hustling",
          "Wearing the best gear",
          "Being the coach's favorite",
        ],
        correctAnswer: 1,
        explanation: "Actions speak louder than words. Lead by example daily.",
      },
    ],
  },
  {
    id: "girls-middle-l7",
    lessonNumber: 7,
    title: "Finding Your Voice",
    topic: "Character",
    pillar: "leadership",
    description: `By middle school, lacrosse becomes a talking game. The teams that communicate win. The teams that stay silent lose. Finding your voice on the field is one of the most important things you can do right now.\n\nCommunication isn't about yelling random things. It's about saying the right thing at the right time. On defense: "I've got ball!" "Cutter right!" "Help!" On offense: "I'm open!" "Switch!" During draws: "Mine!" Every call gives your teammates information they need.\n\nThe hardest part is that it feels awkward at first. You might feel self-conscious yelling on the field. Here's what's true: nobody judges you for communicating. Your coaches WANT you to talk. Your teammates NEED you to talk. The only person who thinks it's weird is you — and that feeling goes away fast.\n\nStart small. Pick one thing to call out at every practice — just "ball!" when you're sliding. Once that's natural, add another call. Then another. Before long you'll be one of the loudest players on the field.\n\nCommunication goes beyond play calls. The best communicators also lift teammates with their words: "Nice cut!" "Great save!" "Shake it off, you got it!" This is verbal leadership — and it's just as powerful as any physical play. The girl who communicates well makes everyone around her better.`,
    questions: [
      {
        question: "What does good on-field communication sound like?",
        options: ["Yelling random things", "Specific calls — 'I got ball!' 'Cutter right!' 'Help!'", "Staying quiet", "Talking to the ref"],
        correctAnswer: 1,
        explanation: "Communication is specific, timely information that helps teammates.",
      },
      {
        question: "If talking on the field feels awkward, what should you do?",
        options: ["Never talk", "Wait until high school", "Start small — pick one call and practice it until it's natural", "Only talk in games"],
        correctAnswer: 2,
        explanation: "Start with one call. Build from there. The awkward feeling disappears fast.",
      },
      {
        question: "Why does communication help teams win?",
        options: ["It doesn't", "It gives teammates information to make better decisions", "Only goalies talk", "Coaches prefer quiet teams"],
        correctAnswer: 1,
        explanation: "Every call helps. Defense, offense, draw controls — communication fuels it all.",
      },
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
        question: "If you're not a starter, what should you do?",
        options: ["Complain", "Own your role — bring energy, compete in practice, cheer loud", "Stop trying", "Ask to switch teams"],
        correctAnswer: 1,
        explanation: "Every role matters. Maximize it and earn more over time.",
      },
      {
        question: "What's a great question to ask your coach?",
        options: ["Why don't I start?", "Can I play attack?", "'What do you need from me?'", "When is practice over?"],
        correctAnswer: 2,
        explanation: "Asking what the team needs from you shows maturity and earns trust.",
      },
      {
        question: "What do coaches notice about role players?",
        options: ["Nothing", "The ones who do their job without complaining and give 100%", "Only the scorers", "The loudest players"],
        correctAnswer: 1,
        explanation: "Coaches reward commitment to the role, not complaints about it.",
      },
    ],
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
        question: "How is trust built on a team?",
        options: ["It just happens", "Through consistent effort in practice — showing up, working hard, being reliable", "Only in games", "By talking about it"],
        correctAnswer: 1,
        explanation: "Trust comes from daily repetition and reliability. It's earned in practice.",
      },
      {
        question: "What does trust look like on offense?",
        options: ["Dodging every time", "Making the extra pass because you trust your teammates", "Never sharing the ball", "Only passing to the best player"],
        correctAnswer: 1,
        explanation: "Trusting teammates means sharing the ball and making everyone better.",
      },
      {
        question: "What happens when a defense doesn't trust each other?",
        options: ["They play great", "Players hesitate on slides and the defense breaks down", "It doesn't matter", "They score more"],
        correctAnswer: 1,
        explanation: "Hesitation kills defense. Trust makes slides quick and rotations clean.",
      },
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
        question: "After a loss, who should take the blame?",
        options: ["The goalie", "Whoever missed the last shot", "Nobody individually — the team owns it together", "The coach"],
        correctAnswer: 2,
        explanation: "Games are decided by hundreds of plays. Blaming one player destroys trust.",
      },
      {
        question: "Why is blaming one person harmful to a team?",
        options: ["It's not", "Everyone stops taking risks — afraid to be blamed next", "It motivates players", "Only if it happens often"],
        correctAnswer: 1,
        explanation: "Fear of blame makes teams play tight and cautious. Nobody takes chances.",
      },
      {
        question: "The best response to a tough loss is...",
        options: ["Quit", "Fight with teammates", "Be honest, stay positive, and work harder at the next practice", "Pretend it didn't happen"],
        correctAnswer: 2,
        explanation: "Own it, learn from it, fix it. That's how teams grow.",
      },
    ],
  },
]

const GIRLS_HIGH_LESSONS: AcademyLesson[] = [
  {
    id: "girls-high-l1",
    lessonNumber: 1,
    title: "Advanced Offensive Concepts",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `By high school, you should understand offensive systems — not just how to score on your own, but how the team creates scoring chances together. Great high school offenses run sets, motion concepts, and ball reversals to manipulate defenses.\n\nA "set" is an organized offensive formation. The most common in girls lacrosse are the 3-3 (three players up high, three down low) and the 1-3-2 (one player up top, three across the middle, two down low). Each set creates different angles and dodging opportunities.\n\n"Motion offense" means players are constantly moving — cutting, screening, repositioning — to create openings. Good motion offenses are hard to defend because the defense can never settle. The keys are timing (cuts have to happen at the right moment) and spacing (players have to stay 5+ yards apart so defenses can't double team easily).\n\n"Ball reversal" is moving the ball from one side of the field to the other quickly. Defenses are designed to slide and help where the ball is. When you reverse the ball quickly, the defense has to scramble to get in new position — and that's when openings appear.\n\nHere's the most important advanced concept: don't dodge into help. Look for the slide before you commit. If you see help coming, pass the ball to your open teammate. If you don't see help, dodge hard and finish. Patient ball movement creates better looks than forced 1v1 dodges.\n\nThe best high school offenses have players who know their roles. The best dodgers initiate. The best shooters position for shots. The best passers create assists. Know what you're best at and play to it.`,
    questions: [
      {
        question: "What is a 3-3 offensive set?",
        options: [
          "Three players in three lines",
          "Three players up high and three down low",
          "A drill name",
          "A defensive set",
        ],
        correctAnswer: 1,
        explanation: "3-3 has three players spread up top and three spread low — one of the most common girls sets.",
      },
      {
        question: "What does 'reversing the ball' do to a defense?",
        options: [
          "Confuses the offense",
          "Forces the defense to scramble to slide the other way",
          "Nothing",
          "Causes a penalty",
        ],
        correctAnswer: 1,
        explanation: "Quick ball reversal makes the defense chase, creating openings.",
      },
      {
        question: "What's the most important rule about dodging at the high school level?",
        options: [
          "Always dodge alone",
          "Don't dodge into help — read the slide first",
          "Dodge as fast as possible",
          "Only dodge from behind the goal",
        ],
        correctAnswer: 1,
        explanation: "Reading slides before committing is what separates good dodgers from turnover machines.",
      },
    ],
  },
  {
    id: "girls-high-l2",
    lessonNumber: 2,
    title: "Team Defense and Slide Packages",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Team defense at the high school level requires every player to understand the slide package — the system your team uses to help each other when an offensive player beats her defender. If you don't know the slide package, you're a liability on defense.\n\nThe most common slide system in girls lacrosse is "adjacent" sliding. When the on-ball defender gets beat, the player adjacent (next to her) slides over to help stop the dodger. The next player has to "fill" — rotate to cover the player the slider left. Everyone moves together. It's like a chain reaction.\n\nA second common system is "crease" sliding — the slide comes from a player near the crease, usually whoever is guarding the closest offensive player to the goal. This is harder to execute but works well against great dodgers because the slide arrives early.\n\nNo matter the system, communication is everything. Your goalie should be calling slides loudly. Your defenders should be pointing and yelling. If you don't talk, your defense breaks down. Silent defenses lose.\n\nThe biggest mistake high school defenders make is hesitating. If you're the slider, GO. Don't wait to see if your teammate can recover — by then it's too late. Slide hard, slide early, and trust your teammates to fill behind you. Late slides are worse than no slides at all.\n\nUnderstanding the slide package isn't just for defenders. Every player should know what their team does, because midfielders play defense too. Even attackers need to know it for transition defense and rides.\n\nThe best defensive teams are the ones where everyone knows the system, communicates constantly, and trusts each other to slide on time.`,
    questions: [
      {
        question: "In an adjacent slide package, who slides when the on-ball defender gets beat?",
        options: [
          "The goalie",
          "The defender right next to (adjacent to) the on-ball defender",
          "The farthest defender",
          "Nobody",
        ],
        correctAnswer: 1,
        explanation: "Adjacent slides come from the player right next to the on-ball defender.",
      },
      {
        question: "Should attackers learn the team's slide package?",
        options: [
          "No, only defenders",
          "Yes — they need it for transition defense and rides",
          "Only goalies",
          "Only seniors",
        ],
        correctAnswer: 1,
        explanation: "Every position should know team defense for rides, transition, and team awareness.",
      },
      {
        question: "What's worse than not sliding at all?",
        options: [
          "Sliding perfectly",
          "Sliding late — it leaves you out of position",
          "Sliding early",
          "Yelling",
        ],
        correctAnswer: 1,
        explanation: "Late slides leave the defender out of position and let the offense pass to the open player easily.",
      },
    ],
  },
  {
    id: "girls-high-l3",
    lessonNumber: 3,
    title: "How to Watch Film",
    topic: "Lacrosse IQ",
    pillar: "game",
    description: `Film study is the biggest separator at the high school level. The players who watch film correctly improve dramatically faster than those who don't. But most players don't know HOW to watch film — they just stare at it.\n\nHere's how to watch film with purpose:\n\nFirst, watch with a question in mind. Don't just watch — watch FOR something. Examples: "How does my defender position herself when I dodge?" "Where are the slides coming from?" "What does my team do well in transition?" Having a question keeps you focused.\n\nSecond, watch off-ball. Most players watch the ball. The ball doesn't teach you anything — you already know what happens with the ball. What teaches you is what happens AWAY from the ball. Watch the slides developing. Watch the cuts. Watch how good players move when they don't have it.\n\nThird, pause and rewind. Don't watch in real time only. When something happens, pause it. Look at every player on the field. Where was the open space? Why did the defender go where she did? What would you have done differently?\n\nFourth, watch yourself critically. When you're watching your own film, don't look for highlights. Look for mistakes. Where did you turn the ball over? What did you miss? Where could you have cut better? Brutal self-honesty is how you fix problems.\n\nFifth, take notes. Write down 3 things you noticed and 3 things you want to work on. Bring those notes to the next practice. Film study without action is just watching TV.\n\nThe best players in college and the pros watch film daily. If you start now, by the time you're a senior, you'll be miles ahead of every player who relies only on practice.`,
    questions: [
      {
        question: "What's the best way to watch film?",
        options: [
          "In real time without stopping",
          "With a question in mind, pausing to study details",
          "Only watching highlights",
          "On mute",
        ],
        correctAnswer: 1,
        explanation: "Active film study with focused questions is what makes you better.",
      },
      {
        question: "When watching your own film, what should you look for?",
        options: [
          "Only your highlights",
          "Mistakes and things to fix",
          "Your hairstyle",
          "How loud the crowd was",
        ],
        correctAnswer: 1,
        explanation: "Critical self-review is how film study leads to improvement.",
      },
      {
        question: "Why watch off-ball more than the ball?",
        options: [
          "It's more exciting",
          "Off-ball movement teaches you positioning, slides, and team concepts",
          "Coaches make you",
          "It's not — watch the ball",
        ],
        correctAnswer: 1,
        explanation: "The ball is obvious. Off-ball is where the lessons are hidden.",
      },
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
        question: "When should you start the recruiting process?",
        options: [
          "Senior year",
          "Junior year",
          "Freshman/sophomore year — earlier than most realize",
          "After college",
        ],
        correctAnswer: 2,
        explanation: "Top D1 programs identify prospects in 8th-9th grade — start early.",
      },
      {
        question: "How important are grades?",
        options: [
          "Not important",
          "Slightly important",
          "Very important — they open or close doors",
          "Only for D3",
        ],
        correctAnswer: 2,
        explanation: "Grades determine what schools will even consider you, regardless of lacrosse skill.",
      },
      {
        question: "What's the right approach to choosing a college?",
        options: [
          "D1 is always better",
          "Find the best fit, not just the highest division",
          "Only consider D1",
          "Pick the closest school",
        ],
        correctAnswer: 1,
        explanation: "Fit matters more than division. Many D3 programs are excellent.",
      },
    ],
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
        question: "What's the '5-second reset'?",
        options: [
          "A type of shot",
          "Giving yourself 5 seconds to feel frustration, then resetting and refocusing",
          "A defensive drill",
          "A penalty timer",
        ],
        correctAnswer: 1,
        explanation: "The 5-second reset prevents emotions from destroying your next play.",
      },
      {
        question: "Where does real confidence come from?",
        options: [
          "Talent alone",
          "Preparation — knowing you've put in the work",
          "Trash talk",
          "Wearing the right gear",
        ],
        correctAnswer: 1,
        explanation: "Confidence is earned through preparation, not faked.",
      },
      {
        question: "Does visualization help athletic performance?",
        options: [
          "No — it's just woo-woo",
          "Yes — it programs the nervous system for execution",
          "Only in basketball",
          "Only for goalies",
        ],
        correctAnswer: 1,
        explanation: "Visualization is backed by sports science — the brain rehearses what the body will do.",
      },
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
        question: "What's a captain's role between coaches and players?",
        options: [
          "Take sides",
          "Be a bridge — reinforce coach messages and bring player concerns up respectfully",
          "Stay silent",
          "Replace the coach",
        ],
        correctAnswer: 1,
        explanation: "Captains translate between coaches and players, building trust on both sides.",
      },
      {
        question: "How does a real captain handle a friend who's slacking?",
        options: [
          "Ignore it",
          "Yell publicly",
          "Talk directly and honestly — caring more about the team than being liked",
          "Tell on her",
        ],
        correctAnswer: 2,
        explanation: "Direct, honest accountability is how captains earn respect.",
      },
      {
        question: "When does captain leadership matter most?",
        options: [
          "When winning easy",
          "After losses — taking responsibility and leading the response",
          "Only at practice",
          "Never",
        ],
        correctAnswer: 1,
        explanation: "Anyone can lead when winning. Real leaders show up when things are hard.",
      },
    ],
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
        question: "Do you need to be named captain to lead?",
        options: ["Yes", "No — leadership is about daily actions, not a title", "Only seniors lead", "Coaches decide who leads"],
        correctAnswer: 1,
        explanation: "The best teams have leaders at every level. Lead first, title follows.",
      },
      {
        question: "How do coaches decide who becomes captain?",
        options: ["Best player gets it", "Random", "They watch who leads consistently all season — not just at the end", "Popularity"],
        correctAnswer: 2,
        explanation: "Captaincy is earned through months of consistent leadership, not one big moment.",
      },
      {
        question: "What's the most impactful way to lead without a title?",
        options: ["Make speeches", "Do the unglamorous work and hold people accountable quietly", "Score the most goals", "Be the loudest"],
        correctAnswer: 1,
        explanation: "Culture is built in small moments — the work nobody sees and the conversations that matter.",
      },
    ],
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
        question: "How is team chemistry built?",
        options: ["Luck", "Intentionally — through shared experiences, vulnerability, and genuine connection", "Only by winning", "Coaches create it alone"],
        correctAnswer: 1,
        explanation: "Chemistry is intentional. Shared hard experiences and real connection build it.",
      },
      {
        question: "What role does vulnerability play in chemistry?",
        options: ["None — it's weakness", "It's essential — admitting mistakes and accepting feedback builds trust", "Only coaches are vulnerable", "It's overrated"],
        correctAnswer: 1,
        explanation: "Ego blocks chemistry. Vulnerability — owning mistakes, taking coaching — builds real bonds.",
      },
      {
        question: "How can upperclassmen build team chemistry?",
        options: ["Only hang with seniors", "Include everyone — freshmen, quiet players, newcomers", "Let it happen naturally", "Focus only on starters"],
        correctAnswer: 1,
        explanation: "Connection off the field = chemistry on the field. Include everyone.",
      },
    ],
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
        question: "Your coach asks you to switch positions for the team. What do you do?",
        options: ["Refuse", "Complain", "Accept it and give the new role everything you have", "Quit"],
        correctAnswer: 2,
        explanation: "Sacrifice for the team is what winners do. The team's needs come first.",
      },
      {
        question: "What does daily sacrifice look like?",
        options: ["Big dramatic moments", "Quiet choices — extra reps, sideline energy, mentoring younger players", "It doesn't exist", "Only captains sacrifice"],
        correctAnswer: 1,
        explanation: "Sacrifice is daily, unglamorous, and often unnoticed — but it builds championships.",
      },
      {
        question: "Why do players who sacrifice tend to get more from the sport?",
        options: ["They don't", "Coaches trust them, teammates love them, and they win more", "They get lucky", "It's a myth"],
        correctAnswer: 1,
        explanation: "Sacrifice earns trust and respect. These players become the heart of winning teams.",
      },
    ],
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
        question: "What is a player's legacy?",
        options: ["Stats", "The culture and standard she leaves behind for the next group", "Highlight reels", "Win-loss record"],
        correctAnswer: 1,
        explanation: "Legacy is the culture you created and the players you developed — not stats.",
      },
      {
        question: "How do you build a lasting legacy?",
        options: ["Score the most goals", "Teach younger players the standard, lift others up, build culture every day", "Win a championship", "Get recruited"],
        correctAnswer: 1,
        explanation: "Legacy is built daily — through mentorship, effort, and passing down the standard.",
      },
      {
        question: "Why should you care about what freshmen think of you?",
        options: ["You shouldn't", "They will carry forward what you showed them — your culture lives through them", "Only if they're talented", "Freshmen don't matter"],
        correctAnswer: 1,
        explanation: "The younger players are watching. What you model becomes the program's future.",
      },
    ],
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
