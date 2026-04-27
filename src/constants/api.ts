export const API_ROUTES = {
  // Auth
  AUTH_MOBILE_URL:    '/api/users/auth/mobile-url',
  // Users
  ME:                 '/api/users/me',
  PREFERENCES:        '/api/users/preferences',
  // Transactions
  TRANSACTIONS:       '/api/transactions',
  // Analytics
  SUMMARY:            '/api/analytics/summary',
  INSIGHTS:           '/api/analytics/insights',
  CATEGORY_EXPENSES:  '/api/analytics/category-expenses',
  DAILY_EXPENSES:     '/api/analytics/daily-expenses',
  RECENT_TRANSACTIONS:'/api/analytics/recent-transactions',
} as const;

export type Period = 'month' | 'all';
