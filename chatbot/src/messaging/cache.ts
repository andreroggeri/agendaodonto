import { CacheStore } from '@whiskeysockets/baileys';

export class MessengerCache implements CacheStore {
  private readonly data = new Map();

  get<T>(key: string): T | undefined {
    return this.data.get(key);
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  del(key: string): void {
    this.data.delete(key);
  }

  flushAll(): void {
    this.data.clear();
  }
}
