import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE } from '../lib/api';

export type SortOption = '-emailDate' | 'emailDate' | '-amount' | 'amount';

export interface TransactionFilters {
  type: 'debit' | 'credit' | '';
  category: string;   // '' = all; category id otherwise
  sort: SortOption;
  search: string;     // caller must pass debounced value
}

export interface ApiTransaction {
  _id: string;
  merchant: string | null;
  amount: number;
  currency: string;
  category: string | null;
  transactionType: 'debit' | 'credit' | null;
  emailDate: string;
  subject: string;
  from: string;
}

export interface TransactionPage {
  transactions: ApiTransaction[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

const PAGE_SIZE = 20;

export function useTransactions(filters: TransactionFilters) {
  const { token, signOut } = useAuth();

  return useInfiniteQuery<TransactionPage>({
    queryKey: ['transactions', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page:  String(pageParam),
        limit: String(PAGE_SIZE),
        sort:  filters.sort,
      });
      if (filters.type)     params.set('type',     filters.type);
      if (filters.category) params.set('category', filters.category);
      if (filters.search)   params.set('search',   filters.search);

      try {
        return await apiFetch<TransactionPage>(`/api/transactions?${params.toString()}`, token!);
      } catch (err: any) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: !!token,
    staleTime: 1000 * 60 * 2,   // 2 min
    gcTime:    1000 * 60 * 10,
  });
}
