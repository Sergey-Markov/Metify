import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type {
  Goal,
  GoalCategory,
  GoalPriority,
  Milestone,
} from "../types/goalsHabits";

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

function startOfLocalToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function clampDate(d: Date, min: Date, max: Date): Date {
  const t = d.getTime();
  const tMin = min.getTime();
  const tMax = max.getTime();
  if (t < tMin) return new Date(tMin);
  if (t > tMax) return new Date(tMax);
  return d;
}

function parseYmd(s: string): Date {
  const [y, mo, d] = s.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return new Date();
  }
  return new Date(y, mo - 1, d);
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDeadlineUk(ymd: string): string {
  if (!ymd.trim()) return "";
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parseYmd(ymd));
  } catch {
    return ymd;
  }
}

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
  dateTrigger: {
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  dateTriggerText: { fontSize: 16, color: colors.text },
  dateTriggerHint: { fontSize: 12, color: colors.muted, marginTop: 4 },
  dateClear: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    marginBottom: 12,
  },
  dateClearText: { fontSize: 13, color: colors.accent },
  iosModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  iosModalCard: {
    backgroundColor: "#111318",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  iosModalToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iosModalBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  iosModalBtnText: { fontSize: 16, color: colors.muted },
  iosModalBtnPrimaryText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: "600",
  },
  datePickerWrap: {
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
});

export type AddGoalSheetProps = {
  onClose: () => void;
  onSave: (
    draft: Omit<Goal, "id" | "createdAt" | "status" | "progress">,
  ) => void;
};

const KEYBOARD_AWARE_BOTTOM_OFFSET = 56;

