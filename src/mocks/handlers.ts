import { delay, http, HttpResponse } from 'msw'
import { catalogFixture } from './fixtures'
import type { CatalogQuery, CollectorProfile, CollectorWallet, WalletConnection } from '@/types/marketplace'
import { queryCatalog } from './catalog'
import { removePurchasedItems } from './order-cart'

const mockUsersKey = 'kurio:mock-users:v1'
const mockSessionKey = 'kurio:mock-session:v1'
const mockProfilesKey = 'kurio:mock-profiles:v1'
const mockWalletsKey = 'kurio:mock-wallets:v1'
const mockConnectionsKey = 'kurio:mock-wallet-connections:v1'
const mockCouponsKey = 'kurio:mock-coupons:v1'
const mockOrdersKey = 'kurio:mock-orders:v1'
const mockFavoritesKey = 'kurio:mock-favorites:v1'
type MockUser = { id: string; name: string; email: string; passwordDigest: string }
const seedUsers: MockUser[] = [
  { id: 'collector-ana', name: 'Ana Colecionadora', email: 'ana@kurio.test', passwordDigest: '5967c16c2022d4e40c36c348638237f3846e004c5f74dcde8aa0373f383aa8d4' },
  { id: 'collector-rafael', name: 'Rafael Mendes', email: 'rafael@kurio.test', passwordDigest: '5967c16c2022d4e40c36c348638237f3846e004c5f74dcde8aa0373f383aa8d4' },
]
async function passwordDigest(_email: string, password: string) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readUsers(): MockUser[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(mockUsersKey) ?? '[]')
    const users = new Map(seedUsers.map((user) => [user.id, user]))
    if (Array.isArray(saved)) for (const user of saved as MockUser[]) users.set(user.id, user)
    return [...users.values()]
  } catch {
    return seedUsers
  }
}

function writeUser(user: MockUser) {
  const saved = JSON.parse(window.localStorage.getItem(mockUsersKey) ?? '[]') as MockUser[]
  window.localStorage.setItem(mockUsersKey, JSON.stringify([...saved.filter((item) => item.id !== user.id), user]))
}

function scopedStorageKey(base: string) {
  return `${base}:${readSessionUser()?.id ?? 'guest'}`
}

function readProfile(): CollectorProfile | null {
  const user = readSessionUser()
  if (!user) return null
  const profiles = JSON.parse(window.localStorage.getItem(mockProfilesKey) ?? '{}') as Record<string, CollectorProfile>
  return profiles[user.id] ?? { displayName: user.name, username: user.email.split('@')[0] ?? '', email: user.email, walletAlias: '', ensName: '' }
}

function writeProfile(profile: CollectorProfile) {
  const user = readSessionUser()
  if (!user) return
  const profiles = JSON.parse(window.localStorage.getItem(mockProfilesKey) ?? '{}') as Record<string, CollectorProfile>
  profiles[user.id] = profile
  window.localStorage.setItem(mockProfilesKey, JSON.stringify(profiles))
  writeUser({ ...user, name: profile.displayName, email: profile.email })
}

function readWallets(): CollectorWallet[] {
  const wallets = JSON.parse(window.localStorage.getItem(scopedStorageKey(mockWalletsKey)) ?? 'null') as CollectorWallet[] | null
  return wallets ?? []
}

function saveWallets(wallets: CollectorWallet[]) {
  window.localStorage.setItem(scopedStorageKey(mockWalletsKey), JSON.stringify(wallets))
}

