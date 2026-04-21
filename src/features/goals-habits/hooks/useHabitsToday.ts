import { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useGoalsHabitsStore, selectTodayHabits } from '../store';
import { partitionHabitsForToday } from '../domain';

export function useHabitsToday() {
  const habits = useGoalsHabitsStore(useShallow(selectTodayHabits));
  const checkHabit = useGoalsHabitsStore((s) => s.checkHabit);

  const { due, done, pending, completionRate } = useMemo(
    () => partitionHabitsForToday(habits),
    [habits]
  );

  const toggle = useCallback((id: string) => checkHabit(id), [checkHabit]);

  return {
    habits,
    due,
    done,
    pending,
    completionRate,
    toggle,
  };
}
