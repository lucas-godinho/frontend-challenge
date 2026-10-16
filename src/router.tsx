import { createRootRoute, createRoute, createRouter, Outlet, Link, useNavigate, useSearch, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Search, ShoppingBag, UserRound, ArrowUpRight, SlidersHorizontal, Heart, House, Wallet } from 'lucide-react'
import { useCatalog } from '@/features/catalog/use-catalog'
import { Button } from '@/components/ui/button'
import type { CatalogQuery } from '@/types/marketplace'

function AppShell() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const navRef = useRef<HTMLElement>(null)
  const [navWidth, setNavWidth] = useState(390)
  const navNotchRadius = 44
  const activeTab = pathname === '/' ? 0 : pathname.startsWith('/favorites') ? 1 : pathname.startsWith('/wallets') ? 2 : pathname.startsWith('/cart') ? 3 : pathname.startsWith('/profile') ? 4 : -1
  const navCenter = navWidth / 2
  const navShape = `M 28 31 H ${navCenter - navNotchRadius} A ${navNotchRadius} ${navNotchRadius} 0 0 0 ${navCenter + navNotchRadius} 31 H ${navWidth - 28} Q ${navWidth} 31 ${navWidth} 59 V 98 Q ${navWidth} 126 ${navWidth - 28} 126 H 28 Q 0 126 0 98 V 59 Q 0 31 28 31 Z`

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const resizeObserver = new ResizeObserver(() => {
      if (nav.clientWidth > 0) setNavWidth(nav.clientWidth)
    })

    resizeObserver.observe(nav)
    return () => resizeObserver.disconnect()
  }, [])

  const tabs = [
    { to: '/', label: 'Início', icon: <House size={18} fill="currentColor"/> },
    { to: '/favorites', label: 'Favoritos', icon: <Heart size={19} fill="currentColor"/> },
    { to: '/wallets', label: 'Carteira', icon: <Wallet size={21}/>, action: true },
    { to: '/cart', label: 'Carrinho', icon: <ShoppingBag size={18} fill="currentColor"/> },
    { to: '/profile', label: 'Perfil', icon: <UserRound size={18} fill="currentColor"/> },
  ] as const

  return <>
    <a className="skip-link" href="#main">Pular para o conteúdo</a>
    <header className="topbar">
      <Link to="/" className="wordmark">Kurio<span>®</span></Link>
      <nav aria-label="Principal" className="main-nav">
        <Link to="/">Descobrir</Link><a href="#curated">Coleções</a><a href="#artists">Artistas</a>
      </nav>
      <div className="top-actions">
        <Link to="/login" aria-label="Minha conta"><UserRound size={19}/></Link>
        <Link to="/cart" aria-label="Carrinho"><ShoppingBag size={19}/></Link>
        <button className="avatar-button" aria-label="Menu do perfil">K</button>
      </div>
    </header>
    <div className="route-transition" key={pathname}><Outlet/></div>
    <nav ref={navRef} className="mobile-nav" aria-label="Navegação mobile">
      <svg className="mobile-nav-shape" viewBox={`0 0 ${navWidth} 126`} preserveAspectRatio="none" aria-hidden="true">
        <path d={navShape} fill="#241612"/>
      </svg>
      <div className="mobile-nav-items">
        {tabs.map((tab, index) => 'action' in tab ? null : <Link
          key={tab.to}
          to={tab.to}
          className={`mobile-nav-item${activeTab === index ? ' is-active' : ''}`}
          data-tab={tab.to === '/' ? 'home' : tab.to.slice(1)}
          style={{ gridColumn: index + 1 }}
          aria-label={tab.label}
          aria-current={activeTab === index ? 'page' : undefined}
        >{tab.icon}</Link>)}
      </div>
      <Link
        to="/wallets"
        className={`mobile-nav-item mobile-nav-action${activeTab === 2 ? ' is-active' : ''}`}
        aria-label="Carteira"
        aria-current={activeTab === 2 ? 'page' : undefined}
      >{tabs[2].icon}</Link>
    </nav>
    <footer>
      <span className="wordmark">Kurio<span>®</span></span><p>Arte digital, feita para ficar.</p><span>© 2026 Kurio Marketplace</span>
    </footer>
  </>
}

