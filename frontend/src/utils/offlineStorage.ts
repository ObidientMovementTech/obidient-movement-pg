/**
 * Offline Storage Utility
 * Provides IndexedDB wrapper for offline data storage
 * Uses native IndexedDB API (no external dependencies)
 */

const DB_NAME = 'ObidientMovementDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  SUBMISSIONS: 'submissions',
  DRAFTS: 'drafts',
  CACHE: 'cache',
  SYNC_QUEUE: 'syncQueue'
} as const;

interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Initialize IndexedDB
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SUBMISSIONS)) {
        const submissionsStore = db.createObjectStore(STORES.SUBMISSIONS, { keyPath: 'key' });
        submissionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        submissionsStore.createIndex('electionId', 'value.electionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        const draftsStore = db.createObjectStore(STORES.DRAFTS, { keyPath: 'key' });
        draftsStore.createIndex('timestamp', 'timestamp', { unique: false });
        draftsStore.createIndex('formType', 'value.formType', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHE)) {
        const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'key' });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('status', 'value.status', { unique: false });
        queueStore.createIndex('priority', 'value.priority', { unique: false });
      }
    };
  });
};

/**
 * Get a value from a store
 */
export const getItem = async <T = any>(
  storeName: string,
  key: string
): Promise<T | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const item = request.result as StorageItem<T> | undefined;

        if (!item) {
          resolve(null);
          return;
        }

        // Check if item has expired
        if (item.expiresAt && item.expiresAt < Date.now()) {
          // Delete expired item
          deleteItem(storeName, key);
          resolve(null);
          return;
        }

        resolve(item.value);
      };

      request.onerror = () => {
        console.error('Error getting item:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getItem:', error);
    return null;
  }
};

/**
 * Set a value in a store
 */
export const setItem = async <T = any>(
  storeName: string,
  key: string,
  value: T,
  ttlMs?: number
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ...(ttlMs && { expiresAt: Date.now() + ttlMs })
    };

    const request = store.put(item);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Error setting item:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in setItem:', error);
    throw error;
  }
};

/**
 * Delete a value from a store
 */
export const deleteItem = async (
  storeName: string,
  key: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Error deleting item:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error;
  }
};

/**
 * Get all values from a store
 */
export const getAllItems = async <T = any>(
  storeName: string
): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as StorageItem<T>[];
        const now = Date.now();

        // Filter out expired items and extract values
        const validItems = items
          .filter(item => !item.expiresAt || item.expiresAt > now)
          .map(item => item.value);

        resolve(validItems);
      };

      request.onerror = () => {
        console.error('Error getting all items:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getAllItems:', error);
    return [];
  }
};

/**
 * Get items by index
 */
export const getItemsByIndex = async <T = any>(
  storeName: string,
  indexName: string,
  indexValue: any
): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(indexValue);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as StorageItem<T>[];
        const now = Date.now();

        // Filter out expired items and extract values
        const validItems = items
          .filter(item => !item.expiresAt || item.expiresAt > now)
          .map(item => item.value);

        resolve(validItems);
      };

      request.onerror = () => {
        console.error('Error getting items by index:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in getItemsByIndex:', error);
    return [];
  }
};

/**
 * Clear all items from a store
 */
export const clearStore = async (storeName: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Error clearing store:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in clearStore:', error);
    throw error;
  }
};

/**
 * Clean up expired items from cache store
 */
export const cleanupExpiredCache = async (): Promise<number> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORES.CACHE, 'readwrite');
    const store = transaction.objectStore(STORES.CACHE);
    const index = store.index('expiresAt');
    const now = Date.now();

    // Get all items with expiresAt < now
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        console.error('Error cleaning up cache:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in cleanupExpiredCache:', error);
    return 0;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<{
  totalItems: number;
  storeStats: Record<string, number>;
}> => {
  try {
    const db = await initDB();
    const stores = [
      STORES.SUBMISSIONS,
      STORES.DRAFTS,
      STORES.CACHE,
      STORES.SYNC_QUEUE
    ];

    const storeStats: Record<string, number> = {};
    let totalItems = 0;

    for (const storeName of stores) {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      const count = await new Promise<number>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      storeStats[storeName] = count;
      totalItems += count;
    }

    return { totalItems, storeStats };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalItems: 0, storeStats: {} };
  }
};

/**
 * Check if browser supports IndexedDB
 */
export const isIndexedDBSupported = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

export default {
  getItem,
  setItem,
  deleteItem,
  getAllItems,
  getItemsByIndex,
  clearStore,
  cleanupExpiredCache,
  getStorageStats,
  isIndexedDBSupported
};
