import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Nft } from '@/types/marketplace'
import { FavoriteButton, NftCardContent } from './NftCard'

const sample: Nft = { id: 'orbital-01', name: 'Orbital Bloom #01', collection: 'Soft Forms', creator: 'Mika Sato', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=85', priceEth: '0.84', available: 8, edition: 24, category: 'art', network: 'Ethereum', featured: true, version: 1 }

function NftCardPreview({ nft }: { nft: Nft }) {
  return <article className="nft-card w-[300px]"><NftCardContent nft={nft} index={2}/><FavoriteButton nft={nft}/></article>
}

const meta = { title: 'Marketplace/NFT card', component: NftCardPreview, args: { nft: sample } } satisfies Meta<typeof NftCardPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
