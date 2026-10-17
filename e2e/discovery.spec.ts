import { expect, test } from '@playwright/test'

test('discovers the NFT catalog and filters by search', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Descubra NFTs' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Orbital Bloom #01,/ })).toBeVisible()
  await page.goto('/?q=Blue%20Hour')
  await expect(page.getByRole('link', { name: /Blue Hour #03,/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Quiet Shape/ })).toHaveCount(0)
})
