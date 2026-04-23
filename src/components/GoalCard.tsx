import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Goal, GoalCategory, GoalPriority } from "../types/goalsHabits";
import { daysUntilGoal } from "../utils/goalsHabits";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg2: "#111318",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
  red: "#e05a5a",
  accent: "#c8a96e",
};

const CAT_COLORS: Record<string, string> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  creative: "#a78bfa",
  other: "#8a8a9a",
};

const PRI_LABELS: Record<GoalPriority, string> = {
  high: "●",
  medium: "◐",
  low: "○",
};

const PRI_COLORS: Record<GoalPriority, string> = {
  high: "#e05a5a",
  medium: "#c8a96e",
  low: "#8a8a9a",
};

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  health: "Здоров'я",
  family: "Сім'я",
  career: "Кар'єра",
  growth: "Розвиток",
  travel: "Подорожі",
  finance: "Фінанси",
  creative: "Творчість",
  other: "Інше",
};

const styles = StyleSheet.create({
  goalCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  goalCardDone: { opacity: 0.5 },
  goalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  catPillDot: { width: 5, height: 5, borderRadius: 3 },
  catPillText: { fontSize: 10, letterSpacing: 1, fontWeight: "500" },
  goalCardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  priIcon: { fontSize: 13, fontWeight: "500" },
  doneTag: { fontSize: 10, color: colors.green, letterSpacing: 1 },
  goalTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  goalTitleDone: { color: colors.muted },
  goalMeta: { flexDirection: "row", gap: 12, marginBottom: 10 },
  goalDays: { fontSize: 11, color: colors.muted },
  goalMiles: { fontSize: 11, color: colors.muted },
  progressTrack: {
    height: 3,
    backgroundColor: colors.subtle,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPct: { fontSize: 11, color: colors.muted },
  completeBtn: {
    backgroundColor: "rgba(78,203,141,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "rgba(78,203,141,0.3)",
  },
  completeBtnText: { fontSize: 11, color: colors.green },
});

export type GoalCardProps = {
  goal: Goal;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  completed?: boolean;
};

export const GoalCard = ({
  goal,
  onPress,
  onComplete,
  completed,
}: GoalCardProps) => {
  const catColor = CAT_COLORS[goal.category] ?? colors.muted;
  const daysLeft = daysUntilGoal(goal);
  const overdue = daysLeft === 0 && goal.progress < 100;
  const doneMiles = goal.milestones.filter((m) => m.completed).length;
  const categoryLabel = CATEGORY_LABELS[goal.category];

  return (
    <TouchableOpacity
      style={[styles.goalCard, completed && styles.goalCardDone]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.goalCardTop}>
        <View
          style={[
            styles.catPill,
            { backgroundColor: catColor + "18", borderColor: catColor + "40" },
          ]}
        >
          <View style={[styles.catPillDot, { backgroundColor: catColor }]} />
          <Text style={[styles.catPillText, { color: catColor }]}>
            {categoryLabel}
          </Text>
        </View>
        <View style={styles.goalCardActions}>
          {!completed && (
            <Text style={[styles.priIcon, { color: PRI_COLORS[goal.priority] }]}>
              {PRI_LABELS[goal.priority]}
            </Text>
          )}
          {completed && <Text style={styles.doneTag}>✓ Виконано</Text>}
        </View>
      </View>

      <Text style={[styles.goalTitle, completed && styles.goalTitleDone]}>
        {goal.title}
      </Text>

      <View style={styles.goalMeta}>
        {daysLeft !== null && !completed && (
          <Text style={[styles.goalDays, overdue && { color: colors.red }]}>
            {overdue
              ? "⚠ Термін минув"
              : daysLeft === 0
                ? "Сьогодні!"
                : `${daysLeft} днів залишилось`}
          </Text>
        )}
        {goal.milestones.length > 0 && (
          <Text style={styles.goalMiles}>
            {doneMiles}/{goal.milestones.length} кроків
          </Text>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${goal.progress}%`,
              backgroundColor: completed ? colors.green : catColor,
            },
          ]}
        />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressPct}>{goal.progress}%</Text>
        {!completed && onComplete && goal.progress === 100 && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={onComplete}
          >
            <Text style={styles.completeBtnText}>Закрити ціль ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
