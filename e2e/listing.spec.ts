import { expect, test } from '@playwright/test'

// Stories 1.3–1.4: the Product grid, search, filter and sort against the MSW catalog (AD-10: e2e always uses MSW).
const COLUMNS = [
  { width: 360, columns: 2 },
  { width: 640, columns: 3 },
  { width: 1024, columns: 4 },
]

for (const { width, columns } of COLUMNS) {
  test(`UX-DR25: ${columns} columns at ${width}px with no horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/products')
    await expect(page.getByText('24 products', { exact: true })).toBeVisible()

    const layout = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('main article')]
      const firstRowTop = cards[0].getBoundingClientRect().top
      return {
        cards: cards.length,
        firstRow: cards.filter(
          (card) =>
            Math.abs(card.getBoundingClientRect().top - firstRowTop) < 2,
        ).length,
        overflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      }
    })

    expect(layout.cards).toBe(20)
    expect(layout.firstRow).toBe(columns)
    expect(layout.overflow).toBe(false)
  })
}

test('AD-9, UX-DR6: an out-of-stock Product is shown with its badge and filtered image', async ({
  page,
}) => {
  await page.goto('/products')
  const card = page.getByRole('article').filter({
    has: page.getByRole('link', { name: 'Chanel Coco Noir Eau De' }),
  })

  // "Out of stock" also names the disabled button, so target the badge span only.
  await expect(
    card.locator('span').filter({ hasText: /^Out of stock$/ }),
  ).toBeVisible()
  const filter = await card
    .getByRole('img')
    .evaluate((img) => getComputedStyle(img).filter)
  expect(filter).toContain('grayscale')
})

test('UX-DR14: Next goes to page 2, focuses the count, and the URL keeps the page', async ({
  page,
}) => {
  await page.goto('/products')
  await expect(page.getByText('24 products', { exact: true })).toBeVisible()

  await page
    .getByRole('navigation', { name: 'Pagination' })
    .getByRole('button', { name: 'Next' })
    .click()

  await expect(page).toHaveURL(/\/products\?page=2$/)
  await expect(page.getByText('24 products', { exact: true })).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(4)

  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(4)
})

test('FR1: the card title link opens Product Details', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('link', { name: 'Red Lipstick' }).click()

  await expect(page).toHaveURL(/\/products\/4$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
})

test('FR5: a criteria URL reproduces the same results after a reload', async ({
  page,
}) => {
  await page.goto('/products?q=e&category=groceries&sort=price-desc')
  const titles = page.locator('main article h3')
  await expect(page.getByText(/^\d+ products?$/)).toBeVisible()
  const before = await titles.allTextContents()
  expect(before.length).toBeGreaterThan(0)

  await page.reload()
  await expect(page.getByText(/^\d+ products?$/)).toBeVisible()
  expect(await titles.allTextContents()).toEqual(before)
  await expect(
    page.getByRole('searchbox', { name: 'Search products' }),
  ).toHaveValue('e')
  await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue(
    'groceries',
  )
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue(
    'price-desc',
  )
})

test('FR2–FR4: search, Category and sort update the URL and keep focus on the control', async ({
  page,
}) => {
  await page.goto('/products')
  await expect(page.getByText('24 products', { exact: true })).toBeVisible()

  const search = page.getByRole('searchbox', { name: 'Search products' })
  await search.fill('watch')
  await expect(page).toHaveURL(/\?q=watch$/)
  await expect(page.getByText('0 products', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'No products match' }),
  ).toBeVisible()
  await expect(search).toBeFocused()

  await page.getByRole('button', { name: 'Clear search' }).click()
  await expect(page).toHaveURL(/\/products$/)
  await expect(search).toHaveValue('')
  const category = page.getByRole('combobox', { name: 'Category' })
  // selectOption doesn't focus like a real pick does; focus first, then check it is kept.
  await category.focus()
  await category.selectOption('beauty')
  await expect(page).toHaveURL(/\?category=beauty$/)
  await expect(page.getByText('5 products', { exact: true })).toBeVisible()
  await expect(category).toBeFocused()

  await page
    .getByRole('combobox', { name: 'Sort by' })
    .selectOption('price-asc')
  await expect(page).toHaveURL(/\?category=beauty&sort=price-asc$/)
  await expect(page.locator('main article h3').first()).toHaveText(
    'Red Nail Polish',
  )
})

test('UX-DR2: the controls and chips fit at 320px with no horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/products?q=lip&category=beauty&sort=price-desc')
  await expect(page.getByRole('list', { name: 'Active filters' })).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})
