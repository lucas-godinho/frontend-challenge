import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CatalogFilters } from './CatalogFilters'
import { CatalogResults, type CatalogViewState } from './CatalogResults'
import { CatalogSearchForm, CatalogSortSelect } from './CatalogSearch'
import { CatalogTabs, type CatalogTab } from './CatalogTabs'
import type { CatalogQuery } from '@/types/marketplace'

export function CatalogSection({
  search,
  draft,
  onDraftChange,
  onUpdate,
  state,
  renderCard,
}: {
  search: CatalogQuery
  draft: string
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
  state: CatalogViewState
  renderCard?: Parameters<typeof CatalogResults>[0]['renderCard']
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
      <button className="text-button" type="button" onClick={() => onUpdate({ category: undefined, sort: 'recent', q: undefined })}>Ver tudo <ArrowUpRight size={15}/></button>
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
      <CatalogFilters category={search.category} onCategoryChange={(category) => onUpdate({ category })}/>
      <div className="catalog-results"><CatalogResults state={state} renderCard={renderCard}/></div>
    </div>
  </section>
}
