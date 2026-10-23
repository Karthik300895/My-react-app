import { expect, test } from '@playwright/test'
import { PRODUCT, cartLink, seedCart } from './helpers.js'

// Simulates DummyJSON being unreachable. Browser-side MSW cannot be overridden per test,
// so the request is aborted at the network layer instead.
const API = 'https://dummyjson.com/**'

// MSW's service worker answers catalog requests before Playwright's routes see them, so the
// worker is blocked here and the requests reach the network layer, where they are routed.
test.use({ serviceWorkers: 'block' })

test('UJ-4 FR35: a listing network error can be retried, and the retry succeeds', async ({
  page,
}) => {
  // Fail the first attempts, then answer with an empty catalog, so the retry never reaches the
  // live API and the retried request succeeds.
  let failing = true
  await page.route(API, (route) => {
    if (failing) return route.abort()
    if (route.request().url().includes('/products/categories')) {
      return route.fulfill({ json: [] })
    }
    return route.fulfill({
      json: { products: [], total: 0, skip: 0, limit: 0 },
    })
  })
  await page.goto('/products')
  // Categories fail too, so scope the Retry to the Products region, not the category filter.
  const products = page.getByRole('region', { name: 'Products' })
  await expect(products.getByRole('button', { name: 'Retry' })).toBeVisible()

  failing = false
  await products.getByRole('button', { name: 'Retry' }).click()
  // A successful retry removes the error and its Retry button.
  await expect(products.getByRole('button', { name: 'Retry' })).toHaveCount(0)
})

test('UJ-4 FR22: a network error never empties the Cart', async ({ page }) => {
  await seedCart(page)
  await page.route(API, (route) => route.abort())
  await page.goto('/cart')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Your cart' }),
  ).toBeVisible()
  await expect(cartLink(page, 1)).toBeVisible()
  await expect(
    page.getByRole('button', { name: `Remove ${PRODUCT.title}` }),
  ).toBeVisible()
})

test('UJ-4 FR22: a Product no longer in the catalog is removed with a Notice', async ({
  page,
}) => {
  await seedCart(page)
  // An empty catalog: the stored Product is no longer available.
  await page.route(API, (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ products: [], total: 0, skip: 0, limit: 0 }),
    }),
  )
  await page.goto('/cart')

  await expect(
    page.getByText(/no longer available and was removed/),
  ).toBeVisible()
  await expect(cartLink(page, 0)).toBeVisible()
})
