/**
 * app/(tabs)/habits.tsx
 *
 * Full Habits screen:
 *   - Agenda calendar (week / expandable month) + day summary
 *   - Daily progress ring
 *   - Habit list with swipe-to-delete (Reanimated)
 *   - Per-habit detail sheet (streak chart + stats)
 *   - Add-habit bottom sheet
 */

import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { HabitsAgenda } from "../../src/components/HabitsScreen/HabitsAgenda";
import {
  useHabitActions,
  useHabitStats,
  useHabitsToday,
} from "../../src/hooks/goalsHabits";
import type { AddHabitDraft } from "../../src/store/useGoalsHabitsStore";
import type { Habit, HabitCategory } from "../../src/types/goalsHabits";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const { habits, pending, done, due, completionRate } = useHabitsToday();
  const { checkHabit, addHabit, deleteHabit } = useHabitActions();

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const openDetail = useCallback((h: Habit) => setSelectedHabit(h), []);
  const closeDetail = useCallback(() => setSelectedHabit(null), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={s.safe}
        edges={["top"]}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>
              {new Date().toLocaleDateString("uk-UA", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
            <Text style={s.headerTitle}>Звички</Text>
          </View>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => setShowAddSheet(true)}
          >
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <HabitsAgenda habits={habits} />

          {/* Progress ring + summary */}
          <DailySummary
            done={done.length}
            total={due.length}
            rate={completionRate}
          />

          {/* Habit sections */}
          {pending.length > 0 && (
            <Section
              title="До виконання"
              count={pending.length}
            >
              {pending.map((h) => (
                <SwipeableHabitRow
                  key={h.id}
                  habit={h}
                  onCheck={() => checkHabit(h.id)}
                  onPress={() => openDetail(h)}
                  onDelete={() => {
                    Alert.alert("Видалити звичку?", h.title, [
                      { text: "Скасувати", style: "cancel" },
                      {
                        text: "Видалити",
                        style: "destructive",
                        onPress: () => deleteHabit(h.id),
                      },
                    ]);
                  }}
                />
              ))}
            </Section>
          )}

          {done.length > 0 && (
            <Section
              title="Виконано"
              count={done.length}
              muted
            >
              {done.map((h) => (
                <SwipeableHabitRow
                  key={h.id}
                  habit={h}
                  onCheck={() => checkHabit(h.id)}
                  onPress={() => openDetail(h)}
                  onDelete={() => deleteHabit(h.id)}
                  checked
                />
              ))}
            </Section>
          )}

          {habits.length === 0 && (
            <EmptyState onAdd={() => setShowAddSheet(true)} />
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Detail sheet */}
        {selectedHabit && (
          <HabitDetailSheet
            habit={selectedHabit}
            onClose={closeDetail}
          />
        )}

        {/* Add sheet */}
        {showAddSheet && (
          <AddHabitSheet
            onClose={() => setShowAddSheet(false)}
            onSave={(draft) => {
              addHabit(draft);
              setShowAddSheet(false);
            }}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── DailySummary ─────────────────────────────────────────────────────────────

function DailySummary({
  done,
  total,
  rate,
}: {
  done: number;
  total: number;
  rate: number;
}) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference * (1 - rate / 100);

  return (
    <View style={s.summaryCard}>
      <View style={s.ringContainer}>
        {/* SVG ring via View trick — use a canvas-like approach */}
        <View style={s.ringOuter}>
          <View style={s.ringInner}>
            <Text style={s.ringPct}>{rate}%</Text>
          </View>
          {/* Filled arc simulation with border */}
          <View
            style={[
              s.ringArc,
              { borderColor: colors.accent, opacity: rate > 0 ? 1 : 0.1 },
            ]}
          />
        </View>
      </View>
      <View style={s.summaryText}>
        <Text style={s.summaryBig}>
          {done} <Text style={s.summaryOf}>з {total}</Text>
        </Text>
        <Text style={s.summaryLabel}>звичок виконано</Text>
        {rate === 100 && total > 0 && (
          <Text style={s.summaryBonus}>Відмінно! Всі виконано 🎉</Text>
        )}
      </View>
    </View>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  count,
  muted,
  children,
}: {
  title: string;
  count: number;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <View style={s.sectionHead}>
        <Text style={[s.sectionTitle, muted && { color: colors.subtle }]}>
          {title}
        </Text>
        <View style={s.sectionBadge}>
          <Text style={s.sectionBadgeText}>{count}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

// ─── SwipeableHabitRow ────────────────────────────────────────────────────────

function SwipeableHabitRow({
  habit,
  onCheck,
  onPress,
  onDelete,
  checked = false,
}: {
  habit: Habit;
  onCheck: () => void;
  onPress: () => void;
  onDelete: () => void;
  checked?: boolean;
}) {
  const translateX = useSharedValue(0);
  const THRESHOLD = -80;

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
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

  const catColor =
    CAT_OPTIONS.find((c) => c.value === habit.category)?.color ?? colors.muted;

  return (
    <View style={s.swipeWrapper}>
      {/* Delete button revealed on swipe */}
      <TouchableOpacity
        style={s.deleteAction}
        onPress={onDelete}
      >
        <Text style={s.deleteActionText}>🗑</Text>
      </TouchableOpacity>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[s.habitRow, checked && s.habitRowDone, rowStyle]}
        >
          <View style={[s.habitCatBar, { backgroundColor: catColor }]} />

          <TouchableOpacity
            style={s.habitEmoji}
            onPress={onPress}
          >
            <Text style={s.habitEmojiText}>{habit.emoji}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.habitInfo}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[s.habitName, checked && s.habitNameDone]}>
              {habit.title}
            </Text>
            <View style={s.habitMeta}>
              <Text style={s.habitMetaText}>
                {CAT_OPTIONS.find((c) => c.value === habit.category)?.label}
              </Text>
              {habit.streak > 1 && (
                <View style={s.streakPill}>
                  <Text style={s.streakText}>🔥 {habit.streak}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.checkBtn, checked && s.checkBtnDone]}
            onPress={onCheck}
          >
            <Text style={[s.checkMark, checked && s.checkMarkDone]}>
              {checked ? "✓" : ""}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── HabitDetailSheet ─────────────────────────────────────────────────────────

function HabitDetailSheet({
  habit,
  onClose,
}: {
  habit: Habit;
  onClose: () => void;
}) {
  const stats = useHabitStats(habit);

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
        {/* Handle */}
        <View style={s.sheetHandle} />

        <View style={s.sheetHeader}>
          <Text style={s.sheetEmoji}>{habit.emoji}</Text>
          <View>
            <Text style={s.sheetTitle}>{habit.title}</Text>
            <Text style={s.sheetSub}>
              {CAT_OPTIONS.find((c) => c.value === habit.category)?.label}
            </Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={s.statsGrid}>
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

        {/* Mini bar chart — last 7 days */}
        <Text style={s.chartLabel}>Останні 7 днів</Text>
        <View style={s.barChart}>
          {stats.weeklyData.map((v, i) => (
            <View
              key={i}
              style={s.barCol}
            >
              <View style={s.barTrack}>
                <View style={[s.barFill, { height: `${v * 100}%` }]} />
              </View>
              <Text style={s.barDay}>{DAY_LABELS[i]}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.closeSheetBtn}
          onPress={onClose}
        >
          <Text style={s.closeSheetBtnText}>Закрити</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── StatTile ─────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={s.statTile}>
      <Text style={[s.statValue, accent && { color: colors.accent }]}>
        {value}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── AddHabitSheet ────────────────────────────────────────────────────────────

function AddHabitSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (draft: AddHabitDraft) => void;
}) {
  const [emoji, setEmoji] = useState("🎯");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      emoji,
      category,
      frequency: freq,
      targetDays: [],
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
        style={s.sheet}
        entering={SlideInDown}
        exiting={SlideOutDown}
      >
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>Нова звичка</Text>

        {/* Emoji picker */}
        <View style={s.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[s.emojiOpt, emoji === e && s.emojiOptSel]}
              onPress={() => setEmoji(e)}
            >
              <Text style={s.emojiOptText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <TextInput
          style={s.input}
          placeholder="Назва звички"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        {/* Category */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.catRow}
        >
          {CAT_OPTIONS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                s.catChip,
                category === c.value && {
                  borderColor: c.color,
                  backgroundColor: c.color + "18",
                },
              ]}
              onPress={() => setCategory(c.value)}
            >
              <Text
                style={[
                  s.catChipText,
                  category === c.value && { color: c.color },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Frequency */}
        <View style={s.freqRow}>
          {(["daily", "weekly"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.freqOpt, freq === f && s.freqOptSel]}
              onPress={() => setFreq(f)}
            >
              <Text style={[s.freqText, freq === f && s.freqTextSel]}>
                {f === "daily" ? "Щодня" : "Щотижня"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.sheetBtns}>
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
            <Text style={s.btnSaveText}>Додати</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>🌱</Text>
      <Text style={s.emptyTitle}>Немає звичок</Text>
      <Text style={s.emptySub}>
        Додайте першу звичку і починайте будувати кращу версію себе
      </Text>
      <TouchableOpacity
        style={s.emptyBtn}
        onPress={onAdd}
      >
        <Text style={s.emptyBtnText}>Додати звичку</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Colors & Styles ─────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  bg3: "#181b22",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
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
    paddingBottom: 16,
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
  scroll: { flex: 1 },

  // Summary
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ringContainer: { alignItems: "center", justifyContent: "center" },
  ringOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: { alignItems: "center", justifyContent: "center" },
  ringArc: { ...StyleSheet.absoluteFillObject, borderRadius: 32 },
  ringPct: { fontFamily: SERIF, fontSize: 15, color: colors.accent },
  summaryText: { flex: 1 },
  summaryBig: { fontFamily: SERIF, fontSize: 28, color: colors.text },
  summaryOf: { fontSize: 16, color: colors.muted },
  summaryLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  summaryBonus: { fontSize: 11, color: colors.green, marginTop: 6 },

  // Section
  section: { paddingHorizontal: 24, marginBottom: 8 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: colors.muted,
    fontWeight: "500",
  },
  sectionBadge: {
    backgroundColor: colors.bg2,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  sectionBadgeText: { fontSize: 11, color: colors.muted },

  // Habit row
  swipeWrapper: { marginBottom: 8, position: "relative" },
  deleteAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    backgroundColor: "#3a1010",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteActionText: { fontSize: 20 },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg2,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    overflow: "hidden",
    minHeight: 64,
  },
  habitRowDone: { opacity: 0.6 },
  habitCatBar: { width: 3, alignSelf: "stretch" },
  habitEmoji: { width: 48, alignItems: "center" },
  habitEmojiText: { fontSize: 24 },
  habitInfo: { flex: 1, paddingVertical: 12, paddingRight: 8 },
  habitName: { fontSize: 14, color: colors.text, marginBottom: 3 },
  habitNameDone: { color: colors.muted, textDecorationLine: "line-through" },
  habitMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  habitMetaText: { fontSize: 11, color: colors.muted },
  streakPill: {
    backgroundColor: "rgba(200,169,110,0.1)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakText: { fontSize: 10, color: colors.accent },
  checkBtn: {
    width: 52,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnDone: {},
  checkMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    textAlign: "center",
    lineHeight: 25,
    fontSize: 12,
    color: "transparent",
  },
  checkMarkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    color: colors.bg,
  },

  // Detail sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  sheet: {
    backgroundColor: colors.bg2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 3,
    backgroundColor: colors.subtle,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  sheetEmoji: { fontSize: 36 },
  sheetTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  sheetSub: { fontSize: 12, color: colors.muted },
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
  closeSheetBtn: {
    backgroundColor: "rgba(200,169,110,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(200,169,110,0.2)",
  },
  closeSheetBtnText: { fontSize: 14, color: colors.accent },

  // Add sheet
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
    fontSize: 22,
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
