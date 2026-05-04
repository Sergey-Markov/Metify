/**
 * Habits compact week calendar + selected-day summary.
 */

import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LocaleConfig, WeekCalendar } from "react-native-calendars";

import type { Habit } from "../../types/goalsHabits";
import {
  habitHasCompletionInRange,
  habitLocalDateKey,
  habitWeekRangeKeys,
} from "../../utils/goalsHabits";
import { AgendaProgress } from "./AgendaProgress";

LocaleConfig.locales.uk = {
  monthNames: [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ],
  monthNamesShort: [
    "Січ",
    "Лют",
    "Бер",
    "Кві",
    "Тра",
    "Чер",
    "Лип",
    "Сер",
    "Вер",
    "Жов",
    "Лис",
    "Гру",
  ],
  dayNames: [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П'ятниця",
    "Субота",
  ],
  dayNamesShort: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  today: "Сьогодні",
};
LocaleConfig.defaultLocale = "uk";

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
};

const AGENDA_MIN_HEIGHT = 176;
const AGENDA_PAST_DAYS_WINDOW = 400;
const AGENDA_FUTURE_DAYS_WINDOW = 400;

type HabitAgendaRow = {
  day: string;
  dailyDone: number;
  dailyDue: number;
  dailyRate: number;
  weeklyDone: number;
  weeklyDue: number;
  weeklyRate: number;
};

function buildItemsAndMarkings(
  habits: Habit[],
  from: Date,
  to: Date,
): {
  rowsByDay: Record<string, HabitAgendaRow>;
  markedDates: Record<string, { marked?: boolean; dotColor?: string }>;
} {
  const rowsByDay: Record<string, HabitAgendaRow> = {};
  const markedDates: Record<string, { marked?: boolean; dotColor?: string }> =
    {};
  const todayKey = habitLocalDateKey(new Date());
  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const weeklyAnyDayHabits = habits.filter(
    (h) => h.frequency === "weekly" && h.targetDays.length === 0,
  );
  const weeklyHabitsByDay = new Map<number, Habit[]>();

  for (let day = 0; day < 7; day += 1) {
    weeklyHabitsByDay.set(
      day,
      habits.filter(
        (h) =>
          h.frequency === "weekly" &&
          h.targetDays.length > 0 &&
          h.targetDays.includes(day),
      ),
    );
  }

  const weeklyAnyDayDoneByWeek = new Map<string, number>();

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dayKey = habitLocalDateKey(d);
    const dow = d.getDay();

    const dailyDue = dailyHabits.length;
    const dailyDone = dailyHabits.filter((h) =>
      h.completions.includes(dayKey),
    ).length;
    const dailyRate = dailyDue > 0 ? dailyDone / dailyDue : 0;

    const { start: wStart, end: wEnd } = habitWeekRangeKeys(d);
    const weekKey = `${wStart}_${wEnd}`;
    const weeklyDueFromAnyDayHabits = weeklyAnyDayHabits.length;
    const weeklyDueFromDayHabits = weeklyHabitsByDay.get(dow)?.length ?? 0;
    const weeklyDue = weeklyDueFromAnyDayHabits + weeklyDueFromDayHabits;

    let weeklyDoneFromAnyDayHabits = weeklyAnyDayDoneByWeek.get(weekKey);
    if (weeklyDoneFromAnyDayHabits === undefined) {
      weeklyDoneFromAnyDayHabits = weeklyAnyDayHabits.filter((h) =>
        habitHasCompletionInRange(h, wStart, wEnd),
      ).length;
      weeklyAnyDayDoneByWeek.set(weekKey, weeklyDoneFromAnyDayHabits);
    }

    const weeklyDoneFromDayHabits =
      weeklyHabitsByDay.get(dow)?.filter((h) => h.completions.includes(dayKey))
        .length ?? 0;
    const weeklyDone = weeklyDoneFromAnyDayHabits + weeklyDoneFromDayHabits;
    const weeklyRate = weeklyDue > 0 ? weeklyDone / weeklyDue : 0;

    rowsByDay[dayKey] = {
      day: dayKey,
      dailyDone,
      dailyDue,
      dailyRate,
      weeklyDone,
      weeklyDue,
      weeklyRate,
    };

    const isPast = dayKey < todayKey;
    if (dailyDue > 0 && isPast) {
      if (dailyRate >= 1) {
        markedDates[dayKey] = { marked: true, dotColor: colors.green };
      } else if (dailyRate > 0) {
        markedDates[dayKey] = { marked: true, dotColor: colors.accent };
      }
    }
  }

  return { rowsByDay, markedDates };
}

export type HabitsAgendaProps = {
  habits: Habit[];
};

export const HabitsAgenda = ({ habits }: HabitsAgendaProps) => {
  const { rowsByDay, markedDates } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + AGENDA_FUTURE_DAYS_WINDOW);
    const start = new Date();
    start.setDate(start.getDate() - AGENDA_PAST_DAYS_WINDOW);
    return buildItemsAndMarkings(habits, start, end);
  }, [habits]);

  const defaultSelectedDay = useMemo(() => habitLocalDateKey(new Date()), []);
  const [selectedDay, setSelectedDay] = useState(defaultSelectedDay);

  const selectedRow = rowsByDay[selectedDay] ?? {
    day: selectedDay,
    dailyDone: 0,
    dailyDue: 0,
    dailyRate: 0,
    weeklyDone: 0,
    weeklyDue: 0,
    weeklyRate: 0,
  };

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: colors.bg,
      backgroundColor: colors.bg,
      reservationsBackgroundColor: colors.bg,
      dayTextColor: colors.text,
      textSectionTitleColor: colors.muted,
      selectedDayBackgroundColor: colors.accent,
      selectedDayTextColor: colors.bg,
      todayTextColor: colors.accent,
      dotColor: colors.accent,
      selectedDotColor: colors.green,
      monthTextColor: colors.text,
      agendaDayTextColor: colors.muted,
      agendaDayNumColor: colors.text,
      agendaTodayColor: colors.accent,
    }),
    [],
  );
  const mergedMarkedDates = useMemo(
    () => ({
      ...markedDates,
      [selectedDay]: {
        ...(markedDates[selectedDay] ?? {}),
        selected: true,
        selectedColor: colors.accent,
      },
    }),
    [markedDates, selectedDay],
  );

  const onDayPress = useCallback(
    (day: { dateString: string }) => {
      const next = day.dateString;
      if (!next) return;
      setSelectedDay(next);
    },
    [],
  );

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel="Календар звичок"
    >
      <WeekCalendar
        current={selectedDay}
        markedDates={mergedMarkedDates}
        firstDay={1}
        onDayPress={onDayPress}
        theme={calendarTheme}
      />
      <AgendaProgress
        firstItem
        dailyDone={selectedRow.dailyDone}
        dailyDue={selectedRow.dailyDue}
        weeklyDone={selectedRow.weeklyDone}
        weeklyDue={selectedRow.weeklyDue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: AGENDA_MIN_HEIGHT,
    marginBottom: 8,
  },
});
