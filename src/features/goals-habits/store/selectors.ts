import type { GoalsHabitsState } from './types';

/**
 * Prefer raw selectors for subscriptions.
 * Derive filtered arrays inside hooks/components with `useMemo`.
 */
export const selectGoals = (s: GoalsHabitsState) => s.goals;
export const selectHabits = (s: GoalsHabitsState) => s.habits;

/** Legacy derived selectors; kept for compatibility. */
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
