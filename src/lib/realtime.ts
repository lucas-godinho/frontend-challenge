import type { Socket } from 'socket.io-client'
import { waitForRealtimeMocks } from './mock-startup'

export interface NftUpdatedEvent {
  eventId: string
  resourceId: string
  version: number
  occurredAt: string
  data: { priceEth: string; available: number }
}

export interface OrderUpdatedEvent {
  eventId: string
  resourceId: string
  version: number
  occurredAt: string
  data: { status: 'pending' | 'confirmed' | 'rejected' }
}

export interface ServerToClientEvents {
  'nft.updated': (event: NftUpdatedEvent) => void
  'order.updated': (event: OrderUpdatedEvent) => void
}

export interface ClientToServerEvents {
  'catalog.subscribe': (payload: { ids: string[] }) => void
  'order.subscribe': (payload: { id: string }) => void
}

let socketPromise: Promise<Socket<ServerToClientEvents, ClientToServerEvents>> | undefined

function mocksEnabled(): boolean {
  return import.meta.env.VITE_MOCKS === 'true'
    || ((import.meta.env.DEV || import.meta.env.MODE === 'demo') && import.meta.env.VITE_MOCKS !== 'false')
}

export function isRealtimeConfigured(): boolean {
  return mocksEnabled() || Boolean(import.meta.env.VITE_SOCKET_URL)
}

export function getRealtimeClient(): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
  socketPromise ??= waitForRealtimeMocks().then(() => import('socket.io-client')).then(({ io }) => {
    const baseUrl = mocksEnabled() ? window.location.origin : import.meta.env.VITE_SOCKET_URL
    return io(baseUrl, {
      autoConnect: false,
      path: '/socket.io/',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 8,
      timeout: 5_000,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>
  }).catch((error: unknown) => {
    socketPromise = undefined
    throw error
  })
  return socketPromise
}

export async function closeRealtimeClient(): Promise<void> {
  const socket = await socketPromise
  socket?.removeAllListeners()
  socket?.disconnect()
  socketPromise = undefined
}
