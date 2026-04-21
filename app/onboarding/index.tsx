/**
 * app/onboarding/index.tsx
 * Expo Router file-based routing.
 *
 * Screen is purely presentational — all state lives in useOnboardingForm().
 */

import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { COUNTRIES } from "../../src/constants";
import { useOnboardingForm } from "../../src/hooks";
import type {
  ActivityLevel,
  AlcoholLevel,
  CountryCode,
  Gender,
  SleepQuality,
} from "../../src/types";

const STEPS = ["Про вас", "Спосіб життя", "Результат"] as const;

export default function OnboardingScreen() {
  const { profile, setField, setLifestyle, submit } = useOnboardingForm();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    submit();
    router.replace("/home");
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const skipToDefault = () => {
    submit();
    router.replace("/home");
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Progress */}
      <View style={s.progressTrack}>
        <View
          style={[s.progressFill, { width: `${((step + 1) / 3) * 100}%` }]}
        />
      </View>

      {/* Step indicator */}
      <View style={s.stepRow}>
        {STEPS.map((label, i) => (
          <Text
            key={label}
            style={[s.stepDot, i <= step && s.stepDotActive]}
          >
            {i < step ? "✓" : (i + 1).toString()}
          </Text>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <Animated.View
            entering={FadeInRight}
            exiting={FadeOutLeft}
          >
            <Text style={s.heading}>Розкажіть{"\n"}про себе</Text>
            <Text style={s.sub}>
              Для точного розрахунку очікуваної тривалості
            </Text>

            <FieldLabel>Дата народження</FieldLabel>
            <TextInput
              style={s.input}
              placeholder="РРРР-ММ-ДД"
              placeholderTextColor={colors.muted}
              value={profile.dateOfBirth}
              onChangeText={(v) => setField("dateOfBirth", v)}
              keyboardType="numbers-and-punctuation"
            />

            <FieldLabel>Стать</FieldLabel>
            <OptionRow
              options={[
                { value: "male", label: "Чоловік" },
                { value: "female", label: "Жінка" },
                { value: "other", label: "Інше" },
              ]}
              selected={profile.gender}
              onSelect={(v) => setField("gender", v as Gender)}
            />

            <FieldLabel>Країна</FieldLabel>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  s.countryRow,
                  profile.country === c.code && s.countryRowSelected,
                ]}
                onPress={() => setField("country", c.code as CountryCode)}
              >
                <Text
                  style={[
                    s.countryLabel,
                    profile.country === c.code && s.countryLabelSelected,
                  ]}
                >
                  {c.label}
                </Text>
                <Text style={s.countryYears}>{c.baseLifeExpectancy} р.</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View
            entering={FadeInRight}
            exiting={FadeOutLeft}
          >
            <Text style={s.heading}>Спосіб{"\n"}життя</Text>
            <Text style={s.sub}>Враховується при розрахунку тривалості</Text>

            <LifestyleRow
              label="Куріння"
              options={[
                { value: "false", label: "Ні" },
                { value: "true", label: "Так" },
              ]}
              selected={String(profile.lifestyle.smoking)}
              onSelect={(v) => setLifestyle("smoking", v === "true")}
            />
            <LifestyleRow
              label="Алкоголь"
              options={[
                { value: "low", label: "Мало" },
                { value: "medium", label: "Помірно" },
                { value: "high", label: "Часто" },
              ]}
              selected={profile.lifestyle.alcohol}
              onSelect={(v) => setLifestyle("alcohol", v as AlcoholLevel)}
            />
            <LifestyleRow
              label="Активність"
              options={[
                { value: "low", label: "Низька" },
                { value: "medium", label: "Середня" },
                { value: "high", label: "Висока" },
              ]}
              selected={profile.lifestyle.activity}
              onSelect={(v) => setLifestyle("activity", v as ActivityLevel)}
            />
            <LifestyleRow
              label="Сон"
              options={[
                { value: "poor", label: "Поганий" },
                { value: "average", label: "Нормальний" },
                { value: "good", label: "Чудовий" },
              ]}
              selected={profile.lifestyle.sleep}
              onSelect={(v) => setLifestyle("sleep", v as SleepQuality)}
            />
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight}>
            <Text style={s.heading}>Готово</Text>
            <Text style={s.sub}>Натисніть «Далі» щоб побачити ваш таймер</Text>
            <View style={s.readyCard}>
              <Text style={s.readyNote}>
                Розрахунок базується на статистичних даних ВООЗ та наукових
                дослідженнях. Це оцінка для мотивації, а не медичний прогноз.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={handleNext}
        >
          <Text style={s.btnPrimaryText}>
            {step < 2 ? "Далі →" : "Розпочати подорож →"}
          </Text>
        </TouchableOpacity>
        {step > 0 ? (
          <TouchableOpacity
            style={s.btnGhost}
            onPress={handleBack}
          >
            <Text style={s.btnGhostText}>← Назад</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.btnGhost}
            onPress={skipToDefault}
          >
            <Text style={s.btnGhostText}>
              Пропустити, використати середні дані
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.fieldLabel}>{children}</Text>;
}

