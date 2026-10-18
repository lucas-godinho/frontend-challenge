import type { OrderResponse } from '@/types/marketplace'

type StoredCartItem = { nftId: string; quantity: number }

// A pending payment owns its snapshot, not the cart the collector may edit
// in another tab while the payment is being processed.
export function removePurchasedItems(userId: string, order: OrderResponse): void {
  if (order.status !== 'confirmed') return
  const cartKey = `kurio:mock-cart:user:${userId}`
  const current = JSON.parse(window.localStorage.getItem(cartKey) ?? '[]') as StoredCartItem[]
  const purchased = new Map(order.items.map(({ nft, quantity }) => [nft.id, quantity]))
  const remaining = current.map((item) => ({
    ...item, quantity: Math.max(0, item.quantity - (purchased.get(item.nftId) ?? 0)),
  })).filter((item) => item.quantity > 0)
  window.localStorage.setItem(cartKey, JSON.stringify(remaining))

  const couponsKey = 'kurio:mock-coupons:v1'
  const coupons = JSON.parse(window.localStorage.getItem(couponsKey) ?? '{}') as Record<string, string>
  if (coupons[cartKey] === order.coupon) {
    delete coupons[cartKey]
    window.localStorage.setItem(couponsKey, JSON.stringify(coupons))
  }
}
