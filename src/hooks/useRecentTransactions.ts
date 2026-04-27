import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { API_ROUTES } from '../constants/api';
import { QUERY_KEYS, CACHE } from '../constants/queryKeys';

export interface RecentTransaction {
  _id: string;
  merchant: string | null;
  shortName: string | null;
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
    queryKey: QUERY_KEYS.recentTransactions(limit),
    queryFn: async () => {
      try {
        const res = await apiFetch<RecentTransactionsResponse>(
          `${API_ROUTES.RECENT_TRANSACTIONS}?limit=${limit}`,
          token!,
        );
        return res.transactions;
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
