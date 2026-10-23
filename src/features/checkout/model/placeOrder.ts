import type { Dispatch, UnknownAction } from '@reduxjs/toolkit'
import type { CartState } from '../../cart'
import { orderPlaced } from '../../../shared/model/events'
import type { Order } from '../../../shared/model/order'
import {
  orderPlacing,
  orderPlacingCancelled,
  type CheckoutState,
} from './checkoutSlice'
import { createOrderNumber } from './orderNumber'

export type PlacementState = { cart: CartState; checkout: CheckoutState }

// Stands in for the order service call the demo does not have, so the pending state is real.
const nextTurn = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

/**
 * FR27, AD-15: places the Cart as one Order. A placement already in progress, or an empty
 * Cart, does nothing, so repeated clicks or Enter presses create exactly one Order.
 */
export const placeOrder =
  () =>
  async (dispatch: Dispatch<UnknownAction>, getState: () => PlacementState) => {
    const before = getState()
    if (before.checkout.placing || before.cart.items.length === 0) return
    dispatch(orderPlacing())

    await nextTurn()

    // Read again after the wait, so the Order records what the Cart holds now.
    const { cart, checkout } = getState()
    const shipping = checkout.shippingDraft
    if (!shipping || cart.items.length === 0) {
      dispatch(orderPlacingCancelled())
      return
    }

    const now = new Date()
    const order: Order = {
      number: createOrderNumber(now, Math.random, checkout.issuedOrderNumbers),
      createdAt: now.toISOString(),
      items: cart.items.map((item) => ({ ...item })),
      shipping: { ...shipping },
    }
    dispatch(orderPlaced(order))
  }
