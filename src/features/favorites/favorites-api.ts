import { api } from '@/lib/api'

type FavoritesResponse = { ids: string[] }

export async function getFavorites(signal?: AbortSignal): Promise<string[]> {
  const response = await api.get<FavoritesResponse>('/favorites', { signal })
  return response.data.ids
}

export async function addFavorite(nftId: string): Promise<string[]> {
  const response = await api.post<FavoritesResponse>('/favorites', { nftId })
  return response.data.ids
}

export async function removeFavorite(nftId: string): Promise<string[]> {
  const response = await api.delete<FavoritesResponse>(`/favorites/${encodeURIComponent(nftId)}`)
  return response.data.ids
}
