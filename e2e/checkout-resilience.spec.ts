import { expect, test } from '@playwright/test'
import { cartQuantities, cartQuantity, checkoutSummary, detailFeedback, orderReceipt } from './support/selectors'

async function prepareCheckout(page: import('@playwright/test').Page, coupon?: string) {
  await page.goto('/login?returnTo=%2Fcheckout')
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  const authenticatedLink = (page.viewportSize()?.width ?? 1440) <= 760
    ? page.getByRole('link', { name: 'Perfil' })
    : page.getByRole('link', { name: 'Ana' })
  await expect(authenticatedLink).toBeVisible({ timeout: 10_000 })
  await page.goto('/nft/orbital-01')
  const addCartResponse = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/cart/items'))
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect((await addCartResponse).status()).toBe(201)
  await expect(detailFeedback(page, /unidade(s)? adicionada(s)?/)).toContainText(/unidade(s)? adicionada(s)?/)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  if (coupon) {
    await page.getByLabel('Código promocional').fill(coupon)
    await page.getByRole('button', { name: 'Aplicar', exact: true }).click()
    await expect(page.getByText(`Cupom ${coupon} aplicado`)).toBeVisible()
  }
  await page.goto('/checkout')
  await page.getByPlaceholder('colecionador.eth').first().fill('ana-collector')
  await page.getByPlaceholder('Endereço 0x da carteira').fill('0x1234567890')
  await page.getByPlaceholder('Código promocional aplicado aqui').fill('REF-2026')
}

async function confirmPurchase(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Confirmar compra/ }).click()
}

test('a catalog update received over Socket.IO changes the checkout quote before confirmation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'nft-price-change'))
  await prepareCheckout(page)
  await expect(checkoutSummary(page).getByRole('article')).toContainText('0.85 ETH', { timeout: 10_000 })
  await expect(checkoutSummary(page).getByText('0.866 ETH', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()

  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(orderReceipt(page).getByRole('article')).toContainText('0.85 ETH')
})

test('an out-of-stock realtime update blocks checkout and keeps the cart for correction', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'nft-sold-out'))
  await prepareCheckout(page)
  await expect(checkoutSummary(page).getByRole('status')).toContainText('Esta edição ficou indisponível', { timeout: 10_000 })
  await expect(page.getByRole('button', { name: /Confirmar compra/ })).toBeDisabled()
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
})

test('revalidates the quote and requires a fresh confirmation after price changes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'checkout-price-change-once'))
  await prepareCheckout(page)

  await confirmPurchase(page)
  await expect(page.getByRole('alert')).toContainText('Preço, desconto ou taxa mudou')
  await expect(checkoutSummary(page).getByText('0.906 ETH', { exact: true }).first()).toBeVisible()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('button', { name: /Confirmar compra/ })).toBeEnabled()

  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(orderReceipt(page).getByRole('article')).toContainText('0.89 ETH')
})

test('an expired coupon refreshes the total and requires a new confirmation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'checkout-coupon-expired-once'))
  await prepareCheckout(page, 'KURIO10')
  await expect(checkoutSummary(page).getByText('0.772 ETH', { exact: true }).first()).toBeVisible()

  await confirmPurchase(page)
  await expect(page.getByRole('alert')).toContainText('Preço, desconto ou taxa mudou')
  await expect(checkoutSummary(page).getByText(/Cupom KURIO10 aplicado/)).toHaveCount(0)
  await expect(checkoutSummary(page).getByText('0.856 ETH', { exact: true }).first()).toBeVisible()
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(orderReceipt(page).getByText('0.856 ETH', { exact: true }).first()).toBeVisible()
})

test('a payment rejection keeps the cart items available for another attempt', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'order-pending-rejected'))
  await prepareCheckout(page)
  await confirmPurchase(page)

  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({ timeout: 10_000 })
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await expect(cartQuantity(page, 'Orbital Bloom #01')).toHaveText('1')
})

test('duplicate and stale order events cannot roll a confirmed payment back to pending', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'order-duplicate-stale'))
  await prepareCheckout(page)
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible({ timeout: 10_000 })
  await page.waitForTimeout(500)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toHaveCount(0)
})

test('a pending order is recovered after checkout refresh without creating another purchase', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'order-pending-confirmed'))
  await prepareCheckout(page)
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible({ timeout: 10_000 })
  const storedOrders = await page.evaluate(() => JSON.parse(localStorage.getItem('kurio:mock-orders:v1:collector-ana') ?? '[]'))
  expect(storedOrders).toHaveLength(1)
  expect(storedOrders[0].order.status).toBe('confirmed')
})

