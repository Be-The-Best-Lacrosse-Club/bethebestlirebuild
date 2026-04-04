import type { Course, Gender } from "@/types"

// Course data for Player Hubs — organized by gender and grad year
// Replace video URLs with real BTB film content when ready

function makeCourses(gender: Gender): Course[] {
  const gradYears = gender === "boys"
    ? ["2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"]
    : ["2030", "2031", "2032", "2033", "2034", "2035", "2036"]

  return gradYears.flatMap((year) => [
    {
      id: `${gender}-film-${year}`,
      title: `Film Study — Class of ${year}`,
      gradYear: year,
      gender,
      description: "Weekly film breakdown sessions. Watch, analyze, and learn from your own game footage with guided coaching points.",
      steps: [
        { id: `${gender}-film-${year}-1`, stepNumber: 1, title: "Introduction to Film Study", type: "reading", content: { description: "Why film study matters and how BTB uses it to accelerate your development. Read through the guide and mark complete when ready." } },
        { id: `${gender}-film-${year}-2`, stepNumber: 2, title: "Week 1 Film Session", type: "film", content: { videoUrl: "", description: "Watch the film clip and identify 3 things you did well and 2 areas for improvement.", duration: 15 } },
        { id: `${gender}-film-${year}-3`, stepNumber: 3, title: "Film Study Quiz — Defensive Reads", type: "question", content: { question: "When your adjacent defender slides to the ball, what is your primary responsibility?", options: ["Follow the slide", "Rotate to fill the open space", "Stay with your man", "Call for a switch"], correctAnswer: 1 } },
        { id: `${gender}-film-${year}-4`, stepNumber: 4, title: "Week 2 Film Session", type: "film", content: { videoUrl: "", description: "Focus on transition reads. When does the break happen and how quickly do you recognize it?", duration: 15 } },
        { id: `${gender}-film-${year}-5`, stepNumber: 5, title: "Film Study Quiz — Transition", type: "question", content: { question: "In a 4-on-3 fast break, what should the ball carrier prioritize?", options: ["Take the shot immediately", "Draw a defender and dish", "Slow down and set up", "Call timeout"], correctAnswer: 1 } },
        { id: `${gender}-film-${year}-6`, stepNumber: 6, title: "Week 3 Film Session", type: "film", content: { videoUrl: "", description: "Settled offense analysis. Identify the scoring opportunity before the player on film sees it.", duration: 15 } },
        { id: `${gender}-film-${year}-7`, stepNumber: 7, title: "Self-Scouting Report", type: "reading", content: { description: "Write a self-scouting report based on 3 weeks of film. Identify your top 2 strengths and top 2 areas for improvement. Submit to your coach." } },
        { id: `${gender}-film-${year}-8`, stepNumber: 8, title: "Final Film Assessment", type: "question", content: { question: "After reviewing 3 weeks of your own film, which best describes the purpose of film study?", options: ["Finding mistakes to criticize", "Building lacrosse IQ through visual pattern recognition", "Comparing yourself to other players", "Watching highlights"], correctAnswer: 1 } },
      ],
    },
    {
      id: `${gender}-skills-${year}`,
      title: `Skill Progression — Class of ${year}`,
      gradYear: year,
      gender,
      description: "Position-specific skill development across the 16-week cycle. Track your progression through fundamentals, application, and execution.",
      steps: [
        { id: `${gender}-skills-${year}-1`, stepNumber: 1, title: "Foundation: Wall Ball Basics", type: "drill", content: { description: "Complete the wall ball sequence: 50 right, 50 left, 25 cross-hand, 25 quick-stick. Log your time.", duration: 20 } },
        { id: `${gender}-skills-${year}-2`, stepNumber: 2, title: "Foundation: Footwork Mechanics", type: "drill", content: { description: "Footwork ladder drill sequence. Focus on plant-and-throw mechanics with proper hip rotation.", duration: 15 } },
        { id: `${gender}-skills-${year}-3`, stepNumber: 3, title: "Foundation Check-In", type: "question", content: { question: "What is the most important factor in accurate passing?", options: ["Arm strength", "Follow-through and wrist snap toward target", "Throwing as hard as possible", "Using only your dominant hand"], correctAnswer: 1 } },
        { id: `${gender}-skills-${year}-4`, stepNumber: 4, title: "Connection: 2-Man Game Reads", type: "film", content: { videoUrl: "", description: "Watch the 2-man game film. Identify the pick-and-roll read and when the dodge-and-dish becomes available.", duration: 12 } },
        { id: `${gender}-skills-${year}-5`, stepNumber: 5, title: "Connection: Live Rep Log", type: "drill", content: { description: "Log 3 live reps where you executed a read from film study in a practice setting. Describe the situation and outcome.", duration: 30 } },
        { id: `${gender}-skills-${year}-6`, stepNumber: 6, title: "Expansion: Game-Speed Drill", type: "drill", content: { description: "Complete the competitive small-sided game drill. Track goals, assists, and turnovers across 3 rounds.", duration: 25 } },
        { id: `${gender}-skills-${year}-7`, stepNumber: 7, title: "Expansion: Self-Scout Film", type: "film", content: { videoUrl: "", description: "Watch your own game clips and grade yourself on 3 categories: positioning, decision-making, execution.", duration: 20 } },
        { id: `${gender}-skills-${year}-8`, stepNumber: 8, title: "Execution: Skills Assessment", type: "question", content: { question: "What separates a good player from a college-ready player?", options: ["Natural talent alone", "Consistent execution under pressure with high lacrosse IQ", "Being the fastest on the field", "Playing the most games"], correctAnswer: 1 } },
      ],
    },
  ])
}

export const boysCourses: Course[] = makeCourses("boys")
export const girlsCourses: Course[] = makeCourses("girls")

export function getCourses(gender: Gender): Course[] {
  return gender === "boys" ? boysCourses : girlsCourses
}

export function getCoursesByGradYear(gender: Gender, gradYear: string): Course[] {
  return getCourses(gender).filter((c) => c.gradYear === gradYear)
}

export function getCourseById(id: string): Course | undefined {
  return [...boysCourses, ...girlsCourses].find((c) => c.id === id)
}
