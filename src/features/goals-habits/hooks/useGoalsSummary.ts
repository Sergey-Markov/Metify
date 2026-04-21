import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useGoalsHabitsStore, selectActiveGoals } from '../store';
import { computeGoalsSummary } from '../domain';

export function useGoalsSummary() {
  const goals = useGoalsHabitsStore(useShallow(selectActiveGoals));
  return useMemo(() => computeGoalsSummary(goals), [goals]);
}
