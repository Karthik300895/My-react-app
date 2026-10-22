import { createListenerMiddleware } from '@reduxjs/toolkit'
import { itemAdded } from '../features/cart'
import { noticeRequested } from '../shared/ui/notice/noticesSlice'
import type { RootState } from './store'

// AD-16: the single place Notices are raised. Reducers never dispatch.
export const noticeListenerMiddleware = createListenerMiddleware()

type AddOutcome = {
  /** Quantity in the Cart before the add. */
  before: number
  /** Quantity in the Cart after the add. */
  after: number
  stock: number
}

// Pure decision, so the notice rules are unit-tested without a store.
export function noticeForAdd({ before, after, stock }: AddOutcome) {
  if (stock <= 0) return null
  // FR13: an add that reaches Stock, or one refused because Stock is already reached,
  // says so and stays until dismissed.
  if (after === before || after === stock) {
    return {
      message: `Only ${stock} available. Your cart has the maximum.`,
      persistent: true,
    }
  }
  return { message: 'Added to cart', persistent: false }
}

noticeListenerMiddleware.startListening({
  actionCreator: itemAdded,
  effect: (action, api) => {
    const { productId, stock } = action.payload
    const quantityOf = (state: RootState) =>
      state.cart.items.find((item) => item.productId === productId)?.quantity ??
      0

    const notice = noticeForAdd({
      before: quantityOf(api.getOriginalState() as RootState),
      after: quantityOf(api.getState() as RootState),
      stock,
    })
    if (notice) api.dispatch(noticeRequested(notice))
  },
})
