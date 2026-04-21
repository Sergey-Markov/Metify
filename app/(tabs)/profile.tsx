/**
 * app/(tabs)/profile.tsx — підсумок профілю таймера та скидання даних.
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { COUNTRY_MAP } from "../../src/constants";
import {
  useLifeTimerStore,
  selectProfile,
  selectAdjustedYears,
} from "../../src/store/useLifeTimerStore";
import type { AlcoholLevel, ActivityLevel, Gender, SleepQuality } from "../../src/types";

const GENDER_UK: Record<Gender, string> = {
  male: "Чоловік",
  female: "Жінка",
  other: "Інше / не вказано",
};

const ALCOHOL_UK: Record<AlcoholLevel, string> = {
  low: "Мало",
  medium: "Помірно",
  high: "Часто",
};

const ACTIVITY_UK: Record<ActivityLevel, string> = {
  low: "Низька",
  medium: "Середня",
  high: "Висока",
};

const SLEEP_UK: Record<SleepQuality, string> = {
  poor: "Поганий",
  average: "Нормальний",
  good: "Чудовий",
};

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
  danger: "#c45a5a",
};

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useLifeTimerStore(selectProfile);
  const adjustedYears = useLifeTimerStore(selectAdjustedYears);
  const lifeExpectancy = useLifeTimerStore((s) => s.lifeExpectancy);
  const resetApp = useLifeTimerStore((s) => s.resetApp);

  const countryLabel = COUNTRY_MAP[profile.country]?.label ?? profile.country;

  const deathLabel = (() => {
    if (!lifeExpectancy?.estimatedDeathDate) return null;
    const d = lifeExpectancy.estimatedDeathDate;
    const date = d instanceof Date ? d : new Date(d as unknown as string);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  })();

  const onReset = useCallback(() => {
    Alert.alert(
      "Скинути дані таймера?",
      "Профіль і результати онбордингу будуть видалені з цього пристрою. Розділи «Цілі» та «Звички» не зміняться.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Скинути",
          style: "destructive",
          onPress: () => {
            resetApp();
            router.replace("/onboarding");
          },
        },
      ]
    );
  }, [resetApp, router]);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Профіль</Text>
        <Text style={s.subtitle}>Дані для розрахунку життєвого таймера</Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Про вас</Text>
          <Row label="Дата народження" value={profile.dateOfBirth || "—"} />
          <Row label="Країна" value={countryLabel} />
          <Row label="Стать" value={GENDER_UK[profile.gender]} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Спосіб життя</Text>
          <Row
            label="Куріння"
            value={profile.lifestyle.smoking ? "Так" : "Ні"}
          />
          <Row label="Алкоголь" value={ALCOHOL_UK[profile.lifestyle.alcohol]} />
          <Row label="Активність" value={ACTIVITY_UK[profile.lifestyle.activity]} />
          <Row label="Сон" value={SLEEP_UK[profile.lifestyle.sleep]} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Оцінка очікуваності</Text>
          <Row
            label="Скориговані роки"
            value={lifeExpectancy ? String(adjustedYears) : "—"}
          />
          {deathLabel ? <Row label="Орієнтовна дата" value={deathLabel} /> : null}
        </View>

        <TouchableOpacity
          style={s.resetBtn}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Скинути дані таймера та пройти онбординг знову"
        >
          <Text style={s.resetBtnText}>Скинути дані таймера</Text>
        </TouchableOpacity>

        <Text style={s.footerNote}>
          Щоб змінити відповіді без повного скидання, наразі скористайся кнопкою
          вище — після онбордингу збережеться новий профіль.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },
  title: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 28,
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.bg2,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.accent,
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.subtle,
  },
  rowLabel: { fontSize: 13, color: colors.muted, flex: 1 },
  rowValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  resetBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(196,90,90,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(196,90,90,0.45)",
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.danger,
  },
  footerNote: {
    marginTop: 16,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
    textAlign: "center",
  },
});
