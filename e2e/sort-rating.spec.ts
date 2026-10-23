import { expect, test } from '@playwright/test'

// FR-4 (Story 4.3): the "Rating: high to low" sort, end to end. The URL is the only store of
// the criteria (AD-7), so the choice must survive a reload.
const RATED = /^Rated ([\d.]+) out of 5$/

async function listedRatings(page: import('@playwright/test').Page) {
  const cards = page.getByRole('article')
  await expect(cards.first()).toBeVisible()
  const count = Math.min(await cards.count(), 8)
  const ratings: number[] = []
  for (let i = 0; i < count; i++) {
    const text = await cards.nth(i).getByText(RATED).innerText()
    ratings.push(Number(RATED.exec(text)?.[1]))
  }
  return ratings
}

test('FR-4: choosing "Rating: high to low" lists the highest-rated Products first', async ({
  page,
}) => {
  await page.goto('/products')
  await page.getByLabel('Sort by').selectOption('rating-desc')

  await expect(page).toHaveURL(/sort=rating-desc/)
  const ratings = await listedRatings(page)
  for (let i = 1; i < ratings.length; i++) {
    expect(
      ratings[i],
      `card ${i + 1} should not out-rate card ${i}`,
    ).toBeLessThanOrEqual(ratings[i - 1])
  }
})

test('FR-4: the rating sort survives a reload, because the URL keeps it', async ({
  page,
}) => {
  await page.goto('/products?sort=rating-desc')
  const before = await listedRatings(page)
  await page.reload()
  await expect(page.getByLabel('Sort by')).toHaveValue('rating-desc')
  expect(await listedRatings(page)).toEqual(before)
})
