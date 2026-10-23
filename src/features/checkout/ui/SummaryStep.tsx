import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import type { CartItem } from '../../../shared/model/cartItem'
import { lineTotal, orderTotal } from '../../cart'
import {
  stepChanged,
  type CheckoutState,
  type ShippingDraft,
} from '../model/checkoutSlice'
import { placeOrder, type PlacementState } from '../model/placeOrder'

type SummaryStepProps = { items: CartItem[]; shipping: ShippingDraft }

const LABEL = 'text-body-sm text-muted-foreground'

// FR26, FR27: the last look before the Order is placed. Confirming places it exactly once.
export function SummaryStep({ items, shipping }: SummaryStepProps) {
  const dispatch =
    useDispatch<ThunkDispatch<PlacementState, unknown, UnknownAction>>()
  const placing = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.placing,
  )

  return (
    <section className="flex flex-col gap-6">
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-h2 text-foreground focus:outline-none"
      >
        Summary
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

      <div className="flex flex-col gap-1">
        <h3 className="text-h3 text-foreground">Shipping to</h3>
        <address className="text-body not-italic">
          <span className="block">{shipping.fullName}</span>
          <span className="block">{shipping.addressLine1}</span>
          {shipping.addressLine2 && (
            <span className="block">{shipping.addressLine2}</span>
          )}
          <span className="block">
            {shipping.city}, {shipping.state} {shipping.postalCode}
          </span>
          <span className="block">{shipping.country}</span>
        </address>
        <p className={LABEL}>
          {shipping.email} · {shipping.phone}
        </p>
      </div>

      <p className="text-body-sm text-muted-foreground">
        This is a demo store. No payment is taken.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => dispatch(stepChanged('shipping'))}
            className="inline-flex min-h-touch-target items-center text-primary underline"
          >
            Back
          </button>
          <Link
            to="/cart"
            className="inline-flex min-h-touch-target items-center text-primary underline"
          >
            Edit cart
          </Link>
        </div>
        <button
          type="button"
          aria-disabled={placing}
          onClick={() => dispatch(placeOrder())}
          className="inline-flex min-h-touch-target items-center justify-center gap-2 rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {placing && (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
          )}
          {placing ? 'Placing order…' : 'Confirm purchase'}
        </button>
      </div>
    </section>
  )
}
