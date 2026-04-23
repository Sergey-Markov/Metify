import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  toggleHabitCompletion,
  computeGoalProgress,
  makeGoalId,
  makeHabitId,
  makeMilestoneId,
} from '../../../utils/goalsHabits';
import type { Goal } from '../../../types/goalsHabits';
import type { GoalsHabitsState } from './types';

export const useGoalsHabitsStore = create<GoalsHabitsState>()(
  persist(
    (set) => ({
      goals: [],
      habits: [],

      addGoal: (draft) =>
        set((s) => {
          const milestones = draft.milestones ?? [];
          const created: Goal = {
            ...draft,
            id: makeGoalId(),
            createdAt: new Date().toISOString(),
            status: 'active',
            milestones,
            progress: 0,
          };
          created.progress = computeGoalProgress(created);
          return { goals: [...s.goals, created] };
        }),

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      completeGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : g
          ),
        })),

      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addMilestone: (goalId, title) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = [
              ...g.milestones,
              { id: makeMilestoneId(), title, completed: false },
            ];
            return {
              ...g,
              milestones,
              progress: computeGoalProgress({ ...g, milestones }),
            };
          }),
        })),

      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = g.milestones.map((m) =>
              m.id === milestoneId
                ? {
                    ...m,
                    completed: !m.completed,
                    completedAt: !m.completed
                      ? new Date().toISOString()
                      : undefined,
                  }
                : m
            );
            return {
              ...g,
              milestones,
              progress: computeGoalProgress({ ...g, milestones }),
            };
          }),
        })),

      addHabit: (draft) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              ...draft,
              id: makeHabitId(),
              createdAt: new Date().toISOString(),
              streak: 0,
              longestStreak: 0,
              completions: [],
            },
          ],
        })),

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      checkHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? toggleHabitCompletion(h) : h
          ),
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    }),
    {
      name: 'lifetimer-goals-habits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
