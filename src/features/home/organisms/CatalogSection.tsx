import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CatalogFilters } from './CatalogFilters'
import { CatalogResults, type CatalogViewState } from './CatalogResults'
import { CatalogSearchForm, CatalogSortSelect } from '@/features/catalog/molecules/CatalogSearch'
import { CatalogTabs, type CatalogTab } from '@/features/catalog/molecules/CatalogTabs'
import type { CatalogQuery, CatalogResponse, Nft } from '@/types/marketplace'
import { Pagination } from '@/components/molecules/pagination'

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
  const [activeTab, setActiveTab] = useState<CatalogTab>('all')
  const applySearch = () => onUpdate({ q: draft || undefined })
  const updateSort = (sort: NonNullable<CatalogQuery['sort']>) => onUpdate({ sort })
  const selectTab = (tab: CatalogTab) => {
    setActiveTab(tab)
    onUpdate({ sort: tab === 'trending' ? 'price-desc' : 'recent' })
  }

  return <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
    <div className="section-heading" id="curated">
      <div><p className="eyebrow">Curadoria da semana</p><h2 id="catalog-title">Descubra NFTs</h2></div>
      <button className="text-button" type="button" onClick={() => { setActiveTab('all'); onUpdate({ category: undefined, sort: 'recent', q: undefined, minPrice: undefined, maxPrice: undefined, network: undefined }) }}>Ver tudo <ArrowUpRight size={15}/></button>
    </div>
    <div className="catalog-tabs-row">
      <CatalogTabs activeTab={activeTab} onSelect={selectTab}/>
      <div className="catalog-sort"><span>Ordenar por:</span><CatalogSortSelect value={search.sort} onChange={updateSort}/></div>
    </div>
    <div className="catalog-tools desktop-catalog-tools">
      <CatalogSearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={applySearch} placeholder="Buscar por obra, coleção ou artista"/>
      <CatalogSortSelect value={search.sort} onChange={updateSort}/>
    </div>
    <div className="catalog-body">
      <CatalogFilters category={search.category} onCategoryChange={(category) => onUpdate({ category })}
        facets={catalogData?.facets} search={search} onUpdate={onUpdate} featuredNft={featuredNft}/>
      <div className="catalog-results" aria-busy={isFetching}>
        <CatalogResults state={state} renderCard={renderCard}/>
        {catalogData && state.status === 'success' && <Pagination page={catalogData.page} pageSize={catalogData.pageSize} total={catalogData.total}
          disabled={isFetching} onPageChange={(page) => onUpdate({ page })}/>}
        {catalogData && <p className="sr-only" role="status">{catalogData.total} NFTs encontrados. Página {catalogData.page}.</p>}
      </div>
    </div>
  </section>
}
