import type { Goal, Habit } from '../../../types/goalsHabits';

export type AddGoalDraft = Omit<Goal, 'id' | 'createdAt' | 'status' | 'progress'>;

export type AddHabitDraft = Omit<
  Habit,
  'id' | 'createdAt' | 'streak' | 'longestStreak' | 'completions'
>;

export interface GoalsHabitsState {
  goals: Goal[];
  habits: Habit[];

  addGoal: (draft: AddGoalDraft) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  completeGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  updateMilestoneTitle: (
    goalId: string,
    milestoneId: string,
    title: string,
  ) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  reorderMilestones: (goalId: string, orderedMilestoneIds: string[]) => void;

  addHabit: (draft: AddHabitDraft) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  checkHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
}
