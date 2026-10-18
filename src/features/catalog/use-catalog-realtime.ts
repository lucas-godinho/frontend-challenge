import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRealtimeClient, isRealtimeConfigured, type NftUpdatedEvent } from '@/lib/realtime'
import type { CartResponse, CatalogResponse, Nft } from '@/types/marketplace'
import { nftKey } from './use-nft'

export function useCatalogRealtime(resourceIds: string[]) {
  const queryClient = useQueryClient()
  const idsKey = [...new Set(resourceIds)].sort().join(',')

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : []
    if (ids.length === 0 || !isRealtimeConfigured()) return

    const versions = new Map<string, number>()
    let client: Awaited<ReturnType<typeof getRealtimeClient>> | undefined
    let onConnect: (() => void) | undefined
    let disposed = false
    let hasConnected = false
    const onNftUpdated = (event: NftUpdatedEvent) => {
      if (!ids.includes(event.resourceId)) return

      const lastVersion = versions.get(event.resourceId) ?? 0
      if (event.version <= lastVersion) return
      versions.set(event.resourceId, event.version)

      const updateNft = (nft: Nft) => nft.id === event.resourceId && event.version > nft.version
        ? { ...nft, ...event.data, version: event.version }
        : nft
      queryClient.setQueriesData<CatalogResponse>({
        queryKey: ['catalog'],
        predicate: (query) => query.queryKey.length === 2 && typeof query.queryKey[1] === 'object',
      }, (current) => {
        if (!current) return current
        let changed = false
        const items = current.items.map((nft) => {
          const updated = updateNft(nft)
          if (updated !== nft) changed = true
          return updated
        })
        return changed ? { ...current, items } : current
      })
      queryClient.setQueryData<Nft>(nftKey(event.resourceId), (current) => current ? updateNft(current) : current)
      queryClient.setQueryData<CartResponse>(['cart'], (current) => current ? {
        ...current,
        items: current.items.map((item) => ({ ...item, nft: updateNft(item.nft) })),
      } : current)
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
    }

    void getRealtimeClient().then((connectedClient) => {
      if (disposed) return
      client = connectedClient
      onConnect = () => {
        connectedClient.emit('catalog.subscribe', { ids })
        if (hasConnected) {
          void queryClient.invalidateQueries({ queryKey: ['catalog'] })
          void queryClient.invalidateQueries({ queryKey: ['nft'] })
          void queryClient.invalidateQueries({ queryKey: ['cart'] })
        }
        hasConnected = true
      }
      connectedClient.on('connect', onConnect)
      connectedClient.on('nft.updated', onNftUpdated)
      if (connectedClient.connected) onConnect()
      else connectedClient.connect()
    }).catch(() => undefined)

    return () => {
      disposed = true
      if (onConnect) client?.off('connect', onConnect)
      client?.off('nft.updated', onNftUpdated)
      client?.disconnect()
    }
  }, [idsKey, queryClient])
}
