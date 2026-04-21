import { useShallow } from 'zustand/react/shallow';

import { useGoalsHabitsStore } from '../store';

/** Stable habit mutations — avoids subscribing to the full store slice. */
export function useHabitActions() {
  return useGoalsHabitsStore(
    useShallow((s) => ({
      checkHabit: s.checkHabit,
      addHabit: s.addHabit,
      updateHabit: s.updateHabit,
      deleteHabit: s.deleteHabit,
    }))
  );
}
