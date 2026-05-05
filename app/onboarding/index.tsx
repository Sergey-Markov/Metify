/**
 * app/onboarding/index.tsx
 * Expo Router file-based routing.
 *
 * Screen is purely presentational — all state lives in useOnboardingForm().
 */

import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { COUNTRIES } from "../../src/constants";
import { useOnboardingForm } from "../../src/hooks";
import {
  generateLifeExpectancyEstimateWithAI,
  type LifeExpectancyAIResult,
} from "../../src/services/ai/lifeExpectancyGenerator";
import { calculateLifeExpectancy } from "../../src/utils/lifeCalculator";
import type {
  ActivityLevel,
  AdjustmentFactor,
  AlcoholLevel,
  CountryCode,
  Gender,
  LifeExpectancyResult,
  SleepQuality,
  SmokingStatus,
  StressLevel,
  UserProfile,
  WorkType,
} from "../../src/types";

const STEPS = ["Про вас", "Базові звички", "Додатково", "Результат"] as const;

const BIRTH_DATE_MIN = new Date(1900, 0, 1);
const FALLBACK_ESTIMATE: LifeExpectancyAIResult = {
  estimatedYears: 78,
  confidence: "low",
  topFactors: [],
  improvementPotentialDays: 0,
};

function buildProfileSnapshot(profile: UserProfile): string {
  return JSON.stringify(profile);
}

function buildLifeExpectancyFromAI(params: {
  profile: UserProfile;
  baselineYears: number;
  estimate: LifeExpectancyAIResult;
}): LifeExpectancyResult {
  const { profile, baselineYears, estimate } = params;
  const dob = new Date(profile.dateOfBirth);
  const estimatedDeathDate = new Date(dob);
  estimatedDeathDate.setFullYear(dob.getFullYear() + estimate.estimatedYears);

  const factors: AdjustmentFactor[] = [
    { label: `Базова (${profile.country})`, delta: baselineYears, category: "base" },
    ...estimate.topFactors.map((factor) => ({
      label: `AI: ${formatFactorName(factor.name)}`,
      delta: factor.impactYears,
      category: (factor.impactYears >= 0 ? "positive" : "negative") as
        | "positive"
        | "negative",
    })),
  ];

  return {
    baseYears: baselineYears,
    adjustedYears: estimate.estimatedYears,
    estimatedDeathDate,
    factors,
  };
}

