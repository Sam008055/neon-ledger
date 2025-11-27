import { vi } from 'vitest';

export const createMockCtx = (userId?: string) => {
  const mockDb = {
    query: vi.fn().mockReturnValue({
      withIndex: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      take: vi.fn().mockResolvedValue([]),
      collect: vi.fn().mockResolvedValue([]),
      first: vi.fn().mockResolvedValue(null),
    }),
    get: vi.fn().mockResolvedValue(null),
    insert: vi.fn().mockResolvedValue('mock_id'),
    patch: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    system: {
      get: vi.fn().mockResolvedValue(null),
    },
  };

  const mockStorage = {
    generateUploadUrl: vi.fn().mockResolvedValue('mock_upload_url'),
    getUrl: vi.fn().mockResolvedValue('mock_file_url'),
  };

  const mockScheduler = {
    runAfter: vi.fn().mockResolvedValue(undefined),
  };

  return {
    db: mockDb,
    storage: mockStorage,
    scheduler: mockScheduler,
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(
        userId ? { subject: userId } : null
      ),
    },
  };
};

export const mockUserId = 'test_user_123';
export const mockAccountId = 'test_account_123';
export const mockCategoryId = 'test_category_123';
export const mockTransactionId = 'test_transaction_123';
