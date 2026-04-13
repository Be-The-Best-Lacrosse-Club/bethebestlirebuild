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
      {
        name: "Dan Achatz",
        title: "Founder & Owner",
        credentials: [
          "Rutgers University — Captain, All-ECAC, Knight Cup",
          "M.Ed. — Manhattanville College",
          "18+ Years Varsity Coaching",
        ],
        bio: "Dan founded Be The Best Lacrosse Club in 2021 with one conviction: Long Island youth lacrosse deserved coaching that refused to cut corners. A Seaford HS grad and Rutgers SSDM — dawg culture in practice and games since '83 — Dan built BTB around a simple standard: effort is non-negotiable, discipline drives development, team comes before individual, and development comes before ego. He currently leads four BTB teams including his original 2028 Black, the group he calls his most celebrated because they stood by him when they didn't have to. His core belief is that players can achieve what others say they can't — if they're willing to embrace the work, the sacrifice, and the daily standard.",
        initials: "DA",
      },
      {
        name: "Sean Reynolds",
        title: "Boys Program Director",
        credentials: [
          "Plainedge HS Boys Varsity Head Coach",
          "Special Education Teacher",
          "US Lacrosse Certified · SafeSport Trained",
        ],
        bio: "Sean leads the BTB Boys Program with a relentless focus on player development and lacrosse IQ. As the Boys Varsity Head Coach at Plainedge High School and a Special Education teacher by day, Sean brings the same patience, structure, and accountability to BTB that he brings to his classroom. He's a constant student of the game and pushes every player to compete at the highest level — from youth through varsity.",
        initials: "SR",
      },
      {
        name: "Mike Gurcio",
        title: "Boys Futures Director",
        credentials: [
          "BTB Boys Futures Program Director",
          "Foundation-First Development Approach",
          "US Lacrosse Certified · SafeSport Trained",
        ],
        bio: "Mike directs the BTB Boys Futures Program, focused on developing the next generation of BTB athletes. He brings a fundamentals-first approach to younger players — emphasizing stick skills, footwork, and the BTB Standard from day one. Mike's program is where lifelong lacrosse players are built.",
        initials: "MG",
      },
      {
        name: "Pete Ferrizz",
        title: "Operations Manager",
        credentials: [
          "BTB Operations Manager",
          "Multi-Team Sideline Coach",
          "Long Island Lacrosse Lifer",
        ],
        bio: "Pete keeps the BTB engine running. As Operations Manager, he handles everything behind the scenes — schedules, fields, gear, communications, and the thousand small details that let coaches coach and players play. Pete is also a sideline presence, supporting BTB teams across both the boys and girls programs.",
        initials: "PF",
      },
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
      {
        name: "Dan Achatz",
        title: "Founder & Girls Program Director",
        credentials: [
          "Rutgers University — Captain, All-ECAC, Knight Cup",
          "M.Ed. — Manhattanville College",
          "18+ Years Varsity Coaching",
        ],
        bio: "Dan founded Be The Best Lacrosse Club in 2021 to give Long Island girls the same structured, film-based development the boys' game has had for years. A Seaford HS grad and Rutgers SSDM, Dan built BTB Girls on the principle that the women's game deserves the same standards, accountability, and coaching depth — no shortcuts, no compromises. His philosophy is simple: effort is non-negotiable, discipline drives development, team over individual, and development over ego. His core belief — that players can achieve what others say they can't if they're willing to embrace the work — is the foundation of the entire BTB program.",
        initials: "DA",
      },
      {
        name: "Marisa D'Angelo",
        title: "Girls Futures Director",
        credentials: [
          "Manhattanville University — Skyline All-Conference First Team",
          "MacArthur HS Lacrosse — 4-Year Varsity",
          "BTB Girls Futures Program Director",
        ],
        bio: "Marisa leads the BTB Girls Futures Program with the same intensity she brought to her own playing career. A four-year varsity player at MacArthur High School and a Skyline Conference First Team honoree at Manhattanville University, Marisa knows what it takes to compete at every level. She's relentless about teaching the women's game with structure, IQ, and grit.",
        initials: "MD",
      },
      {
        name: "Erynn Rocovich",
        title: "Head Coach",
        credentials: [
          "BTB Girls Head Coach — Multiple Age Groups",
          "Multi-Team Travel Lacrosse Coach",
          "US Lacrosse Certified · SafeSport Trained",
        ],
        bio: "Erynn brings veteran coaching experience to BTB's girls program, leading multiple travel teams across age groups. She's known for clear communication, high standards, and developing players who play smart, disciplined lacrosse. Her teams compete with toughness and structure on every possession.",
        initials: "ER",
      },
      {
        name: "Pete Ferrizz",
        title: "Operations Manager",
        credentials: [
          "BTB Operations Manager",
          "Multi-Team Sideline Coach",
          "Long Island Lacrosse Lifer",
        ],
        bio: "Pete keeps the BTB engine running. As Operations Manager, he handles everything behind the scenes — schedules, fields, gear, communications, and the thousand small details that let coaches coach and players play. Pete is also a sideline presence, supporting BTB teams across both the boys and girls programs.",
        initials: "PF",
      },
    ],
    ctaHeadline: "Same Standard.\nBuilt for Her.",
    ctaSubheadline: "Girls Program",
    ctaText: "BTB is selective because development requires commitment. We want athletes who are serious about their game and ready to put in the work.",
  },
}