interface Option {
  value: string;
  label: string;
}

function OptionRow({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={s.optRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[s.optBtn, selected === o.value && s.optBtnSelected]}
          onPress={() => onSelect(o.value)}
        >
          <Text
            style={[s.optBtnText, selected === o.value && s.optBtnTextSelected]}
          >
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function LifestyleRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: Option[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={s.lsRow}>
      <Text style={s.lsLabel}>{label}</Text>
      <View style={s.lsOpts}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[s.lsOpt, selected === o.value && s.lsOptSelected]}
            onPress={() => onSelect(o.value)}
          >
            <Text
              style={[s.lsOptText, selected === o.value && s.lsOptTextSelected]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  bg: "#0a0b0f",
  bg2: "#111318",
  accent: "#c8a96e",
  text: "#f0ede8",
  muted: "#8a8a9a",
  subtle: "#3a3d4a",
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  progressTrack: {
    height: 2,
    backgroundColor: colors.subtle,
    marginHorizontal: 28,
  },
  progressFill: { height: 2, backgroundColor: colors.accent, borderRadius: 1 },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.subtle,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 26,
    fontSize: 12,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    color: "#0a0b0f",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 24 },
  heading: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 32,
    color: colors.text,
    lineHeight: 38,
    marginBottom: 8,
    marginTop: 16,
  },
  sub: { fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 28 },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
  },
  optRow: { flexDirection: "row", gap: 8 },
  optBtn: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  optBtnSelected: {
    backgroundColor: "rgba(200,169,110,0.12)",
    borderColor: colors.accent,
  },
  optBtnText: { fontSize: 13, color: colors.muted },
  optBtnTextSelected: { color: colors.accent },
  countryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 6,
  },
  countryRowSelected: {
    borderColor: colors.accent,
    backgroundColor: "rgba(200,169,110,0.08)",
  },
  countryLabel: { fontSize: 14, color: colors.muted },
  countryLabelSelected: { color: colors.accent },
  countryYears: { fontSize: 12, color: colors.muted },
  lsRow: {
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  lsLabel: { fontSize: 13, color: colors.text },
  lsOpts: { flexDirection: "row", gap: 6 },
  lsOpt: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.subtle,
  },
  lsOptSelected: {
    backgroundColor: "rgba(200,169,110,0.15)",
    borderColor: colors.accent,
  },
  lsOptText: { fontSize: 12, color: colors.muted },
  lsOptTextSelected: { color: colors.accent },
  readyCard: {
    backgroundColor: colors.bg2,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    marginTop: 16,
  },
  readyNote: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: { paddingHorizontal: 28, paddingBottom: 32, paddingTop: 12, gap: 8 },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnPrimaryText: { fontSize: 15, fontWeight: "500", color: "#0a0b0f" },
  btnGhost: { paddingVertical: 12, alignItems: "center" },
  btnGhostText: { fontSize: 13, color: colors.muted },
});
