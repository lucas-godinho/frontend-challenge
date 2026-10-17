import type { Nft } from '@/types/marketplace'

export function FeaturedNft({ nft }: { nft: Nft }) {
  return <section className="featured-nft" aria-label="NFT em destaque">
    <h3>NFT em destaque</h3><p className="featured-nft-offer">Oferta limitada</p>
    <img src={nft.image} alt={`${nft.name}, por ${nft.creator}`} loading="lazy" onError={(event) => {
      if (!event.currentTarget.src.endsWith('/images/artwork-fallback.svg')) event.currentTarget.src = '/images/artwork-fallback.svg'
    }}/>
    <div><h4>{nft.name}</h4><p>{nft.priceEth} ETH</p></div>
  </section>
}