export const AddGoalSheet = ({ onClose, onSave }: AddGoalSheetProps) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("growth");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([""]);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [iosTempDate, setIosTempDate] = useState(() => new Date());

  const deadlineMinDate = useMemo(() => startOfLocalToday(), []);
  const deadlineMaxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 30);
    return d;
  }, []);

  const pickerValue = useMemo(
    () =>
      clampDate(
        targetDate.trim() ? parseYmd(targetDate) : new Date(),
        deadlineMinDate,
        deadlineMaxDate,
      ),
    [targetDate, deadlineMinDate, deadlineMaxDate],
  );

  const onAndroidDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setAndroidPickerOpen(false);
    if (event.type === "set" && selected) {
      setTargetDate(toYmd(selected));
    }
  };

  const onIosSpinnerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) setIosTempDate(selected);
  };

  const openIosDeadlinePicker = () => {
    setIosTempDate(
      clampDate(
        targetDate.trim() ? parseYmd(targetDate) : new Date(),
        deadlineMinDate,
        deadlineMaxDate,
      ),
    );
    setIosPickerOpen(true);
  };

  const updateMs = (i: number, val: string) => {
    setMilestones((prev) => prev.map((m, idx) => (idx === i ? val : m)));
  };
  const addMsField = () => setMilestones((prev) => [...prev, ""]);
  const removeMsField = (i: number) =>
    setMilestones((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim()) return;
    const builtMs: Milestone[] = milestones
      .filter((m) => m.trim())
      .map((m, i) => ({
        id: `m_${Date.now()}_${i}`,
        title: m.trim(),
        completed: false,
      }));
    const rawTd = targetDate.trim();
    const targetDateOut =
      rawTd === ""
        ? undefined
        : toYmd(clampDate(parseYmd(rawTd), deadlineMinDate, deadlineMaxDate));
    onSave({
      title: title.trim(),
      category,
      priority,
      targetDate: targetDateOut,
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
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={insets.bottom + KEYBOARD_AWARE_BOTTOM_OFFSET}
          extraKeyboardSpace={12}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
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
            nestedScrollEnabled
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
                <View
                  style={[
                    styles.catPillDot,
                    { backgroundColor: CAT_COLORS[c.value] },
                  ]}
                />
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
                  {p === "high"
                    ? "Важливо"
                    : p === "medium"
                      ? "Середній"
                      : "Низький"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{"Дедлайн (необов'язково)"}</Text>
          {Platform.OS === "web" ? (
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              placeholder="РРРР-ММ-ДД"
              placeholderTextColor={colors.muted}
              value={targetDate}
              onChangeText={setTargetDate}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Дедлайн, формат РРРР-ММ-ДД"
            />
          ) : Platform.OS === "android" ? (
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                style={styles.dateTrigger}
                onPress={() => setAndroidPickerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Обрати дедлайн"
                accessibilityHint="Відкриває календар для вибору дати"
              >
                <Text style={styles.dateTriggerText}>
                  {targetDate.trim()
                    ? formatDeadlineUk(targetDate)
                    : "Оберіть дату"}
                </Text>
                <Text style={styles.dateTriggerHint}>
                  {targetDate.trim()
                    ? "Натисніть, щоб змінити"
                    : "Необов'язково"}
                </Text>
              </TouchableOpacity>
              {targetDate.trim() ? (
                <Pressable
                  style={styles.dateClear}
                  onPress={() => setTargetDate("")}
                  accessibilityRole="button"
                  accessibilityLabel="Прибрати дедлайн"
                >
                  <Text style={styles.dateClearText}>Прибрати дедлайн</Text>
                </Pressable>
              ) : null}
              {androidPickerOpen ? (
                <DateTimePicker
                  value={pickerValue}
                  mode="date"
                  display="default"
                  design="material"
                  title="Дедлайн"
                  onChange={onAndroidDateChange}
                  minimumDate={deadlineMinDate}
                  maximumDate={deadlineMaxDate}
                  positiveButton={{
                    label: "Готово",
                    textColor: colors.accent,
                  }}
                  negativeButton={{
                    label: "Скасувати",
                    textColor: colors.muted,
                  }}
                />
              ) : null}
            </View>
          ) : (
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                style={styles.dateTrigger}
                onPress={openIosDeadlinePicker}
                accessibilityRole="button"
                accessibilityLabel="Обрати дедлайн"
                accessibilityHint="Відкриває вибір дати"
              >
                <Text style={styles.dateTriggerText}>
                  {targetDate.trim()
                    ? formatDeadlineUk(targetDate)
                    : "Оберіть дату"}
                </Text>
                <Text style={styles.dateTriggerHint}>
                  {targetDate.trim()
                    ? "Натисніть, щоб змінити"
                    : "Необов'язково"}
                </Text>
              </TouchableOpacity>
              {targetDate.trim() ? (
                <Pressable
                  style={styles.dateClear}
                  onPress={() => setTargetDate("")}
                  accessibilityRole="button"
                  accessibilityLabel="Прибрати дедлайн"
                >
                  <Text style={styles.dateClearText}>Прибрати дедлайн</Text>
                </Pressable>
              ) : null}
              <Modal
                visible={iosPickerOpen}
                animationType="slide"
                transparent
                onRequestClose={() => setIosPickerOpen(false)}
              >
                <Pressable
                  style={styles.iosModalBackdrop}
                  onPress={() => setIosPickerOpen(false)}
                >
                  <Pressable
                    style={[
                      styles.iosModalCard,
                      { paddingBottom: Math.max(insets.bottom, 16) },
                    ]}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <View style={styles.iosModalToolbar}>
                      <Pressable
                        style={styles.iosModalBtn}
                        onPress={() => setIosPickerOpen(false)}
                        accessibilityRole="button"
                        accessibilityLabel="Скасувати вибір дати"
                      >
                        <Text style={styles.iosModalBtnText}>Скасувати</Text>
                      </Pressable>
                      <Pressable
                        style={styles.iosModalBtn}
                        onPress={() => {
                          setTargetDate("");
                          setIosPickerOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Без дедлайну"
                      >
                        <Text style={styles.iosModalBtnText}>Без дедлайну</Text>
                      </Pressable>
                      <Pressable
                        style={styles.iosModalBtn}
                        onPress={() => {
                          setTargetDate(toYmd(iosTempDate));
                          setIosPickerOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Підтвердити дедлайн"
                      >
                        <Text style={styles.iosModalBtnPrimaryText}>
                          Готово
                        </Text>
                      </Pressable>
                    </View>
                    <View
                      style={styles.datePickerWrap}
                      accessibilityLabel="Коліщатко вибору дати дедлайну"
                    >
                      <DateTimePicker
                        value={iosTempDate}
                        mode="date"
                        display="spinner"
                        onChange={onIosSpinnerChange}
                        minimumDate={deadlineMinDate}
                        maximumDate={deadlineMaxDate}
                        locale="uk_UA"
                        themeVariant="dark"
                        textColor={colors.text}
                        accentColor={colors.accent}
                      />
                    </View>
                  </Pressable>
                </Pressable>
              </Modal>
            </View>
          )}

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
        </KeyboardAwareScrollView>
      </Animated.View>
    </Animated.View>
  );
};
