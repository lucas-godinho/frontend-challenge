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
  fields?: Record<string, string>
}

export interface CartItem {
  nft: Nft
  quantity: number
}

export interface CartResponse {
  items: CartItem[]
  subtotalEth: string
  itemCount: number
  discountEth?: string
  networkFeeEth?: string
  totalEth?: string
  coupon?: string
}

export interface OrderResponse {
  id: string
  version: number
  transactionId: string
  status: 'confirmed' | 'rejected' | 'pending'
  createdAt: string
  wallet: CollectorWallet
  items: CartItem[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  coupon?: string
}

export interface Collector {
  id: string
  name: string
  email: string
}

export interface CollectorProfile {
  displayName: string
  username: string
  email: string
  walletAlias: string
  ensName: string
  avatarUrl?: string
}

export interface CollectorWallet {
  id: string
  displayName: string
  alias: string
  network: 'Ethereum' | 'Polygon' | 'Solana'
  address: string
  ensName?: string
  type: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet'
  isPrimary: boolean
}

export interface WalletConnection {
  connected: true
  address: string
  network: CollectorWallet['network']
  type: CollectorWallet['type']
}

export interface SessionResponse {
  user: Collector
  sessionId: string
  expiresAt: string
}
