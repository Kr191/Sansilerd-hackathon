'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { watchlistStore } from '@/lib/watchlistStore'

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useWatchlist() {
  // Always start with empty array — same on server and client
  const [watchlist, setWatchlist] = useState<any[]>([])

  useEffect(() => {
    // Runs only on client after hydration
    setWatchlist(watchlistStore.getAll())
    return watchlistStore.subscribe(() => setWatchlist(watchlistStore.getAll()))
  }, [])

  return {
    watchlist,
    add: useCallback((p: any) => watchlistStore.add(p), []),
    remove: useCallback((id: string) => watchlistStore.remove(id), []),
    isWatched: useCallback((id: string) => watchlistStore.isWatched(id), []),
  }
}

// ── Save button ───────────────────────────────────────────────────────────────
interface WatchlistButtonProps {
  property: any
  size?: 'sm' | 'md'
}

export function WatchlistButton({ property, size = 'md' }: WatchlistButtonProps) {
  // Always false on server — avoids hydration mismatch
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Sync real state after hydration
    setSaved(watchlistStore.isWatched(property.id))
    return watchlistStore.subscribe(() => {
      setSaved(watchlistStore.isWatched(property.id))
    })
  }, [property.id])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (saved) {
      watchlistStore.remove(property.id)
    } else {
      setSaving(true)
      watchlistStore.add(property)
      setTimeout(() => setSaving(false), 500)
    }
  }

  const sm = size === 'sm'
  const base = `flex items-center gap-1 rounded-full font-semibold transition-all duration-200 ${sm ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`

  return (
    <button onClick={handleClick} className={`${base} ${
      saved ? 'bg-violet-600 text-white shadow-sm'
      : saving ? 'bg-violet-100 text-violet-500 scale-95'
      : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-700'
    }`}>
      {saving && !saved ? (
        <>
          <div className={`border-2 border-violet-400 border-t-transparent rounded-full animate-spin ${sm ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          Saving…
        </>
      ) : saved ? (
        <>
          <BookmarkCheck className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Saved
        </>
      ) : (
        <>
          <Bookmark className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Save
        </>
      )}
    </button>
  )
}

export default function WatchlistPanel() {
  return null
}
