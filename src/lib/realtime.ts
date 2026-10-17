import { io, type Socket } from 'socket.io-client'

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

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined

export function isRealtimeConfigured(): boolean {
  const mocksEnabled = import.meta.env.VITE_MOCKS === 'true'
    || (import.meta.env.DEV && import.meta.env.VITE_MOCKS !== 'false')
  return !mocksEnabled && Boolean(import.meta.env.VITE_SOCKET_URL)
}

export function getRealtimeClient(): Socket<ServerToClientEvents, ClientToServerEvents> {
  const baseUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin

  socket ??= io(baseUrl, {
    autoConnect: false,
    path: '/socket.io/',
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 8,
    timeout: 5_000,
  })
  return socket
}

export function closeRealtimeClient(): void {
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = undefined
}
