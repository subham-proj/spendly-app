import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface DailyExpense {
  date: string;   // 'YYYY-MM-DD'
  amount: number;
}

export interface DailyExpensesData {
  currency: string;
  data: DailyExpense[];
}

export function useDailyExpenses() {
  const { token, signOut } = useAuth();

  return useQuery<DailyExpensesData>({
    queryKey: QUERY_KEYS.dailyExpenses(),
    queryFn: async () => {
      try {
        return await apiFetch<DailyExpensesData>(API_ROUTES.DAILY_EXPENSES, token!);
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
