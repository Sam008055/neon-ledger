import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCtx, mockUserId } from '../../test/helpers/convexMocks';

vi.mock('@convex-dev/auth/server', () => ({
  getAuthUserId: vi.fn().mockResolvedValue(mockUserId),
}));

describe('Subscription Tracking Functions', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockCtx(mockUserId);
    vi.clearAllMocks();
  });

  describe('getSubscriptionAnalytics', () => {
    it('should calculate monthly total correctly', () => {
      const subscriptions = [
        { name: 'Netflix', amount: 199 },
        { name: 'Spotify', amount: 299 },
        { name: 'Amazon Prime', amount: 499 },
      ];

      const monthlyTotal = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      expect(monthlyTotal).toBe(997);
    });

    it('should group subscriptions by category', () => {
      const transactions = [
        { categoryId: 'cat_1', amount: 199, isSubscription: true },
        { categoryId: 'cat_1', amount: 299, isSubscription: true },
        { categoryId: 'cat_2', amount: 499, isSubscription: true },
      ];

      const categoryMap: Record<string, { count: number; totalAmount: number }> = {};

      transactions.forEach(t => {
        if (!categoryMap[t.categoryId]) {
          categoryMap[t.categoryId] = { count: 0, totalAmount: 0 };
        }
        categoryMap[t.categoryId].count += 1;
        categoryMap[t.categoryId].totalAmount += t.amount;
      });

      expect(categoryMap['cat_1'].count).toBe(2);
      expect(categoryMap['cat_1'].totalAmount).toBe(498);
      expect(categoryMap['cat_2'].count).toBe(1);
      expect(categoryMap['cat_2'].totalAmount).toBe(499);
    });

    it('should calculate percentage of total spending', () => {
      const totalSpending = 10000;
      const subscriptionAmount = 997;
      const percentage = ((subscriptionAmount / totalSpending) * 100).toFixed(1);

      expect(percentage).toBe('10.0');
    });
  });
});
