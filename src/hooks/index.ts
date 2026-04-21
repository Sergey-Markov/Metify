/**
 * Custom hooks — all side-effect and derived-state logic lives here.
 * Screens and components stay declarative and dumb.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { CountdownTime, WeekCell } from '../types';
import { buildCountdown, buildWeekGrid, getDailyMotivation } from '../utils/lifeCalculator';
import { MOTIVATIONAL_MESSAGES, APP_CONFIG } from '../constants';
import {
  useLifeTimerStore,
  selectProfile,
  selectDeathDate,
  selectAdjustedYears,
} from '../store/useLifeTimerStore';

// ─── useCountdown ─────────────────────────────────────────────────────────────

/**
 * Returns a live CountdownTime that ticks every second.
 * Pauses when app goes to background (saves battery).
 */
export function useCountdown(): CountdownTime | null {
  const profile    = useLifeTimerStore(selectProfile);
  const deathDate  = useLifeTimerStore(selectDeathDate);

  const computeCountdown = useCallback(() => {
    if (!deathDate) return null;
    return buildCountdown(profile.dateOfBirth, new Date(deathDate));
  }, [profile.dateOfBirth, deathDate]);

  const [countdown, setCountdown] = useState<CountdownTime | null>(computeCountdown);

  useEffect(() => {
    if (!deathDate) return;

    let intervalId: ReturnType<typeof setInterval>;

    const start = () => {
      setCountdown(computeCountdown());
      intervalId = setInterval(() => setCountdown(computeCountdown()), APP_CONFIG.TIMER_INTERVAL_MS);
    };
    const stop = () => clearInterval(intervalId);

    start();

    const sub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') start();
      else stop();
    });

    return () => { stop(); sub.remove(); };
  }, [computeCountdown, deathDate]);

  return countdown;
}

// ─── useLifeGrid ─────────────────────────────────────────────────────────────

/**
 * Returns memoized week-grid cells. Re-computes only when DOB or lifespan changes.
 */
export function useLifeGrid(): { cells: WeekCell[]; livedWeeks: number; totalWeeks: number } {
  const profile      = useLifeTimerStore(selectProfile);
  const adjustedYears = useLifeTimerStore(selectAdjustedYears);

  return useMemo(() => {
    const cells      = buildWeekGrid(profile.dateOfBirth, adjustedYears);
    const livedWeeks = cells.filter(c => c.state !== 'future').length;
    const totalWeeks = cells.length;
    return { cells, livedWeeks, totalWeeks };
  }, [profile.dateOfBirth, adjustedYears]);
}

// ─── useDailyMotivation ───────────────────────────────────────────────────────

/**
 * Returns one deterministic motivational message per calendar day.
 */
export function useDailyMotivation(): { quote: string; sub: string } {
  return useMemo(() => getDailyMotivation(MOTIVATIONAL_MESSAGES), []);
}

// ─── useOnboardingForm ────────────────────────────────────────────────────────

/**
 * Encapsulates all onboarding form state and submission logic.
 * Returns controlled field values + handlers + submit action.
 */
export function useOnboardingForm() {
  const { profile, updateProfile, completeOnboarding } = useLifeTimerStore();

  const setField = useCallback(
    <K extends keyof typeof profile>(key: K, value: typeof profile[K]) => {
      updateProfile({ [key]: value } as Partial<typeof profile>);
    },
    [updateProfile]
  );

  const setLifestyle = useCallback(
    <K extends keyof typeof profile.lifestyle>(key: K, value: typeof profile.lifestyle[K]) => {
      updateProfile({
        lifestyle: { ...profile.lifestyle, [key]: value },
      });
    },
    [profile.lifestyle, updateProfile]
  );

  const submit = useCallback(() => {
    completeOnboarding(profile);
  }, [completeOnboarding, profile]);

  return { profile, setField, setLifestyle, submit };
}

// ─── useAppStats ──────────────────────────────────────────────────────────────

/**
 * Convenience hook: pre-formats the stats shown on the home screen.
 */
export function useAppStats() {
  const countdown     = useCountdown();
  const motivation    = useDailyMotivation();
  const { livedWeeks, totalWeeks } = useLifeGrid();

  const morningsLeft = countdown?.totalDaysRemaining ?? 0;
  const percentLived = countdown?.percentageLived ?? 0;

  return { countdown, motivation, morningsLeft, percentLived, livedWeeks, totalWeeks };
}
