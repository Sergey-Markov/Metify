import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LifeExpectancyAIResult } from "../ai/lifeExpectancyGenerator";

const LIFE_EXPECTANCY_CACHE_KEY = "ai-life-expectancy-v1";

export interface LifeExpectancyCacheRecord {
  years: number;
  baselineYears: number;
  refinedYears: number | null;
  confidence: "low" | "medium" | "high";
  topFactors: LifeExpectancyAIResult["topFactors"];
  improvementPotentialDays: number;
  calculatedAt: string;
  profileSignature: string;
  behaviorScore: number;
}

type LegacyLifeExpectancyCacheRecord = {
  years: number;
  calculatedAt: string;
  profileSignature: string;
  behaviorScore: number;
};

function isValidConfidence(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

function normalizeFactors(value: unknown): LifeExpectancyAIResult["topFactors"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { name?: unknown; impactYears?: unknown } =>
        Boolean(item && typeof item === "object"),
    )
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "unspecified_factor",
      impactYears: typeof item.impactYears === "number" ? item.impactYears : 0,
    }));
}

function normalizeRecord(
  parsed: LifeExpectancyCacheRecord | LegacyLifeExpectancyCacheRecord,
): LifeExpectancyCacheRecord | null {
  if (
    typeof parsed?.years !== "number" ||
    !parsed?.calculatedAt ||
    typeof parsed?.profileSignature !== "string" ||
    typeof parsed?.behaviorScore !== "number"
  ) {
    return null;
  }

  const baselineYears =
    typeof (parsed as LifeExpectancyCacheRecord).baselineYears === "number"
      ? (parsed as LifeExpectancyCacheRecord).baselineYears
      : parsed.years;
  const refinedYearsRaw = (parsed as LifeExpectancyCacheRecord).refinedYears;
  const refinedYears = typeof refinedYearsRaw === "number" ? refinedYearsRaw : null;
  const confidenceRaw = (parsed as LifeExpectancyCacheRecord).confidence;
  const confidence = isValidConfidence(confidenceRaw) ? confidenceRaw : "medium";
  const topFactors = normalizeFactors((parsed as LifeExpectancyCacheRecord).topFactors);
  const improvementPotentialDaysRaw = (parsed as LifeExpectancyCacheRecord).improvementPotentialDays;

  return {
    years: parsed.years,
    baselineYears,
    refinedYears,
    confidence,
    topFactors,
    improvementPotentialDays:
      typeof improvementPotentialDaysRaw === "number" && improvementPotentialDaysRaw >= 0
        ? Math.round(improvementPotentialDaysRaw)
        : 0,
    calculatedAt: parsed.calculatedAt,
    profileSignature: parsed.profileSignature,
    behaviorScore: parsed.behaviorScore,
  };
}

export async function getLifeExpectancyCache(): Promise<LifeExpectancyCacheRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(LIFE_EXPECTANCY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LifeExpectancyCacheRecord | LegacyLifeExpectancyCacheRecord;
    return normalizeRecord(parsed);
  } catch {
    return null;
  }
}

export async function setLifeExpectancyCache(record: LifeExpectancyCacheRecord): Promise<void> {
  await AsyncStorage.setItem(LIFE_EXPECTANCY_CACHE_KEY, JSON.stringify(record));
}

export function createLifeExpectancyCacheRecord(params: {
  baselineYears: number;
  estimate: LifeExpectancyAIResult;
  calculatedAt: string;
  profileSignature: string;
  behaviorScore: number;
}): LifeExpectancyCacheRecord {
  const refinedYears = params.estimate.estimatedYears;
  return {
    years: refinedYears,
    baselineYears: params.baselineYears,
    refinedYears,
    confidence: params.estimate.confidence,
    topFactors: params.estimate.topFactors,
    improvementPotentialDays: params.estimate.improvementPotentialDays,
    calculatedAt: params.calculatedAt,
    profileSignature: params.profileSignature,
    behaviorScore: params.behaviorScore,
  };
}
