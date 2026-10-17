import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { SyntheticEvent } from 'react'
import type { Nft } from '@/types/marketplace'

function handleArtworkError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  image.src = '/images/artwork-fallback.svg'
}

export function NftCard({ nft, index = 0 }: { nft: Nft; index?: number }) {
  return <Link
    className={`nft-card nft-card-${index + 1}`}
    to="/nft/$nftId"
    params={{ nftId: nft.id }}
  >
    <NftCardContent nft={nft} index={index}/>
  </Link>
}

export function NftCardContent({ nft, index = 0 }: { nft: Nft; index?: number }) {
  return <>
    <div className="nft-image-wrap">
      <img
        src={nft.image}
        alt={`${nft.name}, arte digital de ${nft.creator}`}
        loading={index < 3 ? 'eager' : 'lazy'}
        onError={handleArtworkError}
      />
      {index === 2 && <span className="rare-tag">Raro</span>}
      <span className="heart-tag" aria-hidden="true"><Heart size={16}/></span>
    </div>
    <div className="nft-meta">
      <div>
        <p className="nft-collection">{nft.collection} <span>· {nft.creator}</span></p>
        <h3>{nft.name}</h3>
      </div>
      <div className="price"><span>Preço</span><strong>{nft.priceEth} ETH</strong></div>
    </div>
  </>
}
