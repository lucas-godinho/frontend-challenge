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
  const categories: Array<[string, string, number]> = [
    ['art', 'Arte digital', 33], ['photo', 'Fotografia', 12], ['music', 'Música', 65], ['3d', 'Arte 3D', 39],
    ['collectible', 'Colecionáveis', 23], ['generative', 'Generativa', 17], ['games', 'Jogos', 19], ['membership', 'Assinaturas', 13], ['utility', 'Utilidade', 18],
  ]
  const networks: Array<[string, number]> = [['Ethereum', 119], ['Polygon', 78], ['Solana', 86]]

  return <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
    <div className="section-heading" id="curated">
      <div><p className="eyebrow">Curadoria da semana</p><h2 id="catalog-title">Descubra NFTs</h2></div>
      <button className="text-button" type="button" onClick={() => onUpdate({ category: undefined, sort: 'recent', q: undefined })}>Ver tudo <ArrowUpRight size={15}/></button>
    </div>
    <div className="catalog-tabs-row">
      <div className="catalog-tabs" role="group" aria-label="Filtrar NFTs">
        {tabs.map(([key, label]) => <button
          key={key}
          type="button"
          aria-pressed={activeTab === key}
          className={activeTab === key ? 'active' : ''}
          onClick={() => { setActiveTab(key); onUpdate({ sort: key === 'trending' ? 'price-desc' : 'recent' }) }}
        >{label}</button>)}
      </div>
      <div className="catalog-sort"><span>Ordenar por:</span><SortSelect value={search.sort} onChange={updateSort}/></div>
    </div>
    <div className="catalog-tools desktop-catalog-tools">
      <SearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={applySearch} placeholder="Buscar por obra, coleção ou artista"/>
      <SortSelect value={search.sort} onChange={updateSort}/>
    </div>
    <div className="catalog-body">
      <aside className="catalog-filters" aria-label="Filtros do catálogo">
        <h3>Coleções</h3>
        <div className="filter-list">
          {categories.map(([value, label, count]) => <button key={value} type="button" aria-pressed={search.category === value} onClick={() => onUpdate({ category: search.category === value ? undefined : value })}><span>{label}</span><span>({count})</span></button>)}
        </div>
        <fieldset className="price-filter"><legend>Faixa de preço</legend><input aria-label="Preço mínimo" type="range" min="0.02" max="12.3" step="0.01" defaultValue="0.02"/><input aria-label="Preço máximo" type="range" min="0.02" max="12.3" step="0.01" defaultValue="12.3"/><p>Preço: 0,02 – 12,30 ETH</p><Button type="button" className="button button-light">Aplicar</Button></fieldset>
        <fieldset className="network-filter"><legend>Rede</legend>{networks.map(([name, count]) => <label key={name}><input type="checkbox"/><span>{name}</span><span>({count})</span></label>)}</fieldset>
      </aside>
      <div className="catalog-results">
        {catalog.isPending ? <div className="nft-grid" aria-label="Carregando catálogo">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="nft-skeleton" aria-hidden="true"><div className="shimmer"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}
        </div> : catalog.isError ? <div className="state-panel" role="alert">
      <h3>Não foi possível carregar as obras</h3><p>Confira sua conexão e tente novamente.</p>
      <Button className="button button-light" onClick={() => void catalog.refetch()}>Tentar novamente</Button>
    </div> : catalog.data.items.length === 0 ? <div className="state-panel">
      <h3>Nenhuma obra por aqui</h3><p>Tente outro termo de busca.</p>
    </div> : <div className="nft-grid">{catalog.data.items.map((nft, index) => <NftCard key={nft.id} nft={nft} index={index}/>)}</div>}
      </div>
    </div>
  </section>
}
