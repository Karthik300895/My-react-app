// AD-1: public API of the checkout feature. Code outside features/checkout imports only from this file.
export {
  checkoutReducer,
  checkoutStarted,
  shippingDraftSaved,
  stepChanged,
} from './model/checkoutSlice'
export type {
  CheckoutState,
  CheckoutStep,
  PlacedOrder,
  ShippingDraft,
} from './model/checkoutSlice'
export { createOrderNumber } from './model/orderNumber'
export { placeOrder } from './model/placeOrder'
export type { PlacementState } from './model/placeOrder'
export { shippingSchema } from './model/shippingSchema'
export type { ShippingValues } from './model/shippingSchema'
export { CHECKOUT_STEPS, STEP_LABELS } from './model/steps'
export { CheckoutGuard, EMPTY_CART_REASON } from './ui/CheckoutGuard'
export { CheckoutFlow } from './ui/CheckoutFlow'
export { ConfirmationGuard } from './ui/ConfirmationGuard'
export { OrderConfirmation } from './ui/OrderConfirmation'
