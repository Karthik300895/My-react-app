import { describe, expect, it } from 'vitest'
import { isAvailable, stockLabel, stockLevel } from './availability'

describe('availability (AD-9)', () => {
  it.each([
    [0, false, 'out-of-stock', 'Out of stock'],
    [1, true, 'low-stock', 'Only 1 left'],
    [5, true, 'low-stock', 'Only 5 left'],
    [6, true, 'in-stock', 'In stock'],
    [120, true, 'in-stock', 'In stock'],
  ])(
    'FR8: stock %i → available %s, %s, "%s"',
    (stock, available, level, label) => {
      expect(isAvailable({ stock })).toBe(available)
      expect(stockLevel({ stock })).toBe(level)
      expect(stockLabel({ stock })).toBe(label)
    },
  )

  it('FR8: a negative stock from a bad record is treated as out of stock', () => {
    expect(isAvailable({ stock: -1 })).toBe(false)
    expect(stockLabel({ stock: -1 })).toBe('Out of stock')
  })
})
