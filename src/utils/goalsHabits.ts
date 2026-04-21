import type { Habit, HabitStats, Goal } from '../types/goalsHabits';

const TODAY = () => new Date().toISOString().slice(0, 10);

// ─── Habit Utils ──────────────────────────────────────────────────────────────

export function isHabitDueToday(habit: Habit): boolean {
  if (habit.frequency === 'daily') return true;
  const dow = new Date().getDay();
  return habit.targetDays.includes(dow);
}

export function isHabitCompletedToday(habit: Habit): boolean {
  return habit.completions.includes(TODAY());
}

export function toggleHabitCompletion(habit: Habit, date = TODAY()): Habit {
  const alreadyDone = habit.completions.includes(date);
  const completions = alreadyDone
    ? habit.completions.filter(d => d !== date)
    : [...habit.completions, date].sort();

  const streak = computeStreak(completions, habit.frequency);
  return {
    ...habit,
    completions,
    streak,
    longestStreak: Math.max(streak, habit.longestStreak),
  };
}

export function computeStreak(completions: string[], frequency: 'daily' | 'weekly'): number {
  if (!completions.length) return 0;
  const sorted = [...completions].sort().reverse();
  const today  = TODAY();
  let streak   = 0;
  let cursor   = new Date(today);

  for (const date of sorted) {
    const expected = cursor.toISOString().slice(0, 10);
    if (date === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - (frequency === 'weekly' ? 7 : 1));
    } else {
      break;
    }
  }
  return streak;
}

export function computeHabitStats(habit: Habit): HabitStats {
  const today  = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const completedLast30 = last30.filter(d => habit.completions.includes(d)).length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return habit.completions.includes(d.toISOString().slice(0, 10)) ? 1 : 0;
  });

  return {
    totalCompletions: habit.completions.length,
    currentStreak:    habit.streak,
    longestStreak:    habit.longestStreak,
    completionRate:   completedLast30 / 30,
    weeklyData:       last7,
  };
}

// ─── Goal Utils ───────────────────────────────────────────────────────────────

export function computeGoalProgress(goal: Goal): number {
  if (!goal.milestones.length) return goal.progress;
  const done = goal.milestones.filter(m => m.completed).length;
  return Math.round((done / goal.milestones.length) * 100);
}

export function daysUntilGoal(goal: Goal): number | null {
  if (!goal.targetDate) return null;
  const diff = new Date(goal.targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function makeGoalId() { return `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
export function makeHabitId() { return `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
export function makeMilestoneId() { return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
