/**
 * Einfacher In-Memory-Cache für Spotify-Daten
 * Cache-Dauer: 24 Stunden
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden

/**
 * Speichert Daten im Cache
 */
export function setCacheData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Holt Daten aus dem Cache, wenn sie noch gültig sind
 */
export function getCacheData<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;

  // Wenn die Daten älter als 24 Stunden sind, lösche sie
  if (age > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Löscht einen bestimmten Cache-Eintrag
 */
export function clearCacheData(key: string): void {
  cache.delete(key);
}

/**
 * Löscht alle Cache-Einträge für einen Benutzer
 */
export function clearUserCache(userId: string): void {
  const keysToDelete: string[] = [];

  cache.forEach((_, key) => {
    if (key.startsWith(`${userId}:`)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => cache.delete(key));
}

/**
 * Erstellt einen Cache-Key für einen Benutzer und Datentyp
 */
export function createCacheKey(userId: string, dataType: string, params?: string): string {
  return params ? `${userId}:${dataType}:${params}` : `${userId}:${dataType}`;
}
