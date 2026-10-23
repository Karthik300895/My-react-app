import { useState } from 'react'
import { formatMoney } from '../../../shared/lib/formatMoney'
import type { CartItem } from '../../../shared/model/cartItem'
import { lineTotal, orderTotal } from '../../cart'

type OrderTotalPanelProps = { items: CartItem[] }

function ItemRows({ items }: OrderTotalPanelProps) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex items-center justify-between gap-4 py-2 text-body-sm"
        >
          <span className="min-w-0 truncate">
            {item.title} × {item.quantity}
          </span>
          <span className="shrink-0 tabular-nums">
            {formatMoney(lineTotal(item))}
          </span>
        </li>
      ))}
    </ul>
  )
}

// UX-DR10: a sticky panel from `lg`; a disclosure above the step below `lg`.
export function OrderTotalPanel({ items }: OrderTotalPanelProps) {
  const [open, setOpen] = useState(false)
  const total = formatMoney(orderTotal(items))

  return (
    <>
      <div className="rounded-lg border border-border bg-surface p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-price tabular-nums">Order total {total}</p>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-touch-target items-center text-label text-primary underline"
          >
            Show items
          </button>
        </div>
        {open && (
          <div className="mt-3">
            <ItemRows items={items} />
          </div>
        )}
      </div>
      <aside
        aria-label="Order total"
        className="hidden rounded-lg border border-border bg-surface p-4 lg:sticky lg:top-24 lg:block lg:self-start"
      >
        <p className="mb-3 text-price tabular-nums">Order total {total}</p>
        <ItemRows items={items} />
      </aside>
    </>
  )
}
