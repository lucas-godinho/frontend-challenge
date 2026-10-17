import { createRootRoute, createRoute, createRouter, Outlet, Link, useNavigate, useSearch, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Search, ShoppingBag, UserRound, ArrowUpRight, SlidersHorizontal, Heart, House } from 'lucide-react'
import { useCatalog } from '@/features/catalog/use-catalog'
import { Button } from '@/components/ui/button'
import type { CatalogQuery } from '@/types/marketplace'

function CartIcon() {
  return <svg width="18" height="17" viewBox="0 0 18 17" fill="none" aria-hidden="true">
    <path d="M17.5 5.13468L16.5564 11.1111C16.3848 12.2896 15.4412 13.0471 14.2402 13.0471H6.0049C4.88971 13.0471 3.86029 12.2054 3.68873 11.1111L2.65931 4.12458L2.40196 2.18855C2.31618 1.6835 1.88725 1.3468 1.28676 1.3468H0.686274C0.343137 1.3468 0 1.0101 0 0.673401C0 0.3367 0.343137 0 0.686274 0H1.28676C2.48775 0 3.51716 0.841751 3.60294 2.0202L3.77451 3.367H15.9559C16.3848 3.367 16.8137 3.53535 17.0711 3.87205C17.4142 4.20876 17.5 4.71381 17.5 5.13468Z" fill="currentColor"/>
    <path d="M14.4118 16.6667C14.8855 16.6667 15.2696 16.2898 15.2696 15.8249C15.2696 15.36 14.8855 14.9832 14.4118 14.9832C13.938 14.9832 13.5539 15.36 13.5539 15.8249C13.5539 16.2898 13.938 16.6667 14.4118 16.6667Z" fill="currentColor"/>
    <path d="M5.83333 16.6667C6.30711 16.6667 6.69118 16.2898 6.69118 15.8249C6.69118 15.36 6.30711 14.9832 5.83333 14.9832C5.35956 14.9832 4.97549 15.36 4.97549 15.8249C4.97549 16.2898 5.35956 16.6667 5.83333 16.6667Z" fill="currentColor"/>
  </svg>
}

function CenterActionIcon() {
  return <svg width="27" height="24" viewBox="0 0 27 24" fill="none" aria-hidden="true">
    <path d="M13.3819 12.8913C9.28498 12.8913 5.18803 12.8913 1.09108 12.8906C0.961448 12.8906 0.827342 12.8943 0.702176 12.8667C0.25441 12.7684 -0.0480741 12.337 0.00631347 11.893C0.060701 11.4482 0.439924 11.1114 0.913021 11.1092C1.98364 11.1032 3.055 11.1062 4.12561 11.1062C11.3234 11.1062 18.5212 11.107 25.719 11.1084C25.8575 11.1084 26.0013 11.1047 26.1347 11.136C26.5743 11.2396 26.8641 11.6553 26.8179 12.0919C26.7702 12.5389 26.3947 12.8868 25.9246 12.8891C24.7139 12.8965 23.504 12.8928 22.2933 12.8928C19.3228 12.8928 16.3524 12.8928 13.3827 12.8928C13.3819 12.8928 13.3819 12.8921 13.3819 12.8913Z" fill="currentColor"/>
    <path d="M10.5553 24.0002C9.20453 23.7976 7.81951 23.7216 6.51123 23.3654C3.76503 22.6167 2.19524 20.7243 1.7445 17.9274C1.57761 16.8926 1.47479 15.8473 1.35559 14.8057C1.28332 14.1762 1.58357 13.7634 2.13191 13.6956C2.67653 13.6286 3.07587 13.9817 3.13622 14.5278C3.26586 15.708 3.35601 16.8978 3.57877 18.0615C3.98109 20.1633 5.70212 21.6288 7.83664 21.8165C8.84617 21.9052 9.8542 22.0177 10.8607 22.1339C11.5953 22.2188 11.9343 23.0347 11.4948 23.6314C11.3048 23.89 11.0805 23.9637 10.5553 24.0002Z" fill="currentColor"/>
    <path d="M25.4463 9.39819C25.4307 9.53528 25.4321 9.67758 25.3949 9.8087C25.3077 10.1186 25.0015 10.3779 24.7422 10.3831C24.3004 10.3921 23.7998 10.0643 23.6977 9.65001C23.6247 9.35572 23.6225 9.0443 23.5822 8.74107C23.4571 7.78444 23.3967 6.81366 23.1881 5.87566C22.7604 3.95571 21.5326 2.73758 19.6142 2.32259C18.4743 2.07599 17.2971 1.99999 16.1363 1.84726C16.0075 1.83013 15.8756 1.82417 15.7504 1.79213C15.331 1.68559 15.0583 1.287 15.1112 0.870521C15.17 0.407854 15.5269 0.0539627 15.9732 0.0859992C17.5042 0.195519 19.0427 0.30653 20.5119 0.776646C22.8633 1.52988 24.3451 3.15778 24.9054 5.53965C25.2012 6.79876 25.3018 8.10332 25.4903 9.38701C25.4761 9.39148 25.4612 9.39446 25.4463 9.39819Z" fill="currentColor"/>
    <path d="M25.4224 14.8807C25.2988 16.1673 25.2086 17.5807 24.8167 18.9441C24.0777 21.5145 21.8962 23.2891 19.2372 23.5491C18.1554 23.6549 17.0781 23.8106 15.9992 23.944C15.617 23.9917 15.2013 23.6229 15.1208 23.1647C15.0404 22.7058 15.3287 22.255 15.7832 22.1939C16.3263 22.1202 16.8776 22.106 17.4208 22.033C18.3223 21.913 19.2565 21.8803 20.1133 21.6083C21.97 21.0197 23.007 19.6638 23.279 17.7453C23.4235 16.7254 23.5308 15.7002 23.6336 14.675C23.6932 14.082 24.0799 13.6685 24.6007 13.6983C25.1043 13.7273 25.4515 14.1744 25.4224 14.8807Z" fill="currentColor"/>
    <path d="M1.3295 9.27513C1.52768 7.95493 1.62081 6.60791 1.9449 5.319C2.60053 2.71063 4.34912 1.11849 6.95898 0.532893C8.1339 0.269151 9.34756 0.177512 10.5448 0.0173291C10.7266 -0.00725703 10.9226 -0.0087471 11.0984 0.0329749C11.5119 0.130574 11.7548 0.509797 11.7153 0.940427C11.6736 1.39117 11.3681 1.69068 10.9285 1.73985C9.84748 1.86055 8.7642 1.97081 7.68688 2.1228C5.4108 2.44316 3.83356 4.02338 3.52363 6.28456C3.37536 7.36933 3.2569 8.45857 3.1295 9.54632C3.07809 9.98441 2.70185 10.3122 2.24217 10.3063C1.79589 10.3003 1.41518 9.94492 1.39059 9.50833C1.38612 9.43457 1.38985 9.36007 1.38985 9.28556C1.36973 9.28184 1.34961 9.27886 1.3295 9.27513Z" fill="currentColor"/>
  </svg>
}

