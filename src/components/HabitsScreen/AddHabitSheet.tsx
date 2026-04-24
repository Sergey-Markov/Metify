/**
 * Bottom sheet: створення нової звички.
 */

import React, { useCallback, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { AddHabitDraft } from "../../store/useGoalsHabitsStore";
import type { HabitCategory } from "../../types/goalsHabits";
import { BottomSheetModal, Btn } from "../../UI";
import { AutoGrowTextInput } from "../../UI/AutoGrowTextInput";

const EMOJIS = [
  "🧘",
  "🏃",
  "💧",
  "📚",
  "✍️",
  "🎯",
  "💪",
  "🥗",
  "🌙",
  "🧠",
  "🎨",
  "🎵",
  "💻",
  "🌿",
  "☀️",
  "❤️",
  "🛌",
  "🧹",
  "🚴",
  "🧗",
];

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
  sheetTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 16,
  },
  emojiOpt: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiOptSel: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.12)",
  },
  emojiOptText: { fontSize: 22 },
  titleInput: {
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: 14,
  },
  catRow: { marginBottom: 14 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    marginRight: 8,
  },
  catChipText: { fontSize: 12, color: colors.muted },
  freqRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  freqOpt: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    alignItems: "center",
  },
  freqOptSel: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  freqText: { fontSize: 13, color: colors.muted },
  freqTextSel: { color: colors.accent },
  sheetBtns: { flexDirection: "row", gap: 10 },
});

export type AddHabitSheetProps = {
  onClose: () => void;
  onSave: (draft: AddHabitDraft) => void;
};

export const AddHabitSheet = ({ onClose, onSave }: AddHabitSheetProps) => {
  const insets = useSafeAreaInsets();
  const [emoji, setEmoji] = useState("🎯");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");

  const handleSave = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    onSave({
      title: trimmed,
      emoji,
      category,
      frequency: freq,
      targetDays: [],
    });
  }, [title, emoji, category, freq, onSave]);

  return (
    <BottomSheetModal
      onClose={onClose}
      handleAccessibilityLabel="Ручка вікна нової звички"
      handleAccessibilityHint="Перетягніть вниз, щоб закрити"
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        bottomOffset={insets.bottom + KEYBOARD_AWARE_BOTTOM_OFFSET}
        extraKeyboardSpace={12}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text style={styles.sheetTitle}>Нова звичка</Text>

        <View style={styles.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiOpt, emoji === e && styles.emojiOptSel]}
              onPress={() => setEmoji(e)}
              accessibilityRole="button"
              accessibilityLabel={`Обрати емодзі ${e}`}
              accessibilityState={{ selected: emoji === e }}
            >
              <Text style={styles.emojiOptText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AutoGrowTextInput
          style={styles.titleInput}
          minInputHeight={52}
          maxInputHeight={160}
          placeholder="Назва звички"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          accessibilityLabel="Назва звички"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          keyboardShouldPersistTaps="handled"
        >
          {CAT_OPTIONS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.catChip,
                category === c.value && {
                  borderColor: c.color,
                  backgroundColor: c.color + "18",
                },
              ]}
              onPress={() => setCategory(c.value)}
              accessibilityRole="button"
              accessibilityLabel={c.label}
              accessibilityState={{ selected: category === c.value }}
            >
              <Text
                style={[
                  styles.catChipText,
                  category === c.value && { color: c.color },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.freqRow}>
          {(["daily", "weekly"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqOpt, freq === f && styles.freqOptSel]}
              onPress={() => setFreq(f)}
              accessibilityRole="button"
              accessibilityLabel={f === "daily" ? "Щодня" : "Щотижня"}
              accessibilityState={{ selected: freq === f }}
            >
              <Text style={[styles.freqText, freq === f && styles.freqTextSel]}>
                {f === "daily" ? "Щодня" : "Щотижня"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sheetBtns}>
          <Btn
            variant="accent"
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              borderColor: colors.subtle,
            }}
            textStyle={{ color: colors.muted }}
            accessibilityLabel="Скасувати додавання звички"
          >
            Скасувати
          </Btn>
          <Btn
            variant="accent"
            onPress={handleSave}
            style={{
              flex: 2,
              backgroundColor: colors.accent,
              borderColor: colors.accent,
            }}
            textStyle={{ color: colors.bg, fontWeight: "500" }}
            accessibilityLabel="Додати звичку"
          >
            Додати
          </Btn>
        </View>
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
};
