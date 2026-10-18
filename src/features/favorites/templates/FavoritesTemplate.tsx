import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card, CardDescription, CardTitle } from '@/components/molecules/card'
import { PageContainer } from '@/components/organisms/PageContainer'
import { NftCard } from '@/features/catalog/molecules/NftCard'
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider'
import type { Nft } from '@/types/marketplace'

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card className="mx-auto grid min-h-48 max-w-[560px] content-center justify-items-center gap-3 rounded-none p-7 text-center sm:p-9">
    <CardTitle className="text-lg">{title}</CardTitle>
    <CardDescription className="max-w-lg text-sm leading-relaxed">{description}</CardDescription>
    {action}
  </Card>
}

export function FavoritesTemplate({ hasFavorites, items, state, onRetry, onExplore, renderCard }: {
  hasFavorites: boolean
  items: Nft[]
  state: 'loading' | 'error' | 'ready'
  onRetry: () => void
  onExplore: () => void
  renderCard?: (nft: Nft, index: number) => ReactNode
}) {
  return <PageContainer id="main" className="min-h-[55vh] pb-24 pt-12 sm:pt-20">
    <header className="mb-8 max-w-3xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[.14em] text-primary">Sua coleção pessoal</p>
      <h1 className="mb-3 mt-0 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Favoritos</h1>
      <p className="m-0 text-base leading-relaxed text-muted-foreground sm:text-lg">As obras que você guardou para encontrar depois.</p>
    </header>

    {!hasFavorites && <EmptyState
      title="Sua lista está vazia"
      description="Explore o catálogo e toque no coração de uma obra para salvá-la aqui."
      action={<Button className="mt-3" onClick={onExplore}>Explorar NFTs</Button>}
    />}

    {hasFavorites && state === 'loading' && <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-label="Carregando favoritos" aria-busy="true">
      {Array.from({ length: 4 }, (_, index) => <Card className="grid gap-3 rounded-md border-0 bg-card p-2" key={index}>
        <Skeleton className="aspect-square rounded-sm"/><div className="grid gap-2 px-2 pb-2"><Skeleton className="h-3 w-2/3"/><Skeleton className="h-4 w-4/5"/><Skeleton className="h-4 w-1/3"/></div>
      </Card>)}
    </section>}

    {hasFavorites && state === 'error' && <EmptyState
      title="Não foi possível carregar seus favoritos"
      description="Confira sua conexão e tente novamente."
      action={<Button className="mt-3" onClick={onRetry}>Tentar novamente</Button>}
    />}

    {hasFavorites && state === 'ready' && items.length === 0 && <EmptyState
      title="Essas obras não estão mais disponíveis"
      description="Os itens salvos não foram encontrados no catálogo atual."
    />}

    {hasFavorites && state === 'ready' && items.length > 0 && (renderCard
      ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{items.map((nft, index) => <div key={nft.id}>{renderCard(nft, index)}</div>)}</div>
      : <FavoritesProvider><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{items.map((nft, index) => <NftCard key={nft.id} nft={nft} index={index}/>)}</div></FavoritesProvider>)}
  </PageContainer>
}
