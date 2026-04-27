import {
  UtensilsCrossed,
  ShoppingBag,
  Plane,
  Zap,
  Film,
  HeartPulse,
  Landmark,
  ArrowLeftRight,
  CreditCard,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export { CreditCard as DefaultCategoryIcon };

export interface TransactionCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 'food',          name: 'Food',          icon: UtensilsCrossed, color: '#F87171' },
  { id: 'shopping',      name: 'Shopping',      icon: ShoppingBag,     color: '#FB923C' },
  { id: 'travel',        name: 'Travel',        icon: Plane,           color: '#60A5FA' },
  { id: 'utilities',     name: 'Utilities',     icon: Zap,             color: '#A78BFA' },
  { id: 'entertainment', name: 'Entertainment', icon: Film,            color: '#F472B6' },
  { id: 'health',        name: 'Health',        icon: HeartPulse,      color: '#34D399' },
  { id: 'finance',       name: 'Finance',       icon: Landmark,        color: '#FBBF24' },
  { id: 'transfer',      name: 'Transfer',      icon: ArrowLeftRight,  color: '#94A3B8' },
  { id: 'other',         name: 'Other',         icon: CreditCard,      color: '#9CA3AF' },
];

export function getCategoryById(id: string | null | undefined): TransactionCategory | undefined {
  if (!id) return undefined;
  return TRANSACTION_CATEGORIES.find((c) => c.id === id);
}
