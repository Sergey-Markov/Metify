/**
 * Goals / habits persisted store — implementation lives under
 * `src/features/goals-habits/store` (separation of concerns).
 */
export {
  useGoalsHabitsStore,
  selectActiveGoals,
  selectCompletedGoals,
  selectTodayHabits,
  selectHabitById,
  selectGoalById,
  type GoalsHabitsState,
  type AddGoalDraft,
  type AddHabitDraft,
} from '../features/goals-habits/store';
