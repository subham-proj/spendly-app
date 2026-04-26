import { useMemo } from 'react';
import { MOCK_TRANSACTIONS, Transaction } from '../lib/mockData';

export function useMetrics(transactions: Transaction[] = MOCK_TRANSACTIONS) {
  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const prevMonthTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const totalExpensesCurrent = currentMonthTx
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpensesPrev = prevMonthTx
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalIncomeCurrent = currentMonthTx
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalIncomePrev = prevMonthTx
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netSavingsCurrent = totalIncomeCurrent - totalExpensesCurrent;
    const netSavingsPrev = totalIncomePrev - totalExpensesPrev;

    const savingsRateCurrent =
      totalIncomeCurrent > 0 ? Math.round((netSavingsCurrent / totalIncomeCurrent) * 100) : 0;
    const savingsRatePrev =
      totalIncomePrev > 0 ? Math.round((netSavingsPrev / totalIncomePrev) * 100) : 0;

    const expenseChange =
      totalExpensesPrev > 0
        ? Math.round(((totalExpensesCurrent - totalExpensesPrev) / totalExpensesPrev) * 100)
        : 0;
    const incomeChange =
      totalIncomePrev > 0
        ? Math.round(((totalIncomeCurrent - totalIncomePrev) / totalIncomePrev) * 100)
        : 0;
    const savingsChange = savingsRateCurrent - savingsRatePrev;

    const trend = (v: number) => (v > 0 ? 'up' : v < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral';

    return {
      totalExpenses: { value: totalExpensesCurrent, change: expenseChange, trend: trend(expenseChange) },
      totalIncome: { value: totalIncomeCurrent, change: incomeChange, trend: trend(incomeChange) },
      netSavings: { value: netSavingsCurrent, change: savingsChange, trend: trend(savingsChange) },
      savingsRate: { value: savingsRateCurrent, change: savingsChange, trend: trend(savingsChange) },
    };
  }, [transactions]);
}
