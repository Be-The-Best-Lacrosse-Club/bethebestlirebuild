import { Video, Users, BookOpen, Target, TrendingUp, Shield, Hammer, ShieldAlert } from "lucide-react"
import type { StatItem, Benefit, AgeGroup, Phase, Testimonial, CoachProfile, TeamInfo } from "@/types"

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

export const MASTER_COACHES: CoachProfile[] = [
  {
    name: "Dan Achatz",
    title: "Owner / Head Coach",
    credentials: ["Rutgers Alum", "Teacher", "BTB Founder"],
    bio: "Owner of BTB. Leads 2033 Renegades, 2033 Storm, and 2028 Black. BTB BOYS, BTB GIRLS",
    initials: "DA"
  },
  {
    name: "SEAN REYNOLDS",
    title: "Boys Director",
    credentials: ["SUNY Oneonta Alum"],
    bio: "Leads the BTB Boys Program. Coaches BTB 2030 Rage and 2031 Carnage. BTB BOYS",
    initials: "SR"
  },
  {
    name: "Brad McLam",
    title: "Head Coach",
    credentials: ["Hopkins Alum", "Recruiting Coordinator", "Seasoned Coach"],
    bio: "Directs BTB 2029 Chrome, 2032 Grizzlies, and 2030 Reign. BTB BOYS, BTB GIRLS",
    initials: "BM"
  },
  {
    name: "Marisa D'Angelo",
    title: "Head Coach",
    credentials: ["Manhattanville Alum", "Teacher", "Long Beach MS Coach"],
    bio: "Directs BTB 2034 Thunder and Leads Boys Futures. BTB GIRLS",
    initials: "MD"
  },
  {
    name: "Aidan DeRupo",
    title: "Goalie Trainer",
    credentials: ["Adelphi University"],
    bio: "Goalie training specialist for 2nd-5th grade. BTB BOYS",
    initials: "AD"
  },
  {
    name: "Alex Leggio",
    title: "Assistant Coach",
    credentials: ["Adelphi University"],
    bio: "Coaches BTB 2033 Storm. BTB GIRLS",
    initials: "AL"
  },
  {
    name: "alexa adduci",
    title: "Assistant Coach",
    credentials: ["Malverne Varsity Assistant"],
    bio: "Coaches BTB 2036 Avalanche. BTB GIRLS",
    initials: "AA"
  },
  {
    name: "Antonina Buscemi",
    title: "Assistant Coach",
    credentials: ["SUNY Oneonta Alum"],
    bio: "Coaches BTB 2030 Tidal Wave. BTB GIRLS",
    initials: "AB"
  },
  {
    name: "AVA HERNANDEZ",
    title: "Assistant Coach",
    credentials: ["LIU Womens Lacrosse"],
    bio: "Coaches BTB 2034 Tsunami. BTB GIRLS",
    initials: "AH"
  },
  {
    name: "Brian Gubelli",
    title: "Assistant Coach",
    credentials: ["NYPD", "Coach"],
    bio: "Coaches BTB 2035 Bombers. BTB BOYS",
    initials: "BG"
  },
  {
    name: "Brian Himberger",
    title: "Head Coach",
    credentials: ["Molloy Alum"],
    bio: "Leads BTB 2034 Snipers and 2032 Riptide. BTB BOYS, BTB GIRLS",
    initials: "BH"
  },
  {
    name: "Chris Lehmann",
    title: "Assistant Coach",
    credentials: ["NYIT National Champ 1997"],
    bio: "Coaches 2029 BTB Chrome. BTB BOYS",
    initials: "CL"
  },
  {
    name: "Chris Rumfield",
    title: "Assistant Coach",
    credentials: ["Delhi Alum", "Coach"],
    bio: "Coaches BTB 2034 Thunder. BTB GIRLS",
    initials: "CR"
  },
  {
    name: "Meg Gordon",
    title: "Co-Head Coach",
    credentials: ["Virginia and Northwestern Alum"],
    bio: "Leads BTB 2035 Hurricanes. BTB GIRLS",
    initials: "MG"
  },
  {
    name: "Dan Sciulla",
    title: "Assistant Coach",
    credentials: ["SUNY Oneonta Alum"],
    bio: "Coaches BTB 2036 Dawgs. BTB BOYS",
    initials: "DS"
  },
  {
    name: "Danielle Carson",
    title: "Co-Head Coach",
    credentials: ["USC Alum"],
    bio: "Leads BTB 2035 Hurricanes. BTB GIRLS",
    initials: "DC"
  },
  {
    name: "Emma Mclam",
    title: "Assistant Coach",
    credentials: ["Adelphi University"],
    bio: "Coaches BTB 2030 Reign. BTB GIRLS",
    initials: "EM"
  },
  {
    name: "Erynn Rocovich",
    title: "Head Coach",
    credentials: ["SUNY Oneonta Alum"],
    bio: "Leads BTB 2032 Riptide. BTB GIRLS",
    initials: "ER"
  },
  {
    name: "Frank Ingenito",
    title: "Head Coach",
    credentials: ["St. Johns Alum"],
    bio: "Leads BTB 2036 Dawgs. BTB BOYS",
    initials: "FI"
  },
  {
    name: "Hunter Isnardi",
    title: "Assistant Coach",
    credentials: ["Mercy Alum"],
    bio: "Coaches BTB 2031 Cyclones. BTB BOYS",
    initials: "HI"
  },
  {
    name: "Jaclyn Jackowski",
    title: "Assistant Coach",
    credentials: ["SUNY Oneonta Alum"],
    bio: "Coaches BTB 2030 Tidal Wave. BTB GIRLS",
    initials: "JJ"
  },
  {
    name: "Jake Oemcke",
    title: "Assistant Coach",
    credentials: ["St. Johns Alum"],
    bio: "Coaches BTB 2032 Cannons. BTB BOYS",
    initials: "JO"
  },
  {
    name: "James Rao",
    title: "Assistant Coach",
    credentials: ["Stonybrook Alum"],
    bio: "Coaches BTB 2035 Bombers. BTB BOYS",
    initials: "JR"
  },
  {
    name: "Jeff Schaefer",
    title: "Assistant Coach",
    credentials: ["Football and Lacrosse Coach"],
    bio: "Coaches BTB 2035 Bombers. BTB BOYS",
    initials: "JS"
  },
  {
    name: "JT Prior",
    title: "Assistant Coach",
    credentials: ["Platsburg All American"],
    bio: "Coaches BTB 2031 Carnage. BTB BOYS",
    initials: "JP"
  },
  {
    name: "Juliana Keenan",
    title: "Assistant Coach",
    credentials: ["Mercy Alum", "Teacher"],
    bio: "Coaches BTB 2031 Cyclones. BTB GIRLS",
    initials: "JK"
  },
  {
    name: "Kaitlyn meyer",
    title: "Assistant Coach",
    credentials: ["Teacher", "Manhassett Varsity Assistant"],
    bio: "Coaches BTB 2036 Avalanche. BTB GIRLS",
    initials: "KM"
  },
  {
    name: "Katie Dascher",
    title: "Assistant Coach",
    credentials: ["Teacher", "Coach"],
    bio: "Coaches BTB 2035 Tornadoes. BTB GIRLS",
    initials: "KD"
  },
  {
    name: "Kerrin Heuser",
    title: "Assistant Coach",
    credentials: ["Adelphi All American Alum", "Nurse"],
    bio: "Coaches BTB 2033 Storm. BTB GIRLS",
    initials: "KH"
  },
  {
    name: "Krista Ancona",
    title: "Assistant Coach",
    credentials: ["SUNY Oneonta Alum", "Teacher", "Seaford Varsity HC"],
    bio: "Coaches BTB 2036 Avalanche. BTB GIRLS",
    initials: "KA"
  },
  {
    name: "Leif Blomquist",
    title: "Assistant Coach",
    credentials: ["Rutgers Alum"],
    bio: "Coaches BTB 2034 Thunder. BTB GIRLS",
    initials: "LB"
  },
  {
    name: "Lily Bilello",
    title: "Assistant Coach",
    credentials: ["LIU Alum"],
    bio: "Coaches BTB 2032 Riptide. BTB GIRLS",
    initials: "LB"
  },
  {
    name: "Mike Guercio",
    title: "Futures Director / Assistant Coach",
    credentials: ["BTB Futures Specialist"],
    bio: "Directs BTB Futures. Coaches 2029 BTB Chrome and 2036 Fury. BTB BOYS",
    initials: "MG"
  },
  {
    name: "Nick Defelice",
    title: "Assistant Coach",
    credentials: ["Cortland Alum", "Teacher"],
    bio: "Coaches BTB 2032 Cannons. BTB BOYS",
    initials: "ND"
  },
  {
    name: "Nick Ebel",
    title: "Assistant Coach",
    credentials: ["Teacher", "Oceanside Coach"],
    bio: "Coaches BTB 2036 Dawgs. BTB BOYS",
    initials: "NE"
  },
  {
    name: "Nick Nicolosi",
    title: "Assistant Coach",
    credentials: ["Teacher", "Plainedge Varsity Assistant"],
    bio: "Coaches BTB 2033 Renegades. BTB BOYS",
    initials: "NN"
  },
  {
    name: "Pat Frazer",
    title: "Assistant Coach",
    credentials: ["Teacher", "Coach"],
    bio: "Coaches BTB 2036 Dawgs. BTB BOYS",
    initials: "PF"
  },
  {
    name: "Peter Ferrizz",
    title: "BTB Operations / Assistant Coach",
    credentials: ["Operations Manager"],
    bio: "Manages BTB Operations. Coaches 2028 Black and BTB 2036 Dawgs. BTB BOYS",
    initials: "PF"
  },
  {
    name: "Peter Hespe",
    title: "Assistant Coach",
    credentials: ["Teacher", "Coach"],
    bio: "Coaches 2029 BTB Chrome. BTB BOYS",
    initials: "PH"
  },
  {
    name: "Rob Valdez",
    title: "Assistant Coach",
    credentials: ["Pace University Alum"],
    bio: "Coaches 2032 BTB Grizzlies. BTB BOYS",
    initials: "RV"
  },
  {
    name: "Ryan O’Neill",
    title: "Assistant Coach",
    credentials: ["Molloy Alum", "NYPD"],
    bio: "Coaches BTB 2034 Snipers and 2034 Venom. BTB BOYS",
    initials: "RO"
  },
  {
    name: "Ryan Quinn",
    title: "Assistant Coach",
    credentials: ["Hopkins Alum", "Coach"],
    bio: "Coaches BTB 2035 Bombers. BTB BOYS",
    initials: "RQ"
  },
  {
    name: "Ryan Smith",
    title: "Assistant Coach",
    credentials: ["Teacher", "Long Beach Varsity Assistant"],
    bio: "Coaches 2035 Tornadoes. BTB GIRLS",
    initials: "RS"
  },
  {
    name: "Scott Bryan",
    title: "Assistant Coach",
    credentials: ["Quinipiac Alum", "Former Commack Varsity HC"],
    bio: "Coaches BTB 2031 Carnage. BTB BOYS",
    initials: "SB"
  },
  {
    name: "Steven Romano",
    title: "Assistant Coach",
    credentials: ["Teacher", "Coach"],
    bio: "Coaches BTB 2033 Storm. BTB GIRLS",
    initials: "SR"
  },
  {
    name: "Tara Babnik",
    title: "Co-Head Coach",
    credentials: ["Current LIU Lacrosse Player"],
    bio: "Leads BTB 2034 Tsunami. BTB GIRLS",
    initials: "TB"
  },
  {
    name: "Tommy Brewer",
    title: "Assistant Coach",
    credentials: ["Hofstra - Molloy Alum"],
    bio: "Coaches BTB 2034 Snipers. BTB BOYS",
    initials: "TB"
  }
];

