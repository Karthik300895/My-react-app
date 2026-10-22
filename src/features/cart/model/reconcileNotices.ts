import { formatMoney } from '../../../shared/lib/formatMoney'
import type { Notice } from '../../../shared/ui/notice/noticesSlice'
import type { ReconcileChange } from './reconcile'

/** UX-DR30: more than this many changes collapse into one summary Notice. */
export const SUMMARY_THRESHOLD = 2

/** UX-DR30: the exact wording for each reconciliation change. */
export function reconciliationMessage(change: ReconcileChange): string {
  switch (change.kind) {
    case 'not-found':
      return `“${change.title}” is no longer available and was removed from your cart.`
    case 'out-of-stock':
      return `“${change.title}” is now out of stock and was removed from your cart.`
    case 'capped':
      return `Only ${change.stock} of “${change.title}” left, so your quantity is now ${change.stock}.`
    case 'price':
      return `The price of “${change.title}” changed from ${formatMoney(change.oldCents)} to ${formatMoney(change.newCents)}.`
  }
}

/** UX-DR30: the Notices one reconciliation raises. Each is a persistent warning. */
export function noticesForReconciliation(
  changes: ReconcileChange[],
): Omit<Notice, 'id'>[] {
  if (changes.length === 0) return []

  const messages = changes.map(reconciliationMessage)
  if (changes.length <= SUMMARY_THRESHOLD) {
    return messages.map((message) => ({
      message,
      persistent: true,
      variant: 'warning',
    }))
  }
  return [
    {
      message: `${changes.length} changes to your cart`,
      persistent: true,
      variant: 'warning',
      details: messages,
    },
  ]
}
