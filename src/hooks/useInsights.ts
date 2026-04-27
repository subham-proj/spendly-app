import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

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

export function useInsights(period: 'month' | 'all' = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<InsightsData>({
    queryKey: ['insights', period],
    queryFn: async () => {
      try {
        return await apiFetch<InsightsData>(
          `/api/analytics/insights?period=${period}`,
          token!,
        );
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10,   // AI responses are expensive — cache for 10 min
    gcTime:    1000 * 60 * 20,
  });
}