function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'trending'>('all')
  const catalog = useCatalog(search)
  const update = (next: Partial<CatalogQuery>) => void navigate({ search: (current: CatalogQuery) => ({ ...current, ...next, page: 1 }), replace: false })
  return <main id="main" className="page-wrap">
    <div className="mobile-search-row"><form className="search-box" onSubmit={(event) => { event.preventDefault(); update({ q: draft || undefined }) }}><Search size={18}/><input aria-label="Buscar NFTs" placeholder="Explorar coleções" value={draft} onChange={(e) => setDraft(e.target.value)}/></form><label className="mobile-filter"><SlidersHorizontal size={19}/><span className="sr-only">Ordenar NFTs</span><select aria-label="Ordenar NFTs" value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogQuery['sort'] })}><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label></div>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">Bem-vindo à Kurio</p><h1>Seja dono da<br/><em>cultura digital</em></h1><p className="hero-description">Descubra NFTs selecionados de criadores do mundo todo.</p><a className="button button-light" href="#catalog">Explorar <ArrowUpRight size={16}/></a></div><div className="hero-art" role="img" aria-label="Arte digital selecionada da coleção Kurio"><img className="hero-art-main" src={catalog.data?.items[0]?.image} alt=""/><img className="hero-art-secondary" src={catalog.data?.items[1]?.image} alt=""/><div className="art-circle"/><span className="art-index">01 — 03</span></div><div className="hero-dots" aria-label="Slide 1 de 3"><span/><span/><span/></div></section>
    <section className="catalog-section" id="catalog"><div className="section-heading"><div><p className="eyebrow">Curadoria da semana</p><h2>Descubra NFTs</h2></div><button className="text-button" onClick={() => update({ category: undefined, sort: 'recent', q: undefined })}>Ver tudo <ArrowUpRight size={15}/></button></div>
      <div className="catalog-tabs" role="tablist" aria-label="Categorias de NFTs">{([['all','Todos os NFTs'],['new','Novos lançamentos'],['trending','Em alta']] as const).map(([key,label]) => <button key={key} role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'active' : ''} onClick={() => { setActiveTab(key); update({ sort: key === 'trending' ? 'price-desc' : 'recent' }) }}>{label}</button>)}</div>
      <div className="catalog-tools desktop-catalog-tools"><form className="search-box" onSubmit={(event) => { event.preventDefault(); update({ q: draft || undefined }) }}><Search size={18}/><input aria-label="Buscar NFTs" placeholder="Buscar por obra, coleção ou artista" value={draft} onChange={(e) => setDraft(e.target.value)}/><button aria-label="Buscar">↵</button></form><label className="filter-select"><SlidersHorizontal size={16}/><span className="sr-only">Ordenar NFTs</span><select value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogQuery['sort'] })}><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label></div>
      {catalog.isPending ? <div className="nft-grid" aria-label="Carregando catálogo">{Array.from({length: 6}, (_, i) => <div key={i} className="nft-skeleton"><div className="shimmer"/><div className="skeleton-line"/><div className="skeleton-line short"/></div>)}</div> : catalog.isError ? <div className="state-panel" role="alert"><h3>Não foi possível carregar as obras</h3><p>Confira sua conexão e tente novamente.</p><Button className="button button-light" onClick={() => void catalog.refetch()}>Tentar novamente</Button></div> : catalog.data.items.length === 0 ? <div className="state-panel"><h3>Nenhuma obra por aqui</h3><p>Tente outro termo de busca.</p></div> : <div className="nft-grid">{catalog.data.items.map((nft, index) => <Link className={`nft-card nft-card-${index + 1}`} key={nft.id} to="/nft/$nftId" params={{nftId:nft.id}}><div className="nft-image-wrap"><img src={nft.image} alt={`${nft.name}, arte digital de ${nft.creator}`} loading={index < 3 ? 'eager' : 'lazy'}/>{index === 2 && <span className="rare-tag">Raro</span>}<span className="heart-tag" aria-label="Favoritar"><Heart size={16}/></span></div><div className="nft-meta"><div><p className="nft-collection">{nft.collection} <span>· {nft.creator}</span></p><h3>{nft.name}</h3></div><div className="price"><span>Preço</span><strong>{nft.priceEth} ETH</strong></div></div></Link>)}</div>}
    </section><section id="artists" className="newsletter"><div><p className="eyebrow">Para quem coleciona com intenção</p><h2>Uma galeria que<br/>continua crescendo.</h2></div><p>Obras selecionadas, edições limitadas e artistas que merecem ser descobertos.</p></section>
  </main>
}

function SearchNotFound() { return <main id="main" className="page-wrap state-panel"><h1>Esta página não existe</h1><p>Volte ao início para continuar explorando.</p><Link className="button button-dark" to="/">Ir para o início</Link></main> }
function PlaceholderPage() { return <main id="main" className="page-wrap state-panel"><p className="eyebrow">Em construção</p><h1>Esta experiência está chegando.</h1><Link to="/" className="button button-dark">Voltar à descoberta</Link></main> }
const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: SearchNotFound })
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: (search: Record<string, unknown>): CatalogQuery => ({ q: typeof search.q === 'string' ? search.q : undefined, category: typeof search.category === 'string' ? search.category : undefined, sort: ['recent','price-asc','price-desc'].includes(String(search.sort)) ? search.sort as CatalogQuery['sort'] : 'recent', page: Math.max(1, Number(search.page) || 1) }), component: HomePage })
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: PlaceholderPage })
const placeholderRoutes = ['/cart','/checkout','/favorites','/login','/register','/profile','/wallets','/orders/$orderId'].map((path) => createRoute({ getParentRoute: () => rootRoute, path, component: PlaceholderPage }))
const routeTree = rootRoute.addChildren([indexRoute, detailRoute, ...placeholderRoutes])
export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 0 })

declare module '@tanstack/react-router' { interface Register { router: typeof router } }
