import type { Course, Gender } from "@/types"

// Course data for Player Hubs — organized by gender and grad year
// Boys: JM3 Sports, Trilogy, First Class, Hogan, Trevor Baptiste, Jules Heningburg
// Girls: Taylor Cummings, Charlotte North, NORTH Lacrosse, Ally Carey, ShakeSchool, ECD

function makeBoyCourses(): Course[] {
  const gradYears = ["2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"]

  return gradYears.flatMap((year) => [
    {
      id: `boys-film-${year}`,
      title: `Film Study — Class of ${year}`,
      gradYear: year,
      gender: "boys" as Gender,
      description: "Weekly film breakdown sessions. Watch, analyze, and learn from game footage with guided coaching points.",
      steps: [
        { id: `boys-film-${year}-1`, stepNumber: 1, title: "Introduction to Film Study", type: "reading", content: { description: "Why film study matters and how BTB uses it to accelerate your development. Read through the guide and mark complete when ready." } },
        { id: `boys-film-${year}-2`, stepNumber: 2, title: "Week 1: Defense Slide & Recovery", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=rbL9yXyCXtQ", description: "Trilogy Lacrosse breaks down defensive slide and recovery. Identify 3 slide packages you see and what triggers each one.", duration: 15 } },
        { id: `boys-film-${year}-3`, stepNumber: 3, title: "Film Quiz — Defensive Reads", type: "question", content: { question: "When your adjacent defender slides to the ball, what is your primary responsibility?", options: ["Follow the slide", "Rotate to fill the open space", "Stay with your man", "Call for a switch"], correctAnswer: 1 } },
        { id: `boys-film-${year}-4`, stepNumber: 4, title: "Week 2: Fast Break Defense", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=iTs7eKIvBhI", description: "Lacrosse fast break defense concepts. Identify the exact moment the break becomes available — when do you push? When do you wait?", duration: 15 } },
        { id: `boys-film-${year}-5`, stepNumber: 5, title: "Film Quiz — Transition", type: "question", content: { question: "In a 4-on-3 fast break, what should the ball carrier prioritize?", options: ["Take the shot immediately", "Draw a defender and dish", "Slow down and set up", "Call timeout"], correctAnswer: 1 } },
        { id: `boys-film-${year}-6`, stepNumber: 6, title: "Week 3: Syracuse 43 Weave Motion", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=mQi0UQz_8ls", description: "JM3 Sports breaks down the Syracuse 43 Weave Motion Offense. Watch and pause at each decision point — could you make that read?", duration: 15 } },
        { id: `boys-film-${year}-7`, stepNumber: 7, title: "Self-Scouting Report", type: "reading", content: { description: "Write a self-scouting report based on 3 weeks of film. Identify your top 2 strengths and top 2 areas for improvement. Submit to your coach." } },
        { id: `boys-film-${year}-8`, stepNumber: 8, title: "Final Film Assessment", type: "question", content: { question: "After reviewing 3 weeks of film, which best describes the purpose of film study?", options: ["Finding mistakes to criticize", "Building lacrosse IQ through visual pattern recognition", "Comparing yourself to other players", "Watching highlights"], correctAnswer: 1 } },
      ],
    },
    {
      id: `boys-skills-${year}`,
      title: `Skill Progression — Class of ${year}`,
      gradYear: year,
      gender: "boys" as Gender,
      description: "Position-specific skill development across the 16-week cycle. Track your progression through fundamentals, application, and execution.",
      steps: [
        { id: `boys-skills-${year}-1`, stepNumber: 1, title: "Foundation: Wall Ball Basics", type: "drill", content: { description: "Complete the wall ball sequence: 50 right, 50 left, 25 cross-hand, 25 quick-stick. Log your time.", duration: 20 } },
        { id: `boys-skills-${year}-2`, stepNumber: 2, title: "Foundation: Footwork Mechanics", type: "drill", content: { description: "Footwork ladder drill sequence. Focus on plant-and-throw mechanics with proper hip rotation.", duration: 15 } },
        { id: `boys-skills-${year}-3`, stepNumber: 3, title: "Foundation Check-In", type: "question", content: { question: "What is the most important factor in accurate passing?", options: ["Arm strength", "Follow-through and wrist snap toward target", "Throwing as hard as possible", "Using only your dominant hand"], correctAnswer: 1 } },
        { id: `boys-skills-${year}-4`, stepNumber: 4, title: "Connection: Split Dodge Reads", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=ovd8u9ETUBk", description: "How to split dodge with purpose. Watch the off-ball movement — when does the cutter get open? When does the dodge-and-dish become available?", duration: 12 } },
        { id: `boys-skills-${year}-5`, stepNumber: 5, title: "Connection: Live Rep Log", type: "drill", content: { description: "Log 3 live reps where you executed a read from film study in a practice setting. Describe the situation and outcome.", duration: 30 } },
        { id: `boys-skills-${year}-6`, stepNumber: 6, title: "Expansion: Game-Speed Drill", type: "drill", content: { description: "Complete the competitive small-sided game drill. Track goals, assists, and turnovers across 3 rounds.", duration: 25 } },
        { id: `boys-skills-${year}-7`, stepNumber: 7, title: "Expansion: Greatest Motion Offense", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=zEtzK0HGeao", description: "JM3 Sports — Greatest Lacrosse Motion Offense. Grade yourself on 3 categories: positioning, decision-making, and execution.", duration: 20 } },
        { id: `boys-skills-${year}-8`, stepNumber: 8, title: "Execution: Skills Assessment", type: "question", content: { question: "What separates a good player from a college-ready player?", options: ["Natural talent alone", "Consistent execution under pressure with high lacrosse IQ", "Being the fastest on the field", "Playing the most games"], correctAnswer: 1 } },
      ],
    },
  ])
}

function makeGirlCourses(): Course[] {
  const gradYears = ["2030", "2031", "2032", "2033", "2034", "2035", "2036"]

  return gradYears.flatMap((year) => [
    {
      id: `girls-film-${year}`,
      title: `Film Study — Class of ${year}`,
      gradYear: year,
      gender: "girls" as Gender,
      description: "Weekly film breakdown sessions. Watch, analyze, and learn from game footage with guided coaching points.",
      steps: [
        { id: `girls-film-${year}-1`, stepNumber: 1, title: "Introduction to Film Study", type: "reading", content: { description: "Why film study matters and how BTB uses it to accelerate your development. Read through the guide and mark complete when ready." } },
        { id: `girls-film-${year}-2`, stepNumber: 2, title: "Week 1: Team Defense Adjacent Slides", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=2v4vfqctG88", description: "Women's lacrosse team defense — adjacent slides breakdown. Identify the slide trigger and the rotation that follows.", duration: 15 } },
        { id: `girls-film-${year}-3`, stepNumber: 3, title: "Film Quiz — Defensive Reads", type: "question", content: { question: "When your adjacent defender slides to the ball in women's lacrosse, what is your responsibility?", options: ["Follow the slide", "Rotate to fill the open space", "Stay with your mark", "Call for a switch"], correctAnswer: 1 } },
        { id: `girls-film-${year}-4`, stepNumber: 4, title: "Week 2: NORTH 2-3-1 Motion Offense", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=IEt5iXnMtsw", description: "NORTH Lacrosse 2-3-1 Motion Offense basics. Watch each player's movement — when does space open? When is the shot available?", duration: 15 } },
        { id: `girls-film-${year}-5`, stepNumber: 5, title: "Film Quiz — Motion Offense", type: "question", content: { question: "In a 2-3-1 motion offense, what creates the primary scoring opportunity?", options: ["Isolation 1-on-1", "Constant movement and cutting to create space", "Standing and waiting for the pass", "Always shooting from outside"], correctAnswer: 1 } },
        { id: `girls-film-${year}-6`, stepNumber: 6, title: "Week 3: Taylor Cummings Cutting", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=RwMQvpad-XE", description: "Taylor Cummings breaks down cutting technique. Watch and pause at each cut — what creates the opening? Could you make that read?", duration: 15 } },
        { id: `girls-film-${year}-7`, stepNumber: 7, title: "Self-Scouting Report", type: "reading", content: { description: "Write a self-scouting report based on 3 weeks of film. Identify your top 2 strengths and top 2 areas for improvement. Submit to your coach." } },
        { id: `girls-film-${year}-8`, stepNumber: 8, title: "Final Film Assessment", type: "question", content: { question: "After reviewing 3 weeks of film, which best describes the purpose of film study?", options: ["Finding mistakes to criticize", "Building lacrosse IQ through visual pattern recognition", "Comparing yourself to other players", "Watching highlights"], correctAnswer: 1 } },
      ],
    },
    {
      id: `girls-skills-${year}`,
      title: `Skill Progression — Class of ${year}`,
      gradYear: year,
      gender: "girls" as Gender,
      description: "Position-specific skill development across the 16-week cycle. Track your progression through fundamentals, application, and execution.",
      steps: [
        { id: `girls-skills-${year}-1`, stepNumber: 1, title: "Foundation: Wall Ball Basics", type: "drill", content: { description: "Complete the wall ball sequence: 50 right, 50 left, 25 cross-hand, 25 quick-stick. Log your time.", duration: 20 } },
        { id: `girls-skills-${year}-2`, stepNumber: 2, title: "Foundation: Footwork Mechanics", type: "drill", content: { description: "Footwork ladder drill sequence. Focus on plant-and-throw mechanics with proper hip rotation.", duration: 15 } },
        { id: `girls-skills-${year}-3`, stepNumber: 3, title: "Foundation Check-In", type: "question", content: { question: "What is the most important factor in accurate passing?", options: ["Arm strength", "Follow-through and wrist snap toward target", "Throwing as hard as possible", "Using only your dominant hand"], correctAnswer: 1 } },
        { id: `girls-skills-${year}-4`, stepNumber: 4, title: "Connection: Top 3 Dodge Moves", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=7deaRXF70Q8", description: "Top 3 dodge moves all elite girls lacrosse players use. Watch the footwork and decision-making — when does each dodge work?", duration: 12 } },
        { id: `girls-skills-${year}-5`, stepNumber: 5, title: "Connection: Live Rep Log", type: "drill", content: { description: "Log 3 live reps where you executed a read from film study in a practice setting. Describe the situation and outcome.", duration: 30 } },
        { id: `girls-skills-${year}-6`, stepNumber: 6, title: "Expansion: Game-Speed Drill", type: "drill", content: { description: "Complete the competitive small-sided game drill. Track goals, assists, and turnovers across 3 rounds.", duration: 25 } },
        { id: `girls-skills-${year}-7`, stepNumber: 7, title: "Expansion: Charlotte North Shooting", type: "film", content: { videoUrl: "https://www.youtube.com/watch?v=dxvAw7zudVg", description: "Charlotte North & Paul Rabil shooting drill. Grade yourself on 3 categories: shooting mechanics, release point, and accuracy.", duration: 20 } },
        { id: `girls-skills-${year}-8`, stepNumber: 8, title: "Execution: Skills Assessment", type: "question", content: { question: "What separates a good player from a college-ready player?", options: ["Natural talent alone", "Consistent execution under pressure with high lacrosse IQ", "Being the fastest on the field", "Playing the most games"], correctAnswer: 1 } },
      ],
    },
  ])
}


export const boysCourses: Course[] = makeBoyCourses()
export const girlsCourses: Course[] = makeGirlCourses()

export function getCourses(gender: Gender): Course[] {
  return gender === "boys" ? boysCourses : girlsCourses
}

export function getCoursesByGradYear(gender: Gender, gradYear: string): Course[] {
  return getCourses(gender).filter((c) => c.gradYear === gradYear)
}

export function getCourseById(id: string): Course | undefined {
  return [...boysCourses, ...girlsCourses].find((c) => c.id === id)
}
