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
      todayActions: [],

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

      updateMilestoneTitle: (goalId, milestoneId, title) =>
        set((s) => {
          const t = title.trim();
          if (!t) return s;
          return {
            goals: s.goals.map((g) => {
              if (g.id !== goalId) return g;
              const milestones = g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, title: t } : m,
              );
              return {
                ...g,
                milestones,
                progress: computeGoalProgress({ ...g, milestones }),
              };
            }),
          };
        }),

      deleteMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = g.milestones.filter((m) => m.id !== milestoneId);
            return {
              ...g,
              milestones,
              progress: computeGoalProgress({ ...g, milestones }),
            };
          }),
        })),

      reorderMilestones: (goalId, orderedMilestoneIds) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            if (orderedMilestoneIds.length < 2 || g.milestones.length < 2) return g;

            const milestoneById = new Map(g.milestones.map((m) => [m.id, m]));
            const reordered = orderedMilestoneIds
              .map((milestoneId) => milestoneById.get(milestoneId))
              .filter((milestone): milestone is NonNullable<typeof milestone> =>
                Boolean(milestone)
              );

            if (reordered.length !== g.milestones.length) {
              return g;
            }

            return {
              ...g,
              milestones: reordered,
              progress: computeGoalProgress({ ...g, milestones: reordered }),
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

      addTodayAction: (title) =>
        set((s) => {
          const trimmed = title.trim();
          if (!trimmed) return s;

          const today = new Date().toISOString().slice(0, 10);
          const exists = s.todayActions.some(
            (action) => action.date === today && action.title === trimmed
          );
          if (exists) return s;

          return {
            todayActions: [
              ...s.todayActions,
              {
                id: `ta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                title: trimmed,
                date: today,
                status: 'planned',
                source: 'insight_recommendation',
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),

      completeTodayAction: (id) =>
        set((s) => ({
          todayActions: s.todayActions.map((action) =>
            action.id === id
              ? {
                  ...action,
                  status: 'done',
                  completedAt: action.completedAt ?? new Date().toISOString(),
                }
              : action
          ),
        })),

      resetAllData: () =>
        set({
          goals: [],
          habits: [],
          todayActions: [],
        }),
    }),
    {
      name: 'lifetimer-goals-habits',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
