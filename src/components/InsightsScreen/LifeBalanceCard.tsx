import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { LifeBalanceItem } from "../../features/insights/types";

type LifeBalanceCardProps = {
  item: LifeBalanceItem;
};

const BAR_TONE: Record<LifeBalanceItem["tone"], string> = {
  accent: "#c8a96e",
  neutral: "#8a8a9a",
  soft: "#6d85b6",
};

export function LifeBalanceCard({ item }: LifeBalanceCardProps) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.percent}>{item.percent}%</Text>
      </View>
      <View style={s.track}>
        <View
          style={[
            s.fill,
            { width: `${Math.max(0, Math.min(100, item.percent))}%`, backgroundColor: BAR_TONE[item.tone] },
          ]}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#111318",
    borderWidth: 0.5,
    borderColor: "#3a3d4a",
    borderRadius: 14,
    padding: 12,
    gap: 9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#f0ede8",
    fontSize: 14,
  },
  percent: {
    color: "#8a8a9a",
    fontSize: 12,
  },
  track: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#1b1f27",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