function readFavorites() {
  const user = readSessionUser()
  if (!user) return null
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(`${mockFavoritesKey}:${user.id}`) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function saveFavorites(ids: string[]) {
  const user = readSessionUser()
  if (user) window.localStorage.setItem(`${mockFavoritesKey}:${user.id}`, JSON.stringify([...new Set(ids)]))
}

function readSessionUser() {
  try {
    const session = JSON.parse(window.localStorage.getItem(mockSessionKey) ?? 'null') as { userId?: string; expiresAt?: string } | null
    if (!session?.userId || !session.expiresAt || Date.parse(session.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(mockSessionKey)
      return null
    }
    return readUsers().find((user) => user.id === session.userId) ?? null
  } catch {
    return null
  }
}

function createSession(user: MockUser) {
  let currentUserId: string | undefined
  try {
    const currentSession = JSON.parse(window.localStorage.getItem(mockSessionKey) ?? 'null') as { userId?: string } | null
    currentUserId = currentSession?.userId
  } catch {
    currentUserId = undefined
  }
  if (!currentUserId || !readSessionUser()) mergeGuestCart(user.id)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  const sessionId = `mock-session-${user.id}`
  window.localStorage.setItem(mockSessionKey, JSON.stringify({ userId: user.id, sessionId, expiresAt }))
  return { user: { id: user.id, name: user.name, email: user.email }, sessionId, expiresAt }
}

const authError = (code: string, message: string, status: number, fields?: Record<string, string>) =>
  HttpResponse.json({ code, message, fields }, { status })

function currentMockScenario() {
  return window.localStorage.getItem('kurio:mock-scenario') ?? 'default'
}

function triggerCheckoutScenario(scenario: string) {
  const marker = `kurio:mock-checkout-scenario-used:${scenario}`
  if (window.localStorage.getItem(marker)) return
  const nft = catalogFixture.find((item) => item.id === 'orbital-01')
  if (!nft) return

  if (scenario === 'checkout-price-change-once') {
    Object.assign(nft, { priceEth: '0.89', version: nft.version + 1 })
  } else if (scenario === 'checkout-sold-out-once') {
    Object.assign(nft, { available: 0, version: nft.version + 1 })
  } else if (scenario === 'checkout-coupon-expired-once') {
    saveCoupon()
  } else {
    return
  }
  window.localStorage.setItem(marker, 'true')
}

const guestCartStorageKey = 'kurio:mock-cart:v1'
type StoredCartItem = { nftId: string; quantity: number }

function getCartStorageKey() {
  const user = readSessionUser()
  return user ? `kurio:mock-cart:user:${user.id}` : guestCartStorageKey
}

function readCart(storageKey = getCartStorageKey()): StoredCartItem[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is StoredCartItem =>
      typeof item?.nftId === 'string' && Number.isInteger(item.quantity) && item.quantity > 0,
    ) : []
  } catch {
    return []
  }
}

function saveCart(items: StoredCartItem[], storageKey = getCartStorageKey()) {
  window.localStorage.setItem(storageKey, JSON.stringify(items))
}

function currentCoupon() {
  const coupons = JSON.parse(window.localStorage.getItem(mockCouponsKey) ?? '{}') as Record<string, string>
  return coupons[getCartStorageKey()]
}

function saveCoupon(code?: string) {
  const coupons = JSON.parse(window.localStorage.getItem(mockCouponsKey) ?? '{}') as Record<string, string>
  if (code) coupons[getCartStorageKey()] = code
  else delete coupons[getCartStorageKey()]
  window.localStorage.setItem(mockCouponsKey, JSON.stringify(coupons))
}

function mergeGuestCart(userId: string) {
  const guestItems = readCart(guestCartStorageKey)
  if (guestItems.length === 0) return
  const userCartKey = `kurio:mock-cart:user:${userId}`
  const merged = [...readCart(userCartKey)]
  for (const guestItem of guestItems) {
    const existing = merged.find((item) => item.nftId === guestItem.nftId)
    const nft = catalogFixture.find((item) => item.id === guestItem.nftId)
    if (!nft) continue
    const quantity = Math.min(nft.available, (existing?.quantity ?? 0) + guestItem.quantity)
    if (existing) existing.quantity = quantity
    else merged.push({ ...guestItem, quantity })
  }
  saveCart(merged, userCartKey)
  window.localStorage.removeItem(guestCartStorageKey)
}

