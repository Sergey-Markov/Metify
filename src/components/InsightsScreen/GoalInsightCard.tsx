import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GoalInsight } from "../../features/insights/types";

type GoalInsightCardProps = {
  goal: GoalInsight;
  onPress?: () => void;
};

export function GoalInsightCard({ goal, onPress }: GoalInsightCardProps) {
  return (
    <Pressable
      style={s.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Інсайт по цілі ${goal.title}`}
      accessibilityHint="Відкриває деталі інсайту по цілі"
    >
      <Text style={s.title}>{goal.title}</Text>
      <Text style={s.progress}>{goal.progressPercent}% виконано</Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${Math.max(0, Math.min(100, goal.progressPercent))}%` }]} />
      </View>
      <Text style={s.projected}>{goal.projectedMessage}</Text>
      <Text style={s.insight}>{goal.insight}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#111318",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  title: {
    color: "#f0ede8",
    fontSize: 16,
    fontWeight: "600",
  },
  progress: {
    color: "#c8a96e",
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1b1f27",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#c8a96e",
  },
  projected: {
    color: "#8a8a9a",
    fontSize: 12,
    lineHeight: 18,
  },
  insight: {
    color: "#d8d3cc",
    fontSize: 13,
    lineHeight: 18,
  },
});
