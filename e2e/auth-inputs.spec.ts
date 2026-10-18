import { expect, test } from '@playwright/test'

test('login and registration fields accept typed input on desktop and mobile', async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 })

  if (isMobile) {
    await page.goto('/login')
  } else {
    await page.goto('/profile')
  }

  const dialog = isMobile ? null : page.getByRole('dialog')
  const loginEmail = page.getByPlaceholder('Digite seu e-mail')
  const loginPassword = page.locator('#account-password')
  await expect(loginEmail).toBeVisible()
  await loginEmail.fill('ana@kurio.test')
  await expect(loginEmail).toHaveValue('ana@kurio.test')
  await loginPassword.fill('Kurio123!')
  await expect(loginEmail).toHaveValue('ana@kurio.test')
  await expect(loginPassword).toHaveValue('Kurio123!')

  if (isMobile) {
    await page.getByRole('link', { name: 'Crie uma conta' }).click()
    await expect(page).toHaveURL(/\/register/)
  } else {
    await dialog!.getByRole('button', { name: 'Criar conta', exact: true }).click()
  }

  const name = page.getByPlaceholder('Nome de usuário')
  const email = page.getByPlaceholder('Digite seu e-mail')
  const password = page.locator('#account-password')
  const confirmation = page.getByPlaceholder('Confirmar senha')
  await expect(name).toBeVisible()
  await name.fill('Ana Colecionadora')
  await email.fill('ana@kurio.test')
  await password.fill('Kurio123!')
  await confirmation.fill('Kurio123!')
  await expect(name).toHaveValue('Ana Colecionadora')
  await expect(email).toHaveValue('ana@kurio.test')
  await expect(password).toHaveValue('Kurio123!')
  await expect(confirmation).toHaveValue('Kurio123!')
})
