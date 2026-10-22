import type { Money } from '../model/product'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// AD-3: the only place money is formatted. Integer cents avoid floating-point display errors.
export function formatMoney(cents: Money): string {
  return usd.format(cents / 100)
}
