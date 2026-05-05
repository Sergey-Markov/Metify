import type { InsightsResult } from "../../features/insights/types";
import {
  fallbackHeroInsight,
  fallbackRecommendations,
  fallbackRedZone,
  generateGoalInsight,
  generateHabitInsight,
  generateHeroInsight,
  generateRecommendations,
  generateRedZone,
} from "../ai/insightGenerator";
import { generateLifeExpectancyYearsWithAI } from "../ai/lifeExpectancyGenerator";
import { getStoredGoals, getStoredTodayActions } from "../storage/goalsStorage";
import {
  getCachedInsights,
  getInsightActivity,
  recordInsightSession,
  setCachedInsights,
} from "../storage/insightsStorage";
import {
  getLifeExpectancyCache,
  setLifeExpectancyCache,
} from "../storage/lifeExpectancyStorage";
import { getStoredHabits } from "../storage/habitsStorage";
import { getUserInsightProfile } from "../storage/userStorage";
import { buildInsightInput } from "./insightEngine";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const LIFE_EXPECTANCY_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const LIFE_EXPECTANCY_BEHAVIOR_SHIFT = 0.12;
const LIFE_EXPECTANCY_MIN_RECALC_MS = 3 * 24 * 60 * 60 * 1000;

function isCacheFresh(generatedAt: string, now: Date): boolean {
  const generated = new Date(generatedAt);
  if (Number.isNaN(generated.getTime())) return false;
  return now.getTime() - generated.getTime() < CACHE_TTL_MS;
}

function buildFallbackResult(params: {
  generatedAt: string;
  hero: string;
  goalSummary: string;
  habitSummary: string;
  redZone: string[];
  recommendations: string[];
  goalProgress: number;
  expectedProgress: number;
  goalDelay: number;
  habitConsistency: number;
  missedHabits: number;
  activityScore: number;
  shortActionsCompletionRate: number;
  streak: number;
  strongestHabit: string;
  weakestHabit: string;
}): InsightsResult {
  const wastedTimeBase = Math.max(0, Math.round((100 - params.activityScore) * 0.35));
  const wastedTimeEstimate = Math.max(
    0,
    wastedTimeBase - Math.round(params.shortActionsCompletionRate * 20),
  );
  const focusScore = Math.round(
    params.goalProgress * 0.4 +
      params.habitConsistency * 100 * 0.35 +
      params.activityScore * 0.2 +
      params.shortActionsCompletionRate * 100 * 0.05,
  );

  return {
    hero: params.hero,
    lifeBalance: {
      focusScore,
      wastedTimeEstimate,
      activityScore: params.activityScore,
    },
    goals: {
      summary: params.goalSummary,
      progress: params.goalProgress,
      expectedProgress: params.expectedProgress,
      delay: params.goalDelay,
    },
    habits: {
      summary: params.habitSummary,
      consistency: params.habitConsistency,
      missedHabits: params.missedHabits,
      streak: params.streak,
      strongestHabit: params.strongestHabit,
      weakestHabit: params.weakestHabit,
    },
    redZone: params.redZone,
    recommendations: params.recommendations,
    generatedAt: params.generatedAt,
  };
}

interface GetInsightsOptions {
  forceRefresh?: boolean;
  trackActivity?: boolean;
}

function buildProfileSignature(profile: {
  dateOfBirth: string | null;
  smokes: boolean;
  drinks: boolean;
  sportActivity: "low" | "medium" | "high";
  energyLevel?: number;
}): string {
  return [
    profile.dateOfBirth ?? "unknown-dob",
    profile.smokes ? "smokes" : "non-smoker",
    profile.drinks ? "drinks" : "no-drinks",
    profile.sportActivity,
    profile.energyLevel ?? "energy-unknown",
  ].join("|");
}

function computeBehaviorScore(params: {
  goalsProgress: number;
  habitConsistency: number;
  shortActionsCompletionRate: number;
}): number {
  const score =
    params.goalsProgress / 100 * 0.45 +
    params.habitConsistency * 0.4 +
    params.shortActionsCompletionRate * 0.15;
  return Math.min(1, Math.max(0, Number(score.toFixed(3))));
}

function shouldRecalculateLifeExpectancy(params: {
  now: Date;
  profileSignature: string;
  behaviorScore: number;
  cache: Awaited<ReturnType<typeof getLifeExpectancyCache>>;
}): boolean {
  const { now, profileSignature, behaviorScore, cache } = params;
  if (!cache) return true;
  if (cache.profileSignature !== profileSignature) return true;

  const calculatedAt = new Date(cache.calculatedAt);
  if (Number.isNaN(calculatedAt.getTime())) return true;
  const ageMs = now.getTime() - calculatedAt.getTime();

  if (ageMs >= LIFE_EXPECTANCY_REFRESH_MS) return true;
  if (ageMs < LIFE_EXPECTANCY_MIN_RECALC_MS) return false;

  return Math.abs(cache.behaviorScore - behaviorScore) >= LIFE_EXPECTANCY_BEHAVIOR_SHIFT;
}

