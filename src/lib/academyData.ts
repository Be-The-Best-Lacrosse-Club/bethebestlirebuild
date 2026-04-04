import type { CourseStep, Gender } from "@/types"

export interface AcademyModule {
  id: string
  moduleNumber: number
  title: string
  subtitle: string
  description: string
  weekRange: string
  steps: CourseStep[]
}

export interface WallOfFameEntry {
  name: string
  gender: "boys" | "girls"
  completedAt: string
}

const WOF_KEY = "btb-wall-of-fame"

const SEED_WALL: WallOfFameEntry[] = [
  { name: "Jake Morrison", gender: "boys", completedAt: "2026-01-22" },
  { name: "Ryan Chen", gender: "boys", completedAt: "2026-01-28" },
  { name: "Sophia Marino", gender: "girls", completedAt: "2026-02-03" },
  { name: "Liam O'Brien", gender: "boys", completedAt: "2026-02-10" },
  { name: "Ava Rodriguez", gender: "girls", completedAt: "2026-02-14" },
  { name: "Ethan Kowalski", gender: "boys", completedAt: "2026-02-19" },
  { name: "Mia Patel", gender: "girls", completedAt: "2026-02-25" },
  { name: "Tyler Jackson", gender: "boys", completedAt: "2026-03-01" },
  { name: "Isabella Torres", gender: "girls", completedAt: "2026-03-05" },
  { name: "Noah Williams", gender: "boys", completedAt: "2026-03-08" },
  { name: "Chloe Kim", gender: "girls", completedAt: "2026-03-12" },
  { name: "Marcus Davis", gender: "boys", completedAt: "2026-03-15" },
]

export function getWallOfFame(): WallOfFameEntry[] {
  try {
    const raw = localStorage.getItem(WOF_KEY)
    if (raw) return JSON.parse(raw)
    // Seed on first load
    localStorage.setItem(WOF_KEY, JSON.stringify(SEED_WALL))
    return SEED_WALL
  } catch {
    return SEED_WALL
  }
}

export function addToWallOfFame(name: string, gender: Gender): WallOfFameEntry[] {
  const entries = getWallOfFame()
  const entry: WallOfFameEntry = { name, gender, completedAt: new Date().toISOString().split("T")[0] }
  const updated = [...entries, entry]
  localStorage.setItem(WOF_KEY, JSON.stringify(updated))
  return updated
}

// ─── Module content ───────────────────────────────────────────────────

