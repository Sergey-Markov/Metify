/**
 * app/(tabs)/goals.tsx
 *
 * Full Goals screen:
 *   - Category filter tabs
 *   - Priority-sorted goal cards with progress bars
 *   - Goal detail sheet (milestones, days remaining, edit)
 *   - Add-goal bottom sheet with milestone builder
 *   - Completed goals section (collapsible)
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddGoalSheet } from "../../src/components/AddGoalSheet";
import { EmptyGoals } from "../../src/components/EmptyGoals";
import { GoalCard } from "../../src/components/GoalCard";
import { GoalDetailSheet } from "../../src/components/GoalDetailSheet";
import { GoalsOverallProgress } from "../../src/components/GoalsOverallProgress";
import { useGoalActions, useGoalsSummary } from "../../src/hooks/goalsHabits";
import { useGoalsHabitsStore } from "../../src/store/useGoalsHabitsStore";
import type { Goal, GoalCategory, GoalPriority } from "../../src/types/goalsHabits";

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES: { value: GoalCategory | "all"; label: string }[] = [
  { value: "all", label: "Всі" },
  { value: "health", label: "Здоров'я" },
  { value: "career", label: "Кар'єра" },
  { value: "growth", label: "Розвиток" },
  { value: "family", label: "Сім'я" },
  { value: "travel", label: "Подорожі" },
  { value: "other", label: "Інше" },
];

const CAT_COLORS: Record<string, string> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  other: "#8a8a9a",
};

const PRI_RANK: Record<GoalPriority, number> = { high: 0, medium: 1, low: 2 };

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GoalsScreen() {
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
  } = useGoalActions();
  const { avgProgress } = useGoalsSummary();

  const [filterCat, setFilterCat] = useState<GoalCategory | "all">("all");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const filtered = useMemo(
    () =>
      [...activeGoals]
        .filter((g) => filterCat === "all" || g.category === filterCat)
        .sort((a, b) => PRI_RANK[a.priority] - PRI_RANK[b.priority]),
    [activeGoals, filterCat],
  );

  const toggleDone = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDone((v) => !v);
  };

  const openDetail = useCallback((g: Goal) => setSelectedGoal(g), []);
  const closeDetail = useCallback(() => setSelectedGoal(null), []);

  // Sync selectedGoal when store updates (e.g. milestone toggle)
  const liveSelectedGoal = useMemo(
    () =>
      selectedGoal
        ? (activeGoals.find((g) => g.id === selectedGoal.id) ?? selectedGoal)
        : null,
    [selectedGoal, activeGoals],
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
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setShowAdd(true)}
        >
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Overall progress bar */}
      {activeGoals.length > 0 && (
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
          <TouchableOpacity
            key={c.value}
            style={[s.filterChip, filterCat === c.value && s.filterChipActive]}
            onPress={() => setFilterCat(c.value)}
          >
            {c.value !== "all" && (
              <View
                style={[s.filterDot, { backgroundColor: CAT_COLORS[c.value] }]}
              />
            )}
            <Text
              style={[
                s.filterText,
                filterCat === c.value && s.filterTextActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Active goals */}
        {filtered.length === 0 && (
          <EmptyGoals
            onAdd={() => setShowAdd(true)}
            filtered={filterCat !== "all"}
          />
        )}

        {filtered.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onPress={() => openDetail(g)}
            onComplete={() => completeGoal(g.id)}
            onDelete={() => deleteGoal(g.id)}
          />
        ))}

        {/* Completed section */}
        {completedGoals.length > 0 && (
          <View style={s.completedSection}>
            <TouchableOpacity
              style={s.completedToggle}
              onPress={toggleDone}
            >
              <Text style={s.completedToggleText}>
                Виконані цілі ({completedGoals.length})
              </Text>
              <Text style={s.completedArrow}>{showDone ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {showDone &&
              completedGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  completed
                  onDelete={() => deleteGoal(g.id)}
                />
              ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

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
        />
      )}

      {/* Add goal sheet */}
      {showAdd && (
        <AddGoalSheet
          onClose={() => setShowAdd(false)}
          onSave={(draft) => {
            addGoal(draft);
            setShowAdd(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Colors & Styles ─────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(200,169,110,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 22, color: colors.accent, lineHeight: 26 },

  filterRow: { maxHeight: 30, marginVertical: 12 },
  filterContent: {
    flexGrow: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    backgroundColor: colors.bg2,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  filterDot: { width: 5, height: 5, borderRadius: 3 },
  filterText: { fontSize: 12, color: colors.muted },
  filterTextActive: { color: colors.accent },

  scroll: { flex: 1 },

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
