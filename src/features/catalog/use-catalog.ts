import { useQuery } from '@tanstack/react-query'
import { getCatalog } from './catalog-api'
import type { CatalogQuery } from '@/types/marketplace'

export const catalogKey = (params: CatalogQuery) => ['catalog', params] as const

export function useCatalog(params: CatalogQuery, enabled = true) {
  return useQuery({
    queryKey: catalogKey(params),
    queryFn: ({ signal }) => getCatalog(params, signal),
    enabled,
    staleTime: 30_000,
    gcTime: 300_000,
    retry: 1,
    placeholderData: (previous) => previous,
  })
}
