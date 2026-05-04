import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetModal } from "../../UI";

import type {
  Goal,
  GoalCategory,
  GoalPriority,
  Milestone,
} from "../../types/goalsHabits";
import {
  GOAL_PRESETS,
} from "../../constants/presets";
import { usePresetPickerStore } from "../../store/usePresetPickerStore";
import { AutoGrowTextInput } from "../../UI/AutoGrowTextInput";
import { makeMilestoneId } from "../../utils/goalsHabits";
import { GoalCategoryFilterChip } from "./GoalCategoryFilterChip";

type MilestoneFormRow = {
  rowKey: string;
  milestoneId?: string;
  title: string;
  completed: boolean;
};

function emptyMilestoneRow(key: string): MilestoneFormRow {
  return { rowKey: key, title: "", completed: false };
}

function goalToMilestoneRows(goal: Goal): MilestoneFormRow[] {
  if (!goal.milestones.length) {
    return [emptyMilestoneRow(`n_${Date.now()}`)];
  }
  return goal.milestones.map((m) => ({
    rowKey: m.id,
    milestoneId: m.id,
    title: m.title,
    completed: m.completed,
  }));
}

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg: "#0a0b0f",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
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
  presetsRow: { marginBottom: 14 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    backgroundColor: "rgba(255,255,255,0.01)",
    marginRight: 8,
  },
  presetChipText: { fontSize: 13, color: colors.text },
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
    alignItems: "flex-start",
  },
  msRemoveBtn: {
    width: 36,
    minHeight: 44,
    paddingTop: 13,
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
  initialGoal?: Goal | null;
};

const KEYBOARD_AWARE_BOTTOM_OFFSET = 56;

export const AddGoalSheet = ({
  onClose,
  onSave,
  initialGoal,
}: AddGoalSheetProps) => {
  const router = useRouter();
  const selectedGoalPresetId = usePresetPickerStore((s) => s.selectedGoalPresetId);
  const consumeGoalPreset = usePresetPickerStore((s) => s.consumeGoalPreset);
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(() => initialGoal?.title ?? "");
  const [category, setCategory] = useState<GoalCategory>(
    () => initialGoal?.category ?? "growth",
  );
  const [priority, setPriority] = useState<GoalPriority>(
    () => initialGoal?.priority ?? "medium",
  );
  const [targetDate, setTargetDate] = useState(
    () => initialGoal?.targetDate ?? "",
  );
  const [msRows, setMsRows] = useState<MilestoneFormRow[]>(() =>
    initialGoal ? goalToMilestoneRows(initialGoal) : [emptyMilestoneRow("m0")],
  );
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

  const updateMsTitle = (i: number, val: string) => {
    setMsRows((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, title: val } : m)),
    );
  };

  const applyGoalPreset = useCallback((presetId: string) => {
    const preset = GOAL_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setTitle(preset.title);
    setCategory(preset.category);
    setPriority(preset.priority);
    setMsRows(
      preset.milestoneTitles.length > 0
        ? preset.milestoneTitles.map((milestoneTitle, index) => ({
            rowKey: `preset_${preset.id}_${index}`,
            title: milestoneTitle,
            completed: false,
          }))
        : [emptyMilestoneRow(`preset_${preset.id}_empty`)],
    );
  }, []);

  useEffect(() => {
    if (!selectedGoalPresetId) return;
    const pickedPresetId = consumeGoalPreset();
    if (!pickedPresetId) return;
    applyGoalPreset(pickedPresetId);
  }, [applyGoalPreset, consumeGoalPreset, selectedGoalPresetId]);
  const addMsField = () =>
    setMsRows((prev) => [
      ...prev,
      emptyMilestoneRow(`n_${Date.now()}_${prev.length}`),
    ]);
  const removeMsField = (i: number) =>
    setMsRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim()) return;
    const builtMs: Milestone[] = msRows
      .filter((r) => r.title.trim())
      .map((r) => {
        if (r.milestoneId) {
          const prev = initialGoal?.milestones.find(
            (m) => m.id === r.milestoneId,
          );
          return {
            id: r.milestoneId,
            title: r.title.trim(),
            completed: r.completed,
            completedAt: r.completed
              ? (prev?.completedAt ?? new Date().toISOString())
              : undefined,
          };
        }
        return {
          id: makeMilestoneId(),
          title: r.title.trim(),
          completed: false,
        };
      });
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
    <BottomSheetModal onClose={onClose}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={insets.bottom + KEYBOARD_AWARE_BOTTOM_OFFSET}
        extraKeyboardSpace={12}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text style={styles.sheetTitle}>
          {initialGoal ? "Редагування цілі" : "Нова ціль"}
        </Text>

        {!initialGoal ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.fieldLabel}>Популярні шаблони</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: "/presets", params: { mode: "goal" } })
                }
                accessibilityRole="button"
                accessibilityLabel={`Переглянути всі шаблони цілей. Усього ${GOAL_PRESETS.length}`}
              >
                <Text style={{ fontSize: 12, color: colors.accent }}>
                  Всі ({GOAL_PRESETS.length})
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.presetsRow}
            >
              {GOAL_PRESETS.slice(0, 6).map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetChip}
                  onPress={() => applyGoalPreset(preset.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Заповнити форму шаблоном: ${preset.title}`}
                >
                  <Text style={styles.presetChipText}>{preset.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}

        <AutoGrowTextInput
          style={styles.input}
          placeholder="Чого хочете досягти?"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Назва цілі"
        />

        <Text style={styles.fieldLabel}>Категорія</Text>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
        >
          {PICKER_CATEGORIES.map((c) => (
            <GoalCategoryFilterChip
              key={c.value}
              value={c.value}
              label={c.label}
              active={category === c.value}
              activeTone="category"
              onPress={() => setCategory(c.value)}
              style={{ marginRight: 8 }}
            />
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
                {targetDate.trim() ? "Натисніть, щоб змінити" : "Необов'язково"}
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
                {targetDate.trim() ? "Натисніть, щоб змінити" : "Необов'язково"}
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
                      <Text style={styles.iosModalBtnPrimaryText}>Готово</Text>
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
        {msRows.map((row, i) => (
          <View
            key={row.rowKey}
            style={styles.msBuilderRow}
          >
            <AutoGrowTextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={`Крок ${i + 1}`}
              placeholderTextColor={colors.muted}
              value={row.title}
              onChangeText={(v) => updateMsTitle(i, v)}
              accessibilityLabel={`Текст кроку ${i + 1}`}
            />
            {msRows.length > 1 && (
              <TouchableOpacity
                style={styles.msRemoveBtn}
                onPress={() => removeMsField(i)}
                accessibilityLabel={`Видалити крок ${i + 1}`}
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
    </BottomSheetModal>
  );
};
