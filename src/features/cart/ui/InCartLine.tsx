import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router'
import type { CartState } from '../model/cartSlice'

type InCartLineProps = { productId: number }

// FR10: on Product Details, once the Product is in the Cart, say how many and link to it.
export function InCartLine({ productId }: InCartLineProps) {
  const quantity = useSelector(
    (state: { cart: CartState }) =>
      state.cart.items.find((item) => item.productId === productId)?.quantity ??
      0,
    shallowEqual,
  )
  if (quantity === 0) return null

  return (
    <p className="text-body-sm text-foreground">
      In your cart: {quantity}{' '}
      <Link
        to="/cart"
        className="inline-flex min-h-touch-target items-center text-primary underline"
      >
        View cart
      </Link>
    </p>
  )
}
