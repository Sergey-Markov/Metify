import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import type { Goal, GoalCategory, GoalPriority } from "../types/goalsHabits";
import { daysUntilGoal } from "../utils/goalsHabits";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg: "#0a0b0f",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
  red: "#e05a5a",
  accent: "#c8a96e",
};

const CAT_COLORS: Record<string, string> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  creative: "#a78bfa",
  other: "#8a8a9a",
};

const PRI_LABELS: Record<GoalPriority, string> = {
  high: "●",
  medium: "◐",
  low: "○",
};

const PRI_COLORS: Record<GoalPriority, string> = {
  high: "#e05a5a",
  medium: "#c8a96e",
  low: "#8a8a9a",
};

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  health: "Здоров'я",
  family: "Сім'я",
  career: "Кар'єра",
  growth: "Розвиток",
  travel: "Подорожі",
  finance: "Фінанси",
  creative: "Творчість",
  other: "Інше",
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheet: {
    backgroundColor: "#111318",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 0,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 40,
    height: 3,
    backgroundColor: colors.subtle,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  detailBanner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  detailTopRow: {
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
  },
  catPillDot: { width: 5, height: 5, borderRadius: 3 },
  catPillText: { fontSize: 10, letterSpacing: 1, fontWeight: "500" },
  priIcon: { fontSize: 13, fontWeight: "500" },
  detailTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  detailStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 4,
  },
  detailStat: { flex: 1, alignItems: "center" },
  detailStatVal: { fontFamily: SERIF, fontSize: 22, color: colors.text },
  detailStatLabel: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: 2,
  },
  detailDivider: { width: 0.5, height: 36, backgroundColor: colors.subtle },
  progressTrack: {
    height: 3,
    backgroundColor: colors.subtle,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  milesSection: { marginBottom: 4 },
  milesTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 12,
    fontWeight: "500",
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.subtle,
  },
  msCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  msCheckDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  msCheckMark: { fontSize: 10, color: colors.bg },
  msTitle: { flex: 1, fontSize: 14, color: colors.text },
  msTitleDone: { color: colors.subtle, textDecorationLine: "line-through" },
  addMsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  addMsInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
  },
  addMsBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(200,169,110,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  addMsBtnText: { fontSize: 20, color: colors.accent, lineHeight: 22 },
  detailActions: { gap: 10, marginTop: 20 },
  completeBig: {
    backgroundColor: "rgba(78,203,141,0.12)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(78,203,141,0.3)",
  },
  completeBigText: { fontSize: 14, color: colors.green, fontWeight: "500" },
  closeSheetBtn: {
    backgroundColor: "rgba(200,169,110,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.15)",
  },
  closeSheetBtnText: { fontSize: 14, color: colors.accent },
});

export type GoalDetailSheetProps = {
  goal: Goal;
  onClose: () => void;
  onComplete: () => void;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (title: string) => void;
};

export const GoalDetailSheet = ({
  goal,
  onClose,
  onComplete,
  onToggleMilestone,
  onAddMilestone,
}: GoalDetailSheetProps) => {
  const [newMs, setNewMs] = useState("");
  const catColor = CAT_COLORS[goal.category] ?? colors.muted;
  const daysLeft = daysUntilGoal(goal);
  const doneMiles = goal.milestones.filter((m) => m.completed).length;

  const handleAddMs = () => {
    if (!newMs.trim()) return;
    onAddMilestone(newMs.trim());
    setNewMs("");
  };

  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <Animated.View
        style={styles.sheet}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.detailBanner, { backgroundColor: catColor + "14" }]}>
            <View style={styles.detailTopRow}>
              <View
                style={[
                  styles.catPill,
                  {
                    backgroundColor: catColor + "20",
                    borderColor: catColor + "40",
                  },
                ]}
              >
                <View style={[styles.catPillDot, { backgroundColor: catColor }]} />
                <Text style={[styles.catPillText, { color: catColor }]}>
                  {CATEGORY_LABELS[goal.category]}
                </Text>
              </View>
              <Text style={[styles.priIcon, { color: PRI_COLORS[goal.priority] }]}>
                {PRI_LABELS[goal.priority]}{" "}
                {goal.priority === "high"
                  ? "Важливо"
                  : goal.priority === "medium"
                    ? "Середньо"
                    : "Низьке"}
              </Text>
            </View>
            <Text style={styles.detailTitle}>{goal.title}</Text>

            <View style={styles.detailStats}>
              <View style={styles.detailStat}>
                <Text style={[styles.detailStatVal, { color: catColor }]}>{goal.progress}%</Text>
                <Text style={styles.detailStatLabel}>Прогрес</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailStat}>
                <Text style={styles.detailStatVal}>
                  {doneMiles}/{goal.milestones.length}
                </Text>
                <Text style={styles.detailStatLabel}>Кроків</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailStat}>
                <Text
                  style={[
                    styles.detailStatVal,
                    daysLeft === 0 && { color: colors.red },
                  ]}
                >
                  {daysLeft === null ? "—" : daysLeft === 0 ? "!" : daysLeft}
                </Text>
                <Text style={styles.detailStatLabel}>
                  {daysLeft === 0 ? "Прострочено" : "Днів"}
                </Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { marginTop: 8, height: 4 }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${goal.progress}%`, backgroundColor: catColor },
                ]}
              />
            </View>
          </View>

          <View style={styles.milesSection}>
            <Text style={styles.milesTitle}>Кроки до цілі</Text>

            {goal.milestones.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.milestone}
                onPress={() => onToggleMilestone(m.id)}
              >
                <View style={[styles.msCheck, m.completed && styles.msCheckDone]}>
                  {m.completed && <Text style={styles.msCheckMark}>✓</Text>}
                </View>
                <Text style={[styles.msTitle, m.completed && styles.msTitleDone]}>{m.title}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.addMsRow}>
              <TextInput
                style={styles.addMsInput}
                placeholder="Додати крок..."
                placeholderTextColor={colors.muted}
                value={newMs}
                onChangeText={setNewMs}
                onSubmitEditing={handleAddMs}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addMsBtn}
                onPress={handleAddMs}
              >
                <Text style={styles.addMsBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailActions}>
            {goal.progress === 100 && (
              <TouchableOpacity
                style={styles.completeBig}
                onPress={onComplete}
              >
                <Text style={styles.completeBigText}>Позначити як виконану 🎉</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeSheetBtn}
              onPress={onClose}
            >
              <Text style={styles.closeSheetBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};
