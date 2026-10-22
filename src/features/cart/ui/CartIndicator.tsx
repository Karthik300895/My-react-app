import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import type { CartState } from '../model/cartSlice'
import { itemCount } from '../model/totals'

// FR18: the header Item Count, muted at 0 and teal from 1, popping for 200 ms on change.
export function CartIndicator() {
  const count = useSelector((state: { cart: CartState }) =>
    itemCount(state.cart.items),
  )
  // Pop only after the Cart has changed, so the header does not animate on load.
  const [initialCount] = useState(count)
  const changed = count !== initialCount

  return (
    <Link
      to="/cart"
      aria-label={`Cart, ${count} items`}
      className="inline-flex min-h-touch-target items-center px-2 text-label text-primary"
    >
      <span
        key={count}
        aria-hidden="true"
        className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-caption tabular-nums ${
          count === 0
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground'
        } ${changed ? 'animate-cart-pop motion-reduce:animate-none' : ''}`}
      >
        {count}
      </span>
    </Link>
  )
}
