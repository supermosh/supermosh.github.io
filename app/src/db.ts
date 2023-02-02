import { SavedFile, SavedSegment } from './types';

let db: IDBDatabase;

export const setup = () => new Promise<void>((resolve, reject) => {
  const or = indexedDB.open('db');
  or.onerror = reject;
  or.onblocked = reject;
  or.onupgradeneeded = () => {
    db = or.result;
    db.createObjectStore('files', { keyPath: 'key', autoIncrement: true });
    db.createObjectStore('segments', { autoIncrement: true });
  };
  or.onsuccess = () => {
    db = or.result;
    resolve();
  };
});

export const filesStore = {
  getAll: () => new Promise<SavedFile[]>((resolve, reject) => {
    const op = db.transaction('files', 'readonly').objectStore('files').getAll();
    op.onerror = reject;
    op.onsuccess = () => resolve(op.result);
  }),
  add: (file: File) => new Promise<number>((resolve, reject) => {
    const op = db.transaction('files', 'readwrite').objectStore('files').add({ file });
    op.onerror = reject;
    op.onsuccess = () => resolve(op.result as number);
  }),
  clear: () => new Promise<void>((resolve, reject) => {
    const op = db.transaction('files', 'readwrite').objectStore('files').clear();
    op.onerror = reject;
    op.onsuccess = () => resolve();
  }),
  delete: (key: number) => new Promise<void>((resolve, reject) => {
    const op = db.transaction('files', 'readwrite').objectStore('files').delete(key);
    op.onerror = reject;
    op.onsuccess = () => resolve();
  }),
};

export const segmentsStore = {
  save: (segments: SavedSegment[]) => new Promise((resolve, reject) => {
    const tx = db.transaction('segments', 'readwrite');
    tx.onabort = reject;
    tx.onerror = reject;
    tx.oncomplete = resolve;
    const store = tx.objectStore('segments');
    store.clear();
    for (const segment of segments) {
      store.add(segment);
    }
  }),
  getAll: () => new Promise<SavedSegment[]>((resolve, reject) => {
    const op = db.transaction('segments', 'readonly').objectStore('segments').getAll();
    op.onerror = reject;
    op.onsuccess = () => resolve(op.result);
  }),
  clear: () => new Promise<void>((resolve, reject) => {
    const op = db.transaction('segments', 'readwrite').objectStore('segments').clear();
    op.onerror = reject;
    op.onsuccess = () => resolve();
  }),
};
