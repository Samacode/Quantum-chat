// Local database using IndexedDB for secure storage
interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
}

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified: boolean;
  safetyNumber: string;
  addedAt: Date;
}

interface Message {
  id: string;
  contactId: string;
  content: string;
  timestamp: Date;
  isOutgoing: boolean;
  encrypted: boolean;
}

interface Settings {
  id: string;
  hybridMode: boolean;
  deviceVerified: boolean;
  lastUpdated: Date;
}

class LocalDatabase {
  private dbName = 'QuantumSecureChat';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Contacts store
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
          contactStore.createIndex('username', 'username', { unique: false });
        }

        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('contactId', 'contactId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    return this.performTransaction('users', 'readwrite', (store) => {
      store.put(user);
    });
  }

  async getUser(): Promise<User | null> {
    return this.performTransaction('users', 'readonly', async (store) => {
      const request = store.getAll();
      return new Promise<User | null>((resolve) => {
        request.onsuccess = () => {
          const users = request.result;
          resolve(users.length > 0 ? users[0] : null);
        };
      });
    });
  }

  async updateUser(updates: Partial<User>): Promise<void> {
    const user = await this.getUser();
    if (user) {
      await this.saveUser({ ...user, ...updates });
    }
  }

  // Contact operations
  async saveContact(contact: Contact): Promise<void> {
    return this.performTransaction('contacts', 'readwrite', (store) => {
      store.put(contact);
    });
  }

  async getContacts(): Promise<Contact[]> {
    return this.performTransaction('contacts', 'readonly', async (store) => {
      const request = store.getAll();
      return new Promise<Contact[]>((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    return this.performTransaction('contacts', 'readwrite', (store) => {
      store.delete(contactId);
    });
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    return this.performTransaction('messages', 'readwrite', (store) => {
      store.put(message);
    });
  }

  async getMessages(contactId: string): Promise<Message[]> {
    return this.performTransaction('messages', 'readonly', async (store) => {
      const index = store.index('contactId');
      const request = index.getAll(contactId);
      return new Promise<Message[]>((resolve) => {
        request.onsuccess = () => {
          const messages = request.result.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          resolve(messages);
        };
      });
    });
  }

  // Settings operations
  async saveSettings(settings: Settings): Promise<void> {
    return this.performTransaction('settings', 'readwrite', (store) => {
      store.put(settings);
    });
  }

  async getSettings(): Promise<Settings | null> {
    return this.performTransaction('settings', 'readonly', async (store) => {
      const request = store.get('main');
      return new Promise<Settings | null>((resolve) => {
        request.onsuccess = () => resolve(request.result || null);
      });
    });
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => T | Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);

      let result: T;
      const operationResult = operation(store);

      if (operationResult instanceof Promise) {
        operationResult.then(res => result = res).catch(reject);
      } else {
        result = operationResult;
      }
    });
  }
}

export const db = new LocalDatabase();
export type { User, Contact, Message, Settings };