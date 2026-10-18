import { expect, test } from '@playwright/test'
import { detailFeedback } from './support/selectors'

test('primary screens have no horizontal overflow at mobile, tablet, and desktop widths', async ({ page }) => {
  test.setTimeout(120_000)
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

  const routes = ['/', '/nft/orbital-01', '/cart', '/checkout', '/profile', '/wallets']
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('main#main')).toBeVisible()
      await expect(page.locator('main#main [data-slot="skeleton"]')).toHaveCount(0, { timeout: 10_000 })
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        overflowing: [...document.querySelectorAll('body *')].map((element) => {
          const bounds = element.getBoundingClientRect()
          const ancestors: string[] = []
          for (let parent = element.parentElement; parent && ancestors.length < 4; parent = parent.parentElement) ancestors.push(`${parent.tagName.toLowerCase()}.${(parent as HTMLElement).className}`)
          return { name: `${element.tagName.toLowerCase()}.${(element as HTMLElement).className}`, right: Math.round(bounds.right), width: Math.round(bounds.width), ancestors }
        }).filter((element) => element.right > document.documentElement.clientWidth + 1).slice(0, 8),
      }))
      expect(Math.max(dimensions.document, dimensions.body), `${route} at ${width}px should not scroll horizontally; offenders: ${JSON.stringify(dimensions.overflowing)}`).toBeLessThanOrEqual(dimensions.viewport + 1)
    }
  }
})
