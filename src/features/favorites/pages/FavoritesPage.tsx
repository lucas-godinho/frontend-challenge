import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getCatalog } from '@/features/catalog/catalog-api'
import { FavoritesTemplate } from '@/features/favorites/templates/FavoritesTemplate'
import { useFavorites } from '../use-favorites'
import type { Nft } from '@/types/marketplace'

async function getAllNfts(signal: AbortSignal) {
  const firstPage = await getCatalog({ sort: 'recent', page: 1 }, signal)
  const remainingPages = await Promise.all(Array.from(
    { length: Math.max(0, Math.ceil(firstPage.total / firstPage.pageSize) - 1) },
    (_, index) => getCatalog({ sort: 'recent', page: index + 2 }, signal),
  ))
  return [firstPage, ...remainingPages].flatMap((page) => page.items)
}

export function FavoritesPage() {
  const navigate = useNavigate()
  const favorites = useFavorites()
  const favoriteIds = favorites.favoriteIds
  const catalog = useQuery<Nft[]>({
    queryKey: ['catalog', 'favorites-inventory'],
    queryFn: ({ signal }) => getAllNfts(signal),
    enabled: favoriteIds.length > 0,
    staleTime: 60_000,
  })
  const favoriteSet = new Set(favoriteIds)
  const items = (catalog.data ?? []).filter((nft) => favoriteSet.has(nft.id))
  const state = favorites.isLoading || catalog.isPending ? 'loading' : catalog.isError ? 'error' : 'ready'
  return <FavoritesTemplate hasFavorites={favoriteIds.length > 0} items={items} state={state}
    onRetry={() => void catalog.refetch()} onExplore={() => void navigate({ to: '/', hash: 'catalog', resetScroll: false })}/>
}
