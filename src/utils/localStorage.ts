/**
 * Type-safe localStorage wrapper with error handling
 *
 * Handles common localStorage errors:
 * - QuotaExceededError (storage quota exceeded)
 * - SecurityError (access denied in privacy mode)
 * - SyntaxError (invalid JSON)
 *
 * Provides graceful degradation when localStorage is unavailable
 */

/**
 * Get a value from localStorage with type safety and error handling
 *
 * @param key - The localStorage key
 * @param defaultValue - Value to return if key not found or error occurs
 * @returns The stored value or default value
 */
export function get<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`localStorage: Invalid JSON for key "${key}", returning default`, error);
    } else if (error instanceof DOMException && error.name === 'SecurityError') {
      console.warn(`localStorage: Access denied for key "${key}" (privacy mode?)`, error);
    } else {
      console.warn(`localStorage: Failed to read key "${key}"`, error);
    }
    return defaultValue;
  }
}

/**
 * Set a value in localStorage with error handling
 *
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON.stringify'd)
 */
export function set<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`localStorage: Quota exceeded when setting key "${key}"`, error);
      console.warn('Layout mode will not persist across sessions');
    } else if (error instanceof DOMException && error.name === 'SecurityError') {
      console.error(`localStorage: Access denied when setting key "${key}" (privacy mode?)`, error);
      console.warn('Layout mode will not persist across sessions');
    } else {
      console.error(`localStorage: Failed to write key "${key}"`, error);
    }
  }
}

/**
 * Remove a value from localStorage
 *
 * @param key - The localStorage key to remove
 */
export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`localStorage: Failed to remove key "${key}"`, error);
  }
}

/**
 * Check if localStorage is available and working
 *
 * @returns true if localStorage can be used, false otherwise
 */
export function isAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * LocalStorage utility object (alternative to individual function imports)
 */
export const LocalStorage = {
  get,
  set,
  remove,
  isAvailable,
};
