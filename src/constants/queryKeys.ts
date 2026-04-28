import type { TransactionFilters } from '../hooks/useTransactions';

export const QUERY_KEYS = {
  profile:            () => ['profile']                          as const,
  summary:            (period: string) => ['summary', period]   as const,
  insights:           (period: string) => ['insights', period]  as const,
  categoryExpenses:   (period: string) => ['category-expenses', period] as const,
  dailyExpenses:      () => ['daily-expenses']                   as const,
  recentTransactions: (limit: number) => ['recent-transactions', limit] as const,
  transactions:           (filters: TransactionFilters) => ['transactions', filters] as const,
  transactionsBase:       () => ['transactions']                  as const,
  recentTransactionsBase: () => ['recent-transactions']           as const,
  expenses:               () => ['expenses']                      as const,
} as const;

// Cache timing constants (milliseconds)
export const CACHE = {
  STALE_SHORT:   1000 * 60 * 2,  // 2 min  — high-frequency data (transactions list)
  STALE_DEFAULT: 1000 * 60 * 5,  // 5 min  — standard analytics
  STALE_LONG:    1000 * 60 * 10, // 10 min — slow-changing data (profile, AI insights)
  GC_DEFAULT:    1000 * 60 * 10, // 10 min
  GC_LONG:       1000 * 60 * 20, // 20 min — AI responses are expensive to re-fetch
} as const;
