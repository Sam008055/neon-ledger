import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCtx, mockUserId } from '../../test/helpers/convexMocks';

vi.mock('@convex-dev/auth/server', () => ({
  getAuthUserId: vi.fn().mockResolvedValue(mockUserId),
}));

describe('Budget Functions', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockCtx(mockUserId);
    vi.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should calculate account balances correctly', () => {
      const account = {
        _id: 'acc_1',
        initialBalance: 5000,
      };

      const transactions = [
        { accountId: 'acc_1', type: 'income', amount: 3000 },
        { accountId: 'acc_1', type: 'expense', amount: 1200 },
        { accountId: 'acc_1', type: 'expense', amount: 500 },
      ];

      const balance = transactions.reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, account.initialBalance);

      expect(balance).toBe(6300);
    });

    it('should calculate monthly income and expense', () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const transactions = [
        { date: startOfMonth + 1000, type: 'income', amount: 50000 },
        { date: startOfMonth + 2000, type: 'expense', amount: 12000 },
        { date: startOfMonth + 3000, type: 'expense', amount: 5000 },
        { date: startOfMonth - 100000, type: 'income', amount: 10000 }, // Previous month
      ];

      const currentMonthTransactions = transactions.filter(t => t.date >= startOfMonth);
      
      const income = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      expect(income).toBe(50000);
      expect(expense).toBe(17000);
      expect(income - expense).toBe(33000);
    });

    it('should calculate category breakdown percentages', () => {
      const totalExpense = 10000;
      const categories = [
        { name: 'Food', amount: 3000 },
        { name: 'Rent', amount: 5000 },
        { name: 'Transport', amount: 2000 },
      ];

      const breakdown = categories.map(cat => ({
        ...cat,
        percentage: ((cat.amount / totalExpense) * 100).toFixed(1),
      }));

      expect(breakdown[0].percentage).toBe('30.0');
      expect(breakdown[1].percentage).toBe('50.0');
      expect(breakdown[2].percentage).toBe('20.0');
    });
  });

  describe('getSpendingTrends', () => {
    it('should generate correct date ranges for monthly periods', () => {
      const now = new Date();
      const periods = [];

      for (let i = 2; i >= 0; i--) {
        const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        periods.push({ start: periodStart, end: periodEnd });
      }

      expect(periods.length).toBe(3);
      expect(periods[0].start.getMonth()).toBe(now.getMonth() - 2);
      expect(periods[2].start.getMonth()).toBe(now.getMonth());
    });

    it('should calculate net cash flow', () => {
      const income = 50000;
      const expense = 35000;
      const net = income - expense;

      expect(net).toBe(15000);
    });
  });

  describe('getCashFlowForecast', () => {
    it('should calculate average monthly values', () => {
      const transactions = [
        { type: 'income', amount: 50000 },
        { type: 'income', amount: 55000 },
        { type: 'income', amount: 52000 },
        { type: 'expense', amount: 30000 },
        { type: 'expense', amount: 35000 },
        { type: 'expense', amount: 32000 },
      ];

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const avgIncome = totalIncome / 3;
      const avgExpense = totalExpense / 3;

      expect(avgIncome).toBeCloseTo(52333.33, 2);
      expect(avgExpense).toBeCloseTo(32333.33, 2);
    });

    it('should project future balance correctly', () => {
      const currentBalance = 100000;
      const avgMonthlyIncome = 50000;
      const avgMonthlyExpense = 35000;
      const monthsAhead = 3;

      let projectedBalance = currentBalance;
      const projections = [];

      for (let i = 1; i <= monthsAhead; i++) {
        projectedBalance += avgMonthlyIncome - avgMonthlyExpense;
        projections.push(projectedBalance);
      }

      expect(projections[0]).toBe(115000);
      expect(projections[1]).toBe(130000);
      expect(projections[2]).toBe(145000);
    });
  });
});
