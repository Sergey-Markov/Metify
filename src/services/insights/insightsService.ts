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
import { getStoredGoals } from "../storage/goalsStorage";
import {
  getCachedInsights,
  getInsightActivity,
  recordInsightSession,
  setCachedInsights,
} from "../storage/insightsStorage";
import { getStoredHabits } from "../storage/habitsStorage";
import { getUserInsightProfile } from "../storage/userStorage";
import { buildInsightInput } from "./insightEngine";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
  streak: number;
  strongestHabit: string;
  weakestHabit: string;
}): InsightsResult {
  const wastedTimeEstimate = Math.max(0, Math.round((100 - params.activityScore) * 0.35));
  const focusScore = Math.round(
    params.goalProgress * 0.4 +
      params.habitConsistency * 100 * 0.35 +
      params.activityScore * 0.25,
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

  const [profile, goals, habits, trackedActivity, fallbackActivity] = await Promise.all([
    getUserInsightProfile(),
    getStoredGoals(),
    getStoredHabits(),
    trackActivity ? recordInsightSession(now) : getInsightActivity(now),
    getInsightActivity(now),
  ]);
  const sessionsPerWeek = Math.max(
    trackedActivity.sessionsPerWeek,
    fallbackActivity.sessionsPerWeek,
  );
  const engine = buildInsightInput({
    profile,
    goals,
    habits,
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
    streak: engine.habitStreak,
    strongestHabit: engine.strongestHabit,
    weakestHabit: engine.weakestHabit,
  });

  await setCachedInsights(result);
  return result;
}
