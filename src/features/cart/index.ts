// AD-1: public API of the cart feature. Code outside features/cart imports only from this file.
export {
  cartReducer,
  itemAdded,
  itemRemoved,
  quantityDecremented,
  quantityIncremented,
  cartReconciled,
} from './model/cartSlice'
export type { CartState } from './model/cartSlice'
export { addability, selectAddability } from './model/addability'
export type { Addability } from './model/addability'
export { noticesForReconciliation } from './model/reconcileNotices'
export { itemCount, lineTotal, orderTotal, subtotal } from './model/totals'
export { loadCart, saveCart } from './model/persistence'
export { useCartReconciliation } from './model/useCartReconciliation'
export { AddToCartButton } from './ui/AddToCartButton'
export { CartContents } from './ui/CartContents'
export { CartIndicator } from './ui/CartIndicator'
export { InCartLine } from './ui/InCartLine'
