import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/account/use-session'
import { addFavorite, getFavorites, removeFavorite } from './favorites-api'

export const favoritesKey = (userId: string | undefined) => ['favorites', userId] as const
const EMPTY_FAVORITES: string[] = []

export function useFavorites() {
  const session = useSession()
  const userId = session.data?.user.id
  const queryClient = useQueryClient()
  const queryKey = favoritesKey(userId)
  const favorites = useQuery({
    queryKey,
    queryFn: ({ signal }) => getFavorites(signal),
    enabled: Boolean(userId),
    retry: false,
    staleTime: 30_000,
  })
  const mutation = useMutation({
    mutationFn: ({ id, wasFavorite }: { id: string; wasFavorite: boolean }) =>
      wasFavorite ? removeFavorite(id) : addFavorite(id),
    onMutate: async ({ id, wasFavorite }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<string[]>(queryKey) ?? []
      queryClient.setQueryData<string[]>(queryKey, wasFavorite
        ? previous.filter((favoriteId) => favoriteId !== id)
        : [...new Set([...previous, id])])
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous)
    },
    onSuccess: (ids) => queryClient.setQueryData(queryKey, ids),
    onSettled: () => void queryClient.invalidateQueries({ queryKey }),
  })
  const favoriteIds = favorites.data ?? EMPTY_FAVORITES
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds])
  const isFavorite = useCallback((id: string) => favoriteSet.has(id), [favoriteSet])
  const { mutate } = mutation
  const toggleFavorite = useCallback((id: string) => mutate({ id, wasFavorite: favoriteSet.has(id) }), [favoriteSet, mutate])

  return {
    favoriteIds,
    isAuthenticated: Boolean(userId),
    isLoading: session.isPending || (Boolean(userId) && favorites.isPending),
    error: mutation.error,
    isFavorite,
    toggleFavorite,
  }
}
