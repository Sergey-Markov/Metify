import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { GoalCategory } from "../types/goalsHabits";

const colors = {
  bg2: "#111318",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
};

const CAT_COLORS: Partial<Record<GoalCategory, string>> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  creative: "#a78bfa",
  other: "#8a8a9a",
};

const styles = StyleSheet.create({
  chip: {
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
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 12, color: colors.muted },
  textActive: { color: colors.accent },
});

export type GoalCategoryActiveTone = "accent" | "category";

export type GoalCategoryFilterChipProps = {
  value: GoalCategory | "all";
  label: string;
  active: boolean;
  onPress: () => void;
  /** `"accent"` — як на екрані фільтра; `"category"` — бордер/текст кольором категорії (форма додавання цілі). */
  activeTone?: GoalCategoryActiveTone;
  style?: StyleProp<ViewStyle>;
};

export const GoalCategoryFilterChip = ({
  value,
  label,
  active,
  onPress,
  activeTone = "accent",
  style,
}: GoalCategoryFilterChipProps) => {
  const catTint =
    active &&
    activeTone === "category" &&
    value !== "all" &&
    (CAT_COLORS[value] ?? colors.muted);

  const chipStyle = [
    styles.chip,
    catTint
      ? {
          borderColor: catTint,
          backgroundColor: `${catTint}18`,
        }
      : active && styles.chipActive,
    style,
  ];

  const labelStyle = [
    styles.text,
    catTint ? { color: catTint } : active && styles.textActive,
  ];

  return (
    <TouchableOpacity
      style={chipStyle}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {value !== "all" && (
        <View
          style={[
            styles.dot,
            { backgroundColor: CAT_COLORS[value] ?? colors.muted },
          ]}
        />
      )}
      <Text style={labelStyle}>{label}</Text>
    </TouchableOpacity>
  );
};
