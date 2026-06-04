// src/lib/storage.ts
const STORAGE_KEY_PREFIX = 'shipin_';

// LocalStorage implementation (keeping backward compatibility)
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};

// Storage backend interface for future SQLite backend
export interface StorageBackend {
  get<T>(key: string, defaultValue: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  clear(): void;
}

// Current implementation uses LocalStorage
export const backend: StorageBackend = storage;