/**
 * app/(tabs)/goals.tsx
 *
 * Full Goals screen:
 *   - Category filter tabs
 *   - Priority-sorted goal cards with progress bars
 *   - Goal detail sheet (milestones, days remaining, edit)
 *   - Add-goal bottom sheet with milestone builder
 *   - Completed goals section (collapsible)
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGoalActions, useGoalsSummary } from "../../src/hooks/goalsHabits";
import { useGoalsHabitsStore } from "../../src/store/useGoalsHabitsStore";
import type {
  Goal,
  GoalCategory,
  GoalPriority,
  Milestone,
} from "../../src/types/goalsHabits";
import { daysUntilGoal } from "../../src/utils/goalsHabits";

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES: { value: GoalCategory | "all"; label: string }[] = [
  { value: "all", label: "Всі" },
  { value: "health", label: "Здоров'я" },
  { value: "career", label: "Кар'єра" },
  { value: "growth", label: "Розвиток" },
  { value: "family", label: "Сім'я" },
  { value: "travel", label: "Подорожі" },
  { value: "other", label: "Інше" },
];

const CAT_COLORS: Record<string, string> = {
  health: "#4ecb8d",
  career: "#5a9de0",
  growth: "#c8a96e",
  family: "#e05a9a",
  travel: "#935ae0",
  finance: "#f0a05a",
  other: "#8a8a9a",
};

const PRI_RANK: Record<GoalPriority, number> = { high: 0, medium: 1, low: 2 };
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const goals = useGoalsHabitsStore((s) => s.goals);
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed"),
    [goals],
  );
  const {
    addGoal,
    updateGoal,
    completeGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
  } = useGoalActions();
  const { avgProgress } = useGoalsSummary();

  const [filterCat, setFilterCat] = useState<GoalCategory | "all">("all");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const filtered = useMemo(
    () =>
      [...activeGoals]
        .filter((g) => filterCat === "all" || g.category === filterCat)
        .sort((a, b) => PRI_RANK[a.priority] - PRI_RANK[b.priority]),
    [activeGoals, filterCat],
  );

  const toggleDone = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDone((v) => !v);
  };

  const openDetail = useCallback((g: Goal) => setSelectedGoal(g), []);
  const closeDetail = useCallback(() => setSelectedGoal(null), []);

  // Sync selectedGoal when store updates (e.g. milestone toggle)
  const liveSelectedGoal = useMemo(
    () =>
      selectedGoal
        ? (activeGoals.find((g) => g.id === selectedGoal.id) ?? selectedGoal)
        : null,
    [selectedGoal, activeGoals],
  );

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top"]}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Фокус на важливому</Text>
          <Text style={s.headerTitle}>Цілі</Text>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => setShowAdd(true)}
        >
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Overall progress bar */}
      {activeGoals.length > 0 && (
        <View style={s.overallRow}>
          <Text style={s.overallLabel}>Середній прогрес</Text>
          <Text style={s.overallPct}>{avgProgress}%</Text>
          <View style={s.overallTrack}>
            <Animated.View
              style={[s.overallFill, { width: `${avgProgress}%` }]}
            />
          </View>
        </View>
      )}

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterRow}
        contentContainerStyle={s.filterContent}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[s.filterChip, filterCat === c.value && s.filterChipActive]}
            onPress={() => setFilterCat(c.value)}
          >
            {c.value !== "all" && (
              <View
                style={[s.filterDot, { backgroundColor: CAT_COLORS[c.value] }]}
              />
            )}
            <Text
              style={[
                s.filterText,
                filterCat === c.value && s.filterTextActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Active goals */}
        {filtered.length === 0 && (
          <EmptyGoals
            onAdd={() => setShowAdd(true)}
            filtered={filterCat !== "all"}
          />
        )}

        {filtered.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onPress={() => openDetail(g)}
            onComplete={() => completeGoal(g.id)}
            onDelete={() => deleteGoal(g.id)}
          />
        ))}

        {/* Completed section */}
        {completedGoals.length > 0 && (
          <View style={s.completedSection}>
            <TouchableOpacity
              style={s.completedToggle}
              onPress={toggleDone}
            >
              <Text style={s.completedToggleText}>
                Виконані цілі ({completedGoals.length})
              </Text>
              <Text style={s.completedArrow}>{showDone ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {showDone &&
              completedGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  completed
                  onDelete={() => deleteGoal(g.id)}
                />
              ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Goal detail sheet */}
      {liveSelectedGoal && (
        <GoalDetailSheet
          goal={liveSelectedGoal}
          onClose={closeDetail}
          onComplete={() => {
            completeGoal(liveSelectedGoal.id);
            closeDetail();
          }}
          onToggleMilestone={(mid) => toggleMilestone(liveSelectedGoal.id, mid)}
          onAddMilestone={(title) => addMilestone(liveSelectedGoal.id, title)}
        />
      )}

      {/* Add goal sheet */}
      {showAdd && (
        <AddGoalSheet
          onClose={() => setShowAdd(false)}
          onSave={(draft) => {
            addGoal(draft);
            setShowAdd(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  onPress,
  onComplete,
  onDelete,
  completed,
}: {
  goal: Goal;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  completed?: boolean;
}) {
  const catColor = CAT_COLORS[goal.category] ?? colors.muted;
  const daysLeft = daysUntilGoal(goal);
  const overdue = daysLeft === 0 && goal.progress < 100;
  const doneMiles = goal.milestones.filter((m) => m.completed).length;

  return (
    <TouchableOpacity
      style={[s.goalCard, completed && s.goalCardDone]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Top row */}
      <View style={s.goalCardTop}>
        <View
          style={[
            s.catPill,
            { backgroundColor: catColor + "18", borderColor: catColor + "40" },
          ]}
        >
          <View style={[s.catPillDot, { backgroundColor: catColor }]} />
          <Text style={[s.catPillText, { color: catColor }]}>
            {CATEGORIES.find((c) => c.value === goal.category)?.label}
          </Text>
        </View>
        <View style={s.goalCardActions}>
          {!completed && (
            <Text style={[s.priIcon, { color: PRI_COLORS[goal.priority] }]}>
              {PRI_LABELS[goal.priority]}
            </Text>
          )}
          {completed && <Text style={s.doneTag}>✓ Виконано</Text>}
        </View>
      </View>

      {/* Title */}
      <Text style={[s.goalTitle, completed && s.goalTitleDone]}>
        {goal.title}
      </Text>

      {/* Meta */}
      <View style={s.goalMeta}>
        {daysLeft !== null && !completed && (
          <Text style={[s.goalDays, overdue && { color: colors.red }]}>
            {overdue
              ? "⚠ Термін минув"
              : daysLeft === 0
                ? "Сьогодні!"
                : `${daysLeft} днів залишилось`}
          </Text>
        )}
        {goal.milestones.length > 0 && (
          <Text style={s.goalMiles}>
            {doneMiles}/{goal.milestones.length} кроків
          </Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            {
              width: `${goal.progress}%`,
              backgroundColor: completed ? colors.green : catColor,
            },
          ]}
        />
      </View>
      <View style={s.progressRow}>
        <Text style={s.progressPct}>{goal.progress}%</Text>
        {!completed && onComplete && goal.progress === 100 && (
          <TouchableOpacity
            style={s.completeBtn}
            onPress={onComplete}
          >
            <Text style={s.completeBtnText}>Закрити ціль ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── GoalDetailSheet ──────────────────────────────────────────────────────────

function GoalDetailSheet({
  goal,
  onClose,
  onComplete,
  onToggleMilestone,
  onAddMilestone,
}: {
  goal: Goal;
  onClose: () => void;
  onComplete: () => void;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (title: string) => void;
}) {
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
      style={s.overlay}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <Animated.View
        style={s.sheet}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <View style={s.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[s.detailBanner, { backgroundColor: catColor + "14" }]}>
            <View style={s.detailTopRow}>
              <View
                style={[
                  s.catPill,
                  {
                    backgroundColor: catColor + "20",
                    borderColor: catColor + "40",
                  },
                ]}
              >
                <View style={[s.catPillDot, { backgroundColor: catColor }]} />
                <Text style={[s.catPillText, { color: catColor }]}>
                  {CATEGORIES.find((c) => c.value === goal.category)?.label}
                </Text>
              </View>
              <Text style={[s.priIcon, { color: PRI_COLORS[goal.priority] }]}>
                {PRI_LABELS[goal.priority]}{" "}
                {goal.priority === "high"
                  ? "Важливо"
                  : goal.priority === "medium"
                    ? "Середньо"
                    : "Низьке"}
              </Text>
            </View>
            <Text style={s.detailTitle}>{goal.title}</Text>

            {/* Stats row */}
            <View style={s.detailStats}>
              <View style={s.detailStat}>
                <Text style={[s.detailStatVal, { color: catColor }]}>
                  {goal.progress}%
                </Text>
                <Text style={s.detailStatLabel}>Прогрес</Text>
              </View>
              <View style={s.detailDivider} />
              <View style={s.detailStat}>
                <Text style={s.detailStatVal}>
                  {doneMiles}/{goal.milestones.length}
                </Text>
                <Text style={s.detailStatLabel}>Кроків</Text>
              </View>
              <View style={s.detailDivider} />
              <View style={s.detailStat}>
                <Text
                  style={[
                    s.detailStatVal,
                    daysLeft === 0 && { color: colors.red },
                  ]}
                >
                  {daysLeft === null ? "—" : daysLeft === 0 ? "!" : daysLeft}
                </Text>
                <Text style={s.detailStatLabel}>
                  {daysLeft === 0 ? "Прострочено" : "Днів"}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[s.progressTrack, { marginTop: 8, height: 4 }]}>
              <View
                style={[
                  s.progressFill,
                  { width: `${goal.progress}%`, backgroundColor: catColor },
                ]}
              />
            </View>
          </View>

          {/* Milestones */}
          <View style={s.milesSection}>
            <Text style={s.milesTitle}>Кроки до цілі</Text>

            {goal.milestones.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={s.milestone}
                onPress={() => onToggleMilestone(m.id)}
              >
                <View style={[s.msCheck, m.completed && s.msCheckDone]}>
                  {m.completed && <Text style={s.msCheckMark}>✓</Text>}
                </View>
                <Text style={[s.msTitle, m.completed && s.msTitleDone]}>
                  {m.title}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Add milestone inline */}
            <View style={s.addMsRow}>
              <TextInput
                style={s.addMsInput}
                placeholder="Додати крок..."
                placeholderTextColor={colors.muted}
                value={newMs}
                onChangeText={setNewMs}
                onSubmitEditing={handleAddMs}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={s.addMsBtn}
                onPress={handleAddMs}
              >
                <Text style={s.addMsBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions */}
          <View style={s.detailActions}>
            {goal.progress === 100 && (
              <TouchableOpacity
                style={s.completeBig}
                onPress={onComplete}
              >
                <Text style={s.completeBigText}>Позначити як виконану 🎉</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={s.closeSheetBtn}
              onPress={onClose}
            >
              <Text style={s.closeSheetBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── AddGoalSheet ─────────────────────────────────────────────────────────────

function AddGoalSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (
    draft: Omit<Goal, "id" | "createdAt" | "status" | "progress">,
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("growth");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([""]);

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
      style={s.overlay}
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <Animated.View
        style={[s.sheet, { maxHeight: "90%" }]}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <View style={s.sheetHandle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={s.sheetTitle}>Нова ціль</Text>

          {/* Title */}
          <TextInput
            style={s.input}
            placeholder="Чого хочете досягти?"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Category */}
          <Text style={s.fieldLabel}>Категорія</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 14 }}
          >
            {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[
                  s.catChip,
                  category === c.value && {
                    borderColor: CAT_COLORS[c.value],
                    backgroundColor: CAT_COLORS[c.value] + "18",
                  },
                ]}
                onPress={() => setCategory(c.value as GoalCategory)}
              >
                <View
                  style={[
                    s.catPillDot,
                    { backgroundColor: CAT_COLORS[c.value] },
                  ]}
                />
                <Text
                  style={[
                    s.catChipText,
                    category === c.value && { color: CAT_COLORS[c.value] },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Priority */}
          <Text style={s.fieldLabel}>Пріоритет</Text>
          <View style={s.freqRow}>
            {(["high", "medium", "low"] as GoalPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  s.freqOpt,
                  priority === p && {
                    borderColor: PRI_COLORS[p],
                    backgroundColor: PRI_COLORS[p] + "14",
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    s.freqText,
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

          {/* Target date */}
          <Text style={s.fieldLabel}>{"Дедлайн (необов'язково)"}</Text>
          <TextInput
            style={[s.input, { marginBottom: 20 }]}
            placeholder="РРРР-ММ-ДД"
            placeholderTextColor={colors.muted}
            value={targetDate}
            onChangeText={setTargetDate}
            keyboardType="numbers-and-punctuation"
          />

          {/* Milestones builder */}
          <Text style={s.fieldLabel}>Кроки до цілі</Text>
          {milestones.map((m, i) => (
            <View
              key={i}
              style={s.msBuilderRow}
            >
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder={`Крок ${i + 1}`}
                placeholderTextColor={colors.muted}
                value={m}
                onChangeText={(v) => updateMs(i, v)}
              />
              {milestones.length > 1 && (
                <TouchableOpacity
                  style={s.msRemoveBtn}
                  onPress={() => removeMsField(i)}
                >
                  <Text style={s.msRemoveBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={s.msAddField}
            onPress={addMsField}
          >
            <Text style={s.msAddFieldText}>+ Додати крок</Text>
          </TouchableOpacity>

          <View style={[s.sheetBtns, { marginTop: 24 }]}>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={onClose}
            >
              <Text style={s.btnCancelText}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnSave}
              onPress={handleSave}
            >
              <Text style={s.btnSaveText}>Зберегти</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ─── EmptyGoals ───────────────────────────────────────────────────────────────

function EmptyGoals({
  onAdd,
  filtered,
}: {
  onAdd: () => void;
  filtered: boolean;
}) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>🎯</Text>
      <Text style={s.emptyTitle}>{filtered ? "Немає цілей" : "Ваші цілі"}</Text>
      <Text style={s.emptySub}>
        {filtered
          ? "У цій категорії немає активних цілей"
          : "Визначте, чого хочете досягти.\nВізуалізуйте прогрес кожного дня."}
      </Text>
      {!filtered && (
        <TouchableOpacity
          style={s.emptyBtn}
          onPress={onAdd}
        >
          <Text style={s.emptyBtnText}>Поставити першу ціль</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Colors & Styles ─────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
  red: "#e05a5a",
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
    paddingBottom: 12,
  },
  headerSub: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: { fontFamily: SERIF, fontSize: 32, color: colors.text },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(200,169,110,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 22, color: colors.accent, lineHeight: 26 },

  overallRow: { paddingHorizontal: 24, paddingBottom: 10 },
  overallLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  overallPct: {
    fontFamily: SERIF,
    fontSize: 18,
    color: colors.accent,
    marginBottom: 6,
  },
  overallTrack: {
    height: 2,
    backgroundColor: colors.subtle,
    borderRadius: 1,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 1,
  },

  filterRow: { maxHeight: 30, marginVertical: 12 },
  filterContent: {
    flexGrow: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    backgroundColor: colors.bg2,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  filterDot: { width: 5, height: 5, borderRadius: 3 },
  filterText: { fontSize: 12, color: colors.muted },
  filterTextActive: { color: colors.accent },

  scroll: { flex: 1 },

  // Goal card
  goalCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  goalCardDone: { opacity: 0.5 },
  goalCardTop: {
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
  goalCardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  priIcon: { fontSize: 13, fontWeight: "500" },
  doneTag: { fontSize: 10, color: colors.green, letterSpacing: 1 },
  goalTitle: {
    fontFamily: SERIF,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  goalTitleDone: { color: colors.muted },
  goalMeta: { flexDirection: "row", gap: 12, marginBottom: 10 },
  goalDays: { fontSize: 11, color: colors.muted },
  goalMiles: { fontSize: 11, color: colors.muted },
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
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPct: { fontSize: 11, color: colors.muted },
  completeBtn: {
    backgroundColor: "rgba(78,203,141,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "rgba(78,203,141,0.3)",
  },
  completeBtnText: { fontSize: 11, color: colors.green },

  // Completed section
  completedSection: { paddingHorizontal: 24, marginBottom: 12 },
  completedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.subtle,
  },
  completedToggleText: { fontSize: 12, color: colors.muted, letterSpacing: 1 },
  completedArrow: { fontSize: 10, color: colors.muted },

  // Detail sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheet: {
    backgroundColor: colors.bg2,
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
  detailBanner: { borderRadius: 16, padding: 16, marginBottom: 20 },
  detailTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
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

  // Milestones
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

  // Add sheet form
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

  // Empty
  empty: { alignItems: "center", padding: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.4 },
  emptyTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: "rgba(200,169,110,0.12)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.3)",
  },
  emptyBtnText: { fontSize: 14, color: colors.accent },
});
