import { useLayoutEffect, useMemo, useState, type ComponentProps } from 'react'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthPage } from '@/features/account/pages/AuthPage'

type RouterForStory = ComponentProps<typeof RouterProvider>['router']
const desktopBreakpoint = '(min-width: 761px)'

export function AuthScreenStory({ mode }: { mode: 'login' | 'register' }) {
  const [router, setRouter] = useState<RouterForStory | null>(null)
  const queryClient = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }), [])

  useLayoutEffect(() => {
    const originalMatchMedia = window.matchMedia.bind(window)
    window.matchMedia = ((query: string) => {
      const media = originalMatchMedia(query)
      if (query !== desktopBreakpoint) return media
      return new Proxy(media, {
        get(target, property) {
          if (property === 'matches') return false
          const value = Reflect.get(target, property, target) as unknown
          return typeof value === 'function' ? value.bind(target) : value
        },
      })
    }) as typeof window.matchMedia

    const rootRoute = createRootRoute({ component: () => <Outlet/> })
    const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: () => <AuthPage mode="login" presentation="page"/> })
    const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: () => <AuthPage mode="register" presentation="page"/> })
    const routeTree = rootRoute.addChildren([loginRoute, registerRoute])
    const storyRouter = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [mode === 'login' ? '/login' : '/register'] }) })
    setRouter(storyRouter)

    return () => {
      window.matchMedia = originalMatchMedia
    }
  }, [mode])

  if (!router) return null
  return <div className="mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden border-x border-border bg-background">
    <QueryClientProvider client={queryClient}><RouterProvider router={router}/></QueryClientProvider>
  </div>
}
