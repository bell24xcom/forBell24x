import CryptoJS from 'crypto-js';

// Types
type StorageType = 'local' | 'session';
type StorageOptions = {
  expiresIn?: number; // in milliseconds
  encrypt?: boolean;
  secretKey?: string;
};

const DEFAULT_OPTIONS: StorageOptions = {
  expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
  encrypt: false,
  secretKey: process.env.REACT_APP_STORAGE_SECRET || 'default-secret-key',
};

// Encryption/Decryption helpers
const encryptData = (data: any, secretKey: string): string => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

const decryptData = <T>(encryptedData: string, secretKey: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? JSON.parse(decrypted) : null;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Storage class
class StorageManager {
  private storage: Storage;
  private options: StorageOptions;

  constructor(type: StorageType = 'local', options: StorageOptions = {}) {
    this.storage = type === 'local' ? window.localStorage : window.sessionStorage;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private getStorageKey(key: string): string {
    return `bell24h_${key}`;
  }

  set<T>(key: string, value: T, options?: StorageOptions): void {
    try {
      const storageKey = this.getStorageKey(key);
      const mergedOptions = { ...this.options, ...options };
      
      const data = {
        value,
        expiresAt: mergedOptions.expiresIn ? Date.now() + mergedOptions.expiresIn : null,
      };

      const dataToStore = mergedOptions.encrypt
        ? encryptData(data, mergedOptions.secretKey!)
        : JSON.stringify(data);

      this.storage.setItem(storageKey, dataToStore);
    } catch (error) {
      console.error(`Error setting item in storage (${key}):`, error);
    }
  }

  get<T>(key: string, options?: StorageOptions): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const mergedOptions = { ...this.options, ...options };
      const storedItem = this.storage.getItem(storageKey);

      if (!storedItem) return null;

      let parsedData: { value: T; expiresAt: number | null };
      
      try {
        parsedData = mergedOptions.encrypt
          ? decryptData<{ value: T; expiresAt: number | null }>(storedItem, mergedOptions.secretKey!)
          : JSON.parse(storedItem);
      } catch (error) {
        // If decryption/parsing fails, remove the corrupted data
        this.remove(key);
        return null;
      }

      // Check if the item has expired
      if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
        this.remove(key);
        return null;
      }

      return parsedData.value;
    } catch (error) {
      console.error(`Error getting item from storage (${key}):`, error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      this.storage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error removing item from storage (${key}):`, error);
    }
  }

  clear(force: boolean = false): void {
    try {
      if (force) {
        this.storage.clear();
      } else {
        // Only clear items with our prefix
        Object.keys(this.storage).forEach(key => {
          if (key.startsWith('bell24h_')) {
            this.storage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(this.storage)
        .filter(key => key.startsWith('bell24h_'))
        .map(key => key.replace('bell24h_', ''));
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  // Helper methods for common data types
  setString(key: string, value: string, options?: StorageOptions): void {
    this.set<string>(key, value, options);
  }

  getString(key: string, options?: StorageOptions): string | null {
    return this.get<string>(key, options) || null;
  }

  setNumber(key: string, value: number, options?: StorageOptions): void {
    this.set<number>(key, value, options);
  }

  getNumber(key: string, options?: StorageOptions): number | null {
    return this.get<number>(key, options) || null;
  }

  setBoolean(key: string, value: boolean, options?: StorageOptions): void {
    this.set<boolean>(key, value, options);
  }

  getBoolean(key: string, options?: StorageOptions): boolean | null {
    return this.get<boolean>(key, options) || null;
  }

  setObject<T>(key: string, value: T, options?: StorageOptions): void {
    this.set<T>(key, value, options);
  }

  getObject<T>(key: string, options?: StorageOptions): T | null {
    return this.get<T>(key, options) || null;
  }
}

// Create default instances
export const localStorageManager = new StorageManager('local');
export const sessionStorageManager = new StorageManager('session');

// Example usage:
// Example usage:
// Basic usage
// localStorageManager.set('user', { name: 'John', id: 1 });
// const user = localStorageManager.get<{ name: string; id: number }>('user');

// With encryption
// localStorageManager.set('token', 'secret-token', { encrypt: true });
// const token = localStorageManager.getString('token', { encrypt: true });

// With expiration (1 hour)
// localStorageManager.set('temporaryData', { id: 123, temp: true }, { expiresIn: 60 * 60 * 1000 });

// Clear all Bell24H related data from storage
// localStorageManager.clear();
