import type { Goal } from '../../../types/goalsHabits';
import { daysUntilGoal } from '../../../utils/goalsHabits';

export interface GoalsByPriority {
  high: Goal[];
  medium: Goal[];
  low: Goal[];
}

export interface GoalsSummary {
  goals: Goal[];
  byPriority: GoalsByPriority;
  avgProgress: number;
  overdue: Goal[];
}

export function computeGoalsSummary(goals: Goal[]): GoalsSummary {
  const byPriority: GoalsByPriority = {
    high: goals.filter((g) => g.priority === 'high'),
    medium: goals.filter((g) => g.priority === 'medium'),
    low: goals.filter((g) => g.priority === 'low'),
  };
  const avgProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;
  const overdue = goals.filter((g) => {
    const days = daysUntilGoal(g);
    return days !== null && days === 0 && g.progress < 100;
  });
  return { goals, byPriority, avgProgress, overdue };
}
