import type { Habit } from '../../../types/goalsHabits';
import { isHabitDueToday, isHabitCompletedToday } from '../../../utils/goalsHabits';

export interface HabitsTodaySnapshot {
  /** Non-archived habits (same slice as `selectTodayHabits`). */
  habits: Habit[];
  due: Habit[];
  done: Habit[];
  pending: Habit[];
  completionRate: number;
}

export function partitionHabitsForToday(habits: Habit[]): HabitsTodaySnapshot {
  const due = habits.filter(isHabitDueToday);
  const done = due.filter(isHabitCompletedToday);
  const pending = due.filter((h) => !isHabitCompletedToday(h));
  const completionRate =
    due.length > 0 ? Math.round((done.length / due.length) * 100) : 0;
  return { habits, due, done, pending, completionRate };
}
