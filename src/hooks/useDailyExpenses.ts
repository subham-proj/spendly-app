import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

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
    queryKey: ['daily-expenses'],
    queryFn: async () => {
      try {
        return await apiFetch<DailyExpensesData>('/api/analytics/daily-expenses', token!);
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 10,
  });
}
