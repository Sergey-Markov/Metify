// ─── Domain Types ────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type AlcoholLevel = "none" | "low" | "medium" | "high";
export type ActivityLevel = "low" | "medium" | "high";
export type SleepQuality = "poor" | "average" | "good";
export type SmokingStatus = "never" | "former" | "current";
export type StressLevel = 1 | 2 | 3 | 4 | 5;
export type WorkType = "sedentary" | "mixed" | "physical" | "night_shift" | "irregular";

export interface ChronicConditions {
  hypertension: boolean;
  diabetes: boolean;
  cardiovascular: boolean;
}

export interface LifestyleFactors {
  smoking: boolean;
  smokingStatus: SmokingStatus;
  cigarettesPerDay: number;
  alcohol: AlcoholLevel;
  alcoholUnitsPerWeek: number;
  activity: ActivityLevel;
  activityType: string;
  activityMinutesPerWeek: number;
  sleep: SleepQuality;
  sleepHours: number;
  heightCm: number;
  weightKg: number;
  stressLevel: StressLevel;
  workType: WorkType;
  profession: string;
  workHoursPerWeek: number;
  socialConnectionsPerWeek: number;
  sexualContactsPerMonth: number;
  annualCheckup: boolean;
  chronicConditions: ChronicConditions;
}

export interface UserProfile {
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  country: CountryCode;
  gender: Gender;
  additionalNotes: string;
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
