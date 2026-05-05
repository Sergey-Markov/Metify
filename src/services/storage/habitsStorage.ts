import { readPersistedState } from "./storageUtils";

const GOALS_HABITS_STORAGE_KEY = "lifetimer-goals-habits";

type GoalsHabitsPersistedState = {
  habits?: {
    id?: string;
    title?: string;
    completions?: string[];
    createdAt?: string;
    archivedAt?: string;
    streak?: number;
    longestStreak?: number;
  }[];
};

export interface StoredHabitInsight {
  id: string;
  title: string;
  completedDates: string[];
  createdAt: string;
  streak: number;
  longestStreak: number;
}

export async function getStoredHabits(): Promise<StoredHabitInsight[]> {
  const state = await readPersistedState<GoalsHabitsPersistedState>(GOALS_HABITS_STORAGE_KEY);
  const habits = state?.habits ?? [];

  return habits
    .filter((habit) => !habit.archivedAt)
    .filter((habit) => Boolean(habit.id && habit.title && habit.createdAt))
    .map((habit) => ({
      id: habit.id as string,
      title: habit.title as string,
      completedDates: Array.isArray(habit.completions) ? habit.completions : [],
      createdAt: habit.createdAt as string,
      streak: habit.streak ?? 0,
      longestStreak: habit.longestStreak ?? 0,
    }));
}
