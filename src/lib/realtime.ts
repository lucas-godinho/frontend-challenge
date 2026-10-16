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

export function getRealtimeClient(): Socket<ServerToClientEvents, ClientToServerEvents> {
  socket ??= io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
    autoConnect: false,
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
