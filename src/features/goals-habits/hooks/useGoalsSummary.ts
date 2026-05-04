import { useMemo } from 'react';

import { useGoalsHabitsStore } from '../store';
import { computeGoalsSummary } from '../domain';

export function useGoalsSummary() {
  const goals = useGoalsHabitsStore((s) => s.goals);
  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === 'active'),
    [goals],
  );
  return useMemo(() => computeGoalsSummary(activeGoals), [activeGoals]);
}
