import { lazy, Suspense, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { CatalogResults, type CatalogViewState } from './CatalogResults'
import { CatalogSearchForm, CatalogSortSelect } from '@/features/catalog/molecules/CatalogSearch'
import { CatalogTabs, type CatalogTab } from '@/features/catalog/molecules/CatalogTabs'
import type { CatalogQuery, CatalogResponse, Nft } from '@/types/marketplace'
import { Pagination } from '@/components/molecules/pagination'
import { useMediaQuery } from '@/lib/use-media-query'

const CatalogFilters = lazy(() => import('./CatalogFilters').then((module) => ({ default: module.CatalogFilters })))

export function CatalogSection({
  search,
  draft,
  onDraftChange,
  onUpdate,
  state,
  renderCard,
  catalogData,
  isFetching,
  featuredNft,
}: {
  search: CatalogQuery
  draft: string
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
  state: CatalogViewState
  renderCard?: Parameters<typeof CatalogResults>[0]['renderCard']
  catalogData?: CatalogResponse
  isFetching?: boolean
  featuredNft?: Nft
}) {
  const showSidebar = useMediaQuery('(min-width: 1051px)')
  const [activeTab, setActiveTab] = useState<CatalogTab>('all')
  const applySearch = () => onUpdate({ q: draft || undefined })
  const updateSort = (sort: NonNullable<CatalogQuery['sort']>) => onUpdate({ sort })
  const selectTab = (tab: CatalogTab) => {
    setActiveTab(tab)
    onUpdate({ sort: tab === 'trending' ? 'price-desc' : 'recent' })
  }

  return <section className="scroll-mt-24 border-t border-border py-9 pb-20 min-[1051px]:border-0 min-[1051px]:pt-2" id="catalog" aria-labelledby="catalog-title">
    <div className="mb-6 flex items-end justify-between gap-4 min-[1051px]:hidden" id="curated">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-primary">Curadoria da semana</p><h2 id="catalog-title" className="m-0 text-2xl font-semibold uppercase tracking-tight sm:text-3xl">Descubra NFTs</h2></div>
      <Button variant="ghost" className="h-auto min-h-0 shrink-0 gap-1 px-0 py-1 text-sm text-primary hover:text-accent" type="button" onClick={() => { setActiveTab('all'); onUpdate({ category: undefined, sort: 'recent', q: undefined, minPrice: undefined, maxPrice: undefined, network: undefined }) }}>Ver tudo <ArrowUpRight size={15}/></Button>
    </div>
    <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-3 min-[1051px]:mb-6 min-[1051px]:flex-nowrap">
      <CatalogTabs activeTab={activeTab} onSelect={selectTab}/>
      <div className="hidden w-full max-w-[280px] shrink-0 min-[1051px]:block">
        <CatalogSearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={applySearch} placeholder="Buscar obras ou artistas"/>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm"><span className="hidden sm:inline">Ordenar por:</span><CatalogSortSelect value={search.sort} onChange={updateSort}/></div>
    </div>
    <div className="mb-5 hidden min-[761px]:flex min-[1051px]:hidden">
      <CatalogSearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={applySearch} placeholder="Buscar por obra, coleção ou artista"/>
    </div>
    <div className={showSidebar ? 'grid items-start gap-5 min-[1051px]:grid-cols-[250px_minmax(0,1fr)] min-[1200px]:grid-cols-[300px_minmax(0,1fr)] min-[1200px]:gap-8' : 'grid'}>
      {showSidebar && <Suspense fallback={<aside className="hidden min-[1051px]:block" aria-hidden="true"/>}>
        <CatalogFilters category={search.category} onCategoryChange={(category) => onUpdate({ category })}
          facets={catalogData?.facets} search={search} onUpdate={onUpdate} featuredNft={featuredNft}/>
      </Suspense>}
      <div className="min-w-0" aria-label="Resultados do catálogo" role="region" aria-busy={isFetching}>
        <CatalogResults state={state} renderCard={renderCard}/>
        {catalogData && state.status === 'success' && <Pagination page={catalogData.page} pageSize={catalogData.pageSize} total={catalogData.total}
          disabled={isFetching} onPageChange={(page) => onUpdate({ page })}/>}
        {catalogData && <p className="sr-only" role="status">{catalogData.total} NFTs encontrados. Página {catalogData.page}.</p>}
      </div>
    </div>
  </section>
}
