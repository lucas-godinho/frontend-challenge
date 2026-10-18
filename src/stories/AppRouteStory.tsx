import { useEffect, useMemo } from 'react'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CollectorWallet, OrderResponse } from '@/types/marketplace'
import { catalogFixture } from '@/mocks/fixtures'
import { routeTree } from '@/router'

type RouteStoryData = 'default' | 'cart' | 'favorites' | 'wallets' | 'order'

const demoWallet: CollectorWallet = {
  id: 'storybook-wallet',
  displayName: 'Ana Colecionadora',
  alias: 'Carteira principal',
  network: 'Ethereum',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  ensName: 'ana.eth',
  type: 'Coinbase Wallet',
  isPrimary: true,
}

function seedStoryData(account: boolean, data: RouteStoryData, orderStatus: OrderResponse['status']) {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('kurio:mock-')) localStorage.removeItem(key)
  }
  sessionStorage.removeItem('kurio:checkout-attempt')

  const userId = 'collector-ana'
  if (account) {
    localStorage.setItem('kurio:mock-session:v1', JSON.stringify({
      userId,
      sessionId: `storybook-session-${userId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))
  }

  if (data === 'cart' || data === 'order') {
    localStorage.setItem(account ? `kurio:mock-cart:user:${userId}` : 'kurio:mock-cart:v1', JSON.stringify([
      { nftId: 'orbital-01', quantity: 1 },
      { nftId: 'blue-hour-03', quantity: 1 },
      { nftId: 'quiet-shape-11', quantity: 1 },
    ]))
  }

  if (data === 'favorites') {
    localStorage.setItem(`kurio:mock-favorites:v1:${userId}`, JSON.stringify(['orbital-01', 'blue-hour-03', 'quiet-shape-11']))
  }

  if (data === 'wallets') {
    localStorage.setItem(`kurio:mock-wallets:v1:${userId}`, JSON.stringify([demoWallet]))
  }

  if (data === 'order') {
    const nftById = new Map(catalogFixture.map((nft) => [nft.id, nft]))
    const items = ['orbital-01', 'blue-hour-03', 'quiet-shape-11'].map((id) => ({ nft: nftById.get(id)!, quantity: 1 }))
    const order: OrderResponse = {
      id: 'storybook-order',
      version: 1,
      transactionId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: orderStatus,
      createdAt: '2026-10-18T12:00:00.000Z',
      wallet: demoWallet,
      items,
      subtotalEth: '2.36',
      discountEth: '0.00',
      networkFeeEth: '0.016',
      totalEth: '2.376',
    }
    localStorage.setItem(`kurio:mock-orders:v1:${userId}`, JSON.stringify([{
      id: order.id,
      idempotencyKey: 'storybook-order-key',
      requestBody: '{}',
      order,
    }]))
  }
}

export function AppRouteStory({
  pathname,
  account = false,
  data = 'default',
  orderStatus = 'confirmed',
  authMode,
}: {
  pathname: string
  account?: boolean
  data?: RouteStoryData
  orderStatus?: OrderResponse['status']
  authMode?: 'login' | 'register'
}) {
  const router = useMemo(() => {
    seedStoryData(account, data, orderStatus)
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [pathname] }),
      defaultPreload: 'intent',
      scrollRestoration: true,
    })
  }, [account, data, orderStatus, pathname])
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  }), [])

  useEffect(() => {
    if (!authMode) return
    const frame = requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('kurio:auth-required', { detail: { returnTo: pathname } })))
    return () => cancelAnimationFrame(frame)
  }, [authMode, pathname, router])

  return <QueryClientProvider client={queryClient}><RouterProvider router={router}/></QueryClientProvider>
}
