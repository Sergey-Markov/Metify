export interface DailyInsight {
  label: string;
  text: string;
  badge: string;
}

export interface LifeBalanceItem {
  id: string;
  title: string;
  percent: number;
  tone: "accent" | "neutral" | "soft";
}

export interface GoalInsight {
  id: string;
  title: string;
  progressPercent: number;
  projectedMessage: string;
  insight: string;
}

export interface HabitInsight {
  streakDays: number;
  missedDays: number;
  strongestHabit: string;
  weakestHabit: string;
  recommendation: string;
}

export interface RedZoneItem {
  id: string;
  title: string;
  message: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  note: string;
}

export interface InsightsMockData {
  dailyInsight: DailyInsight;
  lifeBalance: LifeBalanceItem[];
  goalsProgress: GoalInsight[];
  habitInsight: HabitInsight;
  redZoneItems: RedZoneItem[];
  recommendedActions: RecommendedAction[];
}

export interface InsightInput {
  lifeRemainingDays: number;
  goalProgress: number;
  expectedProgress: number;
  goalDelay: number;
  habitConsistency: number;
  missedHabits: number;
  activityScore: number;
  energyLevel?: number;
}

export interface InsightsResult {
  hero: string;
  lifeBalance: {
    focusScore: number;
    wastedTimeEstimate: number;
    activityScore: number;
  };
  goals: {
    summary: string;
    progress: number;
    expectedProgress: number;
    delay: number;
  };
  habits: {
    summary: string;
    consistency: number;
    missedHabits: number;
    streak: number;
    strongestHabit: string;
    weakestHabit: string;
  };
  redZone: string[];
  recommendations: string[];
  generatedAt: string;
}
