import type { Locator, Page } from '@playwright/test'

export function catalogResults(page: Page): Locator {
  return page.getByRole('region', { name: 'Resultados do catálogo' })
}

export function catalogCard(page: Page, nftName: string): Locator {
  return catalogResults(page).getByRole('article').filter({ hasText: nftName })
}

export function detailFeedback(page: Page, message: RegExp | string): Locator {
  return page.getByRole('status').filter({ hasText: message })
}

export function cartQuantity(page: Page, nftName: string): Locator {
  return page.getByRole('status', { name: `Quantidade de ${nftName}` })
}

export function cartQuantities(page: Page): Locator {
  return page.getByRole('status', { name: /^Quantidade de / })
}

export function cartItem(page: Page, nftName: string): Locator {
  return page.getByRole('article').filter({ hasText: nftName })
}

export function checkoutSummary(page: Page): Locator {
  return page.getByRole('complementary', { name: 'Seus NFTs' })
}

export function orderReceipt(page: Page): Locator {
  return page.getByRole('region', { name: /Compra confirmada|Pagamento em processamento|Pagamento recusado/ })
}
