import type {
  GoalInsight,
  HabitInsight,
  InsightsResult,
  LifeBalanceItem,
  RedZoneItem,
  RecommendedAction,
} from "./types";

export interface InsightsViewModel {
  heroText: string;
  lifeBalanceItems: LifeBalanceItem[];
  goalCard: GoalInsight;
  habitCard: HabitInsight;
  redZoneItems: RedZoneItem[];
  recommendedActions: RecommendedAction[];
}

export function buildInsightsViewModel(insights: InsightsResult): InsightsViewModel {
  const lifeBalanceItems: LifeBalanceItem[] = [
    {
      id: "focus",
      title: "Фокус",
      percent: insights.lifeBalance.focusScore,
      tone: "accent",
    },
    {
      id: "activity",
      title: "Активність",
      percent: insights.lifeBalance.activityScore,
      tone: "soft",
    },
    {
      id: "wasted",
      title: "Втрачений час",
      percent: Math.min(100, insights.lifeBalance.wastedTimeEstimate),
      tone: "neutral",
    },
  ].sort((a, b) => b.percent - a.percent);

  const goalCard: GoalInsight = {
    id: "goals-summary",
    title: "Загальний прогрес цілей",
    progressPercent: insights.goals.progress,
    projectedMessage: `Очікуваний прогрес: ${insights.goals.expectedProgress}%. Відставання: ${insights.goals.delay}%.`,
    insight: insights.goals.summary,
  };

  const habitCard: HabitInsight = {
    streakDays: insights.habits.streak,
    missedDays: insights.habits.missedHabits,
    strongestHabit: insights.habits.strongestHabit,
    weakestHabit: insights.habits.weakestHabit,
    recommendation: insights.habits.summary,
  };

  const redZoneItems: RedZoneItem[] = insights.redZone.map((message, index) => ({
    id: `red-zone-${index}`,
    title: `Фокус ${index + 1}`,
    message,
  }));

  const recommendedActions: RecommendedAction[] = insights.recommendations.map(
    (title, index) => ({
      id: `recommendation-${index}`,
      title,
      note: "Виконайте цю дію сьогодні, щоб закріпити прогрес.",
    }),
  );

  return {
    heroText: insights.hero,
    lifeBalanceItems,
    goalCard,
    habitCard,
    redZoneItems,
    recommendedActions,
  };
}
