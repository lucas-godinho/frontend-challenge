import { Card, CardTitle } from '@/components/molecules/card'
import { Checkbox } from '@/components/atoms/checkbox'
import { PriceRangeFilter } from '@/features/catalog/molecules/PriceRangeFilter'
import { FeaturedNft } from './FeaturedNft'
import type { CatalogFacets, CatalogQuery, Nft } from '@/types/marketplace'

export function CatalogFilters({ category, onCategoryChange, facets, search = {}, onUpdate, featuredNft }: {
  category?: string
  onCategoryChange: (category?: string) => void
  facets?: CatalogFacets
  search?: CatalogQuery
  onUpdate?: (query: Partial<CatalogQuery>) => void
  featuredNft?: Nft
}) {
  const networks = search.network?.split(',') ?? []
  return <aside className="hidden min-w-0 content-start gap-5 min-[1051px]:grid" aria-label="Filtros e destaque do catálogo">
    <Card className="rounded-none p-5 xl:p-6">
      <CardTitle className="mb-4 text-base">Coleções</CardTitle>
      <div className="grid gap-1">
        {facets?.categories.map(({ value, label, count }) => <button className="flex min-h-10 items-center justify-between gap-3 border-0 bg-transparent px-1 text-left text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:font-semibold aria-pressed:text-accent" key={value} type="button" aria-pressed={category === value}
          onClick={() => onCategoryChange(category === value ? undefined : value)}><span>{label}</span><span>({count})</span></button>)}
        {!facets && <p className="m-0 py-3 text-sm text-muted-foreground" role="status">Carregando filtros…</p>}
      </div>

      {facets && <PriceRangeFilter key={`${search.minPrice}-${search.maxPrice}-${facets.price.min}-${facets.price.max}`}
        min={facets.price.min} max={facets.price.max} value={[search.minPrice ?? facets.price.min, search.maxPrice ?? facets.price.max]}
        onApply={([minPrice, maxPrice]) => onUpdate?.({ minPrice, maxPrice })}/>}

      <fieldset className="mt-7 grid gap-3 border-0 p-0">
        <legend className="mb-3 p-0 text-base font-semibold">Rede</legend>
        {facets?.networks.map(({ value, count }) => <label className="grid min-h-8 grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 text-sm text-muted-foreground" key={value}>
          <Checkbox checked={networks.includes(value)} onCheckedChange={() => {
            const next = networks.includes(value) ? networks.filter((network) => network !== value) : [...networks, value]
            onUpdate?.({ network: next.join(',') || undefined })
          }}/><span>{value}</span><span>({count})</span>
        </label>)}
      </fieldset>
    </Card>
    {featuredNft && <FeaturedNft nft={featuredNft}/>}
  </aside>
}
