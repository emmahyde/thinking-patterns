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
}
