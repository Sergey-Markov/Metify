// ─── Domain Types ────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type AlcoholLevel = "low" | "medium" | "high";
export type ActivityLevel = "low" | "medium" | "high";
export type SleepQuality = "poor" | "average" | "good";

export interface LifestyleFactors {
  smoking: boolean;
  alcohol: AlcoholLevel;
  activity: ActivityLevel;
  sleep: SleepQuality;
}

export interface UserProfile {
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  country: CountryCode;
  gender: Gender;
  lifestyle: LifestyleFactors;
}

export interface LifeExpectancyResult {
  baseYears: number;
  adjustedYears: number;
  estimatedDeathDate: Date;
  factors: AdjustmentFactor[];
}

export interface AdjustmentFactor {
  label: string;
  delta: number; // positive or negative years
  category: "base" | "positive" | "negative";
}

export interface CountdownTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDaysRemaining: number;
  totalWeeksRemaining: number;
  percentageLived: number;
}

export interface WeekCell {
  index: number;
  state: "past" | "current" | "future";
}

// ─── Country Config ──────────────────────────────────────────────────────────

export type CountryCode = "UA" | "DE" | "JP" | "US" | "GB" | "FR" | "PL" | "CA";

export interface CountryConfig {
  code: CountryCode;
  label: string;
  baseLifeExpectancy: number; // gender-neutral average
}
