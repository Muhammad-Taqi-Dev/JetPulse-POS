/**
 * Framework: StorageService (LocalStorage / Session Management)
 * Handles namespaced storage, safe JSON parsing, and graceful error handling.
 */

const PREFIX = "POS_APP_";

class StorageService {
  /**
   * Sets a value in localStorage with namespacing
   */
  set<T = any>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(PREFIX + key, serialized);
      return true;
    } catch (e) {
      console.error("[StorageService] Error writing to storage:", e);
      return false;
    }
  }

  /**
   * Gets a value from localStorage with fallback
   */
  get<T = any>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error("[StorageService] Error reading from storage:", e);
      return defaultValue;
    }
  }

  /**
   * Removes an item by key
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error("[StorageService] Error removing item:", e);
    }
  }

  /**
   * Clears all items managed by this application
   */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error("[StorageService] Error clearing storage:", e);
    }
  }
}

export default new StorageService();
