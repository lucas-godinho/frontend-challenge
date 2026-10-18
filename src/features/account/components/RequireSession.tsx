import { PageContainer } from '@/components/organisms/PageContainer'
import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useSession } from '@/features/account/use-session'
import { Skeleton } from '@/components/atoms/skeleton'

export function RequireSession({ children }: { children: ReactNode }) {
  const session = useSession()
  const routerState = useRouterState()
  const navigate = useNavigate()
  const pathname = routerState.location.pathname
  const returnTo = useRef(routerState.location.pathname + routerState.location.searchStr).current
  const redirectStarted = useRef(false)
  useEffect(() => {
    if (session.isPending || session.data || pathname === '/login' || pathname === '/register' || redirectStarted.current) return
    redirectStarted.current = true
    if (window.matchMedia('(min-width: 761px)').matches) {
      window.dispatchEvent(new CustomEvent('kurio:auth-required', { detail: { returnTo } }))
      return
    }
    void navigate({ to: '/login', search: { returnTo }, replace: true })
  }, [navigate, pathname, returnTo, session.data, session.isPending])

  if (session.isPending) return <PageContainer id="main" className="grid min-h-[55vh] place-items-center py-12" aria-live="polite"><div className="grid w-full max-w-md gap-4 text-center"><Skeleton className="mx-auto h-10 w-10 rounded-full"/><p className="m-0 text-sm text-muted-foreground">Verificando sua sessão…</p></div></PageContainer>
  if (!session.data) return <PageContainer id="main" className="grid min-h-[55vh] place-items-center py-12" aria-live="polite"><p className="m-0 text-sm text-muted-foreground">Redirecionando para entrar…</p></PageContainer>
  return children
}
