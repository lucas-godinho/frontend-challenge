import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { CatalogViewState } from '@/features/home/organisms/CatalogResults'
import { HomeTemplate } from '@/features/home/templates/HomeTemplate'
import { useCatalog } from '@/features/catalog/use-catalog'
import { useCatalogRealtime } from '@/features/catalog/use-catalog-realtime'
import type { CatalogQuery } from '@/types/marketplace'

export function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const catalog = useCatalog(search)
  const isDefaultCatalog = search.sort === 'recent' && search.page === 1 && !search.q && !search.category
    && search.minPrice === undefined && search.maxPrice === undefined && !search.network
  const featuredCatalog = useCatalog({ sort: 'recent', page: 1 }, !isDefaultCatalog)
  const featuredItems = isDefaultCatalog ? catalog.data?.items : featuredCatalog.data?.items
  useCatalogRealtime(catalog.data?.items.map((nft) => nft.id) ?? [])
  const catalogState: CatalogViewState = catalog.isPending
    ? { status: 'loading' }
    : catalog.isError
      ? { status: 'error', onRetry: () => void catalog.refetch() }
      : catalog.data.items.length === 0
        ? { status: 'empty' }
        : { status: 'success', items: catalog.data.items }

  useEffect(() => setDraft(search.q ?? ''), [search.q])

  const update = useCallback((next: Partial<CatalogQuery>) => void navigate({
    search: (current: CatalogQuery) => ({ ...current, ...next, page: next.page ?? 1 }),
    replace: false,
    resetScroll: false,
    hashScrollIntoView: false,
  }), [navigate])

  return <HomeTemplate
    search={search}
    draft={draft}
    catalogState={catalogState}
    catalogData={catalog.data}
    isFetching={catalog.isFetching}
    featuredItems={featuredItems ?? []}
    onDraftChange={setDraft}
    onUpdate={update}
  />
}
