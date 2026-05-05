import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RecommendedAction } from "../../features/insights/types";

type RecommendedActionCardProps = {
  action: RecommendedAction;
  added: boolean;
  done: boolean;
  onAddToToday: () => void;
  onMarkDone: () => void;
};

export function RecommendedActionCard({
  action,
  added,
  done,
  onAddToToday,
  onMarkDone,
}: RecommendedActionCardProps) {
  return (
    <View style={[s.card, done && s.cardDone]}>
      <Text style={s.title}>{action.title}</Text>
      <Text style={s.note}>{action.note}</Text>
      <View style={s.actionsRow}>
        <Pressable
          style={[s.button, s.addBtn, added && s.addedBtn]}
          onPress={onAddToToday}
          accessibilityRole="button"
          accessibilityLabel={`Додати дію в сьогоднішній план ${action.title}`}
        >
          <Text style={[s.buttonText, s.addText]}>{added ? "Додано" : "Додати на сьогодні"}</Text>
        </Pressable>
        <Pressable
          style={[s.button, s.doneBtn, done && s.doneBtnActive]}
          onPress={onMarkDone}
          accessibilityRole="button"
          accessibilityLabel={`Позначити дію як виконану ${action.title}`}
        >
          <Text style={[s.buttonText, done && s.doneBtnTextActive]}>
            {done ? "Виконано" : "Позначити виконаним"}
          </Text>
        </Pressable>
      </View>
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
  cardDone: {
    borderColor: "rgba(200,169,110,0.65)",
    backgroundColor: "rgba(200,169,110,0.09)",
  },
  title: {
    color: "#f0ede8",
    fontSize: 15,
    fontWeight: "600",
  },
  note: {
    color: "#8a8a9a",
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
  },
  addBtn: {
    borderColor: "#3a3d4a",
    backgroundColor: "#151922",
  },
  addedBtn: {
    borderColor: "rgba(200,169,110,0.8)",
    backgroundColor: "rgba(200,169,110,0.2)",
  },
  doneBtn: {
    borderColor: "rgba(200,169,110,0.8)",
    backgroundColor: "#c8a96e",
  },
  doneBtnActive: {
    borderColor: "rgba(200,169,110,0.8)",
    backgroundColor: "rgba(200,169,110,0.2)",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0a0b0f",
  },
  addText: {
    color: "#d8d3cc",
  },
  doneBtnTextActive: {
    color: "#d8d3cc",
  },
});