export default function OnboardingScreen() {
  const { profile, setField, setLifestyle, submit } = useOnboardingForm();
  const [step, setStep] = useState(0);
  const [aiEstimate, setAiEstimate] = useState<LifeExpectancyAIResult | null>(
    null,
  );
  const [estimateSource, setEstimateSource] = useState<"ai" | "fallback">(
    "fallback",
  );
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [isEstimateLoading, setEstimateLoading] = useState(false);

  const baselineYears = useMemo(() => {
    const countryConfig = COUNTRIES.find(
      (item) => item.code === profile.country,
    );
    return (
      countryConfig?.baseLifeExpectancy ?? FALLBACK_ESTIMATE.estimatedYears
    );
  }, [profile.country]);

  useEffect(() => {
    if (step !== 3) return;

    let isMounted = true;
    const loadEstimate = async () => {
      setEstimateLoading(true);
      try {
        const estimate = await generateLifeExpectancyEstimateWithAI({
          baseLifeExpectancyYears: baselineYears,
          smokes: profile.lifestyle.smoking,
          drinks:
            profile.lifestyle.alcohol === "high" ||
            profile.lifestyle.alcohol === "medium",
          sportActivity: profile.lifestyle.activity,
          additionalNotes: profile.additionalNotes,
          goalsProgress: 50,
          habitConsistency:
            profile.lifestyle.activityMinutesPerWeek >= 150 ? 0.7 : 0.45,
          shortActionsCompletionRate:
            profile.lifestyle.sleepHours >= 7 ? 0.7 : 0.45,
          profileSnapshot: buildProfileSnapshot(profile),
        });
        if (isMounted) {
          setAiEstimate(estimate);
          setEstimateSource("ai");
          setEstimateError(null);
        }
      } catch (error) {
        if (isMounted) {
          setAiEstimate(null);
          setEstimateSource("fallback");
          setEstimateError(error instanceof Error ? error.message : "Unknown AI error");
        }
      } finally {
        if (isMounted) {
          setEstimateLoading(false);
        }
      }
    };

    void loadEstimate();

    return () => {
      isMounted = false;
    };
  }, [
    baselineYears,
    profile,
    profile.lifestyle.activity,
    profile.lifestyle.activityMinutesPerWeek,
    profile.lifestyle.alcohol,
    profile.lifestyle.sleepHours,
    profile.lifestyle.smoking,
    step,
  ]);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    try {
      const estimate =
        aiEstimate ??
        (await generateLifeExpectancyEstimateWithAI({
          baseLifeExpectancyYears: baselineYears,
          smokes: profile.lifestyle.smoking,
          drinks:
            profile.lifestyle.alcohol === "high" ||
            profile.lifestyle.alcohol === "medium",
          sportActivity: profile.lifestyle.activity,
          additionalNotes: profile.additionalNotes,
          goalsProgress: 50,
          habitConsistency:
            profile.lifestyle.activityMinutesPerWeek >= 150 ? 0.7 : 0.45,
          shortActionsCompletionRate:
            profile.lifestyle.sleepHours >= 7 ? 0.7 : 0.45,
          profileSnapshot: buildProfileSnapshot(profile),
        }));

      const aiLifeExpectancy = buildLifeExpectancyFromAI({
        profile,
        baselineYears,
        estimate,
      });
      setEstimateSource("ai");
      setEstimateError(null);
      submit(aiLifeExpectancy);
    } catch (error) {
      setEstimateSource("fallback");
      setEstimateError(error instanceof Error ? error.message : "Unknown AI error");
      submit(calculateLifeExpectancy(profile));
    }

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
          style={[
            s.progressFill,
            { width: `${((step + 1) / STEPS.length) * 100}%` },
          ]}
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

      <View style={s.keyboardArea}>
        <KeyboardAwareScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 24 : 64}
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
            <BirthDateField
              valueYmd={profile.dateOfBirth}
              onChangeYmd={(v) => setField("dateOfBirth", v)}
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
            <Text style={s.heading}>Базові{"\n"}звички</Text>
            <Text style={s.sub}>Головні фактори для первинного розрахунку</Text>

            <LifestyleRow
              label="Куріння"
              options={[
                { value: "never", label: "Не палю" },
                { value: "former", label: "Кинув" },
                { value: "current", label: "Палю" },
              ]}
              selected={profile.lifestyle.smokingStatus}
              onSelect={(v) => {
                const smokingStatus = v as SmokingStatus;
                setLifestyle("smokingStatus", smokingStatus);
                setLifestyle("smoking", smokingStatus === "current");
              }}
            >
              {profile.lifestyle.smokingStatus === "current" ? (
                <View style={s.lsInlineInputWrap}>
                  <Text style={s.lsInlineLabel}>Сигарет на день</Text>
                  <NumberInput
                    value={profile.lifestyle.cigarettesPerDay}
                    onChange={(value) =>
                      setLifestyle(
                        "cigarettesPerDay",
                        clampNumber(value, 0, 60),
                      )
                    }
                    accessibilityLabel="Кількість сигарет на день"
                  />
                </View>
              ) : null}
            </LifestyleRow>
            <LifestyleRow
              label="Алкоголь"
              options={[
                { value: "none", label: "Не вживаю" },
                { value: "low", label: "Мало" },
                { value: "medium", label: "Помірно" },
                { value: "high", label: "Часто" },
              ]}
              selected={profile.lifestyle.alcohol}
              onSelect={(v) => {
                const alcoholLevel = v as AlcoholLevel;
                setLifestyle("alcohol", alcoholLevel);
                if (alcoholLevel === "none") {
                  setLifestyle("alcoholUnitsPerWeek", 0);
                }
              }}
            >
              {profile.lifestyle.alcohol !== "none" ? (
                <View style={s.lsInlineInputWrap}>
                  <Text style={s.lsInlineLabel}>
                    Стандартні порції алкоголю на тиждень
                  </Text>
                  <Text style={s.lsInlineHint}>
                    1 порція ≈ 330 мл пива або 150 мл вина, або 45 мл міцного
                    алкоголю
                  </Text>
                  <NumberInput
                    value={profile.lifestyle.alcoholUnitsPerWeek}
                    onChange={(value) =>
                      setLifestyle(
                        "alcoholUnitsPerWeek",
                        clampNumber(value, 0, 50),
                      )
                    }
                    accessibilityLabel="Кількість стандартних алкогольних порцій на тиждень"
                  />
                </View>
              ) : null}
            </LifestyleRow>
            <LifestyleRow
              label="Активність"
              options={[
                { value: "low", label: "Низька" },
                { value: "medium", label: "Середня" },
                { value: "high", label: "Висока" },
              ]}
              selected={profile.lifestyle.activity}
              onSelect={(v) => setLifestyle("activity", v as ActivityLevel)}
            >
              <View style={s.lsInlineInputWrap}>
                <Text style={s.lsInlineLabel}>Вид спорту</Text>
                <TextInput
                  style={s.input}
                  value={profile.lifestyle.activityType}
                  onChangeText={(value) => setLifestyle("activityType", value)}
                  placeholder="Напр. біг, плавання, йога, зал"
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="Вид спорту або основної активності"
                />
                <Text style={s.lsInlineLabel}>
                  Хвилин активності на тиждень
                </Text>
                <NumberInput
                  value={profile.lifestyle.activityMinutesPerWeek}
                  onChange={(value) =>
                    setLifestyle(
                      "activityMinutesPerWeek",
                      clampNumber(value, 0, 1200),
                    )
                  }
                  accessibilityLabel="Хвилин активності на тиждень"
                />
              </View>
            </LifestyleRow>
            <LifestyleRow
              label="Сон"
              options={[
                { value: "poor", label: "Поганий" },
                { value: "average", label: "Нормальний" },
                { value: "good", label: "Чудовий" },
              ]}
              selected={profile.lifestyle.sleep}
              onSelect={(v) => setLifestyle("sleep", v as SleepQuality)}
            >
              <View style={s.lsInlineInputWrap}>
                <Text style={s.lsInlineLabel}>Годин сну на добу</Text>
                <DecimalInput
                  value={profile.lifestyle.sleepHours}
                  min={3}
                  max={12}
                  onChange={(value) => setLifestyle("sleepHours", value)}
                  accessibilityLabel="Середня кількість годин сну на добу"
                />
              </View>
            </LifestyleRow>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View
            entering={FadeInRight}
            exiting={FadeOutLeft}
          >
            <Text style={s.heading}>Додаткові{"\n"}фактори</Text>
            <Text style={s.sub}>Опціонально, але підвищує точність оцінки</Text>

            <FieldLabel>Зріст (см)</FieldLabel>
            <DecimalInput
              value={profile.lifestyle.heightCm}
              min={0}
              max={230}
              onChange={(value) => setLifestyle("heightCm", value)}
              accessibilityLabel="Зріст у сантиметрах"
            />

            <FieldLabel>Вага (кг)</FieldLabel>
            <DecimalInput
              value={profile.lifestyle.weightKg}
              min={0}
              max={250}
              onChange={(value) => setLifestyle("weightKg", value)}
              accessibilityLabel="Вага у кілограмах"
            />

            <View style={{ marginTop: 12 }}>
              <LifestyleRow
                label="Рівень стресу"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4" },
                  { value: "5", label: "5" },
                ]}
                selected={String(profile.lifestyle.stressLevel)}
                onSelect={(v) =>
                  setLifestyle("stressLevel", Number(v) as StressLevel)
                }
              />
            </View>
            <View style={{ marginTop: 12 }}>
              <LifestyleRow
                label="Тип роботи"
                options={[
                  { value: "sedentary", label: "Сидяча" },
                  { value: "mixed", label: "Змішана" },
                  { value: "physical", label: "Фізична" },
                  { value: "night_shift", label: "Нічні зміни" },
                  { value: "irregular", label: "Нерегулярний графік" },
                ]}
                selected={profile.lifestyle.workType}
                onSelect={(v) => setLifestyle("workType", v as WorkType)}
                scrollableOptions
              >
                <View style={s.lsInlineInputWrap}>
                  <Text style={s.lsInlineLabel}>Професія / роль</Text>
                  <TextInput
                    style={s.input}
                    value={profile.lifestyle.profession}
                    onChangeText={(value) => setLifestyle("profession", value)}
                    placeholder="Напр. дизайнер, водій, інженер"
                    placeholderTextColor={colors.muted}
                    accessibilityLabel="Професія або робоча роль"
                  />
                  <Text style={s.lsInlineLabel}>Годин роботи на тиждень</Text>
                  <NumberInput
                    value={profile.lifestyle.workHoursPerWeek}
                    onChange={(value) =>
                      setLifestyle(
                        "workHoursPerWeek",
                        clampNumber(value, 0, 100),
                      )
                    }
                    accessibilityLabel="Кількість годин роботи на тиждень"
                  />
                </View>
              </LifestyleRow>
            </View>

            <FieldLabel>Соціальні контакти на тиждень</FieldLabel>
            <Text style={s.lsInlineHint}>
              Рахуй живі або особисті розмови з емоційною підтримкою (сім&#39;я,
              друзі, партнер) тривалістю від 10-15 хв. Короткі робочі чати,
              переписки чи формальні дзвінки не враховуй.
            </Text>
            <NumberInput
              value={profile.lifestyle.socialConnectionsPerWeek}
              onChange={(value) =>
                setLifestyle(
                  "socialConnectionsPerWeek",
                  clampNumber(value, 0, 30),
                )
              }
              accessibilityLabel="Кількість соціальних контактів на тиждень"
            />
            <FieldLabel>Статеві контакти на місяць</FieldLabel>
            <Text style={s.lsInlineHint}>
              Вкажи середню кількість статевих контактів за останні 2-3 місяці.
              Це поле використовується лише для орієнтовної оцінки
              lifestyle-факторів.
            </Text>
            <NumberInput
              value={profile.lifestyle.sexualContactsPerMonth}
              onChange={(value) =>
                setLifestyle(
                  "sexualContactsPerMonth",
                  clampNumber(value, 0, 60),
                )
              }
              accessibilityLabel="Кількість статевих контактів на місяць"
            />

            <View style={{ marginTop: 12 }}>
              <Text style={s.lsInlineHint}>
                Профілактичний медогляд 1 раз на рік: базові аналізи, тиск,
                консультація сімейного лікаря.
              </Text>
              <LifestyleRow
                label="Щорічний профілактичний медогляд"
                options={[
                  { value: "true", label: "Так" },
                  { value: "false", label: "Ні" },
                ]}
                selected={String(profile.lifestyle.annualCheckup)}
                onSelect={(v) => setLifestyle("annualCheckup", v === "true")}
              />
            </View>

            <FieldLabel>Хронічні стани</FieldLabel>
            <View style={s.lsRow}>
              <ToggleRow
                label="Гіпертонія"
                value={profile.lifestyle.chronicConditions.hypertension}
                onChange={(value) =>
                  setLifestyle("chronicConditions", {
                    ...profile.lifestyle.chronicConditions,
                    hypertension: value,
                  })
                }
              />
              <ToggleRow
                label="Діабет"
                value={profile.lifestyle.chronicConditions.diabetes}
                onChange={(value) =>
                  setLifestyle("chronicConditions", {
                    ...profile.lifestyle.chronicConditions,
                    diabetes: value,
                  })
                }
              />
              <ToggleRow
                label="Серцево-судинні"
                value={profile.lifestyle.chronicConditions.cardiovascular}
                onChange={(value) =>
                  setLifestyle("chronicConditions", {
                    ...profile.lifestyle.chronicConditions,
                    cardiovascular: value,
                  })
                }
              />
            </View>

            <FieldLabel>Інше, що ви хотіли б повідомити</FieldLabel>
            <TextInput
              style={[s.input, s.notesInput]}
              value={profile.additionalNotes}
              onChangeText={(value) => setField("additionalNotes", value)}
              placeholder="Будь-яка додаткова інформація (опціонально)"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Інше, що ви хотіли б повідомити"
              accessibilityHint="Опціональне текстове поле для додаткової інформації"
            />
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight}>
            <Text style={s.heading}>Готово</Text>
            <Text style={s.sub}>Натисніть «Далі» щоб побачити ваш таймер</Text>
            <View style={s.readyCard}>
              <Text style={s.readyNote}>
                Розрахунок базується на статистичних даних ВООЗ та наукових
                дослідженнях. Це оцінка для мотивації, а не медичний прогноз.
              </Text>
            </View>
            <View
              style={s.resultCard}
              accessibilityLabel="Прогноз тривалості життя"
            >
              <View style={s.resultHeaderRow}>
                <Text style={s.resultTitle}>Ваш прогноз</Text>
                <View style={s.confidenceBadge}>
                  <Text style={s.confidenceBadgeText}>
                    {toConfidenceLabel(aiEstimate?.confidence ?? "low")}
                  </Text>
                </View>
              </View>
              <Text style={s.resultMetric}>
                {baselineYears} →{" "}
                {(aiEstimate ?? FALLBACK_ESTIMATE).estimatedYears} років
              </Text>
              <Text style={s.resultHint}>
                {isEstimateLoading
                  ? "Оновлюємо персональну оцінку..."
                  : "ШІ уточнив базовий прогноз з урахуванням ваших звичок."}
              </Text>
              <Text style={s.resultGain}>
                {(aiEstimate ?? FALLBACK_ESTIMATE).improvementPotentialDays > 0
                  ? `Потенціал покращення: +${
                      (aiEstimate ?? FALLBACK_ESTIMATE).improvementPotentialDays
                    } днів`
                  : "Потенціал покращення потребує уточнення після додаткових даних"}
              </Text>
              {__DEV__ ? (
                <Text style={s.resultDebugBadge}>
                  Джерело оцінки: {estimateSource === "ai" ? "AI" : "Fallback"}
                </Text>
              ) : null}
              {__DEV__ && estimateError ? (
                <Text style={s.resultDebugBadge}>AI error: {estimateError}</Text>
              ) : null}
              {(aiEstimate?.topFactors ?? []).slice(0, 3).map((factor) => (
                <Text
                  key={`${factor.name}-${factor.impactYears}`}
                  style={s.resultFactor}
                  accessibilityLabel={`Фактор ${formatFactorName(factor.name)} вплив ${factor.impactYears} років`}
                >
                  • {formatFactorName(factor.name)}:{" "}
                  {factor.impactYears > 0 ? "+" : ""}
                  {factor.impactYears} р.
                </Text>
              ))}
            </View>
          </Animated.View>
        )}
        </KeyboardAwareScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={handleNext}
          >
            <Text style={s.btnPrimaryText}>
              {step < STEPS.length - 1 ? "Далі →" : "Розпочати подорож →"}
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
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.fieldLabel}>{children}</Text>;
}

