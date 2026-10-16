import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Nft } from '@/types/marketplace'

const sample: Nft = { id: 'orbital-01', name: 'Orbital Bloom #01', collection: 'Soft Forms', creator: 'Mika Sato', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=85', priceEth: '0.84', available: 8, edition: 24, category: 'art', featured: true, version: 1 }

function NftCardPreview({ nft }: { nft: Nft }) {
  return <article style={{ width: 300, background: '#f7f6f1', color: '#20201d', fontFamily: 'sans-serif' }}><img src={nft.image} alt={`${nft.name}, arte digital de ${nft.creator}`} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}/><div style={{ display: 'flex', justifyContent: 'space-between', padding: 12 }}><div><small>{nft.collection} · {nft.creator}</small><h3>{nft.name}</h3></div><strong>{nft.priceEth} ETH</strong></div></article>
}

const meta = { title: 'Marketplace/NFT card', component: NftCardPreview, args: { nft: sample } } satisfies Meta<typeof NftCardPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
