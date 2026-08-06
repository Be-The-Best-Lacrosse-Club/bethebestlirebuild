// Coach Learning Modules — BTB Coaching Education Platform
// Progress is stored in localStorage (no Airtable needed for this feature)

export const COACH_PROGRESS_KEY = "btb_coach_progress"

export interface CoachLesson {
  id: string
  title: string
  description: string
  questions: {
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
  }[]
}

export interface CoachModule {
  id: string
  title: string
  description: string
  icon: string
  color: string
  lessons: CoachLesson[]
}

// --- Progress Helpers ---

export interface CoachProgress {
  completedLessons: Record<string, string[]> // moduleId -> lessonId[]
}

export function getCoachProgress(): CoachProgress {
  if (typeof window === "undefined") return { completedLessons: {} }
  try {
    const raw = localStorage.getItem(COACH_PROGRESS_KEY)
    if (!raw) return { completedLessons: {} }
    return JSON.parse(raw) as CoachProgress
  } catch {
    return { completedLessons: {} }
  }
}

export function markCoachLessonComplete(moduleId: string, lessonId: string): void {
  if (typeof window === "undefined") return
  const progress = getCoachProgress()
  if (!progress.completedLessons[moduleId]) {
    progress.completedLessons[moduleId] = []
  }
  if (!progress.completedLessons[moduleId].includes(lessonId)) {
    progress.completedLessons[moduleId].push(lessonId)
  }
  localStorage.setItem(COACH_PROGRESS_KEY, JSON.stringify(progress))
}

export function isLessonComplete(moduleId: string, lessonId: string): boolean {
  const progress = getCoachProgress()
  return (progress.completedLessons[moduleId] ?? []).includes(lessonId)
}

export function getModuleCompletionCount(moduleId: string): number {
  const progress = getCoachProgress()
  return (progress.completedLessons[moduleId] ?? []).length
}

// --- Module Data ---

