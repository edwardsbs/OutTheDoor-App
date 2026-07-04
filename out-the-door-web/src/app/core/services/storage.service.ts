import { Injectable } from '@angular/core';
import { ActiveRun } from '../models/active-run.model';
import { UiSettings } from '../models/ui-settings.model';

// Scenarios now live on the server (see ScenarioApiService). Only device-local
// state (the in-progress run and UI settings) is kept in IndexedDB.
type StoreName = 'activeRun' | 'uiSettings';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly dbName = 'out-the-door-db';
  private readonly dbVersion = 2;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;

        // Scenarios moved to the server; drop the legacy local store.
        if (db.objectStoreNames.contains('scenarios')) {
          db.deleteObjectStore('scenarios');
        }

        if (!db.objectStoreNames.contains('activeRun')) {
          db.createObjectStore('activeRun', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('uiSettings')) {
          db.createObjectStore('uiSettings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getActiveRun(): Promise<ActiveRun | null> {
    const items = await this.getAll<ActiveRun>('activeRun');
    return items[0] ?? null;
  }

  async saveActiveRun(run: ActiveRun): Promise<void> {
    await this.clearStore('activeRun');
    await this.put('activeRun', run);
  }

  async clearActiveRun(): Promise<void> {
    await this.clearStore('activeRun');
  }

  async getUiSettings(): Promise<UiSettings | null> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('uiSettings', 'readonly');
      const store = tx.objectStore('uiSettings');
      const request = store.get('main');

      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUiSettings(settings: UiSettings): Promise<void> {
    const db = await this.getDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('uiSettings', 'readwrite');
      const store = tx.objectStore('uiSettings');
      store.put({ key: 'main', value: settings });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(storeName: StoreName, value: unknown): Promise<void> {
    const db = await this.getDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async delete(storeName: StoreName, key: IDBValidKey): Promise<void> {
    const db = await this.getDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private async clearStore(storeName: StoreName): Promise<void> {
    const db = await this.getDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}