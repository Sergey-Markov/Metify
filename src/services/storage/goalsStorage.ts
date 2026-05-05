import type { GoalPriority } from "../../types/goalsHabits";
import { readPersistedState } from "./storageUtils";

const GOALS_HABITS_STORAGE_KEY = "lifetimer-goals-habits";

type GoalsHabitsPersistedState = {
  goals?: {
    id?: string;
    title?: string;
    createdAt?: string;
    targetDate?: string;
    progress?: number;
    priority?: GoalPriority;
    status?: "active" | "completed" | "archived";
  }[];
};

export interface StoredGoalInsight {
  id: string;
  title: string;
  createdAt: string;
  deadline: string;
  progress: number;
  priority: GoalPriority;
}

export async function getStoredGoals(): Promise<StoredGoalInsight[]> {
  const state = await readPersistedState<GoalsHabitsPersistedState>(GOALS_HABITS_STORAGE_KEY);
  const goals = state?.goals ?? [];

  return goals
    .filter((goal) => Boolean(goal.id && goal.title && goal.createdAt && goal.targetDate))
    .filter((goal) => goal.status !== "archived")
    .map((goal) => ({
      id: goal.id as string,
      title: goal.title as string,
      createdAt: goal.createdAt as string,
      deadline: goal.targetDate as string,
      progress: typeof goal.progress === "number" ? Math.min(100, Math.max(0, goal.progress)) : 0,
      priority: goal.priority ?? "medium",
    }));
}
