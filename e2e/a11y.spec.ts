import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { PRODUCT, seedCart } from './helpers.js'

// NFR2, UX-DR32: zero critical or serious violations on each page at each reference width.
const WIDTHS = [320, 390, 1280]
const PAGES = [
  '/',
  '/products',
  `/products/${PRODUCT.id}`,
  '/cart',
  '/checkout',
  '/nope',
]

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const path of PAGES) {
      test(`axe: ${path} has no critical or serious violations`, async ({
        page,
      }) => {
        await seedCart(page)
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

        const results = await new AxeBuilder({ page }).analyze()
        const serious = results.violations.filter((v) =>
          ['critical', 'serious'].includes(v.impact ?? ''),
        )
        expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([])
      })
    }
  })
}