function AppShell() {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const pathname = routerState.location.pathname
  const navRef = useRef<HTMLElement>(null)
  const [navWidth, setNavWidth] = useState(390)
  const [hoveredTab, setHoveredTab] = useState<number | null>(null)
  const activeTab = pathname === '/' ? 0 : pathname.startsWith('/favorites') ? 1 : pathname.startsWith('/wallets') ? 2 : pathname.startsWith('/cart') ? 3 : pathname.startsWith('/profile') ? 4 : -1
  const centerNotch = navWidth / 2
  const hoverCenter = hoveredTab === null ? null : navWidth * (hoveredTab * 0.2 + 0.1)
  const navNotchRadius = 42
  const hoverNotchRadius = hoverCenter === null
    ? navNotchRadius
    : Math.min(42, Math.max(28, Math.min(hoverCenter - 4, navWidth - hoverCenter - 4)))
  const navShape = `M 28 31 H ${navWidth - 28} Q ${navWidth} 31 ${navWidth} 59 V 98 Q ${navWidth} 126 ${navWidth - 28} 126 H 28 Q 0 126 0 98 V 59 Q 0 31 28 31 Z`

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
    { to: '/wallets', label: 'Carteira', icon: <CenterActionIcon/>, action: true },
    { to: '/cart', label: 'Carrinho', icon: <CartIcon/> },
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
        <defs>
          <mask id="mobile-nav-mask" x="0" y="0" width={navWidth} height="126" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <rect width={navWidth} height="126" fill="black"/>
            <path d={navShape} fill="white"/>
            <circle cx={centerNotch} cy="31" r={navNotchRadius} fill="black"/>
            {hoverCenter !== null && hoveredTab !== 2 && <circle
              key={hoveredTab}
              className="mobile-nav-hover-cutout"
              cx={hoverCenter}
              cy="31"
              r={hoverNotchRadius}
              fill="black"
            />}
          </mask>
        </defs>
        <rect width={navWidth} height="126" fill="#241612" mask="url(#mobile-nav-mask)"/>
      </svg>
      {hoverCenter !== null && hoveredTab !== 2 && <span
        key={hoveredTab}
        className="mobile-nav-hover-highlight"
        style={{ left: hoverCenter }}
        aria-hidden="true"
      />}
      <span className="mobile-nav-action-highlight" aria-hidden="true" />
      <div className="mobile-nav-items">
        {tabs.map((tab, index) => 'action' in tab ? <button
          key={tab.to}
          type="button"
          className="mobile-nav-item mobile-nav-action is-highlighted"
          style={{ gridColumn: index + 1 }}
          aria-label="Abrir carteira"
          aria-current={activeTab === index ? 'page' : undefined}
          onClick={() => void navigate({ to: tab.to })}
          onMouseEnter={() => setHoveredTab(index)}
          onMouseLeave={() => setHoveredTab(null)}
          onFocus={() => setHoveredTab(index)}
          onBlur={() => setHoveredTab(null)}
        >{tab.icon}</button> : <Link
          key={tab.to}
          to={tab.to}
          className={`mobile-nav-item${activeTab === index ? ' is-active' : ''}${hoveredTab === index ? ' is-highlighted' : ''}`}
          data-tab={tab.to === '/' ? 'home' : tab.to.slice(1)}
          style={{ gridColumn: index + 1 }}
          aria-label={tab.label}
          aria-current={activeTab === index ? 'page' : undefined}
          onMouseEnter={() => setHoveredTab(index)}
          onMouseLeave={() => setHoveredTab(null)}
          onFocus={() => setHoveredTab(index)}
          onBlur={() => setHoveredTab(null)}
        >{tab.icon}</Link>)}
      </div>
    </nav>
    <footer>
      <span className="wordmark">Kurio<span>®</span></span><p>Arte digital, feita para ficar.</p><span>© 2026 Kurio Marketplace</span>
    </footer>
  </>
}

