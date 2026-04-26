import { useQuery } from '@tanstack/react-query';
import { MOCK_TRANSACTIONS, CATEGORIES } from '../lib/mockData';

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
    queryKey: ['expenses'],
    queryFn: fetchExpenseData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
