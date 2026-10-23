import { expect, test } from '@playwright/test'
import { cartLink, fillShipping, seedCart } from './helpers.js'

// UJ-3: Cart → Review → Shipping (invalid postal code, then fixed) → Summary → Confirm.
test('UJ-3 FR25–FR28: checkout places one Order, empties the Cart, and a reload goes Home', async ({
  page,
}) => {
  await seedCart(page)
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Checkout' }).click()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Review your order' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Continue to shipping' }).click()
  await fillShipping(page, 'SW1 !')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(page.getByRole('status')).toHaveText('Fix 1 field to continue.')

  await page.getByLabel(/^Postal code/).fill('SW1A2AA')
  await page.getByRole('button', { name: 'Review order' }).click()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Summary' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Confirm purchase' }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Order placed' }),
  ).toBeVisible()
  await expect(page.getByText(/^SSC-\d{8}-[A-Z0-9]{6}$/)).toBeVisible()
  await expect(cartLink(page, 0)).toBeVisible()

  // The order is held in memory only, so a reload leaves the confirmation (FR29).
  await page.reload()
  await expect(page).toHaveURL('/')
})

test('UJ-3 keyboard-only: checkout completes with Tab, Enter and Space', async ({
  page,
}) => {
  await seedCart(page)
  await page.goto('/checkout')
  await page
    .getByRole('button', { name: 'Continue to shipping' })
    .press('Enter')

  // Tab through the nine fields in order, typing into each one (Address line 2 is optional).
  const values = [
    'Ada Lovelace',
    'ada@example.com',
    '+1 555 010 9999',
    '10 Downing Street',
    '',
    'London',
    'Greater London',
    'SW1A2AA',
    'United Kingdom',
  ]
  await page.getByLabel(/^Full name/).focus()
  for (const [index, value] of values.entries()) {
    if (value) await page.keyboard.type(value)
    if (index < values.length - 1) await page.keyboard.press('Tab')
  }
  // Tab reaches Review order, and Enter submits it.
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { level: 2, name: 'Summary' }),
  ).toBeVisible()

  // Tab to Confirm purchase and press Space to place the Order.
  await page.getByRole('button', { name: 'Confirm purchase' }).focus()
  await page.keyboard.press('Space')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Order placed' }),
  ).toBeVisible()
})
