import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addCartItem, applyCartCoupon, getCart, removeCartCoupon, removeCartItem, updateCartItem } from './cart-api'
import type { CartResponse } from '@/types/marketplace'
import { sumEth } from '@/lib/eth'

export const cartKey = ['cart'] as const

function updateQuantity(cart: CartResponse, nftId: string, quantity: number): CartResponse {
  const items = quantity === 0
    ? cart.items.filter((item) => item.nft.id !== nftId)
    : cart.items.map((item) => item.nft.id === nftId ? { ...item, quantity } : item)
  const subtotalEth = sumEth(items.map((item) => ({ amount: item.nft.priceEth, quantity: item.quantity })))
  return { items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotalEth }
}

export function useCart() {
  return useQuery({ queryKey: cartKey, queryFn: ({ signal }) => getCart(signal) })
}

export function useCartActions() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: cartKey })
  const add = useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) => addCartItem(nftId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
    onSettled: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) => updateCartItem(nftId, quantity),
    onMutate: async ({ nftId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previous = queryClient.getQueryData<CartResponse>(cartKey)
      if (previous) queryClient.setQueryData(cartKey, updateQuantity(previous, nftId, quantity))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous)
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
    onSettled: invalidate,
  })
  const remove = useMutation({
    mutationFn: removeCartItem,
    onMutate: async (nftId) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previous = queryClient.getQueryData<CartResponse>(cartKey)
      if (previous) queryClient.setQueryData(cartKey, updateQuantity(previous, nftId, 0))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous)
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
    onSettled: invalidate,
  })
  const coupon = useMutation({ mutationFn: applyCartCoupon, onSuccess: (cart) => queryClient.setQueryData(cartKey, cart), onSettled: invalidate })
  const clearCoupon = useMutation({ mutationFn: removeCartCoupon, onSuccess: (cart) => queryClient.setQueryData(cartKey, cart), onSettled: invalidate })
  return { add, update, remove, coupon, clearCoupon }
}
