/**
 * Global state store using Zustand.
 * Persisted to AsyncStorage via zustand/middleware.
 *
 * Install deps:
 *   npx expo install zustand @react-native-async-storage/async-storage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile, LifeExpectancyResult } from '../types';
import { DEFAULT_PROFILE } from '../constants';
import { calculateLifeExpectancy } from '../utils/lifeCalculator';

// ─── State Shape ─────────────────────────────────────────────────────────────

interface LifeTimerState {
  // Profile
  profile: UserProfile;
  isOnboardingComplete: boolean;

  // Derived (computed on profile save, stored for quick access)
  lifeExpectancy: LifeExpectancyResult | null;

  // Actions
  updateProfile: (partial: Partial<UserProfile>) => void;
  completeOnboarding: (profile: UserProfile) => void;
  resetApp: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLifeTimerStore = create<LifeTimerState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      isOnboardingComplete: false,
      lifeExpectancy: null,

      updateProfile: (partial) =>
        set((state) => {
          const updatedProfile = { ...state.profile, ...partial };
          return { profile: updatedProfile };
        }),

      completeOnboarding: (profile) => {
        const lifeExpectancy = calculateLifeExpectancy(profile);
        set({ profile, lifeExpectancy, isOnboardingComplete: true });
      },

      resetApp: () =>
        set({
          profile: DEFAULT_PROFILE,
          isOnboardingComplete: false,
          lifeExpectancy: null,
        }),
    }),
    {
      name: 'lifetimer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-ephemeral fields
      partialize: (state) => ({
        profile: state.profile,
        isOnboardingComplete: state.isOnboardingComplete,
        lifeExpectancy: state.lifeExpectancy,
      }),
    }
  )
);

// ─── Selectors (derived reads, avoids re-renders) ────────────────────────────

export const selectProfile       = (s: LifeTimerState) => s.profile;
export const selectDeathDate     = (s: LifeTimerState) =>
  s.lifeExpectancy?.estimatedDeathDate ?? null;
export const selectAdjustedYears = (s: LifeTimerState) =>
  s.lifeExpectancy?.adjustedYears ?? 72;
export const selectFactors       = (s: LifeTimerState) =>
  s.lifeExpectancy?.factors ?? [];
export const selectOnboarding    = (s: LifeTimerState) => s.isOnboardingComplete;
