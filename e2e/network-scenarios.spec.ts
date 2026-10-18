import { expect, test } from '@playwright/test'
import { catalogResults } from './support/selectors'

test('direct detail navigation shows an accessible route skeleton while its lazy page is loading', async ({ page }, info) => {
  test.skip(info.project.name.includes('mobile'), 'The shared desktop footer is used for this layout-shift check.')
  let releaseModule!: () => void
  const moduleGate = new Promise<void>((resolve) => { releaseModule = resolve })
  await page.route('**/src/features/catalog/pages/NftDetailPage.tsx*', async (route) => {
    await moduleGate
    await route.continue()
  })

  try {
    await page.goto('/nft/orbital-01', { waitUntil: 'domcontentloaded' })
    const main = page.getByRole('main')
    await expect(main).toHaveAttribute('aria-busy', 'true')
    await expect(main.locator('[data-slot="skeleton"]')).toBeVisible()
    const mainHeight = await main.evaluate((element) => element.getBoundingClientRect().height)
    expect(mainHeight).toBeGreaterThan(500)

    releaseModule()
    await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible()
    await expect(main).not.toHaveAttribute('aria-busy', 'true')
  } finally {
    releaseModule()
  }
})

test('catalog preserves skeleton geometry during a simulated slow response', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'slow-catalog'))
  await page.goto('/')
  const results = catalogResults(page)
  await expect(results).toHaveAttribute('aria-busy', 'true')
  const loading = results.getByRole('status', { name: 'Carregando catálogo' })
  await expect(loading.locator('img')).toHaveCount(4)
  await expect(results.getByRole('article')).toHaveCount(9, { timeout: 10_000 })
  await expect(results).toHaveAttribute('aria-busy', 'false')
})

test('NFT detail reserves the related-collection region while data loads', async ({ page }, info) => {
  test.skip(info.project.name.includes('mobile'), 'The footer position is only measurable in the desktop layout.')
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'slow-related-catalog'))
  await page.goto('/nft/orbital-01')
  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible({ timeout: 10_000 })

  const related = page.getByRole('region', { name: 'Mais desta coleção' })
  const relatedLoading = related.locator('[aria-busy="true"]')
  await expect(relatedLoading).toBeVisible()
  await expect(relatedLoading.locator('[data-slot="skeleton"]')).toHaveCount(5)
  await page.evaluate(() => document.fonts.ready)
  const footer = page.getByRole('contentinfo')
  const footerTopWhileLoading = await footer.evaluate((element) => element.getBoundingClientRect().top)

  await expect(related.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 10_000 })
  await expect(related.getByRole('article')).toHaveCount(5)
  const footerTopAfterLoad = await footer.evaluate((element) => element.getBoundingClientRect().top)
  expect(Math.abs(footerTopAfterLoad - footerTopWhileLoading), `Footer moved from ${footerTopWhileLoading}px to ${footerTopAfterLoad}px`).toBeLessThanOrEqual(4)
})

test('NFT detail reserves page space before its request resolves', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'slow-detail'))
  await page.goto('/nft/orbital-01')
  const main = page.getByRole('main')
  await expect(main).toHaveAttribute('aria-busy', 'true')
  await expect(main.locator('[data-slot="skeleton"]')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const footer = page.getByRole('contentinfo')
  const footerTopWhileLoading = await footer.evaluate((element) => element.getBoundingClientRect().top)
  const skeletonHeight = await main.evaluate((element) => element.getBoundingClientRect().height)

  await expect(page.getByRole('heading', { name: 'Orbital Bloom #01' })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('region', { name: 'Mais desta coleção' }).getByRole('article')).toHaveCount(5)
  const footerTopAfterLoad = await footer.evaluate((element) => element.getBoundingClientRect().top)
  const contentHeight = await main.evaluate((element) => element.getBoundingClientRect().height)
  expect(skeletonHeight).toBeGreaterThan(1200)
  expect(Math.abs(footerTopAfterLoad - footerTopWhileLoading), `Footer moved from ${footerTopWhileLoading}px to ${footerTopAfterLoad}px`).toBeLessThanOrEqual(12)
  expect(Math.abs(contentHeight - skeletonHeight)).toBeLessThanOrEqual(12)
})

test('catalog exposes a 503 error and recovers after retry', async ({ page }) => {
  const catalogStatuses: number[] = []
  page.on('response', (response) => {
    if (response.url().includes('/api/nfts')) catalogStatuses.push(response.status())
  })
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'catalog-503'))
  await page.goto('/')
  const results = catalogResults(page)
  const error = results.getByRole('alert')
  await expect(error.getByRole('heading', { name: 'Não foi possível carregar as obras' })).toBeVisible({ timeout: 10_000 })
  expect(catalogStatuses.filter((status) => status === 503).length).toBeGreaterThanOrEqual(1)

  await page.evaluate(() => localStorage.setItem('kurio:mock-scenario', 'default'))
  await error.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(results.getByRole('article')).toHaveCount(9, { timeout: 10_000 })
})

test('catalog recovers after a simulated connection failure', async ({ page }) => {
  const failedRequests: string[] = []
  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/nfts')) failedRequests.push(request.url())
  })
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'catalog-network-error'))
  await page.goto('/')
  const results = catalogResults(page)
  const error = results.getByRole('alert')
  await expect(error.getByRole('heading', { name: 'Não foi possível carregar as obras' })).toBeVisible({ timeout: 10_000 })
  expect(failedRequests.length).toBeGreaterThanOrEqual(1)

  await page.evaluate(() => localStorage.setItem('kurio:mock-scenario', 'default'))
  await error.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(results.getByRole('article')).toHaveCount(9, { timeout: 10_000 })
})

test('a slower obsolete search cannot replace the latest catalog results', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'variable-catalog-latency'))
  await page.goto('/?q=Blue%20Hour')
  await page.waitForTimeout(100)
  const search = page.getByRole('textbox', { name: 'Buscar NFTs' })
  await search.evaluate((element: HTMLInputElement) => element.focus())
  await expect(search).toBeVisible()
  await search.fill('Orbital')
  await search.press('Enter')
  await expect(page).toHaveURL(/q=Orbital/)
  await expect(page.getByRole('link', { name: /Orbital Bloom #01,/ })).toBeVisible({ timeout: 10_000 })
  await page.waitForTimeout(800)
  await expect(page.getByRole('link', { name: /Blue Hour #03,/ })).toHaveCount(0)
})
