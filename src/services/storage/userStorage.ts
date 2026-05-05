import { readPersistedState } from "./storageUtils";

const LIFE_TIMER_STORAGE_KEY = "lifetimer-storage";
const DEFAULT_LIFE_EXPECTANCY_YEARS = 78;

type LifeTimerPersistedState = {
  profile?: {
    dateOfBirth?: string;
    additionalNotes?: string;
    lifestyle?: {
      smoking?: boolean;
      alcohol?: "low" | "medium" | "high";
      activity?: "low" | "medium" | "high";
    };
    energyLevel?: number;
  };
  lifeExpectancy?: {
    adjustedYears?: number;
  };
};

export interface UserInsightProfile {
  dateOfBirth: string | null;
  lifeExpectancyYears: number;
  energyLevel?: number;
  additionalNotes?: string;
  smokes: boolean;
  drinks: boolean;
  sportActivity: "low" | "medium" | "high";
}

export async function getUserInsightProfile(): Promise<UserInsightProfile> {
  const state = await readPersistedState<LifeTimerPersistedState>(LIFE_TIMER_STORAGE_KEY);
  const lifestyle = state?.profile?.lifestyle;

  return {
    dateOfBirth: state?.profile?.dateOfBirth ?? null,
    lifeExpectancyYears: state?.lifeExpectancy?.adjustedYears ?? DEFAULT_LIFE_EXPECTANCY_YEARS,
    energyLevel: state?.profile?.energyLevel,
    additionalNotes: state?.profile?.additionalNotes,
    smokes: Boolean(lifestyle?.smoking),
    drinks: lifestyle?.alcohol === "high" || lifestyle?.alcohol === "medium",
    sportActivity: lifestyle?.activity ?? "medium",
  };
}
