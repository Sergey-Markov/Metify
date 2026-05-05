import AsyncStorage from "@react-native-async-storage/async-storage";

const LIFE_EXPECTANCY_CACHE_KEY = "ai-life-expectancy-v1";

export interface LifeExpectancyCacheRecord {
  years: number;
  calculatedAt: string;
  profileSignature: string;
  behaviorScore: number;
}

export async function getLifeExpectancyCache(): Promise<LifeExpectancyCacheRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(LIFE_EXPECTANCY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LifeExpectancyCacheRecord;
    if (
      typeof parsed?.years !== "number" ||
      !parsed?.calculatedAt ||
      typeof parsed?.profileSignature !== "string" ||
      typeof parsed?.behaviorScore !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function setLifeExpectancyCache(record: LifeExpectancyCacheRecord): Promise<void> {
  await AsyncStorage.setItem(LIFE_EXPECTANCY_CACHE_KEY, JSON.stringify(record));
}
