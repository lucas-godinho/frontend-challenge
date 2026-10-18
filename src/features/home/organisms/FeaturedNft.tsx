import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Card, CardTitle } from '@/components/molecules/card'
import type { Nft } from '@/types/marketplace'

export function FeaturedNft({ nft }: { nft: Nft }) {
  return <Card className="mt-5 grid gap-4 rounded-md border-border bg-gradient-to-b from-primary/10 to-card p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3">
      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-primary">NFT em destaque</CardTitle>
      <Badge variant="secondary" className="rounded-sm uppercase tracking-wide">Oferta limitada</Badge>
    </div>
    <Link className="block overflow-hidden rounded-sm bg-secondary" to="/nft/$nftId" params={{ nftId: nft.id}}>
      <img className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03] motion-reduce:transition-none" src={nft.image} alt={`${nft.name}, por ${nft.creator}`} loading="lazy" onError={(event) => {
        if (!event.currentTarget.src.endsWith('/images/artwork-fallback.svg')) event.currentTarget.src = '/images/artwork-fallback.svg'
      }}/>
    </Link>
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0"><h3 className="m-0 truncate text-sm font-semibold">{nft.name}</h3><p className="mb-0 mt-1 text-sm font-bold text-accent">{nft.priceEth} ETH</p></div>
      <Button variant="ghost" size="icon" className="size-9 shrink-0 text-primary" asChild><Link to="/nft/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}><ArrowUpRight size={17}/></Link></Button>
    </div>
  </Card>
}
