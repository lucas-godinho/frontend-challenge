export interface Nft {
  id: string
  name: string
  collection: string
  creator: string
  image: string
  priceEth: string
  available: number
  edition: number
  category: 'art' | 'collectible' | 'music' | 'virtual-world'
  featured: boolean
  version: number
}

export interface CatalogResponse {
  items: Nft[]
  page: number
  pageSize: number
  total: number
}

export interface CatalogQuery {
  q?: string
  category?: string
  sort?: 'recent' | 'price-asc' | 'price-desc'
  page?: number
}

export interface ApiError {
  code: string
  message: string
}
