import { expect, test } from '@playwright/test'

test('home first viewport matches the visual baseline', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Descubra NFTs' })).toBeVisible()
  await expect(page.locator('.nft-grid img').first()).toHaveJSProperty('complete', true)
  await page.evaluate(async () => { await document.fonts.ready })
  await expect(page).toHaveScreenshot('home-first-viewport.png')
})
