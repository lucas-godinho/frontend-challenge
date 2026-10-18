import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRealtimeClient, isRealtimeConfigured, type OrderUpdatedEvent } from '@/lib/realtime'
import type { OrderResponse } from '@/types/marketplace'

export const orderKey = (id: string) => ['orders', id] as const

export function useOrderRealtime(orderId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isRealtimeConfigured()) return

    let disposed = false
    let client: Awaited<ReturnType<typeof getRealtimeClient>> | undefined
    let onConnect: (() => void) | undefined
    let hasConnected = false
    const seenEvents = new Set<string>()
    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      if (event.resourceId !== orderId || seenEvents.has(event.eventId)) return
      seenEvents.add(event.eventId)
      queryClient.setQueryData<OrderResponse>(orderKey(orderId), (current) => {
        if (!current || event.version <= current.version) return current
        return { ...current, status: event.data.status, version: event.version }
      })
      void queryClient.invalidateQueries({ queryKey: orderKey(orderId) })
    }

    void getRealtimeClient().then((connectedClient) => {
      if (disposed) return
      client = connectedClient
      onConnect = () => {
        connectedClient.emit('order.subscribe', { id: orderId })
        if (hasConnected) void queryClient.invalidateQueries({ queryKey: orderKey(orderId) })
        hasConnected = true
      }
      connectedClient.on('connect', onConnect)
      connectedClient.on('order.updated', onOrderUpdated)
      if (connectedClient.connected) onConnect()
      else connectedClient.connect()
    }).catch(() => undefined)

    return () => {
      disposed = true
      if (onConnect) client?.off('connect', onConnect)
      client?.off('order.updated', onOrderUpdated)
      client?.disconnect()
    }
  }, [orderId, queryClient])
}
