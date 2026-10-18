import { createContext, useContext } from 'react'

export type FavoriteActions = {
  isAuthenticated: boolean
  favoriteIds: ReadonlySet<string>
  toggleFavorite: (id: string) => void
}

export const FavoritesContext = createContext<FavoriteActions | null>(null)

export function useSharedFavorites() {
  return useContext(FavoritesContext)
}