export function getAcademyModules(gender: Gender): AcademyModule[] {
  const g = gender === "boys" ? "Boys" : "Girls"
  const them = gender === "boys" ? "him" : "her"
  const their = gender === "boys" ? "his" : "her"
  const they = gender === "boys" ? "he" : "she"
  const players = gender === "boys" ? "men" : "women"

  return [
    // ══════════════════════════════════════════════════════════════════
    // MODULE 1 — Welcome to BTB
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m1`,
      moduleNumber: 1,
      title: "Welcome to BTB",
      subtitle: "The program, the language, and the standard",
      description: "Before you step on the field as a BTB player, you need to understand what this program is about. This module introduces you to the BTB Standard, our terminology, and what's expected of you.",
      weekRange: "Week 1",
      steps: [
        {
          id: `${gender}-acad-m1-1`, stepNumber: 1, title: "The BTB Standard", type: "reading",
          content: {
            description: `Every player who joins BTB is making a commitment — not just to a lacrosse program, but to a standard. At BTB, we believe that how you train, how you treat your teammates, and how you carry yourself off the field matters just as much as what you do between the lines.\n\nThe BTB Standard isn't a list of rules posted on a wall. It's a way of operating. It means showing up prepared, competing with purpose, and holding yourself accountable when no one is watching. You will hear coaches talk about "the standard" often. It's not about being perfect — it's about being intentional.\n\nWhen a BTB player walks onto the field, ${they} brings effort, focus, and respect for the game. When ${they} walks off, ${they} carries that same mindset into school, family, and community. The athletes who get the most out of this program are the ones who embrace the standard early. They're not always the most talented players on the field — but they improve the fastest because they do the work that others skip.\n\nThey study film when it's not required. They ask questions when they don't understand. They encourage a teammate who's struggling instead of looking the other way. They take coaching without making excuses.\n\nThe BTB Standard is simple: be better today than you were yesterday, and help someone else do the same. If you commit to that, everything else follows.`,
          },
        },
        {
          id: `${gender}-acad-m1-2`, stepNumber: 2, title: "BTB Terminology & Language", type: "reading",
          content: {
            description: `Every program has its own language. At BTB, we use specific terms that mean specific things. Understanding this language is part of being in the program — it creates a shared understanding between coaches and players that makes communication faster and more precise on and off the field.\n\nFilm Study — At BTB, film study is not optional and it's not a reward. It's a core part of development. Film study means watching game or practice footage with the purpose of identifying patterns, reading situations, and understanding why plays succeed or fail. It's how lacrosse IQ is built. Every BTB player studies film.\n\nLacrosse IQ — Your ability to read the game. To understand what's about to happen before it happens. A player with high lacrosse IQ doesn't just react — ${they} anticipates. ${they} knows where to be, when to cut, when to slide, and when to hold. Lacrosse IQ is developed through film study, coaching, and deliberate reps. It's the biggest separator between good players and great ones.\n\nThe Standard — The BTB expectation of consistent effort, preparation, and accountability. Not perfection. Intention.\n\nReps — Repetitions done with purpose until execution becomes instinct. Not mindless repetition — deliberate, focused practice with a specific goal each time. 100 sloppy reps are worth less than 20 perfect ones.\n\nIQ Reps — A BTB-specific term for reps that involve decision-making, not just physical execution. An IQ rep might be a film session, a tactical walkthrough, or a live drill where reading the defense matters more than speed. This is what separates training from just exercising.\n\nDevelopment Model — BTB's structured approach to player growth across a season. It includes physical skill development, lacrosse IQ building, and character development — all tracked and intentional. Nothing at BTB is random.\n\nSlide Package — The defensive rotation system your team uses. At BTB, every player — regardless of position — understands the slide package because everyone plays defense. If you can't explain it, you don't know it well enough.\n\nAdjacent — In defensive terminology, the player next to the on-ball defender. The adjacent player is responsible for the first slide. Understanding adjacency is fundamental to team defense at BTB.`,
          },
        },
        {
          id: `${gender}-acad-m1-3`, stepNumber: 3, title: "Welcome to BTB — Video", type: "film",
          content: {
            videoUrl: "",
            description: `Watch the welcome message from BTB coaches. This video covers the mission of the program, what makes BTB different from other clubs, and what your coaches expect from you throughout the academy.`,
            duration: 8,
          },
        },
        {
          id: `${gender}-acad-m1-4`, stepNumber: 4, title: "What to Expect from This Academy", type: "reading",
          content: {
            description: `This academy is designed to make you a more complete lacrosse player — and a better teammate. Over the next several weeks, you'll work through six modules covering everything from BTB terminology to character development to film study fundamentals.\n\nEach module must be completed before the next one unlocks. This isn't a race. Some modules will take you 30 minutes. Others might take a couple of sessions to work through properly. The readings are meant to be absorbed, not just clicked through. When there's a video, watch the whole thing. When there's a quiz, take it seriously — the questions are there to reinforce what you've learned.\n\nHere's what you'll cover:\n\nModule 1 (this one): The BTB Standard, terminology, and expectations.\nModule 2: Why character and leadership are the foundation of everything at BTB.\nModule 3: Building real relationships with your coaches and teammates.\nModule 4: Lacrosse IQ and why film study is the biggest separator in the game.\nModule 5: Common mistakes young players make and how to avoid them.\nModule 6: Putting it all together — what it means to represent BTB.\n\nWhen you complete all six modules, your name will be permanently added to the BTB Wall of Fame on our website. This is a recognition of commitment, not just completion. It means you invested in understanding what it takes to be a BTB ${gender === "boys" ? "man" : "player"} — on and off the field.\n\nTake your time. Do the work. And when you finish, you'll have a foundation that most players never build.`,
          },
        },
        {
          id: `${gender}-acad-m1-5`, stepNumber: 5, title: "BTB Terminology Check", type: "question",
          content: {
            question: "What does 'Lacrosse IQ' mean at BTB?",
            options: [
              "Knowing every rule in the lacrosse rulebook",
              "The ability to read the game and anticipate what will happen before it happens",
              "Being the smartest player in the classroom",
              "Having the most years of experience playing lacrosse",
            ],
            correctAnswer: 1,
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // MODULE 2 — Character & Leadership
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m2`,
      moduleNumber: 2,
      title: "Character & Leadership",
      subtitle: "Why who you are matters more than what you can do",
      description: "Talent gets attention. Character earns trust. This module covers why BTB puts character first, what real leadership looks like in a team sport, and why being a great teammate is a skill — not just a personality trait.",
      weekRange: "Week 1–2",
      steps: [
        {
          id: `${gender}-acad-m2-1`, stepNumber: 1, title: "Why Character Comes Before Talent", type: "reading",
          content: {
            description: `Here's something most club programs won't tell you: talent alone doesn't build winning teams. Talent without character creates individuals who play for themselves. Character creates players who elevate everyone around them — and those are the teams that win when it matters.\n\nAt BTB, character is not a buzzword we put on a banner. It's the first thing coaches evaluate. Can this player be coached? Will ${they} put the team first? Does ${they} compete the same way in a blowout as ${they} does in a close game? Does ${they} treat the youngest player in the program with the same respect as the best one?\n\nCharacter shows up in small moments. It's staying after practice to help pick up balls when you're tired. It's keeping your composure when a ref makes a bad call. It's congratulating a teammate who earned playing time that you wanted. It's doing your wall ball when nobody is watching.\n\nThe best college coaches in the country recruit character. They want players who will make their locker room better, not worse. A coach at the Division I level once said: "I can teach a kid to dodge. I can't teach ${them} to care about ${their} teammates." That's real. The physical skills can be developed — the kind of person you are is what makes or breaks your career.\n\nAt BTB, you'll hear this often: the standard is the standard. It doesn't bend because you scored three goals last game. It doesn't bend because you're having a bad day. Everyone is held to it equally — and that's what makes this environment work. Character is the price of admission.`,
          },
        },
        {
          id: `${gender}-acad-m2-2`, stepNumber: 2, title: "What Real Leadership Looks Like", type: "reading",
          content: {
            description: `Most young athletes think leadership means being the loudest voice in the huddle or wearing the captain's armband. That's not leadership — that's volume. Real leadership in lacrosse is quieter, harder, and more consistent than most people realize.\n\nA leader is the player who does the right thing when nobody is watching. ${they.charAt(0).toUpperCase() + they.slice(1)}'s the first one to sprint in conditioning — not because a coach told ${them} to, but because the team needs to see someone set the pace. ${they.charAt(0).toUpperCase() + they.slice(1)}'s the one who pulls a teammate aside after a bad play and says "I've got your back, let's get the next one" instead of showing frustration.\n\nLeadership at BTB is about three things:\n\n1. Leading by example. Your effort, body language, and preparation speak louder than anything you say. If you cut corners in practice, so will the player behind you. If you bring energy when things aren't going well, others will follow.\n\n2. Being coachable. A leader doesn't resist coaching — ${they} welcomes it. When a coach corrects you, your response sets the tone for the entire team. A defensive reaction tells everyone that feedback is something to avoid. An open response tells them it's how you get better.\n\n3. Lifting others up. The easiest time to be a leader is when you're playing well. The real test is when your team is losing, a teammate is struggling, or practice is grinding. That's when leadership matters. Can you be the person who holds the group together when it would be easier to check out?\n\nYou don't need a title to lead. Some of the most important leaders on BTB teams have never been named captain. They lead through their daily actions, and the team follows because they've earned that trust through consistency.`,
          },
        },
        {
          id: `${gender}-acad-m2-3`, stepNumber: 3, title: "Leadership in Action — Video", type: "film",
          content: {
            videoUrl: "",
            description: "Watch real examples of leadership moments in lacrosse — both at the college level and within BTB. Pay attention to body language, how leaders respond after mistakes, and how they communicate with teammates under pressure.",
            duration: 10,
          },
        },
        {
          id: `${gender}-acad-m2-4`, stepNumber: 4, title: "Being a Great Teammate", type: "reading",
          content: {
            description: `Being a great teammate is a skill. It's not something you're born with — it's something you practice every single day, just like your stick skills or footwork. And it matters more than most young players realize.\n\nThink about the best teammate you've ever had. It probably wasn't the most talented player on the team. It was the person who made you feel like you belonged. The one who celebrated your goals as hard as ${their} own. The one who picked you up after a bad game and told you it wasn't over.\n\nAt BTB, being a great teammate means three things:\n\nFirst, be reliable. Show up on time. Every time. Be where you're supposed to be on the field. Do your job in the drill. When your teammates know they can count on you, everything gets easier. Trust is built through a thousand small moments of reliability, not one dramatic gesture.\n\nSecond, be encouraging — especially when it's hard. It's easy to cheer when the team is winning 10-2. The real test is how you act when you're down by three goals in the fourth quarter. Do you go silent? Do you point fingers? Or do you pick up the intensity and bring others with you? Great teammates find a way to be positive without being fake. They acknowledge the situation and then focus on what can still be done.\n\nThird, put the team first. This is the hardest one. It means being genuinely happy when a teammate succeeds — even if it means less playing time for you. It means running the play the coach called, not the one that gets you the goal. It means doing the dirty work — ground balls, rides, backup slides — without needing recognition for it.\n\nThe best teams at BTB aren't the ones with the most Division I recruits. They're the ones where every player would run through a wall for the person next to them. That kind of bond doesn't happen by accident — it's built by people who choose to be great teammates every day.`,
          },
        },
        {
          id: `${gender}-acad-m2-5`, stepNumber: 5, title: "Accountability — Holding Yourself to the Standard", type: "reading",
          content: {
            description: `Accountability is one of those words that gets thrown around a lot in sports. What does it actually mean at BTB? It means owning your actions — the good ones and the bad ones — without excuses, without deflection, and without waiting for someone else to hold you to it.\n\nSelf-accountability is the highest level. It means you don't need a coach to tell you that your effort dropped in the third quarter — you already know, and you're already working on it. It means you don't blame the ref, the field, the weather, or your teammate for a bad play. You look at what YOU could have done differently, and you commit to doing it.\n\nThis is hard. It goes against every instinct you have when something goes wrong. Your brain wants to protect you — it wants to find a reason why the mistake wasn't your fault. But every time you make an excuse, you give away your power to improve. If it's always someone else's fault, then you can never fix it.\n\nHere's what accountability looks like in practice at BTB:\n\nWhen you make a mistake in a drill, you don't look around — you own it and reset. When a coach gives you feedback, you don't argue — you say "got it" and apply it on the next rep. When you miss a film session, you don't make excuses — you watch it on your own and come prepared next time.\n\nAccountability also means holding your teammates to the standard — not by yelling at them, but by having honest conversations. "Hey, I noticed you were going half speed in that last drill. We need you locked in." That's not being mean. That's caring enough about your teammate and your team to say what needs to be said.\n\nThe players who master self-accountability are the ones who improve the fastest. Period. Because they waste zero energy on excuses and put all of it into getting better.`,
          },
        },
        {
          id: `${gender}-acad-m2-6`, stepNumber: 6, title: "Character & Leadership Assessment", type: "question",
          content: {
            question: "According to BTB's values, what is the most important quality of a leader on a lacrosse team?",
            options: [
              "Being the most talented player on the field",
              "Being the loudest voice during timeouts",
              "Holding themselves to the standard and lifting others through consistent actions",
              "Telling other players what they need to do better",
            ],
            correctAnswer: 2,
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // MODULE 3 — Building Relationships
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m3`,
      moduleNumber: 3,
      title: "Building Relationships",
      subtitle: "Coach-player trust, teammate bonds, and team chemistry",
      description: "Lacrosse is a team sport built on trust. This module covers how to build a strong relationship with your coaches, communicate effectively with teammates, and handle adversity together.",
      weekRange: "Week 2–3",
      steps: [
        {
          id: `${gender}-acad-m3-1`, stepNumber: 1, title: "Your Relationship with Your Coach", type: "reading",
          content: {
            description: `The relationship between a player and ${their} coach is one of the most important factors in development. A strong coach-player relationship accelerates growth. A broken one slows everything down. And here's the thing most young athletes don't realize: building that relationship is YOUR responsibility as much as the coach's.\n\nYour coach is not your friend — and that's okay. ${their.charAt(0).toUpperCase() + their.slice(1)} job is to push you beyond what you think you're capable of, to correct mistakes you'd rather ignore, and to hold you to a standard that sometimes feels uncomfortable. That's what good coaching looks like. It's not always fun in the moment, but it's always in your best interest.\n\nHere's how to build a positive, productive relationship with your coach:\n\nBe coachable. This is number one for a reason. When a coach gives you feedback — even if you disagree with it — receive it. Say "got it" or "yes coach." Try to apply it. Later, if you genuinely don't understand, ask a question: "Coach, can you explain what you meant about my positioning on that slide?" That's showing you care, not challenging authority.\n\nCommunicate honestly. If you're struggling with something — a technique, a position change, confidence — tell your coach. They can't help you if they don't know. Most coaches will respect a player who says "I'm having trouble with this" far more than one who stays silent and keeps making the same mistake.\n\nDon't take correction personally. This is critical. When a coach raises ${their} voice or stops practice to correct you, it's not because ${they} doesn't like you. It's because ${they} sees potential and ${they}'s investing energy in your development. The players coaches stop correcting are the ones they've given up on.\n\nShow up with consistent effort. Nothing builds trust with a coach faster than being the player who brings the same energy every single day. Not just game days. Not just when scouts are watching. Every practice. Every drill. Every rep. That consistency tells your coach you're serious, and it earns you opportunities.\n\nYour coach wants you to succeed. That's why ${they}'s here. Meet ${them} halfway.`,
          },
        },
        {
          id: `${gender}-acad-m3-2`, stepNumber: 2, title: "Communicating with Teammates", type: "reading",
          content: {
            description: `Communication on a lacrosse field isn't optional — it's a competitive advantage. Teams that talk are faster, more connected, and harder to beat. Teams that go silent fall apart under pressure. At BTB, we train communication the same way we train stick skills — with intention and repetition.\n\nOn-field communication means constant, specific, helpful talk. Not just noise. Yelling "ball! ball! ball!" tells your teammates nothing. Saying "I've got two, you slide left" tells them exactly what they need to know. The difference between those two things is the difference between helpful communication and clutter.\n\nHere are the communication principles BTB players follow:\n\nBe early. The best communication happens before the play develops. "I see the pick coming, switch!" is useful. "Why didn't you switch?" after the goal is scored is useless. Train yourself to communicate what you SEE, not what already happened.\n\nBe specific. "Help!" doesn't tell anyone where to go. "Help right!" does. "I'm sliding!" tells the adjacent defender to rotate. "Ball down, 50-50!" tells your team it's a contested ground ball. Use words that create clarity, not confusion.\n\nBe consistent. Don't only communicate when things go wrong. Talk when things are going well too — "great slide," "nice clear," "I see you." Positive reinforcement builds confidence, and confident teammates play better.\n\nOff-field communication matters just as much. How you talk to teammates in the locker room, on the bus, and in the group chat sets the tone for how you play together. If there's negativity off the field, it shows up on the field. If there's trust and respect off the field, it translates to better chemistry during games.\n\nOne rule at BTB: if you have a problem with a teammate, talk to them directly — not about them behind their back. That's how trust is broken. A 30-second honest conversation prevents weeks of silent resentment that hurts the whole team.`,
          },
        },
        {
          id: `${gender}-acad-m3-3`, stepNumber: 3, title: "Team Chemistry — Video", type: "film",
          content: {
            videoUrl: "",
            description: "Watch examples of elite team chemistry in lacrosse. Notice how communication, body language, and selfless play create something bigger than individual talent. Pay attention to how players respond to each other after both great plays and mistakes.",
            duration: 10,
          },
        },
        {
          id: `${gender}-acad-m3-4`, stepNumber: 4, title: "Handling Adversity as a Team", type: "reading",
          content: {
            description: `Every team faces adversity. You will lose games you should have won. You will trail by four goals and feel the energy drain from the sideline. You will have a teammate get hurt, a bad call change the momentum, or a stretch of the season where nothing seems to click. That's not a possibility — it's a certainty.\n\nWhat separates great teams from average ones isn't whether they face adversity. It's how they respond. Average teams fracture. Players blame each other. Body language gets negative. The bench goes quiet. Effort drops. The loss becomes a blowout because the team quit before the game ended.\n\nGreat teams bend but don't break. When things go wrong, they get tighter — not looser. The communication gets louder, not quieter. The effort increases because every player knows that this is the moment that defines the season. Not the championship game — the moment when quitting would be easy and they chose to keep fighting.\n\nHere's how BTB teams handle adversity:\n\nFocus on the next play. You cannot change what just happened. The goal that was scored, the turnover, the missed save — it's done. The only thing you control is what you do next. Great teams have short memories and long focus. Process the mistake, learn from it, and move on immediately.\n\nStay connected. When things go bad, move toward your teammates, not away from them. Physical proximity matters — a fist bump, a tap on the helmet, eye contact during a timeout. These tiny gestures say "I'm still here, I'm still with you." They matter more than people think.\n\nLean on preparation. When the pressure is highest, you fall back on what you've practiced. That's why BTB trains with purpose every day — so that when the chaos of a tough game hits, your body knows what to do even when your mind is spinning. Trust your training.\n\nAdversity is not something that happens TO you. It's something that reveals who you really are. The BTB Standard doesn't change because the scoreboard looks bad. That's the whole point.`,
          },
        },
        {
          id: `${gender}-acad-m3-5`, stepNumber: 5, title: "Relationships Quiz", type: "question",
          content: {
            question: "When you disagree with feedback from your coach, what is the BTB approach?",
            options: [
              "Ignore the feedback if you think your way is better",
              "Listen fully, apply it, and ask a clarifying question later if needed",
              "Argue your point immediately so the coach understands your perspective",
              "Tell your parents and let them handle it",
            ],
            correctAnswer: 1,
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // MODULE 4 — Lacrosse IQ & Film Study
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m4`,
      moduleNumber: 4,
      title: "Lacrosse IQ & Film Study",
      subtitle: "The biggest separator in the game",
      description: "Film study is the core of BTB's development model. This module teaches you what lacrosse IQ actually is, why film study matters more than most players think, and how to watch film like a BTB player.",
      weekRange: "Week 3–4",
      steps: [
        {
          id: `${gender}-acad-m4-1`, stepNumber: 1, title: "What is Lacrosse IQ?", type: "reading",
          content: {
            description: `Lacrosse IQ is the ability to process the game faster than the people around you. It's seeing the field, understanding what's about to happen, and making the right decision before the defense or offense forces you into a bad one. It is the single most important skill in lacrosse — and it has nothing to do with how fast you run or how hard you shoot.\n\nA player with high lacrosse IQ makes the game look slow. ${they.charAt(0).toUpperCase() + they.slice(1)} always seems to be in the right place. ${they.charAt(0).toUpperCase() + they.slice(1)} makes the extra pass. ${they.charAt(0).toUpperCase() + they.slice(1)} reads the slide before it comes. ${they.charAt(0).toUpperCase() + they.slice(1)} doesn't force bad shots. On defense, ${they} jumps the passing lane because ${they} recognized the pattern from film. On offense, ${they} knows the dodge is there before ${they} even catches the ball.\n\nThis isn't magic and it isn't talent. It's developed. Here's how:\n\nFilm study. Watching game footage and identifying patterns is the fastest way to build IQ. When you watch yourself on film, you see things you can't see during the game — positioning mistakes, missed reads, moments where you had time but rushed. When you watch higher-level players, you see solutions to problems you face every game.\n\nDeliberate practice. IQ reps — drills where the decision matters more than the execution — train your brain to process game situations faster. A 3-on-2 fast break drill isn't about scoring. It's about reading the defense and making the right pass at the right time.\n\nAsking questions. Players with high lacrosse IQ are curious. They ask their coach "why did we run that play?" not just "what play are we running?" Understanding the why behind decisions deepens your understanding of the game.\n\nEvery player at BTB works on lacrosse IQ. It doesn't matter if you're a first-year player or a senior captain — there's always more to learn about reading the game. The players who invest in IQ development are the ones who play at the next level. College coaches can develop athleticism. What they're recruiting is IQ and coachability.`,
          },
        },
        {
          id: `${gender}-acad-m4-2`, stepNumber: 2, title: "Why Film Study Separates Good from Great", type: "reading",
          content: {
            description: `Most club lacrosse programs don't study film. They practice, scrimmage, and play tournaments. BTB is different. Film study is built into the development model because it works — and the evidence is overwhelming.\n\nThink about it this way: during a game, you're processing hundreds of decisions per minute. Where to be, who to cover, when to dodge, where to pass. You're doing all of this at full speed while physically exhausted. How much of that can you actually learn from in real time? Almost nothing. You're surviving, not learning.\n\nFilm study slows the game down. It lets you see what you missed. When you watch a play back at half speed, you suddenly notice: "Oh — I had a cutter wide open on my left and I didn't even see ${them}." Or: "The slide came from my right every single time and I never adjusted my dodge." These are the insights that change how you play. And you can ONLY get them from film.\n\nHere's what BTB players do during film study:\n\n1. Watch without judgment first. Don't immediately label plays as good or bad. Just observe. See the full picture — where everyone is, how the play develops, what happens away from the ball.\n\n2. Identify patterns. Does the defense always slide from the crease? Does the goalie cheat to one side? Do you tend to dodge right every time? Patterns are where IQ lives. Once you see them, you can exploit them (on offense) or correct them (on defense and in your own game).\n\n3. Focus on decisions, not outcomes. A goal from a bad decision is still a bad decision — you got lucky. A turnover from a good decision is still a good decision — it just didn't work that time. Film helps you separate process from result, which is the key to consistent improvement.\n\n4. Take notes. Write down one thing you did well and one thing to improve after each film session. This creates a development log that you and your coach can reference over the season.\n\nFilm study isn't glamorous. It's not as fun as playing pickup or shooting around. But it's the highest-leverage development activity in the sport. The players who embrace it separate themselves from the players who don't.`,
          },
        },
        {
          id: `${gender}-acad-m4-3`, stepNumber: 3, title: "How to Watch Film — A BTB Walkthrough", type: "film",
          content: {
            videoUrl: "",
            description: `In this video, a BTB coach walks through a real film session. You'll see how to break down a possession, what to look for on offense and defense, and how to identify patterns that most players miss. Follow along and practice pausing the film to make your own reads before the coach reveals the answer.`,
            duration: 15,
          },
        },
        {
          id: `${gender}-acad-m4-4`, stepNumber: 4, title: "Reading the Field — Patterns to Recognize", type: "reading",
          content: {
            description: `Game intelligence comes from pattern recognition. The more patterns you can identify, the faster you process the game. Here are the foundational patterns every BTB player should recognize:\n\nDefensive Slides: Every defense has a slide system. Is it adjacent? Is it crease? Is it a two-slide package? When you study film, map out where the slides are coming from. If you're on offense, this tells you where the open ${gender === "boys" ? "man" : "player"} will be after your dodge. If you're on defense, it tells you your responsibility.\n\nDodge Tendencies: Every player has a dominant hand and a preferred dodge direction. On film, track where opponents like to dodge from and which hand they go to. On your own film, check if YOU are predictable — if every dodge goes to the same spot, defenses will take it away.\n\nTransition Reads: The fastest way to score in lacrosse is in transition — the moments between a turnover and settled offense/defense. On film, watch how quickly players recognize a numbers advantage (4-on-3, 3-on-2). The best players don't wait to be told they have numbers — they see it and go.\n\nOff-Ball Movement: Most players only watch the ball when they study film. That's a mistake. The real IQ is in what happens away from the ball. Is a cutter timing ${their} move correctly? Is the crease ${gender === "boys" ? "attackman" : "attacker"} clearing space or clogging the lane? Great lacrosse IQ means understanding the entire field, not just the ball carrier.\n\nGoalie Tendencies: Study where the goalie positions in the cage, which side ${they} favors, and how ${they} reacts to fakes. This information is available on film and directly impacts your shot selection.\n\nThe more film you watch with these patterns in mind, the faster you'll start seeing them in real time during games. That's the whole point of IQ development — moving pattern recognition from something you do after the game to something you do during it.`,
          },
        },
        {
          id: `${gender}-acad-m4-5`, stepNumber: 5, title: "Applying Film Lessons to Practice", type: "reading",
          content: {
            description: `Film study without application is just watching TV. The whole point of studying film is to change what you do on the field. Here's how to close the loop between what you see on film and what you execute in practice and games.\n\nStep 1: Identify one focus area per week. After your film session, pick ONE thing to work on. Not five. One. Maybe it's your off-ball positioning on defense. Maybe it's recognizing the slide earlier on your dodge. Maybe it's your shot placement against a goalie who cheats high. One focused improvement area per week is enough.\n\nStep 2: Tell your coach. Before practice, let your coach know what you're working on. "Coach, I noticed on film that I'm slow getting to my adjacent spot. I'm going to focus on that today." This does two things — it shows your coach you're investing in your development, and it gives them something specific to watch and coach you on.\n\nStep 3: Create deliberate reps. During drills, apply your focus area with intention. If you're working on recognizing slides, don't just go through the motions of a 4-on-3 drill — actively read where the slide is coming from before you dodge. This is the difference between getting reps and getting IQ reps.\n\nStep 4: Self-evaluate after practice. Did you apply what you saw on film? Were you better at it today than yesterday? What needs more work? This 30-second mental review after practice keeps you on track.\n\nStep 5: Watch the next film with your focus area in mind. The following week, when you study film again, specifically look at whether you improved in that area. Did your positioning get better? Did you read the slide faster? This creates a development cycle: film → focus → practice → film → adjust.\n\nThis cycle is the engine of BTB's development model. It's why our players improve faster than players at programs that only scrimmage. Scrimmaging without film study is like taking a test without ever reviewing your answers. You keep making the same mistakes because you never identified them.`,
          },
        },
        {
          id: `${gender}-acad-m4-6`, stepNumber: 6, title: "Film Study & IQ Assessment", type: "question",
          content: {
            question: "What is the primary purpose of film study at BTB?",
            options: [
              "Creating highlight videos for college recruiting",
              "Building lacrosse IQ through pattern recognition and game understanding",
              "Finding individual mistakes to punish players for",
              "Comparing your stats to other players on the team",
            ],
            correctAnswer: 1,
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // MODULE 5 — Common Mistakes & Growth
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m5`,
      moduleNumber: 5,
      title: "Common Mistakes & Growth",
      subtitle: "What holds players back — and how to break through",
      description: "Every player makes mistakes. The difference is whether you learn from them or repeat them. This module covers the most common errors young lacrosse players make — on the field, in their mindset, and in their preparation habits.",
      weekRange: "Week 4–5",
      steps: [
        {
          id: `${gender}-acad-m5-1`, stepNumber: 1, title: "Top Mistakes Young Players Make", type: "reading",
          content: {
            description: `After years of coaching hundreds of players, BTB coaches have seen the same mistakes come up again and again. These aren't rare problems — they're almost universal among young lacrosse players. Recognizing them in yourself is the first step to eliminating them.\n\nMistake #1: Only practicing with your dominant hand. If you can only go right, defenses will take away your right hand every time. The best players are ambidextrous threats. Wall ball with your weak hand is boring and frustrating — that's exactly why most players don't do it, and exactly why it gives you an edge if you do.\n\nMistake #2: Not communicating on defense. Young players go silent on the defensive end. No calls, no slides, no help-side talk. Silence kills defenses. At BTB, every defender is expected to talk constantly — calling out ${gender === "boys" ? "their man" : "their player"}, the ball, the slide, the clear. Communication is effort, and effort on defense is non-negotiable.\n\nMistake #3: Playing hero ball on offense. Taking a contested shot from 15 yards when you have an open teammate on the crease is a bad decision — even if it goes in. Young players chase goals because goals feel good. BTB players make the right play because winning feels better.\n\nMistake #4: Skipping the fundamentals. Players want to learn the behind-the-back pass before they can make a consistent overhand pass. They want to practice fancy dodges before their footwork is sound. Fundamentals aren't boring — they're the foundation that everything else is built on. Every elite player in the country has excellent fundamentals.\n\nMistake #5: Not watching film. We've already covered this extensively, but it's worth repeating here as a "common mistake." The vast majority of young players never study their own game footage. They're leaving massive development gains on the table. If you're reading this academy, you already know better.\n\nMistake #6: Inconsistent effort. Playing hard when the score is close and coasting when you're ahead or behind. Effort should be a constant — independent of the scoreboard, the opponent, or how you feel that day. Coaches notice inconsistent effort immediately, and it erodes trust.`,
          },
        },
        {
          id: `${gender}-acad-m5-2`, stepNumber: 2, title: "Mistakes Breakdown — Film Analysis", type: "film",
          content: {
            videoUrl: "",
            description: "Watch a BTB coach break down common mistakes using real game film. See how small positioning errors lead to goals against, how forced shots kill offensive possessions, and how communication breakdowns create defensive chaos. For each mistake, the coach shows the correction.",
            duration: 12,
          },
        },
        {
          id: `${gender}-acad-m5-3`, stepNumber: 3, title: "Mental Errors — The Invisible Mistakes", type: "reading",
          content: {
            description: `Not all mistakes show up on the stat sheet. Some of the most damaging errors in lacrosse are mental — they don't look like turnovers or missed shots, but they cost your team just as much. These are the invisible mistakes that separate developing players from complete ones.\n\nLosing focus after a mistake. You turn the ball over, and instead of sprinting back on defense, you drop your head and jog. For three seconds, your team is playing 5-on-6 because you're mentally out of the game. The turnover was one mistake. The lack of hustle back is a second, worse mistake. At BTB, we call this "compounding errors" — one mistake turning into two because you let the first one affect your effort.\n\nPlaying with fear instead of confidence. After a bad game or a tough stretch, some players start playing scared. They stop dodging, avoid the ball, and make the safe play every time. Playing scared is worse than making mistakes aggressively, because scared players can't be coached — they're too busy hiding. BTB coaches would rather you dodge and turn it over trying than never dodge at all. Confidence comes from preparation, not from results. If you've put in the work, trust it.\n\nComparing yourself to teammates. This is a silent killer of development. When you spend mental energy worrying about who's starting, who scored more goals, or who the coach praised, you're not spending that energy on getting better. The only comparison that matters is you today versus you yesterday. Period. Every minute spent measuring yourself against a teammate is a minute wasted.\n\nNot preparing mentally for games and practices. Showing up physically isn't enough. What's your mental state when you step on the field? Did you think about what you're working on today? Do you have a focus? Or are you just going through the motions until something wakes you up? The best players arrive with a plan. "Today I'm focused on my off-ball movement" or "Today I'm talking on every defensive possession." A focused mind performs better than a wandering one.\n\nAssuming you know enough. The moment you think you've figured out lacrosse is the moment you stop growing. The best players in the world are still students of the game. They watch film, take coaching, and look for edges. Complacency is the most dangerous mental error because you don't even know it's happening until someone passes you by.`,
          },
        },
        {
          id: `${gender}-acad-m5-4`, stepNumber: 4, title: "Turning Mistakes into Growth", type: "reading",
          content: {
            description: `Mistakes are not the enemy. Repeated mistakes are. Every error you make on a lacrosse field is a data point — it's telling you something about your game that needs attention. The question is whether you use that data or ignore it.\n\nHere's the BTB framework for turning mistakes into growth:\n\nStep 1: Acknowledge the mistake without emotion. "I missed that slide." Not "I'm terrible at defense." Not "The ref distracted me." Just identify what happened, factually. Emotional reactions cloud your ability to learn. The faster you can look at a mistake objectively, the faster you can fix it.\n\nStep 2: Understand why it happened. This is the most important step and the one most players skip. You missed the slide — why? Were you ball-watching? Were you out of position before the dodge? Did you not hear the call? The "why" is where the lesson lives. Without it, you're just hoping the mistake doesn't happen again instead of actively preventing it.\n\nStep 3: Identify the correction. Now that you know what went wrong and why, what's the fix? Maybe you need to keep your head on a swivel instead of watching the ball. Maybe you need to communicate louder so you hear the slide call. The correction should be specific and actionable — something you can actually DO differently next time.\n\nStep 4: Apply it immediately. Don't wait for next week's game. Apply the correction in the next rep, the next drill, the next practice. The gap between understanding a correction and applying it should be as short as possible.\n\nStep 5: Review on film. Did the correction work? This closes the loop. If it did, reinforce it with more reps. If it didn't, go back to Step 2 and dig deeper into the why.\n\nThis framework works for physical mistakes, mental errors, and even off-field problems. It's a growth system, not a punishment system. At BTB, mistakes are expected. Repeated mistakes after coaching are what concern us. That's the difference between development and stagnation.`,
          },
        },
        {
          id: `${gender}-acad-m5-5`, stepNumber: 5, title: "Mistake Recognition Quiz", type: "question",
          content: {
            question: "When you make a mistake during a game, the BTB approach is to:",
            options: [
              "Dwell on it to make sure you remember not to do it again",
              "Pretend it didn't happen and move on without thinking about it",
              "Recognize it, understand why it happened, and execute the next play with full focus",
              "Wait until the coach brings it up and tells you what to do differently",
            ],
            correctAnswer: 2,
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // MODULE 6 — The BTB Standard: Final Assessment
    // ══════════════════════════════════════════════════════════════════
    {
      id: `${gender}-acad-m6`,
      moduleNumber: 6,
      title: "The BTB Standard",
      subtitle: "Putting it all together",
      description: "You've learned the language, the values, and the tools. This final module brings everything together — what it means to carry the BTB name, and the commitment you're making as a BTB player.",
      weekRange: "Week 5–6",
      steps: [
        {
          id: `${gender}-acad-m6-1`, stepNumber: 1, title: "Representing BTB — On and Off the Field", type: "reading",
          content: {
            description: `When you put on a BTB jersey, you represent something bigger than yourself. You represent every player who has come through this program, every coach who has invested in its development, and every family that chose BTB because they believed in what we stand for.\n\nThat's not a burden — it's a privilege. And it comes with responsibility.\n\nOn the field, representing BTB means playing the right way. It means competing hard but competing clean. No cheap shots. No trash talk. No disrespecting opponents or officials. You win with class and you lose with class. How you handle a loss reveals more about your character than how you handle a win. A BTB player shakes hands, congratulates the opponent, and comes back to work harder the next day.\n\nOff the field, representing BTB means carrying the same standard into your daily life. How you treat people at school. How you show up for your family. How you handle pressure in the classroom. The character we build through lacrosse isn't just for lacrosse — it's for life. If you're disciplined and accountable on the field but lazy and disrespectful at home, you haven't actually internalized the standard.\n\nOn social media, representing BTB means being thoughtful. What you post is public and permanent. A BTB player doesn't tear down opponents, doesn't complain about refs or coaches, and doesn't post things they wouldn't say in front of the entire team. Your online presence is part of your reputation — protect it.\n\nIn the recruiting process, representing BTB means being honest, professional, and prepared. College coaches talk to each other. They ask about character. They notice how you interact with teammates and how you handle adversity during showcases. The BTB name carries weight in the recruiting world — don't take that for granted.\n\nEvery action you take as a BTB player either strengthens or weakens what this program stands for. Choose to strengthen it.`,
          },
        },
        {
          id: `${gender}-acad-m6-2`, stepNumber: 2, title: "The Complete Player — Skills + Character + IQ", type: "reading",
          content: {
            description: `Throughout this academy, you've learned about character, leadership, relationships, lacrosse IQ, film study, and growth through mistakes. These aren't separate topics — they're connected parts of what BTB calls "the complete player."\n\nA complete player has three pillars:\n\nPillar 1: Physical Skills. Stick work, footwork, speed, conditioning, shooting, dodging, defensive positioning. These are the foundation — the things most programs focus on exclusively. They matter. But alone, they're not enough. A player with elite skills but no IQ will hit a ceiling. A player with elite skills but poor character will hurt the team culture.\n\nPillar 2: Lacrosse IQ. The ability to read the game, make smart decisions, and process information faster than the competition. Built through film study, deliberate practice, and curiosity. IQ is what allows a physically average player to play above ${their} athletic ability — and what makes a physically gifted player truly elite.\n\nPillar 3: Character. Accountability, leadership, teamwork, coachability, resilience. The foundation that everything else is built on. Without character, skills and IQ don't translate to sustained success. Character is what keeps you improving when nobody is watching, what keeps you committed when the season gets hard, and what makes you someone coaches and teammates trust.\n\nMost programs develop Pillar 1 and ignore the other two. BTB develops all three, simultaneously, throughout the season. That's the development model. That's why our players don't just play college lacrosse — they thrive in college lacrosse, because they arrive as complete players, not just talented athletes.\n\nYou've now built a foundation across all three pillars through this academy. The next step is applying what you've learned — every practice, every film session, every game. The academy gave you the knowledge. What you do with it defines who you become as a player.`,
          },
        },
        {
          id: `${gender}-acad-m6-3`, stepNumber: 3, title: "BTB Stories — Where the Standard Takes You", type: "film",
          content: {
            videoUrl: "",
            description: "Hear from BTB alumni about how the program shaped them — not just as lacrosse players, but as people. These stories come from players who went on to play in college and credit BTB's emphasis on character, film study, and accountability as the foundation that prepared them.",
            duration: 12,
          },
        },
        {
          id: `${gender}-acad-m6-4`, stepNumber: 4, title: "Your Commitment to Excellence", type: "reading",
          content: {
            description: `You're almost done with the BTB Academy. Before you finish, take a moment to think about what you've committed to by being here.\n\nYou've committed to the standard. Not when it's easy — always. You've committed to being a player who shows up prepared, competes with integrity, and holds ${their} teammates accountable. Not because someone is watching, but because that's who you are.\n\nYou've committed to your own development. By completing this academy, you've already proven something that separates you from most players your age: you're willing to invest time in getting better beyond just showing up to practice. That matters. Film study, reading about the game, engaging with coaching material — these are the habits of players who reach their potential.\n\nYou've committed to being a great teammate. You understand that lacrosse is not an individual sport hiding inside a team sport. It's a team sport through and through. Every goal is the result of 6 people executing. Every stop is 7 people communicating and rotating. You've committed to being someone who makes the people around you better.\n\nYou've committed to growth through adversity. You know that mistakes aren't failures — they're information. You know that losing isn't the end — it's a chance to learn. You know that the hardest moments are the ones that define you, and you've chosen to meet them head-on instead of backing down.\n\nThis is what it means to be a BTB player. Not perfect. Not the best athlete in every room. But someone who works relentlessly, leads with character, and never stops getting better.\n\nWelcome to the Wall of Fame. You earned it.`,
          },
        },
        {
          id: `${gender}-acad-m6-5`, stepNumber: 5, title: "BTB Academy Final Assessment", type: "question",
          content: {
            question: "You've completed the BTB Academy. Which statement BEST captures what it means to meet the BTB Standard?",
            options: [
              "Being the most talented player on the field at all times",
              "Winning every game and tournament you compete in",
              "Consistently bringing effort, character, and accountability while developing your skills and lacrosse IQ",
              "Following every instruction from your coach without question",
            ],
            correctAnswer: 2,
          },
        },
      ],
    },
  ]
}