const heroSlides = [
  {
    eyebrow: 'Bem-vindo à Kurio',
    title: <>Seja dono da<br/><em>cultura digital</em></>,
    description: 'Descubra NFTs selecionados de criadores do mundo todo.',
    action: 'Explorar',
  },
  {
    eyebrow: 'Curadoria da semana',
    title: <>Encontre sua<br/><em>próxima obra</em></>,
    description: 'Edições especiais de artistas independentes para sua coleção.',
    action: 'Ver coleção',
  },
  {
    eyebrow: 'Arte que conecta',
    title: <>Colecione o<br/><em>extraordinário</em></>,
    description: 'Explore obras digitais únicas e descubra novos criadores.',
    action: 'Descobrir',
  },
]

function HomePage() {
  const search = useSearch({ from: '/' }) as CatalogQuery
  const navigate = useNavigate({ from: '/' })
  const [draft, setDraft] = useState(search.q ?? '')
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'trending'>('all')
  const [activeSlide, setActiveSlide] = useState(0)
  const catalog = useCatalog(search)
  const currentSlide = heroSlides[activeSlide]!
  const slideItems = catalog.data?.items ?? []
  const firstArtwork = slideItems.length > 0 ? slideItems[(activeSlide * 2) % slideItems.length] : undefined
  const secondArtwork = slideItems.length > 1 ? slideItems[(activeSlide * 2 + 1) % slideItems.length] : firstArtwork

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % heroSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [])

  const update = (next: Partial<CatalogQuery>) => void navigate({ search: (current: CatalogQuery) => ({ ...current, ...next, page: 1 }), replace: false })
  return <main id="main" className="page-wrap">
    <div className="mobile-search-row"><form className="search-box" onSubmit={(event) => { event.preventDefault(); update({ q: draft || undefined }) }}><Search size={18}/><input aria-label="Buscar NFTs" placeholder="Explorar coleções" value={draft} onChange={(e) => setDraft(e.target.value)}/></form><label className="mobile-filter"><SlidersHorizontal size={19}/><span className="sr-only">Ordenar NFTs</span><select aria-label="Ordenar NFTs" value={search.sort ?? 'recent'} onChange={(e) => update({ sort: e.target.value as CatalogQuery['sort'] })}><option value="recent">Mais recentes</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select></label></div>
    <section className="hero" aria-roledescription="carousel" aria-label="Destaques da Kurio">
      <img className="hero-background" src="/images/hero-background.svg" alt="" aria-hidden="true"/>
      <div className="hero-copy" key={`copy-${activeSlide}`}>
        <p className="eyebrow">{currentSlide.eyebrow}</p>
        <h1>{currentSlide.title}</h1>
        <p className="hero-description">{currentSlide.description}</p>
        <a className="button button-light" href="#catalog">{currentSlide.action} <ArrowUpRight size={16}/></a>
      </div>
      <div className="hero-art" role="group" aria-label={`Obras em destaque, slide ${activeSlide + 1} de ${heroSlides.length}`}>
        {firstArtwork && <img key={`${activeSlide}-main`} className="hero-art-main" src={firstArtwork.image} alt={firstArtwork.name}/>}
        {secondArtwork && <img key={`${activeSlide}-secondary`} className="hero-art-secondary" src={secondArtwork.image} alt={secondArtwork.name}/>}
        <div className="art-circle"/><span className="art-index">{String(activeSlide + 1).padStart(2, '0')} — 03</span>
      </div>
      <div className="hero-dots" aria-label="Escolher destaque">
        {heroSlides.map((slide, index) => <button key={slide.eyebrow} type="button" aria-label={`Mostrar slide ${index + 1}: ${slide.eyebrow}`} aria-current={activeSlide === index ? 'true' : undefined} onClick={() => setActiveSlide(index)}><span/></button>)}
      </div>
    </section>
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
