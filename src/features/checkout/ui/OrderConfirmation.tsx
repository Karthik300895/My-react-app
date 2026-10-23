import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import { orderTotal } from '../../cart'
import type { CheckoutState } from '../model/checkoutSlice'

// FR28, UX-DR28: what the Shopper bought and the number to quote, read from the placed Order.
export function OrderConfirmation() {
  const order = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.lastOrder,
  )
  if (!order) return null

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-display text-foreground">Order placed</h1>
      <p className="flex flex-col gap-1 text-body">
        <span className="text-body-sm text-muted-foreground">Order number</span>
        <span className="font-mono break-all">{order.number}</span>
      </p>
      <p className="flex justify-between text-price tabular-nums">
        <span>Order Total</span>
        <span>{formatMoney(orderTotal(order.items))}</span>
      </p>
      <p className="text-body text-muted-foreground">
        Thanks for shopping with us. This is a demo store, so no payment was
        taken.
      </p>
      <Link
        to="/products"
        className="inline-flex min-h-touch-target w-fit items-center justify-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
      >
        Continue shopping
      </Link>
    </section>
  )
}
