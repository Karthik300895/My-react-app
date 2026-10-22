import { expect, test } from '@playwright/test'

// Story 1.2: the store shell at the three reference widths (UX-DR2, UX-DR3).
const WIDTHS = [
  { width: 320, gutter: 16 },
  { width: 768, gutter: 24 },
  { width: 1280, gutter: 32 },
  // Wider than content-max: proves the 1280px cap and centring.
  { width: 1440, gutter: 32 },
]
const PATHS = ['/', '/products', '/nope']

for (const { width, gutter } of WIDTHS) {
  test(`shell at ${width}px: no horizontal scroll, ${gutter}px gutters, content ≤ 1280px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })

    for (const path of PATHS) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

      const layout = await page.evaluate(() => {
        const containers = ['header > div', 'main > div', 'footer > div'].map(
          (selector) => {
            const el = document.querySelector(selector)!
            const style = getComputedStyle(el)
            const rect = el.getBoundingClientRect()
            return {
              selector,
              paddingLeft: parseFloat(style.paddingLeft),
              paddingRight: parseFloat(style.paddingRight),
              width: rect.width,
              left: rect.left,
            }
          },
        )
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          containers,
        }
      })

      expect(layout.scrollWidth, path).toBeLessThanOrEqual(layout.clientWidth)
      for (const c of layout.containers) {
        const where = `${path} ${c.selector}`
        expect(c.paddingLeft, where).toBe(gutter)
        expect(c.paddingRight, where).toBe(gutter)
        expect(c.width, where).toBe(Math.min(width, 1280))
        expect(c.left, where).toBe((width - Math.min(width, 1280)) / 2)
      }
    }
  })
}

test('the skip link is the first Tab stop and moves to main', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(page.locator('main#main')).toBeFocused()
})

test('header stays at the top while scrolling on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 300 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Placeholder pages are short, so add height to make the page actually scroll.
  const scrolled = await page.evaluate(() => {
    const filler = document.createElement('div')
    filler.style.height = '2000px'
    document.querySelector('main')!.append(filler)
    window.scrollTo(0, document.body.scrollHeight)
    return window.scrollY
  })
  expect(scrolled).toBeGreaterThan(0)

  const top = await page
    .getByRole('banner')
    .evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBe(0)
})

test('a new page starts at the top even when the previous page was scrolled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 300 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const scrolled = await page.evaluate(() => {
    const filler = document.createElement('div')
    filler.style.height = '2000px'
    document.querySelector('main')!.append(filler)
    window.scrollTo(0, 1000)
    return window.scrollY
  })
  expect(scrolled).toBeGreaterThan(0)

  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Shop', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Products' }),
  ).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
