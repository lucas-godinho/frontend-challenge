import { Search, SlidersHorizontal } from 'lucide-react'
import type { CatalogQuery } from '@/types/marketplace'
import { Select } from '@/components/ui/select'

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
  return <Select label="Ordenar NFTs" compact={mobile} icon={mobile ? <SlidersHorizontal size={19}/> : undefined}
    value={value ?? 'recent'} onChange={(next) => onChange(next as NonNullable<CatalogQuery['sort']>)}
    options={[{ value: 'recent', label: 'Listados recentemente' }, { value: 'price-asc', label: 'Menor preço' }, { value: 'price-desc', label: 'Maior preço' }]}/>
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