export const COACH_MODULES: CoachModule[] = [
  // ============================================================
  // MODULE 1: THE BTB COACHING PHILOSOPHY
  // ============================================================
  {
    id: "module-btb-philosophy",
    title: "The BTB Coaching Philosophy",
    description:
      "Understand what separates BTB from every other lacrosse program — our values, our standard, and why player development always comes before the scoreboard.",
    icon: "🎯",
    color: "from-blue-600 to-blue-800",
    lessons: [
      {
        id: "lesson-what-btb-stands-for",
        title: "What BTB Actually Stands For",
        description: `Be The Best is not a slogan — it is an operating system. When we say "be the best," we are not talking about being better than your opponent on a given Saturday. We are talking about closing the gap between who you are right now and who you are capable of becoming. That distinction is everything. A program built around beating other teams will rise and fall with its roster. A program built around relentless personal development compounds over time, because the culture itself becomes the product.

BTB coaches are not just teaching lacrosse. They are teaching young men how to compete, how to handle failure, how to hold themselves to a standard when no one is watching, and how to contribute to something bigger than themselves. This is the game within the game. The lacrosse skills are the vehicle. The character development is the destination. Every drill, every film session, every tough conversation is an opportunity to reinforce this.

What makes BTB different from the typical club lacrosse experience is intentionality. Most clubs run players through drills, play games, and track wins and rankings. BTB tracks growth. We assess stick skills at the start of a cycle and again at the end. We hold players to a standard of communication and effort that has nothing to do with their natural talent. We develop coaches who understand the why behind everything we do, so the message is consistent across every team and every age group.

As a BTB coach, your first job is to internalize this philosophy so deeply that it shapes how you run every single practice, every side conversation with a player, every timeout. The program you put on the field is a direct reflection of the culture you build every day. Build it deliberately.`,
        questions: [
          {
            question: "What does BTB's 'Be The Best' philosophy primarily focus on?",
            options: [
              "Winning tournaments and improving team rankings",
              "Closing the gap between who a player is now and who they can become",
              "Recruiting the most talented athletes",
              "Maximizing college recruiting exposure",
            ],
            correctAnswer: "Closing the gap between who a player is now and who they can become",
            explanation:
              "BTB's philosophy is about relentless personal development, not external results. A culture built on beating opponents is fragile; a culture built on individual growth compounds over time.",
          },
          {
            question: "How does BTB track player growth differently from typical club programs?",
            options: [
              "By tracking wins, losses, and tournament finishes",
              "By measuring recruiting interest from college coaches",
              "By assessing stick skills and effort standards at the start and end of each cycle",
              "By comparing players to peers on other teams",
            ],
            correctAnswer:
              "By assessing stick skills and effort standards at the start and end of each cycle",
            explanation:
              "BTB tracks growth internally — where did this player start, and how far have they come? That is more meaningful than where they finish in a tournament bracket.",
          },
        ],
      },
      {
        id: "lesson-the-standard",
        title: "The Standard: What We Accept and What We Don't",
        description: `Every program has a standard — most just never name it. When you fail to name the standard, players fill the void with whatever they feel like doing that day. The BTB standard is explicit: full effort on every rep, accountability without excuses, communication that is clear and respectful, and a commitment to the team that outlasts any individual bad game or bad mood. These are not suggestions. They are the cost of being on a BTB team.

The standard is not about perfection — it is about consistency. A player can make a mechanical mistake on a dodge and that is fine; that is learning. But the same player loafing through a defensive rotation because he doesn't feel like working hard today? That violates the standard, and BTB coaches address it immediately and directly. The fastest way to erode a team culture is to let the standard slide and pretend it didn't happen. Players notice. They always notice.

Holding the standard looks different at different ages. With a 9-year-old, holding the standard might mean making sure he's sprinting to every cone during a warmup drill, and doing it with encouragement. With a 16-year-old, it might be a direct conversation after practice: "I saw you quit on that rep. That's not who we are here, and I need more from you tomorrow." The principle is the same — we do not accept less than full effort — but the delivery adapts to the player in front of you.

One of the most important things a BTB coach can do is model the standard. If you are late to practice, you are telling players punctuality doesn't matter. If you run a sloppy, disorganized practice with no clear structure, you are teaching players that preparation is optional. Your behavior is the loudest coaching point you will ever make. Be the standard before you demand it.`,
        questions: [
          {
            question: "According to BTB's philosophy, what happens when you fail to name the standard?",
            options: [
              "Players naturally develop their own positive standards over time",
              "The coaching staff fills in the gaps informally",
              "Players fill the void with whatever they feel like doing that day",
              "Tournament results become the de facto standard",
            ],
            correctAnswer: "Players fill the void with whatever they feel like doing that day",
            explanation:
              "Without an explicit, named standard, culture defaults to the path of least resistance. Naming the standard is the first step to holding it.",
          },
          {
            question: "When a BTB coach sees a player loafing through a defensive rotation, what is the correct response?",
            options: [
              "Ignore it to avoid embarrassing the player in front of teammates",
              "Address it at the end of the season in a formal review",
              "Address it immediately and directly — this violates the standard",
              "Simply run the drill again without commenting",
            ],
            correctAnswer: "Address it immediately and directly — this violates the standard",
            explanation:
              "Letting a standards violation slide without acknowledgment tells the whole team that the standard is optional. Immediate, direct correction is how culture is maintained.",
          },
          {
            question: "How should the delivery of the standard change based on a player's age?",
            options: [
              "The standard itself changes — younger players are held to a lower bar",
              "The principle stays the same but the delivery adapts to the player in front of you",
              "Older players are held to the standard; younger players are exempt",
              "Delivery should always be the same regardless of age to ensure consistency",
            ],
            correctAnswer:
              "The principle stays the same but the delivery adapts to the player in front of you",
            explanation:
              "The standard is universal — full effort, accountability, communication. How you communicate that standard to a 9-year-old versus a 16-year-old is very different, but the expectation is the same.",
          },
        ],
      },
      {
        id: "lesson-player-development-over-winning",
        title: "Player Development Over Winning — Why This Actually Wins",
        description: `Here's the irony most coaches eventually discover: the teams that prioritize player development over winning tend to win more. Not because winning becomes the goal, but because skilled, confident, high-character players who trust each other are genuinely hard to beat. Development-first is not the soft path — it is the smarter path, and it is the path BTB takes intentionally.

What does development-first actually look like in a game situation? It means your 14U attacker who is working on his off-hand gets meaningful reps in live game time, even if your stronger right-handed option would be more efficient in that moment. It means a player who makes a great read gets acknowledged even if the pass was late. It means after a loss, your post-game talk focuses on what the players learned and what they need to carry into next week — not on the referees, not on the field conditions, and not on the other team.

Development-first coaches are relentlessly curious about each player's growth. They keep mental notes (or actual notes) about what each player is working on: Which midfielder is trying to improve his ground ball technique? Which defender is learning to check with his top hand? Which attackman is building confidence on his off-hand? Knowing where each player is in their development journey means you can coach them with precision, not just run them through generic drills.

The thing players remember when they're 25 is not what their record was in 7th grade. They remember the coach who believed in them before they believed in themselves. They remember the practice where something finally clicked. They remember the conversation after a tough loss where a coach helped them see what they could learn from it instead of just feeling bad about it. That is what BTB coaches are building toward — a lasting impact. The scoreboard is just one small piece of a much larger picture.`,
        questions: [
          {
            question: "Why does a development-first approach often lead to winning more games?",
            options: [
              "Players are coached to prioritize winning above all else",
              "Skilled, confident, high-character players who trust each other are genuinely hard to beat",
              "Development programs recruit more talented players",
              "Development programs avoid difficult opponents",
            ],
            correctAnswer:
              "Skilled, confident, high-character players who trust each other are genuinely hard to beat",
            explanation:
              "Development-first builds the underlying qualities that produce winning. It's not the soft path — it's actually the more demanding and more effective long-term approach.",
          },
          {
            question: "In a game situation, what does 'development-first' look like?",
            options: [
              "Always playing your best players to maximize your win probability",
              "Giving developmental players meaningful reps even if a stronger option is available",
              "Avoiding games you might lose until your players are ready",
              "Running only plays that are already perfected in practice",
            ],
            correctAnswer:
              "Giving developmental players meaningful reps even if a stronger option is available",
            explanation:
              "Development happens in live game situations too. Protecting players from reps they need to grow actually slows their development.",
          },
        ],
      },
      {
        id: "lesson-culture-is-the-product",
        title: "Culture Is the Product: Building Something Bigger Than the Season",
        description: `Culture is not a poster on the wall or a team motto at the beginning of the season. Culture is what happens when the coach walks away. It is the behavior your players choose when they think no one is watching. It is how your team treats a player who is going through a hard stretch. It is whether your players hold each other to the standard or let things slide when it's convenient. Culture is built in practice, every day, one rep at a time.

The most powerful culture-builders are your team leaders — the players who have bought in completely and who the rest of the team watches and follows. BTB coaches intentionally develop these players. We give them real responsibility. We have direct conversations with them about leadership. We hold them to a higher standard because we have a higher standard for what leadership looks like. A player who is talented but self-focused is not a leader, even if the team looks up to him. A leader puts the team's needs ahead of his own, consistently, even when it's hard.

Team culture has to be rebuilt and re-committed to every single season, because you are getting new players every year and losing players every year. The culture does not maintain itself. Your veterans carry it forward and your new players absorb it — but only if your veterans are actually embodying it and your coaches are reinforcing it daily. This means your first four practices of a new season are the most culturally important practices of the year. Use them deliberately.

BTB programs should feel different from the moment a new player steps on the field. The warmup is purposeful. The transitions are fast. Players are communicating. Coaches are correcting with specific, useful coaching points — not just yelling. The energy is high but controlled. A player should be able to feel within the first ten minutes that this program expects more and gives more than what they've experienced before. That feeling is culture. Build it intentionally, protect it fiercely, and never stop coaching it.`,
        questions: [
          {
            question: "How does BTB define team culture?",
            options: [
              "The team motto and values posted in the locker room",
              "The behavior players choose when the coach walks away",
              "The program's win-loss record and tournament performance",
              "The quality of facilities and equipment available to players",
            ],
            correctAnswer: "The behavior players choose when the coach walks away",
            explanation:
              "Culture is what people do when no one's making them do it. Posters and mottos are reminders — the culture itself lives in player behavior and daily choices.",
          },
          {
            question: "Why is re-committing to culture necessary at the start of every season?",
            options: [
              "Culture naturally resets every year regardless of effort",
              "New players absorb culture, but only if veterans embody it and coaches reinforce it daily",
              "The coaching staff changes each year and brings new culture with them",
              "Players forget the culture over the off-season and need to be reminded",
            ],
            correctAnswer:
              "New players absorb culture, but only if veterans embody it and coaches reinforce it daily",
            explanation:
              "Culture does not maintain itself. With roster turnover every year, coaches must actively re-build and re-commit to the culture, starting on day one of the new season.",
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 2: PRACTICE PLANNING AND DESIGN
  // ============================================================
  {
    id: "module-practice-planning",
    title: "Practice Planning and Design",
    description:
      "Learn how to design and run BTB practices with purpose — from the 10-month seasonal program to writing individual practice plans with precise timing, sharp transitions, and high-impact coaching points.",
    icon: "📋",
    color: "from-green-600 to-green-800",
    lessons: [
      {
        id: "lesson-16-week-cycle",
        title: "The BTB 10-Month Seasonal Program",
        description: `BTB organizes its training year into four phases: Foundation, Connection, Expansion, and Execution. Each phase has a clear purpose, and understanding that purpose allows you to choose the right drills, structure the right game situations, and make the right coaching points for where your team actually is in their development. Running the wrong content in the wrong phase is one of the most common coaching mistakes — it looks like work but doesn't produce real growth.

The Foundation Phase (Months 1-2) is about fundamentals, habit-building, 1v1 reads, and core terminology. This is where you establish the standard, teach or re-teach the basics of stick skills, footwork, and positioning, and introduce the first ride/clear habits. Practice tempo in this phase is medium — you want enough repetition for habits to form, which means slowing down enough for players to execute correctly rather than just frantically. The coaching points in Foundation are about mechanics: "hands away from your body," "follow through to your target," "low hips on the defensive approach."

The Connection Phase (Months 3-5) is about putting the pieces together. Players have their individual fundamentals — now you're connecting them to team concepts. How does this individual defensive footwork connect to our slide package? How does this attacker's catch-and-throw quality connect to our offensive flow? Connection Phase drills involve more decision-making, more small-sided live play, and more emphasis on reading the defense and offense around you. Coaching points shift toward awareness: "see the whole field," "communicate before you slide," "attack the man, not the play."

Expansion Phase (Months 6-8) takes your team into new territory — uneven situations, zone concepts, aggressive riding, and more complex game situations. Practices have higher tempo, more competitive live reps, and more game-like pressure. This is where you're sharpening the edge. Execution Phase (Months 9-10) is game-prep mode: you run your stuff at full speed, you simplify to what you do best, and you use film and competition to tighten the details. Less teaching, more reinforcing, more competing.`,
        questions: [
          {
            question: "What is the primary focus of the Foundation Phase (Months 1-2)?",
            options: [
              "Complex offensive and defensive schemes",
              "Competitive game simulations at full speed",
              "Fundamentals, habit-building, and establishing the standard",
              "Film study and tournament preparation",
            ],
            correctAnswer: "Fundamentals, habit-building, and establishing the standard",
            explanation:
              "Foundation is about building the base. Habits form through repetition at the right pace — if you rush to complex concepts before fundamentals are solid, you're building on sand.",
          },
          {
            question: "What shifts from Foundation Phase to Connection Phase?",
            options: [
              "Players start working individually instead of as a team",
              "Coaching points shift from mechanics to awareness and decision-making",
              "Practice tempo slows down significantly to allow more individual feedback",
              "The coaching staff introduces an entirely new playbook",
            ],
            correctAnswer:
              "Coaching points shift from mechanics to awareness and decision-making",
            explanation:
              "Foundation builds individual mechanics. Connection links those mechanics to team situations — the coaching point evolves from 'how you move' to 'how you read and react in context.'",
          },
          {
            question: "What characterizes the Execution Phase (Months 9-10)?",
            options: [
              "Teaching new concepts and expanding the playbook",
              "Returning to individual fundamentals for a final tune-up",
              "Less teaching, more reinforcing, simplifying to your best content, and competing",
              "Reducing practice frequency to keep players fresh",
            ],
            correctAnswer:
              "Less teaching, more reinforcing, simplifying to your best content, and competing",
            explanation:
              "Execution is not the time to add new information. You sharpen and simplify. Run your stuff at full speed and trust what you've built in the previous 12 weeks.",
          },
        ],
      },
      {
        id: "lesson-writing-a-btb-practice-plan",
        title: "How to Write a BTB Practice Plan",
        description: `Every BTB practice starts with a written plan. Not a rough mental outline — a written plan with times, activities, setups, and coaching points. Writing the plan forces clarity. If you cannot write a clear description of what you're teaching and why in a given segment, that is a signal you don't understand the segment well enough yet. The plan is also what separates intentional coaches from reactive coaches. Reactive coaches show up and run whatever comes to mind. Intentional coaches show up with a roadmap and execute it.

A BTB practice plan has six components: (1) The objective — what is the single most important thing your team will be better at when they leave today? (2) The warm-up — position-specific activation that connects directly to the day's work. (3) The skill block — isolated, high-repetition individual or small-group work on the day's core skill. (4) The application block — live or semi-live situations that put the day's skill in context. (5) The team block — full-group concepts, either 6v6 situations or special teams work. (6) The close — a specific coaching point or film clip that gives players something concrete to carry into the next session.

Timing matters enormously. BTB coaches know exactly how long each segment runs and they watch the clock. Running five minutes over on your skill block means your application block gets cut, and application is where learning actually solidifies. Use a stopwatch. Transition your players efficiently between segments — "bring it in, we're moving to the next drill" should take 90 seconds or less. Slow transitions are one of the biggest thieves of practice time, and they signal disorganization to your players.

Before practice, always walk the field and set up your cones, bags, and equipment so transitions are instant. Brief your assistant coaches on the plan so they're running their own groups without needing you to explain everything in real time. The quality of your off-field preparation is directly visible in the quality of your on-field practice. Coaches who wing it always produce practices that feel scattered — even if individual drills are good — because there's no coherent arc to the session.`,
        questions: [
          {
            question: "Why does BTB require a written practice plan rather than a mental outline?",
            options: [
              "Written plans are required by the league for liability reasons",
              "Writing forces clarity — if you can't write it clearly, you don't understand it well enough yet",
              "Written plans are easier to share with parents after practice",
              "Mental outlines are unreliable for coaches with large staffs",
            ],
            correctAnswer:
              "Writing forces clarity — if you can't write it clearly, you don't understand it well enough yet",
            explanation:
              "The act of writing a plan is itself a coaching tool — it forces you to think through each segment, its purpose, and its coaching points before you're standing on the field.",
          },
          {
            question: "What are the consequences of running overtime on a skill block?",
            options: [
              "Players get extra reps which accelerates their development",
              "The application block gets cut, and application is where learning solidifies",
              "The warm-up for the next session has to be shortened",
              "Coaches lose trust with parents who are waiting for practice to end",
            ],
            correctAnswer:
              "The application block gets cut, and application is where learning solidifies",
            explanation:
              "Isolated skill work builds mechanics, but application in live situations is where those mechanics become usable. Sacrificing application time is a hidden cost that many coaches don't track.",
          },
        ],
      },
      {
        id: "lesson-transitions-and-tempo",
        title: "Transitions, Tempo, and Coaching Points That Land",
        description: `One of the clearest signals of a well-coached team is what happens between drills. When a BTB coach says "bring it in," players sprint. There's no wandering, no finishing an extra rep that wasn't planned, no standing around waiting to see what's next. Players know the pace because the coach has established the pace from day one. Fast transitions are not just about efficiency — they are a standard. They tell players that every minute is valuable, that we don't waste time, and that urgency is the norm here.

Practice tempo should match the phase of the season and the goal of the day, but even in lower-tempo Foundation Phase sessions, the transitions between segments should be sharp. The drill itself might be at 70% intensity to focus on mechanics, but the sprint to the cone to start the drill is at 100%. There is never a pace lower than full effort on the things that aren't about the skill — getting to spots, hustling through lines, sprinting in from the sideline. Those micro-moments of effort are where habits live.

Coaching points are only as good as their timing and specificity. The worst coaching points are generic ("good job," "come on, let's go, let's compete") and they teach players nothing. The best coaching points are specific, immediate, and tied to the visual in front of the player: "Right there — did you see how your elbow dropped right before the release? That's why the ball went low. Keep that elbow up and watch what happens." Good coaching points create a moment of understanding, not just a moment of correction.

BTB coaches are trained to give no more than one coaching point per rep. If you give a player three corrections at once, he processes none of them — the brain can't prioritize three new inputs in the middle of a competitive rep. Pick the most important thing you see, name it, explain why it matters, and give him a chance to apply it. Then if there's a second issue, address it in the next rep. This is how motor learning actually works — focused, targeted feedback applied immediately.`,
        questions: [
          {
            question: "What do fast, sharp transitions between drills communicate to players?",
            options: [
              "That the coaching staff is running behind schedule and needs to catch up",
              "That every minute is valuable, we don't waste time, and urgency is the norm",
              "That the next drill will be more difficult than the one just finished",
              "That players need to conserve energy for later in practice",
            ],
            correctAnswer:
              "That every minute is valuable, we don't waste time, and urgency is the norm",
            explanation:
              "Transitions are a teaching moment in themselves. How players move between drills reflects the standard of effort the coach has established — and coaches who tolerate slow transitions are teaching players that urgency is optional.",
          },
          {
            question: "Why should BTB coaches limit themselves to one coaching point per rep?",
            options: [
              "More coaching points would make practice sessions run too long",
              "Players can only focus on one skill at a time due to physical limitations",
              "The brain cannot prioritize multiple new inputs during a competitive rep — only focused feedback leads to learning",
              "Multiple coaching points are reserved for veteran players who can handle more information",
            ],
            correctAnswer:
              "The brain cannot prioritize multiple new inputs during a competitive rep — only focused feedback leads to learning",
            explanation:
              "Motor learning research is clear: targeted, specific, immediate feedback on one thing at a time is far more effective than stacking corrections. Less is more in the moment.",
          },
        ],
      },
      {
        id: "lesson-age-appropriate-practice",
        title: "Designing Age-Appropriate Practice: U9 Through High School",
        description: `The biggest mistake coaches make when designing practice for younger players is scaling down an adult practice. Younger players do not need a simplified version of what older players do — they need a completely different approach that matches their physical capabilities, attention spans, and learning styles. A well-designed U9 practice looks fundamentally different from a well-designed U15 practice, not just in content but in structure, pace, and tone.

For U9 and U10 players, practices should be game-based, movement-heavy, and fun. At this age, the goal is not technical mastery — it is building love of the game and developing broad athletic foundations (balance, coordination, spatial awareness). Keep drills short (5–7 minutes max), keep lines short, and use lots of games and challenges. "Score a point if you make 5 catches in a row" teaches the same skill as a rote drill but with far more engagement. The coaching point is delivered in the context of the game, not as a lecture.

For U12 and U13 players, you can begin introducing more structure and technical instruction. Attention spans have grown, competitive drive has emerged, and players can handle more repetitions of isolated skills before losing focus. This is the age to build strong stick skills habits, introduce basic offensive and defensive concepts, and begin talking about team strategy in simple terms. Coaching points should still be delivered one at a time and connected to what the player wants (scoring, winning ground balls, defending well) rather than abstract technique.

High school-level practices (U15 and up) can handle adult-level structure, complexity, and volume. Players can sustain focus through longer skill blocks, absorb more complex tactical instruction, and handle direct feedback without it being softened. They are also capable of real leadership conversations — this is the age where BTB coaches are actively developing players as future leaders, not just future lacrosse players. The content gets deeper, the conversations get more honest, and the standard gets higher. But the foundation — respect, purpose, clarity — stays the same at every level.`,
        questions: [
          {
            question: "What is the primary goal of U9/U10 BTB practices?",
            options: [
              "Building technical stick skill mastery before bad habits form",
              "Building love of the game and broad athletic foundations",
              "Introducing the BTB 6v6 offensive system",
              "Developing a competitive mindset for tournament play",
            ],
            correctAnswer: "Building love of the game and broad athletic foundations",
            explanation:
              "At U9/U10, love of the game and athletic development (balance, coordination, spatial awareness) are the real objectives. Technical mastery at this age is a secondary concern.",
          },
          {
            question: "How should coaching points be framed for U12/U13 players?",
            options: [
              "As abstract technical descriptions the same way they would be for high school players",
              "Connected to what the player wants — scoring, winning ground balls, defending well",
              "Saved for after practice so they don't interrupt the flow of the session",
              "Delivered by team captains to build peer accountability",
            ],
            correctAnswer:
              "Connected to what the player wants — scoring, winning ground balls, defending well",
            explanation:
              "Players at this age are motivated by outcomes they care about. Connect your coaching point to something they want and you dramatically increase the chance it actually sticks.",
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 3: FILM STUDY FOR COACHES
  // ============================================================
  {
    id: "module-film-study",
    title: "Film Study for Coaches",
    description:
      "Master how to run film sessions that actually build lacrosse IQ — what to look for, how to give feedback players can use, and how to turn video into a competitive advantage.",
    icon: "🎬",
    color: "from-purple-600 to-purple-800",
    lessons: [
      {
        id: "lesson-running-a-film-session",
        title: "How to Run a Film Session That Players Actually Learn From",
        description: `Most coaches who attempt film sessions make the same mistake: they turn on the video and narrate everything they see, start to finish. Players check out within ten minutes. A film session is not a film viewing — it is a facilitated teaching session where video is the evidence, not the content itself. The coach is the teacher, and the job of the teacher is to guide players toward understanding, not to lecture them until they understand.

A BTB film session has a clear agenda with three or fewer teaching points. Before you press play, you tell the room: "Today we're going to look at two things — our slide communication on the weak-side and our transition reads coming out of our own end. That's it." Now players know what to watch for, and their attention is focused. When you play a clip, pause it at the exact moment the teaching point is visible — not before, not after. Ask a player to identify what they see before you tell them. "DeShawn, what do you see happening with the weak-side slide here? Before it's too late — where should it be coming from?" This develops lacrosse IQ rather than just delivering information.

The length of a film session matters. For high school players, 25–35 minutes is the sweet spot. Below that, you can't get depth on any topic. Above that, attention drops sharply and retention falls off. For younger players, 10–15 minutes is a maximum — and even then you need to keep clips short, move fast, and make it interactive. Reward players who identify something correctly with real acknowledgment, not generic praise: "That's exactly right — you saw the timing of the cut before the defender did, that's advanced IQ for a sophomore."

Film is also an incredibly powerful positive feedback tool that coaches underuse. BTB coaches look for great plays, great decisions, great effort plays — and they feature them in film. A player watching himself make a great read on the screen gets the same dopamine hit as getting a compliment, but it's more concrete and more repeatable. It also shows the rest of the team what excellent looks like in your system. Lead with what you want more of, then address what needs to change.`,
        questions: [
          {
            question: "What is the most common mistake coaches make in film sessions?",
            options: [
              "Starting the session without a clear agenda",
              "Narrating everything they see from start to finish while players check out",
              "Showing too many positive clips and not enough corrective ones",
              "Running sessions that are too short to cover enough content",
            ],
            correctAnswer:
              "Narrating everything they see from start to finish while players check out",
            explanation:
              "Film is evidence, not content. When a coach narrates everything, players become passive. An effective film session is facilitated — the coach guides players to find the insight themselves.",
          },
          {
            question: "Why should a BTB film session have three or fewer teaching points?",
            options: [
              "More teaching points require a longer session which disrupts practice schedules",
              "Three points is the limit set by BTB organizational guidelines",
              "Focused attention produces learning; unfocused attention produces exhaustion without retention",
              "Players at the high school level can only absorb three new concepts per week",
            ],
            correctAnswer:
              "Focused attention produces learning; unfocused attention produces exhaustion without retention",
            explanation:
              "Fewer, focused teaching points with clear evidence create real understanding. Covering ten topics in a film session means players retain zero of them clearly.",
          },
          {
            question: "How should BTB coaches use film for positive feedback?",
            options: [
              "Only during end-of-season review sessions",
              "Feature great plays and decisions prominently — show what excellent looks like in your system",
              "Limit positive clips to one per session to maintain balance with corrective content",
              "Reserve positive film review for individual meetings, not team sessions",
            ],
            correctAnswer:
              "Feature great plays and decisions prominently — show what excellent looks like in your system",
            explanation:
              "Seeing yourself make a great play on film is concrete, repeatable positive reinforcement. It also shows the whole team what the standard looks like in action — more powerful than any description.",
          },
        ],
      },
      {
        id: "lesson-what-to-look-for",
        title: "What to Actually Look for on Film",
        description: `Most coaches watch film the same way they watch a game — following the ball. When you watch film this way, you only see about 30% of what's actually happening. The ball carrier's decisions are important, but what the five other players are doing off the ball almost always determines whether the play succeeds or fails. Training yourself to watch off-ball movement — on both offense and defense — is the single biggest upgrade you can make to your film analysis skill.

On the offensive side, the things that matter most are: (1) Off-ball movement — are players cutting with purpose, or just standing and watching? A standing offensive player is a defender's vacation. (2) Spacing — are players creating the proper field gaps that allow dodges to develop and passes to travel? Bad spacing collapses the field and turns a numerical advantage into chaos. (3) Decision timing — is the ball carrier making decisions before pressure arrives, or holding the ball until they're in trouble? The best players make decisions when they have options; poor decision-makers wait until they have none.

On the defensive side: (1) Communication — are defenders calling out screens, slide responsibilities, and ball position before they're needed? Communication that happens after the fact is not communication. (2) Slide discipline — are players sliding too early (giving the offense a free pass), too late (allowing a quality shot), or at the right time with the right hands? (3) Recovery — after a slide, is the whole defense rotating or are two players chasing the ball while the far side stands still? Recovery is often where defenses break down and coaches miss it on film because they're still watching the slide.

Goalie film analysis is its own discipline. Watch for arc positioning — is the goalie on the right spot relative to ball position? Watch step-to-ball timing — does the goalie step before or after the shot? Watch top-hand mechanics on saves. Watch communication with defenders before the shot is taken. A great film session with your goalkeeper alone, going through three or four clips in detail, can produce more growth than a week of on-field goalie training.`,
        questions: [
          {
            question: "What is the biggest mistake coaches make when watching film?",
            options: [
              "Watching too much film and fatiguing their analytical ability",
              "Only watching film from their own team and not studying opponents",
              "Following the ball and missing the 70% of the play that happens off-ball",
              "Focusing too much on individual players rather than team concepts",
            ],
            correctAnswer:
              "Following the ball and missing the 70% of the play that happens off-ball",
            explanation:
              "Off-ball movement determines most outcomes in lacrosse. The decisions of the five players not touching the ball are often more instructive than what the ball carrier is doing.",
          },
          {
            question: "In terms of defensive film analysis, what does 'recovery' refer to?",
            options: [
              "How quickly a defender gets back on his feet after a fall",
              "The whole defense rotating after a slide, ensuring coverage doesn't collapse on the far side",
              "A goalie recovering position after making a save",
              "Defenders recovering a ground ball after a missed shot",
            ],
            correctAnswer:
              "The whole defense rotating after a slide, ensuring coverage doesn't collapse on the far side",
            explanation:
              "When one defender slides, the entire defense must rotate to maintain coverage. Defenses most often break down in this rotation, and it's frequently missed on film because everyone watches the slide.",
          },
        ],
      },
      {
        id: "lesson-building-lacrosse-iq",
        title: "Building Lacrosse IQ in Your Players Through Film",
        description: `Lacrosse IQ is the ability to read the game — to see what's developing before it happens and make decisions based on what you see rather than reacting to what already occurred. High lacrosse IQ players are the ones you want the ball with in the most important moments. They see the open man before he's open. They recognize the slide coming before it arrives. They know where to be before the play gets there. Film study, done correctly, is the most direct path to developing lacrosse IQ in your players.

The key to building IQ through film is asking questions, not providing answers. When you pause a clip and say "here's what's wrong," you are delivering information. When you pause a clip and say "what do you see here, Malik? If you're in Tyler's position, what are you reading right now?" — you are building the mental framework that Tyler and Malik will use in an actual game. This is the difference between players who can execute what they've been told and players who can solve problems they've never seen before.

BTB coaches use a specific technique called "pause-and-predict." You play a clip and pause it two seconds before a key decision moment — before the dodge, before the pass, before the slide. You then ask the room: "What happens next? What does this player see? What would you do?" Players commit to an answer, then you play forward and they see what actually happened and why. This technique creates active engagement and builds the same mental reps that a player gets in a game — the experience of reading a situation and making a prediction.

Build a clip library. Every time you see a great off-ball cut, a perfect slide timing, a brilliant feed from behind the goal, a well-executed fast break — clip it. Over time you build a teaching library that you can use across seasons, across age groups, and across situations. Label your clips by concept ("off-ball movement," "slide timing," "transition reads") so you can pull exactly the right evidence for a given teaching point. This turns film from something you do after a game into a permanent curriculum asset.`,
        questions: [
          {
            question: "What is the 'pause-and-predict' technique used in BTB film sessions?",
            options: [
              "Pausing to allow players to take notes before resuming the clip",
              "Pausing two seconds before a key decision and asking players what happens next before playing forward",
              "Pausing the film when a mistake occurs and keeping it paused until the player identifies it",
              "Predicting opponent tendencies by pausing on recurring formation sets",
            ],
            correctAnswer:
              "Pausing two seconds before a key decision and asking players what happens next before playing forward",
            explanation:
              "Pause-and-predict creates the same mental rep as a real game read. Players commit to a prediction, see the outcome, and learn from the comparison — this builds actual decision-making frameworks.",
          },
          {
            question: "Why does asking questions develop more lacrosse IQ than providing answers?",
            options: [
              "Questions are less confrontational and keep players more emotionally comfortable",
              "Answers provided by coaches are often incorrect and mislead players",
              "Questions build mental frameworks players can use to solve new problems; answers only deliver information for known situations",
              "Players retain verbal questions better than visual information from film",
            ],
            correctAnswer:
              "Questions build mental frameworks players can use to solve new problems; answers only deliver information for known situations",
            explanation:
              "When you give the answer, players can execute that scenario. When you guide them to find the answer, they develop the thinking process they'll use to solve scenarios they've never seen before.",
          },
        ],
      },
    ],
  },

  // ============================================================
  // MODULE 4: PLAYER DEVELOPMENT AND COMMUNICATION
  // ============================================================
  {
    id: "module-player-development",
    title: "Player Development and Communication",
    description:
      "The most important skills a BTB coach develops are off the field — how to coach different personalities, build genuine trust, give feedback that sticks, and grow tomorrow's leaders.",
    icon: "🤝",
    color: "from-orange-600 to-orange-800",
    lessons: [
      {
        id: "lesson-coaching-different-personalities",
        title: "Coaching Different Personality Types",
        description: `Every player who walks onto a BTB field has a different operating system. Some players are motivated by challenge and competition — tell them it's impossible and watch them attack it. Some players are motivated by relationships — they play harder for coaches they feel genuinely care about them. Some players are internally driven and need space and trust. Some players need structure, clear expectations, and step-by-step feedback. None of these types are wrong, and none require a different standard — but they all require a different approach to communication.

The most common mistake coaches make is using the same communication style with every player. The coach who yells direct corrections in front of the team may energize his competitive extroverts while quietly shutting down his quieter, more internally-driven players — and losing them permanently without even realizing it. Great coaches are translators. They know how to deliver the same message — "your footwork on that approach step needs to improve" — in a way that lands for every type of player on the roster.

A practical framework for thinking about personality types on your roster: (1) Competitors — motivated by being tested, thrive on challenge and direct comparison. Give them hard targets, high expectations, and honest direct feedback. (2) Connectors — motivated by belonging and relationship. Need to feel that you know them and care about them before they'll really trust your coaching. (3) Thinkers — motivated by understanding the why. Explain your reasoning, give them context, let them ask questions. (4) Stabilizers — motivated by consistency, routine, and clear expectations. Need structure and predictability to perform at their best. Most players are a blend of two of these types.

The fastest way to identify how a player is wired is to watch how he responds to adversity. When things get hard, does he lean in, check out, look to others, or go quiet and internal? That response pattern tells you everything about how he processes pressure and how you need to communicate when his development requires something difficult.`,
        questions: [
          {
            question: "Why is using the same communication style with every player a coaching mistake?",
            options: [
              "Inconsistent communication confuses players about what is expected",
              "Some players require the same message delivered in fundamentally different ways for it to land",
              "Personalized coaching takes too much time and slows down practice",
              "Players compare how coaches speak to them and get upset when treated differently",
            ],
            correctAnswer:
              "Some players require the same message delivered in fundamentally different ways for it to land",
            explanation:
              "The standard is the same for everyone. But a direct, public correction that energizes a competitor can permanently shut down a connector or thinker. Great coaches are translators — same message, different delivery.",
          },
          {
            question: "What is the fastest way to identify how a player is wired?",
            options: [
              "Asking the player directly which communication style they prefer",
              "Reviewing the player's background and athletic history",
              "Watching how he responds to adversity — does he lean in, check out, look to others, or go quiet?",
              "Consulting with parents about the player's learning style at home",
            ],
            correctAnswer:
              "Watching how he responds to adversity — does he lean in, check out, look to others, or go quiet?",
            explanation:
              "Adversity response is the most revealing behavioral signal available to a coach. It shows you how the player processes pressure, which is exactly when your communication needs to be most effective.",
          },
        ],
      },
      {
        id: "lesson-building-trust",
        title: "Building Trust With Players: The Foundation of All Coaching",
        description: `Trust is the medium through which coaching works. You can have the best lacrosse knowledge in the state, but if a player doesn't trust you, he will resist your coaching — subtly or overtly. He will go through the motions on drills he doesn't believe in. He will tune out feedback that doesn't feel safe to receive. He will look for reasons to justify his own approach rather than adopt yours. Coaching without trust is like trying to pour water through a sealed lid. The message is there; it just can't get in.

BTB coaches build trust through four specific behaviors: (1) Knowing your players. Not just knowing their position or their strengths — knowing their name before they tell you, remembering what they said last week, knowing they had a hard game and checking in on it before practice starts. Players can tell the difference between a coach who sees them and a coach who sees a roster spot. (2) Consistency. Players trust coaches who behave the same way when things are going well and when things are going badly. If you're only positive when you're winning and critical when you're losing, players learn that your feedback is about your mood, not about their development. (3) Honesty. Players, especially teenagers, have finely tuned dishonesty detectors. When you tell every player they're great and no one gets direct feedback about what needs to improve, they know it's not real. Honest coaches are trusted coaches. (4) Following through. If you say you're going to do something — get him extra reps, connect him with a college coach, have a conversation with his parents — do it.

The most powerful trust-building moments happen outside of practice. The conversation on the bus after a tough loss. The quick text to a player who you noticed was quiet that day. The end-of-season written note to every player on the team. These moments cost you almost nothing and mean more to players than anything you do on the field.

Trust is especially critical when delivering hard feedback. A player who trusts you can receive "I need more from you — your effort has dropped and it's affecting the team" without shutting down. A player who doesn't trust you will hear that same feedback as an attack and will either argue or disengage. The relationship you build in the low-stakes moments is the account you draw from when you need to make a hard withdrawal.`,
        questions: [
          {
            question: "What are the four specific behaviors through which BTB coaches build trust?",
            options: [
              "Winning consistently, running tough practices, tracking stats, and celebrating victories",
              "Knowing your players, consistency, honesty, and following through",
              "Being friendly, avoiding criticism, giving everyone equal playing time, and involving parents",
              "Positive reinforcement, high expectations, clear rules, and fair consequences",
            ],
            correctAnswer: "Knowing your players, consistency, honesty, and following through",
            explanation:
              "Trust is built through these four concrete behaviors — not through being nice or winning games. Each behavior addresses a different dimension of what makes a relationship feel safe and credible.",
          },
          {
            question: "Why is trust especially critical when delivering hard feedback?",
            options: [
              "Players without trust tend to share negative feedback publicly on social media",
              "Players who trust you can receive difficult feedback without shutting down; players who don't hear it as an attack",
              "Hard feedback always damages trust and should be minimized in healthy coach-player relationships",
              "Trust allows coaches to deliver more feedback per session, increasing efficiency",
            ],
            correctAnswer:
              "Players who trust you can receive difficult feedback without shutting down; players who don't hear it as an attack",
            explanation:
              "The trust relationship is the account you draw from. Hard feedback is a withdrawal — if the account is empty, the withdrawal causes damage. Fill the account first through the four trust-building behaviors.",
          },
        ],
      },
      {
        id: "lesson-feedback-that-sticks",
        title: "Giving Feedback That Actually Sticks",
        description: `Most coaching feedback evaporates within 24 hours. The player nods, says "got it," and shows up the next day doing the exact same thing. This is not because players are lazy or don't care — it is because feedback was delivered in a way that didn't create the conditions for real behavior change. Understanding how feedback actually works is one of the highest-leverage skill sets a BTB coach can develop.

The most effective feedback is specific, timely, and actionable. Specific means it describes an exact behavior, not a general quality: "Your hands were too close to your body on that catch — hands away from your body, like you're reaching for the ball" is specific. "You need to catch better" is not. Timely means delivered as close to the moment of the behavior as possible — within the rep, within the drill, not three days later in a film session. Actionable means the player knows exactly what to do differently on the very next rep. Feedback that doesn't include a clear next action leaves the player with only awareness of a problem, not a path to solving it.

The sandwich method (positive-negative-positive) is one of the most widely taught feedback techniques and one of the least effective. Players who receive this pattern regularly learn to brace for the correction the moment they hear the first compliment. They're not listening to the positive — they're waiting for the "but." BTB coaches use a more honest structure: lead with the specific observation, name why it matters in the context of what the player wants to accomplish, provide the specific correction, and ask the player to repeat it back. "On that approach step, your feet were crossing — when your feet cross, you can't change direction and you'll get beaten every time. Try it again and this time think about chopping your steps when you get within five yards. What are you going to focus on?" Asking the player to state their focus seals the feedback loop.

Written feedback is underutilized by coaches. After key practices or games, a brief, specific note to a player — physical or digital — that names one thing they did well and one thing to work on creates a lasting artifact. Players re-read those notes. They come back to them. A handwritten note from a coach after a tough game is something a player may carry for years.`,
        questions: [
          {
            question: "What makes feedback 'specific' in the BTB framework?",
            options: [
              "Using the player's name when delivering the feedback",
              "Describing an exact behavior rather than a general quality",
              "Keeping feedback short so it's easy to remember",
              "Delivering feedback in a one-on-one setting rather than in front of the team",
            ],
            correctAnswer: "Describing an exact behavior rather than a general quality",
            explanation:
              "Specific feedback tells the player exactly what they did and what to do differently. 'Catch better' gives the player nothing to work with. 'Hands away from your body, reaching for the ball' gives them an immediate, repeatable action.",
          },
          {
            question: "Why is the feedback sandwich (positive-negative-positive) often ineffective?",
            options: [
              "Players find positive feedback condescending when paired with criticism",
              "Players learn to brace for the correction the moment they hear the first compliment and stop listening",
              "The positive comments don't apply to the skills being corrected",
              "It takes too long and reduces the number of feedback interactions per practice",
            ],
            correctAnswer:
              "Players learn to brace for the correction the moment they hear the first compliment and stop listening",
            explanation:
              "The sandwich pattern trains players to ignore the positive components. A more honest, direct structure with a clear next action is more effective than padding correction between compliments.",
          },
          {
            question: "What does 'closing the feedback loop' mean in the BTB framework?",
            options: [
              "Following up with a player the next day to see if feedback was applied",
              "Asking the player to state their focus back to you after receiving a correction",
              "Recording all feedback in a coaching journal for end-of-season review",
              "Confirming with parents that a coaching conversation took place",
            ],
            correctAnswer:
              "Asking the player to state their focus back to you after receiving a correction",
            explanation:
              "Asking a player to repeat their focus back to you confirms they've processed the feedback and converts it from hearing into intention. This dramatically increases the probability that it carries into the next rep.",
          },
        ],
      },
      {
        id: "lesson-developing-leaders",
        title: "Developing Leaders: Growing Players Who Carry the Culture Forward",
        description: `The highest-leverage thing a BTB coach can do for a program's long-term health is develop genuine leaders — players who buy into the culture so deeply that they carry it forward without needing the coach to prompt them. When you have two or three players like this on every team, the culture reinforces itself. When you don't, the coach has to do all the work, and the culture collapses every time the coach isn't watching.

Leadership development is not about assigning captains at the start of the season and calling it done. It is a deliberate, ongoing process of identifying players with leadership potential, giving them real responsibility, holding them to a higher standard, and having honest conversations with them about what leadership actually requires. The player who is the most naturally talented is not automatically the best leader — sometimes he's the worst choice, because his talent insulates him from the accountability that leadership demands. Look for the player who holds himself accountable without being told to. That is the seedling you want to develop.

BTB coaches hold explicit leadership conversations with high-potential players. These are not motivational speeches — they are honest assessments: "I see you as someone who could be a real leader on this team next year. Here's what I see you doing well as a leader already. Here's what I need to see change. Are you willing to take that on?" Name what you see, name what you need, and ask for commitment. Most players, when a coach they trust tells them they see leadership potential in them, will do extraordinary things to live up to that vision.

The concrete responsibilities you give a leader matter. Meaningful responsibilities include: running part of the warm-up, leading film discussions, being the voice in the huddle during a timeout, having direct conversations with teammates who are not meeting the standard. These are not honorary roles — they are real leadership moments with real consequences. A leader who fails to address a teammate's behavior gap, knowing the coach expects him to, learns something real about accountability. A leader who does address it — even awkwardly — has done something genuinely difficult and grows as a result.`,
        questions: [
          {
            question: "Why is the most talented player not automatically the best leadership candidate?",
            options: [
              "Talented players are resented by teammates and lose their authority",
              "Talent and leadership require different practice schedules that are hard to combine",
              "His talent insulates him from accountability — leadership requires a player who holds himself accountable without being told",
              "Talented players are typically more focused on their individual performance than team outcomes",
            ],
            correctAnswer:
              "His talent insulates him from accountability — leadership requires a player who holds himself accountable without being told",
            explanation:
              "Natural talent often means a player can get away with things others can't, which can actually undermine the accountability habits that real leadership requires. Look for self-accountability first.",
          },
          {
            question: "What makes leadership responsibilities 'meaningful' in the BTB model?",
            options: [
              "They are visible to parents and look impressive on college applications",
              "They are honorary roles that recognize a player's contribution to the program",
              "They are real roles with real consequences — running warm-ups, leading film, addressing teammates directly",
              "They are assigned by vote so the team feels ownership over the process",
            ],
            correctAnswer:
              "They are real roles with real consequences — running warm-ups, leading film, addressing teammates directly",
            explanation:
              "Honorary leadership titles don't develop leaders. Real leadership moments with real stakes — where a player has to do something difficult and lives with the result — are where growth happens.",
          },
          {
            question: "What is the structure of a BTB explicit leadership conversation?",
            options: [
              "A motivational speech about the program's vision for the upcoming season",
              "An honest assessment: name what you see, name what you need, and ask for commitment",
              "A formal review of the player's statistics and role on the depth chart",
              "A group discussion with the full team about leadership values and expectations",
            ],
            correctAnswer:
              "An honest assessment: name what you see, name what you need, and ask for commitment",
            explanation:
              "Leadership conversations are not inspirational — they're honest and specific. Name the potential you see, name the gap you need addressed, and ask the player to commit. This creates accountability and gives the player a clear growth target.",
          },
        ],
      },
    ],
  },
]
