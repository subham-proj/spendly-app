import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

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

export function useCategoryExpenses(period: 'month' | 'all' = 'month') {
  const { token, signOut } = useAuth();

  return useQuery<CategoryExpensesData>({
    queryKey: ['category-expenses', period],
    queryFn: async () => {
      try {
        return await apiFetch<CategoryExpensesData>(
          `/api/analytics/category-expenses?period=${period}`,
          token!,
        );
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
