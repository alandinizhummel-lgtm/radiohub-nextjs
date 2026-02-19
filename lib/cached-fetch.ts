const DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes
const SEARCH_TTL = 5 * 60 * 1000  // 5 minutes
const MAX_CACHE_ENTRIES = 100

interface CacheEntry {
  data: any
  expiresAt: number
}

function getCacheKey(url: string): string {
  return `rh_cache_${url}`
}

function getCache(key: string): any | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function setCache(key: string, data: any, ttl: number): void {
  try {
    const entry: CacheEntry = { data, expiresAt: Date.now() + ttl }
    localStorage.setItem(key, JSON.stringify(entry))
    cleanupCache()
  } catch {
    // localStorage full or unavailable - silently fail
  }
}

function cleanupCache(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('rh_cache_')) keys.push(key)
    }
    // If too many entries, remove oldest
    if (keys.length > MAX_CACHE_ENTRIES) {
      const entries = keys.map(key => {
        try {
          const raw = localStorage.getItem(key)
          const parsed = raw ? JSON.parse(raw) : null
          return { key, expiresAt: parsed?.expiresAt || 0 }
        } catch {
          return { key, expiresAt: 0 }
        }
      })
      entries.sort((a, b) => a.expiresAt - b.expiresAt)
      // Remove the oldest half
      const toRemove = entries.slice(0, Math.floor(entries.length / 2))
      toRemove.forEach(e => localStorage.removeItem(e.key))
    }
  } catch {
    // Ignore cleanup errors
  }
}

/** Clear all RadioHub cache entries (call after admin creates/edits/deletes) */
export function invalidateCache(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('rh_cache_')) keys.push(key)
    }
    keys.forEach(key => localStorage.removeItem(key))
  } catch {
    // Ignore
  }
}

/**
 * Fetch with client-side localStorage cache.
 * - Content APIs: cached 30 min
 * - Search APIs: cached 5 min
 * - Errors: not cached
 */
export async function cachedFetch(url: string): Promise<any> {
  if (typeof window === 'undefined') {
    // SSR - no cache
    const res = await fetch(url)
    return res.json()
  }

  const key = getCacheKey(url)
  const cached = getCache(key)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.detail || body.error || ''
    } catch { /* ignore parse errors */ }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  const data = await res.json()

  // Use shorter TTL for search
  const ttl = url.includes('/api/search') ? SEARCH_TTL : DEFAULT_TTL
  setCache(key, data, ttl)

  return data
}
