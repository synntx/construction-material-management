type CachedData<T> = {
  data: T;
  timestamp: number;
  customKey?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CachedData<any>>();

// TIME TO LIVE
const DEFAULT_CACHE_TTL = 4 * 60 * 1000;

export function getFromCache<T>(key: string): T | null {
  const cachedItem = cache.get(key);

  if (cachedItem)
    if (Date.now() - cachedItem.timestamp <= DEFAULT_CACHE_TTL) {
      return cachedItem?.data as T;
    } else {
      cache.delete(key);
      return null;
    }

  return null;
}

export function clearCache(): void {
  cache.clear();
}

export function setToCache<T>(key: string, data: T, customKey?: string) {
  cache.set(key, { data: data, timestamp: Date.now(), customKey });
}

export function removeFromCache(key: string) {
  cache.delete(key);
}

export function invalidateByCustomKey(customKey: string): void {
  for (const [key, value] of cache.entries()) {
    if (value.customKey === customKey) {
      cache.delete(key);
    }
  }
}
