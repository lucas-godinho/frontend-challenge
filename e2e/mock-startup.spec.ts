import { expect, test } from '@playwright/test'

test('renders the route while MSW is loading and waits before sending REST requests', async ({ page }) => {
  let mocksModuleRequested = false
  let catalogResponseReceived = false
  let releaseMocks: () => void = () => undefined
  const mocksGate = new Promise<void>((resolve) => { releaseMocks = resolve })
  page.on('response', (response) => {
    if (response.url().includes('/api/nfts')) catalogResponseReceived = true
  })
  await page.route('**/src/mocks/browser.ts*', async (route) => {
    mocksModuleRequested = true
    await mocksGate
    await route.continue()
  })

  const catalogResponse = page.waitForResponse((response) => response.url().includes('/api/nfts'))
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('region', { name: 'Descubra NFTs' })).toBeVisible()
    await expect.poll(() => mocksModuleRequested).toBe(true)
    expect(catalogResponseReceived).toBe(false)
    releaseMocks()
    expect((await catalogResponse).status()).toBe(200)
  } finally {
    releaseMocks()
  }
})
