import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import type { CartState } from '../../cart'
import type { CheckoutState } from '../model/checkoutSlice'

/** Reason the Cart page reads to raise its empty-cart Notice (AD-11). */
export const EMPTY_CART_REASON = 'empty-cart'

// AD-11: a guard component, not a loader. Redirects never raise Notices during render.
export function CheckoutGuard({ children }: { children: ReactNode }) {
  const items = useSelector((state: { cart: CartState }) => state.cart.items)
  const lastOrder = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.lastOrder,
  )

  if (lastOrder) return <Navigate to="/order-confirmation" replace />
  if (items.length === 0) {
    return <Navigate to="/cart" replace state={{ reason: EMPTY_CART_REASON }} />
  }
  return <>{children}</>
}
