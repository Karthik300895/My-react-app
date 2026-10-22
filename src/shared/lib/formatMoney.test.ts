import { describe, expect, it } from 'vitest'
import { formatMoney } from './formatMoney'

describe('formatMoney (AD-3)', () => {
  it.each([
    [999, '$9.99'],
    [0, '$0.00'],
    [5, '$0.05'],
    [189999, '$1,899.99'],
    [30, '$0.30'],
  ])('FR16: %i cents → %s', (cents, text) => {
    expect(formatMoney(cents)).toBe(text)
  })
})
