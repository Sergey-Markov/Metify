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

import type { Goal, GoalCategory, GoalPriority, Milestone } from "../types/goalsHabits";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg: "#0a0b0f",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
};

const CAT_COLORS: Record<GoalCategory, string> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  creative: "#a78bfa",
  other: "#8a8a9a",
};

const PICKER_CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: "health", label: "Здоров'я" },
  { value: "career", label: "Кар'єра" },
  { value: "growth", label: "Розвиток" },
  { value: "family", label: "Сім'я" },
  { value: "travel", label: "Подорожі" },
  { value: "finance", label: "Фінанси" },
  { value: "creative", label: "Творчість" },
  { value: "other", label: "Інше" },
];

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
  sheetTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 8,
    fontWeight: "500",
  },
  catPillDot: { width: 5, height: 5, borderRadius: 3 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    marginRight: 8,
  },
  catChipText: { fontSize: 12, color: colors.muted },
  freqRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  freqOpt: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
  },
  freqText: { fontSize: 11, color: colors.muted },
  msBuilderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  msRemoveBtn: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  msRemoveBtnText: { fontSize: 14, color: colors.muted },
  msAddField: {
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  msAddFieldText: { fontSize: 13, color: colors.muted },
  sheetBtns: { flexDirection: "row", gap: 10 },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
  },
  btnCancelText: { fontSize: 14, color: colors.muted },
  btnSave: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
  },
  btnSaveText: { fontSize: 14, fontWeight: "500", color: colors.bg },
});

export type AddGoalSheetProps = {
  onClose: () => void;
  onSave: (draft: Omit<Goal, "id" | "createdAt" | "status" | "progress">) => void;
};

export const AddGoalSheet = ({ onClose, onSave }: AddGoalSheetProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("growth");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([""]);

  const updateMs = (i: number, val: string) => {
    setMilestones((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  };
  const addMsField = () => setMilestones((prev) => [...prev, ""]);
  const removeMsField = (i: number) => setMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim()) return;
    const builtMs: Milestone[] = milestones
      .filter((m) => m.trim())
      .map((m, i) => ({
        id: `m_${Date.now()}_${i}`,
        title: m.trim(),
        completed: false,
      }));
    onSave({
      title: title.trim(),
      category,
      priority,
      targetDate: targetDate || undefined,
      milestones: builtMs,
      description: undefined,
    });
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
        style={[styles.sheet, { maxHeight: "90%" }]}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <View style={styles.sheetHandle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Нова ціль</Text>

          <TextInput
            style={styles.input}
            placeholder="Чого хочете досягти?"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <Text style={styles.fieldLabel}>Категорія</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 14 }}
          >
            {PICKER_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[
                  styles.catChip,
                  category === c.value && {
                    borderColor: CAT_COLORS[c.value],
                    backgroundColor: CAT_COLORS[c.value] + "18",
                  },
                ]}
                onPress={() => setCategory(c.value)}
              >
                <View style={[styles.catPillDot, { backgroundColor: CAT_COLORS[c.value] }]} />
                <Text
                  style={[
                    styles.catChipText,
                    category === c.value && { color: CAT_COLORS[c.value] },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Пріоритет</Text>
          <View style={styles.freqRow}>
            {(["high", "medium", "low"] as GoalPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.freqOpt,
                  priority === p && {
                    borderColor: PRI_COLORS[p],
                    backgroundColor: PRI_COLORS[p] + "14",
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.freqText,
                    priority === p && { color: PRI_COLORS[p] },
                  ]}
                >
                  {PRI_LABELS[p]}{" "}
                  {p === "high" ? "Важливо" : p === "medium" ? "Середній" : "Низький"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{"Дедлайн (необов'язково)"}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 20 }]}
            placeholder="РРРР-ММ-ДД"
            placeholderTextColor={colors.muted}
            value={targetDate}
            onChangeText={setTargetDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.fieldLabel}>Кроки до цілі</Text>
          {milestones.map((m, i) => (
            <View
              key={i}
              style={styles.msBuilderRow}
            >
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder={`Крок ${i + 1}`}
                placeholderTextColor={colors.muted}
                value={m}
                onChangeText={(v) => updateMs(i, v)}
              />
              {milestones.length > 1 && (
                <TouchableOpacity
                  style={styles.msRemoveBtn}
                  onPress={() => removeMsField(i)}
                >
                  <Text style={styles.msRemoveBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.msAddField}
            onPress={addMsField}
          >
            <Text style={styles.msAddFieldText}>+ Додати крок</Text>
          </TouchableOpacity>

          <View style={[styles.sheetBtns, { marginTop: 24 }]}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={onClose}
            >
              <Text style={styles.btnCancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSave}
              onPress={handleSave}
            >
              <Text style={styles.btnSaveText}>Зберегти</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};
