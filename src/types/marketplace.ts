export interface Nft {
  id: string
  name: string
  collection: string
  creator: string
  image: string
  priceEth: string
  available: number
  edition: number
  category: 'art' | 'photo' | 'music' | '3d' | 'collectible' | 'generative' | 'games' | 'membership' | 'utility'
  network: 'Ethereum' | 'Polygon' | 'Solana'
  featured: boolean
  version: number
}

export interface CatalogResponse {
  items: Nft[]
  page: number
  pageSize: number
  total: number
  facets: CatalogFacets
}

export interface CatalogFacets {
  categories: Array<{ value: string; label: string; count: number }>
  networks: Array<{ value: string; count: number }>
  price: { min: number; max: number }
}

export interface CatalogQuery {
  q?: string
  category?: string
  sort?: 'recent' | 'price-asc' | 'price-desc'
  page?: number
  minPrice?: number
  maxPrice?: number
  network?: string
}

export interface ApiError {
  code: string
  message: string
}
