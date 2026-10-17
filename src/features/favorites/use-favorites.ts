import { useSyncExternalStore } from 'react'

const storageKey = 'kurio:favorites:v1'
const listeners = new Set<() => void>()
let cachedIds: string[] | undefined

function readFavoriteIds() {
  if (cachedIds) return cachedIds

  try {
    const saved = window.localStorage.getItem(storageKey)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    cachedIds = Array.isArray(parsed)
      ? [...new Set(parsed.filter((value): value is string => typeof value === 'string'))]
      : []
  } catch {
    cachedIds = []
  }

  return cachedIds
}

function notify() {
  listeners.forEach((listener) => listener())
}

function onStorage(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) return
  cachedIds = undefined
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

function getServerSnapshot() {
  return [] as string[]
}

export function useFavoriteIds() {
  return useSyncExternalStore(subscribe, readFavoriteIds, getServerSnapshot)
}

export function useFavorites() {
  const favoriteIds = useFavoriteIds()

  const toggleFavorite = (id: string) => {
    const nextIds = favoriteIds.includes(id)
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds, id]
    cachedIds = nextIds

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextIds))
    } catch {
      // Keep the in-memory state usable when browser storage is unavailable.
    }

    notify()
  }

  return { favoriteIds, isFavorite: (id: string) => favoriteIds.includes(id), toggleFavorite }
}
