import type { CartItem } from '../../../shared/model/cartItem'
import type { Money } from '../../../shared/model/product'

/** AD-3: pure totals, never stored. */
export function lineTotal(item: CartItem): Money {
  return item.unitPriceCents * item.quantity
}

export function itemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function subtotal(items: CartItem[]): Money {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

/** FR16: shipping is free, so the Order Total equals the Subtotal. */
export function orderTotal(items: CartItem[]): Money {
  return subtotal(items)
}
