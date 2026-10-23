import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { itemAdded } from '../../cart'
import { orderPlaced } from '../../../shared/model/events'
import type { Order } from '../../../shared/model/order'
import type { ShippingValues } from './shippingSchema'

// AD-2: the checkout session. Never persisted (AD-4).
export type CheckoutStep = 'review' | 'shipping' | 'summary'

/** FR25: the Shipping Information the Shopper entered this session (AD-2). */
export type ShippingDraft = ShippingValues

/** FR28: the Order placed in this session. Kept in memory only (NFR6). */
export type PlacedOrder = Order

export type CheckoutState = {
  step: CheckoutStep
  shippingDraft: ShippingDraft | null
  lastOrder: PlacedOrder | null
  issuedOrderNumbers: string[]
  /** FR27: true while an Order is being placed, so a repeat placement does nothing. */
  placing: boolean
}

export const initialCheckoutState: CheckoutState = {
  step: 'review',
  shippingDraft: null,
  lastOrder: null,
  issuedOrderNumbers: [],
  placing: false,
}

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    /** UX-DR27: a visit to Checkout always opens at step 1, Review. */
    checkoutStarted(state) {
      state.step = 'review'
    },
    /** Moves between steps. The step lives only here, never in the URL (AD-11). */
    stepChanged(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload
    },
    /** AD-2: copies the form's values into the session, in memory only. */
    shippingDraftSaved(state, action: PayloadAction<ShippingDraft>) {
      state.shippingDraft = action.payload
    },
    /** FR27: marks the start of a placement, so the Confirm action shows its pending state. */
    orderPlacing(state) {
      state.placing = true
    },
    /** FR27: clears the pending state when a placement cannot complete. */
    orderPlacingCancelled(state) {
      state.placing = false
    },
  },
  extraReducers: (builder) => {
    // AD-15: the placed Order is recorded here; the Cart empties on the same event.
    builder.addCase(orderPlaced, (state, action) => {
      state.placing = false
      state.lastOrder = action.payload
      state.issuedOrderNumbers.push(action.payload.number)
    })
    // AD-15: a new Cart ends the confirmation, so Checkout works for the next order.
    builder.addCase(itemAdded, (state) => {
      state.lastOrder = null
    })
  },
})

export const {
  checkoutStarted,
  stepChanged,
  shippingDraftSaved,
  orderPlacing,
  orderPlacingCancelled,
} = checkoutSlice.actions
export const checkoutReducer = checkoutSlice.reducer
