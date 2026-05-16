import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  RefreshCcw,
  Save,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

/**
 * BTB PRACTICE BUILDER AI
 *
 * Generates BTB women's lacrosse practice plans from real coaching inputs:
 * game film analytics, concept completion, player weaknesses, and
 * draw / clear / ride metrics. Women's game only.
 * Format assumptions: 4 Attack / 3 Midfield / 4 Defense / 1 Goalie.
 */

interface Drill {
  id: string;
  name: string;
  phase: string;
  category: string;
  duration: number;
  intensity: number;
  tags: string[];
  objective: string;
}

interface ScoredDrill extends Drill {
  score: number;
}

interface Analytics {
  drawWinPct: number;
  clearPct: number;
  rideStopPct: number;
  shotsOnCagePct: number;
  defensiveStopPct: number;
  turnoverCount: number;
  majorIssues: string[];
}

interface Priorities {
  primaryFocus: string;
  secondaryFocus: string;
  intensity: string;
  needDraw: boolean;
  needClear: boolean;
  needRide: boolean;
  needDefense: boolean;
  needOffense: boolean;
}

interface Profile {
  label: string;
  repsMultiplier: number;
  installMinutes: number;
  competeMinutes: number;
}

interface PlanBlockData {
  section: string;
  minutes: number;
  objective: string;
  drills: Drill[];
  coachingPoints: string[];
}

interface BuildPracticePlanArgs {
  duration: number;
  profileKey: string;
  priorities: Priorities;
  analytics: Analytics;
  emphasisNote: string;
}

interface PracticePlan {
  profile: Profile;
  totalMinutes: number;
  template: PlanBlockData[];
  recommendations: string[];
}

