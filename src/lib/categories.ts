export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'food',          name: 'Food',          icon: '🍽️', color: '#F87171' },
  { id: 'shopping',      name: 'Shopping',      icon: '🛍️', color: '#FB923C' },
  { id: 'travel',        name: 'Travel',        icon: '✈️', color: '#60A5FA' },
  { id: 'utilities',     name: 'Utilities',     icon: '💡', color: '#A78BFA' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#F472B6' },
  { id: 'health',        name: 'Health',        icon: '🏥', color: '#34D399' },
  { id: 'finance',       name: 'Finance',       icon: '💹', color: '#FBBF24' },
  { id: 'transfer',      name: 'Transfer',      icon: '🔁', color: '#94A3B8' },
  { id: 'other',         name: 'Other',         icon: '💳', color: '#9CA3AF' },
];

export function getCategoryById(id: string | null | undefined): TransactionCategory | undefined {
  if (!id) return undefined;
  return TRANSACTION_CATEGORIES.find((c) => c.id === id);
}
