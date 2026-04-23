import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  accent: "#c8a96e",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
};

const styles = StyleSheet.create({
  row: { paddingHorizontal: 24, paddingBottom: 10 },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  pct: {
    fontFamily: SERIF,
    fontSize: 18,
    color: colors.accent,
    marginBottom: 6,
  },
  track: {
    height: 2,
    backgroundColor: colors.subtle,
    borderRadius: 1,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
});

type GoalsOverallProgressProps = {
  avgProgress: number;
};

export const GoalsOverallProgress = ({
  avgProgress,
}: GoalsOverallProgressProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Середній прогрес</Text>
      <Text style={styles.pct}>{avgProgress}%</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: `${avgProgress}%` }]} />
      </View>
    </View>
  );
};
