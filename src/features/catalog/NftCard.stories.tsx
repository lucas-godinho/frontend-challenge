import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Nft } from '@/types/marketplace'

const sample: Nft = { id: 'orbital-01', name: 'Orbital Bloom #01', collection: 'Soft Forms', creator: 'Mika Sato', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=85', priceEth: '0.84', available: 8, edition: 24, category: 'art', featured: true, version: 1 }

function NftCardPreview({ nft }: { nft: Nft }) {
  return <article className="w-[300px] overflow-hidden border border-border bg-card text-card-foreground"><img src={nft.image} alt={`${nft.name}, arte digital de ${nft.creator}`} className="aspect-square w-full object-cover"/><div className="flex justify-between gap-3 p-3"><div><small className="text-xs text-muted-foreground">{nft.collection} · {nft.creator}</small><h3 className="mt-1 text-sm font-bold uppercase">{nft.name}</h3></div><strong className="whitespace-nowrap text-xs text-accent">{nft.priceEth} ETH</strong></div></article>
}

const meta = { title: 'Marketplace/NFT card', component: NftCardPreview, args: { nft: sample } } satisfies Meta<typeof NftCardPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
