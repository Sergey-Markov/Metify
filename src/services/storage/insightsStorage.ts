import AsyncStorage from "@react-native-async-storage/async-storage";

import type { InsightsResult } from "../../features/insights/types";

const INSIGHTS_CACHE_KEY = "insights-cache-v1";
const INSIGHTS_ACTIVITY_KEY = "insights-activity-v1";
const SESSION_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

interface InsightsCachePayload {
  data: InsightsResult;
  generatedAt: string;
}

interface ActivityPayload {
  lastActiveAt: string;
  sessionStarts: string[];
}

export interface InsightsCacheRecord {
  data: InsightsResult;
  generatedAt: string;
}

export interface InsightsActivity {
  lastActiveAt: string;
  sessionsPerWeek: number;
}

export async function getCachedInsights(): Promise<InsightsCacheRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(INSIGHTS_CACHE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw) as InsightsCachePayload;
    if (!payload?.data || !payload?.generatedAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setCachedInsights(data: InsightsResult): Promise<void> {
  const payload: InsightsCachePayload = {
    data,
    generatedAt: data.generatedAt,
  };
  await AsyncStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(payload));
}

function withinLastSevenDays(isoDate: string, now: Date): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
}

export async function recordInsightSession(now = new Date()): Promise<InsightsActivity> {
  const nowIso = now.toISOString();
  const raw = await AsyncStorage.getItem(INSIGHTS_ACTIVITY_KEY);
  const existing = raw ? (JSON.parse(raw) as ActivityPayload) : null;
  const prevSessions = existing?.sessionStarts ?? [];

  const cleaned = prevSessions.filter((entry) => withinLastSevenDays(entry, now));
  const lastSessionIso = cleaned[cleaned.length - 1];
  const lastSession = lastSessionIso ? new Date(lastSessionIso) : null;
  const shouldAppend =
    !lastSession || now.getTime() - lastSession.getTime() > SESSION_DEDUPE_WINDOW_MS;

  const sessionStarts = shouldAppend ? [...cleaned, nowIso] : cleaned;
  const payload: ActivityPayload = {
    lastActiveAt: nowIso,
    sessionStarts,
  };

  await AsyncStorage.setItem(INSIGHTS_ACTIVITY_KEY, JSON.stringify(payload));

  return {
    lastActiveAt: payload.lastActiveAt,
    sessionsPerWeek: payload.sessionStarts.length,
  };
}

export async function getInsightActivity(now = new Date()): Promise<InsightsActivity> {
  const raw = await AsyncStorage.getItem(INSIGHTS_ACTIVITY_KEY);
  if (!raw) {
    return {
      lastActiveAt: now.toISOString(),
      sessionsPerWeek: 0,
    };
  }

  try {
    const payload = JSON.parse(raw) as ActivityPayload;
    const sessionsPerWeek = (payload.sessionStarts ?? []).filter((entry) =>
      withinLastSevenDays(entry, now),
    ).length;

    return {
      lastActiveAt: payload.lastActiveAt ?? now.toISOString(),
      sessionsPerWeek,
    };
  } catch {
    return {
      lastActiveAt: now.toISOString(),
      sessionsPerWeek: 0,
    };
  }
}
