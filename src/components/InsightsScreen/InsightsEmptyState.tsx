import React from "react";
import { StyleSheet, Text, View } from "react-native";

type InsightsEmptyStateProps = {
  message: string;
};

export const InsightsEmptyState = ({ message }: InsightsEmptyStateProps) => {
  return (
    <View style={s.centerState}>
      <Text style={s.stateText}>{message}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    color: "#8a8a9a",
    fontSize: 14,
    textAlign: "center",
  },
});
