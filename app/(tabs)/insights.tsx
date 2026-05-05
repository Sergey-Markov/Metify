import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoalInsightCard } from "../../src/components/InsightsScreen/GoalInsightCard";
import { HabitPatternCard } from "../../src/components/InsightsScreen/HabitPatternCard";
import { InsightsEmptyState } from "../../src/components/InsightsScreen/InsightsEmptyState";
import { InsightsBalanceDetailsModal } from "../../src/components/InsightsScreen/InsightsBalanceDetailsModal";
import { InsightsErrorState } from "../../src/components/InsightsScreen/InsightsErrorState";
import { InsightHeroCard } from "../../src/components/InsightsScreen/InsightHeroCard";
import { InsightsLoadingState } from "../../src/components/InsightsScreen/InsightsLoadingState";
import { RecommendedActionCard } from "../../src/components/InsightsScreen/RecommendedActionCard";
import { RecommendedActionsPlaceholder } from "../../src/components/InsightsScreen/RecommendedActionsPlaceholder";
import { RedZoneCard } from "../../src/components/InsightsScreen/RedZoneCard";
import { useGoalsHabitsStore } from "../../src/features/goals-habits/store";
import { buildInsightsViewModel } from "../../src/features/insights/presenter";
import { useInsights } from "../../src/hooks";
import { Btn } from "../../src/UI/Btn";

export default function InsightsScreen() {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const { insights, isLoading, error, refresh } = useInsights();
  const todayActions = useGoalsHabitsStore((s) => s.todayActions);
  const addTodayAction = useGoalsHabitsStore((s) => s.addTodayAction);
  const completeTodayAction = useGoalsHabitsStore((s) => s.completeTodayAction);

  const viewModel = useMemo(
    () => (insights ? buildInsightsViewModel(insights) : null),
    [insights],
  );
  const updatedAtLabel = useMemo(() => {
    if (!insights?.generatedAt) return "";
    const date = new Date(insights.generatedAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [insights?.generatedAt]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const availableRecommendedActions = viewModel?.recommendedActions.filter((action) => {
    const persistedAction = todayActions.find(
      (item) => item.date === todayKey && item.title === action.title,
    );
    return !persistedAction;
  }) ?? [];

  if (isLoading && !insights) {
    return (
      <SafeAreaView
        style={s.safe}
        edges={["top"]}
      >
        <InsightsLoadingState message="Збираємо персональні інсайти..." />
      </SafeAreaView>
    );
  }

  if (error && !insights) {
    return (
      <SafeAreaView
        style={s.safe}
        edges={["top"]}
      >
        <InsightsErrorState message={error} onRetry={() => void refresh(true)} />
      </SafeAreaView>
    );
  }

  if (!insights || !viewModel) {
    return (
      <SafeAreaView
        style={s.safe}
        edges={["top"]}
      >
        <InsightsEmptyState message="Поки що немає інсайтів для відображення." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top"]}
    >
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.headerSub}>Особиста рефлексія</Text>
          <Text style={s.headerTitle}>Інсайти</Text>
          <Text style={s.headerText}>
            Спокійна ясність про те, як ви насправді живете.
          </Text>
          <View style={s.refreshControlsWrap}>
            <Btn
              variant="accent"
              onPress={() => void refresh(true)}
              accessibilityLabel="Спробувати завантажити інсайти ще раз"
            >
              Оновити
            </Btn>
            {updatedAtLabel ? (
              <Text style={s.updatedAtText}>Оновлено: {updatedAtLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={s.section}>
          <InsightHeroCard
            insight={{
              label: "Інсайт дня",
              text: viewModel.heroText,
              badge: "AI-рефлексія",
            }}
            onPressDetails={() => setShowDetails(true)}
          />
        </View>

        <SectionTitle title="Прогрес цілей" />
        <View style={s.section}>
          <GoalInsightCard goal={viewModel.goalCard} />
        </View>

        <SectionTitle title="Поведінка звичок" />
        <View style={s.section}>
          <HabitPatternCard data={viewModel.habitCard} />
        </View>

        <SectionTitle title="Зона ризику" />
        <View style={s.section}>
          <View style={s.stack}>
            {viewModel.redZoneItems.map((item) => (
              <RedZoneCard
                key={item.id}
                item={item}
              />
            ))}
          </View>
        </View>

        <SectionTitle title="Рекомендовані дії" />
        <View style={[s.section, s.lastSection]}>
          <View style={s.stack}>
            {availableRecommendedActions.length > 0 ? (
              availableRecommendedActions.map((action) => {
              const persistedAction = todayActions.find(
                (item) => item.date === todayKey && item.title === action.title,
              );
              const done = persistedAction?.status === "done";
              return (
                <RecommendedActionCard
                  key={action.id}
                  action={action}
                  done={done}
                  onAddToToday={() => addTodayAction(action.title)}
                  onMarkDone={() => {
                    if (persistedAction) {
                      completeTodayAction(persistedAction.id);
                    }
                  }}
                />
              );
              })
            ) : (
              <RecommendedActionsPlaceholder
                onGoToTimer={() => router.push("/(tabs)/home")}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <InsightsBalanceDetailsModal
        visible={showDetails}
        lifeBalanceItems={viewModel.lifeBalanceItems}
        wastedTimeEstimate={insights.lifeBalance.wastedTimeEstimate}
        onClose={() => setShowDetails(false)}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0b0f" },
  scroll: { flex: 1 },
  content: { paddingBottom: 28, gap: 12 },
  refreshControlsWrap: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerSub: {
    color: "#8a8a9a",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    color: "#f0ede8",
    fontSize: 33,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  headerText: {
    color: "#8a8a9a",
    fontSize: 13,
    marginTop: 6,
  },
  refreshButton: {
    marginTop: 12,
    minHeight: 36,
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    backgroundColor: "#111318",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  refreshButtonText: {
    color: "#d8d3cc",
    fontSize: 12,
    fontWeight: "600",
  },
  updatedAtText: {
    color: "#8a8a9a",
    fontSize: 11,
    marginTop: 6,
  },
  sectionTitle: {
    color: "#8a8a9a",
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 24,
  },
  lastSection: {
    paddingBottom: 6,
  },
  stack: {
    gap: 10,
  },
});
