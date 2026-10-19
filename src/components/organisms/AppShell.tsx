import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart, UserRound } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/cn'
import { MobileNavigation } from './MobileNavigation'
import { SiteFooter } from './SiteFooter'
import { useCart } from '@/features/cart/use-cart'
import { useSession, useSessionActions } from '@/features/account/use-session'

const AuthPage = lazy(() => import('@/features/account/pages/AuthPage').then((module) => ({ default: module.AuthPage })))

export function AppShell() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const navigate = useNavigate()
  const cart = useCart()
  const cartItemCount = cart.data?.itemCount ?? 0
  const session = useSession()
  const sessionActions = useSessionActions()
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [authReturnTo, setAuthReturnTo] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 761px)').matches)
  const isMobileAuthRoute = !isDesktop && (pathname === '/login' || pathname === '/register')
  useEffect(() => {
    const media = window.matchMedia('(min-width: 761px)')
    const updateViewport = () => setIsDesktop(media.matches)
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  useLayoutEffect(() => {
    const openRequiredAuth = (event: Event) => {
      if (!window.matchMedia('(min-width: 761px)').matches) return
      const detail = (event as CustomEvent<{ returnTo?: string }>).detail
      setAuthReturnTo(detail?.returnTo ?? pathname)
      setAuthMode('login')
    }
    window.addEventListener('kurio:auth-required', openRequiredAuth)
    return () => window.removeEventListener('kurio:auth-required', openRequiredAuth)
  }, [pathname])

  useEffect(() => {
    if (!isDesktop || (pathname !== '/login' && pathname !== '/register')) return
    const params = new URLSearchParams(routerState.location.searchStr)
    const requested = params.get('returnTo')
    const safeReturnTo = requested?.startsWith('/') && !requested.startsWith('//') ? requested : null
    setAuthMode(pathname === '/register' ? 'register' : 'login')
    setAuthReturnTo(safeReturnTo)
    void navigate({ to: (safeReturnTo ?? '/') as never, replace: true })
  }, [isDesktop, navigate, pathname, routerState.location.searchStr])

  const openAuth = (mode: 'login' | 'register') => {
    setAuthReturnTo(pathname + routerState.location.searchStr)
    setAuthMode(mode)
  }
  const closeAuth = useCallback(() => setAuthMode(null), [])

  return <div className={cn('min-h-screen', !isMobileAuthRoute && 'max-[760px]:pb-[calc(142px+env(safe-area-inset-bottom,0px))]')}>
    <a className="fixed -left-full top-4 z-50 bg-popover p-3 text-foreground focus:left-4" href="#main">Pular para o conteúdo</a>
    <header className="mx-auto hidden h-[76px] w-[90%] items-center justify-between border-b border-border min-[761px]:flex min-[1051px]:grid min-[1051px]:h-[70px] min-[1051px]:w-[min(calc(100%-240px),1200px)] min-[1051px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] min-[1051px]:gap-6">
      <Link to="/" className="justify-self-start font-display text-2xl font-bold tracking-[-1.5px] min-[1051px]:text-base min-[1051px]:tracking-normal">Kurio<span className="ml-0.5 align-top text-[10px] text-primary min-[1051px]:hidden">®</span></Link>
      <nav aria-label="Principal" className="flex items-center justify-center gap-4 text-xs text-muted-foreground min-[1051px]:h-full min-[1051px]:gap-10 min-[1051px]:text-sm">
        <Link to="/" className={cn('relative flex items-center hover:text-accent hover:underline hover:underline-offset-4', pathname === '/' && 'font-bold text-primary min-[1051px]:after:absolute min-[1051px]:after:bottom-0 min-[1051px]:after:left-0 min-[1051px]:after:h-[3px] min-[1051px]:after:w-full min-[1051px]:after:bg-primary min-[1051px]:after:content-[\'\']')}>Início</Link>
        <Link className="flex items-center hover:text-accent hover:underline hover:underline-offset-4" to="/" hash="catalog" resetScroll={false} activeProps={{ className: '' }}>Mercado</Link>
        <Link className="flex items-center hover:text-accent hover:underline hover:underline-offset-4" to="/" hash="creators" resetScroll={false} activeProps={{ className: '' }}>Criadores</Link>
        <Link className="flex items-center hover:text-accent hover:underline hover:underline-offset-4" to="/" hash="blog" resetScroll={false} activeProps={{ className: '' }}>Aprenda</Link>
      </nav>
      <div className="flex items-center justify-end gap-4 min-[1051px]:gap-[30px]">
        <Link className="grid place-items-center hover:text-accent" to="/" hash="catalog" resetScroll={false} aria-label="Buscar"><Search size={21}/></Link>
        <Link className="relative grid place-items-center hover:text-accent" to="/cart" aria-label={`Carrinho${cartItemCount ? `, ${cartItemCount} itens` : ''}`}><ShoppingCart size={21}/>{cartItemCount > 0 && <span className="absolute -right-[9px] -top-2 grid size-[17px] place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{cartItemCount}</span>}</Link>
        {session.data
          ? <><Button className="h-9 rounded-sm px-3 text-sm" asChild><Link to="/profile"><UserRound size={16}/> {session.data.user.name.split(' ')[0]}</Link></Button><Button variant="ghost" className="h-9 px-2 text-xs text-muted-foreground hover:text-accent" type="button" onClick={() => sessionActions.logout.mutate()} disabled={sessionActions.logout.isPending}>Sair</Button></>
          : <Button className="h-9 rounded-sm px-3 text-sm" type="button" onClick={() => openAuth('login')}><LogIn size={18}/> Entrar</Button>}
      </div>
    </header>
    <div className="route-transition" key={pathname}><Outlet/></div>
    {authMode && <Suspense fallback={null}><AuthPage mode={authMode} presentation="dialog" returnTo={authReturnTo} onClose={closeAuth} onModeChange={setAuthMode}/></Suspense>}
    {!isMobileAuthRoute && <MobileNavigation/>}
    <SiteFooter/>
  </div>
}
