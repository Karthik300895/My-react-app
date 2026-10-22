import { expect, test } from '@playwright/test'

// Story 1.6: Home against the MSW catalog (AD-10: e2e always uses MSW).
test('FR31: Home shows the hero, category shortcuts and eight top-rated Products', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: /find your favourite/i }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('region', { name: 'Top rated products' })
      .getByRole('listitem'),
  ).toHaveCount(8)
})

test('FR31: a category shortcut opens the filtered listing', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Category shortcuts' })
    .getByRole('link', { name: 'Beauty' })
    .click()
  await expect(page).toHaveURL(/\/products\?category=beauty$/)
  await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue(
    'beauty',
  )
})

test('FR31: "Shop all products" opens the listing', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Shop all products' }).click()
  await expect(page).toHaveURL(/\/products$/)
})
