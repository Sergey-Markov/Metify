import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { HabitInsight } from "../../features/insights/types";

type HabitPatternCardProps = {
  data: HabitInsight;
};

export function HabitPatternCard({ data }: HabitPatternCardProps) {
  return (
    <View style={s.card}>
      <View style={s.metricsRow}>
        <MiniStat
          label="Серія"
          value={`${data.streakDays} днів`}
        />
        <MiniStat
          label="Пропущено"
          value={`${data.missedDays} днів`}
        />
      </View>
      <View style={s.pairRow}>
        <Text style={s.pairLabel}>Найсильніша:</Text>
        <Text style={s.pairValue}>{data.strongestHabit}</Text>
      </View>
      <View style={s.pairRow}>
        <Text style={s.pairLabel}>Найслабша:</Text>
        <Text style={s.pairValue}>{data.weakestHabit}</Text>
      </View>
      <Text style={s.rec}>{data.recommendation}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.miniCard}>
      <Text style={s.miniValue}>{value}</Text>
      <Text style={s.miniLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#111318",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#151922",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  miniValue: {
    color: "#f0ede8",
    fontSize: 17,
    fontWeight: "600",
  },
  miniLabel: {
    color: "#8a8a9a",
    fontSize: 11,
    marginTop: 3,
  },
  pairRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  pairLabel: {
    color: "#8a8a9a",
    fontSize: 12,
  },
  pairValue: {
    color: "#d8d3cc",
    fontSize: 12,
    fontWeight: "600",
  },
  rec: {
    color: "#c8a96e",
    fontSize: 13,
    lineHeight: 18,
  },
});
