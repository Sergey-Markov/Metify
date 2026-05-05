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
  todayActions?: {
    id?: string;
    title?: string;
    date?: string;
    status?: "planned" | "done";
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

export interface StoredTodayActionInsight {
  id: string;
  title: string;
  date: string;
  status: "planned" | "done";
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

export async function getStoredTodayActions(): Promise<StoredTodayActionInsight[]> {
  const state = await readPersistedState<GoalsHabitsPersistedState>(GOALS_HABITS_STORAGE_KEY);
  const todayActions = state?.todayActions ?? [];

  return todayActions
    .filter((action) => Boolean(action.id && action.title && action.date && action.status))
    .map((action) => ({
      id: action.id as string,
      title: action.title as string,
      date: action.date as string,
      status: action.status as "planned" | "done",
    }));
}
