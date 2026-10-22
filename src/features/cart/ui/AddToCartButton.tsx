import { useEffect, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { toCartItemSnapshot } from '../../../shared/model/cartItem'
import type { Product } from '../../../shared/model/product'
import { selectAddability } from '../model/addability'
import { itemAdded } from '../model/cartSlice'

// FR10: how long the confirmation label stays before the label returns.
export const ADDED_FEEDBACK_MS = 1500

type AddToCartButtonProps = { product: Product }

// FR10, FR11, UX-DR5, UX-DR4, UX-DR6: the one Add to Cart control. The page places it in the
// catalog's action slot by composition (AD-1), so catalog never imports cart.
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const dispatch = useDispatch()
  const addable = useSelector(
    selectAddability(product.id, product.stock),
    shallowEqual,
  )
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const timer = window.setTimeout(
      () => setJustAdded(false),
      ADDED_FEEDBACK_MS,
    )
    return () => window.clearTimeout(timer)
  }, [justAdded])

  // The shared disabled contract: aria-disabled, still focusable, click ignored, and the
  // visible label is the reason it cannot be added.
  const disabled = !addable.canAdd
  const label = justAdded
    ? 'Added ✓'
    : addable.canAdd
      ? 'Add to Cart'
      : addable.reason

  return (
    <button
      type="button"
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return
        dispatch(itemAdded(toCartItemSnapshot(product)))
        setJustAdded(true)
      }}
      className={`inline-flex min-h-touch-target w-full items-center justify-center rounded-md px-4 text-label ${
        disabled
          ? 'cursor-not-allowed bg-muted text-muted-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary-hover'
      }`}
    >
      {label}
    </button>
  )
}
