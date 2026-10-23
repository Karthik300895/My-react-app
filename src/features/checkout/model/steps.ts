import type { CheckoutStep } from './checkoutSlice'

/** UX-DR16: the order of the Checkout Progress. */
export const CHECKOUT_STEPS: CheckoutStep[] = ['review', 'shipping', 'summary']

export const STEP_LABELS: Record<CheckoutStep, string> = {
  review: 'Review',
  shipping: 'Shipping',
  summary: 'Summary',
}
