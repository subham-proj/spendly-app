import { useQuery } from '@tanstack/react-query';
import { MOCK_TRANSACTIONS, CATEGORIES } from '../lib/mockData';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

const fetchExpenseData = async () => {
  return new Promise<{ transactions: typeof MOCK_TRANSACTIONS; categories: typeof CATEGORIES }>(
    (resolve) => {
      setTimeout(() => {
        resolve({ transactions: MOCK_TRANSACTIONS, categories: CATEGORIES });
      }, 1000);
    }
  );
};

export function useExpenseData() {
  return useQuery({
    queryKey: QUERY_KEYS.expenses(),
    queryFn: fetchExpenseData,
    staleTime: CACHE.STALE_DEFAULT,
    gcTime:    CACHE.GC_DEFAULT,
  });
}
