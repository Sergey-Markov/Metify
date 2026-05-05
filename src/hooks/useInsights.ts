import { useCallback, useEffect, useState } from "react";

import type { InsightsResult } from "../features/insights/types";
import { getInsights } from "../services/insights/insightsService";

interface UseInsightsResult {
  insights: InsightsResult | null;
  isLoading: boolean;
  error: string | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
}

export function useInsights(): UseInsightsResult {
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getInsights({
        forceRefresh,
        trackActivity: !forceRefresh,
      });
      setInsights(result);
    } catch {
      setError("Не вдалося завантажити інсайти. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  return { insights, isLoading, error, refresh };
}
