import { Search, SlidersHorizontal } from 'lucide-react'
import type { CatalogQuery } from '@/types/marketplace'
import { Select } from '@/components/molecules/select'
import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'

export function CatalogSearchForm({ draft, onDraftChange, onSubmit, placeholder }: {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
}) {
  return <form className="flex min-h-11 min-w-0 items-center gap-3 border border-border bg-card px-3 focus-within:border-primary" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
    <Search className="shrink-0 text-muted-foreground" size={18}/>
    <Input aria-label="Buscar NFTs" placeholder={placeholder} value={draft}
      className="h-10 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0"
      onChange={(event) => onDraftChange(event.target.value)}/>
    {placeholder.startsWith('Buscar') && <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground" type="submit" aria-label="Buscar">↵</Button>}
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
  return <div className="mb-8 flex items-center gap-3 min-[761px]:hidden">
    <CatalogSearchForm draft={draft} onDraftChange={onDraftChange} onSubmit={() => onUpdate({ q: draft || undefined })} placeholder="Explorar coleções"/>
    <CatalogSortSelect mobile value={search.sort} onChange={(sort) => onUpdate({ sort })}/>
  </div>
}
