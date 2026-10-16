import { expect, test } from '@playwright/test'

test('discovers the NFT catalog and filters by search', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Descubra NFTs' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Orbital Bloom/ })).toBeVisible()
  await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Blue Hour')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByRole('link', { name: /Blue Hour/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Quiet Shape/ })).toHaveCount(0)
})
