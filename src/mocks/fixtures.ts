import type { Nft } from '@/types/marketplace'

export const catalogFixture: Nft[] = [
  { id: 'orbital-01', name: 'Orbital Bloom #01', collection: 'Soft Forms', creator: 'Mika Sato', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=85', priceEth: '0.84', available: 8, edition: 24, category: 'art', featured: true, version: 1 },
  { id: 'blue-hour-03', name: 'Blue Hour #03', collection: 'Afterglow', creator: 'Studio Lume', image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=900&q=85', priceEth: '1.20', available: 4, edition: 12, category: 'art', featured: true, version: 1 },
  { id: 'quiet-shape-11', name: 'Quiet Shape #11', collection: 'Soft Forms', creator: 'Mika Sato', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85', priceEth: '0.32', available: 17, edition: 40, category: 'collectible', featured: false, version: 1 },
  { id: 'night-garden-02', name: 'Night Garden #02', collection: 'Nocturne', creator: 'Ari Costa', image: 'https://images.unsplash.com/photo-1633534244710-1dd7b76a3780?auto=format&fit=crop&w=900&q=85', priceEth: '2.40', available: 2, edition: 5, category: 'virtual-world', featured: false, version: 1 },
  { id: 'signal-05', name: 'Signal / 05', collection: 'Frequency', creator: 'Noah Vale', image: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?auto=format&fit=crop&w=900&q=85', priceEth: '0.58', available: 10, edition: 20, category: 'music', featured: false, version: 1 },
  { id: 'still-life-09', name: 'Still Life #09', collection: 'Object Studies', creator: 'Ana Prado', image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?auto=format&fit=crop&w=900&q=85', priceEth: '0.95', available: 6, edition: 15, category: 'collectible', featured: false, version: 1 },
]
