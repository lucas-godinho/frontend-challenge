import type { CatalogFacets, CatalogQuery, Nft } from '@/types/marketplace'
import { FeaturedNft } from './FeaturedNft'
import { PriceRangeFilter } from '@/features/catalog/molecules/PriceRangeFilter'

export function CatalogFilters({ category, onCategoryChange, facets, search = {}, onUpdate, featuredNft }: {
  category?: string
  onCategoryChange: (category?: string) => void
  facets?: CatalogFacets
  search?: CatalogQuery
  onUpdate?: (query: Partial<CatalogQuery>) => void
  featuredNft?: Nft
}) {
  const networks = search.network?.split(',') ?? []
  return <aside className="catalog-sidebar" aria-label="Filtros e destaque do catálogo">
    <div className="catalog-filters">
      <h3>Coleções</h3>
      <div className="filter-list">
        {facets?.categories.map(({ value, label, count }) => <button key={value} type="button" aria-pressed={category === value}
          onClick={() => onCategoryChange(category === value ? undefined : value)}><span>{label}</span><span>({count})</span></button>)}
        {!facets && <p role="status">Carregando filtros…</p>}
      </div>
      {facets && <PriceRangeFilter key={`${search.minPrice}-${search.maxPrice}-${facets.price.min}-${facets.price.max}`}
        min={facets.price.min} max={facets.price.max} value={[search.minPrice ?? facets.price.min, search.maxPrice ?? facets.price.max]}
        onApply={([minPrice, maxPrice]) => onUpdate?.({ minPrice, maxPrice })}/>}
      <fieldset className="network-filter"><legend>Rede</legend>
        {facets?.networks.map(({ value, count }) => <label key={value}>
          <input type="checkbox" checked={networks.includes(value)} onChange={() => {
            const next = networks.includes(value) ? networks.filter((network) => network !== value) : [...networks, value]
            onUpdate?.({ network: next.join(',') || undefined })
          }}/><span>{value}</span><span>({count})</span>
        </label>)}
      </fieldset>
    </div>
    {featuredNft && <FeaturedNft nft={featuredNft}/>}
  </aside>
}
