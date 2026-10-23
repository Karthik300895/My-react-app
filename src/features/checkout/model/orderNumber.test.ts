import { describe, expect, it } from 'vitest'
import { createOrderNumber } from './orderNumber'

// A fixed sequence of random values, each mapped to one suffix character.
function sequence(values: number[]) {
  let index = 0
  return () => values[index++ % values.length]
}

describe('createOrderNumber', () => {
  it('AD-15: formats SSC-YYYYMMDD-XXXXXX from the local date and 6 uppercase alphanumerics', () => {
    const now = new Date(2026, 9, 22, 9, 30) // local time, October 22 2026
    // 0 maps to A, 0.5 maps to S (index 18), and 0.99 maps to 9 (index 35).
    const number = createOrderNumber(now, sequence([0, 0.5, 0.99]), [])
    expect(number).toBe('SSC-20261022-AS9AS9')
  })

  it('FR28: never returns a number already in the issued list, drawing again instead', () => {
    const now = new Date(2026, 9, 22)
    // The first six draws are zeros ("AAAAAA"), which is already issued, so the next six are used.
    const issued = ['SSC-20261022-AAAAAA']
    const number = createOrderNumber(
      now,
      sequence([0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
      issued,
    )
    expect(number).not.toBe('SSC-20261022-AAAAAA')
    expect(number).toBe('SSC-20261022-SSSSSS')
  })

  it('FR28: gives up with an error when every draw collides', () => {
    const now = new Date(2026, 9, 22)
    expect(() =>
      createOrderNumber(now, () => 0, ['SSC-20261022-AAAAAA']),
    ).toThrow('Could not create a unique order number')
  })
})
