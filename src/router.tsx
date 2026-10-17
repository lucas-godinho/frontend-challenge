import { createRootRoute, createRoute, createRouter, Link } from '@tanstack/react-router'
import { AppShell } from '@/components/organisms/AppShell'
import { HomePage } from '@/features/home/pages/HomePage'
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage'
import type { CatalogQuery } from '@/types/marketplace'

function SearchNotFound() {
  return <main id="main" className="page-wrap state-panel">
    <h1>Esta página não existe</h1>
    <p>Volte ao início para continuar explorando.</p>
    <Link className="button button-dark" to="/">Ir para o início</Link>
  </main>
}

function PlaceholderPage() {
  return <main id="main" className="page-wrap state-panel">
    <p className="eyebrow">Em construção</p>
    <h1>Esta experiência está chegando.</h1>
    <Link to="/" className="button button-dark">Voltar à descoberta</Link>
  </main>
}

const rootRoute = createRootRoute({ component: AppShell, notFoundComponent: SearchNotFound })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): CatalogQuery => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
    sort: ['recent', 'price-asc', 'price-desc'].includes(String(search.sort)) ? search.sort as CatalogQuery['sort'] : 'recent',
    page: Number.isFinite(Number(search.page)) ? Math.max(1, Math.floor(Number(search.page))) : 1,
    minPrice: search.minPrice !== undefined && Number.isFinite(Number(search.minPrice)) ? Math.max(0, Number(search.minPrice)) : undefined,
    maxPrice: search.maxPrice !== undefined && Number.isFinite(Number(search.maxPrice)) ? Math.max(0, Number(search.maxPrice)) : undefined,
    network: typeof search.network === 'string' ? search.network.split(',').filter((value) => ['Ethereum', 'Polygon', 'Solana'].includes(value)).join(',') || undefined : undefined,
  }),
  component: HomePage,
})
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: PlaceholderPage })
const favoritesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/favorites', component: FavoritesPage })
const placeholderRoutes = ['/cart', '/checkout', '/login', '/register', '/profile', '/wallets', '/orders/$orderId']
  .map((path) => createRoute({ getParentRoute: () => rootRoute, path, component: PlaceholderPage }))
const routeTree = rootRoute.addChildren([indexRoute, detailRoute, favoritesRoute, ...placeholderRoutes])

export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 0, scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
