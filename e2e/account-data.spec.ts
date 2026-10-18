import { expect, test } from '@playwright/test'

test('a wallet ID outside the current account is forbidden and cannot create a wallet', async ({ page }) => {
  await login(page, '/wallets')
  const result = await page.evaluate(async () => {
    const response = await fetch('/api/wallets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'another-collectors-wallet', displayName: 'Carteira alheia', alias: 'Alheia', address: '0x1234567890', network: 'Ethereum', type: 'MetaMask', isPrimary: true }),
    })
    return { status: response.status, error: await response.json(), wallets: await (await fetch('/api/wallets')).json() }
  })
  expect(result.status).toBe(403)
  expect(result.error.code).toBe('FORBIDDEN')
  expect(result.wallets).toEqual([])
  await page.reload()
  await expect(page.locator('main#main [data-slot="skeleton"]')).toHaveCount(0, { timeout: 10_000 })
  await expect(page.getByText('Carteira alheia', { exact: true })).toHaveCount(0)
})

async function login(page: import('@playwright/test').Page, route: '/profile' | '/wallets') {
  await page.goto(`/login?returnTo=${encodeURIComponent(route)}`)
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.locator('#account-password').fill('Kurio123!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${route}$`))
}

test('profile, avatar and password changes persist and reject an incorrect current password', async ({ page }) => {
  await login(page, '/profile')
  await page.getByLabel(/Nome de exibição/).fill('Ana Prado Atualizada')
  await page.locator('.avatar-upload input[type="file"]').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pS8AAAAASUVORK5CYII=', 'base64'),
  })
  await expect(page.getByAltText('Prévia do avatar')).toHaveAttribute('src', /^data:image\/png;base64,/)
  await page.getByRole('button', { name: 'Salvar dados' }).click()
  await expect(page.getByRole('status')).toContainText('Seus dados foram salvos.')
  await page.reload()
  await expect(page.getByLabel(/Nome de exibição/)).toHaveValue('Ana Prado Atualizada')
  await expect(page.getByAltText('Prévia do avatar')).toBeVisible()

  await page.getByLabel('Senha atual').fill('senha-incorreta')
  await page.getByLabel('Nova senha', { exact: true }).fill('Kurio456!')
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('Kurio456!')
  await page.getByRole('button', { name: 'Salvar senha' }).click()
  await expect(page.getByRole('alert')).toContainText('A senha atual não confere.')

  await page.getByLabel('Senha atual').fill('Kurio123!')
  await page.getByRole('button', { name: 'Salvar senha' }).click()
  await expect(page.getByRole('status')).toContainText('Sua senha foi alterada.')
  await page.getByLabel('Navegação do perfil').getByRole('button', { name: 'Sair' }).click()
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.locator('#account-password').fill('Kurio456!')
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL((url) => url.pathname === '/profile')
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
})

test('wallet creation validates selectors and the saved wallet can be edited after refresh', async ({ page }) => {
  await login(page, '/wallets')
  const form = page.locator('#wallet-form')
  await form.getByLabel(/Nome de exibição/).fill('Minha carteira')
  await form.getByLabel(/Apelido da carteira/).fill('Principal de teste')
  await form.getByPlaceholder('colecionador.eth').fill('ana-collector')
  await form.getByPlaceholder('Endereço 0x da carteira').fill('0x1234567890')
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('status')).toContainText('Selecione uma rede e uma carteira.')

  await form.getByRole('combobox', { name: 'Rede da carteira' }).click()
  await page.getByRole('option', { name: 'Ethereum' }).click()
  await form.getByRole('combobox', { name: 'Tipo de carteira' }).click()
  await page.getByRole('option', { name: 'MetaMask' }).click()
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('heading', { name: 'Minha carteira' })).toBeVisible()
  await expect(page.getByText('Principal de teste · MetaMask')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Minha carteira' })).toBeVisible()
  await page.getByRole('button', { name: 'Editar Minha carteira' }).click()
  await expect(page.locator('#wallet-form')).toBeVisible()
  await page.locator('#wallet-form').getByLabel(/Apelido da carteira/).fill('Carteira editada')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByText('Carteira editada · MetaMask')).toBeVisible()
})
