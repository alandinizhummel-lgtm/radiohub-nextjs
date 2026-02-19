const FAVORITES_KEY = 'rh_favorites'
const HISTORY_KEY = 'rh_history'
const MAX_HISTORY = 15

export interface SavedItem {
  id: string
  tipo: string
  especialidade: string
  titulo: string
  subarea?: string
  savedAt: number
}

// --- Favorites ---

export function getFavorites(): SavedItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().some(f => f.id === id)
}

export function toggleFavorite(item: Omit<SavedItem, 'savedAt'>): boolean {
  const favs = getFavorites()
  const idx = favs.findIndex(f => f.id === item.id)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return false // removed
  }
  favs.unshift({ ...item, savedAt: Date.now() })
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  return true // added
}

// --- History ---

export function getHistory(): SavedItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addToHistory(item: Omit<SavedItem, 'savedAt'>): void {
  try {
    const history = getHistory().filter(h => h.id !== item.id)
    history.unshift({ ...item, savedAt: Date.now() })
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // localStorage unavailable
  }
}
