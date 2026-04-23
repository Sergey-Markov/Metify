import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetModal, Btn, BtnIcon } from "../UI";
import type {
  Goal,
  GoalCategory,
  GoalPriority,
  Milestone,
} from "../types/goalsHabits";
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
  msTitle: { flex: 1, fontSize: 14, color: colors.text, minWidth: 0 },
  msTitleDone: { color: colors.subtle, textDecorationLine: "line-through" },
  msTitleInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.bg,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 8,
  },
  msRowActions: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 6,
  },
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
  detailActions: { gap: 10, marginTop: 20 },
});

const KEYBOARD_AWARE_BOTTOM_OFFSET = 32;

export type GoalDetailSheetProps = {
  goal: Goal;
  onClose: () => void;
  onComplete: () => void;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (title: string) => void;
  onUpdateMilestoneTitle: (milestoneId: string, title: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
};

export const GoalDetailSheet = ({
  goal,
  onClose,
  onComplete,
  onToggleMilestone,
  onAddMilestone,
  onUpdateMilestoneTitle,
  onDeleteMilestone,
}: GoalDetailSheetProps) => {
  const insets = useSafeAreaInsets();
  const [newMs, setNewMs] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const catColor = CAT_COLORS[goal.category] ?? colors.muted;
  const daysLeft = daysUntilGoal(goal);
  const doneMiles = goal.milestones.filter((m) => m.completed).length;
  const canMutateMilestones = goal.status === "active";
  const milestoneEditLocked = editingId !== null;

  useEffect(() => {
    if (editingId && !goal.milestones.some((m) => m.id === editingId)) {
      setEditingId(null);
      setEditDraft("");
    }
  }, [goal.milestones, editingId]);

  const handleAddMs = () => {
    if (!newMs.trim()) return;
    onAddMilestone(newMs.trim());
    setNewMs("");
  };

  const startEdit = (m: Milestone) => {
    setEditingId(m.id);
    setEditDraft(m.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    const prev = goal.milestones.find((m) => m.id === editingId);
    const id = editingId;
    setEditingId(null);
    setEditDraft("");
    if (!prev || !trimmed || trimmed === prev.title) return;
    onUpdateMilestoneTitle(id, trimmed);
  };

  const confirmDeleteMilestone = (m: Milestone) => {
    const preview = m.title.length > 72 ? `${m.title.slice(0, 72)}…` : m.title;
    Alert.alert("Видалити крок?", `«${preview}»`, [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: () => {
          if (editingId === m.id) {
            setEditingId(null);
            setEditDraft("");
          }
          onDeleteMilestone(m.id);
        },
      },
    ]);
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
        <View
          style={[styles.detailBanner, { backgroundColor: catColor + "14" }]}
        >
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
              <View
                style={[styles.catPillDot, { backgroundColor: catColor }]}
              />
              <Text style={[styles.catPillText, { color: catColor }]}>
                {CATEGORY_LABELS[goal.category]}
              </Text>
            </View>
            <Text
              style={[styles.priIcon, { color: PRI_COLORS[goal.priority] }]}
            >
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
              <Text style={[styles.detailStatVal, { color: catColor }]}>
                {goal.progress}%
              </Text>
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
            <View
              key={m.id}
              style={styles.milestone}
            >
              <TouchableOpacity
                onPress={() => onToggleMilestone(m.id)}
                disabled={!canMutateMilestones || milestoneEditLocked}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: m.completed,
                  disabled: !canMutateMilestones || milestoneEditLocked,
                }}
                accessibilityLabel={
                  m.completed
                    ? "Крок виконано, зняти позначку"
                    : "Позначити крок виконаним"
                }
              >
                <View
                  style={[styles.msCheck, m.completed && styles.msCheckDone]}
                >
                  {m.completed && <Text style={styles.msCheckMark}>✓</Text>}
                </View>
              </TouchableOpacity>
              {editingId === m.id ? (
                <TextInput
                  style={styles.msTitleInput}
                  value={editDraft}
                  onChangeText={setEditDraft}
                  onSubmitEditing={commitEdit}
                  returnKeyType="done"
                  placeholder="Назва кроку"
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="Редагування назви кроку"
                />
              ) : (
                <Text
                  style={[styles.msTitle, m.completed && styles.msTitleDone]}
                  numberOfLines={4}
                >
                  {m.title}
                </Text>
              )}
              {canMutateMilestones && editingId === m.id ? (
                <View style={styles.msRowActions}>
                  <BtnIcon
                    shape="square"
                    dimension={36}
                    size={20}
                    name="close-outline"
                    color={colors.muted}
                    onPress={cancelEdit}
                    accessibilityLabel="Скасувати редагування кроку"
                  />
                  <BtnIcon
                    shape="square"
                    dimension={36}
                    size={22}
                    name="checkmark-outline"
                    color={colors.green}
                    onPress={commitEdit}
                    accessibilityLabel="Зберегти крок"
                  />
                </View>
              ) : canMutateMilestones ? (
                <View style={styles.msRowActions}>
                  <BtnIcon
                    shape="square"
                    dimension={36}
                    size={20}
                    name="create-outline"
                    color={colors.accent}
                    onPress={() => startEdit(m)}
                    accessibilityLabel={`Змінити крок: ${m.title}`}
                  />
                  <BtnIcon
                    shape="square"
                    dimension={36}
                    size={20}
                    name="trash-outline"
                    color={colors.red}
                    onPress={() => confirmDeleteMilestone(m)}
                    accessibilityLabel={`Видалити крок: ${m.title}`}
                  />
                </View>
              ) : null}
            </View>
          ))}

          {canMutateMilestones && (
            <View style={styles.addMsRow}>
              <TextInput
                style={styles.addMsInput}
                placeholder="Додати крок..."
                placeholderTextColor={colors.muted}
                value={newMs}
                onChangeText={setNewMs}
                onSubmitEditing={handleAddMs}
                returnKeyType="done"
                editable={!milestoneEditLocked}
                accessibilityLabel="Новий крок до цілі"
              />
              <BtnIcon
                shape="square"
                dimension={40}
                size={24}
                name="add"
                onPress={handleAddMs}
                disabled={milestoneEditLocked}
                accessibilityLabel="Додати крок"
              />
            </View>
          )}
        </View>

        <View style={styles.detailActions}>
          {goal.progress === 100 && goal.status !== "completed" && (
            <Btn
              variant="success"
              onPress={onComplete}
              accessibilityLabel="Позначити ціль як виконану"
            >
              Позначити як виконану 🎉
            </Btn>
          )}
          <Btn
            variant="accent"
            onPress={onClose}
            accessibilityLabel="Закрити деталі цілі"
          >
            Готово
          </Btn>
        </View>

        <View style={{ height: 20 }} />
      </KeyboardAwareScrollView>
    </BottomSheetModal>
  );
};
