import { createRootRoute, createRoute, createRouter, Outlet, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ShoppingBag, UserRound, ArrowUpRight, SlidersHorizontal, Heart } from 'lucide-react'
import { useCatalog } from '@/features/catalog/use-catalog'
import type { CatalogQuery } from '@/types/marketplace'

function AppShell() {
  return <><a className="skip-link" href="#main">Pular para o conteúdo</a><header className="topbar"><Link to="/" className="wordmark">forma<span>®</span></Link><nav aria-label="Principal" className="main-nav"><Link to="/">Descobrir</Link><a href="#curated">Coleções</a><a href="#artists">Artistas</a></nav><div className="top-actions"><Link to="/login" aria-label="Minha conta"><UserRound size={19}/></Link><Link to="/cart" aria-label="Carrinho"><ShoppingBag size={19}/></Link><button className="avatar-button" aria-label="Menu do perfil">L</button></div></header><Outlet/><footer><span className="wordmark">forma<span>®</span></span><p>Arte digital, feita para ficar.</p><span>© 2026 Forma Marketplace</span></footer></>
}

function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const catalog = useCatalog(search)
  const update = (next: Partial<CatalogQuery>) => void navigate({ search: (current: CatalogQuery) => ({ ...current, ...next, page: 1 }), replace: false })
  return <main id="main" className="page-wrap">
    <section className="hero"><div className="hero-copy"><p className="eyebrow">A nova cena da arte digital</p><h1>Peças únicas.<br/><em>Novas perspectivas.</em></h1><p className="hero-description">Descubra trabalhos de artistas independentes e encontre algo que fale com você.</p><a className="button button-light" href="#catalog">Explorar coleção <ArrowUpRight size={16}/></a></div><div className="hero-art" role="img" aria-label="Composição abstrata em tons de azul, coral e creme"><div className="art-circle"/><div className="art-slab"/><span className="art-index">01 — 04</span><span className="art-label">Forma / Studies<br/>2026</span></div></section>
    <section className="catalog-section" id="catalog"><div className="section-heading"><div><p className="eyebrow">Curadoria da semana</p><h2>Descubra NFTs</h2></div><button className="text-button" onClick={() => update({ category: undefined, sort: 'recent', q: undefined })}>Ver tudo <ArrowUpRight size={15}/></button></div>
      <div className="catalog-tools"><form className="search-box" onSubmit={(event) => { event.preventDefault(); update({ q: draft || undefined }) }}><Search size={18}/><input aria-label="Buscar NFTs" placeholder="Buscar por obra, coleção ou artista" value={draft} onChange={(e) => setDraft(e.target.value)}/><button aria-label="Buscar">↵</button></form><label className="filter-select"><SlidersHorizontal size={16}/><span className="sr-only">Ordenar NFTs</span><select value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogQuery['sort'] })}><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label></div>
      {catalog.isPending ? <div className="nft-grid" aria-label="Carregando catálogo">{Array.from({length: 6}, (_, i) => <div key={i} className="nft-skeleton"><div className="shimmer"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div> : catalog.isError ? <div className="state-panel" role="alert"><h3>Não foi possível carregar as obras</h3><p>Confira sua conexão e tente novamente.</p><button className="button button-dark" onClick={() => void catalog.refetch()}>Tentar novamente</button></div> : catalog.data.items.length === 0 ? <div className="state-panel"><h3>Nenhuma obra por aqui</h3><p>Tente outro termo de busca.</p></div> : <div className="nft-grid">{catalog.data.items.map((nft, index) => <Link className="nft-card" key={nft.id} to="/nft/$nftId" params={{nftId:nft.id}}><div className="nft-image-wrap"><img src={nft.image} alt={`${nft.name}, arte digital de ${nft.creator}`} loading={index < 3 ? 'eager' : 'lazy'}/><span className="edition-tag">Edição {String(nft.edition).padStart(2,'0')}</span><span className="heart-tag" aria-label="Favoritar"><Heart size={16}/></span></div><div className="nft-meta"><div><p className="nft-collection">{nft.collection} <span>· {nft.creator}</span></p><h3>{nft.name}</h3></div><div className="price"><span>Preço</span><strong>{nft.priceEth} ETH</strong></div></div></Link>)}</div>}
    </section><section id="artists" className="newsletter"><div><p className="eyebrow">Para quem coleciona com intenção</p><h2>Uma galeria que<br/>continua crescendo.</h2></div><p>Obras selecionadas, edições limitadas e artistas que merecem ser descobertos.</p></section>
  </main>
}

function SearchNotFound() { return <main id="main" className="page-wrap state-panel"><h1>Esta página não existe</h1><p>Volte ao início para continuar explorando.</p><Link className="button button-dark" to="/">Ir para o início</Link></main> }
function PlaceholderPage() { return <main id="main" className="page-wrap state-panel"><p className="eyebrow">Em construção</p><h1>Esta experiência está chegando.</h1><Link to="/" className="button button-dark">Voltar à descoberta</Link></main> }
const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: SearchNotFound })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: (search: Record<string, unknown>): CatalogQuery => ({ q: typeof search.q === 'string' ? search.q : undefined, category: typeof search.category === 'string' ? search.category : undefined, sort: ['recent','price-asc','price-desc'].includes(String(search.sort)) ? search.sort as CatalogQuery['sort'] : 'recent', page: Math.max(1, Number(search.page) || 1) }), component: HomePage })
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: PlaceholderPage })
const placeholderRoutes = ['/cart','/checkout','/login','/register','/profile','/wallets','/orders/$orderId'].map((path) => createRoute({ getParentRoute: () => rootRoute, path, component: PlaceholderPage }))
const routeTree = rootRoute.addChildren([indexRoute, detailRoute, ...placeholderRoutes])
export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 0 })

declare module '@tanstack/react-router' { interface Register { router: typeof router } }
