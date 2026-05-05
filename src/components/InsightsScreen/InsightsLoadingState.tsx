import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type InsightsLoadingStateProps = {
  message: string;
};

export const InsightsLoadingState = ({ message }: InsightsLoadingStateProps) => {
  return (
    <View style={s.centerState}>
      <ActivityIndicator color="#c8a96e" />
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
