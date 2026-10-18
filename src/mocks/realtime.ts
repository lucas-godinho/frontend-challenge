import { ws, type WebSocketHandlerConnection } from 'msw'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/lib/realtime'
import { catalogFixture } from './fixtures'
import { removePurchasedItems } from './order-cart'

const mockSessionKey = 'kurio:mock-session:v1'
const mockOrdersKey = 'kurio:mock-orders:v1'
type StoredOrder = { id: string; idempotencyKey: string; requestBody: string; order: import('@/types/marketplace').OrderResponse }

// MSW's Socket.IO binding normalizes /socket.io/ to the service root before matching.
const socketUrl = new URL('/', window.location.origin)
socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:'
const socket = ws.link(socketUrl.toString())

function currentScenario() {
  return window.localStorage.getItem('kurio:mock-scenario') ?? 'default'
}

function updateNft(id: string, scenario: string): NftUpdatedEvent | null {
  const nft = catalogFixture.find((item) => item.id === id)
  if (!nft) return null

  const version = nft.version + 1
  const data = scenario === 'nft-sold-out'
    ? { priceEth: nft.priceEth, available: 0 }
    : { priceEth: '0.85', available: Math.max(0, nft.available - 1) }
  Object.assign(nft, data, { version })

  return {
    eventId: `nft.updated:${nft.id}:v${version}`,
    resourceId: nft.id,
    version,
    occurredAt: new Date().toISOString(),
    data,
  }
}

function currentUserId() {
  try {
    const session = JSON.parse(window.localStorage.getItem(mockSessionKey) ?? 'null') as { userId?: string; expiresAt?: string } | null
    return session?.expiresAt && Date.parse(session.expiresAt) > Date.now() ? session.userId : undefined
  } catch {
    return undefined
  }
}

function readStoredOrder(orderId: string) {
  const userId = currentUserId()
  if (!userId) return undefined
  try {
    const orders = JSON.parse(window.localStorage.getItem(`${mockOrdersKey}:${userId}`) ?? '[]') as StoredOrder[]
    return orders.find((record) => record.id === orderId)
  } catch {
    return undefined
  }
}

function transitionOrder(orderId: string, status: 'confirmed' | 'rejected') {
  const userId = currentUserId()
  if (!userId) return undefined
  const storageKey = `${mockOrdersKey}:${userId}`
  try {
    const orders = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as StoredOrder[]
    const record = orders.find((item) => item.id === orderId)
    if (!record) return undefined
    if (record.order.status === 'pending') {
      record.order = { ...record.order, status, version: record.order.version + 1 }
      window.localStorage.setItem(storageKey, JSON.stringify(orders))
      if (status === 'confirmed') {
        removePurchasedItems(userId, record.order)
      }
    }
    return record.order
  } catch {
    return undefined
  }
}

function sendOrderStatus(client: WebSocketHandlerConnection['client'], order: import('@/types/marketplace').OrderResponse) {
  const event: OrderUpdatedEvent = {
    eventId: `order.updated:${order.id}:v${order.version}`,
    resourceId: order.id,
    version: order.version,
    occurredAt: new Date().toISOString(),
    data: { status: order.status },
  }
  client.send(`42${JSON.stringify(['order.updated', event])}`)
}

export const realtimeHandlers = [
  socket.addEventListener('connection', (webSocketConnection) => {
    const { client } = webSocketConnection
    let scenarioEmitted = false
    const subscribedOrders = new Set<string>()

    // Engine.IO open + Socket.IO namespace connect packets. Keeping this tiny
    // codec at the MSW boundary lets the real socket.io-client drive scenarios.
    client.send(`0${JSON.stringify({ sid: crypto.randomUUID(), upgrades: [], pingInterval: 25_000, pingTimeout: 20_000, maxPayload: 1_000_000 })}`)
    client.send(`40${JSON.stringify({ sid: crypto.randomUUID() })}`)

    client.addEventListener('message', (message) => {
      if (typeof message.data !== 'string') return
      if (message.data === '2') {
        client.send('3')
        return
      }
      if (!message.data.startsWith('42')) return

      let packet: unknown
      try {
        packet = JSON.parse(message.data.slice(2))
      } catch {
        return
      }
      if (!Array.isArray(packet)) return
      const scenario = currentScenario()
      if (packet[0] === 'catalog.subscribe') {
        const payload = packet[1] as { ids?: string[] } | undefined
        if (scenarioEmitted || !['nft-price-change', 'nft-sold-out', 'nft-duplicate-stale'].includes(scenario)) return
        const nftId = payload?.ids?.find((id) => id === 'orbital-01') ?? payload?.ids?.[0]
        if (!nftId) return

        scenarioEmitted = true
        window.setTimeout(() => {
          const event = updateNft(nftId, scenario === 'nft-duplicate-stale' ? 'nft-price-change' : scenario)
          if (!event) return
          client.send(`42${JSON.stringify(['nft.updated', event])}`)
          if (scenario === 'nft-duplicate-stale') {
            client.send(`42${JSON.stringify(['nft.updated', event])}`)
            const staleEvent: NftUpdatedEvent = {
              ...event,
              eventId: `nft.updated:${nftId}:stale-v${event.version - 1}`,
              version: event.version - 1,
              data: { priceEth: '0.41', available: catalogFixture.find((item) => item.id === nftId)?.available ?? 0 },
            }
            window.setTimeout(() => client.send(`42${JSON.stringify(['nft.updated', staleEvent])}`), 100)
          }
        }, 350)
        return
      }

      if (packet[0] !== 'order.subscribe') return
      const orderId = (packet[1] as { id?: string } | undefined)?.id
      if (!orderId || subscribedOrders.has(orderId)) return
      subscribedOrders.add(orderId)
      const order = readStoredOrder(orderId)?.order
      if (!order) return
      if (order.status !== 'pending') {
        window.setTimeout(() => sendOrderStatus(client, order), 100)
        return
      }

      const finalStatus = scenario === 'order-pending-rejected' ? 'rejected' : 'confirmed'
      const configuredDelay = Number(window.localStorage.getItem('kurio:mock-order-delay-ms') ?? 700)
      const orderDelay = Number.isFinite(configuredDelay) && configuredDelay >= 0 ? configuredDelay : 700
      window.setTimeout(() => {
        const updatedOrder = transitionOrder(orderId, finalStatus)
        if (!updatedOrder) return
        sendOrderStatus(client, updatedOrder)
        if (scenario === 'order-duplicate-stale') {
          sendOrderStatus(client, updatedOrder)
          const staleEvent: OrderUpdatedEvent = {
            eventId: `order.updated:${orderId}:stale-v1`,
            resourceId: orderId,
            version: updatedOrder.version - 1,
            occurredAt: new Date().toISOString(),
            data: { status: 'pending' },
          }
          window.setTimeout(() => client.send(`42${JSON.stringify(['order.updated', staleEvent])}`), 100)
        }
      }, orderDelay)
    })
  }),
]
