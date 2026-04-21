import type {
  UserProfile,
  LifeExpectancyResult,
  AdjustmentFactor,
  CountdownTime,
  WeekCell,
} from '../types';
import { COUNTRY_MAP, LIFESTYLE_ADJUSTMENTS, APP_CONFIG } from '../constants';

// ─── Life Expectancy ──────────────────────────────────────────────────────────

/**
 * Pure function: calculates adjusted life expectancy and estimated death date.
 * All business logic lives here — no side effects, fully testable.
 */
export function calculateLifeExpectancy(profile: UserProfile): LifeExpectancyResult {
  const country = COUNTRY_MAP[profile.country];
  if (!country) throw new Error(`Unknown country code: ${profile.country}`);

  const base = country.baseLifeExpectancy;
  const factors: AdjustmentFactor[] = [
    { label: `Базова (${country.label})`, delta: base, category: 'base' },
  ];

  const adj = LIFESTYLE_ADJUSTMENTS;

  const genderDelta = adj.gender[profile.gender] ?? 0;
  if (genderDelta !== 0) {
    factors.push({
      label: profile.gender === 'female' ? 'Стать (жінка)' : 'Стать',
      delta: genderDelta,
      category: genderDelta > 0 ? 'positive' : 'negative',
    });
  }

  const smokingDelta = profile.lifestyle.smoking ? adj.smoking['true'] : 0;
  if (smokingDelta !== 0) {
    factors.push({ label: 'Куріння', delta: smokingDelta, category: 'negative' });
  }

  const alcDelta = adj.alcohol[profile.lifestyle.alcohol];
  if (alcDelta !== 0) {
    factors.push({ label: `Алкоголь (${profile.lifestyle.alcohol})`, delta: alcDelta, category: 'negative' });
  }

  const actDelta = adj.activity[profile.lifestyle.activity];
  if (actDelta !== 0) {
    factors.push({
      label: `Активність (${profile.lifestyle.activity})`,
      delta: actDelta,
      category: actDelta > 0 ? 'positive' : 'negative',
    });
  }

  const sleepDelta = adj.sleep[profile.lifestyle.sleep];
  if (sleepDelta !== 0) {
    factors.push({
      label: `Сон (${profile.lifestyle.sleep})`,
      delta: sleepDelta,
      category: sleepDelta > 0 ? 'positive' : 'negative',
    });
  }

  const adjustedYears = Math.max(
    1,
    Math.min(
      APP_CONFIG.MAX_LIFESPAN_YEARS,
      Math.round(base + genderDelta + smokingDelta + alcDelta + actDelta + sleepDelta)
    )
  );

  const dob = new Date(profile.dateOfBirth);
  const estimatedDeathDate = new Date(dob);
  estimatedDeathDate.setFullYear(dob.getFullYear() + adjustedYears);

  return { baseYears: base, adjustedYears, estimatedDeathDate, factors };
}

// ─── Countdown ────────────────────────────────────────────────────────────────

/**
 * Pure function: computes human-readable countdown from now to a target date.
 */
export function buildCountdown(
  dateOfBirth: string,
  deathDate: Date,
  now: Date = new Date()
): CountdownTime {
  const dob = new Date(dateOfBirth);
  const diffMs = Math.max(0, deathDate.getTime() - now.getTime());
  const totalLifeMs = deathDate.getTime() - dob.getTime();
  const livedMs = now.getTime() - dob.getTime();

  const years  = Math.floor(diffMs / APP_CONFIG.MS_PER_YEAR);
  const rem1   = diffMs % APP_CONFIG.MS_PER_YEAR;
  const months = Math.floor(rem1 / (APP_CONFIG.MS_PER_DAY * 30.44));
  const rem2   = rem1 % (APP_CONFIG.MS_PER_DAY * 30.44);
  const days   = Math.floor(rem2 / APP_CONFIG.MS_PER_DAY);
  const rem3   = rem2 % APP_CONFIG.MS_PER_DAY;
  const hours  = Math.floor(rem3 / 3_600_000);
  const rem4   = rem3 % 3_600_000;
  const minutes = Math.floor(rem4 / 60_000);
  const seconds = Math.floor((rem4 % 60_000) / 1000);

  const totalDaysRemaining  = Math.floor(diffMs / APP_CONFIG.MS_PER_DAY);
  const totalWeeksRemaining = Math.floor(diffMs / APP_CONFIG.MS_PER_WEEK);
  const percentageLived     = Math.min(100, Math.round((livedMs / totalLifeMs) * 100));

  return { years, months, days, hours, minutes, seconds, totalDaysRemaining, totalWeeksRemaining, percentageLived };
}

// ─── Life Grid ────────────────────────────────────────────────────────────────

/**
 * Pure function: returns an array of WeekCell objects for the life grid.
 * Total cells = adjustedYears × 52 (capped at 90×52 for render perf).
 */
export function buildWeekGrid(
  dateOfBirth: string,
  lifeExpectancyYears: number,
  now: Date = new Date()
): WeekCell[] {
  const dob = new Date(dateOfBirth);
  const totalWeeks = Math.min(lifeExpectancyYears, 90) * APP_CONFIG.WEEKS_PER_YEAR;
  const livedWeeks = Math.floor((now.getTime() - dob.getTime()) / APP_CONFIG.MS_PER_WEEK);

  return Array.from({ length: totalWeeks }, (_, i) => ({
    index: i,
    state: i < livedWeeks - 1 ? 'past'
         : i === livedWeeks - 1 ? 'current'
         : 'future',
  }));
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function formatDateUk(date: Date): string {
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getAgeFromDob(dob: string, now: Date = new Date()): number {
  const birth = new Date(dob);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function getDailyMotivation(messages: readonly { quote: string; sub: string }[]): { quote: string; sub: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / APP_CONFIG.MS_PER_DAY
  );
  return messages[dayOfYear % messages.length];
}
