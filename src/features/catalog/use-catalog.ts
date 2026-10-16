import { useQuery } from '@tanstack/react-query'
import { getCatalog } from './catalog-api'
import type { CatalogQuery } from '@/types/marketplace'

export const catalogKey = (params: CatalogQuery) => ['catalog', params] as const

export function useCatalog(params: CatalogQuery) {
  return useQuery({
    queryKey: catalogKey(params),
    queryFn: ({ signal }) => getCatalog(params, signal),
    placeholderData: (previous) => previous,
  })
}
