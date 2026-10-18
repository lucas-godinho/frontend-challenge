import { Link, useNavigate } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import type { SyntheticEvent } from 'react'
import type { Nft } from '@/types/marketplace'
import { useFavorites } from '@/features/favorites/use-favorites'
import { useSharedFavorites } from '@/features/favorites/favorites-context'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/molecules/card'

function handleArtworkError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  image.src = '/images/artwork-fallback.svg'
}

const cardClassName = 'group relative overflow-hidden rounded-md border-0 bg-card p-2 transition-colors hover:bg-secondary/90'

export function NftCard({ nft, index = 0 }: { nft: Nft; index?: number }) {
  return <Card asChild className={cardClassName}>
    <article>
      <Link className="block min-w-0 text-inherit no-underline" to="/nft/$nftId" params={{ nftId: nft.id }}>
        <NftCardContent nft={nft} index={index}/>
      </Link>
      <FavoriteButton nft={nft}/>
    </article>
  </Card>
}

export function FavoriteButton({ nft }: { nft: Nft }) {
  const shared = useSharedFavorites()
  return shared ? <FavoriteButtonContent nft={nft} isAuthenticated={shared.isAuthenticated}
    favorite={shared.favoriteIds.has(nft.id)} onToggle={shared.toggleFavorite}/>
    : <StandaloneFavoriteButton nft={nft}/>
}

function StandaloneFavoriteButton({ nft }: { nft: Nft }) {
  const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites()
  return <FavoriteButtonContent nft={nft} isAuthenticated={isAuthenticated}
    favorite={isFavorite(nft.id)} onToggle={toggleFavorite}/>
}

function FavoriteButtonContent({ nft, isAuthenticated, favorite, onToggle }: {
  nft: Nft
  isAuthenticated: boolean
  favorite: boolean
  onToggle: (id: string) => void
}) {
  const navigate = useNavigate()

  return <Button
    variant="ghost"
    size="icon"
    className="absolute right-3 top-3 z-10 size-10 rounded-full border border-border bg-background/90 text-primary shadow-sm backdrop-blur hover:bg-primary hover:text-primary-foreground"
    type="button"
    aria-label={favorite ? `Remover ${nft.name} dos favoritos` : isAuthenticated ? `Adicionar ${nft.name} aos favoritos` : `Entre para favoritar ${nft.name}`}
    aria-pressed={favorite}
    title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    onClick={() => isAuthenticated
      ? onToggle(nft.id)
      : void navigate({ to: '/login', search: { returnTo: window.location.pathname + window.location.search } })}
  ><Heart size={18} fill={favorite ? 'currentColor' : 'none'}/></Button>
}

export function NftCardContent({ nft, index = 0 }: { nft: Nft; index?: number }) {
  return <>
    <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
      <img
        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        src={nft.image}
        alt={`${nft.name}, arte digital de ${nft.creator}`}
        loading={index < 4 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
        onError={handleArtworkError}
      />
      {index === 2 && <Badge className="absolute left-0 top-0 rounded-none border-0 bg-primary text-primary-foreground uppercase">Raro</Badge>}
    </div>
    <div className="grid gap-3 px-2 pb-2 pt-4 min-[761px]:grid-cols-[minmax(0,1fr)_auto] min-[761px]:items-end">
      <div className="min-w-0">
        <p className="mb-1 truncate text-xs text-muted-foreground">{nft.collection} <span>· {nft.creator}</span></p>
        <h3 className="m-0 line-clamp-2 text-sm font-semibold leading-snug text-foreground min-[761px]:text-base">{nft.name}</h3>
      </div>
      <div className="grid justify-items-start gap-0.5 min-[761px]:justify-items-end">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Preço</span>
        <strong className="text-sm font-bold text-accent min-[761px]:text-base">{nft.priceEth} ETH</strong>
      </div>
    </div>
  </>
}
