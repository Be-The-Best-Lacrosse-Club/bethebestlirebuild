export type Gender = "boys" | "girls"

export interface StatItem {
  num: string
  label: string
}

export interface Benefit {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  stat: string
  text: string
}

export interface AgeGroup {
  grad: string
  level: string
  description: string
}

export interface Phase {
  num: string
  phase: string
  weeks: string
  items: string[]
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  initials: string
}

export interface CoachProfile {
  name: string
  title: string
  credentials: string[]
  bio: string
  initials: string
}

export interface TeamInfo {
  gradYear: string
  teamName: string
  coachCount: number
  programId?: number
}

// Auth types
export type UserRole = "player" | "coach" | "owner"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  gender: Gender
  gradYear?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

// Course / Progression types
export interface Course {
  id: string
  title: string
  gradYear: string
  gender: Gender
  description: string
  steps: CourseStep[]
}

export interface CourseStep {
  id: string
  stepNumber: number
  title: string
  type: "film" | "question" | "drill" | "reading"
  content: {
    videoUrl?: string
    question?: string
    options?: string[]
    correctAnswer?: number
    description?: string
    duration?: number
  }
}

export interface UserProgress {
  courseId: string
  completedSteps: string[]
  currentStep: number
  score: number
  lastAccessed: string
}

// Drill types
export interface Drill {
  id: string
  title: string
  category: string
  description: string
  setup: string
  execution: string[]
  coachingPoints: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: number
  videoUrl?: string
}

export interface PracticePlan {
  id: string
  title: string
  phase: string
  ageGroup: string
  duration: number
  description: string
  segments: { time: string; activity: string; detail: string }[]
}

// Film Resource types
export type FilmCategory =
  | "Offense"
  | "Defense"
  | "Transition"
  | "Rides & Clears"
  | "Man-Up/Man-Down"
  | "Goalie"
  | "Drills"
  | "Game Film"

export type FilmLevel = "Beginner" | "Intermediate" | "Advanced"

export interface FilmEntry {
  id: string
  title: string
  description: string
  category: FilmCategory
  subcategory: string
  videoUrl: string
  thumbnail?: string
  duration: string
  level: FilmLevel
  tags: string[]
}
