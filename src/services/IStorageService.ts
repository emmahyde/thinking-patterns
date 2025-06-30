/**
 * @file Defines the contract for storage services.
 * @author Gemini
 */

/**
 * Represents a generic interface for a key-value storage system.
 * This abstraction allows for interchangeable storage backends (e.g., in-memory, Redis, database)
 * without altering the application logic that depends on it.
 */
export interface IStorageService {
  /**
   * Retrieves a value from the storage by its key.
   * @param key The unique identifier for the stored item.
   * @returns A promise that resolves to the stored value, or null if the key does not exist.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Stores a value with a specific key.
   * @param key The unique identifier for the item to be stored.
   * @param value The value to store. It can be any serializable object.
   * @param ttl Optional. The time-to-live for the key in seconds. After this time, the key may be automatically deleted.
   * @returns A promise that resolves when the operation is complete.
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Deletes a key and its associated value from the storage.
   * @param key The unique identifier of the item to delete.
   * @returns A promise that resolves when the operation is complete.
   */
  delete(key: string): Promise<void>;

  /**
   * Checks if a key exists in the storage.
   * @param key The unique identifier to check for.
   * @returns A promise that resolves to true if the key exists, and false otherwise.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Sets a time-to-live for a key.
   * @param key The unique identifier of the item.
   * @param seconds The time-to-live in seconds.
   * @returns A promise that resolves when the operation is complete.
   */
  expire?(key: string, seconds: number): Promise<void>;
}
