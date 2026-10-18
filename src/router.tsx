import { lazy, Suspense, type ReactNode } from 'react'
import { createRootRoute, createRoute, createRouter, Link } from '@tanstack/react-router'
import { AppShell } from '@/components/organisms/AppShell'
import { PageContainer } from '@/components/organisms/PageContainer'
import { Button } from '@/components/atoms/button'
import { Skeleton } from '@/components/atoms/skeleton'
import { Card, CardDescription, CardTitle } from '@/components/molecules/card'
import { HomePage } from '@/features/home/pages/HomePage'
import { RequireSession } from '@/features/account/components/RequireSession'
import type { CatalogQuery } from '@/types/marketplace'

const NftDetailPage = lazy(() => import('@/features/catalog/pages/NftDetailPage').then((module) => ({ default: module.NftDetailPage })))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage').then((module) => ({ default: module.CartPage })))
const FavoritesPage = lazy(() => import('@/features/favorites/pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })))
const CheckoutPage = lazy(() => import('@/features/cart/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })))
const OrderConfirmationPage = lazy(() => import('@/features/cart/pages/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage })))
const AuthPage = lazy(() => import('@/features/account/pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const ProfilePage = lazy(() => import('@/features/account/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const WalletsPage = lazy(() => import('@/features/account/pages/WalletsPage').then((module) => ({ default: module.WalletsPage })))

function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageContainer id="main" className="min-h-[55vh] py-8" aria-live="polite" aria-busy="true" aria-label="Carregando tela"><Skeleton className="h-[300px] w-full rounded-lg"/></PageContainer>}>{children}</Suspense>
}

function SearchNotFound() {
  return <PageContainer id="main" className="grid min-h-[55vh] place-items-center py-14">
    <Card className="grid max-w-xl justify-items-center gap-3 p-8 text-center">
      <CardTitle>Esta página não existe</CardTitle>
      <CardDescription>Volte ao início para continuar explorando.</CardDescription>
      <Button className="mt-2" asChild><Link to="/">Ir para o início</Link></Button>
    </Card>
  </PageContainer>
}

function PrivateFavoritesPage() {
  return <RequireSession><PageSuspense><FavoritesPage/></PageSuspense></RequireSession>
}

function validateAuthSearch(search: Record<string, unknown>) {
  const returnTo = typeof search.returnTo === 'string' && search.returnTo.startsWith('/') && !search.returnTo.startsWith('//')
    ? search.returnTo
    : undefined
  return { returnTo }
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
const detailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId', component: () => <PageSuspense><NftDetailPage/></PageSuspense> })
const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: () => <PageSuspense><CartPage/></PageSuspense> })
const favoritesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/favorites', component: PrivateFavoritesPage })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', validateSearch: validateAuthSearch, component: () => <PageSuspense><AuthPage mode="login"/></PageSuspense> })
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', validateSearch: validateAuthSearch, component: () => <PageSuspense><AuthPage mode="register"/></PageSuspense> })
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', component: () => <PageSuspense><CheckoutPage/></PageSuspense> })
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: () => <PageSuspense><ProfilePage/></PageSuspense> })
const walletsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallets', component: () => <PageSuspense><WalletsPage/></PageSuspense> })
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/orders/$orderId', component: () => <RequireSession><PageSuspense><OrderConfirmationPage/></PageSuspense></RequireSession> })
export const routeTree = rootRoute.addChildren([indexRoute, detailRoute, cartRoute, favoritesRoute, loginRoute, registerRoute, checkoutRoute, profileRoute, walletsRoute, orderRoute])

export const router = createRouter({ routeTree, defaultPreload: 'intent', defaultPreloadStaleTime: 0, scrollRestoration: true })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
