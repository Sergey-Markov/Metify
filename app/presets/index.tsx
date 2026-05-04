import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  GOAL_PRESETS,
  HABIT_PRESETS,
  type GoalPreset,
  type HabitPreset,
} from "../../src/constants/presets";
import { usePresetPickerStore } from "../../src/store/usePresetPickerStore";
import type { GoalCategory, HabitCategory } from "../../src/types/goalsHabits";
import { BtnIcon } from "../../src/UI/BtnIcon";

type PickerMode = "goal" | "habit";
type GoalCategoryFilter = GoalCategory | "all";
type HabitCategoryFilter = HabitCategory | "all";

const GOAL_CATEGORIES: { value: GoalCategoryFilter; label: string }[] = [
  { value: "all", label: "Всі" },
  { value: "career", label: "Кар'єра" },
  { value: "growth", label: "Розвиток" },
  { value: "health", label: "Здоров'я" },
  { value: "finance", label: "Фінанси" },
  { value: "family", label: "Сім'я" },
  { value: "travel", label: "Подорожі" },
  { value: "creative", label: "Творчість" },
  { value: "other", label: "Інше" },
];

const HABIT_CATEGORIES: { value: HabitCategoryFilter; label: string }[] = [
  { value: "all", label: "Всі" },
  { value: "health", label: "Здоров'я" },
  { value: "mind", label: "Розум" },
  { value: "work", label: "Робота" },
  { value: "social", label: "Соціальне" },
  { value: "other", label: "Інше" },
];

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
};

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

export default function PresetsScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const pickerMode: PickerMode = mode === "habit" ? "habit" : "goal";

  const pickHabitPreset = usePresetPickerStore((s) => s.pickHabitPreset);
  const pickGoalPreset = usePresetPickerStore((s) => s.pickGoalPreset);

  const [query, setQuery] = useState("");
  const [goalCategory, setGoalCategory] = useState<GoalCategoryFilter>("all");
  const [habitCategory, setHabitCategory] = useState<HabitCategoryFilter>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGoals = useMemo(() => {
    return GOAL_PRESETS.filter((preset) => {
      const byCategory =
        goalCategory === "all" ? true : preset.category === goalCategory;
      const byQuery =
        normalizedQuery === ""
          ? true
          : preset.title.toLowerCase().includes(normalizedQuery) ||
            preset.milestoneTitles.some((ms) =>
              ms.toLowerCase().includes(normalizedQuery),
            );
      return byCategory && byQuery;
    });
  }, [goalCategory, normalizedQuery]);

  const filteredHabits = useMemo(() => {
    return HABIT_PRESETS.filter((preset) => {
      const byCategory =
        habitCategory === "all" ? true : preset.category === habitCategory;
      const byQuery =
        normalizedQuery === ""
          ? true
          : preset.title.toLowerCase().includes(normalizedQuery);
      return byCategory && byQuery;
    });
  }, [habitCategory, normalizedQuery]);

  const isGoalMode = pickerMode === "goal";
  const title = isGoalMode ? "Шаблони цілей" : "Шаблони звичок";
  const totalCount = isGoalMode ? GOAL_PRESETS.length : HABIT_PRESETS.length;
  const visibleCount = isGoalMode ? filteredGoals.length : filteredHabits.length;

  const onSelectGoal = (preset: GoalPreset) => {
    pickGoalPreset(preset.id);
    router.back();
  };

  const onSelectHabit = (preset: HabitPreset) => {
    pickHabitPreset(preset.id);
    router.back();
  };

  return (
    <SafeAreaView
      style={s.safe}
      edges={["top"]}
    >
      <View style={s.header}>
        <BtnIcon
          onPress={() => router.back()}
          shape="square"
          name="chevron-back"
          accessibilityLabel="Назад"
        />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>
            Показано {visibleCount} з {totalCount}
          </Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={isGoalMode ? "Пошук цілі..." : "Пошук звички..."}
          placeholderTextColor={colors.muted}
          accessibilityLabel="Пошук шаблону"
        />
      </View>

      <FlatList
        horizontal
        data={isGoalMode ? GOAL_CATEGORIES : HABIT_CATEGORIES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={s.filterContent}
        style={s.filterRow}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = isGoalMode
            ? goalCategory === item.value
            : habitCategory === item.value;
          return (
            <TouchableOpacity
              style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => {
                if (isGoalMode) {
                  setGoalCategory(item.value as GoalCategoryFilter);
                } else {
                  setHabitCategory(item.value as HabitCategoryFilter);
                }
              }}
            >
              <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {isGoalMode ? (
        <FlatList
          data={filteredGoals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => onSelectGoal(item)}
              accessibilityRole="button"
              accessibilityLabel={`Обрати шаблон цілі: ${item.title}`}
            >
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardMeta}>
                {GOAL_CATEGORIES.find((cat) => cat.value === item.category)?.label} •{" "}
                {item.priority === "high"
                  ? "Високий пріоритет"
                  : item.priority === "medium"
                    ? "Середній пріоритет"
                    : "Низький пріоритет"}
              </Text>
              <Text
                style={s.cardHint}
                numberOfLines={2}
              >
                {item.milestoneTitles.join(" • ")}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Нічого не знайдено</Text>
              <Text style={s.emptySub}>Спробуйте інший запит або категорію</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => onSelectHabit(item)}
              accessibilityRole="button"
              accessibilityLabel={`Обрати шаблон звички: ${item.title}`}
            >
              <Text style={s.cardTitle}>
                {item.emoji} {item.title}
              </Text>
              <Text style={s.cardMeta}>
                {
                  HABIT_CATEGORIES.find((cat) => cat.value === item.category)
                    ?.label
                }{" "}
                • {item.frequency === "daily" ? "Щодня" : "Щотижня"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyTitle}>Нічого не знайдено</Text>
              <Text style={s.emptySub}>Спробуйте інший запит або категорію</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: { fontFamily: SERIF, fontSize: 28, color: colors.text },
  headerSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  searchInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.bg2,
    fontSize: 15,
  },
  filterRow: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    backgroundColor: "rgba(255,255,255,0.01)",
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.12)",
  },
  filterChipText: { color: colors.muted, fontSize: 13 },
  filterChipTextActive: { color: colors.accent },
  listContent: { padding: 16, gap: 10, paddingBottom: 34 },
  card: {
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    backgroundColor: colors.bg2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: { color: colors.text, fontSize: 16, marginBottom: 6 },
  cardMeta: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  cardHint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  empty: { paddingTop: 80, alignItems: "center" },
  emptyTitle: { fontSize: 18, color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.muted },
});

