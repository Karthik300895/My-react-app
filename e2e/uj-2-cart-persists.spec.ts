import { expect, test } from '@playwright/test'
import { PRODUCT, cartLink } from './helpers.js'

// UJ-2: add → reload → Cart intact → increase, remove → totals correct.
test('UJ-2 FR20, FR12: the Cart survives a reload, and quantity and removal update the Cart', async ({
  page,
}) => {
  await page.goto(`/products/${PRODUCT.id}`)
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(cartLink(page, 1)).toBeVisible()

  await page.reload()
  await expect(cartLink(page, 1)).toBeVisible()

  await cartLink(page, 1).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Your cart' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: `Increase quantity of ${PRODUCT.title}` })
    .click()
  await expect(cartLink(page, 2)).toBeVisible()

  await page.getByRole('button', { name: `Remove ${PRODUCT.title}` }).click()
  await expect(cartLink(page, 0)).toBeVisible()
})