export async function getInsights(options?: GetInsightsOptions): Promise<InsightsResult> {
  const now = new Date();
  const forceRefresh = Boolean(options?.forceRefresh);
  const trackActivity = options?.trackActivity ?? true;

  if (!forceRefresh) {
    const cached = await getCachedInsights();
    if (cached && isCacheFresh(cached.generatedAt, now)) {
      if (trackActivity) {
        await recordInsightSession(now);
      }
      return cached.data;
    }
  }

  const [profile, goals, habits, todayActions, trackedActivity, fallbackActivity] = await Promise.all([
    getUserInsightProfile(),
    getStoredGoals(),
    getStoredHabits(),
    getStoredTodayActions(),
    trackActivity ? recordInsightSession(now) : getInsightActivity(now),
    getInsightActivity(now),
  ]);
  const sessionsPerWeek = Math.max(
    trackedActivity.sessionsPerWeek,
    fallbackActivity.sessionsPerWeek,
  );

  const todayKey = now.toISOString().slice(0, 10);
  const todayShortActions = todayActions.filter((action) => action.date === todayKey);
  const shortActionsDoneToday = todayShortActions.filter((action) => action.status === "done").length;
  const shortActionsCompletionRate =
    todayShortActions.length > 0 ? shortActionsDoneToday / todayShortActions.length : 0;
  const behaviorScore = computeBehaviorScore({
    goalsProgress:
      goals.length > 0
        ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
        : 0,
    habitConsistency:
      habits.length > 0
        ? habits.reduce((sum, habit) => {
            const set = new Set(habit.completedDates);
            const completedIn7 = Array.from({ length: 7 }, (_, index) => {
              const date = new Date(now);
              date.setDate(date.getDate() - index);
              return set.has(date.toISOString().slice(0, 10)) ? 1 : 0;
            }).reduce((s, value) => s + value, 0);
            return sum + completedIn7 / 7;
          }, 0) / habits.length
        : 0,
    shortActionsCompletionRate,
  });
  const profileSignature = buildProfileSignature(profile);
  const lifeCache = await getLifeExpectancyCache();
  const shouldRecalculateLife = shouldRecalculateLifeExpectancy({
    now,
    profileSignature,
    behaviorScore,
    cache: lifeCache,
  });

  let effectiveLifeExpectancyYears = lifeCache?.years ?? profile.lifeExpectancyYears;
  if (shouldRecalculateLife) {
    try {
      effectiveLifeExpectancyYears = await generateLifeExpectancyYearsWithAI({
        baseLifeExpectancyYears: profile.lifeExpectancyYears,
        smokes: profile.smokes,
        drinks: profile.drinks,
        sportActivity: profile.sportActivity,
        energyLevel: profile.energyLevel,
        goalsProgress:
          goals.length > 0
            ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
            : 0,
        habitConsistency:
          habits.length > 0
            ? habits.reduce((sum, habit) => {
                const set = new Set(habit.completedDates);
                const completedIn7 = Array.from({ length: 7 }, (_, index) => {
                  const date = new Date(now);
                  date.setDate(date.getDate() - index);
                  return set.has(date.toISOString().slice(0, 10)) ? 1 : 0;
                }).reduce((s, value) => s + value, 0);
                return sum + completedIn7 / 7;
              }, 0) / habits.length
            : 0,
        shortActionsCompletionRate,
      });
      await setLifeExpectancyCache({
        years: effectiveLifeExpectancyYears,
        calculatedAt: now.toISOString(),
        profileSignature,
        behaviorScore,
      });
    } catch {
      effectiveLifeExpectancyYears = lifeCache?.years ?? profile.lifeExpectancyYears;
    }
  }

  const engine = buildInsightInput({
    profile: {
      ...profile,
      lifeExpectancyYears: effectiveLifeExpectancyYears,
    },
    goals,
    habits,
    todayActions,
    sessionsPerWeek,
    now,
  });

  const input = engine.input;
  const generatedAt = now.toISOString();

  let hero = fallbackHeroInsight(input);
  let goalSummary =
    input.goalDelay > 0
      ? "Ваш прогрес по цілях нижчий за очікуваний. Варто підсилити щоденний фокус."
      : "Ваш прогрес по цілях відповідає або випереджає очікуваний темп.";
  let habitSummary =
    input.habitConsistency < 0.5
      ? "Стабільність звичок нижча за бажаний рівень. Почніть з простішої версії."
      : "По звичках формується хороший ритм. Важливо втримати послідовність.";
  let redZone = fallbackRedZone(input);
  let recommendations = fallbackRecommendations(input);

  try {
    const [heroText, goalText, habitText, redItems, recs] = await Promise.all([
      generateHeroInsight(input),
      generateGoalInsight(input),
      generateHabitInsight(input),
      generateRedZone(input),
      generateRecommendations(input),
    ]);
    hero = heroText || hero;
    goalSummary = goalText || goalSummary;
    habitSummary = habitText || habitSummary;
    redZone = redItems.length ? redItems : redZone;
    recommendations = recs.length ? recs : recommendations;
  } catch {
    // Fallback values already prepared above.
  }

  const result = buildFallbackResult({
    generatedAt,
    hero,
    goalSummary,
    habitSummary,
    redZone,
    recommendations,
    goalProgress: input.goalProgress,
    expectedProgress: input.expectedProgress,
    goalDelay: input.goalDelay,
    habitConsistency: input.habitConsistency,
    missedHabits: input.missedHabits,
    activityScore: input.activityScore,
    shortActionsCompletionRate: input.shortActionsCompletionRate,
    streak: engine.habitStreak,
    strongestHabit: engine.strongestHabit,
    weakestHabit: engine.weakestHabit,
  });

  await setCachedInsights(result);
  return result;
}
