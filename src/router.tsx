import { createRootRoute, createRoute, createRouter, Link } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/features/home/HomePage'
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
    page: Math.max(1, Number(search.page) || 1),
  }),
  component: HomePage,
})
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: PlaceholderPage })
const placeholderRoutes = ['/cart', '/checkout', '/favorites', '/login', '/register', '/profile', '/wallets', '/orders/$orderId']
  .map((path) => createRoute({ getParentRoute: () => rootRoute, path, component: PlaceholderPage }))
const routeTree = rootRoute.addChildren([indexRoute, detailRoute, ...placeholderRoutes])

export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 0 })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
