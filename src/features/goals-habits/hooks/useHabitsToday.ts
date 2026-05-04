import { useMemo, useCallback } from 'react';

import { useGoalsHabitsStore } from '../store';
import { partitionHabitsForToday } from '../domain';

export function useHabitsToday() {
  const habits = useGoalsHabitsStore((s) => s.habits);
  const checkHabit = useGoalsHabitsStore((s) => s.checkHabit);

  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.archivedAt),
    [habits],
  );
  const { due, done, pending, completionRate } = useMemo(
    () => partitionHabitsForToday(activeHabits),
    [activeHabits],
  );

  const toggle = useCallback((id: string) => checkHabit(id), [checkHabit]);

  return {
    habits: activeHabits,
    due,
    done,
    pending,
    completionRate,
    toggle,
  };
}
