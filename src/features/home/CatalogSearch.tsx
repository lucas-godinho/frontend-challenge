import { Search, SlidersHorizontal } from 'lucide-react'
import type { CatalogQuery } from '@/types/marketplace'

export function CatalogSearchForm({ draft, onDraftChange, onSubmit, placeholder }: {
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

export function CatalogSortSelect({ value, onChange, mobile = false }: {
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
    <CatalogSearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={() => onUpdate({ q: draft || undefined })} placeholder="Explorar coleções"/>
    <CatalogSortSelect mobile value={search.sort} onChange={(sort) => onUpdate({ sort })}/>
  </div>
}
