/**
 * Mock data for all API endpoints.
 * Shapes match the real API response types exactly so the UI renders identically.
 * Toggle with EXPO_PUBLIC_USE_MOCK=true in .env
 */

import { subDays, format } from 'date-fns';
import type { ProfileData } from '../hooks/useProfile';
import type { SummaryData } from '../hooks/useSummary';
import type { InsightsData } from '../hooks/useInsights';
import type { CategoryExpensesData } from '../hooks/useCategoryExpenses';
import type { DailyExpensesData } from '../hooks/useDailyExpenses';
import type { RecentTransaction } from '../hooks/useRecentTransactions';
import type { ApiTransaction, TransactionPage } from '../hooks/useTransactions';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const MOCK_PROFILE: ProfileData = {
  email: 'demo@spendly.app',
  name: 'Demo User',
  picture: null,
  memberSince: '2024-01-15T00:00:00.000Z',
  gmailConnected: true,
  lastSynced: new Date().toISOString(),
  preferences: {
    currency: 'INR',
    notificationsEnabled: true,
    themeMode: 'system',
  },
};

// ─── Raw transactions (source of truth for all derived mock data) ─────────────

interface MockTx {
  _id: string;
  merchant: string;
  shortName: string;
  amount: number;
  currency: string;
  category: string;
  transactionType: 'debit' | 'credit';
  emailDate: string;
  subject: string;
  from: string;
}

function makeTx(
  id: string,
  merchant: string,
  amount: number,
  category: string,
  type: 'debit' | 'credit',
  daysAgo: number,
  from = 'noreply@bank.com',
  shortName?: string,
): MockTx {
  const date = subDays(new Date(), daysAgo);
  return {
    _id: id,
    merchant,
    shortName: shortName ?? merchant,
    amount,
    currency: 'INR',
    category,
    transactionType: type,
    emailDate: format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    subject: type === 'credit'
      ? `Credit of ₹${amount} to your account`
      : `Debit alert: ₹${amount} at ${merchant}`,
    from,
  };
}

export const MOCK_TRANSACTIONS: MockTx[] = [
  // Income
  makeTx('t-inc-1', 'Salary Deposit',   85000, 'finance', 'credit',  1,  'hr@company.com'),
  makeTx('t-inc-2', 'Freelance Payment', 15000, 'finance', 'credit', 10, 'billing@client.com'),

  // Food
  makeTx('t-1',  'Swiggy',           620,  'food',          'debit',  0),
  makeTx('t-2',  'Zomato',           480,  'food',          'debit',  1),
  makeTx('t-3',  "McDonald's",       380,  'food',          'debit',  2),
  makeTx('t-4',  'Starbucks',        540,  'food',          'debit',  3),
  makeTx('t-5',  'Swiggy',           720,  'food',          'debit',  5),
  makeTx('t-6',  'Cafe Coffee Day',  290,  'food',          'debit',  7),
  makeTx('t-7',  'Zomato',           560,  'food',          'debit',  9),
  makeTx('t-8',  'Domino\'s',        840,  'food',          'debit', 12),
  makeTx('t-9',  'Swiggy',           390,  'food',          'debit', 15),
  makeTx('t-10', 'Starbucks',        470,  'food',          'debit', 18),

  // Shopping
  makeTx('t-11', 'Amazon',          3200,  'shopping',      'debit',  2),
  makeTx('t-12', 'Flipkart',        1850,  'shopping',      'debit',  6),
  makeTx('t-13', 'Myntra',          2400,  'shopping',      'debit', 11),
  makeTx('t-14', 'Amazon',          5600,  'shopping',      'debit', 16),
  makeTx('t-15', 'UNIQLO',          3100,  'shopping',      'debit', 22),

  // Travel
  makeTx('t-16', 'Uber',             340,  'travel',        'debit',  0),
  makeTx('t-17', 'Ola',              220,  'travel',        'debit',  3),
  makeTx('t-18', 'Uber',             480,  'travel',        'debit',  5),
  makeTx('t-19', 'IRCTC',           2200,  'travel',        'debit',  8),
  makeTx('t-20', 'Uber',             310,  'travel',        'debit', 13),
  makeTx('t-21', 'IndiGo Airlines', 4800,  'travel',        'debit', 20),

  // Utilities
  makeTx('t-22', 'Electricity Bill', 1840, 'utilities',     'debit',  4, 'alerts@bescom.com'),
  makeTx('t-23', 'Jio Broadband',    999,  'utilities',     'debit',  4, 'bills@jio.com'),
  makeTx('t-24', 'Mobile Recharge',  299,  'utilities',     'debit', 14, 'noreply@airtel.com'),

  // Entertainment
  makeTx('t-25', 'Netflix',          649,  'entertainment', 'debit',  5, 'info@netflix.com'),
  makeTx('t-26', 'Spotify',          119,  'entertainment', 'debit',  7, 'noreply@spotify.com'),
  makeTx('t-27', 'BookMyShow',       580,  'entertainment', 'debit', 14),
  makeTx('t-28', 'YouTube Premium',  189,  'entertainment', 'debit', 19, 'noreply@google.com'),

  // Health
  makeTx('t-29', 'Apollo Pharmacy',  1240, 'health',        'debit',  6),
  makeTx('t-30', 'Doctor Consult',   800,  'health',        'debit', 17),

  // Finance / transfers
  makeTx('t-31', 'Apartment Rent',  22000, 'finance',       'debit',  1, 'owner@housing.com'),
  makeTx('t-32', 'LIC Premium',      4800, 'finance',       'debit', 10, 'premium@licindia.com'),

  // Transfer
  makeTx('t-33', 'GPay Transfer',   3000,  'transfer',      'debit',  8),
  makeTx('t-34', 'PhonePe',         1500,  'transfer',      'debit', 21),
];

