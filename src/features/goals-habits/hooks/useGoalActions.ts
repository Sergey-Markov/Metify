import { useShallow } from 'zustand/react/shallow';

import { useGoalsHabitsStore } from '../store';

/** Stable goal mutations — avoids subscribing to the full store slice. */
export function useGoalActions() {
  return useGoalsHabitsStore(
    useShallow((s) => ({
      addGoal: s.addGoal,
      updateGoal: s.updateGoal,
      completeGoal: s.completeGoal,
      deleteGoal: s.deleteGoal,
      addMilestone: s.addMilestone,
      toggleMilestone: s.toggleMilestone,
      updateMilestoneTitle: s.updateMilestoneTitle,
      deleteMilestone: s.deleteMilestone,
    }))
  );
}
