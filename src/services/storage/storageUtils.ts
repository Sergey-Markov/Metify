import AsyncStorage from "@react-native-async-storage/async-storage";

type PersistedShape<T> = {
  state?: T;
};

export async function readPersistedState<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape<T> | T;
    if (typeof parsed === "object" && parsed !== null && "state" in parsed) {
      return (parsed as PersistedShape<T>).state ?? null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
