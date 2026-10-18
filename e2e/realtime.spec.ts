import { expect, test } from '@playwright/test'
import { catalogCard, detailFeedback } from './support/selectors'

test('applies an NFT price update delivered over Socket.IO through MSW', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kurio:mock-scenario', 'nft-price-change')
  })
  await page.goto('/')

  const orbitalCard = catalogCard(page, 'Orbital Bloom #01')
  // On mobile the socket can connect before the first assertion runs, so the
  // initial render may already contain the live update.
  await expect(orbitalCard).toContainText('0.85 ETH', { timeout: 10_000 })
})

test('ignores duplicate and stale catalog versions delivered through Socket.IO', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'nft-duplicate-stale'))
  await page.goto('/')
  const orbitalCard = catalogCard(page, 'Orbital Bloom #01')
  await expect(orbitalCard).toContainText('0.85 ETH', { timeout: 10_000 })
  await page.waitForTimeout(500)
  await expect(orbitalCard).toContainText('0.85 ETH')
  await expect(orbitalCard).not.toContainText('0.41 ETH')
})

test('recovers a pending purchase to confirmed via the order.updated socket event', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    localStorage.setItem('kurio:mock-scenario', 'order-pending-confirmed')
  })
  await page.goto('/login?returnTo=%2Fcheckout')
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('link', { name: 'Perfil' })).toBeVisible()

  await page.goto('/nft/orbital-01')
  const addCartResponse = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/cart/items'))
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect((await addCartResponse).status()).toBe(201)
  await expect(detailFeedback(page, /unidade(s)? adicionada(s)?/)).toContainText(/unidade(s)? adicionada(s)?/)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await page.goto('/checkout')

  await page.getByPlaceholder('Endereço 0x da carteira').fill('0x1234567890')
  await page.getByPlaceholder('colecionador.eth').first().fill('ana-collector')
  await page.getByPlaceholder('Código promocional aplicado aqui').fill('REF-2026')
  await page.getByRole('button', { name: /Confirmar compra/ }).click()

  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compra confirmada' })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('link', { name: 'Ver no Etherscan (simulado)' })).toBeVisible()
})
