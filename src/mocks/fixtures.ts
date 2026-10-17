import type { Nft } from '@/types/marketplace'

const seed: Omit<Nft, 'network'>[] = [
  { id: 'orbital-01', name: 'Orbital Bloom #01', collection: 'Soft Forms', creator: 'Mika Sato', image: '/images/nft-1.png', priceEth: '0.84', available: 8, edition: 24, category: 'art', featured: true, version: 1 },
  { id: 'blue-hour-03', name: 'Blue Hour #03', collection: 'Afterglow', creator: 'Studio Lume', image: '/images/nft-2.png', priceEth: '1.20', available: 4, edition: 12, category: 'art', featured: true, version: 1 },
  { id: 'quiet-shape-11', name: 'Quiet Shape #11', collection: 'Soft Forms', creator: 'Mika Sato', image: '/images/nft-3.png', priceEth: '0.32', available: 17, edition: 40, category: 'collectible', featured: false, version: 1 },
  { id: 'night-garden-02', name: 'Night Garden #02', collection: 'Nocturne', creator: 'Ari Costa', image: '/images/nft-4.png', priceEth: '2.40', available: 2, edition: 5, category: 'games', featured: false, version: 1 },
  { id: 'signal-05', name: 'Signal / 05', collection: 'Frequency', creator: 'Noah Vale', image: '/images/nft-1.png', priceEth: '0.58', available: 10, edition: 20, category: 'music', featured: false, version: 1 },
  { id: 'still-life-09', name: 'Still Life #09', collection: 'Object Studies', creator: 'Ana Prado', image: '/images/nft-4.png', priceEth: '0.95', available: 6, edition: 15, category: 'collectible', featured: false, version: 1 },
]

export const mockCategories: Array<{ value: Nft['category']; label: string }> = [
  { value: 'art', label: 'Arte digital' }, { value: 'photo', label: 'Fotografia' },
  { value: 'music', label: 'Música' }, { value: '3d', label: 'Arte 3D' },
  { value: 'collectible', label: 'Colecionáveis' }, { value: 'generative', label: 'Generativa' },
  { value: 'games', label: 'Jogos' }, { value: 'membership', label: 'Assinaturas' }, { value: 'utility', label: 'Utilidade' },
]
const networks: Nft['network'][] = ['Ethereum', 'Polygon', 'Solana']

// Deterministic inventory: stable IDs, varied categories/networks and six pages.
export const catalogFixture: Nft[] = [
  ...seed.map((nft, index) => ({ ...nft, network: networks[index % 3]! })),
  ...Array.from({ length: 48 }, (_, index): Nft => ({
    ...seed[index % seed.length]!,
    id: `edition-${index + 7}`,
    name: `${seed[index % seed.length]!.name.split(' #')[0]} #${String(index + 7).padStart(3, '0')}`,
    category: mockCategories[index % mockCategories.length]!.value,
    network: networks[(index + Math.floor(index / 9)) % networks.length]!,
    priceEth: (0.02 + (index * 37 % 1229) / 100).toFixed(2),
    featured: false,
  })),
]
