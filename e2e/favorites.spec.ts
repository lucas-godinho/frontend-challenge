import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page, email = 'ana@kurio.test') {
  await page.goto('/login?returnTo=%2F')
  await page.getByLabel('E-mail').fill(email)
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/(?:\?.*)?$/)
}

function artworkFavorite(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: /Orbital Bloom #01/ })
}

test('favorites persist for their owner and are not shared between accounts', async ({ page }) => {
  await login(page)
  const favorite = artworkFavorite(page)
  await favorite.click()
  await expect(artworkFavorite(page)).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(artworkFavorite(page)).toHaveAttribute('aria-pressed', 'true')

  const storedFavorites = await page.evaluate(() => ({
    owner: localStorage.getItem('kurio:mock-favorites:v1:collector-ana'),
    global: localStorage.getItem('kurio:favorites:v1'),
  }))
  expect(JSON.parse(storedFavorites.owner ?? '[]')).toContain('orbital-01')
  expect(storedFavorites.global).toBeNull()

  await page.goto('/profile')
  await page.getByRole('complementary', { name: 'Navegação do perfil' }).getByRole('button', { name: 'Sair' }).click()
  await page.goto('/login?returnTo=%2F')
  await page.getByLabel('E-mail').fill('rafael@kurio.test')
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/(?:\?.*)?$/)
  await expect(artworkFavorite(page)).toHaveAttribute('aria-pressed', 'false')
  await page.goto('/favorites')
  await expect(page.getByRole('heading', { name: 'Sua lista está vazia' })).toBeVisible()
})

test('legacy global favorites are not exposed and a failed save rolls back optimistic state', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('kurio:favorites:v1', JSON.stringify(['orbital-01']))
    localStorage.setItem('kurio:mock-scenario', 'favorites-fail-next')
  })
  await login(page)
  await expect(artworkFavorite(page)).toHaveAttribute('aria-pressed', 'false')
  await artworkFavorite(page).click()
  await expect(artworkFavorite(page)).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio:mock-favorites:v1:collector-ana'))).toBeNull()
})
