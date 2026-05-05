import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type { RedZoneItem } from "../../features/insights/types";

type RedZoneCardProps = {
  item: RedZoneItem;
  onPress?: () => void;
};

export function RedZoneCard({ item, onPress }: RedZoneCardProps) {
  return (
    <Pressable
      style={s.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Пункт зони ризику ${item.title}`}
      accessibilityHint="Відкриває підтримувальну підказку для цього слабкого місця"
    >
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.message}>{item.message}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "rgba(109,133,182,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(109,133,182,0.38)",
    borderRadius: 14,
    padding: 12,
    gap: 5,
  },
  title: {
    color: "#d8d3cc",
    fontSize: 13,
    fontWeight: "600",
  },
  message: {
    color: "#8a8a9a",
    fontSize: 12,
    lineHeight: 18,
  },
});