export const programData: Record<string, ProgramContent> = {
  boys: {
    label: "Boys Program",
    navLabel: "Boys",
    heroTagline: "Train Like You\nMean It.",
    heroSubtitle: "The BTB Boys Program is Long Island's most structured lacrosse development experience. Film study, position-specific coaching, a 16-week curriculum, and an 8:1 player-to-coach ratio — for every age group.",
    stats: [
      { num: "500+", label: "Players Trained" },
      { num: "24", label: "Elite Teams" },
      { num: "8:1", label: "Player-Coach Ratio" },
      { num: "50+", label: "Pro/College Coaches" },
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
      { grad: "2037s–2033s", level: "Youth Development", description: "Foundation-level training focused on stick skills, mechanics, and love of the game. Building elite habits early." },
      { grad: "2032s–2031s", level: "Development", description: "Structured skill progression with intensive film study. Players learn to read defenses and apply concepts in live situations." },
      { grad: "2030s–2029s", level: "Competitive", description: "High-speed training and transition reads. Weekly film study is a requirement for all travel players." },
      { grad: "2028s", level: "Elite / Varsity Prep", description: "The BTB Flagship. College-level preparation with advanced film breakdown, recruiting toolkits, and elite tournament schedules." },
    ],
    phases: [
      { num: "01", phase: "Foundation", weeks: "Weeks 1–4", items: ["Wall ball fundamentals", "Footwork & body mechanics", "Defensive concepts introduction", "Film study onboarding"] },
      { num: "02", phase: "Connection", weeks: "Weeks 5–8", items: ["2-man game reads", "Transition decision-making", "Position-specific film sessions", "Small-group competition"] },
      { num: "03", phase: "Expansion", weeks: "Weeks 9–12", items: ["Live game-speed scenarios", "Opponent film breakdown", "Self-scouting sessions", "Varsity-level positioning"] },
      { num: "04", phase: "Execution", weeks: "Weeks 13–16", items: ["Game evaluation & review", "Recruiting film preparation", "College-ready standards test", "Next-phase goal setting"] },
    ],
    testimonials: [
      { quote: "The film study changed my whole game. I started seeing defensive rotations before they happened. My high school coaches noticed the difference immediately.", name: "Ryan F.", role: "2028 BTB Black · Varsity Midfielder", initials: "RF" },
      { quote: "BTB doesn't just coach; they develop. The 8:1 ratio means my son gets corrected on every rep. He's a completely different player after two seasons.", name: "James R.", role: "Parent · 2028 Black Team", initials: "JR" },
      { quote: "My son came in as a good athlete who happened to play lacrosse. After two years at BTB, he is a true lacrosse player with high-level IQ and stick skills.", name: "Jennifer M.", role: "Parent · 2028 Travel Team", initials: "JM" },
    ],
    filmStudyDescription: "Every BTB player studies film weekly with a coach. Your footage is captured, reviewed, and broken down into specific coaching points. Each clip ends with an actionable correction and a drill to match it. The next session targets what film identified.",
    filmStudyPoints: ["Your game on film", "Coach-led breakdown", "Specific corrections", "Drill-to-fix loop"],
    teams: [
      { gradYear: "2027", teamName: "Boys 2027", coachCount: 2 },
      { gradYear: "2028", teamName: "2028 Black", coachCount: 2 },
      { gradYear: "2029", teamName: "2029 Chrome", coachCount: 2, programId: 4835133 },
      { gradYear: "2030", teamName: "2030 Rage", coachCount: 2, programId: 4682970 },
      { gradYear: "2031", teamName: "2031 Carnage", coachCount: 2, programId: 4681558 },
      { gradYear: "2032", teamName: "2032 Cannons", coachCount: 2, programId: 4681552 },
      { gradYear: "2032", teamName: "2032 Grizzlies", coachCount: 2 },
      { gradYear: "2033", teamName: "2033 Renegades", coachCount: 2, programId: 4681523 },
      { gradYear: "2034", teamName: "2034 Venom", coachCount: 2 },
      { gradYear: "2034", teamName: "2034 Snipers", coachCount: 2, programId: 4681502 },
      { gradYear: "2035", teamName: "2035 Bombers", coachCount: 2 },
      { gradYear: "2036", teamName: "2036 Dawgs", coachCount: 2 },
      { gradYear: "2037", teamName: "Boys 2037 Futures", coachCount: 2 },
    ],
    coaches: MASTER_COACHES.filter(c => c.bio.includes("BTB BOYS")),
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
      { num: "Elite", label: "Girls Academy" },
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
      { grad: "2037s–2035s", level: "Youth Development", description: "Foundation-level training focused on stick skills, body mechanics, and building confidence with the ball. Developing love for the game first." },
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
      { quote: "BTB was the first program that treated my daughter's development with the same structure as the boys' program. The film study alone made a huge difference in her field awareness.", name: "Laura D.", role: "Parent · 2030 Travel Team", initials: "LD" },
      { quote: "The coaching at BTB is on another level. Every coach has college or pro experience and they know how to communicate that to the players. My daughter loves the challenge.", name: "Sarah B.", role: "Parent · 2031 Gold Team", initials: "SB" },
      { quote: "I went from barely making JV to starting on varsity in one year. The position-specific coaching at BTB taught me how to actually play defense — not just chase the ball.", name: "Ava T.", role: "Class of 2030 · Varsity Starter", initials: "AT" },
    ],
    filmStudyDescription: "Every BTB player studies film weekly with a coach. Your footage is captured, reviewed, and broken down into specific coaching points — draw control positioning, defensive slides, transition reads. Each clip ends with a correction and a drill to match it.",
    filmStudyPoints: ["Your game on film", "Coach-led breakdown", "Specific corrections", "Drill-to-fix loop"],
    teams: [
      { gradYear: "2030", teamName: "2030 Tidal Wave", coachCount: 2, programId: 4693014 },
      { gradYear: "2030", teamName: "2030 Reign", coachCount: 2 },
      { gradYear: "2031", teamName: "2031 Cyclones", coachCount: 2, programId: 4681584 },
      { gradYear: "2032", teamName: "2032 Riptide", coachCount: 2, programId: 4681581 },
      { gradYear: "2033", teamName: "2033 Storm", coachCount: 2 },
      { gradYear: "2034", teamName: "2034 Thunder", coachCount: 2, programId: 4681576 },
      { gradYear: "2034", teamName: "2034 Tsunami", coachCount: 2 },
      { gradYear: "2035", teamName: "2035 Hurricanes", coachCount: 2, programId: 4681483 },
      { gradYear: "2035", teamName: "2035 Tornado", coachCount: 2 },
      { gradYear: "2036", teamName: "2036 Avalanche", coachCount: 2, programId: 4681471 },
      { gradYear: "2037", teamName: "Girls 2037 Futures", coachCount: 2 },
    ],
    coaches: MASTER_COACHES.filter(c => c.bio.includes("BTB GIRLS")),
    ctaHeadline: "Same Standard.\nBuilt for Her.",
    ctaSubheadline: "Girls Program",
    ctaText: "BTB is selective because development requires commitment. We want athletes who are serious about their game and ready to put in the work.",
  },

  futures: {
    label: "Futures Program",
    navLabel: "Futures",
    heroTagline: "The Future\nStarts Now.",
    heroSubtitle: "The BTB Futures Program is for the next generation (2034-2037). We focus on building elite habits, fundamental mastery, and a passion for the game through high-energy, structured coaching.",
    stats: [
      { num: "100+", label: "Futures Trained" },
      { num: "4", label: "Age Groups" },
      { num: "6:1", label: "Player-Coach Ratio" },
      { num: "100%", label: "Fundamental Focus" },
    ],
    benefits: [
      { icon: Users, title: "Ultra-Small Groups", stat: "6:1", text: "Max 6 players per coach. More attention, more corrections, and faster growth for young players." },
      { icon: BookOpen, title: "Foundation Curriculum", stat: "Active", text: "A specialized plan focusing on stick skills, footwork, and basic game concepts in a high-speed environment." },
      { icon: Target, title: "Fun but Disciplined", stat: "The Standard", text: "We teach the BTB Standard early. Hard work and accountability start from day one, but we keep the energy high." },
      { icon: Shield, title: "Pro Mentors", stat: "Elite Staff", text: "Our Futures are coached by the same pros who lead our Varsity teams. The best coaching for the youngest players." },
    ],
    highlightBenefitIndex: 0,
    ageGroups: [
      { grad: "2037s", level: "Intro to Elite", description: "Focus on the basics: catching, throwing, and the joy of competing." },
      { grad: "2036s", level: "Skill Expansion", description: "Introduction to 2-man games and defensive positioning." },
      { grad: "2035s", level: "Pre-Travel", description: "Preparing for the jump to competitive travel lacrosse." },
      { grad: "2034s", level: "Futures Flagship", description: "Advanced youth concepts and high-level skill refinement." },
    ],
    phases: [
      { num: "01", phase: "Handle", weeks: "Weeks 1–4", items: ["Correct hand placement", "Basic wall ball routines", "Ground ball dominance"] },
      { num: "02", phase: "Move", weeks: "Weeks 5–8", items: ["Athletic positioning", "Change of direction", "Defensive footwork"] },
      { num: "03", phase: "Play", weeks: "Weeks 9–12", items: ["Small-sided games", "Understanding space", "Basic shooting mechanics"] },
      { num: "04", phase: "Compete", weeks: "Weeks 13–16", items: ["Full field concepts", "The BTB Standard test", "Summer season prep"] },
    ],
    testimonials: [
      { quote: "My son started in the Futures program and the growth in his confidence and skill was night and day. He loves the coaches.", name: "Mike T.", role: "Parent · 2035 Futures", initials: "MT" },
      { quote: "BTB Futures is the perfect balance of high-level coaching and keeping the kids engaged. They actually learn the game.", name: "Chris P.", role: "Parent · 2036 Futures", initials: "CP" },
    ],
    filmStudyDescription: "Even our Futures start watching film. We keep it simple: showing them proper mechanics and basic field positioning to build their Lacrosse IQ from the ground up.",
    filmStudyPoints: ["Mechanics on film", "Visual learning", "Positive reinforcement", "IQ development"],
    teams: [
      { gradYear: "2034", teamName: "Boys 2034 Futures", coachCount: 2 },
      { gradYear: "2035", teamName: "Boys 2035 Futures", coachCount: 2 },
      { gradYear: "2036", teamName: "Boys 2036 Futures", coachCount: 2 },
      { gradYear: "2037", teamName: "Boys 2037 Futures", coachCount: 2 },
    ],
    coaches: MASTER_COACHES.filter(c => c.bio.includes("Futures") || c.name === "Marisa D'Angelo" || c.name === "Mike Guercio" || c.bio.includes("2nd-5th")),
    ctaHeadline: "Build the Foundation.",
    ctaSubheadline: "Futures Program",
    ctaText: "Start your journey with the BTB Standard. Selective enrollment for serious young athletes.",
  },

  camps: {
    label: "Camps & Clinics",
    navLabel: "Camps",
    heroTagline: "Intensive.\nElite. Proven.",
    heroSubtitle: "BTB Academy Camps and Clinics are high-intensity training events designed to level up your game in a short window. Position-specific mastery taught by pro and college coaches.",
    stats: [
      { num: "4", label: "Annual Camps" },
      { num: "500+", label: "Campers per Year" },
      { num: "5:1", label: "Pro Ratio" },
      { num: "3", label: "Days of Intensity" },
    ],
    benefits: [
      { icon: Target, title: "Position Masterclasses", stat: "Focused", text: "Dedicated sessions for Attack, Midfield, Defense, and Goalies. Learn the nuances of your specific role." },
      { icon: Video, title: "Daily Film Review", stat: "Included", text: "Every camp day includes a film session where we review the morning's drills before the afternoon games." },
      { icon: TrendingUp, title: "Skill Evaluation", stat: "Personalized", text: "Receive a written evaluation from a pro coach at the end of the camp identifying your strengths and growth areas." },
      { icon: Users, title: "Pro Guest Coaches", stat: "Elite", text: "Learn from current PLL and MLL stars who join our regular staff for these intensive events." },
    ],
    highlightBenefitIndex: 0,
    ageGroups: [
      { grad: "All Ages", level: "Open Enrollment", description: "Camps are grouped by age and skill level to ensure maximum competition and development." },
    ],
    phases: [],
    testimonials: [
      { quote: "The Summer Intensive was the hardest I've ever worked in 3 days. I learned more there than in my whole spring season.", name: "Jason L.", role: "High School Sophomore", initials: "JL" },
    ],
    filmStudyDescription: "Rapid-fire film study. We record the morning session and break it down during lunch so you can apply the corrections immediately in the afternoon session.",
    filmStudyPoints: ["Instant feedback", "Drill correction", "Game-speed review"],
    teams: [],
    coaches: MASTER_COACHES.filter(c => c.credentials.some(cred => cred.includes("Alum") || cred.includes("All-American") || cred.includes("University"))),
    ctaHeadline: "Train with the Pros.",
    ctaSubheadline: "Camps & Clinics",
    ctaText: "Check out our upcoming schedule for Summer, Winter, and Position-Specific clinics.",
  },
}
