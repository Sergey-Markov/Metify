import { useMemo } from 'react';

import { computeHabitStats } from '../../../utils/goalsHabits';
import type { Habit } from '../../../types/goalsHabits';

export function useHabitStats(habit: Habit) {
  return useMemo(() => computeHabitStats(habit), [habit]);
}
