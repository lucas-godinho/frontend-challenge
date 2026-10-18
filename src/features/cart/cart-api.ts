import { api } from '@/lib/api'
import type { CartResponse, OrderResponse, WalletConnection, CollectorWallet } from '@/types/marketplace'

export interface CheckoutQuote {
  items: Array<{ nftId: string; quantity: number; priceEth: string; version: number }>
  coupon?: string
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
}

export function toCheckoutQuote(cart: CartResponse): CheckoutQuote {
  return {
    items: cart.items.map(({ nft, quantity }) => ({ nftId: nft.id, quantity, priceEth: nft.priceEth, version: nft.version })),
    coupon: cart.coupon,
    subtotalEth: cart.subtotalEth,
    discountEth: cart.discountEth ?? '0.00',
    networkFeeEth: cart.networkFeeEth ?? '0.00',
    totalEth: cart.totalEth ?? cart.subtotalEth,
  }
}

export async function getCart(signal?: AbortSignal): Promise<CartResponse> {
  const response = await api.get<CartResponse>('/cart', { signal })
  return response.data
}

export async function addCartItem(nftId: string, quantity: number): Promise<CartResponse> {
  const response = await api.post<CartResponse>('/cart/items', { nftId, quantity })
  return response.data
}

export async function updateCartItem(nftId: string, quantity: number): Promise<CartResponse> {
  const response = await api.put<CartResponse>(`/cart/items/${encodeURIComponent(nftId)}`, { quantity })
  return response.data
}

export async function removeCartItem(nftId: string): Promise<CartResponse> {
  const response = await api.delete<CartResponse>(`/cart/items/${encodeURIComponent(nftId)}`)
  return response.data
}

export async function applyCartCoupon(code: string): Promise<CartResponse> {
  const response = await api.post<CartResponse>('/cart/coupon', { code })
  return response.data
}

export async function removeCartCoupon(): Promise<CartResponse> {
  const response = await api.delete<CartResponse>('/cart/coupon')
  return response.data
}

export async function connectWallet(input: { type: CollectorWallet['type']; network: CollectorWallet['network'] }): Promise<WalletConnection> {
  const response = await api.post<WalletConnection>('/wallet-connection', input)
  return response.data
}

export async function getWalletConnection(signal?: AbortSignal): Promise<WalletConnection | null> {
  const response = await api.get<WalletConnection | null>('/wallet-connection', { signal })
  return response.data
}

export async function disconnectWallet(): Promise<void> {
  await api.delete('/wallet-connection')
}

export async function createOrder(input: { wallet: import('@/types/marketplace').CollectorWallet; buyer: { displayName: string; email: string; address: string; network: string }; quote: CheckoutQuote }, idempotencyKey: string): Promise<OrderResponse> {
  const response = await api.post<OrderResponse>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })
  return response.data
}

export async function getOrder(orderId: string, signal?: AbortSignal): Promise<OrderResponse> {
  const response = await api.get<OrderResponse>(`/orders/${encodeURIComponent(orderId)}`, { signal })
  return response.data
}
