import { expect, test } from '@playwright/test'
import { detailFeedback } from './support/selectors'

test('home first viewport matches the visual baseline', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Descubra NFTs' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Resultados do catálogo' }).getByRole('img').first()).toHaveJSProperty('complete', true)
  await page.evaluate(async () => { await document.fonts.ready })
  await expect.poll(() => page.locator('.route-transition').evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  await expect(page.getByRole('region', { name: 'Destaques da Kurio' }).getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  if ((page.viewportSize()?.width ?? 1440) <= 760) await expect(page.getByRole('textbox', { name: 'Buscar NFTs' })).toBeVisible()
  await expect(page).toHaveScreenshot('home-first-viewport.png')
})

test('NFT detail matches the desktop and mobile visual baselines', async ({ page }) => {
  await page.goto('/nft/orbital-01')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await expect(page.getByRole('img', { name: /Orbital Bloom #01/ })).toHaveJSProperty('complete', true)
  await page.evaluate(async () => { await document.fonts.ready })
  await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true })
})

test('cart matches the desktop and mobile visual baselines', async ({ page }) => {
  await page.goto('/nft/orbital-01')
  const addCartResponse = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/cart/items'))
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect((await addCartResponse).status()).toBe(201)
  await expect(detailFeedback(page, /unidade(s)? adicionada(s)?/)).toContainText(/unidade(s)? adicionada(s)?/)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await page.evaluate(async () => { await document.fonts.ready })
  await expect(page).toHaveScreenshot('cart.png', { fullPage: true })
})

test('checkout matches the desktop and mobile visual baselines', async ({ page }) => {
  await page.goto('/login?returnTo=%2Fcheckout')
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  const authenticatedLink = (page.viewportSize()?.width ?? 1440) <= 760
    ? page.getByRole('link', { name: 'Perfil' })
    : page.getByRole('link', { name: 'Ana' })
  await expect(authenticatedLink).toBeVisible()
  await page.goto('/nft/orbital-01')
  const addCartResponse = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/api/cart/items'))
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect((await addCartResponse).status()).toBe(201)
  await expect(detailFeedback(page, /unidade(s)? adicionada(s)?/)).toContainText(/unidade(s)? adicionada(s)?/)
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: 'Pagamento' })).toBeVisible()
  await page.evaluate(async () => { await document.fonts.ready })
  await expect(page).toHaveScreenshot('checkout.png', { fullPage: true })
})
