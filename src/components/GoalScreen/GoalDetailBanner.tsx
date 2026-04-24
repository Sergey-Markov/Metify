import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import type { Goal, GoalCategory, GoalPriority } from "../../types/goalsHabits";
import { daysUntilGoal } from "../../utils/goalsHabits";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  red: "#e05a5a",
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
  detailBanner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  detailTopRow: {
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
  priIcon: { fontSize: 13, fontWeight: "500" },
  detailTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  detailStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 4,
  },
  detailStat: { flex: 1, alignItems: "center" },
  detailStatVal: { fontFamily: SERIF, fontSize: 22, color: colors.text },
  detailStatLabel: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: 2,
  },
  detailDivider: { width: 0.5, height: 36, backgroundColor: colors.subtle },
  progressTrack: {
    height: 3,
    backgroundColor: colors.subtle,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#c8a96e",
    borderRadius: 2,
  },
});

export type GoalDetailBannerProps = {
  goal: Goal;
};

export const GoalDetailBanner = ({ goal }: GoalDetailBannerProps) => {
  const catColor = CAT_COLORS[goal.category] ?? colors.muted;
  const daysLeft = daysUntilGoal(goal);
  const doneMiles = goal.milestones.filter((m) => m.completed).length;

  return (
    <View style={[styles.detailBanner, { backgroundColor: catColor + "14" }]}>
      <View style={styles.detailTopRow}>
        <View
          style={[
            styles.catPill,
            {
              backgroundColor: catColor + "20",
              borderColor: catColor + "40",
            },
          ]}
        >
          <View style={[styles.catPillDot, { backgroundColor: catColor }]} />
          <Text style={[styles.catPillText, { color: catColor }]}>
            {CATEGORY_LABELS[goal.category]}
          </Text>
        </View>
        <Text style={[styles.priIcon, { color: PRI_COLORS[goal.priority] }]}>
          {PRI_LABELS[goal.priority]}{" "}
          {goal.priority === "high"
            ? "Важливо"
            : goal.priority === "medium"
              ? "Середньо"
              : "Низьке"}
        </Text>
      </View>
      <Text style={styles.detailTitle}>{goal.title}</Text>

      <View style={styles.detailStats}>
        <View style={styles.detailStat}>
          <Text style={[styles.detailStatVal, { color: catColor }]}>
            {goal.progress}%
          </Text>
          <Text style={styles.detailStatLabel}>Прогрес</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailStat}>
          <Text style={styles.detailStatVal}>
            {doneMiles}/{goal.milestones.length}
          </Text>
          <Text style={styles.detailStatLabel}>Кроків</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailStat}>
          <Text
            style={[
              styles.detailStatVal,
              daysLeft === 0 && { color: colors.red },
            ]}
          >
            {daysLeft === null ? "—" : daysLeft === 0 ? "!" : daysLeft}
          </Text>
          <Text style={styles.detailStatLabel}>
            {daysLeft === 0 ? "Прострочено" : "Днів"}
          </Text>
        </View>
      </View>

      <View style={[styles.progressTrack, { marginTop: 8, height: 4 }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${goal.progress}%`, backgroundColor: catColor },
          ]}
        />
      </View>
    </View>
  );
};
