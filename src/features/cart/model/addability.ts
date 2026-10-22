import type { CartItem } from '../../../shared/model/cartItem'
import type { CartState } from './cartSlice'

export type Addability =
  { canAdd: true; reason: null } | { canAdd: false; reason: string }

export const OUT_OF_STOCK_REASON = 'Out of stock'
export const MAX_IN_CART_REASON = 'Maximum available quantity in cart'

/** FR11: the single decision for any *Add to Cart* control. */
export function addability(
  items: CartItem[],
  productId: number,
  currentStock: number,
): Addability {
  if (currentStock <= 0) return { canAdd: false, reason: OUT_OF_STOCK_REASON }
  const inCart = items.find((item) => item.productId === productId)
  if (inCart && inCart.quantity >= currentStock) {
    return { canAdd: false, reason: MAX_IN_CART_REASON }
  }
  return { canAdd: true, reason: null }
}

/** AD-13: the only source of an Add to Cart enabled state or reason. */
export const selectAddability =
  (productId: number, currentStock: number) =>
  (state: { cart: CartState }): Addability =>
    addability(state.cart.items, productId, currentStock)
