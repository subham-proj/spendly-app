import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export interface RecentTransaction {
  _id: string;
  merchant: string | null;
  amount: number;
  currency: string;
  category: string | null;
  transactionType: 'debit' | 'credit' | null;
  emailDate: string;
  subject: string;
}

interface RecentTransactionsResponse {
  transactions: RecentTransaction[];
}

export function useRecentTransactions(limit = 10) {
  const { token, signOut } = useAuth();

  return useQuery<RecentTransaction[]>({
    queryKey: ['recent-transactions', limit],
    queryFn: async () => {
      try {
        const res = await apiFetch<RecentTransactionsResponse>(
          `/api/analytics/recent-transactions?limit=${limit}`,
          token!,
        );
        return res.transactions;
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
