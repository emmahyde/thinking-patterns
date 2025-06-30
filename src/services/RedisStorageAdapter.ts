import { Redis } from 'ioredis';
import { IStorageService } from './IStorageService.js';
import { StorageError } from '../errors/CustomErrors.js';

/**
 * A storage adapter that uses Redis as the backend.
 * It implements the IStorageService interface.
 */
export class RedisStorageAdapter implements IStorageService {
  private client: Redis;

  /**
   * Creates an instance of RedisStorageAdapter.
   * @param connectionString The connection string for the Redis server.
   */
  constructor(redisClient: Redis) {
    this.client = redisClient;
  }

  /**
   * Retrieves a value from Redis by its key.
   * @param key The unique identifier for the stored item.
   * @returns A promise that resolves to the stored value, or null if the key does not exist.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as T : null;
    } catch (error: any) {
      throw new StorageError(`Failed to get key '${key}'`, 'get', error);
    }
  }

  /**
   * Stores a value in Redis with a specific key.
   * @param key The unique identifier for the item to be stored.
   * @param value The value to store. It can be any serializable object.
   * @param ttl Optional. The time-to-live for the key in seconds.
   * @returns A promise that resolves when the operation is complete.
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error: any) {
      throw new StorageError(`Failed to set key '${key}'`, 'set', error);
    }
  }

  /**
   * Deletes a key and its associated value from Redis.
   * @param key The unique identifier of the item to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error: any) {
      throw new StorageError(`Failed to delete key '${key}'`, 'delete', error);
    }
  }

  /**
   * Checks if a key exists in Redis.
   * @param key The unique identifier to check for.
   * @returns A promise that resolves to true if the key exists, and false otherwise.
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      throw new StorageError(`Failed to check existence for key '${key}'`, 'exists', error);
    }
  }

  /**
   * Sets a time-to-live for a key in Redis.
   * @param key The unique identifier of the item.
   * @param seconds The time-to-live in seconds.
   * @returns A promise that resolves when the operation is complete.
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error: any) {
      throw new StorageError(`Failed to set expiration for key '${key}'`, 'expire', error);
    }
  }

  /**
   * Sets a field in a Redis hash.
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      await this.client.hset(key, field, JSON.stringify(value));
    } catch (error: any) {
      throw new StorageError(`Failed to hset field '${field}' for key '${key}'`, 'hset', error);
    }
  }

  /**
   * Gets a field from a Redis hash.
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) as T : null;
    } catch (error: any) {
      throw new StorageError(`Failed to hget field '${field}' for key '${key}'`, 'hget', error);
    }
  }

  /**
   * Gets all fields and values from a Redis hash.
   */
  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    try {
      const result = await this.client.hgetall(key);
      const parsed: Record<string, T> = {};
      for (const [k, v] of Object.entries(result)) {
        parsed[k] = JSON.parse(v);
      }
      return parsed;
    } catch (error: any) {
      throw new StorageError(`Failed to hgetall for key '${key}'`, 'hgetall', error);
    }
  }

  /**
   * Deletes a field from a Redis hash.
   */
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
    } catch (error: any) {
      throw new StorageError(`Failed to hdel field '${field}' for key '${key}'`, 'hdel', error);
    }
  }

  /**
   * Adds one or more members to a Redis set.
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sadd(key, ...members);
    } catch (error: any) {
      throw new StorageError(`Failed to sadd for key '${key}'`, 'sadd', error);
    }
  }

  /**
   * Removes one or more members from a Redis set.
   */
  async srem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.srem(key, ...members);
    } catch (error: any) {
      throw new StorageError(`Failed to srem for key '${key}'`, 'srem', error);
    }
  }

  /**
   * Gets all members of a Redis set.
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error: any) {
      throw new StorageError(`Failed to smembers for key '${key}'`, 'smembers', error);
    }
  }

  /**
   * Checks if a member exists in a Redis set.
   */
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error: any) {
      throw new StorageError(`Failed to sismember for key '${key}'`, 'sismember', error);
    }
  }

  /**
   * Adds one or more members to a Redis sorted set with scores.
   */
  async zadd(key: string, ...scoreMembers: Array<[number, string]>): Promise<void> {
    try {
      const flat: (string | number)[] = [];
      for (const [score, member] of scoreMembers) {
        flat.push(score, member);
      }
      await this.client.zadd(key, ...flat as any);
    } catch (error: any) {
      throw new StorageError(`Failed to zadd for key '${key}'`, 'zadd', error);
    }
  }

  /**
   * Gets a range of members from a Redis sorted set.
   */
  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[] | Array<{ member: string, score: number }>> {
    try {
      if (withScores) {
        const result = await this.client.zrange(key, start, stop, 'WITHSCORES');
        const arr: Array<{ member: string, score: number }> = [];
        for (let i = 0; i < result.length; i += 2) {
          arr.push({ member: result[i], score: parseFloat(result[i + 1]) });
        }
        return arr;
      } else {
        return await this.client.zrange(key, start, stop);
      }
    } catch (error: any) {
      throw new StorageError(`Failed to zrange for key '${key}'`, 'zrange', error);
    }
  }

  /**
   * Removes one or more members from a Redis sorted set.
   */
  async zrem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.zrem(key, ...members);
    } catch (error: any) {
      throw new StorageError(`Failed to zrem for key '${key}'`, 'zrem', error);
    }
  }

  /**
   * Gets the score of a member in a Redis sorted set.
   */
  async zscore(key: string, member: string): Promise<number | null> {
    try {
      const score = await this.client.zscore(key, member);
      return score !== null ? parseFloat(score) : null;
    } catch (error: any) {
      throw new StorageError(`Failed to zscore for key '${key}'`, 'zscore', error);
    }
  }

  /**
   * Pushes a value onto the left of a Redis list.
   */
  async lpush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.lpush(key, ...values);
    } catch (error: any) {
      throw new StorageError(`Failed to lpush for key '${key}'`, 'lpush', error);
    }
  }

  /**
   * Gets a range of values from a Redis list.
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error: any) {
      throw new StorageError(`Failed to lrange for key '${key}'`, 'lrange', error);
    }
  }

  /**
   * Removes elements from a Redis list.
   */
  async lrem(key: string, count: number, value: string): Promise<void> {
    try {
      await this.client.lrem(key, count, value);
    } catch (error: any) {
      throw new StorageError(`Failed to lrem for key '${key}'`, 'lrem', error);
    }
  }
}
