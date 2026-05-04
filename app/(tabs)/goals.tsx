/**
 * app/(tabs)/goals.tsx
 *
 * Full Goals screen:
 *   - Category filter tabs
 *   - Priority-sorted goal cards with progress bars
 *   - Goal detail sheet (milestones, days remaining, edit)
 *   - Add-goal bottom sheet with milestone builder
 *   - Completed goals (той самий фільтр категорій + чіп «Виконані»)
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddGoalSheet } from "../../src/components/GoalScreen/AddGoalSheet";
import { EmptyGoals } from "../../src/components/GoalScreen/EmptyGoals";
import { GoalCard } from "../../src/components/GoalScreen/GoalCard";
import { GoalCategoryFilterChip } from "../../src/components/GoalScreen/GoalCategoryFilterChip";
import { GoalDetailSheet } from "../../src/components/GoalScreen/GoalDetailSheet";
import { GoalsOverallProgress } from "../../src/components/GoalScreen/GoalsOverallProgress";
import { useGoalActions, useGoalsSummary } from "../../src/hooks/goalsHabits";
import { useGoalsHabitsStore } from "../../src/store/useGoalsHabitsStore";
import type {
  Goal,
  GoalCategory,
  GoalPriority,
} from "../../src/types/goalsHabits";
import { BtnIcon } from "../../src/UI/BtnIcon";
import { computeGoalProgress } from "../../src/utils/goalsHabits";

// ─── Config ───────────────────────────────────────────────────────────────────

type GoalsFilter = GoalCategory | "all" | "completed";

const CATEGORIES: { value: GoalsFilter; label: string }[] = [
  { value: "all", label: "Всі" },
  { value: "completed", label: "Виконані" },
  { value: "career", label: "Кар'єра" },
  { value: "growth", label: "Розвиток" },
  { value: "health", label: "Здоров'я" },
  { value: "travel", label: "Подорожі" },
  { value: "family", label: "Сім'я" },
  { value: "other", label: "Інше" },
];

const PRI_RANK: Record<GoalPriority, number> = { high: 0, medium: 1, low: 2 };

function sortCompletedDesc(a: Goal, b: Goal): number {
  const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
  const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
  return tb - ta;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const GoalsScreen = () => {
  const goals = useGoalsHabitsStore((s) => s.goals);
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed"),
    [goals],
  );
  const {
    addGoal,
    updateGoal,
    completeGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    updateMilestoneTitle,
    deleteMilestone,
  } = useGoalActions();
  const { avgProgress } = useGoalsSummary();

  const [filterCat, setFilterCat] = useState<GoalsFilter>("all");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDone, setShowDone] = useState(false);

  const requestDeleteGoal = useCallback(
    (id: string) => {
      Alert.alert("Видалити ціль?", "Цю дію не можна скасувати.", [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: () => deleteGoal(id),
        },
      ]);
    },
    [deleteGoal],
  );

  const reopenGoal = useCallback(
    (g: Goal) => {
      updateGoal(g.id, {
        status: "active",
        completedAt: undefined,
        progress: computeGoalProgress(g),
      });
    },
    [updateGoal],
  );

  const filtered = useMemo(() => {
    if (filterCat === "completed") return [];
    return [...activeGoals]
      .filter((g) => filterCat === "all" || g.category === filterCat)
      .sort((a, b) => PRI_RANK[a.priority] - PRI_RANK[b.priority]);
  }, [activeGoals, filterCat]);

  const filteredCompleted = useMemo(() => {
    if (filterCat === "completed") {
      return [...completedGoals].sort(sortCompletedDesc);
    }
    return completedGoals
      .filter((g) => filterCat === "all" || g.category === filterCat)
      .sort(sortCompletedDesc);
  }, [completedGoals, filterCat]);

  const toggleDone = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDone((v) => !v);
  };

  const openDetail = useCallback((g: Goal) => setSelectedGoal(g), []);
  const closeDetail = useCallback(() => setSelectedGoal(null), []);

  type GoalsListItem =
    | { type: "goal"; key: string; goal: Goal; completed?: boolean }
    | { type: "empty-active"; key: string }
    | { type: "empty-completed"; key: string }
    | { type: "toggle-completed"; key: string; count: number }
    | { type: "spacer"; key: string };

  const listData = useMemo<GoalsListItem[]>(() => {
    const items: GoalsListItem[] = [];

    if (filterCat === "completed") {
      if (filteredCompleted.length === 0) {
        items.push({ type: "empty-completed", key: "empty-completed" });
      } else {
        for (const goal of filteredCompleted) {
          items.push({
            type: "goal",
            key: `completed-${goal.id}`,
            goal,
            completed: true,
          });
        }
      }
      items.push({ type: "spacer", key: "spacer" });
      return items;
    }

    if (filtered.length === 0) {
      items.push({ type: "empty-active", key: "empty-active" });
    } else {
      for (const goal of filtered) {
        items.push({ type: "goal", key: `active-${goal.id}`, goal });
      }
    }

    if (filteredCompleted.length > 0) {
      items.push({
        type: "toggle-completed",
        key: "toggle-completed",
        count: filteredCompleted.length,
      });

      if (showDone) {
        for (const goal of filteredCompleted) {
          items.push({
            type: "goal",
            key: `collapsed-completed-${goal.id}`,
            goal,
            completed: true,
          });
        }
      }
    }

    items.push({ type: "spacer", key: "spacer" });
    return items;
  }, [filterCat, filtered, filteredCompleted, showDone]);

  const renderListItem = useCallback(
    ({ item }: { item: GoalsListItem }) => {
      if (item.type === "goal") {
        if (item.completed) {
          return (
            <GoalCard
              goal={item.goal}
              completed
              onPress={() => openDetail(item.goal)}
              onReopen={() => reopenGoal(item.goal)}
              onDelete={() => requestDeleteGoal(item.goal.id)}
            />
          );
        }

        return (
          <GoalCard
            goal={item.goal}
            onPress={() => openDetail(item.goal)}
            onComplete={() => completeGoal(item.goal.id)}
            onEdit={() => setEditingGoal(item.goal)}
            onDelete={() => requestDeleteGoal(item.goal.id)}
          />
        );
      }

      if (item.type === "empty-active") {
        return (
          <EmptyGoals
            onAdd={() => setShowAdd(true)}
            filtered={filterCat !== "all"}
          />
        );
      }

      if (item.type === "empty-completed") {
        return (
          <EmptyGoals
            onAdd={() => setShowAdd(true)}
            completedEmpty
          />
        );
      }

      if (item.type === "toggle-completed") {
        return (
          <View style={s.completedSection}>
            <TouchableOpacity
              style={s.completedToggle}
              onPress={toggleDone}
            >
              <Text style={s.completedToggleText}>
                Виконані цілі ({item.count})
              </Text>
              <Text style={s.completedArrow}>{showDone ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return <View style={s.listSpacer} />;
    },
    [
      completeGoal,
      filterCat,
      openDetail,
      reopenGoal,
      requestDeleteGoal,
      showDone,
      toggleDone,
    ],
  );

  // Sync selectedGoal when store updates (e.g. milestone toggle)
  const liveSelectedGoal = useMemo(
    () =>
      selectedGoal
        ? (goals.find((g) => g.id === selectedGoal.id) ?? selectedGoal)
        : null,
    [selectedGoal, goals],
  );

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top"]}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Фокус на важливому</Text>
          <Text style={s.headerTitle}>Цілі</Text>
        </View>
        <BtnIcon
          onPress={() => setShowAdd(true)}
          accessibilityLabel="Додати ціль"
        />
      </View>

      {/* Overall progress bar */}
      {activeGoals.length > 0 && filterCat !== "completed" && (
        <GoalsOverallProgress avgProgress={avgProgress} />
      )}

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={s.filterContent}
      >
        {CATEGORIES.map((c) => (
          <GoalCategoryFilterChip
            key={c.value}
            value={c.value}
            label={c.label}
            active={filterCat === c.value}
            onPress={() => setFilterCat(c.value)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
      />

      {/* Goal detail sheet */}
      {liveSelectedGoal && (
        <GoalDetailSheet
          goal={liveSelectedGoal}
          onClose={closeDetail}
          onComplete={() => {
            completeGoal(liveSelectedGoal.id);
            closeDetail();
          }}
          onToggleMilestone={(mid) => toggleMilestone(liveSelectedGoal.id, mid)}
          onAddMilestone={(title) => addMilestone(liveSelectedGoal.id, title)}
          onUpdateMilestoneTitle={(mid, title) =>
            updateMilestoneTitle(liveSelectedGoal.id, mid, title)
          }
          onDeleteMilestone={(mid) => deleteMilestone(liveSelectedGoal.id, mid)}
        />
      )}

      {/* Add goal sheet */}
      {(showAdd || editingGoal) && (
        <AddGoalSheet
          key={editingGoal ? `edit-${editingGoal.id}` : "add"}
          initialGoal={editingGoal ?? undefined}
          onClose={() => {
            setShowAdd(false);
            setEditingGoal(null);
          }}
          onSave={(draft) => {
            if (editingGoal) {
              const next: Goal = {
                ...editingGoal,
                title: draft.title,
                category: draft.category,
                priority: draft.priority,
                targetDate: draft.targetDate,
                description: draft.description,
                milestones: draft.milestones,
              };
              updateGoal(editingGoal.id, {
                ...draft,
                progress: computeGoalProgress(next),
              });
              setEditingGoal(null);
            } else {
              addGoal(draft);
              setShowAdd(false);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default GoalsScreen;
// ─── Colors & Styles ─────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: SERIF, fontSize: 32, color: colors.text },

  filterRow: { maxHeight: 30, marginVertical: 12 },
  filterContent: {
    flexGrow: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },

  listSpacer: { height: 40 },

  // Completed section
  completedSection: { paddingHorizontal: 24, marginBottom: 12 },
  completedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.subtle,
  },
  completedToggleText: { fontSize: 12, color: colors.muted, letterSpacing: 1 },
  completedArrow: { fontSize: 10, color: colors.muted },
});
