import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { getCatalog } from '@/features/catalog/catalog-api'
import { NftCard } from '@/features/catalog/NftCard'
import { useFavoriteIds } from './use-favorites'
import type { Nft } from '@/types/marketplace'

async function getAllNfts(signal: AbortSignal) {
  const firstPage = await getCatalog({ sort: 'recent', page: 1 }, signal)
  const remainingPages = await Promise.all(Array.from(
    { length: Math.max(0, Math.ceil(firstPage.total / firstPage.pageSize) - 1) },
    (_, index) => getCatalog({ sort: 'recent', page: index + 2 }, signal),
  ))
  return [firstPage, ...remainingPages].flatMap((page) => page.items)
}

export function FavoritesPage() {
  const favoriteIds = useFavoriteIds()
  const catalog = useQuery<Nft[]>({
    queryKey: ['catalog', 'favorites-inventory'],
    queryFn: ({ signal }) => getAllNfts(signal),
    enabled: favoriteIds.length > 0,
    staleTime: 60_000,
  })
  const favoriteSet = new Set(favoriteIds)
  const items = (catalog.data ?? []).filter((nft) => favoriteSet.has(nft.id))

  return <main id="main" className="page-wrap favorites-page">
    <header className="favorites-heading">
      <p className="eyebrow">Sua coleção pessoal</p>
      <h1>Favoritos</h1>
      <p>As obras que você guardou para encontrar depois.</p>
    </header>
    {favoriteIds.length === 0 && <section className="state-panel favorites-empty">
      <h2>Sua lista está vazia</h2>
      <p>Explore o catálogo e toque no coração de uma obra para salvá-la aqui.</p>
      <Link className="button button-light" to="/" hash="catalog" resetScroll={false}>Explorar NFTs</Link>
    </section>}
    {favoriteIds.length > 0 && catalog.isPending && <section className="state-panel" aria-live="polite"><p>Carregando seus favoritos...</p></section>}
    {favoriteIds.length > 0 && catalog.isError && <section className="state-panel" role="alert">
      <h2>Não foi possível carregar seus favoritos</h2>
      <p>Confira sua conexão e tente novamente.</p>
      <Button className="button button-light" onClick={() => void catalog.refetch()}>Tentar novamente</Button>
    </section>}
    {favoriteIds.length > 0 && catalog.isSuccess && items.length === 0 && <section className="state-panel favorites-empty">
      <h2>Essas obras não estão mais disponíveis</h2>
      <p>Os itens salvos não foram encontrados no catálogo atual.</p>
    </section>}
    {items.length > 0 && <div className="nft-grid favorites-grid">{items.map((nft, index) => <NftCard key={nft.id} nft={nft} index={index}/>)}</div>}
  </main>
}
