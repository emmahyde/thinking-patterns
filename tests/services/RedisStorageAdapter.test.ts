import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Redis } from 'ioredis';
import { RedisStorageAdapter } from '../../src/services/RedisStorageAdapter.js';
import { StorageError } from '../../src/errors/CustomErrors.js';

// Mock the ioredis client
vi.mock('ioredis');

describe('RedisStorageAdapter', () => {
  let mockRedisClient: Mocked<Redis>;
  let adapter: RedisStorageAdapter;

  beforeEach(() => {
    // Re-create mocks before each test
    mockRedisClient = new (Redis as any)();
    adapter = new RedisStorageAdapter(mockRedisClient);
  });

  describe('Error Handling', () => {
    const testCases = [
      { method: 'get', args: ['key'], clientMethod: 'get' },
      { method: 'set', args: ['key', { data: 'value' }], clientMethod: 'set' },
      { method: 'delete', args: ['key'], clientMethod: 'del' },
      { method: 'exists', args: ['key'], clientMethod: 'exists' },
      { method: 'expire', args: ['key', 60], clientMethod: 'expire' },
    ];

    for (const { method, args, clientMethod } of testCases) {
      it(`should throw a StorageError when ${method} fails`, async () => {
        const testError = new Error('Redis connection failed');
        (mockRedisClient[clientMethod as keyof Redis] as Mocked<any>).mockRejectedValue(testError);

        const operation = (...args: any[]) => (adapter[method as keyof RedisStorageAdapter] as Function)(...args);

        await expect(operation(...args)).rejects.toThrow(StorageError);
        await expect(operation(...args)).rejects.toHaveProperty('operation', method);
        await expect(operation(...args)).rejects.toHaveProperty('originalError', testError);
      });
    }
  });
});
