// Global watchlist store — single source of truth shared across all components
// Uses a simple subscriber pattern so any component re-renders when the list changes

type Listener = () => void

const listeners = new Set<Listener>()

function getStored(): any[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('watchlist') || '[]')
  } catch {
    return []
  }
}

function persist(items: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('watchlist', JSON.stringify(items))
  listeners.forEach(fn => fn())
}

export const watchlistStore = {
  getAll: getStored,

  add(property: any) {
    const current = getStored()
    if (!current.find((p: any) => p.id === property.id)) {
      persist([...current, { ...property, savedAt: Date.now() }])
    }
  },

  remove(id: string) {
    persist(getStored().filter((p: any) => p.id !== id))
  },

  isWatched(id: string): boolean {
    return getStored().some((p: any) => p.id === id)
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
