import type { InsightInput } from "../../features/insights/types";
import { clamp } from "../storage/storageUtils";
import type { StoredGoalInsight } from "../storage/goalsStorage";
import type { StoredHabitInsight } from "../storage/habitsStorage";
import type { UserInsightProfile } from "../storage/userStorage";

const DAY_MS = 24 * 60 * 60 * 1000;

function safeDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function diffInDays(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / DAY_MS));
}

function calcLifeRemainingDays(profile: UserInsightProfile, now: Date): number {
  const dob = safeDate(profile.dateOfBirth);
  if (!dob) return profile.lifeExpectancyYears * 365;
  const ageInDays = diffInDays(dob, now);
  return Math.max(0, profile.lifeExpectancyYears * 365 - ageInDays);
}

function calcGoals(goals: StoredGoalInsight[], now: Date): {
  goalProgress: number;
  expectedProgress: number;
  goalDelay: number;
} {
  if (!goals.length) return { goalProgress: 0, expectedProgress: 0, goalDelay: 0 };

  const values = goals.map((goal) => {
    const createdAt = safeDate(goal.createdAt) ?? now;
    const deadline = safeDate(goal.deadline) ?? now;
    const totalTime = Math.max(1, diffInDays(createdAt, deadline));
    const timePassed = clamp(diffInDays(createdAt, now), 0, totalTime);
    const expectedProgress = clamp((timePassed / totalTime) * 100, 0, 100);
    const actualProgress = clamp(goal.progress, 0, 100);
    const goalDelay = clamp(expectedProgress - actualProgress, -100, 100);
    return { actualProgress, expectedProgress, goalDelay };
  });

  const average = <T>(arr: T[], pick: (item: T) => number) =>
    arr.reduce((sum, item) => sum + pick(item), 0) / arr.length;

  return {
    goalProgress: Math.round(average(values, (value) => value.actualProgress)),
    expectedProgress: Math.round(average(values, (value) => value.expectedProgress)),
    goalDelay: Math.round(average(values, (value) => value.goalDelay)),
  };
}

function calcHabits(habits: StoredHabitInsight[], now: Date): {
  habitConsistency: number;
  missedHabits: number;
  strongestHabit: string;
  weakestHabit: string;
  streak: number;
} {
  if (!habits.length) {
    return {
      habitConsistency: 0,
      missedHabits: 0,
      strongestHabit: "Немає звичок",
      weakestHabit: "Немає звичок",
      streak: 0,
    };
  }

  const last7 = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });

  const completionByHabit = habits.map((habit) => {
    const completionsSet = new Set(habit.completedDates);
    const completed = last7.filter((date) => completionsSet.has(date)).length;
    return {
      title: habit.title,
      completed,
      streak: habit.streak,
    };
  });

  const totalPossible = habits.length * 7;
  const totalCompleted = completionByHabit.reduce((sum, item) => sum + item.completed, 0);
  const consistency = totalPossible > 0 ? totalCompleted / totalPossible : 0;
  const strongest = completionByHabit.reduce((best, current) =>
    current.completed > best.completed ? current : best,
  );
  const weakest = completionByHabit.reduce((worst, current) =>
    current.completed < worst.completed ? current : worst,
  );

  return {
    habitConsistency: Number(consistency.toFixed(2)),
    missedHabits: Math.max(0, totalPossible - totalCompleted),
    strongestHabit: strongest.title,
    weakestHabit: weakest.title,
    streak: Math.max(...completionByHabit.map((item) => item.streak)),
  };
}

function calcActivityScore(sessionsPerWeek: number): number {
  return clamp(Math.round((sessionsPerWeek / 14) * 100), 0, 100);
}

export interface InsightEngineInput {
  profile: UserInsightProfile;
  goals: StoredGoalInsight[];
  habits: StoredHabitInsight[];
  sessionsPerWeek: number;
  now?: Date;
}

export interface InsightEngineOutput {
  input: InsightInput;
  strongestHabit: string;
  weakestHabit: string;
  habitStreak: number;
}

export function buildInsightInput(params: InsightEngineInput): InsightEngineOutput {
  const now = params.now ?? new Date();
  const lifeRemainingDays = calcLifeRemainingDays(params.profile, now);
  const goals = calcGoals(params.goals, now);
  const habits = calcHabits(params.habits, now);
  const activityScore = calcActivityScore(params.sessionsPerWeek);

  return {
    input: {
      lifeRemainingDays,
      goalProgress: goals.goalProgress,
      expectedProgress: goals.expectedProgress,
      goalDelay: goals.goalDelay,
      habitConsistency: habits.habitConsistency,
      missedHabits: habits.missedHabits,
      activityScore,
      energyLevel: params.profile.energyLevel,
    },
    strongestHabit: habits.strongestHabit,
    weakestHabit: habits.weakestHabit,
    habitStreak: habits.streak,
  };
}
