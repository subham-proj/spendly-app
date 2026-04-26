import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export interface SummaryData {
  period: string;
  currency: string;
  totalExpense: number;
  totalIncome: number;
  totalSavings: number;
  maxSpentCategory: { category: string; amount: number } | null;
}

export function useSummary(period: 'month' | 'all' = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<SummaryData>({
    queryKey: ['summary', period],
    queryFn: async () => {
      try {
        return await apiFetch<SummaryData>(
          `/api/analytics/summary?period=${period}`,
          token!,
        );
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
