import type { CatalogQuery, CatalogResponse } from '@/types/marketplace'
import { catalogFixture, mockCategories } from './fixtures'

export function queryCatalog(query: CatalogQuery): CatalogResponse {
  const q = query.q?.trim().toLocaleLowerCase() ?? ''
  const filtered = catalogFixture.filter((nft) =>
    (!q || `${nft.name} ${nft.collection} ${nft.creator}`.toLocaleLowerCase().includes(q)) &&
    (!query.category || nft.category === query.category) &&
    (!query.network || query.network.split(',').includes(nft.network)) &&
    (query.minPrice === undefined || Number(nft.priceEth) >= query.minPrice) &&
    (query.maxPrice === undefined || Number(nft.priceEth) <= query.maxPrice),
  )
  if (query.sort === 'price-asc') filtered.sort((a, b) => Number(a.priceEth) - Number(b.priceEth))
  if (query.sort === 'price-desc') filtered.sort((a, b) => Number(b.priceEth) - Number(a.priceEth))
  const pageSize = 9
  const requested = Number.isFinite(query.page) ? Math.floor(query.page!) : 1
  const page = Math.min(Math.max(1, requested), Math.max(1, Math.ceil(filtered.length / pageSize)))
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize), page, pageSize, total: filtered.length,
    // Counts represent the complete inventory, not only the current page.
    facets: {
      categories: mockCategories.map((category) => ({ ...category, count: catalogFixture.filter((nft) => nft.category === category.value).length })),
      networks: ['Ethereum', 'Polygon', 'Solana'].map((value) => ({ value, count: catalogFixture.filter((nft) => nft.network === value).length })),
      price: { min: Math.min(...catalogFixture.map((nft) => Number(nft.priceEth))), max: Math.max(...catalogFixture.map((nft) => Number(nft.priceEth))) },
    },
  }
}
