import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { CartState } from '../model/cartSlice'
import { itemRemoved } from '../model/cartSlice'
import { itemCount } from '../model/totals'
import { CartLine } from './CartLine'
import { CartSummary } from './CartSummary'
import { ClearCartDialog } from './ClearCartDialog'
import { EmptyCart } from './EmptyCart'

type FocusTarget = { kind: 'remove'; productId: number } | { kind: 'heading' }

// FR12–FR17: the Cart page body. It owns focus after a Remove (FR14).
export function CartContents() {
  const dispatch = useDispatch()
  const items = useSelector((state: { cart: CartState }) => state.cart.items)
  const focusTarget = useRef<FocusTarget | null>(null)

  const remove = (productId: number) => {
    const index = items.findIndex((item) => item.productId === productId)
    // FR14: focus the next line's Remove, or the previous one if it was last.
    const next = items[index + 1] ?? items[index - 1]
    focusTarget.current = next
      ? { kind: 'remove', productId: next.productId }
      : { kind: 'heading' }
    dispatch(itemRemoved(productId))
  }

  useEffect(() => {
    const target = focusTarget.current
    if (target === null) return
    focusTarget.current = null
    if (target.kind === 'heading') {
      document.querySelector<HTMLElement>('[data-empty-heading]')?.focus()
      return
    }
    document
      .querySelector<HTMLButtonElement>(`[data-remove="${target.productId}"]`)
      ?.focus()
  }, [items])

  if (items.length === 0) return <EmptyCart />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <ClearCartDialog
          count={itemCount(items)}
          onCleared={() => {
            focusTarget.current = { kind: 'heading' }
          }}
        />
      </div>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <ul className="flex flex-col">
          {items.map((item) => (
            <CartLine key={item.productId} item={item} onRemove={remove} />
          ))}
        </ul>
        <CartSummary items={items} />
      </div>
    </div>
  )
}
