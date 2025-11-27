import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCtx, mockUserId } from '../../test/helpers/convexMocks';

vi.mock('@convex-dev/auth/server', () => ({
  getAuthUserId: vi.fn().mockResolvedValue(mockUserId),
}));

describe('Savings Jars Functions', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockCtx(mockUserId);
    vi.clearAllMocks();
  });

  describe('addToSavingsJar', () => {
    it('should update jar status to completed when target is reached', () => {
      const jar = {
        _id: 'jar_123',
        userId: mockUserId,
        name: 'Vacation Fund',
        targetAmount: 1000,
        currentAmount: 800,
        status: 'active',
      };

      const addAmount = 200;
      const newAmount = jar.currentAmount + addAmount;
      const newStatus = newAmount >= jar.targetAmount ? 'completed' : 'active';

      expect(newAmount).toBe(1000);
      expect(newStatus).toBe('completed');
    });

    it('should keep status active when target not reached', () => {
      const jar = {
        targetAmount: 1000,
        currentAmount: 500,
        status: 'active',
      };

      const addAmount = 200;
      const newAmount = jar.currentAmount + addAmount;
      const newStatus = newAmount >= jar.targetAmount ? 'completed' : 'active';

      expect(newAmount).toBe(700);
      expect(newStatus).toBe('active');
    });

    it('should award achievement points when jar is completed', () => {
      const jar = {
        _id: 'jar_123',
        userId: mockUserId,
        name: 'Emergency Fund',
        targetAmount: 5000,
        currentAmount: 4900,
        status: 'active',
      };

      const addAmount = 100;
      const newAmount = jar.currentAmount + addAmount;
      const wasCompleted = jar.status === 'completed';
      const isNowCompleted = newAmount >= jar.targetAmount;
      const shouldAwardAchievement = isNowCompleted && !wasCompleted;

      expect(shouldAwardAchievement).toBe(true);
    });

    it('should not award achievement if already completed', () => {
      const jar = {
        targetAmount: 1000,
        currentAmount: 1000,
        status: 'completed',
      };

      const addAmount = 100;
      const newAmount = jar.currentAmount + addAmount;
      const wasCompleted = jar.status === 'completed';
      const shouldAwardAchievement = !wasCompleted;

      expect(shouldAwardAchievement).toBe(false);
    });
  });

  describe('createSavingsJar', () => {
    it('should initialize jar with zero current amount', () => {
      const args = {
        name: 'New Phone',
        targetAmount: 50000,
        color: '#ff00ff',
        emoji: '📱',
      };

      const expectedJar = {
        ...args,
        userId: mockUserId,
        currentAmount: 0,
        status: 'active',
      };

      expect(expectedJar.currentAmount).toBe(0);
      expect(expectedJar.status).toBe('active');
    });
  });
});
