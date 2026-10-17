import { Button } from '@/components/ui/button'
import { NftCard } from '@/features/catalog/NftCard'
import type { ReactNode } from 'react'
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
  if (state.status === 'loading') return <div className="nft-grid" aria-label="Carregando catálogo">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="nft-skeleton" aria-hidden="true"><div className="shimmer"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}
  </div>

  if (state.status === 'error') return <div className="state-panel" role="alert">
    <h3>Não foi possível carregar as obras</h3><p>Confira sua conexão e tente novamente.</p>
    <Button className="button button-light" onClick={state.onRetry}>Tentar novamente</Button>
  </div>

  if (state.status === 'empty') return <div className="state-panel">
    <h3>Nenhuma obra por aqui</h3><p>Tente outro termo de busca.</p>
  </div>

  return <div className="nft-grid">{state.items.map((nft, index) => renderCard
    ? <div key={nft.id}>{renderCard(nft, index)}</div>
    : <NftCard key={nft.id} nft={nft} index={index}/>)}</div>
}
