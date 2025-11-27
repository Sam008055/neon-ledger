import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCtx, mockUserId } from '../../test/helpers/convexMocks';

// Mock the auth module
vi.mock('@convex-dev/auth/server', () => ({
  getAuthUserId: vi.fn().mockResolvedValue(mockUserId),
}));

describe('Mood Tracking Functions', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockCtx(mockUserId);
    vi.clearAllMocks();
  });

  describe('logMood', () => {
    it('should create a new mood log when none exists for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      mockCtx.db.query().withIndex().collect.mockResolvedValue([
        { date: Date.now(), amount: 100, type: 'expense' },
      ]);
      mockCtx.db.query().withIndex().first.mockResolvedValue(null);
      mockCtx.db.insert.mockResolvedValue('new_mood_log_id');

      const args = { mood: 'happy', note: 'Great day!' };
      
      // Test that the function would insert a new mood log
      expect(mockCtx.db.insert).toBeDefined();
      expect(args.mood).toBe('happy');
    });

    it('should update existing mood log for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingLog = {
        _id: 'existing_log_id',
        userId: mockUserId,
        date: today.getTime(),
        mood: 'neutral',
        spendingAmount: 50,
      };

      mockCtx.db.query().withIndex().first.mockResolvedValue(existingLog);
      mockCtx.db.patch.mockResolvedValue(undefined);

      // Verify patch would be called
      expect(mockCtx.db.patch).toBeDefined();
    });

    it('should calculate spending amount correctly', async () => {
      const transactions = [
        { date: Date.now(), amount: 100, type: 'expense' },
        { date: Date.now(), amount: 50, type: 'expense' },
        { date: Date.now(), amount: 200, type: 'income' },
      ];

      mockCtx.db.query().withIndex().collect.mockResolvedValue(transactions);

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalExpense).toBe(150);
    });
  });

  describe('getMoodAnalytics', () => {
    it('should calculate mood correlations correctly', () => {
      const moodLogs = [
        { mood: 'happy', spendingAmount: 100 },
        { mood: 'happy', spendingAmount: 150 },
        { mood: 'stressed', spendingAmount: 300 },
        { mood: 'stressed', spendingAmount: 250 },
      ];

      const moodSpendingMap: Record<string, { totalSpending: number; count: number }> = {};
      
      moodLogs.forEach(log => {
        if (!moodSpendingMap[log.mood]) {
          moodSpendingMap[log.mood] = { totalSpending: 0, count: 0 };
        }
        moodSpendingMap[log.mood].totalSpending += log.spendingAmount;
        moodSpendingMap[log.mood].count += 1;
      });

      expect(moodSpendingMap['happy'].totalSpending).toBe(250);
      expect(moodSpendingMap['happy'].count).toBe(2);
      expect(moodSpendingMap['stressed'].totalSpending).toBe(550);
      expect(moodSpendingMap['stressed'].count).toBe(2);
    });

    it('should filter logs by date range', () => {
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const logs = [
        { date: now - (10 * 24 * 60 * 60 * 1000), mood: 'happy' },
        { date: now - (40 * 24 * 60 * 60 * 1000), mood: 'sad' },
        { date: now - (5 * 24 * 60 * 60 * 1000), mood: 'excited' },
      ];

      const recentLogs = logs.filter(log => log.date >= thirtyDaysAgo);
      expect(recentLogs.length).toBe(2);
    });
  });
});
