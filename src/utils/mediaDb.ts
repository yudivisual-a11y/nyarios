/**
 * NYARIOS IndexedDB Storage Utility
 * High-capacity native browser storage for media files and video statuses (100MB+ capacity)
 */

import { StatusStory } from '../types';

const DB_NAME = 'nyarios_media_store_v4';
const DB_VERSION = 1;
const STATUS_STORE = 'statuses_store';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STATUS_STORE)) {
        db.createObjectStore(STATUS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStatusToDb(status: StatusStory): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STATUS_STORE, 'readwrite');
    const store = tx.objectStore(STATUS_STORE);
    store.put(status);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[IndexedDB] saveStatus error', e);
  }
}

export async function getAllActiveStatusesFromDb(): Promise<StatusStory[]> {
  try {
    const db = await openDb();
    const tx = db.transaction(STATUS_STORE, 'readonly');
    const store = tx.objectStore(STATUS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const all = (request.result || []) as StatusStory[];
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const active = all.filter((s) => now - (s.rawTimestamp || 0) < twentyFourHours);
        resolve(active);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function deleteStatusFromDb(statusId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STATUS_STORE, 'readwrite');
    const store = tx.objectStore(STATUS_STORE);
    store.delete(statusId);
  } catch (e) {
    console.warn('[IndexedDB] deleteStatus error', e);
  }
}