const DEBIT_TXS = MOCK_TRANSACTIONS.filter((t) => t.transactionType === 'debit');
const totalExpense = DEBIT_TXS.reduce((s, t) => s + t.amount, 0);
const totalIncome  = MOCK_TRANSACTIONS.filter((t) => t.transactionType === 'credit').reduce((s, t) => s + t.amount, 0);

// ─── Summary ──────────────────────────────────────────────────────────────────

export const MOCK_SUMMARY: SummaryData = {
  period: 'month',
  currency: 'INR',
  totalExpense,
  totalIncome,
  totalSavings: totalIncome - totalExpense,
  maxSpentCategory: { category: 'finance', amount: 26800 },
};

export const MOCK_SUMMARY_ALL: SummaryData = {
  ...MOCK_SUMMARY,
  period: 'all',
  totalExpense:  totalExpense  * 6,
  totalIncome:   totalIncome   * 6,
  totalSavings: (totalIncome - totalExpense) * 6,
};

// ─── Category expenses ────────────────────────────────────────────────────────

function buildCategoryExpenses(period: string): CategoryExpensesData {
  const totals: Record<string, number> = {};
  for (const tx of DEBIT_TXS) {
    totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
  }
  const multiplier = period === 'all' ? 6 : 1;
  const total = Object.values(totals).reduce((s, v) => s + v * multiplier, 0);
  const categories = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount: amount * multiplier,
      percentage: total > 0 ? parseFloat(((amount * multiplier / total) * 100).toFixed(1)) : 0,
    }));
  return { period, currency: 'INR', total, categories };
}

export const MOCK_CATEGORY_EXPENSES_MONTH = buildCategoryExpenses('month');
export const MOCK_CATEGORY_EXPENSES_ALL   = buildCategoryExpenses('all');

// ─── Daily expenses ───────────────────────────────────────────────────────────

export const MOCK_DAILY_EXPENSES: DailyExpensesData = (() => {
  const byDay: Record<string, number> = {};
  for (const tx of DEBIT_TXS) {
    const day = tx.emailDate.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + tx.amount;
  }
  const data = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
    return { date, amount: byDay[date] ?? 0 };
  });
  return { currency: 'INR', data };
})();

// ─── Recent transactions ──────────────────────────────────────────────────────

export const MOCK_RECENT_TRANSACTIONS: RecentTransaction[] = MOCK_TRANSACTIONS
  .slice()
  .sort((a, b) => new Date(b.emailDate).getTime() - new Date(a.emailDate).getTime())
  .slice(0, 10)
  .map(({ from: _from, ...rest }) => rest as RecentTransaction);

