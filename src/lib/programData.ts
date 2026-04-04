import { Video, Users, BookOpen, Target, TrendingUp, Shield } from "lucide-react"
import type { Gender, StatItem, Benefit, AgeGroup, Phase, Testimonial, CoachProfile, TeamInfo } from "@/types"

interface ProgramContent {
  label: string
  navLabel: string
  heroTagline: string
  heroSubtitle: string
  stats: StatItem[]
  benefits: Benefit[]
  highlightBenefitIndex: number
  ageGroups: AgeGroup[]
  phases: Phase[]
  testimonials: Testimonial[]
  filmStudyDescription: string
  filmStudyPoints: string[]
  teams: TeamInfo[]
  coaches: CoachProfile[]
  ctaHeadline: string
  ctaSubheadline: string
  ctaText: string
}

export const programData: Record<Gender, ProgramContent> = {
  boys: {
    label: "Boys Program",
    navLabel: "Boys",
    heroTagline: "Train Like You\nMean It.",
    heroSubtitle: "The BTB Boys Program is Long Island's most structured lacrosse development experience. Film study, position-specific coaching, a 16-week curriculum, and an 8:1 player-to-coach ratio — for every age group.",
    stats: [
      { num: "500+", label: "Players Trained" },
      { num: "85+", label: "College Commits" },
      { num: "8:1", label: "Player-Coach Ratio" },
      { num: "50+", label: "Documented Drills" },
    ],
    benefits: [
      { icon: Users, title: "Small-Group Training", stat: "8:1", text: "Max 8 players per coach. Real reps, real corrections, real coaching — not a number in a line drill." },
      { icon: Video, title: "Weekly Film Study", stat: "Required", text: "You'll watch your own footage with a coach who breaks down what you did right, what you missed, and how to fix it." },
      { icon: BookOpen, title: "Structured Curriculum", stat: "16 Weeks", text: "Every practice follows a written plan with timed segments and specific skill targets. Nothing is improvised." },
      { icon: Target, title: "Position-Specific Coaching", stat: "All Positions", text: "Attack, midfield, defense, goalie, FOGO. Your training is built for your position and what you actually need." },
      { icon: TrendingUp, title: "Recruiting Preparation", stat: "College Track", text: "Highlight film packages, outreach guidance, school list strategy, and honest profile evaluation." },
      { icon: Shield, title: "Certified Coaching Staff", stat: "Verified", text: "Every coach is background-checked, US Lacrosse certified, SafeSport trained, and submits practice plans before every session." },
    ],
    highlightBenefitIndex: 1,
    ageGroups: [
      { grad: "2034s–2033s", level: "Youth Development", description: "Foundation-level training focused on fundamentals, mechanics, and love of the game. Building habits before bad ones form." },
      { grad: "2032s–2031s", level: "Development", description: "Structured skill progression with introduction to film study. Players learn to self-assess and apply skills in live situations." },
      { grad: "2030s–2029s", level: "Competitive", description: "Game-speed training, positional reads, and transition play. Film study becomes a weekly requirement. Travel team competition." },
      { grad: "2028s–2027s", level: "Elite / Varsity Prep", description: "College-level preparation. Advanced film breakdown, recruiting toolkit, highlight film, and outreach coaching. The full BTB experience." },
    ],
    phases: [
      { num: "01", phase: "Foundation", weeks: "Weeks 1–4", items: ["Wall ball fundamentals", "Footwork & body mechanics", "Defensive concepts introduction", "Film study onboarding"] },
      { num: "02", phase: "Connection", weeks: "Weeks 5–8", items: ["2-man game reads", "Transition decision-making", "Position-specific film sessions", "Small-group competition"] },
      { num: "03", phase: "Expansion", weeks: "Weeks 9–12", items: ["Live game-speed scenarios", "Opponent film breakdown", "Self-scouting sessions", "Varsity-level positioning"] },
      { num: "04", phase: "Execution", weeks: "Weeks 13–16", items: ["Game evaluation & review", "Recruiting film preparation", "College-ready standards test", "Next-phase goal setting"] },
    ],
    testimonials: [
      { quote: "The film study changed my whole game. I started seeing defensive rotations before they happened. My high school coaches noticed within the first week of tryouts.", name: "Ethan K.", role: "Class of 2027 · Made Varsity as Freshman", initials: "EK" },
      { quote: "I committed to Stony Brook my junior year. I don't think that happens without BTB. The recruiting prep alone was worth it — knowing how to reach out, what to send, how to talk to coaches.", name: "Connor B.", role: "Committed to Stony Brook University", initials: "CB" },
      { quote: "My son came in as a good athlete who happened to play lacrosse. After two years at BTB, he is a lacrosse player who happens to be a good athlete. The difference is coaching.", name: "Jennifer M.", role: "Parent · 2028 Travel Team", initials: "JM" },
    ],
    filmStudyDescription: "Every BTB player studies film weekly with a coach. Your footage is captured, reviewed, and broken down into specific coaching points. Each clip ends with an actionable correction and a drill to match it. The next session targets what film identified.",
    filmStudyPoints: ["Your game on film", "Coach-led breakdown", "Specific corrections", "Drill-to-fix loop"],
    teams: [
      { gradYear: "2027", teamName: "Boys 2027", coachCount: 2, level: "Elite" },
      { gradYear: "2028", teamName: "Boys 2028", coachCount: 2, level: "Elite" },
      { gradYear: "2029", teamName: "Boys 2029", coachCount: 2, level: "Competitive" },
      { gradYear: "2030", teamName: "Boys 2030", coachCount: 2, level: "Competitive" },
      { gradYear: "2031", teamName: "Boys 2031", coachCount: 2, level: "Development" },
      { gradYear: "2032", teamName: "Boys 2032", coachCount: 2, level: "Development" },
      { gradYear: "2033", teamName: "Boys 2033", coachCount: 2, level: "Youth" },
      { gradYear: "2034", teamName: "Boys 2034", coachCount: 2, level: "Youth" },
    ],
    coaches: [
      { name: "Head Coach", title: "Program Director", credentials: ["US Lacrosse Certified", "SafeSport Trained", "10+ Years Coaching"], bio: "Placeholder — replace with real coach bio.", initials: "HC" },
      { name: "Assistant Coach", title: "Lead Trainer", credentials: ["US Lacrosse Certified", "SafeSport Trained", "D1 Playing Experience"], bio: "Placeholder — replace with real coach bio.", initials: "AC" },
    ],
    ctaHeadline: "Ready to Train\nLike You Mean It?",
    ctaSubheadline: "Boys Program",
    ctaText: "BTB is selective because development requires commitment. We want players who are serious about their game.",
  },

  girls: {
    label: "Girls Program",
    navLabel: "Girls",
    heroTagline: "Same Standard.\nBuilt for Her.",
    heroSubtitle: "The BTB Girls Program delivers the same structure, film study, and coaching standards as the boys' program — with a curriculum designed specifically for the women's game. Same commitment. Same accountability. Her development.",
    stats: [
      { num: "250+", label: "Girls Trained" },
      { num: "11", label: "Current Teams" },
      { num: "2", label: "Coaches Per Team" },
      { num: "7", label: "Grad Years (2030–2036)" },
    ],
    benefits: [
      { icon: Users, title: "Small-Group Training", stat: "8:1", text: "Max 8 players per coach. Every player gets real reps, real corrections, and real coaching attention every session." },
      { icon: Video, title: "Weekly Film Study", stat: "Required", text: "Watch your own footage with a coach who breaks down positioning, decision-making, and what to fix — every single week." },
      { icon: BookOpen, title: "Girls-Specific Curriculum", stat: "16 Weeks", text: "A development plan built specifically for the girls' game — draw controls, free position, defensive positioning, transition speed." },
      { icon: Target, title: "Position-Specific Coaching", stat: "All Positions", text: "Attack, midfield, defense, goalie. Training is built around your role and what your position actually demands in game situations." },
      { icon: TrendingUp, title: "Recruiting Preparation", stat: "College Track", text: "Highlight film packages, outreach coaching, school list strategy, and honest profile evaluation for players on the college track." },
      { icon: Shield, title: "Certified Coaching Staff", stat: "Verified", text: "Every coach is background-checked, US Lacrosse certified, SafeSport trained, and submits written practice plans before every session." },
    ],
    highlightBenefitIndex: 2,
    ageGroups: [
      { grad: "2036s–2035s", level: "Youth Development", description: "Foundation-level training focused on stick skills, body mechanics, and building confidence with the ball. Developing love for the game first." },
      { grad: "2034s–2033s", level: "Development", description: "Structured skill progression with introduction to film study. Learning to read the field, communicate on defense, and execute under pressure." },
      { grad: "2032s–2031s", level: "Competitive", description: "Game-speed training, draw control work, transition reads, and defensive slides. Weekly film study is required. Travel team competition." },
      { grad: "2030", level: "Elite / Varsity Prep", description: "College-level preparation. Advanced film breakdown, recruiting toolkit, highlight film packages, and outreach coaching. The full BTB experience." },
    ],
    phases: [
      { num: "01", phase: "Foundation", weeks: "Weeks 1–4", items: ["Stick fundamentals & off-hand", "Footwork & defensive body positioning", "Draw control introduction", "Film study onboarding"] },
      { num: "02", phase: "Connection", weeks: "Weeks 5–8", items: ["2v2 and 3v3 reads", "Transition speed & decision-making", "Free position execution", "Position-specific film sessions"] },
      { num: "03", phase: "Expansion", weeks: "Weeks 9–12", items: ["Live game-speed scenarios", "Opponent scouting film", "Slide timing & communication", "Pressure-tested competition"] },
      { num: "04", phase: "Execution", weeks: "Weeks 13–16", items: ["Game evaluation & self-scouting", "Recruiting film preparation", "College-ready standards test", "Next-cycle goal setting"] },
    ],
    testimonials: [
      { quote: "BTB was the first program that treated my daughter's development with the same structure and seriousness as the boys' program. The film study alone made a huge difference in her field awareness.", name: "Laura D.", role: "Parent · 2029 Travel Team", initials: "LD" },
      { quote: "I committed to James Madison my junior year. My BTB coach helped me build my film, figure out which schools fit, and learn how to actually talk to college coaches. I felt ready.", name: "Sophia R.", role: "Committed to James Madison University", initials: "SR" },
      { quote: "I went from barely making JV to starting on varsity in one year. The position-specific coaching at BTB taught me how to actually play defense — not just chase the ball.", name: "Ava T.", role: "Class of 2029 · Varsity Starter", initials: "AT" },
    ],
    filmStudyDescription: "Every BTB player studies film weekly with a coach. Your footage is captured, reviewed, and broken down into specific coaching points — draw control positioning, defensive slides, transition reads. Each clip ends with a correction and a drill to match it.",
    filmStudyPoints: ["Your game on film", "Coach-led breakdown", "Specific corrections", "Drill-to-fix loop"],
    teams: [
      { gradYear: "2030", teamName: "Girls 2030", coachCount: 2, level: "Elite" },
      { gradYear: "2031", teamName: "Girls 2031", coachCount: 2, level: "Competitive" },
      { gradYear: "2032", teamName: "Girls 2032", coachCount: 2, level: "Competitive" },
      { gradYear: "2033", teamName: "Girls 2033", coachCount: 2, level: "Development" },
      { gradYear: "2034", teamName: "Girls 2034", coachCount: 2, level: "Development" },
      { gradYear: "2035", teamName: "Girls 2035", coachCount: 2, level: "Youth" },
      { gradYear: "2036", teamName: "Girls 2036", coachCount: 2, level: "Youth" },
    ],
    coaches: [
      { name: "Head Coach", title: "Girls Program Director", credentials: ["US Lacrosse Certified", "SafeSport Trained", "8+ Years Coaching"], bio: "Placeholder — replace with real coach bio.", initials: "HC" },
      { name: "Assistant Coach", title: "Lead Trainer", credentials: ["US Lacrosse Certified", "SafeSport Trained", "College Playing Experience"], bio: "Placeholder — replace with real coach bio.", initials: "AC" },
    ],
    ctaHeadline: "Same Standard.\nBuilt for Her.",
    ctaSubheadline: "Girls Program",
    ctaText: "BTB is selective because development requires commitment. We want athletes who are serious about their game and ready to put in the work.",
  },
}
