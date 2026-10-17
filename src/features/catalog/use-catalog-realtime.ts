import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRealtimeClient, isRealtimeConfigured, type NftUpdatedEvent } from '@/lib/realtime'
import type { CatalogResponse } from '@/types/marketplace'

export function useCatalogRealtime(resourceIds: string[]) {
  const queryClient = useQueryClient()
  const idsKey = [...new Set(resourceIds)].sort().join(',')

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : []
    if (ids.length === 0 || !isRealtimeConfigured()) return

    const client = getRealtimeClient()
    const versions = new Map<string, number>()
    const onConnect = () => client.emit('catalog.subscribe', { ids })
    const onNftUpdated = (event: NftUpdatedEvent) => {
      if (!ids.includes(event.resourceId)) return

      const lastVersion = versions.get(event.resourceId) ?? 0
      if (event.version <= lastVersion) return
      versions.set(event.resourceId, event.version)

      queryClient.setQueriesData<CatalogResponse>({
        queryKey: ['catalog'],
        predicate: (query) => query.queryKey.length === 2 && typeof query.queryKey[1] === 'object',
      }, (current) => {
        if (!current) return current
        let changed = false
        const items = current.items.map((nft) => {
          if (nft.id !== event.resourceId || event.version <= nft.version) return nft
          changed = true
          return { ...nft, ...event.data, version: event.version }
        })
        return changed ? { ...current, items } : current
      })
    }

    client.on('connect', onConnect)
    client.on('nft.updated', onNftUpdated)
    client.connect()

    return () => {
      client.off('connect', onConnect)
      client.off('nft.updated', onNftUpdated)
      client.disconnect()
    }
  }, [idsKey, queryClient])
}
