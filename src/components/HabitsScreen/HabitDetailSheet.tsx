/**
 * Bottom sheet: деталі звички (серія, статистика, міні-графік за 7 днів).
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHabitActions, useHabitStats } from "../../hooks/goalsHabits";
import type { Habit, HabitCategory } from "../../types/goalsHabits";
import { BottomSheetModal, Btn } from "../../UI";
import { AutoGrowTextInput } from "../../UI/AutoGrowTextInput";

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const CAT_OPTIONS: { value: HabitCategory; label: string; color: string }[] = [
  { value: "health", label: "Здоров'я", color: "#4ecb8d" },
  { value: "mind", label: "Розум", color: "#5a9de0" },
  { value: "work", label: "Робота", color: "#c8a96e" },
  { value: "social", label: "Соціальне", color: "#e05a9a" },
  { value: "other", label: "Інше", color: "#8a8a9a" },
];

const colors = {
  bg: "#0a0b0f",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const KEYBOARD_AWARE_BOTTOM_OFFSET = 32;

const styles = StyleSheet.create({
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 24,
  },
  sheetEmoji: { fontSize: 36, lineHeight: 42 },
  headerTextCol: { flex: 1, minWidth: 0 },
  titleInput: {
    fontFamily: SERIF,
    fontSize: 22,
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sheetSub: { fontSize: 12, color: colors.muted, marginTop: 6 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statTile: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  statValue: {
    fontFamily: SERIF,
    fontSize: 20,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    textAlign: "center",
  },
  chartLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 10,
  },
  barChart: { flexDirection: "row", gap: 6, height: 80, marginBottom: 24 },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.bg,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { backgroundColor: colors.accent, borderRadius: 4, width: "100%" },
  barDay: { fontSize: 9, color: colors.muted },
  detailActions: { gap: 10, marginTop: 4 },
});

const StatTile = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <View style={styles.statTile}>
    <Text style={[styles.statValue, accent && { color: colors.accent }]}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export type HabitDetailSheetProps = {
  habit: Habit;
  onClose: () => void;
};

export const HabitDetailSheet = ({ habit, onClose }: HabitDetailSheetProps) => {
  const insets = useSafeAreaInsets();
  const { updateHabit } = useHabitActions();
  const stats = useHabitStats(habit);
  const [titleDraft, setTitleDraft] = useState(habit.title);

  useEffect(() => {
    setTitleDraft(habit.title);
  }, [habit.id, habit.title]);

  const commitTitle = useCallback(() => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleDraft(habit.title);
      return;
    }
    if (trimmed !== habit.title) {
      updateHabit(habit.id, { title: trimmed });
    }
  }, [titleDraft, habit.id, habit.title, updateHabit]);

  return (
    <BottomSheetModal
      onClose={onClose}
      handleAccessibilityLabel="Ручка вікна деталей звички"
      handleAccessibilityHint="Перетягніть вниз, щоб закрити"
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={insets.bottom + KEYBOARD_AWARE_BOTTOM_OFFSET}
        extraKeyboardSpace={12}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetEmoji}>{habit.emoji}</Text>
          <View style={styles.headerTextCol}>
            <AutoGrowTextInput
              style={styles.titleInput}
              minInputHeight={44}
              maxInputHeight={120}
              value={titleDraft}
              onChangeText={setTitleDraft}
              onBlur={commitTitle}
              onSubmitEditing={() => {
                commitTitle();
                Keyboard.dismiss();
              }}
              returnKeyType="done"
              blurOnSubmit
              placeholder="Назва звички"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Назва звички"
            />
            <Text style={styles.sheetSub}>
              {CAT_OPTIONS.find((c) => c.value === habit.category)?.label}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatTile
            label="Поточна серія"
            value={`${stats.currentStreak}д`}
            accent
          />
          <StatTile
            label="Рекорд"
            value={`${stats.longestStreak}д`}
          />
          <StatTile
            label="Виконань"
            value={String(stats.totalCompletions)}
          />
          <StatTile
            label="За 30 днів"
            value={`${Math.round(stats.completionRate * 100)}%`}
          />
        </View>

        <Text style={styles.chartLabel}>Останні 7 днів</Text>
        <View style={styles.barChart}>
          {stats.weeklyData.map((v, i) => (
            <View
              key={i}
              style={styles.barCol}
            >
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${v * 100}%` }]} />
              </View>
              <Text style={styles.barDay}>{DAY_LABELS[i]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailActions}>
          <Btn
            variant="accent"
            onPress={onClose}
            accessibilityLabel="Закрити деталі звички"
          >
            Закрити
          </Btn>
        </View>
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
};
