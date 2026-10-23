import { useDispatch } from 'react-redux'
import { Link } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import type { CartItem } from '../../../shared/model/cartItem'
import { lineTotal, orderTotal } from '../../cart'
import { stepChanged } from '../model/checkoutSlice'

type ReviewStepProps = { items: CartItem[] }

// FR24: the Review step lists what the Shopper is buying, read-only.
export function ReviewStep({ items }: ReviewStepProps) {
  const dispatch = useDispatch()

  return (
    <section className="flex flex-col gap-4">
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-h2 text-foreground focus:outline-none"
      >
        Review your order
      </h2>
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between gap-4 py-3 text-body"
          >
            <span className="min-w-0">
              <span className="block truncate">{item.title}</span>
              <span className="text-body-sm text-muted-foreground">
                Quantity {item.quantity}
              </span>
            </span>
            <span className="shrink-0 tabular-nums">
              {formatMoney(lineTotal(item))}
            </span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between text-price tabular-nums">
        <span>Order Total</span>
        <span>{formatMoney(orderTotal(items))}</span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/cart"
          className="inline-flex min-h-touch-target items-center text-primary underline"
        >
          Edit cart
        </Link>
        <button
          type="button"
          onClick={() => dispatch(stepChanged('shipping'))}
          className="inline-flex min-h-touch-target items-center justify-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
        >
          Continue to shipping
        </button>
      </div>
    </section>
  )
}
