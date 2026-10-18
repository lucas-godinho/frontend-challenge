import { useQuery } from '@tanstack/react-query'
import { getNft } from './catalog-api'

export const nftKey = (id: string) => ['nft', id] as const

export function useNft(id: string) {
  return useQuery({ queryKey: nftKey(id), queryFn: ({ signal }) => getNft(id, signal) })
}
