export interface CacheEntry<T> {
  expiresAt: number;
  value: Promise<T>;
}

export class PromiseTtlCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly ttlMs = 300_000,
    private readonly maxEntries = 100
  ) {}

  getOrCreate(key: string, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.entries.get(key);

    if (existing && existing.expiresAt > now) {
      return existing.value;
    }

    if (existing) this.entries.delete(key);

    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value as
        | string
        | undefined;
      if (oldest) this.entries.delete(oldest);
    }

    const value = factory().catch((error) => {
      this.entries.delete(key);
      throw error;
    });

    this.entries.set(key, {
      expiresAt: now + this.ttlMs,
      value
    });

    return value;
  }

  clear(): void {
    this.entries.clear();
  }
}