const drillBank: Drill[] = [
  {
    id: "d1",
    name: "Triangle Passing",
    phase: "stickwork",
    category: "offense",
    duration: 8,
    intensity: 1,
    tags: ["passing", "spacing", "hands"],
    objective: "clean ball movement and catch quality",
  },
  {
    id: "d2",
    name: "Dodge and Dump",
    phase: "offense",
    category: "offense",
    duration: 12,
    intensity: 2,
    tags: ["draw and feed", "adjacent help", "crease"],
    objective: "force slide and move it one more",
  },
  {
    id: "d3",
    name: "4v3 Exchange",
    phase: "transition",
    category: "offense",
    duration: 15,
    intensity: 3,
    tags: ["one-more", "fast break", "decision making"],
    objective: "improve transition reads and scoring choices",
  },
  {
    id: "d4",
    name: "Adjacent Slide Recognition",
    phase: "defense",
    category: "defense",
    duration: 12,
    intensity: 2,
    tags: ["slides", "communication", "recover"],
    objective: "train first help and backside fill",
  },
  {
    id: "d5",
    name: "Help and Recover",
    phase: "defense",
    category: "defense",
    duration: 10,
    intensity: 2,
    tags: ["bump", "rotation", "defensive recovery"],
    objective: "clean up second slide and match recovery",
  },
  {
    id: "d6",
    name: "Crease Slide Live",
    phase: "defense",
    category: "defense",
    duration: 14,
    intensity: 3,
    tags: ["crease slide", "middle help", "goalie talk"],
    objective: "stop direct lane pressure and rotate out cleanly",
  },
  {
    id: "d7",
    name: "Self Draw Progression",
    phase: "draw",
    category: "draw",
    duration: 8,
    intensity: 2,
    tags: ["draw", "clamp", "self possession"],
    objective: "own clean draw wins and exit pressure",
  },
  {
    id: "d8",
    name: "Draw Scramble",
    phase: "draw",
    category: "draw",
    duration: 10,
    intensity: 3,
    tags: ["wing timing", "ground ball", "reaction"],
    objective: "win second-chance possessions off the draw",
  },
  {
    id: "d9",
    name: "Draw to Fast Break",
    phase: "transition",
    category: "draw",
    duration: 12,
    intensity: 3,
    tags: ["transition", "lanes", "early offense"],
    objective: "convert draw wins into immediate scoring threats",
  },
  {
    id: "d10",
    name: "Goalie Outlet Series",
    phase: "clear",
    category: "clear",
    duration: 8,
    intensity: 1,
    tags: ["clear", "goalie", "outlet"],
    objective: "improve first pass accuracy under light pressure",
  },
  {
    id: "d11",
    name: "Break Clear",
    phase: "clear",
    category: "clear",
    duration: 12,
    intensity: 2,
    tags: ["clear", "lanes", "timing"],
    objective: "improve spacing and lane release in full-field clear",
  },
  {
    id: "d12",
    name: "Two-Pass Clear Under Pressure",
    phase: "clear",
    category: "clear",
    duration: 12,
    intensity: 3,
    tags: ["pressure", "reverse", "decision"],
    objective: "beat ride pressure without forcing panic outlets",
  },
  {
    id: "d13",
    name: "Ride Funnel Trap",
    phase: "ride",
    category: "ride",
    duration: 12,
    intensity: 3,
    tags: ["ride", "funnel", "sideline trap"],
    objective: "force clears to low-value sideline exits",
  },
  {
    id: "d14",
    name: "Midline Ride Pressure",
    phase: "ride",
    category: "ride",
    duration: 10,
    intensity: 3,
    tags: ["ride", "midline", "turnovers"],
    objective: "increase ride stop percentage at midfield",
  },
  {
    id: "d15",
    name: "Finishing off Crease Flash",
    phase: "offense",
    category: "offense",
    duration: 10,
    intensity: 2,
    tags: ["crease", "finishing", "hands free"],
    objective: "finish quickly after slide commitment",
  },
  {
    id: "d16",
    name: "2v2 Two-Player Game",
    phase: "offense",
    category: "offense",
    duration: 12,
    intensity: 2,
    tags: ["pick", "slip", "read"],
    objective: "improve two-player chemistry and slip timing",
  },
  {
    id: "d17",
    name: "Conditioned Small-Sided Scrimmage",
    phase: "compete",
    category: "compete",
    duration: 15,
    intensity: 3,
    tags: ["compete", "constraints", "live reps"],
    objective: "transfer install points into game-speed decision making",
  },
  {
    id: "d18",
    name: "Half-Field Defensive Communication",
    phase: "defense",
    category: "defense",
    duration: 10,
    intensity: 1,
    tags: ["communication", "matchups", "shell"],
    objective: "build clean BTB defensive language and early calls",
  },
  {
    id: "d19",
    name: "Transition Stop to Clear",
    phase: "transition",
    category: "defense",
    duration: 12,
    intensity: 3,
    tags: ["stop", "scoop", "clear"],
    objective: "convert defensive stops into clean exits",
  },
  {
    id: "d20",
    name: "Timed Shooting Under Fatigue",
    phase: "offense",
    category: "offense",
    duration: 8,
    intensity: 3,
    tags: ["finishing", "fatigue", "execution"],
    objective: "maintain finishing quality under game stress",
  },
];

const conceptStatus = [
  { id: "c1", title: "3-2-2 Motion Offense", category: "offense", completion: 72 },
  { id: "c2", title: "Adjacent Slide Package", category: "defense", completion: 58 },
  { id: "c3", title: "Break Clear", category: "clear", completion: 51 },
  { id: "c4", title: "Self Draw to Break", category: "draw", completion: 66 },
  { id: "c5", title: "Ride Funnel System", category: "ride", completion: 44 },
];

const recentAnalytics: Analytics = {
  drawWinPct: 46,
  clearPct: 71,
  rideStopPct: 18,
  shotsOnCagePct: 54,
  defensiveStopPct: 49,
  turnoverCount: 17,
  majorIssues: [
    "Late adjacent slides on right alley pressure",
    "Clear exits too narrow and too early",
    "Draw wings reacting late to 50-50 balls",
    "Low shot quality after first dodge success",
  ],
};

