import { describe, expect, it } from 'vitest'
import type { ReconcileChange } from './reconcile'
import {
  noticesForReconciliation,
  reconciliationMessage,
} from './reconcileNotices'

describe('reconciliation notices', () => {
  it('UX-DR30: each change uses the exact wording, with curly quotes around the title', () => {
    expect(
      reconciliationMessage({ kind: 'not-found', productId: 1, title: 'Mug' }),
    ).toBe('“Mug” is no longer available and was removed from your cart.')
    expect(
      reconciliationMessage({
        kind: 'out-of-stock',
        productId: 1,
        title: 'Mug',
      }),
    ).toBe('“Mug” is now out of stock and was removed from your cart.')
    expect(
      reconciliationMessage({
        kind: 'capped',
        productId: 1,
        title: 'Mug',
        stock: 2,
      }),
    ).toBe('Only 2 of “Mug” left, so your quantity is now 2.')
    expect(
      reconciliationMessage({
        kind: 'price',
        productId: 1,
        title: 'Mug',
        oldCents: 1200,
        newCents: 1500,
      }),
    ).toBe('The price of “Mug” changed from $12.00 to $15.00.')
  })

  it('UX-DR30: two or fewer changes each raise a persistent warning Notice', () => {
    const changes: ReconcileChange[] = [
      { kind: 'not-found', productId: 1, title: 'A' },
      { kind: 'out-of-stock', productId: 2, title: 'B' },
    ]
    const notices = noticesForReconciliation(changes)
    expect(notices).toEqual([
      {
        message: '“A” is no longer available and was removed from your cart.',
        persistent: true,
        variant: 'warning',
      },
      {
        message: '“B” is now out of stock and was removed from your cart.',
        persistent: true,
        variant: 'warning',
      },
    ])
  })

  it('UX-DR30: more than two changes raise one summary Notice with the details listed', () => {
    const changes: ReconcileChange[] = [
      { kind: 'not-found', productId: 1, title: 'A' },
      { kind: 'capped', productId: 2, title: 'B', stock: 1 },
      { kind: 'price', productId: 3, title: 'C', oldCents: 100, newCents: 200 },
    ]
    const notices = noticesForReconciliation(changes)
    expect(notices).toHaveLength(1)
    expect(notices[0]).toMatchObject({
      message: '3 changes to your cart',
      persistent: true,
      variant: 'warning',
    })
    expect(notices[0].details).toEqual([
      '“A” is no longer available and was removed from your cart.',
      'Only 1 of “B” left, so your quantity is now 1.',
      'The price of “C” changed from $1.00 to $2.00.',
    ])
  })

  it('UX-DR30: no changes raise no Notice', () => {
    expect(noticesForReconciliation([])).toEqual([])
  })
})
