import { subDays, format } from 'date-fns';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  merchant: string;
  type: 'expense' | 'income';
  isRecurring: boolean;
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#F87171', budget: 8000 },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#60A5FA', budget: 3000 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#A78BFA', budget: 5000 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#34D399', budget: 2000 },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#FBBF24', budget: 2500 },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#F97316', budget: 15000 },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', color: '#8B5CF6', budget: 1500 },
  { id: 'healthcare', name: 'Healthcare', icon: '⚕️', color: '#EF4444', budget: 1000 },
];

const MERCHANTS: Record<string, string[]> = {
  food: ['Starbucks', 'Pizza Hut', 'Dominoes', 'Zomato', 'Swiggy', "McDonald's", 'Cafe Coffee Day'],
  transport: ['Uber', 'Ola', 'Petrol Pump', 'Metro Pass', 'Parking', 'Fuel Station'],
  shopping: ['Amazon', 'Flipkart', 'Myntra', 'H&M', 'Zara', 'UNIQLO'],
  entertainment: ['Netflix', 'Prime Video', 'Movie Ticket', 'PVR Cinema', 'Concert Ticket'],
  utilities: ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Recharge'],
  rent: ['Apartment Rent', 'House Rent'],
  subscriptions: ['Spotify', 'Adobe Creative Cloud', 'Gym Membership', 'YouTube Premium'],
  healthcare: ['Apollo Pharmacy', 'Netmeds', 'Doctor Consultation', '1mg'],
};

function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();

  const recurring = [
    { category: 'rent', amount: 15000, day: 1, name: 'Apartment Rent' },
    { category: 'subscriptions', amount: 1299, day: 5, name: 'Netflix' },
    { category: 'subscriptions', amount: 799, day: 7, name: 'Spotify' },
    { category: 'utilities', amount: 1800, day: 10, name: 'Electricity Bill' },
    { category: 'utilities', amount: 800, day: 15, name: 'Internet Bill' },
  ];

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfMonth = date.getDate();

    for (const rec of recurring) {
      if (rec.day === dayOfMonth) {
        transactions.push({
          id: `tx-recurring-${transactions.length}`,
          date: format(date, 'yyyy-MM-dd'),
          category: rec.category,
          amount: rec.amount,
          merchant: rec.name,
          type: 'expense',
          isRecurring: true,
        });
      }
    }

    const transactionCount = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < transactionCount; j++) {
      const categories = Object.keys(MERCHANTS);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const merchants = MERCHANTS[randomCategory];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      let amount = 0;
      if (randomCategory === 'food') amount = Math.floor(Math.random() * 800) + 100;
      else if (randomCategory === 'shopping') amount = Math.floor(Math.random() * 5000) + 500;
      else if (randomCategory === 'transport') amount = Math.floor(Math.random() * 500) + 50;
      else if (randomCategory === 'entertainment') amount = Math.floor(Math.random() * 1000) + 100;
      else if (randomCategory === 'healthcare') amount = Math.floor(Math.random() * 2000) + 200;
      else amount = Math.floor(Math.random() * 1000) + 100;

      transactions.push({
        id: `tx-${transactions.length}`,
        date: format(date, 'yyyy-MM-dd'),
        category: randomCategory,
        amount,
        merchant,
        type: 'expense',
        isRecurring: false,
      });
    }
  }

  for (let i = 0; i < 2; i++) {
    const date = subDays(today, Math.floor(Math.random() * 30));
    transactions.push({
      id: `tx-income-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      category: 'income',
      amount: 50000,
      merchant: 'Salary Deposit',
      type: 'income',
      isRecurring: i === 0,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const MOCK_TRANSACTIONS = generateMockTransactions();

export function getCategoryById(categoryId: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId);
}

export function calculateCategoryTotal(transactions: Transaction[], categoryId: string): number {
  return transactions
    .filter((tx) => tx.category === categoryId && tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
}
