// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalCategory =
  | "health"
  | "family"
  | "career"
  | "growth"
  | "travel"
  | "finance"
  | "creative"
  | "other";
export type GoalStatus = "active" | "completed" | "archived";
export type GoalPriority = "low" | "medium" | "high";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetDate?: string; // ISO date
  completedAt?: string;
  createdAt: string;
  progress: number; // 0–100
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitFrequency = "daily" | "weekly";
export type HabitCategory = "health" | "mind" | "social" | "work" | "other";

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays: number[]; // 0=Sun…6=Sat (weekly) or [] (daily)
  streak: number;
  longestStreak: number;
  completions: string[]; // ISO date strings of completed days
  createdAt: string;
  archivedAt?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0–1 over last 30 days
  weeklyData: number[]; // completions per day last 7 days
}
