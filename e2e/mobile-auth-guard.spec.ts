import { expect, test } from '@playwright/test'

test('redirects a signed-out mobile visitor to the login screen without a render loop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const runtimeErrors: string[] = []
  const consoleErrors: string[] = []
  const sessionRequests: string[] = []
  const sessionStatuses: number[] = []
  const privateOrderRequests: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('request', (request) => {
    if (request.url().includes('/api/session')) sessionRequests.push(request.url())
    if (request.url().includes('/api/orders/')) privateOrderRequests.push(request.url())
  })
  page.on('response', (response) => {
    if (response.url().includes('/api/session')) sessionStatuses.push(response.status())
  })

  for (const route of ['/profile', '/wallets', '/favorites', '/checkout', '/orders/private-order']) {
    const sessionRequestsBeforeNavigation = sessionRequests.length
    await page.goto(route)
    await expect(page).toHaveURL((url) => url.pathname === '/login' && url.searchParams.get('returnTo') === route)
    await expect(page.locator('main#main')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
    await page.waitForTimeout(300)
    expect(sessionRequests.length - sessionRequestsBeforeNavigation).toBeLessThanOrEqual(2)
  }

  expect(runtimeErrors.some((message) => message.includes('Maximum update depth exceeded'))).toBe(false)
  expect(consoleErrors).toEqual([])
  expect(sessionStatuses).toHaveLength(5)
  expect(sessionStatuses.every((status) => status === 200)).toBe(true)
  expect(privateOrderRequests).toHaveLength(0)
})
