import { expect, test } from '@playwright/test'
import { PRODUCT, cartLink } from './helpers.js'

// UJ-1: Listing → Product Details → Add to Cart → header count 1.
test('UJ-1 FR10: find a product from the listing and add it to the Cart', async ({
  page,
}) => {
  await page.goto('/products')
  await page.getByRole('link', { name: PRODUCT.title }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: PRODUCT.title }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(cartLink(page, 1)).toBeVisible()
})
