import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DailyInsight } from "../../features/insights/types";

type InsightHeroCardProps = {
  insight: DailyInsight;
  onPressDetails: () => void;
};

export function InsightHeroCard({ insight, onPressDetails }: InsightHeroCardProps) {
  return (
    <View style={s.card}>
      <View style={s.gradientGlow} />
      <Text style={s.label}>{insight.label}</Text>
      <Text style={s.mainText}>{insight.text}</Text>
      <View style={s.footerRow}>
        <View
          style={s.badge}
          accessibilityLabel={`Insight source ${insight.badge}`}
        >
          <Text style={s.badgeText}>{insight.badge}</Text>
        </View>
        <Pressable
          style={s.ctaButton}
          onPress={onPressDetails}
          accessibilityRole="button"
          accessibilityLabel="Переглянути деталі інсайту"
          accessibilityHint="Відкриває модальне вікно з деталями інсайту дня"
        >
          <Text style={s.ctaText}>Переглянути деталі</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#121520",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.28)",
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
  },
  gradientGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  label: {
    color: "#c8a96e",
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "600",
  },
  mainText: {
    color: "#f0ede8",
    fontSize: 19,
    lineHeight: 27,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    backgroundColor: "rgba(240,237,232,0.08)",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#8a8a9a",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  ctaButton: {
    backgroundColor: "#c8a96e",
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: {
    color: "#0a0b0f",
    fontSize: 13,
    fontWeight: "700",
  },
});
