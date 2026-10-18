import { useMemo, type ReactNode } from 'react'
import { useFavorites } from './use-favorites'
import { FavoritesContext } from './favorites-context'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favorites = useFavorites()
  const favoriteIds = useMemo(() => new Set(favorites.favoriteIds), [favorites.favoriteIds])
  const value = useMemo(() => ({
    isAuthenticated: favorites.isAuthenticated,
    favoriteIds,
    toggleFavorite: favorites.toggleFavorite,
  }), [favorites.isAuthenticated, favoriteIds, favorites.toggleFavorite])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
