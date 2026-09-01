import { ContentPost } from '../types';

const DB_NAME = 'nyarios_content_store';
const DB_VERSION = 1;
const CONTENT_STORE = 'content_posts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        db.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveContentPost(post: ContentPost): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(CONTENT_STORE, 'readwrite');
    const store = tx.objectStore(CONTENT_STORE);
    store.put(post);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[IndexedDB] saveContentPost error', e);
  }
}

export async function getAllContentPosts(): Promise<ContentPost[]> {
  try {
    const db = await openDb();
    const tx = db.transaction(CONTENT_STORE, 'readonly');
    const store = tx.objectStore(CONTENT_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const all = (request.result || []) as ContentPost[];
        // sort by timestamp descending
        resolve(all.sort((a, b) => b.rawTimestamp - a.rawTimestamp));
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function deleteContentPost(postId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(CONTENT_STORE, 'readwrite');
    const store = tx.objectStore(CONTENT_STORE);
    store.delete(postId);
  } catch (e) {
    console.warn('[IndexedDB] deleteContentPost error', e);
  }
}

export async function updateContentPost(postId: string, updates: Partial<ContentPost>): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(CONTENT_STORE, 'readwrite');
    const store = tx.objectStore(CONTENT_STORE);
    const getReq = store.get(postId);
    getReq.onsuccess = () => {
        if (getReq.result) {
            const updated = { ...getReq.result, ...updates };
            store.put(updated);
        }
    };
  } catch (e) {
    console.warn('[IndexedDB] updateContentPost error', e);
  }
}