const teamProfiles: Record<string, Profile> = {
  youth: {
    label: "Youth Development",
    repsMultiplier: 1.1,
    installMinutes: 0.8,
    competeMinutes: 0.9,
  },
  middle: {
    label: "Middle School Academy",
    repsMultiplier: 1.0,
    installMinutes: 1.0,
    competeMinutes: 1.0,
  },
  hs: {
    label: "High School Elite",
    repsMultiplier: 0.95,
    installMinutes: 1.15,
    competeMinutes: 1.15,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function scoreDrill(
  drill: Drill,
  priorities: Priorities,
  analytics: Analytics,
  intensityTarget: number,
): number {
  let score = 0;

  if (priorities.primaryFocus === drill.category) score += 40;
  if (priorities.secondaryFocus === drill.category) score += 20;
  if (priorities.needDraw && drill.category === "draw") score += 30;
  if (priorities.needClear && drill.category === "clear") score += 30;
  if (priorities.needRide && drill.category === "ride") score += 30;
  if (priorities.needDefense && drill.category === "defense") score += 25;
  if (priorities.needOffense && drill.category === "offense") score += 25;

  if (analytics.drawWinPct < 50 && drill.tags.includes("draw")) score += 15;
  if (analytics.clearPct < 80 && drill.tags.includes("clear")) score += 15;
  if (analytics.rideStopPct < 25 && drill.tags.includes("ride")) score += 15;
  if (
    analytics.shotsOnCagePct < 60 &&
    (drill.tags.includes("finishing") || drill.tags.includes("draw and feed"))
  )
    score += 12;
  if (
    analytics.defensiveStopPct < 55 &&
    (drill.tags.includes("slides") || drill.tags.includes("communication"))
  )
    score += 12;

  score += 8 - Math.abs(intensityTarget - drill.intensity) * 4;

  return score;
}

function buildPracticePlan({
  duration,
  profileKey,
  priorities,
  analytics,
  emphasisNote,
}: BuildPracticePlanArgs): PracticePlan {
  const profile = teamProfiles[profileKey] ?? teamProfiles.hs;
  const intensityTarget =
    priorities.intensity === "low" ? 1 : priorities.intensity === "medium" ? 2 : 3;

  const ranked: ScoredDrill[] = drillBank
    .map((drill) => ({
      ...drill,
      score: scoreDrill(drill, priorities, analytics, intensityTarget),
    }))
    .sort((a, b) => b.score - a.score);

  const topOffense = ranked.filter((d) => d.category === "offense").slice(0, 3);
  const topDefense = ranked.filter((d) => d.category === "defense").slice(0, 3);
  const topDraw = ranked.filter((d) => d.category === "draw").slice(0, 2);
  const topClear = ranked.filter((d) => d.category === "clear").slice(0, 2);
  const topRide = ranked.filter((d) => d.category === "ride").slice(0, 2);
  const topCompete = ranked
    .filter((d) => d.category === "compete" || d.phase === "transition")
    .slice(0, 3);
  const topStick = ranked.filter((d) => d.phase === "stickwork").slice(0, 1);

  const warmup = clamp(Math.round(10 * profile.repsMultiplier), 8, 12);
  const stickwork = topStick[0]
    ? clamp(Math.round(topStick[0].duration * profile.repsMultiplier), 8, 12)
    : 8;
  const drawBlock = priorities.needDraw ? 10 : 6;
  const installBlock1 = clamp(Math.round(16 * profile.installMinutes), 14, 22);
  const installBlock2 = clamp(Math.round(16 * profile.installMinutes), 14, 22);
  const specialBlock = priorities.needClear || priorities.needRide ? 12 : 8;
  const compete = clamp(Math.round(15 * profile.competeMinutes), 12, 20);
  const conditioning = duration >= 105 ? 8 : 5;

  const pickDrillsForFocus = (focus: string): Drill[] => {
    switch (focus) {
      case "offense":
        return topOffense;
      case "defense":
        return topDefense;
      case "clear":
        return topClear;
      case "ride":
        return topRide;
      case "draw":
        return topDraw;
      default:
        return topOffense;
    }
  };

  const template: PlanBlockData[] = [
    {
      section: "Dynamic Warm-Up",
      minutes: warmup,
      objective:
        "Raise temperature, mobilize hips, and prep footwork patterns for women's-game movement.",
      drills: [],
      coachingPoints: [
        "Move with pace immediately.",
        "Emphasize hip turn, deceleration, and stick-ready body posture.",
      ],
    },
    {
      section: "Stickwork / Touches",
      minutes: stickwork,
      objective: topStick[0]?.objective || "Clean hands and passing rhythm.",
      drills: topStick,
      coachingPoints: [
        "Demand clean catches and immediate ball movement.",
        "No lazy hands. Every rep must transfer to game speed.",
      ],
    },
    {
      section: "Draw Control Block",
      minutes: drawBlock,
      objective: priorities.needDraw
        ? "Address draw win deficiencies and wing timing."
        : "Reinforce daily draw habits.",
      drills: topDraw,
      coachingPoints: [
        "Center owns first contact.",
        "Wings react to possession, not to noise.",
      ],
    },
    {
      section: `${priorities.primaryFocus.toUpperCase()} Install Block`,
      minutes: installBlock1,
      objective: `Primary install focused on ${priorities.primaryFocus}.`,
      drills: pickDrillsForFocus(priorities.primaryFocus),
      coachingPoints: [
        "Stop drift and confusion immediately.",
        "Coach the exact read sequence, not generic effort.",
      ],
    },
    {
      section: `${priorities.secondaryFocus.toUpperCase()} Reinforcement Block`,
      minutes: installBlock2,
      objective: `Secondary emphasis to support the main practice goal.`,
      drills:
        priorities.secondaryFocus === "defense"
          ? topDefense
          : pickDrillsForFocus(priorities.secondaryFocus),
      coachingPoints: [
        "Tie this block directly to film errors.",
        "Create clarity on who moves first, who talks first, and where the next pass goes.",
      ],
    },
    {
      section: "Special Situation Block",
      minutes: specialBlock,
      objective:
        priorities.needClear || priorities.needRide
          ? "Fix transition possession efficiency."
          : "Reinforce game-state execution.",
      drills: [...topClear.slice(0, 1), ...topRide.slice(0, 1)],
      coachingPoints: [
        "Every rep must end in a clean outcome: possession or forced error.",
        "Treat subbing, spacing, and outlet timing as part of the drill.",
      ],
    },
    {
      section: "Competitive Transfer / Live Play",
      minutes: compete,
      objective: "Transfer install points into live, constrained competition.",
      drills: topCompete,
      coachingPoints: ["Keep score.", "Reward correct decisions, not just athletic wins."],
    },
    {
      section: "Conditioning / Finish",
      minutes: conditioning,
      objective: "Finish with standards and accountability.",
      drills: [],
      coachingPoints: [
        "Conditioning must connect to mental discipline.",
        "Close practice with a standard, not a fade-out.",
      ],
    },
  ];

  const totalMinutes = template.reduce((sum, block) => sum + block.minutes, 0);

  const recommendations = [
    analytics.drawWinPct < 50
      ? "Open practice with draw urgency. Your draw percentage is currently below BTB standard."
      : null,
    analytics.clearPct < 80
      ? "Commit real time to clear structure. The clear percentage is too low to ignore."
      : null,
    analytics.rideStopPct < 25
      ? "Increase ride pressure reps. You are not creating enough disrupted exits."
      : null,
    analytics.shotsOnCagePct < 60
      ? "Build more finishing under pressure. Shot quality is leaking after initial dodge success."
      : null,
    emphasisNote ? `Coach emphasis: ${emphasisNote}` : null,
  ].filter((item): item is string => Boolean(item));

  return {
    profile,
    totalMinutes,
    template,
    recommendations,
  };
}

function PlanBlock({ block, index }: { block: PlanBlockData; index: number }) {
  return (
    <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">
              {index + 1}. {block.section}
            </CardTitle>
            <CardDescription className="mt-1 text-zinc-400">{block.objective}</CardDescription>
          </div>
          <Badge className="bg-red-600 text-white hover:bg-red-600">{block.minutes} min</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {block.drills.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-zinc-200">Assigned Drills</div>
            {block.drills.map((drill) => (
              <div
                key={drill.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"
              >
                <div>
                  <div className="font-medium text-white">{drill.name}</div>
                  <div className="text-zinc-400">{drill.objective}</div>
                </div>
                <div className="text-zinc-500">{drill.duration} min</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-zinc-200">Coaching Points</div>
          {block.coachingPoints.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300"
            >
              <ArrowRight className="mt-0.5 h-4 w-4 text-red-400" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BTBPracticeBuilderAI() {
  const [practiceName, setPracticeName] = useState("BTB Girls Tactical Reset Practice");
  const [profileKey, setProfileKey] = useState("hs");
  const [duration, setDuration] = useState("100");
  const [primaryFocus, setPrimaryFocus] = useState("defense");
  const [secondaryFocus, setSecondaryFocus] = useState("clear");
  const [intensity, setIntensity] = useState("high");
  const [emphasisNote, setEmphasisNote] = useState(
    "Fix late adjacent slides, widen clear exits, and demand better wing reaction off the draw.",
  );
  const [saved, setSaved] = useState(false);

  const priorities: Priorities = useMemo(
    () => ({
      primaryFocus,
      secondaryFocus,
      intensity,
      needDraw:
        recentAnalytics.drawWinPct < 50 || primaryFocus === "draw" || secondaryFocus === "draw",
      needClear:
        recentAnalytics.clearPct < 80 || primaryFocus === "clear" || secondaryFocus === "clear",
      needRide:
        recentAnalytics.rideStopPct < 25 || primaryFocus === "ride" || secondaryFocus === "ride",
      needDefense:
        recentAnalytics.defensiveStopPct < 55 ||
        primaryFocus === "defense" ||
        secondaryFocus === "defense",
      needOffense:
        recentAnalytics.shotsOnCagePct < 60 ||
        primaryFocus === "offense" ||
        secondaryFocus === "offense",
    }),
    [primaryFocus, secondaryFocus, intensity],
  );

  const plan = useMemo(
    () =>
      buildPracticePlan({
        duration: Number(duration || 100),
        profileKey,
        priorities,
        analytics: recentAnalytics,
        emphasisNote,
      }),
    [duration, profileKey, priorities, emphasisNote],
  );

  const conceptAverage = Math.round(
    conceptStatus.reduce((sum, c) => sum + c.completion, 0) / conceptStatus.length,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-white/10 bg-zinc-950 shadow-2xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-600 p-6">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                      BTB Women's Lacrosse
                    </div>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">Practice Builder AI</h1>
                    <p className="mt-2 max-w-3xl text-sm text-white/85">
                      Generate practice plans from BTB concept completion, player weaknesses, film
                      analytics, and possession metrics. Built for the women's game only.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-black/25 px-4 py-3 text-sm">
                      <div className="text-white/70">Practice Total</div>
                      <div className="mt-1 font-semibold">{plan.totalMinutes} min</div>
                    </div>
                    <div className="rounded-2xl bg-black/25 px-4 py-3 text-sm">
                      <div className="text-white/70">Team Profile</div>
                      <div className="mt-1 font-semibold">{plan.profile.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Draw Win %</div>
              <div className="mt-2 text-3xl font-bold">{recentAnalytics.drawWinPct}%</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Clear %</div>
              <div className="mt-2 text-3xl font-bold">{recentAnalytics.clearPct}%</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Ride Stop %</div>
              <div className="mt-2 text-3xl font-bold">{recentAnalytics.rideStopPct}%</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Concept Avg</div>
              <div className="mt-2 text-3xl font-bold">{conceptAverage}%</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Turnovers</div>
              <div className="mt-2 text-3xl font-bold">{recentAnalytics.turnoverCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/10 bg-zinc-950 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Practice Inputs</CardTitle>
              <CardDescription className="text-zinc-400">
                Set the build logic. The plan below updates automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="practiceName">Practice Name</Label>
                <Input
                  id="practiceName"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  className="border-white/10 bg-black text-white"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Team Profile</Label>
                  <Select value={profileKey} onValueChange={setProfileKey}>
                    <SelectTrigger className="border-white/10 bg-black text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth Development</SelectItem>
                      <SelectItem value="middle">Middle School Academy</SelectItem>
                      <SelectItem value="hs">High School Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Practice Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="border-white/10 bg-black text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="75">75 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="100">100 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Focus</Label>
                  <Select value={primaryFocus} onValueChange={setPrimaryFocus}>
                    <SelectTrigger className="border-white/10 bg-black text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offense">Offense</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="draw">Draw</SelectItem>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="ride">Ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Focus</Label>
                  <Select value={secondaryFocus} onValueChange={setSecondaryFocus}>
                    <SelectTrigger className="border-white/10 bg-black text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offense">Offense</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="draw">Draw</SelectItem>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="ride">Ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Intensity Target</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger className="border-white/10 bg-black text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coach Emphasis</Label>
                <Textarea
                  value={emphasisNote}
                  onChange={(e) => setEmphasisNote(e.target.value)}
                  className="min-h-[120px] border-white/10 bg-black text-white"
                />
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                  <BarChart3 className="h-4 w-4 text-red-400" /> Recent Problem Areas
                </div>
                {recentAnalytics.majorIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300"
                  >
                    <ArrowRight className="mt-0.5 h-4 w-4 text-red-400" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/10 bg-zinc-950 text-white shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Generated Practice Summary</CardTitle>
                    <CardDescription className="text-zinc-400">
                      This is the AI-generated build sequence for {practiceName}.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-transparent text-white hover:bg-white/5"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Rebuild
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setSaved(true);
                        setTimeout(() => setSaved(false), 1600);
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Plan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Primary</div>
                    <div className="mt-2 text-lg font-semibold">{primaryFocus}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                      Secondary
                    </div>
                    <div className="mt-2 text-lg font-semibold">{secondaryFocus}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                      Intensity
                    </div>
                    <div className="mt-2 text-lg font-semibold capitalize">{intensity}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-zinc-200">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Practice plan generated
                    from current BTB analytics + concept gaps.
                  </div>
                  {saved ? <div className="mt-2 text-emerald-300">Plan saved.</div> : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <Brain className="h-4 w-4 text-red-400" /> AI Recommendations
                  </div>
                  {plan.recommendations.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-300"
                    >
                      <Zap className="mt-0.5 h-4 w-4 text-orange-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-zinc-950 text-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Concept Completion Snapshot</CardTitle>
                <CardDescription className="text-zinc-400">
                  Use this to decide what needs install time versus what only needs review reps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {conceptStatus.map((concept) => (
                  <div key={concept.id}>
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                      <span>{concept.title}</span>
                      <span>{concept.completion}%</span>
                    </div>
                    <Progress value={concept.completion} className="h-2 bg-white/10" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="h-5 w-5 text-red-400" /> Generated Practice Blocks
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {plan.template.map((block, index) => (
              <PlanBlock key={block.section + index} block={block} index={index} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">What this becomes next</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-300">
              Tie this builder directly to live team analytics, player completion records, and film
              breakdown outputs so the plan changes automatically every week.
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Best production connection</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-300">
              Connect Airtable concepts, drills, progress, CV film events, and roster tables to
              auto-score priorities before generating the practice.
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-zinc-950 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">BTB operating standard</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-300">
              Every generated practice should have a primary focus, secondary focus, measurable
              possession objective, and one competitive transfer block.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
