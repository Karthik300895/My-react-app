import { Link } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import type { CartItem } from '../../../shared/model/cartItem'
import { lineTotal } from '../model/totals'
import { QuantityStepper } from './QuantityStepper'

type CartLineProps = {
  item: CartItem
  onRemove: (productId: number) => void
}

// UX-DR9, FR12, FR14: one Cart Line. Stacks below `sm`, a row from `sm`.
export function CartLine({ item, onRemove }: CartLineProps) {
  return (
    <li className="flex gap-4 border-b border-border py-4 sm:gap-6">
      <img
        src={item.thumbnail}
        alt=""
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="size-16 shrink-0 rounded-md object-contain sm:size-24"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h3 className="text-h3 text-foreground">
            <Link
              to={`/products/${item.productId}`}
              className="inline-flex min-h-touch-target items-center underline"
            >
              {item.title}
            </Link>
          </h3>
          <p className="text-body-sm text-muted-foreground tabular-nums">
            {formatMoney(item.unitPriceCents)} each
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <QuantityStepper
            productId={item.productId}
            title={item.title}
            quantity={item.quantity}
            stock={item.stock}
          />
          {/* FR12: the Line Total is announced with the other totals. */}
          <p
            aria-live="polite"
            className="text-price text-foreground tabular-nums"
          >
            {formatMoney(lineTotal(item))}
          </p>
        </div>
        <button
          type="button"
          data-remove={item.productId}
          aria-label={`Remove ${item.title}`}
          onClick={() => onRemove(item.productId)}
          className="inline-flex min-h-touch-target items-center self-start rounded-md px-2 text-label text-primary hover:bg-primary-subtle"
        >
          Remove
        </button>
      </div>
    </li>
  )
}
