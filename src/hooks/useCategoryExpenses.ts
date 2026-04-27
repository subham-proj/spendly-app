import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES, Period } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

export interface CategoryExpensesData {
  period: string;
  currency: string;
  total: number;
  categories: CategoryExpense[];
}

export function useCategoryExpenses(period: Period = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<CategoryExpensesData>({
    queryKey: QUERY_KEYS.categoryExpenses(period),
    queryFn: async () => {
      try {
        return await apiFetch<CategoryExpensesData>(
          `${API_ROUTES.CATEGORY_EXPENSES}?period=${period}`,
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
