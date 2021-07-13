import { SavedFile } from './types';

let db: IDBDatabase;

export const setup = () => new Promise<void>((resolve, reject) => {
  const or = indexedDB.open('db');
  or.onerror = reject;
  or.onblocked = reject;
  or.onupgradeneeded = () => {
    db = or.result;
    db.createObjectStore('files', { keyPath: 'key', autoIncrement: true });
  };
  or.onsuccess = () => {
    db = or.result;
    resolve();
  };
});

export const stores = {
  files: {
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
  },
};

// @ts-ignore
window.tx = (method, ...args) => new Promise((resolve, reject) => {
  const request = db.transaction('files', 'readwrite').objectStore('files')[method](...args);
  request.onerror = reject;
  request.onsuccess = () => resolve(request.result);
});