function buildCart(items = readCart()) {
  const cartItems = items.flatMap((item) => {
    const nft = catalogFixture.find((candidate) => candidate.id === item.nftId)
    return nft ? [{ nft, quantity: item.quantity }] : []
  })
  const subtotal = cartItems.reduce((sum, item) => {
    const [whole = '0', fraction = ''] = item.nft.priceEth.split('.')
    const wei = BigInt(`${whole}${fraction.padEnd(18, '0')}`)
    return sum + wei * BigInt(item.quantity)
  }, 0n)
  const format = (wei: bigint) => {
    const whole = wei / 10n ** 18n
    const fraction = (wei % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '').padEnd(2, '0')
    return `${whole}.${fraction}`
  }
  const coupon = currentCoupon()
  const discount = coupon === 'KURIO10' ? subtotal / 10n : coupon === 'LAUNCH' ? (subtotal < 8n * 10n ** 16n ? subtotal : 8n * 10n ** 16n) : 0n
  const networkFee = cartItems.length ? 16n * 10n ** 15n : 0n
  return { items: cartItems, subtotalEth: format(subtotal), itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0), discountEth: format(discount), networkFeeEth: format(networkFee), totalEth: format(subtotal - discount + networkFee), coupon }
}

function cartError(code: string, message: string, status: number) {
  return HttpResponse.json({ code, message }, { status })
}

