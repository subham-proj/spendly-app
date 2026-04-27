import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES, Period } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface AiInsight {
  emoji: string;
  title: string;
  description: string;
  accent: string;  // hex color
}

export interface InsightsData {
  period: string;
  insights: AiInsight[];
}

export function useInsights(period: Period = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<InsightsData>({
    queryKey: QUERY_KEYS.insights(period),
    queryFn: async () => {
      try {
        return await apiFetch<InsightsData>(
          `${API_ROUTES.INSIGHTS}?period=${period}`,
          token!,
        );
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: CACHE.STALE_LONG,
    gcTime:    CACHE.GC_LONG,
  });
}
