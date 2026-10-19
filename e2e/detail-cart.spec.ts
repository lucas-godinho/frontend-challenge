import { expect, test } from '@playwright/test'
import { cartItem, cartQuantity, detailFeedback } from './support/selectors'

test('direct NFT detail access supports quantity limits and adds the selected amount to cart', async ({ page }) => {
  await page.goto('/nft/orbital-01')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('8 unidades', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
  await expect(page.locator('main#main output').first()).toHaveText('1')
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(page.locator('main#main output').first()).toHaveText('2')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(detailFeedback(page, '2 unidades adicionadas')).toContainText('2 unidades adicionadas')
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Carrinho', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
  await expect(cartItem(page, 'Orbital Bloom #01').getByText('1.68 ETH', { exact: true })).toBeVisible()
})

test('cart quantity is optimistic, persists after refresh, and item removal empties the cart', async ({ page }) => {
  await page.goto('/nft/blue-hour-03')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(detailFeedback(page, '1 unidade adicionada')).toContainText('1 unidade adicionada')
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Blue Hour #03' })).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar quantidade de Blue Hour #03' }).click()
  await expect(cartQuantity(page, 'Blue Hour #03')).toHaveText('2')
  await expect(cartItem(page, 'Blue Hour #03').getByText('2.40 ETH', { exact: true })).toBeVisible()
  await page.reload()
  await expect(cartQuantity(page, 'Blue Hour #03')).toHaveText('2')
  await page.getByRole('button', { name: 'Remover Blue Hour #03 do carrinho' }).click()
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
})

test('unknown NFT identifier shows a useful not found state', async ({ page }) => {
  await page.goto('/nft/does-not-exist')
  await expect(page.getByRole('heading', { name: 'Este NFT não está disponível.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voltar ao catálogo' })).toBeVisible()
})
