import type { ReactNode } from 'react'
import { Button } from '@/components/atoms/button'
import { NftCard } from '@/features/catalog/molecules/NftCard'
import type { Nft } from '@/types/marketplace'

export function FavoritesTemplate({ hasFavorites, items, state, onRetry, onExplore, renderCard }: {
  hasFavorites: boolean
  items: Nft[]
  state: 'loading' | 'error' | 'ready'
  onRetry: () => void
  onExplore: () => void
  renderCard?: (nft: Nft, index: number) => ReactNode
}) {
  return <main id="main" className="page-wrap favorites-page">
    <header className="favorites-heading">
      <p className="eyebrow">Sua coleção pessoal</p>
      <h1>Favoritos</h1>
      <p>As obras que você guardou para encontrar depois.</p>
    </header>
    {!hasFavorites && <section className="state-panel favorites-empty">
      <h2>Sua lista está vazia</h2>
      <p>Explore o catálogo e toque no coração de uma obra para salvá-la aqui.</p>
      <Button className="button button-light" onClick={onExplore}>Explorar NFTs</Button>
    </section>}
    {hasFavorites && state === 'loading' && <section className="state-panel" aria-live="polite"><p>Carregando seus favoritos...</p></section>}
    {hasFavorites && state === 'error' && <section className="state-panel" role="alert">
      <h2>Não foi possível carregar seus favoritos</h2>
      <p>Confira sua conexão e tente novamente.</p>
      <Button className="button button-light" onClick={onRetry}>Tentar novamente</Button>
    </section>}
    {hasFavorites && state === 'ready' && items.length === 0 && <section className="state-panel favorites-empty">
      <h2>Essas obras não estão mais disponíveis</h2>
      <p>Os itens salvos não foram encontrados no catálogo atual.</p>
    </section>}
    {hasFavorites && state === 'ready' && items.length > 0 && <div className="nft-grid favorites-grid">
      {items.map((nft, index) => renderCard ? <div key={nft.id}>{renderCard(nft, index)}</div>
        : <NftCard key={nft.id} nft={nft} index={index}/>)}</div>}
  </main>
}
