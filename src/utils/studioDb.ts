import { openDB } from 'idb';
import { StudioProject, StudioPage, StudioCharacter } from '../types';

const DB_NAME = 'beres_creative_db';
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const store = db.createObjectStore('projects', { keyPath: 'id' });
        store.createIndex('by-user', 'userId');
        store.createIndex('by-updated', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('pages')) {
        const store = db.createObjectStore('pages', { keyPath: 'id' });
        store.createIndex('by-project', 'projectId');
      }
      if (!db.objectStoreNames.contains('characters')) {
        const store = db.createObjectStore('characters', { keyPath: 'id' });
        store.createIndex('by-project', 'projectId');
      }
    },
  });
}

export async function saveProject(project: StudioProject) {
  const db = await initDB();
  return db.put('projects', project);
}

export async function getProjects(userId: string): Promise<StudioProject[]> {
  const db = await initDB();
  const tx = db.transaction('projects', 'readonly');
  const index = tx.store.index('by-user');
  const all = await index.getAll(userId);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteProject(id: string) {
  const db = await initDB();
  // Simplified deletion. In reality, pages and characters should cascade delete.
  return db.delete('projects', id);
}
