import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card, CardDescription, CardTitle } from '@/components/molecules/card'
import { NftCard } from '@/features/catalog/molecules/NftCard'
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider'
import type { Nft } from '@/types/marketplace'

export type CatalogViewState =
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void }
  | { status: 'empty' }
  | { status: 'success'; items: Nft[] }

export function CatalogResults({ state, renderCard }: {
  state: CatalogViewState
  renderCard?: (nft: Nft, index: number) => ReactNode
}) {
  if (state.status === 'loading') return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-label="Carregando catálogo" aria-busy="true" role="status">
    {['/images/nft-1.jpg', '/images/nft-2.jpg', '/images/nft-3.jpg', '/images/nft-4.jpg'].map((image, index) => <Card className="grid gap-3 overflow-hidden rounded-md border-0 bg-card p-2" key={image}>
      <div className="aspect-square overflow-hidden rounded-sm bg-muted">
        <img className="size-full object-cover" src={image} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"/>
      </div>
      <div className="grid gap-2 px-2 pb-2"><Skeleton className="h-3 w-2/3"/><Skeleton className="h-4 w-4/5"/><Skeleton className="h-4 w-1/3"/></div>
    </Card>)}
    <span className="sr-only">Carregando obras da coleção.</span>
  </div>

  if (state.status === 'error') return <Card className="grid min-h-48 content-center justify-items-center gap-3 rounded-none p-8 text-center" role="alert">
    <CardTitle className="text-lg">Não foi possível carregar as obras</CardTitle><CardDescription>Confira sua conexão e tente novamente.</CardDescription>
    <Button className="mt-2" onClick={state.onRetry}>Tentar novamente</Button>
  </Card>

  if (state.status === 'empty') return <Card className="grid min-h-48 content-center justify-items-center gap-3 rounded-none p-8 text-center">
    <CardTitle className="text-lg">Nenhuma obra por aqui</CardTitle><CardDescription>Tente outro termo de busca.</CardDescription>
  </Card>

  if (renderCard) return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{state.items.map((nft, index) => <div key={nft.id}>{renderCard(nft, index)}</div>)}</div>
  return <FavoritesProvider><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{state.items.map((nft, index) => <NftCard key={nft.id} nft={nft} index={index}/>)}</div></FavoritesProvider>
}
