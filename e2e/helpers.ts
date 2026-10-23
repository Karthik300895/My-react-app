import type { Page } from '@playwright/test'

// AD-4: the stored Cart envelope. Seeded before a page loads so a spec starts with a known Cart.
export const CART_KEY = 'ssc.cart.v1'

export const PRODUCT = {
  id: 1,
  title: 'Essence Mascara Lash Princess',
}

export async function seedCart(page: Page, quantity = 1) {
  await page.addInitScript(
    ({ key, items }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ version: 1, items }))
      }
    },
    {
      key: CART_KEY,
      items: [
        {
          productId: PRODUCT.id,
          title: PRODUCT.title,
          thumbnail: 'https://cdn.dummyjson.com/1.webp',
          unitPriceCents: 999,
          stock: 99,
          quantity,
        },
      ],
    },
  )
}

// The Cart link in the header, whose name carries the item count (FR20).
export const cartLink = (page: Page, count: number) =>
  page.getByRole('link', { name: `Cart, ${count} items` })

export async function fillShipping(page: Page, postalCode = 'SW1A2AA') {
  const values: Record<string, string> = {
    'Full name': 'Ada Lovelace',
    Email: 'ada@example.com',
    Phone: '+1 555 010 9999',
    'Address line 1': '10 Downing Street',
    City: 'London',
    'State or region': 'Greater London',
    'Postal code': postalCode,
    Country: 'United Kingdom',
  }
  for (const [label, value] of Object.entries(values)) {
    await page.getByLabel(new RegExp(`^${label}`)).fill(value)
  }
}
