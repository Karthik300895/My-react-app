import { expect, test, type Page } from '@playwright/test'

// Story 1.5: Product Details against the MSW catalog (AD-10: e2e always uses MSW).
const TITLE = 'Eyeshadow Palette with Mirror'

async function boxes(page: Page) {
  const gallery = page.getByRole('img', { name: `${TITLE}, image 1 of 5` })
  const heading = page.getByRole('heading', { level: 1, name: TITLE })
  await expect(heading).toBeVisible()
  const [g, h] = await Promise.all([
    gallery.boundingBox(),
    heading.boundingBox(),
  ])
  if (!g || !h) throw new Error('Gallery or heading not laid out')
  return { gallery: g, heading: h }
}

test('FR7: opened directly by URL, it shows the Product and titles the tab', async ({
  page,
}) => {
  await page.goto('/products/2')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(TITLE)
  await expect(page).toHaveTitle(`${TITLE} · Simple Shopping Cart`)
  await expect(page.getByText('Rated 3.3 out of 5')).toBeVisible()
  await expect(page.getByText('In stock', { exact: true })).toBeVisible()
})

test('UX-DR26: two columns from md, gallery on the left', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/products/2')
  const { gallery, heading } = await boxes(page)

  expect(heading.x).toBeGreaterThan(gallery.x + gallery.width - 1)
  // Side by side: the title starts in the top half of the gallery's row.
  expect(heading.y).toBeLessThan(gallery.y + gallery.height / 2)
})

test('UX-DR26: stacked below md, with no horizontal scroll at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/products/2')
  const { gallery, heading } = await boxes(page)

  expect(heading.y).toBeGreaterThan(gallery.y + gallery.height - 1)
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})

test('UX-DR15: a thumbnail activated by keyboard swaps the image and keeps focus', async ({
  page,
}) => {
  await page.goto('/products/2')
  const second = page.getByRole('button', { name: 'Show image 2 of 5' })
  await second.focus()
  await page.keyboard.press('Enter')

  await expect(second).toHaveAttribute('aria-pressed', 'true')
  await expect(second).toBeFocused()
  await expect(
    page.getByRole('img', { name: `${TITLE}, image 2 of 5` }),
  ).toBeVisible()
})

test('FR7: Back to products returns to the filtered listing with its criteria', async ({
  page,
}) => {
  await page.goto('/products?category=beauty&sort=price-desc')
  await expect(page.getByText('5 products', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: TITLE }).click()
  await expect(page).toHaveURL(/\/products\/2$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

  await page.getByRole('link', { name: 'Back to products' }).click()

  await expect(page).toHaveURL(/\/products\?category=beauty&sort=price-desc$/)
  await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue(
    'beauty',
  )
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue(
    'price-desc',
  )
})

test('FR9: a malformed id shows Product not found with a way back', async ({
  page,
}) => {
  await page.goto('/products/abc')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Product not found',
  )
  await page.getByRole('link', { name: 'Browse products' }).click()
  await expect(page).toHaveURL(/\/products$/)
})
