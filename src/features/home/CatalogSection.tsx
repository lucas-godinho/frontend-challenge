import { useState } from 'react'
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCatalog } from '@/features/catalog/use-catalog'
import { NftCard } from '@/features/catalog/NftCard'
import type { CatalogQuery } from '@/types/marketplace'

type CatalogResult = ReturnType<typeof useCatalog>
type CatalogTab = 'all' | 'new' | 'trending'

function SearchForm({
  draft,
  onDraftChange,
  onSubmit,
  placeholder,
}: {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
}) {
  return <form className="search-box" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
    <Search size={18}/>
    <input aria-label="Buscar NFTs" placeholder={placeholder} value={draft} onChange={(event) => onDraftChange(event.target.value)}/>
    {placeholder.startsWith('Buscar') && <button type="submit" aria-label="Buscar">↵</button>}
  </form>
}

function SortSelect({ value, onChange, mobile = false }: {
  value: CatalogQuery['sort']
  onChange: (value: NonNullable<CatalogQuery['sort']>) => void
  mobile?: boolean
}) {
  return <label className={mobile ? 'mobile-filter' : 'filter-select'}>
    <SlidersHorizontal size={mobile ? 19 : 16}/>
    <span className="sr-only">Ordenar NFTs</span>
    <select aria-label="Ordenar NFTs" value={value ?? 'recent'} onChange={(event) => onChange(event.target.value as NonNullable<CatalogQuery['sort']>)}>
      <option value="recent">Mais recentes</option>
      <option value="price-asc">Menor preço</option>
      <option value="price-desc">Maior preço</option>
    </select>
  </label>
}

export function MobileSearchRow({ search, draft, onDraftChange, onUpdate }: {
  search: CatalogQuery
  draft: string
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
}) {
  return <div className="mobile-search-row">
    <SearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={() => onUpdate({ q: draft || undefined })} placeholder="Explorar coleções"/>
    <SortSelect mobile value={search.sort} onChange={(sort) => onUpdate({ sort })}/>
  </div>
}

export function CatalogSection({
  search,
  draft,
  onDraftChange,
  onUpdate,
  catalog,
}: {
  search: CatalogQuery
  draft: string
  onDraftChange: (value: string) => void
  onUpdate: (query: Partial<CatalogQuery>) => void
  catalog: CatalogResult
}) {
  const [activeTab, setActiveTab] = useState<CatalogTab>('all')
  const applySearch = () => onUpdate({ q: draft || undefined })
  const updateSort = (sort: NonNullable<CatalogQuery['sort']>) => onUpdate({ sort })
  const tabs: Array<[CatalogTab, string]> = [['all', 'Todos os NFTs'], ['new', 'Novos lançamentos'], ['trending', 'Em alta']]

  return <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
    <div className="section-heading" id="curated">
      <div><p className="eyebrow">Curadoria da semana</p><h2 id="catalog-title">Descubra NFTs</h2></div>
      <button className="text-button" type="button" onClick={() => onUpdate({ category: undefined, sort: 'recent', q: undefined })}>Ver tudo <ArrowUpRight size={15}/></button>
    </div>
    <div className="catalog-tabs" role="group" aria-label="Filtrar NFTs">
      {tabs.map(([key, label]) => <button
        key={key}
        type="button"
        aria-pressed={activeTab === key}
        className={activeTab === key ? 'active' : ''}
        onClick={() => { setActiveTab(key); onUpdate({ sort: key === 'trending' ? 'price-desc' : 'recent' }) }}
      >{label}</button>)}
    </div>
    <div className="catalog-tools desktop-catalog-tools">
      <SearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={applySearch} placeholder="Buscar por obra, coleção ou artista"/>
      <SortSelect value={search.sort} onChange={updateSort}/>
    </div>
    {catalog.isPending ? <div className="nft-grid" aria-label="Carregando catálogo">
      {Array.from({ length: 8 }, (_, index) => <div key={index} className="nft-skeleton" aria-hidden="true"><div className="shimmer"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}
    </div> : catalog.isError ? <div className="state-panel" role="alert">
      <h3>Não foi possível carregar as obras</h3><p>Confira sua conexão e tente novamente.</p>
      <Button className="button button-light" onClick={() => void catalog.refetch()}>Tentar novamente</Button>
    </div> : catalog.data.items.length === 0 ? <div className="state-panel">
      <h3>Nenhuma obra por aqui</h3><p>Tente outro termo de busca.</p>
    </div> : <div className="nft-grid">{catalog.data.items.map((nft, index) => <NftCard key={nft.id} nft={nft} index={index}/>)}</div>}
  </section>
}
