import { isAvailable } from '../../../shared/model/availability'
import {
  toCartItemSnapshot,
  type CartItem,
} from '../../../shared/model/cartItem'
import type { Money, Product } from '../../../shared/model/product'

/** FR21: what reconciliation changed, in cart order. Titles are the Shopper's own. */
export type ReconcileChange =
  | { kind: 'not-found'; productId: number; title: string }
  | { kind: 'out-of-stock'; productId: number; title: string }
  | { kind: 'capped'; productId: number; title: string; stock: number }
  | {
      kind: 'price'
      productId: number
      title: string
      oldCents: Money
      newCents: Money
    }

export type Reconciliation = {
  items: CartItem[]
  changes: ReconcileChange[]
}

/**
 * AD-14: the pure reconcile of a Cart against a complete catalog.
 * Removes Products that are absent or have no Stock, caps Quantity at Stock, and
 * refreshes each kept line's snapshot from the catalog (AD-13).
 */
export function reconcile(
  items: CartItem[],
  catalog: Product[],
): Reconciliation {
  const byId = new Map(catalog.map((product) => [product.id, product]))
  const changes: ReconcileChange[] = []
  const next: CartItem[] = []

  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product) {
      changes.push({
        kind: 'not-found',
        productId: item.productId,
        title: item.title,
      })
      continue
    }
    if (!isAvailable(product)) {
      changes.push({
        kind: 'out-of-stock',
        productId: item.productId,
        title: item.title,
      })
      continue
    }

    const quantity = Math.min(item.quantity, product.stock)
    if (quantity < item.quantity) {
      changes.push({
        kind: 'capped',
        productId: item.productId,
        title: item.title,
        stock: product.stock,
      })
    }
    if (product.priceCents !== item.unitPriceCents) {
      changes.push({
        kind: 'price',
        productId: item.productId,
        title: item.title,
        oldCents: item.unitPriceCents,
        newCents: product.priceCents,
      })
    }

    next.push({ ...toCartItemSnapshot(product), quantity })
  }

  return { items: next, changes }
}
