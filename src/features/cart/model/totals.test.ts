import { describe, expect, it } from 'vitest'
import type { CartItem } from '../../../shared/model/cartItem'
import { formatMoney } from '../../../shared/lib/formatMoney'
import { itemCount, lineTotal, orderTotal, subtotal } from './totals'

const item = (quantity: number, unitPriceCents: number): CartItem => ({
  productId: quantity,
  quantity,
  title: 'Item',
  thumbnail: '',
  unitPriceCents,
  stock: 10,
})

describe('cart totals', () => {
  it('FR10: a line total is unit price times quantity, in integer cents', () => {
    expect(lineTotal(item(3, 1999))).toBe(5997)
  })

  it('FR18: the Item Count sums quantities across lines', () => {
    expect(itemCount([item(2, 100), item(3, 100)])).toBe(5)
    expect(itemCount([])).toBe(0)
  })

  it('FR10: the subtotal sums every line total', () => {
    expect(subtotal([item(2, 100), item(1, 250)])).toBe(450)
    expect(subtotal([])).toBe(0)
  })

  it('FR16: the Order Total equals the Subtotal, and 3 × $19.99 displays as $59.97', () => {
    const items = [item(3, 1999)]
    expect(orderTotal(items)).toBe(subtotal(items))
    expect(formatMoney(lineTotal(items[0]))).toBe('$59.97')
  })
})
