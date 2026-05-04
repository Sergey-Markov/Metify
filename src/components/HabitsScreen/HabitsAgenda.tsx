/**
 * Habits week/month calendar + selected-day summary (react-native-calendars Agenda).
 */

import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { AgendaEntry, AgendaSchedule } from "react-native-calendars";
import { Agenda, LocaleConfig } from "react-native-calendars";
import type { ReservationListProps } from "react-native-calendars/src/agenda/reservation-list";

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

const AGENDA_MIN_HEIGHT = 248;
const ROW_HEIGHT = 118;
const AGENDA_PAST_DAYS_WINDOW = 400;
const AGENDA_FUTURE_DAYS_WINDOW = 400;

type HabitAgendaRow = AgendaEntry & {
  day: string;
  dailyDone: number;
  dailyDue: number;
  dailyRate: number;
  weeklyDone: number;
  weeklyDue: number;
  weeklyRate: number;
};

/** Same as library `toMarkingFormat` (local days, no UTC shift). */
function dateKeyFromAgendaDay(d: {
  getFullYear: () => number;
  getMonth: () => number;
  getDate: () => number;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildItemsAndMarkings(
  habits: Habit[],
  from: Date,
  to: Date,
): {
  items: AgendaSchedule;
  markedDates: Record<string, { marked?: boolean; dotColor?: string }>;
} {
  const items: AgendaSchedule = {};
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

    const row: HabitAgendaRow = {
      name: `habits-${dayKey}`,
      height: ROW_HEIGHT,
      day: dayKey,
      dailyDone,
      dailyDue,
      dailyRate,
      weeklyDone,
      weeklyDue,
      weeklyRate,
    };
    items[dayKey] = [row];

    const isPast = dayKey < todayKey;
    if (dailyDue > 0 && isPast) {
      if (dailyRate >= 1) {
        markedDates[dayKey] = { marked: true, dotColor: colors.green };
      } else if (dailyRate > 0) {
        markedDates[dayKey] = { marked: true, dotColor: colors.accent };
      }
    }
  }

  return { items, markedDates };
}

export type HabitsAgendaProps = {
  habits: Habit[];
};

export const HabitsAgenda = ({ habits }: HabitsAgendaProps) => {
  const { items, markedDates } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + AGENDA_FUTURE_DAYS_WINDOW);
    const start = new Date();
    start.setDate(start.getDate() - AGENDA_PAST_DAYS_WINDOW);
    return buildItemsAndMarkings(habits, start, end);
  }, [habits]);

  const selected = useMemo(() => habitLocalDateKey(new Date()), []);

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

  const rowHasChanged = useCallback((r1: AgendaEntry, r2: AgendaEntry) => {
    const a = r1 as HabitAgendaRow;
    const b = r2 as HabitAgendaRow;
    return (
      a.day !== b.day ||
      a.dailyDone !== b.dailyDone ||
      a.dailyDue !== b.dailyDue ||
      a.weeklyDone !== b.weeklyDone ||
      a.weeklyDue !== b.weeklyDue
    );
  }, []);

  const renderItem = useCallback((item: AgendaEntry, firstItem: boolean) => {
    const row = item as HabitAgendaRow;
    return (
      <AgendaProgress
        firstItem={firstItem}
        dailyDone={row.dailyDone}
        dailyDue={row.dailyDue}
        weeklyDone={row.weeklyDone}
        weeklyDue={row.weeklyDue}
      />
    );
  }, []);

  const renderEmptyData = useCallback(
    () => (
      <View style={styles.staticListHost}>
        <ActivityIndicator color={colors.accent} />
      </View>
    ),
    [],
  );

  /** Avoid Agenda's inner FlatList (nested in screen ScrollView + update loop on new prop refs). */
  const renderList = useCallback((listProps: ReservationListProps) => {
    const {
      items: agendaItems,
      selectedDay,
      renderItem: ri,
      renderEmptyData: red,
      theme: agendaTheme,
    } = listProps;

    if (!selectedDay) {
      return (
        <View style={styles.staticListHost}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    const dateKey = dateKeyFromAgendaDay(selectedDay);
    const dayItems = agendaItems?.[dateKey];

    if (!agendaItems || !dayItems?.length) {
      return (
        <View
          style={[
            styles.staticListHost,
            {
              backgroundColor: agendaTheme?.backgroundColor as
                | string
                | undefined,
            },
          ]}
        >
          {red?.() ?? <ActivityIndicator color={colors.accent} />}
        </View>
      );
    }

    return (
      <View
        style={[
          styles.staticListHost,
          {
            backgroundColor:
              (agendaTheme?.reservationsBackgroundColor as
                | string
                | undefined) ||
              (agendaTheme?.backgroundColor as string | undefined),
          },
        ]}
      >
        {dayItems.map((reservation, i) => (
          <View key={`${reservation.name}-${i}`}>
            {ri?.(reservation, i === 0)}
          </View>
        ))}
      </View>
    );
  }, []);

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel="Календар звичок"
    >
      <Agenda
        items={items}
        selected={selected}
        markedDates={markedDates}
        showOnlySelectedDayItems
        hideKnob
        firstDay={1}
        pastScrollRange={12}
        futureScrollRange={12}
        rowHasChanged={rowHasChanged}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}
        renderList={renderList}
        theme={calendarTheme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    minHeight: AGENDA_MIN_HEIGHT,
    height: AGENDA_MIN_HEIGHT,
    marginBottom: 8,
  },
  staticListHost: {
    flexGrow: 1,
    minHeight: ROW_HEIGHT + 48,
    justifyContent: "flex-start",
  },
});
