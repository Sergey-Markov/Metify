/**
 * Картка звички в списку (верстка в дусі GoalCard + свайп для видалення).
 */

import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { Habit, HabitCategory } from "../../types/goalsHabits";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
  green: "#4ecb8d",
};

const CAT_OPTIONS: { value: HabitCategory; label: string; color: string }[] = [
  { value: "health", label: "Здоров'я", color: "#4ecb8d" },
  { value: "mind", label: "Розум", color: "#5a9de0" },
  { value: "work", label: "Робота", color: "#c8a96e" },
  { value: "social", label: "Соціальне", color: "#e05a9a" },
  { value: "other", label: "Інше", color: "#8a8a9a" },
];

const FREQ_LABEL = { daily: "Щодня", weekly: "Щотижня" } as const;

const styles = StyleSheet.create({
  swipeWrapper: { marginBottom: 12, position: "relative" },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    backgroundColor: "#3a1010",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteActionText: { fontSize: 20 },
  habitCard: {
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 10,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    overflow: "hidden",
  },
  /** Без `opacity` на контейнері — інакше крізь картку видно кнопку свайп-видалення. */
  habitCardDone: {
    backgroundColor: "#0b0c11",
    borderColor: "rgba(78, 203, 141, 0.45)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    flexShrink: 1,
  },
  catPillDot: { width: 5, height: 5, borderRadius: 3 },
  catPillText: { fontSize: 10, letterSpacing: 1, fontWeight: "500" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  doneTag: { fontSize: 10, color: colors.green, letterSpacing: 1 },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  checkBtnDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkMark: {
    fontSize: 14,
    color: "transparent",
    fontWeight: "600",
  },
  checkMarkDone: {
    color: colors.bg,
  },
  bodyPressable: { marginBottom: 0 },
  bodyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  emoji: { fontSize: 28, lineHeight: 34 },
  bodyMain: { flex: 1 },
  habitTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  habitTitleDone: { color: colors.muted, textDecorationLine: "line-through" },
  habitMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  habitMetaText: { fontSize: 11, color: colors.muted },
  streakPill: {
    backgroundColor: "rgba(200,169,110,0.1)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: { fontSize: 10, color: colors.accent },
});

export type HabitCardProps = {
  habit: Habit;
  onCheck: () => void;
  onPress: () => void;
  onDelete: () => void;
  /** Звичка вже відмічена сьогодні */
  checked?: boolean;
};

export const HabitCard = ({
  habit,
  onCheck,
  onPress,
  onDelete,
  checked = false,
}: HabitCardProps) => {
  const translateX = useSharedValue(0);
  const THRESHOLD = -80;

  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (translateX.value < THRESHOLD) {
        translateX.value = withTiming(THRESHOLD);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const cat = CAT_OPTIONS.find((c) => c.value === habit.category);
  const catColor = cat?.color ?? colors.muted;
  const categoryLabel = cat?.label ?? "";

  return (
    <View style={styles.swipeWrapper}>
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Видалити звичку"
      >
        <Text style={styles.deleteActionText}>🗑</Text>
      </TouchableOpacity>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.habitCard, checked && styles.habitCardDone, rowStyle]}
        >
          <View style={styles.cardTop}>
            <View
              style={[
                styles.catPill,
                {
                  backgroundColor: catColor + "18",
                  borderColor: catColor + "40",
                },
              ]}
            >
              <View
                style={[styles.catPillDot, { backgroundColor: catColor }]}
              />
              <Text
                style={[styles.catPillText, { color: catColor }]}
                numberOfLines={1}
              >
                {categoryLabel}
              </Text>
            </View>
            <View style={styles.topActions}>
              {checked && <Text style={styles.doneTag}>✓ Виконано</Text>}
              <TouchableOpacity
                style={[styles.checkBtn, checked && styles.checkBtnDone]}
                onPress={onCheck}
                accessibilityRole="button"
                accessibilityLabel={
                  checked
                    ? "Скасувати виконання за сьогодні"
                    : "Позначити виконаною"
                }
              >
                <Text
                  style={[styles.checkMark, checked && styles.checkMarkDone]}
                >
                  {checked ? "✓" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bodyPressable}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityHint="Відкрити деталі звички"
          >
            <View style={styles.bodyRow}>
              <Text
                style={styles.emoji}
                accessibilityLabel={`Емодзі: ${habit.emoji}`}
              >
                {habit.emoji}
              </Text>
              <View style={styles.bodyMain}>
                <Text
                  style={[styles.habitTitle, checked && styles.habitTitleDone]}
                >
                  {habit.title}
                </Text>
                <View style={styles.habitMeta}>
                  <Text style={styles.habitMetaText}>
                    {FREQ_LABEL[habit.frequency]}
                  </Text>
                  {habit.streak > 1 && (
                    <View style={styles.streakPill}>
                      <Text style={styles.streakText}>🔥 {habit.streak}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
