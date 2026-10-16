import { api } from '@/lib/api'
import type { CatalogQuery, CatalogResponse, Nft } from '@/types/marketplace'

export async function getCatalog(params: CatalogQuery, signal?: AbortSignal): Promise<CatalogResponse> {
  const response = await api.get<CatalogResponse>('/nfts', { params, signal })
  return response.data
}

export async function getNft(id: string, signal?: AbortSignal): Promise<Nft> {
  const response = await api.get<Nft>(`/nfts/${encodeURIComponent(id)}`, { signal })
  return response.data
}
