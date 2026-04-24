/**
 * Habits week/month calendar + selected-day summary (react-native-calendars Agenda).
 */

import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Agenda, LocaleConfig } from "react-native-calendars";
import type { AgendaEntry, AgendaSchedule } from "react-native-calendars";
import type { ReservationListProps } from "react-native-calendars/src/agenda/reservation-list";

import type { Habit } from "../../types/goalsHabits";

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

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  green: "#4ecb8d",
};

const AGENDA_MIN_HEIGHT = 380;

type HabitAgendaRow = AgendaEntry & {
  doneCount: number;
  totalDue: number;
  rate: number;
};

const ROW_HEIGHT = 100;

function isoFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

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
  const totalDue = habits.filter((h) => h.frequency === "daily").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const iso = isoFromDate(d);
    const doneCount = habits.filter((h) => h.completions.includes(iso)).length;
    const rate = totalDue > 0 ? doneCount / totalDue : 0;
    const row: HabitAgendaRow = {
      name: `habits-${iso}`,
      height: ROW_HEIGHT,
      day: iso,
      doneCount,
      totalDue,
      rate,
    };
    items[iso] = [row];

    const dayOnly = new Date(d);
    dayOnly.setHours(0, 0, 0, 0);
    const isPast = dayOnly < today;
    if (totalDue > 0 && isPast) {
      if (rate >= 1) {
        markedDates[iso] = { marked: true, dotColor: colors.green };
      } else if (rate > 0) {
        markedDates[iso] = { marked: true, dotColor: colors.accent };
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
    end.setDate(end.getDate() + 730);
    const start = new Date();
    start.setDate(start.getDate() - 730);
    return buildItemsAndMarkings(habits, start, end);
  }, [habits]);

  const selected = useMemo(() => isoFromDate(new Date()), []);

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
      a.doneCount !== b.doneCount ||
      a.totalDue !== b.totalDue
    );
  }, []);

  const renderItem = useCallback((item: AgendaEntry, firstItem: boolean) => {
    const row = item as HabitAgendaRow;
    return (
      <View
        style={[styles.agendaRow, !firstItem && styles.agendaRowFollow]}
        accessibilityRole="summary"
        accessibilityLabel={
          row.totalDue > 0
            ? `За цей день виконано ${row.doneCount} з ${row.totalDue} щоденних звичок`
            : "Немає щоденних звичок для цього дня"
        }
      >
        {row.totalDue > 0 ? (
          <>
            <Text style={styles.agendaRowTitle}>Прогрес за день</Text>
            <Text style={styles.agendaRowStat}>
              <Text style={styles.agendaRowNum}>{row.doneCount}</Text>
              <Text style={styles.agendaRowOf}> / {row.totalDue}</Text>
            </Text>
            <Text style={styles.agendaRowHint}>
              {row.rate >= 1
                ? "Усі щоденні звички закриті"
                : row.rate > 0
                  ? "Є ще що доробити"
                  : "Почніть з першої звички"}
            </Text>
          </>
        ) : (
          <Text style={styles.agendaRowMuted}>
            Додайте щоденні звички, щоб бачити прогрес по днях
          </Text>
        )}
      </View>
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
            { backgroundColor: agendaTheme?.backgroundColor as string | undefined },
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
              (agendaTheme?.reservationsBackgroundColor as string | undefined) ||
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
  agendaRow: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.bg2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.subtle,
  },
  agendaRowFollow: {
    marginTop: 0,
  },
  agendaRowTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  agendaRowStat: {
    fontFamily: SERIF,
  },
  agendaRowNum: {
    fontSize: 26,
    color: colors.accent,
  },
  agendaRowOf: {
    fontSize: 18,
    color: colors.muted,
  },
  agendaRowHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
  },
  agendaRowMuted: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
});