function parseYmd(ymd: string): Date {
  const [y, mo, d] = ymd.split("-").map((n) => Number.parseInt(n, 10));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return new Date(1990, 0, 1);
  }
  return new Date(y, mo - 1, d);
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toConfidenceLabel(
  confidence: LifeExpectancyAIResult["confidence"],
): string {
  if (confidence === "high") return "Висока впевненість";
  if (confidence === "medium") return "Середня впевненість";
  return "Базова оцінка";
}

function formatFactorName(name: string): string {
  const map: Record<string, string> = {
    smoking_status: "Куріння",
    alcohol_pattern: "Алкоголь",
    physical_activity: "Фізична активність",
    sleep_quality: "Сон",
    stress_load: "Стрес",
    unspecified_factor: "Інші фактори",
  };
  return map[name] ?? name.replaceAll("_", " ");
}

function formatBirthUk(ymd: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parseYmd(ymd));
  } catch {
    return ymd;
  }
}

function BirthDateField({
  valueYmd,
  onChangeYmd,
}: {
  valueYmd: string;
  onChangeYmd: (v: string) => void;
}) {
  const [androidOpen, setAndroidOpen] = useState(false);
  const ymd = valueYmd || "1990-01-01";
  const date = useMemo(() => parseYmd(ymd), [ymd]);
  const maximumDate = useMemo(() => new Date(), []);

  const onChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setAndroidOpen(false);
      if (event.type === "set" && selected) {
        onChangeYmd(toYmd(selected));
      }
      return;
    }
    if (selected) {
      onChangeYmd(toYmd(selected));
    }
  };

  if (Platform.OS === "web") {
    return (
      <TextInput
        style={s.input}
        placeholder="РРРР-ММ-ДД"
        placeholderTextColor={colors.muted}
        value={valueYmd}
        onChangeText={onChangeYmd}
        keyboardType="numbers-and-punctuation"
        accessibilityLabel="Дата народження, формат РРРР-ММ-ДД"
      />
    );
  }

  return (
    <View>
      {Platform.OS === "android" ? (
        <>
          <TouchableOpacity
            style={s.dateTrigger}
            onPress={() => setAndroidOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Обрати дату народження"
          >
            <Text style={s.dateTriggerText}>{formatBirthUk(ymd)}</Text>
            <Text style={s.dateTriggerHint}>Натисніть, щоб змінити</Text>
          </TouchableOpacity>
          {androidOpen ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              design="material"
              title="Дата народження"
              onChange={onChange}
              minimumDate={BIRTH_DATE_MIN}
              maximumDate={maximumDate}
              positiveButton={{
                label: "Готово",
                textColor: colors.accent,
              }}
              negativeButton={{
                label: "Скасувати",
                textColor: colors.muted,
              }}
            />
          ) : null}
        </>
      ) : (
        <View
          style={s.datePickerWrap}
          accessibilityLabel="Вибір дати народження"
        >
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={onChange}
            minimumDate={BIRTH_DATE_MIN}
            maximumDate={maximumDate}
            locale="uk_UA"
            themeVariant="dark"
            textColor={colors.text}
            accentColor={colors.accent}
            style={{ backgroundColor: colors.bg2 }}
          />
        </View>
      )}
    </View>
  );
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
  children,
  scrollableOptions = false,
}: {
  label: string;
  options: Option[];
  selected: string;
  onSelect: (v: string) => void;
  children?: React.ReactNode;
  scrollableOptions?: boolean;
}) {
  const optionsContent = (
    <>
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
    </>
  );

  return (
    <View style={s.lsRow}>
      <Text style={s.lsLabel}>{label}</Text>
      {scrollableOptions ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.lsOptsScrollableContent}
          style={s.lsOptsScrollable}
        >
          {optionsContent}
        </ScrollView>
      ) : (
        <View style={s.lsOpts}>{optionsContent}</View>
      )}
      {children}
    </View>
  );
}

