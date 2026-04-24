import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetModal, Btn, BtnIcon } from "../../UI";
import { AutoGrowTextInput } from "../../UI/AutoGrowTextInput";
import type { Goal, Milestone } from "../../types/goalsHabits";

import { GoalDetailBanner } from "./GoalDetailBanner";

const colors = {
  bg: "#0a0b0f",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
  red: "#e05a5a",
  accent: "#c8a96e",
};

const styles = StyleSheet.create({
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
  milestoneEditing: { alignItems: "flex-start" },
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
  msRowActionsEdit: { alignItems: "flex-start", paddingTop: 4 },
  addMsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 10,
  },
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
        <GoalDetailBanner goal={goal} />

        <View style={styles.milesSection}>
          <Text style={styles.milesTitle}>Кроки до цілі</Text>

          {goal.milestones.map((m) => (
            <View
              key={m.id}
              style={[
                styles.milestone,
                editingId === m.id && styles.milestoneEditing,
              ]}
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
                <AutoGrowTextInput
                  style={styles.msTitleInput}
                  minInputHeight={40}
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
                <View style={[styles.msRowActions, styles.msRowActionsEdit]}>
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
              <AutoGrowTextInput
                style={styles.addMsInput}
                minInputHeight={40}
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
