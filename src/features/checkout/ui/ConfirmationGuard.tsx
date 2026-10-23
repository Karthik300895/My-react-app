import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import type { CheckoutState } from '../model/checkoutSlice'

// AD-11, FR29: a guard component. With no Order in memory, the confirmation has nothing to show,
// so the Shopper is sent Home silently.
export function ConfirmationGuard({ children }: { children: ReactNode }) {
  const lastOrder = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.lastOrder,
  )
  if (!lastOrder) return <Navigate to="/" replace />
  return <>{children}</>
}
