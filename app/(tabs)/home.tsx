/**
 * app/(tabs)/home.tsx
 *
 * Purely presentational. All logic delegated to hooks.
 */

import React, { memo } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLifeGrid, useAppStats } from "../../src/hooks";
import type { WeekCell, CountdownTime } from "../../src/types";

export default function HomeScreen() {
  const { countdown, motivation, morningsLeft, percentLived, livedWeeks, totalWeeks } =
    useAppStats();
  const { cells } = useLifeGrid();

  const today = new Date().toLocaleDateString("uk-UA", { day: "numeric", month: "long" });

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.greeting}>Сьогодні · {today}</Text>
        </View>

        <View style={s.timerSection}>
          <Text style={s.timerLabel}>Залишилось часу</Text>
          {countdown ? (
            <TimerGrid countdown={countdown} />
          ) : (
            <Text style={s.timerLoading}>Обчислення...</Text>
          )}
        </View>

        <View style={s.motivCard}>
          <Text style={s.motivQuote}>{motivation.quote}</Text>
          <Text style={s.motivSub}>
            {morningsLeft > 0
              ? `У вас ще є ${morningsLeft.toLocaleString("uk-UA")} ранків попереду`
              : motivation.sub}
          </Text>
        </View>

        <View style={s.statsRow}>
          <StatCard value={morningsLeft.toLocaleString("uk-UA")} label="Ранків попереду" />
          <StatCard value={`${percentLived}%`} label="Прожито" />
        </View>

        <View style={s.gridSection}>
          <View style={s.gridHeader}>
            <Text style={s.gridTitle}>Тижні життя</Text>
            <Text style={s.gridMeta}>
              {(totalWeeks - livedWeeks).toLocaleString("uk-UA")}/
              {totalWeeks.toLocaleString("uk-UA")} залишилось
            </Text>
          </View>
          <WeeksGrid cells={cells} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TimerGrid = memo(function TimerGrid({ countdown }: { countdown: CountdownTime }) {
  return (
  <View style={s.timerGrid}>
    <TimerUnit value={countdown.years} label="років" />
    <TimerUnit value={countdown.months} label="місяців" />
    <TimerUnit value={countdown.days} label="днів" />
    <TimerUnit value={countdown.hours} label="годин" />
  </View>
  );
});

const TimerUnit = memo(function TimerUnit({ value, label }: { value: number; label: string }) {
  return (
  <View style={s.timerUnit}>
    <Text style={s.timerVal}>{value}</Text>
    <Text style={s.timerKey}>{label}</Text>
  </View>
  );
});

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLbl}>{label}</Text>
    </View>
  );
}

const WeeksGrid = memo(function WeeksGrid({ cells }: { cells: WeekCell[] }) {
  return (
  <View style={s.weeksContainer}>
    {cells.map((cell) => (
      <View
        key={cell.index}
        style={[
          s.weekDot,
          cell.state === "past" && s.weekDotPast,
          cell.state === "current" && s.weekDotCurrent,
        ]}
      />
    ))}
  </View>
  );
});

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  accent2: "#e8c98a",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 12,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase",
  },

  timerSection: { paddingHorizontal: 28, paddingVertical: 20 },
  timerLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: colors.accent,
    textTransform: "uppercase",
    marginBottom: 16,
    fontWeight: "500",
  },
  timerGrid: { flexDirection: "row", gap: 8 },
  timerUnit: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
  },
  timerVal: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 26,
    color: colors.text,
    lineHeight: 28,
  },
  timerKey: {
    fontSize: 9,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase",
    marginTop: 4,
  },
  timerLoading: { fontSize: 14, color: colors.muted, textAlign: "center", paddingVertical: 20 },

  motivCard: {
    marginHorizontal: 28,
    marginBottom: 12,
    backgroundColor: "rgba(200,169,110,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.2)",
    borderRadius: 16,
    padding: 18,
  },
  motivQuote: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  motivSub: { fontSize: 12, color: colors.muted },

  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 28, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  statVal: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 22,
    color: colors.text,
  },
  statLbl: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: "uppercase",
    marginTop: 2,
  },

  gridSection: { paddingHorizontal: 28, marginBottom: 28 },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  gridMeta: { fontSize: 11, color: colors.accent },
  weeksContainer: { flexDirection: "row", flexWrap: "wrap", gap: 1.5 },
  weekDot: { width: 5, height: 5, borderRadius: 1, backgroundColor: colors.subtle },
  weekDotPast: { backgroundColor: colors.accent, opacity: 0.7 },
  weekDotCurrent: { backgroundColor: colors.accent2 },
});
