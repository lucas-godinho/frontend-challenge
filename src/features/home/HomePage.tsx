import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { CatalogViewState } from './CatalogResults'
import { HomeContent } from './HomeContent'
import { homeHeroSlides } from './home-content'
import { useCatalog } from '@/features/catalog/use-catalog'
import type { CatalogQuery } from '@/types/marketplace'

export function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const [activeSlide, setActiveSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const catalog = useCatalog(search)
  const featuredCatalog = useCatalog({ sort: 'recent', page: 1 })
  const catalogState: CatalogViewState = catalog.isPending
    ? { status: 'loading' }
    : catalog.isError
      ? { status: 'error', onRetry: () => void catalog.refetch() }
      : catalog.data.items.length === 0
        ? { status: 'empty' }
        : { status: 'success', items: catalog.data.items }

  useEffect(() => setDraft(search.q ?? ''), [search.q])

  useEffect(() => {
    if (isCarouselPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % homeHeroSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [isCarouselPaused])

  const update = (next: Partial<CatalogQuery>) => void navigate({
    search: (current: CatalogQuery) => ({ ...current, ...next, page: next.page ?? 1 }),
    replace: false,
    resetScroll: false,
    hashScrollIntoView: false,
  })

  return <HomeContent
    search={search}
    draft={draft}
    activeSlide={activeSlide}
    catalogState={catalogState}
    catalogData={catalog.data}
    isFetching={catalog.isFetching}
    featuredItems={featuredCatalog.data?.items ?? []}
    onDraftChange={setDraft}
    onUpdate={update}
    onSelectSlide={setActiveSlide}
    onPauseChange={setIsCarouselPaused}
  />
}