export const handlers = [
  http.get('/api/session', () => {
    const user = readSessionUser()
    if (!user) return HttpResponse.json(null)
    const stored = JSON.parse(window.localStorage.getItem(mockSessionKey)!) as { expiresAt: string; sessionId: string }
    return HttpResponse.json({ user: { id: user.id, name: user.name, email: user.email }, sessionId: stored.sessionId, expiresAt: stored.expiresAt })
  }),
  http.post('/api/session', async ({ request }) => {
    const body = await request.json() as { email?: unknown; password?: unknown }
    if (typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || !body.password) {
      return authError('VALIDATION_ERROR', 'Informe seu e-mail e senha.', 400)
    }
    const email = body.email.trim().toLocaleLowerCase()
    const digest = await passwordDigest(email, body.password)
    const user = readUsers().find((candidate) => candidate.email === email && candidate.passwordDigest === digest)
    if (!user) return authError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos.', 401)
    return HttpResponse.json(createSession(user))
  }),
  http.delete('/api/session', () => {
    window.localStorage.removeItem(mockSessionKey)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('/api/accounts', async ({ request }) => {
    const body = await request.json() as { name?: unknown; email?: unknown; password?: unknown }
    const fields: Record<string, string> = {}
    if (typeof body.name !== 'string' || body.name.trim().length < 2) fields.name = 'Informe seu nome completo.'
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) fields.email = 'Informe um e-mail válido.'
    if (typeof body.password !== 'string' || body.password.length < 8) fields.password = 'Use uma senha com pelo menos 8 caracteres.'
    if (Object.keys(fields).length) return authError('VALIDATION_ERROR', 'Revise os campos do cadastro.', 400, fields)
    const email = String(body.email).trim().toLocaleLowerCase()
    if (readUsers().some((user) => user.email === email)) return authError('EMAIL_CONFLICT', 'Este e-mail já possui uma conta.', 409, { email: 'Tente entrar ou use outro e-mail.' })
    const user: MockUser = { id: `collector-${crypto.randomUUID()}`, name: String(body.name).trim(), email, passwordDigest: await passwordDigest(email, String(body.password)) }
    const registered = JSON.parse(window.localStorage.getItem(mockUsersKey) ?? '[]') as MockUser[]
    window.localStorage.setItem(mockUsersKey, JSON.stringify([...registered, user]))
    return HttpResponse.json(createSession(user), { status: 201 })
  }),
  http.get('/api/profile', () => {
    const profile = readProfile()
    return profile ? HttpResponse.json(profile) : authError('UNAUTHORIZED', 'Entre para acessar seu perfil.', 401)
  }),
  http.put('/api/profile', async ({ request }) => {
    const currentUser = readSessionUser()
    if (!currentUser) return authError('UNAUTHORIZED', 'Entre para editar seu perfil.', 401)
    const body = await request.json() as Partial<CollectorProfile>
    const fields: Record<string, string> = {}
    if (typeof body.displayName !== 'string' || body.displayName.trim().length < 2) fields.displayName = 'Informe seu nome de exibição.'
    if (typeof body.username !== 'string' || body.username.trim().length < 2) fields.username = 'Informe um nome de usuário.'
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) fields.email = 'Informe um e-mail válido.'
    if (Object.keys(fields).length) return authError('VALIDATION_ERROR', 'Revise os campos do perfil.', 400, fields)
    const profile: CollectorProfile = { displayName: body.displayName!.trim(), username: body.username!.trim(), email: body.email!.trim().toLowerCase(), walletAlias: String(body.walletAlias ?? ''), ensName: String(body.ensName ?? ''), avatarUrl: body.avatarUrl }
    if (readUsers().some((user) => user.id !== currentUser.id && user.email === profile.email)) return authError('EMAIL_CONFLICT', 'Este e-mail já está vinculado a outra conta.', 409, { email: 'Use outro e-mail.' })
    writeProfile(profile)
    return HttpResponse.json(profile)
  }),
  http.put('/api/profile/password', async ({ request }) => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para alterar sua senha.', 401)
    const body = await request.json() as { currentPassword?: unknown; password?: unknown }
    if (typeof body.currentPassword !== 'string' || typeof body.password !== 'string' || body.password.length < 8) return authError('VALIDATION_ERROR', 'Informe a senha atual e uma nova senha com pelo menos 8 caracteres.', 400)
    if (user.passwordDigest !== await passwordDigest(user.email, body.currentPassword)) return authError('INVALID_PASSWORD', 'A senha atual não confere.', 400, { currentPassword: 'Confira sua senha atual.' })
    writeUser({ ...user, passwordDigest: await passwordDigest(user.email, body.password) })
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/favorites', () => {
    const favorites = readFavorites()
    return favorites ? HttpResponse.json({ ids: favorites }) : authError('UNAUTHORIZED', 'Entre para acessar seus favoritos.', 401)
  }),
  http.post('/api/favorites', async ({ request }) => {
    if (!readSessionUser()) return authError('UNAUTHORIZED', 'Entre para salvar favoritos.', 401)
    if (currentMockScenario() === 'favorites-fail-next') {
      window.localStorage.setItem('kurio:mock-scenario', 'default')
      return authError('MOCK_FAILURE', 'Não foi possível salvar o favorito.', 503)
    }
    const body = await request.json() as { nftId?: unknown }
    if (typeof body.nftId !== 'string' || !catalogFixture.some((nft) => nft.id === body.nftId)) return authError('NOT_FOUND', 'Obra não encontrada.', 404)
    const ids = readFavorites() ?? []
    saveFavorites([...ids, body.nftId])
    return HttpResponse.json({ ids: readFavorites() })
  }),
  http.delete('/api/favorites/:nftId', ({ params }) => {
    if (!readSessionUser()) return authError('UNAUTHORIZED', 'Entre para remover favoritos.', 401)
    const ids = readFavorites() ?? []
    if (!ids.includes(String(params.nftId))) return authError('NOT_FOUND', 'Favorito não encontrado.', 404)
    saveFavorites(ids.filter((id) => id !== params.nftId))
    return HttpResponse.json({ ids: readFavorites() })
  }),
  http.get('/api/wallets', () => readSessionUser() ? HttpResponse.json(readWallets()) : authError('UNAUTHORIZED', 'Entre para acessar suas carteiras.', 401)),
  http.post('/api/wallets', async ({ request }) => {
    if (!readSessionUser()) return authError('UNAUTHORIZED', 'Entre para gerenciar suas carteiras.', 401)
    const body = await request.json() as Partial<CollectorWallet>
    const fields: Record<string, string> = {}
    if (!body.displayName?.trim()) fields.displayName = 'Informe o nome de exibição.'
    if (!body.alias?.trim()) fields.alias = 'Informe um apelido.'
    if (!body.address?.trim() || body.address.trim().length < 8) fields.address = 'Informe um endereço válido.'
    if (!body.network || !['Ethereum', 'Polygon', 'Solana'].includes(body.network)) fields.network = 'Selecione uma rede.'
    if (!body.type || !['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(body.type)) fields.type = 'Selecione uma carteira.'
    if (Object.keys(fields).length) return authError('VALIDATION_ERROR', 'Revise os dados da carteira.', 400, fields)
    const current = readWallets()
    if (body.id && !current.some((wallet) => wallet.id === body.id)) {
      return authError('FORBIDDEN', 'Você não pode editar esta carteira.', 403)
    }
    const wallet: CollectorWallet = { id: body.id ?? crypto.randomUUID(), displayName: body.displayName!.trim(), alias: body.alias!.trim(), address: body.address!.trim(), network: body.network!, type: body.type!, ensName: body.ensName, isPrimary: Boolean(body.isPrimary) }
    const updated = current.some((item) => item.id === wallet.id) ? current.map((item) => item.id === wallet.id ? wallet : { ...item, isPrimary: wallet.isPrimary ? false : item.isPrimary }) : [...current.map((item) => ({ ...item, isPrimary: wallet.isPrimary ? false : item.isPrimary })), wallet]
    saveWallets(updated)
    return HttpResponse.json(wallet, { status: current.some((item) => item.id === wallet.id) ? 200 : 201 })
  }),
  http.delete('/api/wallets/:id', ({ params }) => {
    if (!readSessionUser()) return authError('UNAUTHORIZED', 'Entre para gerenciar suas carteiras.', 401)
    const current = readWallets()
    const updated = current.filter((wallet) => wallet.id !== params.id)
    if (updated.length === current.length) return authError('NOT_FOUND', 'Carteira não encontrada.', 404)
    if (current.find((wallet) => wallet.id === params.id)?.isPrimary && updated[0]) updated[0] = { ...updated[0], isPrimary: true }
    saveWallets(updated)
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/wallet-connection', () => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para consultar sua carteira conectada.', 401)
    const connections = JSON.parse(window.localStorage.getItem(mockConnectionsKey) ?? '{}') as Record<string, WalletConnection>
    return HttpResponse.json(connections[user.id] ?? null)
  }),
  http.post('/api/wallet-connection', async ({ request }) => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para conectar sua carteira.', 401)
    const body = await request.json() as { type?: unknown; network?: unknown }
    if (!['MetaMask', 'WalletConnect', 'Coinbase Wallet'].includes(String(body.type)) || !['Ethereum', 'Polygon', 'Solana'].includes(String(body.network))) {
      return authError('VALIDATION_ERROR', 'Selecione uma carteira e uma rede válidas.', 400)
    }
    if (currentMockScenario() === 'wallet-connect-rejected') {
      return authError('WALLET_CONNECTION_REJECTED', 'A conexão foi recusada na carteira. Tente novamente quando estiver pronto.', 409)
    }
    const connected: WalletConnection = {
      connected: true,
      address: `0x${(crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')).slice(0, 40)}`,
      network: body.network as CollectorWallet['network'],
      type: body.type as CollectorWallet['type'],
    }
    const connections = JSON.parse(window.localStorage.getItem(mockConnectionsKey) ?? '{}') as Record<string, WalletConnection>
    connections[user.id] = connected
    window.localStorage.setItem(mockConnectionsKey, JSON.stringify(connections))
    return HttpResponse.json(connected)
  }),
  http.delete('/api/wallet-connection', () => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para desconectar sua carteira.', 401)
    const connections = JSON.parse(window.localStorage.getItem(mockConnectionsKey) ?? '{}') as Record<string, WalletConnection>
    delete connections[user.id]
    window.localStorage.setItem(mockConnectionsKey, JSON.stringify(connections))
    return new HttpResponse(null, { status: 204 })
  }),
  http.get('/api/nfts', async ({ request }) => {
    const url = new URL(request.url)
    const scenario = currentMockScenario()
    if (scenario === 'slow-catalog') await delay(900)
    if (scenario === 'slow-related-catalog') await delay(1800)
    if (scenario === 'variable-catalog-latency') {
      await delay((url.searchParams.get('q') ?? '').toLowerCase().includes('blue') ? 700 : 60)
    }
    if (scenario === 'catalog-503') {
      return cartError('CATALOG_UNAVAILABLE', 'O catálogo está temporariamente indisponível.', 503)
    }
    if (scenario === 'catalog-network-error') {
      return HttpResponse.error()
    }
    const q = (url.searchParams.get('q') ?? '').toLocaleLowerCase()
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort') as CatalogQuery['sort']
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const price = (key: string) => {
      const value = url.searchParams.get(key)
      return value !== null && Number.isFinite(Number(value)) ? Number(value) : undefined
    }
    return HttpResponse.json(queryCatalog({ q, category: category ?? undefined, sort, page,
      minPrice: price('minPrice'), maxPrice: price('maxPrice'), network: url.searchParams.get('network') ?? undefined,
    }))
  }),
  http.get('/api/nfts/:id', async ({ params }) => {
    if (currentMockScenario() === 'slow-catalog') await delay(900)
    if (currentMockScenario() === 'slow-detail') await delay(1800)
    const nft = catalogFixture.find((item) => item.id === params.id)
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ code: 'NOT_FOUND', message: 'NFT não encontrado.' }, { status: 404 })
  }),
  http.get('/api/cart', async () => {
    if (currentMockScenario() === 'slow-catalog') await delay(900)
    return HttpResponse.json(buildCart())
  }),
  http.post('/api/cart/items', async ({ request }) => {
    const body = await request.json() as { nftId?: unknown; quantity?: unknown }
    if (typeof body.nftId !== 'string' || !Number.isInteger(body.quantity) || Number(body.quantity) < 1) {
      return cartError('VALIDATION_ERROR', 'Informe uma obra e uma quantidade válida.', 400)
    }
    const nft = catalogFixture.find((item) => item.id === body.nftId)
    if (!nft) return cartError('NOT_FOUND', 'NFT não encontrado.', 404)
    const current = readCart()
    const existing = current.find((item) => item.nftId === nft.id)
    const nextQuantity = (existing?.quantity ?? 0) + Number(body.quantity)
    if (nextQuantity > nft.available) return cartError('INSUFFICIENT_INVENTORY', 'Quantidade acima da disponibilidade desta edição.', 409)
    saveCart(existing
      ? current.map((item) => item.nftId === nft.id ? { ...item, quantity: nextQuantity } : item)
      : [...current, { nftId: nft.id, quantity: Number(body.quantity) }])
    return HttpResponse.json(buildCart(), { status: 201 })
  }),
  http.put('/api/cart/items/:id', async ({ params, request }) => {
    const body = await request.json() as { quantity?: unknown }
    if (!Number.isInteger(body.quantity) || Number(body.quantity) < 1) return cartError('VALIDATION_ERROR', 'A quantidade deve ser maior que zero.', 400)
    const current = readCart()
    const item = current.find((candidate) => candidate.nftId === params.id)
    const nft = catalogFixture.find((candidate) => candidate.id === params.id)
    if (!item || !nft) return cartError('NOT_FOUND', 'Este item não está no carrinho.', 404)
    if (Number(body.quantity) > nft.available) return cartError('INSUFFICIENT_INVENTORY', 'Quantidade acima da disponibilidade desta edição.', 409)
    saveCart(current.map((candidate) => candidate.nftId === params.id ? { ...candidate, quantity: Number(body.quantity) } : candidate))
    return HttpResponse.json(buildCart())
  }),
  http.delete('/api/cart/items/:id', ({ params }) => {
    const current = readCart()
    if (!current.some((item) => item.nftId === params.id)) return cartError('NOT_FOUND', 'Este item não está no carrinho.', 404)
    saveCart(current.filter((item) => item.nftId !== params.id))
    return HttpResponse.json(buildCart())
  }),
  http.post('/api/cart/coupon', async ({ request }) => {
    const body = await request.json() as { code?: unknown }
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    if (!['KURIO10', 'LAUNCH'].includes(code)) return cartError('INVALID_COUPON', 'Código promocional inválido ou expirado.', 422)
    saveCoupon(code)
    return HttpResponse.json(buildCart())
  }),
  http.delete('/api/cart/coupon', () => {
    saveCoupon()
    return HttpResponse.json(buildCart())
  }),
  http.get('/api/orders/:id', ({ params }) => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para acessar seus pedidos.', 401)
    const orders = JSON.parse(window.localStorage.getItem(`${mockOrdersKey}:${user.id}`) ?? '[]') as Array<{ id: string; order: import('@/types/marketplace').OrderResponse }>
    const found = orders.find((item) => item.id === params.id)
    return found ? HttpResponse.json(found.order) : authError('NOT_FOUND', 'Pedido não encontrado.', 404)
  }),
  http.post('/api/orders', async ({ request }) => {
    const user = readSessionUser()
    if (!user) return authError('UNAUTHORIZED', 'Entre para finalizar a compra.', 401)
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) return authError('IDEMPOTENCY_KEY_REQUIRED', 'A compra precisa de uma chave de segurança.', 400)
    const body = await request.json() as { wallet?: CollectorWallet; buyer?: { displayName?: string; email?: string; address?: string; network?: string }; quote?: { items?: Array<{ nftId: string; quantity: number; priceEth: string; version: number }>; coupon?: string; subtotalEth?: string; discountEth?: string; networkFeeEth?: string; totalEth?: string } }
    const storedKey = `${mockOrdersKey}:${user.id}`
    const orders = JSON.parse(window.localStorage.getItem(storedKey) ?? '[]') as Array<{ id: string; idempotencyKey: string; requestBody: string; order: import('@/types/marketplace').OrderResponse }>
    const requestBody = JSON.stringify(body)
    const existing = orders.find((item) => item.idempotencyKey === idempotencyKey)
    if (existing) return existing.requestBody === requestBody
      ? HttpResponse.json(existing.order)
      : authError('IDEMPOTENCY_CONFLICT', 'Esta tentativa de compra já foi usada com outros dados.', 409)
    triggerCheckoutScenario(currentMockScenario())
    const cart = buildCart()
    if (!cart.items.length) return cartError('EMPTY_CART', 'Adicione ao menos um NFT antes de pagar.', 409)
    if (!body.wallet?.address || !body.wallet.network) return cartError('WALLET_REQUIRED', 'Conecte uma carteira para receber seus NFTs.', 400)
    if (cart.items.some(({ nft, quantity }) => quantity > nft.available)) {
      return cartError('INVENTORY_CHANGED', 'A disponibilidade dos itens mudou. Revise o carrinho antes de continuar.', 409)
    }
    const currentQuote = {
      items: cart.items.map(({ nft, quantity }) => ({ nftId: nft.id, quantity, priceEth: nft.priceEth, version: nft.version })),
      coupon: cart.coupon,
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth ?? '0.00',
      networkFeeEth: cart.networkFeeEth ?? '0.00',
      totalEth: cart.totalEth ?? cart.subtotalEth,
    }
    if (JSON.stringify(body.quote) !== JSON.stringify(currentQuote)) {
      return cartError('QUOTE_CHANGED', 'A cotação mudou. Revise os valores antes de confirmar.', 409)
    }
    const id = `order-${crypto.randomUUID()}`
    const scenario = currentMockScenario()
    const timeoutAfterCreate = scenario === 'order-timeout-after-create' && !window.localStorage.getItem('kurio:mock-timeout-after-create-used')
    const order: import('@/types/marketplace').OrderResponse = {
      id,
      version: 1,
      transactionId: `0x${crypto.randomUUID().replaceAll('-', '')}`,
      status: scenario.startsWith('order-pending-') || scenario === 'order-duplicate-stale' || timeoutAfterCreate ? 'pending' : 'confirmed',
      createdAt: new Date().toISOString(),
      wallet: body.wallet,
      items: cart.items,
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth ?? '0.00',
      networkFeeEth: cart.networkFeeEth ?? '0.00',
      totalEth: cart.totalEth ?? cart.subtotalEth,
      coupon: cart.coupon,
    }
    orders.push({ id, idempotencyKey, requestBody, order })
    window.localStorage.setItem(storedKey, JSON.stringify(orders))
    if (timeoutAfterCreate) {
      window.localStorage.setItem('kurio:mock-timeout-after-create-used', 'true')
      return HttpResponse.error()
    }
    if (order.status === 'confirmed') {
      removePurchasedItems(user.id, order)
    }
    return HttpResponse.json(order, { status: 201 })
  }),
]

