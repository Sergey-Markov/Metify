/**
 * Підсумок прогресу в блоці під календарем Agenda (щоденні vs щотижневі).
 */

import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const SERIF = Platform.select({ ios: "Georgia", android: "serif" });

const colors = {
  bg2: "#111318",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  accent: "#c8a96e",
};

export type AgendaProgressMetrics = {
  dailyDone: number;
  dailyDue: number;
  weeklyDone: number;
  weeklyDue: number;
};

export type AgendaProgressProps = AgendaProgressMetrics & {
  firstItem?: boolean;
};

function progressHint(rate: number): string {
  if (rate >= 1) return "Усе закрито";
  if (rate > 0) return "Є ще що доробити";
  return "Почніть з першої звички";
}

function buildA11yLabel(m: AgendaProgressMetrics): string {
  const parts: string[] = [];
  if (m.dailyDue > 0) {
    parts.push(
      `Щоденні: виконано ${m.dailyDone} з ${m.dailyDue}`,
    );
  }
  if (m.weeklyDue > 0) {
    parts.push(
      `Щотижневі: виконано ${m.weeklyDone} з ${m.weeklyDue}`,
    );
  }
  if (parts.length === 0) {
    return "Немає звичок для відображення прогресу за цей день";
  }
  return parts.join(". ");
}

export function AgendaProgress({
  firstItem,
  dailyDone,
  dailyDue,
  weeklyDone,
  weeklyDue,
}: AgendaProgressProps) {
  const a11yLabel = useMemo(
    () =>
      buildA11yLabel({
        dailyDone,
        dailyDue,
        weeklyDone,
        weeklyDue,
      }),
    [dailyDone, dailyDue, weeklyDone, weeklyDue],
  );

  const dailyRate = dailyDue > 0 ? dailyDone / dailyDue : 0;
  const weeklyRate = weeklyDue > 0 ? weeklyDone / weeklyDue : 0;

  const empty = dailyDue === 0 && weeklyDue === 0;

  return (
    <View
      style={[styles.card, !firstItem && styles.cardFollow]}
      accessibilityRole="summary"
      accessibilityLabel={a11yLabel}
    >
      {empty ? (
        <Text style={styles.muted}>
          Додайте звички, щоб бачити прогрес у календарі
        </Text>
      ) : (
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Щоденні</Text>
            {dailyDue > 0 ? (
              <>
                <Text style={styles.stat}>
                  <Text style={styles.statNum}>{dailyDone}</Text>
                  <Text style={styles.statOf}> / {dailyDue}</Text>
                </Text>
                <Text
                  style={styles.hint}
                  numberOfLines={2}
                >
                  {progressHint(dailyRate)}
                </Text>
              </>
            ) : (
              <Text
                style={styles.mutedSmall}
                numberOfLines={2}
              >
                Немає щоденних
              </Text>
            )}
          </View>

          <View style={styles.dividerV} />

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Щотижневі</Text>
            {weeklyDue > 0 ? (
              <>
                <Text style={styles.stat}>
                  <Text style={styles.statNum}>{weeklyDone}</Text>
                  <Text style={styles.statOf}> / {weeklyDue}</Text>
                </Text>
                <Text
                  style={styles.hint}
                  numberOfLines={2}
                >
                  {progressHint(weeklyRate)}
                </Text>
              </>
            ) : (
              <Text
                style={styles.mutedSmall}
                numberOfLines={2}
              >
                Немає на цей день
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.bg2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.subtle,
  },
  cardFollow: {
    marginTop: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stat: {
    fontFamily: SERIF,
  },
  statNum: {
    fontSize: 22,
    color: colors.accent,
  },
  statOf: {
    fontSize: 15,
    color: colors.muted,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  dividerV: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.subtle,
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  mutedSmall: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
});