test('confirmation removes only purchased quantities and preserves additions made in another tab', async ({ page, context }) => {
  test.setTimeout(60_000)
  await page.clock.install({ time: new Date('2026-06-01T12:00:00Z') })
  await page.addInitScript(() => {
    localStorage.setItem('kurio:mock-scenario', 'order-pending-confirmed')
    localStorage.setItem('kurio:mock-order-delay-ms', '60000')
  })
  await prepareCheckout(page)
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
  const receiptURL = page.url()

  const otherTab = await context.newPage()
  for (const id of ['orbital-01', 'blue-hour-03']) {
    await otherTab.goto(`/nft/${id}`)
    const added = otherTab.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/cart/items'))
    await otherTab.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
    expect((await added).status()).toBe(201)
  }
  await otherTab.close()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(orderReceipt(page).getByRole('article')).toHaveCount(1)
  await expect(orderReceipt(page).getByRole('article')).toContainText('0.84 ETH')

  await page.goto('/cart')
  await expect(cartQuantities(page)).toHaveText(['1', '1'])
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Blue Hour #03' })).toBeVisible()
  await page.goto(receiptURL)
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible()
  await expect(orderReceipt(page).getByRole('article')).toHaveCount(1)
  await page.goto('/cart')
  await expect(cartQuantities(page)).toHaveText(['1', '1'])
})

test('a pending purchase recovers after a network interruption without creating a second order', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'order-pending-confirmed'))
  await prepareCheckout(page)
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
  await page.context().setOffline(true)
  await page.waitForTimeout(900)
  await page.context().setOffline(false)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible({ timeout: 10_000 })
  const storedOrders = await page.evaluate(() => JSON.parse(localStorage.getItem('kurio:mock-orders:v1:collector-ana') ?? '[]'))
  expect(storedOrders).toHaveLength(1)
})

test('a timeout after order creation recovers the same pending order with its idempotency key', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'order-timeout-after-create'))
  const orderRequests: Array<{ key: string | undefined; status: number }> = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/orders')) {
      orderRequests.push({ key: request.headers()['idempotency-key'], status: 0 })
    }
  })
  page.on('response', (response) => {
    if (response.request().method() === 'POST' && response.url().endsWith('/api/orders')) {
      const request = orderRequests.findLast((item) => item.status === 0)
      if (request) request.status = response.status()
    }
  })
  await prepareCheckout(page)

  await confirmPurchase(page)
  await expect(page.getByRole('alert')).toContainText('O carrinho foi preservado')
  await expect(page).toHaveURL(/\/checkout$/)
  await confirmPurchase(page)
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible({ timeout: 10_000 })

  expect(orderRequests).toHaveLength(2)
  expect(orderRequests[0]?.key).toBeTruthy()
  expect(orderRequests[1]?.key).toBe(orderRequests[0]?.key)
  expect(orderRequests[0]?.status).toBe(0)
  expect(orderRequests[1]?.status).toBe(200)
})

test('wallet connection is simulated, survives checkout refresh, and can be disconnected', async ({ page }) => {
  test.setTimeout(60_000)
  await prepareCheckout(page)
  await page.getByRole('button', { name: 'Conectar Coinbase Wallet' }).click()
  await expect(page.getByText('Coinbase Wallet conectado · Ethereum')).toBeVisible()
  const addressField = page.getByRole('textbox', { name: /Endereço da carteira/ })
  const connectedAddress = await addressField.inputValue()
  expect(connectedAddress).toMatch(/^0x[\da-f]{40}$/i)

  await page.reload()
  await expect(page.getByText('Coinbase Wallet conectado · Ethereum')).toBeVisible()
  await expect(addressField).toHaveValue(connectedAddress)
  await page.getByRole('button', { name: 'Desconectar carteira' }).click()
  await expect(page.getByText('Coinbase Wallet conectado · Ethereum')).toHaveCount(0)
  await expect(addressField).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Conectar Coinbase Wallet' })).toBeVisible()
})

test('a wallet connection refusal is announced and leaves the user able to retry', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'wallet-connect-rejected'))
  await prepareCheckout(page)
  await page.getByRole('button', { name: 'Conectar Coinbase Wallet' }).click()
  await expect(page.getByRole('alert')).toContainText('A conexão foi recusada na carteira')
  await expect(page.getByRole('button', { name: 'Conectar Coinbase Wallet' })).toBeEnabled()
  await expect(page.getByText('Coinbase Wallet conectado · Ethereum')).toHaveCount(0)
})