// ─── Paginated transactions ───────────────────────────────────────────────────

const SORTED_TRANSACTIONS: ApiTransaction[] = MOCK_TRANSACTIONS
  .slice()
  .sort((a, b) => new Date(b.emailDate).getTime() - new Date(a.emailDate).getTime());

export function getMockTransactionPage(
  page: number,
  limit: number,
  type?: string,
  category?: string,
  search?: string,
  sort?: string,
): TransactionPage {
  let filtered = [...SORTED_TRANSACTIONS];

  if (type)     filtered = filtered.filter((t) => t.transactionType === type);
  if (category) filtered = filtered.filter((t) => t.category === category);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.merchant?.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q),
    );
  }
  if (sort) {
    if (sort === 'amount')        filtered.sort((a, b) => a.amount - b.amount);
    else if (sort === '-amount')  filtered.sort((a, b) => b.amount - a.amount);
    else if (sort === 'emailDate') filtered.sort((a, b) => new Date(a.emailDate).getTime() - new Date(b.emailDate).getTime());
    // default '-emailDate' already sorted
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit;
  const transactions = filtered.slice(start, start + limit);

  return {
    transactions,
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

// ─── AI Insights ─────────────────────────────────────────────────────────────

export const MOCK_INSIGHTS: InsightsData = {
  period: 'month',
  insights: [
    {
      emoji: '🍔',
      title: 'Food spending is on track',
      description: 'You\'ve spent ₹5,090 on food this month, which is within your usual range. Swiggy and Zomato account for most of it.',
      accent: '#F87171',
    },
    {
      emoji: '🛍️',
      title: 'Shopping spike detected',
      description: 'Shopping costs hit ₹16,150 — higher than last month. Amazon alone accounts for ₹8,800. Consider a wishlist cooldown period.',
      accent: '#FB923C',
    },
    {
      emoji: '✈️',
      title: 'Travel costs rising',
      description: 'Your travel spend includes a ₹4,800 IndiGo booking. Total travel: ₹8,350. Factor this into next month\'s budget.',
      accent: '#60A5FA',
    },
    {
      emoji: '💡',
      title: 'Subscriptions accumulating',
      description: 'You\'re paying for Netflix, Spotify, and YouTube Premium totalling ₹957/month. Review if all are actively used.',
      accent: '#A78BFA',
    },
  ],
};

export const MOCK_INSIGHTS_ALL: InsightsData = {
  ...MOCK_INSIGHTS,
  period: 'all',
  insights: [
    {
      emoji: '📈',
      title: 'Healthy savings rate',
      description: 'Over all time, you\'ve saved roughly 28% of your income. That\'s above the recommended 20% — great discipline!',
      accent: '#34D399',
    },
    {
      emoji: '🏠',
      title: 'Rent is your biggest expense',
      description: 'Housing (rent) accounts for 35% of total spending. This is within the recommended 30–40% range for your income level.',
      accent: '#F97316',
    },
    ...MOCK_INSIGHTS.insights.slice(2),
  ],
};

// ─── Legacy types (kept for useExpenseData compatibility) ─────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
}

export const CATEGORIES: Category[] = [
  { id: 'food',          name: 'Food & Dining',  icon: '🍽️', color: '#F87171', budget: 8000  },
  { id: 'shopping',      name: 'Shopping',        icon: '🛍️', color: '#FB923C', budget: 5000  },
  { id: 'travel',        name: 'Travel',          icon: '✈️', color: '#60A5FA', budget: 4000  },
  { id: 'utilities',     name: 'Utilities',       icon: '💡', color: '#A78BFA', budget: 2500  },
  { id: 'entertainment', name: 'Entertainment',   icon: '🎬', color: '#F472B6', budget: 2000  },
  { id: 'health',        name: 'Health',          icon: '🏥', color: '#34D399', budget: 2000  },
  { id: 'finance',       name: 'Finance',         icon: '💹', color: '#FBBF24', budget: 30000 },
  { id: 'transfer',      name: 'Transfer',        icon: '🔁', color: '#94A3B8', budget: 5000  },
  { id: 'other',         name: 'Other',           icon: '💳', color: '#9CA3AF', budget: 1000  },
];
