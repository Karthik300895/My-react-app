// AD-1: public API of the cart feature. Code outside features/cart imports only from this file.
export {
  cartReducer,
  itemAdded,
  itemRemoved,
  quantityDecremented,
  quantityIncremented,
} from './model/cartSlice'
export type { CartState } from './model/cartSlice'
export { loadCart, saveCart } from './model/persistence'
export { addability, selectAddability } from './model/addability'
export type { Addability } from './model/addability'
export { itemCount, lineTotal, orderTotal, subtotal } from './model/totals'
export { AddToCartButton } from './ui/AddToCartButton'
export { CartContents } from './ui/CartContents'
export { CartIndicator } from './ui/CartIndicator'
export { InCartLine } from './ui/InCartLine'