function NumberInput({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <TextInput
      style={s.input}
      keyboardType="number-pad"
      value={text}
      onChangeText={(text) => {
        const sanitized = text.replace(/[^\d]/g, "");
        setText(sanitized);

        if (sanitized === "") {
          return;
        }

        const parsed = Number.parseInt(sanitized, 10);
        if (Number.isNaN(parsed)) {
          return;
        }

        onChange(parsed);
      }}
      onBlur={() => {
        if (text === "") {
          setText(String(value));
          return;
        }
        const parsed = Number.parseInt(text, 10);
        if (Number.isNaN(parsed)) {
          setText(String(value));
          return;
        }
        setText(String(parsed));
        onChange(parsed);
      }}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

function DecimalInput({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <TextInput
      style={s.input}
      keyboardType="decimal-pad"
      value={text}
      onChangeText={(text) => {
        const sanitized = text
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
          .replace(/(\..*?)\..*/g, "$1");

        setText(sanitized);

        if (sanitized === "" || sanitized === ".") {
          return;
        }

        const parsed = Number.parseFloat(sanitized);
        if (Number.isNaN(parsed)) {
          return;
        }
        onChange(parsed);
      }}
      onBlur={() => {
        const parsed = Number.parseFloat(text);
        if (Number.isNaN(parsed)) {
          const fallbackValue = clampNumber(value, min, max);
          setText(String(fallbackValue));
          onChange(fallbackValue);
          return;
        }
        const clamped = clampNumber(parsed, min, max);
        setText(String(clamped));
        onChange(clamped);
      }}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.lsLabel}>{label}</Text>
      <TouchableOpacity
        style={[s.lsOpt, value && s.lsOptSelected]}
        onPress={() => onChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel={label}
      >
        <Text style={[s.lsOptText, value && s.lsOptTextSelected]}>
          {value ? "Так" : "Ні"}
        </Text>
      </TouchableOpacity>
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
  keyboardArea: { flex: 1 },
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
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },
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
  notesInput: {
    minHeight: 104,
  },
  dateTrigger: {
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateTriggerText: { fontSize: 16, color: colors.text },
  dateTriggerHint: { fontSize: 12, color: colors.muted, marginTop: 4 },
  datePickerWrap: {
    backgroundColor: colors.bg2,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    borderRadius: 12,
    overflow: "hidden",
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
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  lsLabel: { fontSize: 13, color: colors.text },
  lsOpts: { flexDirection: "row", gap: 6 },
  lsOptsScrollable: { marginHorizontal: -16, paddingHorizontal: 16 },
  lsOptsScrollableContent: { flexDirection: "row", gap: 6, paddingRight: 24 },
  lsInlineInputWrap: { marginTop: 2, gap: 6 },
  lsInlineLabel: { fontSize: 12, color: colors.muted },
  lsInlineHint: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
    marginBottom: 6,
  },
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
  resultCard: {
    marginTop: 12,
    backgroundColor: colors.bg2,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.subtle,
    padding: 16,
    gap: 8,
  },
  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  confidenceBadge: {
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(200,169,110,0.12)",
  },
  confidenceBadgeText: {
    fontSize: 11,
    color: colors.accent,
  },
  resultMetric: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "600",
  },
  resultHint: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  resultGain: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 2,
  },
  resultDebugBadge: {
    fontSize: 11,
    color: colors.muted,
  },
  resultFactor: {
    fontSize: 12,
    color: colors.muted,
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
