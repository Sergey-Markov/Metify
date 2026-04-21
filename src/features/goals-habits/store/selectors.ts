import type { GoalsHabitsState } from './types';

/**
 * Derived arrays via `.filter()` — new reference every call.
 * Use with `useShallow` from `zustand/react/shallow` in `useGoalsHabitsStore(...)`,
 * or subscribe to `s.goals` / `s.habits` and `useMemo` locally (React 19 / useSyncExternalStore).
 */
export const selectActiveGoals = (s: GoalsHabitsState) =>
  s.goals.filter((g) => g.status === 'active');

export const selectCompletedGoals = (s: GoalsHabitsState) =>
  s.goals.filter((g) => g.status === 'completed');

/** Habits that are not archived (shown on today / main list). */
export const selectTodayHabits = (s: GoalsHabitsState) =>
  s.habits.filter((h) => !h.archivedAt);

export const selectHabitById =
  (id: string) => (s: GoalsHabitsState) =>
    s.habits.find((h) => h.id === id);

export const selectGoalById =
  (id: string) => (s: GoalsHabitsState) =>
    s.goals.find((g) => g.id === id);
