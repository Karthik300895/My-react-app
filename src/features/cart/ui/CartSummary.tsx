import { Link } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import type { CartItem } from '../../../shared/model/cartItem'
import { itemCount, orderTotal, subtotal } from '../model/totals'

type CartSummaryProps = { items: CartItem[] }

// UX-DR10, FR16: totals are computed from the lines, never stored. Shipping is free.
export function CartSummary({ items }: CartSummaryProps) {
  return (
    <section
      aria-label="Order summary"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 lg:sticky lg:top-24 lg:self-start"
    >
      <dl className="flex flex-col gap-2 text-body tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Items</dt>
          <dd>{itemCount(items)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Cart Subtotal</dt>
          <dd>{formatMoney(subtotal(items))}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>Free</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-2 text-price">
          <dt>Order Total</dt>
          <dd>{formatMoney(orderTotal(items))}</dd>
        </div>
      </dl>
      <Link
        to="/checkout"
        className="inline-flex min-h-touch-target w-full items-center justify-center rounded-md bg-primary text-label text-primary-foreground hover:bg-primary-hover"
      >
        Checkout
      </Link>
    </section>
  )
}
