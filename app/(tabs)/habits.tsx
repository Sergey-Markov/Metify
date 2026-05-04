/**
 * app/(tabs)/habits.tsx
 *
 * Full Habits screen:
 *   - Agenda calendar (week / expandable month) + day summary
 *   - Daily progress ring
 *   - Habit list with swipe-to-delete (Reanimated)
 *   - Per-habit detail sheet (streak chart + stats)
 *   - Add-habit bottom sheet
 */

import React, { useCallback, useState } from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddHabitSheet } from "../../src/components/HabitsScreen/AddHabitSheet";
import { EmptyHabits } from "../../src/components/HabitsScreen/EmptyHabits";
import { HabitCard } from "../../src/components/HabitsScreen/HabitCard";
import { HabitDetailSheet } from "../../src/components/HabitsScreen/HabitDetailSheet";
import { HabitsAgenda } from "../../src/components/HabitsScreen/HabitsAgenda";
import { useHabitActions, useHabitsToday } from "../../src/hooks/goalsHabits";
import type { Habit } from "../../src/types/goalsHabits";
import { BtnIcon } from "../../src/UI/BtnIcon";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const { habits, pending, done } = useHabitsToday();
  const { checkHabit, addHabit, deleteHabit } = useHabitActions();

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const openDetail = useCallback((h: Habit) => setSelectedHabit(h), []);
  const closeDetail = useCallback(() => setSelectedHabit(null), []);

  const requestDeleteHabit = useCallback(
    (h: Habit) => {
      Alert.alert(
        "Видалити звичку?",
        `«${h.title}» буде видалено безповоротно. Цю дію не можна скасувати.`,
        [
          { text: "Скасувати", style: "cancel" },
          {
            text: "Видалити",
            style: "destructive",
            onPress: () => deleteHabit(h.id),
          },
        ],
      );
    },
    [deleteHabit],
  );

  type HabitsListItem =
    | {
        type: "section";
        key: string;
        title: string;
        count: number;
        muted?: boolean;
      }
    | { type: "habit"; key: string; habit: Habit; checked?: boolean }
    | { type: "empty"; key: string }
    | { type: "spacer"; key: string };

  const listData = useCallback((): HabitsListItem[] => {
    const items: HabitsListItem[] = [];

    if (pending.length > 0) {
      items.push({
        type: "section",
        key: "section-pending",
        title: "До виконання",
        count: pending.length,
      });
      for (const habit of pending) {
        items.push({ type: "habit", key: `pending-${habit.id}`, habit });
      }
    }

    if (done.length > 0) {
      items.push({
        type: "section",
        key: "section-done",
        title: "Виконано",
        count: done.length,
        muted: true,
      });
      for (const habit of done) {
        items.push({
          type: "habit",
          key: `done-${habit.id}`,
          habit,
          checked: true,
        });
      }
    }

    if (habits.length === 0) {
      items.push({ type: "empty", key: "empty" });
    }

    items.push({ type: "spacer", key: "spacer" });
    return items;
  }, [done, habits.length, pending]);

  const renderListItem = useCallback(
    ({ item }: { item: HabitsListItem }) => {
      if (item.type === "section") {
        return (
          <SectionHeader
            title={item.title}
            count={item.count}
            muted={item.muted}
          />
        );
      }

      if (item.type === "habit") {
        return (
          <View style={s.section}>
            <HabitCard
              habit={item.habit}
              onCheck={() => checkHabit(item.habit.id)}
              onPress={() => openDetail(item.habit)}
              onDelete={() => requestDeleteHabit(item.habit)}
              checked={item.checked}
            />
          </View>
        );
      }

      if (item.type === "empty") {
        return <EmptyHabits onAdd={() => setShowAddSheet(true)} />;
      }

      return <View style={s.listSpacer} />;
    },
    [checkHabit, openDetail, requestDeleteHabit],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={s.safe}
        edges={["top"]}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>
              {new Date().toLocaleDateString("uk-UA", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
            <Text style={s.headerTitle}>Звички</Text>
          </View>
          <BtnIcon
            onPress={() => setShowAddSheet(true)}
            accessibilityLabel="Додати звичку"
          />
        </View>
        <HabitsAgenda habits={habits} />

        <FlatList
          data={listData()}
          keyExtractor={(item) => item.key}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
        />

        {/* Detail sheet */}
        {selectedHabit && (
          <HabitDetailSheet
            habit={selectedHabit}
            onClose={closeDetail}
          />
        )}

        {/* Add sheet */}
        {showAddSheet && (
          <AddHabitSheet
            onClose={() => setShowAddSheet(false)}
            onSave={(draft) => {
              addHabit(draft);
              setShowAddSheet(false);
            }}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  muted,
}: {
  title: string;
  count: number;
  muted?: boolean;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <Text style={[s.sectionTitle, muted && { color: colors.subtle }]}>
          {title}
        </Text>
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>{count}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Colors & Styles ─────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  bg3: "#181b22",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: SERIF, fontSize: 32, color: colors.text },
  listSpacer: { height: 40 },

  // Summary
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ringContainer: { alignItems: "center", justifyContent: "center" },
  ringOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: { alignItems: "center", justifyContent: "center" },
  ringArc: { ...StyleSheet.absoluteFillObject, borderRadius: 32 },
  ringPct: { fontFamily: SERIF, fontSize: 15, color: colors.accent },
  summaryText: { flex: 1 },
  summaryBig: { fontFamily: SERIF, fontSize: 28, color: colors.text },
  summaryOf: { fontSize: 16, color: colors.muted },
  summaryLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  summaryBonus: { fontSize: 11, color: colors.green, marginTop: 6 },

  // Section
  section: { paddingHorizontal: 24, marginBottom: 8 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.muted,
    fontWeight: "500",
  },
  sectionBadge: {
    backgroundColor: colors.bg2,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  sectionBadgeText: { fontSize: 11, color: colors.muted },
});
