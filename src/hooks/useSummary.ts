import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES, Period } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface SummaryData {
  period: string;
  currency: string;
  totalExpense: number;
  totalIncome: number;
  totalSavings: number;
  maxSpentCategory: { category: string; amount: number } | null;
}

export function useSummary(period: Period = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<SummaryData>({
    queryKey: QUERY_KEYS.summary(period),
    queryFn: async () => {
      try {
        return await apiFetch<SummaryData>(
          `${API_ROUTES.SUMMARY}?period=${period}`,
          token!,
        );
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: CACHE.STALE_DEFAULT,
    gcTime:    CACHE.GC_DEFAULT,
  });
}
