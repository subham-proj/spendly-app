/**
 * Mock API handler — intercepts apiFetch calls when EXPO_PUBLIC_USE_MOCK=true.
 * Matches paths to mock data, parses query params, and returns typed responses.
 * Adds a configurable simulated network delay.
 */

import {
  MOCK_PROFILE,
  MOCK_SUMMARY,
  MOCK_SUMMARY_ALL,
  MOCK_CATEGORY_EXPENSES_MONTH,
  MOCK_CATEGORY_EXPENSES_ALL,
  MOCK_DAILY_EXPENSES,
  MOCK_RECENT_TRANSACTIONS,
  MOCK_INSIGHTS,
  MOCK_INSIGHTS_ALL,
  getMockTransactionPage,
} from './mockData';

const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getMockResponse<T>(path: string, options?: RequestInit): Promise<T> {
  await delay(MOCK_DELAY_MS);

  // Parse base path and query string
  const [basePath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString ?? '');
  const period = params.get('period') ?? 'month';
  const method = options?.method?.toUpperCase() ?? 'GET';

  // PATCH/POST — fire-and-forget mutations, return empty success
  if (method !== 'GET') {
    return {} as T;
  }

  if (basePath === '/api/users/me') {
    return MOCK_PROFILE as T;
  }

  if (basePath === '/api/analytics/summary') {
    return (period === 'all' ? MOCK_SUMMARY_ALL : MOCK_SUMMARY) as T;
  }

  if (basePath === '/api/analytics/category-expenses') {
    return (period === 'all' ? MOCK_CATEGORY_EXPENSES_ALL : MOCK_CATEGORY_EXPENSES_MONTH) as T;
  }

  if (basePath === '/api/analytics/daily-expenses') {
    return MOCK_DAILY_EXPENSES as T;
  }

  if (basePath === '/api/analytics/recent-transactions') {
    const limit = parseInt(params.get('limit') ?? '10', 10);
    return { transactions: MOCK_RECENT_TRANSACTIONS.slice(0, limit) } as T;
  }

  if (basePath === '/api/analytics/insights') {
    return (period === 'all' ? MOCK_INSIGHTS_ALL : MOCK_INSIGHTS) as T;
  }

  if (basePath === '/api/transactions') {
    const page     = parseInt(params.get('page')  ?? '1',  10);
    const limit    = parseInt(params.get('limit') ?? '20', 10);
    const type     = params.get('type')     ?? '';
    const category = params.get('category') ?? '';
    const search   = params.get('search')   ?? '';
    const sort     = params.get('sort')     ?? '-emailDate';
    return getMockTransactionPage(page, limit, type, category, search, sort) as T;
  }

  if (basePath === '/api/users/preferences') {
    return {} as T;
  }

  console.warn('[MockAPI] Unhandled path:', path);
  return {} as T;
}
